import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';

import os from 'os';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ExtractedEventInfo {
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  ticketPrice?: string;
  website?: string;
  category?: string;
  organizer?: string;
  contact?: string;
  instagram?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    // Use OS temp directory
    const tmpDir = os.tmpdir();
    
    // Parse the form data with better error handling
    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filename: (name, ext) => {
        // Generate a unique filename
        return `flyer-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      }
    });

    const [, files] = await form.parse(req);

    // Get the uploaded file
    const flyerFile = Array.isArray(files.flyerImage) ? files.flyerImage[0] : files.flyerImage;
    
    if (!flyerFile || !flyerFile.filepath) {
      return res.status(400).json({ error: 'No flyer image provided' });
    }

    // Check if file exists and read it
    let fileBuffer: Buffer;
    try {
      await fs.access(flyerFile.filepath); // Check if file exists
      fileBuffer = await fs.readFile(flyerFile.filepath);
    } catch (fileError) {
      console.error('File access error:', fileError);
      return res.status(400).json({ error: 'Failed to access uploaded file' });
    }
    
    const base64Image = fileBuffer.toString('base64');
    const mimeType = flyerFile.mimetype || 'image/jpeg';

    // Clean up temporary file
    await fs.unlink(flyerFile.filepath).catch(console.error);

    // Call OpenAI Vision API to analyze the flyer
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this event flyer and extract the following information. Return the response as a JSON object with these exact field names:

{
  "eventName": "Name of the event",
  "eventDate": "Date in YYYY-MM-DD format",
  "eventTime": "Start time in HH:MM format (24-hour)",
  "endTime": "End time in HH:MM format (24-hour) if available",
  "location": "Full address or venue name",
  "description": "Brief description of the event",
  "ticketPrice": "Price information (e.g., 'Free', '$10', '$15-25')",
  "website": "Website URL if visible",
  "category": "Event category (choose from: art-exhibition, music-performance, dance-performance, theater, workshop, community-event, fundraiser, other)",
  "organizer": "Organizer name if visible",
  "contact": "Contact information (email/phone) if visible",
  "instagram": "Instagram handle if visible (include @)"
}

Instructions:
- Only include fields where you can confidently extract the information
- For dates: Assume events are within the next few months from today's date unless explicitly stated otherwise
- If only month/day is shown, determine the appropriate year based on whether the date would be in the near future
- If a date would be in the past with the current year, assume it's for the next occurrence of that date
- For times, convert to 24-hour format (e.g., 9 PM = 21:00, 12 AM = 00:00)
- For category, pick the most appropriate option based on the event type
- If information is unclear or not visible, omit that field from the response
- Return ONLY valid JSON in your response - no markdown code blocks, no additional text, no explanations
- Do NOT wrap the JSON in backticks or markdown formatting

Analyze this flyer:`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent extraction
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response - handle markdown code blocks if present
    let extractedInfo: ExtractedEventInfo;
    try {
      // Clean the content - remove markdown code blocks if present
      let cleanContent = content.trim();
      
      // Remove ```json and ``` markers if they exist
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      extractedInfo = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse extracted information');
    }

    // Validate and clean the extracted data
    const cleanedInfo: ExtractedEventInfo = {};

    if (extractedInfo.eventName && typeof extractedInfo.eventName === 'string') {
      cleanedInfo.eventName = extractedInfo.eventName.trim();
    }

    if (extractedInfo.eventDate && typeof extractedInfo.eventDate === 'string') {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(extractedInfo.eventDate)) {
        const extractedDate = new Date(extractedInfo.eventDate);
        const currentDate = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);
        
        // Smart date correction: assume events are within the next few months
        if (extractedDate < currentDate) {
          // If the date is in the past, find the next occurrence
          const [, month, day] = extractedInfo.eventDate.split('-');
          const currentYear = currentDate.getFullYear();
          
          // Try current year first, then next year
          let correctedDate = `${currentYear}-${month}-${day}`;
          let correctedDateTime = new Date(correctedDate);
          
          // If still in the past, use next year
          if (correctedDateTime < currentDate) {
            correctedDate = `${currentYear + 1}-${month}-${day}`;
            correctedDateTime = new Date(correctedDate);
          }
          
          // Only use corrected date if it's within 6 months from now
          const sixMonthsFromNow = new Date();
          sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);
          
          if (correctedDateTime <= sixMonthsFromNow) {
            cleanedInfo.eventDate = correctedDate;
          } else {
            cleanedInfo.eventDate = extractedInfo.eventDate; // Keep original if too far out
          }
        } else if (extractedDate > oneYearFromNow) {
          // If more than a year in the future, assume it's meant for sooner
          const [, month, day] = extractedInfo.eventDate.split('-');
          const currentYear = currentDate.getFullYear();
          const correctedDate = `${currentYear}-${month}-${day}`;
          const correctedDateTime = new Date(correctedDate);
          
          if (correctedDateTime >= currentDate) {
            cleanedInfo.eventDate = correctedDate;
          } else {
            cleanedInfo.eventDate = `${currentYear + 1}-${month}-${day}`;
          }
        } else {
          cleanedInfo.eventDate = extractedInfo.eventDate;
        }
      }
    }

    if (extractedInfo.eventTime && typeof extractedInfo.eventTime === 'string') {
      // Validate time format
      const timeRegex = /^\d{2}:\d{2}$/;
      if (timeRegex.test(extractedInfo.eventTime)) {
        cleanedInfo.eventTime = extractedInfo.eventTime;
      }
    }

    if (extractedInfo.endTime && typeof extractedInfo.endTime === 'string') {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (timeRegex.test(extractedInfo.endTime)) {
        cleanedInfo.endTime = extractedInfo.endTime;
      }
    }

    if (extractedInfo.location && typeof extractedInfo.location === 'string') {
      cleanedInfo.location = extractedInfo.location.trim();
    }

    if (extractedInfo.description && typeof extractedInfo.description === 'string') {
      cleanedInfo.description = extractedInfo.description.trim();
    }

    if (extractedInfo.ticketPrice && typeof extractedInfo.ticketPrice === 'string') {
      cleanedInfo.ticketPrice = extractedInfo.ticketPrice.trim();
    }

    if (extractedInfo.website && typeof extractedInfo.website === 'string') {
      const urlRegex = /^https?:\/\/.+/;
      if (urlRegex.test(extractedInfo.website)) {
        cleanedInfo.website = extractedInfo.website.trim();
      }
    }

    if (extractedInfo.category && typeof extractedInfo.category === 'string') {
      const validCategories = [
        'art-exhibition',
        'music-performance',
        'dance-performance',
        'theater',
        'workshop',
        'community-event',
        'fundraiser',
        'other'
      ];
      if (validCategories.includes(extractedInfo.category)) {
        cleanedInfo.category = extractedInfo.category;
      }
    }

    if (extractedInfo.organizer && typeof extractedInfo.organizer === 'string') {
      cleanedInfo.organizer = extractedInfo.organizer.trim();
    }

    if (extractedInfo.contact && typeof extractedInfo.contact === 'string') {
      cleanedInfo.contact = extractedInfo.contact.trim();
    }

    if (extractedInfo.instagram && typeof extractedInfo.instagram === 'string') {
      let instagram = extractedInfo.instagram.trim();
      if (!instagram.startsWith('@')) {
        instagram = '@' + instagram;
      }
      cleanedInfo.instagram = instagram;
    }

    // Log successful extraction for debugging
    console.log('Successfully extracted flyer information:', cleanedInfo);

    res.status(200).json({
      success: true,
      extractedInfo: cleanedInfo,
      message: 'Flyer information extracted successfully'
    });

  } catch (error) {
    console.error('Flyer extraction error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'OpenAI service configuration error' });
      }
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ error: 'Service temporarily unavailable. Please try again in a moment.' });
      }
    }

    res.status(500).json({ 
      error: 'Failed to extract information from flyer. Please fill in the details manually.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
