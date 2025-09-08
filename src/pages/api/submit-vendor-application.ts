import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface VendorSubmissionData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  websiteLink?: string;
  instagramLink?: string;
  businessType: string;
  businessDescription: string;
  productsServices: string;
  setupRequirements?: string;
  insuranceCoverage: boolean;
  previousEventExperience?: string;
  willingToDonatRaffleItem: boolean;
  raffleItemDescription?: string;
  additionalNotes?: string;
  businessLicenseFileUrls: string[];
  productImageUrls: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Parse JSON body
    const submissionData: VendorSubmissionData = req.body;

    // Validate required fields
    if (!submissionData.businessName || !submissionData.contactName || !submissionData.email || 
        !submissionData.phone || !submissionData.businessType || !submissionData.businessDescription ||
        !submissionData.productsServices) {
      return res.status(400).json({ 
        error: 'Business name, contact name, email, phone, business type, business description, and products/services are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submissionData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone format (should be formatted as (xxx) xxx-xxxx)
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test(submissionData.phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    // Prepare data for database insertion
    const insertData = {
      business_name: submissionData.businessName,
      contact_name: submissionData.contactName,
      email: submissionData.email,
      phone: submissionData.phone,
      website_link: submissionData.websiteLink || null,
      instagram_link: submissionData.instagramLink || null,
      business_type: submissionData.businessType,
      business_description: submissionData.businessDescription,
      products_services: submissionData.productsServices,
      setup_requirements: submissionData.setupRequirements || null,
      insurance_coverage: submissionData.insuranceCoverage,
      previous_event_experience: submissionData.previousEventExperience || null,
      willing_to_donate_raffle_item: submissionData.willingToDonatRaffleItem,
      raffle_item_description: submissionData.raffleItemDescription || null,
      additional_notes: submissionData.additionalNotes || null,
      business_license_files: submissionData.businessLicenseFileUrls || [],
      product_images: submissionData.productImageUrls || [],
      status: 'pending_review',
      created_at: new Date().toISOString(),
    };

    console.log('Attempting to insert vendor submission:', JSON.stringify(insertData, null, 2));

    // Save to database
    const { data: submission, error: dbError } = await supabase
      .from('vendor_submissions')
      .insert([insertData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error details:', JSON.stringify(dbError, null, 2));
      console.error('Database error message:', dbError.message);
      console.error('Database error code:', dbError.code);
      return res.status(500).json({ 
        error: 'Failed to save vendor submission', 
        details: dbError.message || 'Unknown database error'
      });
    }

    // Send confirmation email (optional - could be implemented later)
    // await sendConfirmationEmail(submissionData.email, submissionData.contactName);

    res.status(200).json({ 
      success: true, 
      message: 'Vendor application submitted successfully',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Error in submit-vendor-application:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
