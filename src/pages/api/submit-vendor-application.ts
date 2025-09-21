import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send confirmation email
    try {
      await sendVendorConfirmationEmail(submissionData.email, submissionData.contactName, submissionData.businessName);
      console.log('Confirmation email sent successfully to:', submissionData.email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the entire submission if email fails
    }

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

async function sendVendorConfirmationEmail(email: string, contactName: string, businessName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com';
  
  const emailHtml = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #333333; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <img src="https://artnightdetroit.com/images/art-night-detroit-logo.png" 
             alt="Art Night Detroit Logo" 
             style="width: 120px; height: auto; margin-bottom: 20px; border-radius: 12px;" />
        <h1 style="color: #6c63ff; font-size: 2.5rem; margin-bottom: 10px; font-family: 'Baloo 2', cursive;">
          Vendor Application Received!
        </h1>
        <p style="color: #666666; font-size: 1.3rem; line-height: 1.6; font-weight: 600;">
          Thank you for your interest in joining Art Night Detroit x Murals in the Market
        </p>
      </div>

      <div style="background: linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(108, 99, 255, 0.05)); border: 2px solid rgba(108, 99, 255, 0.3); border-radius: 16px; padding: 30px; margin-bottom: 30px;">
        <h2 style="color: #333333; font-size: 1.8rem; margin-bottom: 20px;">
          🏢 Application Confirmation
        </h2>
        <p style="color: #555555; margin-bottom: 20px; font-size: 1.1rem;">
          Hello <strong style="color: #6c63ff;">${contactName}</strong>,
        </p>
        <p style="color: #555555; margin-bottom: 20px; font-size: 1.1rem; line-height: 1.7;">
          We&apos;ve received your vendor application for <strong style="color: #6c63ff;">${businessName}</strong> 
          and are excited about the possibility of working with you at our upcoming event!
        </p>
        
        <div style="margin: 25px 0;">
          <h3 style="color: #6c63ff; font-size: 1.2rem; margin-bottom: 15px;">📋 What Happens Next?</h3>
          <ul style="color: #555555; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li><strong style="color: #6c63ff;">Review Process:</strong> Our team will review your application ASAP.</li>
            <li><strong style="color: #6c63ff;">Notification:</strong> You&apos;ll receive an email with our decision and next steps</li>
            <li><strong style="color: #6c63ff;">Vendor Fee:</strong> If accepted, the vendor fee is $50 (due upon acceptance)</li>
            <li><strong style="color: #6c63ff;">Event Details:</strong> Accepted vendors will receive detailed setup and logistics information</li>
          </ul>
        </div>
      </div>

      <div style="background: rgba(108, 99, 255, 0.08); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #333333; margin-bottom: 15px; font-size: 1.3rem;">🎨 About Art Night Detroit x Murals in the Market</h3>
        <p style="color: #555555; line-height: 1.7; margin: 0;">
          This unique collaboration brings together local artists, vendors, and community members for an evening of 
          creativity, connection, and cultural celebration. As a vendor, you&apos;ll be part of a vibrant marketplace 
          that supports local businesses and artistic expression.
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <h3 style="color: #333333; margin-bottom: 15px; font-size: 1.2rem;">
          Questions or Need to Update Your Application?
        </h3>
        <p style="color: #555555; margin-bottom: 20px;">
          Feel free to reach out if you have any questions or need to make changes to your application.
        </p>
        <a href="mailto:john@artnightdetroit.com" 
           style="display: inline-block; background: linear-gradient(135deg, #6c63ff, #5a52d5); color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 10px; font-size: 1.1rem;">
          Contact Us
        </a>
      </div>

      <div style="border-top: 1px solid #e0e0e0; padding-top: 30px; text-align: center;">
        <p style="color: #666666; font-size: 0.9rem; line-height: 1.6;">
          Thank you for supporting the local arts community and being part of Art Night Detroit!<br>
          <strong style="color: #6c63ff;">We can&apos;t wait to see what you bring to the market.</strong>
        </p>
        
        <p style="color: #888888; font-size: 0.8rem; margin-top: 20px;">
          Art Night Detroit x Murals in the Market<br>
          <a href="${baseUrl}" style="color: #6c63ff;">artnightdetroit.com</a>
        </p>
      </div>
    </div>
  `;

  return await resend.emails.send({
    from: 'Art Night Detroit <john@artnightdetroit.com>',
    to: email,
    subject: 'Vendor Application Received - Art Night Detroit x Murals in the Market 🎨',
    html: emailHtml,
  });
}
