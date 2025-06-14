import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getAuthorizedClient } from '../../../lib/getAuthorizedClient';

interface Ticket {
  users?: {
    email: string;
  };
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase } = await getAuthorizedClient(req);
    const { raffleId } = req.body;

    if (!raffleId) {
      return res.status(400).json({ error: 'Raffle ID is required' });
    }

    // Get raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffle) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    // Get all ticket holders for this raffle
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*, users(email)')
      .eq('raffle_id', raffleId);

    if (ticketsError) {
      return res.status(500).json({ error: 'Error fetching tickets' });
    }

    // Send emails to all ticket holders
    const emailPromises = (tickets as Ticket[]).map(async (ticket) => {
      if (!ticket.users?.email) return;

      await resend.emails.send({
        from: 'Art Night Detroit <noreply@artnightdetroit.com>',
        to: ticket.users.email,
        subject: `Vote for Your Favorite Artwork in ${raffle.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Time to Vote for Your Favorite Artwork!</h1>
            <p>Hello,</p>
            <p>Thank you for participating in ${raffle.title}. The voting period is now open!</p>
            <p>As a ticket holder, you can now cast your vote for your favorite artwork.</p>
            <p>Click the button below to access the voting page:</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/raffles/${raffleId}/vote" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Vote Now
            </a>
            <p>Voting will close on ${new Date(raffle.voting_end_date).toLocaleDateString()}.</p>
            <p>Best regards,<br>The Art Night Detroit Team</p>
          </div>
        `,
      });
    });

    await Promise.all(emailPromises);

    return res.status(200).json({ message: 'Voting emails sent successfully' });
  } catch (error) {
    console.error('Error sending voting emails:', error);
    return res.status(500).json({ error: 'Error sending voting emails' });
  }
} 