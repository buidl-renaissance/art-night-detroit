import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
    });

    const [, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });

    // Check if file was uploaded
    if (!files.file || !Array.isArray(files.file) || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = files.file[0];
    
    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: `Unsupported file type: ${file.mimetype}. Please upload images, videos, or documents only.` 
      });
    }

    // Generate unique filename with safe characters only
    const timestamp = Date.now();
    const fileExtension = file.originalFilename?.split('.').pop()?.toLowerCase() || 'bin';
    
    // Map common extensions to safe versions
    const extensionMap: { [key: string]: string } = {
      'jpg': 'jpg',
      'jpeg': 'jpg', 
      'png': 'png',
      'gif': 'gif',
      'webp': 'webp',
      'mp4': 'mp4',
      'mov': 'mov',
      'webm': 'webm',
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx'
    };
    
    const safeExtension = extensionMap[fileExtension] || 'bin';
    const randomString = Math.random().toString(36).substring(2, 11);
    
    // Use only alphanumeric characters, hyphens, and underscores
    const fileName = `portfolio_${timestamp}_${randomString}.${safeExtension}`;
    const filePath = `${fileName}`; // Try without subdirectory first

    // Read file buffer
    const fileBuffer = await fs.readFile(file.filepath);
    
    // Try to upload to Supabase Storage
    console.log('Attempting to upload file:', { fileName, filePath, contentType: file.mimetype });
    
    // Try artist-portfolios bucket first, fallback to flyers bucket if it doesn't exist
    let uploadError = null;
    let bucketUsed = 'artist-portfolios';
    
    const uploadResult = await supabase.storage
      .from('artist-portfolios')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false
      });
    
    uploadError = uploadResult.error;
    
    // If artist-portfolios bucket doesn't exist, try flyers bucket as fallback
    if (uploadError && (uploadError.message.includes('not found') || uploadError.message.includes('bucket'))) {
      console.log('artist-portfolios bucket not found, trying flyers bucket as fallback');
      bucketUsed = 'flyers';
      
      const fallbackResult = await supabase.storage
        .from('flyers')
        .upload(`artist-portfolios/${filePath}`, fileBuffer, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: false
        });
        
      uploadError = fallbackResult.error;
    }

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      console.error('File path attempted:', filePath);
      console.error('File name attempted:', fileName);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload file';
      if (uploadError.message.includes('file size')) {
        errorMessage = 'File is too large. Maximum size is 50MB.';
      } else if (uploadError.message.includes('storage')) {
        errorMessage = 'Storage service is temporarily unavailable. Please try again.';
      } else if (uploadError.message.includes('permission')) {
        errorMessage = 'Permission denied. Please try again.';
      } else if (uploadError.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (uploadError.message.includes('pattern') || uploadError.message.includes('invalid')) {
        errorMessage = 'Invalid file name or format. Please try renaming your file.';
      }
      
      return res.status(500).json({ 
        error: errorMessage,
        details: uploadError.message,
        debugInfo: {
          fileName,
          filePath,
          originalFilename: file.originalFilename
        }
      });
    }

    // Get public URL from the bucket that was actually used
    const { data: urlData } = supabase.storage
      .from(bucketUsed)
      .getPublicUrl(bucketUsed === 'flyers' ? `artist-portfolios/${filePath}` : filePath);

    console.log('File uploaded successfully:', { 
      fileName, 
      filePath, 
      bucketUsed, 
      url: urlData.publicUrl 
    });

    return res.status(200).json({ 
      url: urlData.publicUrl,
      message: 'File uploaded successfully',
      debugInfo: {
        fileName,
        bucketUsed,
        originalFilename: file.originalFilename
      }
    });

  } catch (error) {
    console.error('Error in upload-portfolio-file:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
