import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const { submissionId } = req.body;

  if (!submissionId) {
    return res.status(400).json({ error: 'Submission ID is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    // Get the submission from database
    const { data: submission, error: fetchError } = await supabase
      .from('flyer_submissions')
      .select('*')
      .eq('id', submissionId)
      .eq('status', 'pending_extraction')
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found or already processed' });
    }

    if (!submission.flyer_image_url) {
      return res.status(400).json({ error: 'No flyer image found for extraction' });
    }

    // Download the image from Supabase storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('flyers')
      .download(submission.flyer_image_url.split('/').pop()!);

    if (downloadError || !imageData) {
      throw new Error('Failed to download flyer image');
    }

    // Convert to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = 'image/jpeg'; // Assume JPEG for simplicity

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
      temperature: 0.1,
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

    // Prepare update data with extracted information
    const updateData: Record<string, unknown> = {
      status: 'pending_review',
      updated_at: new Date().toISOString(),
    };

    if (extractedInfo.eventName) {
      updateData.event_name = extractedInfo.eventName.trim();
    }

    if (extractedInfo.location) {
      updateData.event_location = extractedInfo.location.trim();
    }

    if (extractedInfo.description) {
      updateData.event_description = extractedInfo.description.trim();
    }

    if (extractedInfo.ticketPrice) {
      updateData.ticket_price = extractedInfo.ticketPrice.trim();
    }

    if (extractedInfo.website) {
      const urlRegex = /^https?:\/\/.+/;
      if (urlRegex.test(extractedInfo.website)) {
        updateData.event_website = extractedInfo.website.trim();
      }
    }

    if (extractedInfo.category) {
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
        updateData.event_category = extractedInfo.category;
      }
    }

    if (extractedInfo.instagram) {
      let instagram = extractedInfo.instagram.trim();
      if (!instagram.startsWith('@')) {
        instagram = '@' + instagram;
      }
      updateData.instagram_handle = instagram;
    }

    // Handle date and time extraction with smart year correction
    let finalEventDate = extractedInfo.eventDate;
    
    if (extractedInfo.eventDate) {
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
            finalEventDate = correctedDate;
          }
        } else if (extractedDate > oneYearFromNow) {
          // If more than a year in the future, assume it's meant for sooner
          const [, month, day] = extractedInfo.eventDate.split('-');
          const currentYear = currentDate.getFullYear();
          const correctedDate = `${currentYear}-${month}-${day}`;
          const correctedDateTime = new Date(correctedDate);
          
          if (correctedDateTime >= currentDate) {
            finalEventDate = correctedDate;
          } else {
            finalEventDate = `${currentYear + 1}-${month}-${day}`;
          }
        }
        
        // Now handle time combination
        if (extractedInfo.eventTime) {
          const timeRegex = /^\d{2}:\d{2}$/;
          if (timeRegex.test(extractedInfo.eventTime)) {
            const eventDateTime = new Date(`${finalEventDate}T${extractedInfo.eventTime}`).toISOString();
            updateData.event_date = eventDateTime;
          }
        } else {
          // Use noon as default time if no time is provided
          const eventDateTime = new Date(`${finalEventDate}T12:00`).toISOString();
          updateData.event_date = eventDateTime;
        }
      }
    }

    // Update the submission in the database
    const { error: updateError } = await supabase
      .from('flyer_submissions')
      .update(updateData)
      .eq('id', submissionId);

    if (updateError) {
      throw updateError;
    }

    // Log successful extraction
    console.log('Successfully processed AI extraction for submission:', submissionId, extractedInfo);

    res.status(200).json({
      success: true,
      extractedInfo,
      message: 'Flyer information extracted and submission updated successfully'
    });

  } catch (error) {
    console.error('Flyer extraction processing error:', error);
    
    // Mark submission as failed extraction but still pending review
    await supabase
      .from('flyer_submissions')
      .update({
        status: 'pending_review',
        admin_notes: 'AI extraction failed - manual review required',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    res.status(500).json({ 
      error: 'Failed to process flyer extraction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
