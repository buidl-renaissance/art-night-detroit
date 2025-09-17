import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface TicketRegistrationData {
  name: string;
  phone: string;
  eventId: string;
  ticketNumber: string;
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
    const registrationData: TicketRegistrationData = req.body;

    // Validate required fields
    if (!registrationData.name || !registrationData.phone || !registrationData.eventId || !registrationData.ticketNumber) {
      return res.status(400).json({ error: 'Name, phone, event ID, and ticket number are required' });
    }

    // Validate phone format (should be formatted as (xxx) xxx-xxxx)
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test(registrationData.phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    // Validate ticket number format (should be numeric)
    const ticketNum = parseInt(registrationData.ticketNumber);
    if (isNaN(ticketNum) || ticketNum < 1 || ticketNum > 40) {
      return res.status(400).json({ error: 'Invalid ticket number' });
    }

    // Check if ticket is already registered for this event
    const { data: existingRegistration, error: checkError } = await supabase
      .from('ticket_registrations')
      .select('id, name')
      .eq('event_id', registrationData.eventId)
      .eq('ticket_number', ticketNum)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database check error:', checkError);
      return res.status(500).json({ 
        error: 'Failed to check ticket status', 
        details: checkError.message 
      });
    }

    if (existingRegistration) {
      return res.status(409).json({ 
        error: `Ticket #${ticketNum} for this event has already been registered by ${existingRegistration.name}` 
      });
    }

    // Register the ticket
    const insertData = {
      event_id: registrationData.eventId,
      name: registrationData.name.trim(),
      phone: registrationData.phone,
      ticket_number: ticketNum,
      registered_at: new Date().toISOString(),
    };

    console.log('Attempting to register ticket:', JSON.stringify(insertData, null, 2));

    const { data: registration, error: dbError } = await supabase
      .from('ticket_registrations')
      .insert([insertData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error details:', JSON.stringify(dbError, null, 2));
      console.error('Database error message:', dbError.message);
      console.error('Database error code:', dbError.code);
      return res.status(500).json({ 
        error: 'Failed to register ticket', 
        details: dbError.message || 'Unknown database error'
      });
    }

    // TODO: Send confirmation SMS here
    // await sendConfirmationSMS(registrationData.phone, registrationData.name, ticketNum);

    res.status(200).json({ 
      success: true, 
      message: 'Ticket registered successfully',
      registrationId: registration.id,
      ticketNumber: ticketNum
    });

  } catch (error) {
    console.error('Error in ticket registration API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
