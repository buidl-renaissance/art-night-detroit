import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FlyerSubmissionData {
  eventName: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  eventWebsite?: string;
  instagramHandle?: string;
  ticketPrice?: string;
  eventCategory: string;
  additionalNotes?: string;
  agreeToTerms: string;
  flyerImageUrl?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use OS temp directory
    const tmpDir = os.tmpdir();
    
    // Parse the form data with better error handling
    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filename: (name, ext, part) => {
        // Generate a unique filename
        return `flyer-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      }
    });

    const [fields, files] = await form.parse(req);

    // Extract form fields
    const getFieldValue = (field: any): string => {
      return Array.isArray(field) ? field[0] : field || '';
    };

    const isQuickSubmission = getFieldValue(fields.isQuickSubmission) === 'true';

    let submissionData: FlyerSubmissionData;

    if (isQuickSubmission) {
      // For quick submissions, we'll extract event details from the flyer using AI
      // and use placeholder values for required fields
      submissionData = {
        eventName: 'Pending AI Extraction',
        organizerName: getFieldValue(fields.organizerName),
        organizerEmail: getFieldValue(fields.organizerEmail),
        organizerPhone: getFieldValue(fields.organizerPhone),
        eventDate: new Date().toISOString(), // Placeholder, will be updated after AI extraction
        eventTime: '00:00',
        eventLocation: 'TBD',
        eventDescription: 'Event details will be extracted from flyer',
        eventWebsite: getFieldValue(fields.eventWebsite),
        instagramHandle: getFieldValue(fields.instagramHandle),
        ticketPrice: getFieldValue(fields.ticketPrice),
        eventCategory: 'other',
        additionalNotes: getFieldValue(fields.additionalNotes),
        agreeToTerms: getFieldValue(fields.agreeToTerms),
      };
    } else {
      // Regular submission with all fields provided
      submissionData = {
        eventName: getFieldValue(fields.eventName),
        organizerName: getFieldValue(fields.organizerName),
        organizerEmail: getFieldValue(fields.organizerEmail),
        organizerPhone: getFieldValue(fields.organizerPhone),
        eventDate: getFieldValue(fields.eventDate),
        eventTime: getFieldValue(fields.eventTime),
        eventLocation: getFieldValue(fields.eventLocation),
        eventDescription: getFieldValue(fields.eventDescription),
        eventWebsite: getFieldValue(fields.eventWebsite),
        instagramHandle: getFieldValue(fields.instagramHandle),
        ticketPrice: getFieldValue(fields.ticketPrice),
        eventCategory: getFieldValue(fields.eventCategory),
        additionalNotes: getFieldValue(fields.additionalNotes),
        agreeToTerms: getFieldValue(fields.agreeToTerms),
      };
    }

    // Validate required fields (different validation for quick submissions)
    if (isQuickSubmission) {
      const quickRequiredFields = ['organizerName', 'organizerEmail'];
      for (const field of quickRequiredFields) {
        if (!submissionData[field as keyof FlyerSubmissionData]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }
    } else {
      const requiredFields = [
        'eventName',
        'organizerName', 
        'organizerEmail',
        'eventDate',
        'eventTime',
        'eventLocation',
        'eventDescription',
        'eventCategory'
      ];

      for (const field of requiredFields) {
        if (!submissionData[field as keyof FlyerSubmissionData]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submissionData.organizerEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // Validate terms agreement
    if (submissionData.agreeToTerms !== 'true') {
      return res.status(400).json({ error: 'You must agree to the terms to submit' });
    }

    // Handle file upload if present
    let flyerImageUrl = null;
    if (files.flyerImage) {
      const file = Array.isArray(files.flyerImage) ? files.flyerImage[0] : files.flyerImage;
      
      if (file && file.filepath) {
        try {
          // Check if file exists and read it
          await fs.access(file.filepath); // Check if file exists
          const fileBuffer = await fs.readFile(file.filepath);
          
          // Generate unique filename
          const fileExtension = path.extname(file.originalFilename || '').toLowerCase();
          const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          
          if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ error: 'Invalid file type. Please upload an image file.' });
          }
          
          const fileName = `flyer-submission-${uuidv4()}${fileExtension}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('flyers')
            .upload(fileName, fileBuffer, {
              contentType: file.mimetype || 'image/jpeg',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload image' });
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('flyers')
            .getPublicUrl(fileName);
          
          flyerImageUrl = urlData.publicUrl;
          
          // Clean up temporary file
          await fs.unlink(file.filepath).catch(console.error);
          
        } catch (uploadError) {
          console.error('File processing error:', uploadError);
          return res.status(500).json({ error: 'Failed to process image upload' });
        }
      }
    }

    // Combine date and time for database storage
    let eventDateTime: string;
    if (isQuickSubmission) {
      // For quick submissions, use current date as placeholder
      eventDateTime = new Date().toISOString();
    } else {
      eventDateTime = new Date(`${submissionData.eventDate}T${submissionData.eventTime}`).toISOString();
    }

    // Prepare data for database insertion
    const insertData = {
      event_name: submissionData.eventName,
      organizer_name: submissionData.organizerName,
      organizer_email: submissionData.organizerEmail,
      organizer_phone: submissionData.organizerPhone || null,
      event_date: eventDateTime,
      event_location: submissionData.eventLocation,
      event_description: submissionData.eventDescription,
      event_website: submissionData.eventWebsite || null,
      instagram_handle: submissionData.instagramHandle || null,
      ticket_price: submissionData.ticketPrice || null,
      event_category: submissionData.eventCategory,
      additional_notes: submissionData.additionalNotes || null,
      flyer_image_url: flyerImageUrl,
      status: isQuickSubmission ? 'pending_extraction' : 'pending_review',
      created_at: new Date().toISOString(),
    };

    console.log('Attempting to insert data:', JSON.stringify(insertData, null, 2));

    // Save to database
    const { data: submission, error: dbError } = await supabase
      .from('flyer_submissions')
      .insert([insertData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error details:', JSON.stringify(dbError, null, 2));
      console.error('Database error message:', dbError.message);
      console.error('Database error code:', dbError.code);
      return res.status(500).json({ 
        error: 'Failed to save submission', 
        details: dbError.message || 'Unknown database error'
      });
    }

    // Send confirmation email (optional - could be implemented later)
    // await sendConfirmationEmail(submissionData.organizerEmail, submissionData.eventName);

    res.status(200).json({ 
      success: true, 
      message: 'Flyer submission received successfully',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
