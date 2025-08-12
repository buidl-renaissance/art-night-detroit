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
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
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
    if (!file.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Upload to Supabase Storage
    const fileName = `artist-images/${Date.now()}-${file.originalFilename}`;
    const fileBuffer = await fs.readFile(file.filepath);
    
    const { error: uploadError } = await supabase.storage
      .from('artists')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || 'image/jpeg',
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('artists')
      .getPublicUrl(fileName);

    return res.status(200).json({ 
      url: urlData.publicUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Error in upload-artist-image:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
