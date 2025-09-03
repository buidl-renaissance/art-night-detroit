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

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.originalFilename?.split('.').pop() || 'bin';
    const fileName = `portfolio-${timestamp}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const filePath = `artist-submissions/${fileName}`;

    // Read file buffer
    const fileBuffer = await fs.readFile(file.filepath);
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('artist-portfolios')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('artist-portfolios')
      .getPublicUrl(filePath);

    return res.status(200).json({ 
      url: urlData.publicUrl,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Error in upload-portfolio-file:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
