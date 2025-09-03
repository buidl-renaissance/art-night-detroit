import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getAuthorizedClient } from '@/lib/getAuthorizedClient';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Winner {
  artistName: string;
  artistId: string;
  winnerName: string;
  winnerEmail: string;
  ticketNumber: number;
  artworkTitle?: string;
  artworkDescription?: string;
}

interface Participant {
  email: string;
  fullName: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase } = await getAuthorizedClient(req);
    const { id: raffleId } = req.query;
    const { emailType = 'all' } = req.body; // 'winners', 'participants', or 'all'

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

    // Get winners with full details
    const { data: winners, error: winnersError } = await supabase
      .from('raffle_artists')
      .select(`
        artists!inner(id, name),
        artwork!inner(title, description),
        tickets!winner_ticket_id!inner(
          ticket_number,
          profiles!participant_id!inner(full_name, email)
        )
      `)
      .eq('raffle_id', raffleId)
      .not('winner_ticket_id', 'is', null);

    if (winnersError) {
      console.error('Error fetching winners:', winnersError);
      return res.status(500).json({ error: 'Failed to fetch winners' });
    }

    // Get all participants for this raffle (for participant notifications)
    const { data: allTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('profiles!participant_id!inner(email, full_name)')
      .eq('raffle_id', raffleId);

    if (ticketsError) {
      console.error('Error fetching participants:', ticketsError);
      return res.status(500).json({ error: 'Failed to fetch participants' });
    }

    // Process winners data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedWinners: Winner[] = (winners || []).map((winner: any) => ({
      artistName: winner.artists?.name || 'Unknown Artist',
      artistId: winner.artists?.id || '',
      winnerName: winner.tickets?.profiles?.full_name || 'Unknown Winner',
      winnerEmail: winner.tickets?.profiles?.email || '',
      ticketNumber: winner.tickets?.ticket_number || 0,
      artworkTitle: winner.artwork?.title,
      artworkDescription: winner.artwork?.description
    }));

    // Get unique participants (remove duplicates by email)
    const uniqueParticipants: Participant[] = Array.from(
      new Map(
        (allTickets || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((ticket: any) => ticket.profiles)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((profile: any) => profile?.email)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((profile: any) => [profile.email, { email: profile.email, fullName: profile.full_name }])
      ).values()
    ) as Participant[];

    let emailPromises: Promise<unknown>[] = [];

    // Send winner notification emails
    if (emailType === 'winners' || emailType === 'all') {
      const winnerEmailPromises = processedWinners.map(async (winner) => {
        if (!winner.winnerEmail) return;

        return resend.emails.send({
          from: 'Art Night Detroit <noreply@artnightdetroit.com>',
          to: winner.winnerEmail,
          subject: `🎉 Congratulations! You Won the ${raffle.name} Raffle!`,
          html: generateWinnerEmail(winner, raffle)
        });
      });

      emailPromises = [...emailPromises, ...winnerEmailPromises];
    }

    // Send participant notification emails (announcing all winners)
    if (emailType === 'participants' || emailType === 'all') {
      const participantEmailPromises = uniqueParticipants.map(async (participant) => {
        if (!participant.email) return;

        // Don't send participant notification to winners (they already got winner email)
        const isWinner = processedWinners.some(winner => winner.winnerEmail === participant.email);
        if (isWinner && emailType === 'all') return;

        return resend.emails.send({
          from: 'Art Night Detroit <noreply@artnightdetroit.com>',
          to: participant.email,
          subject: `🎨 ${raffle.name} Raffle Results Are In!`,
          html: generateParticipantEmail(participant, processedWinners, raffle)
        });
      });

      emailPromises = [...emailPromises, ...participantEmailPromises];
    }

    // Send all emails
    await Promise.all(emailPromises);

    return res.status(200).json({ 
      message: 'Winner notification emails sent successfully',
      winnersSent: emailType === 'winners' || emailType === 'all' ? processedWinners.length : 0,
      participantsSent: emailType === 'participants' || emailType === 'all' ? uniqueParticipants.length : 0
    });

  } catch (error) {
    console.error('Error sending winner emails:', error);
    return res.status(500).json({ error: 'Error sending winner emails' });
  }
}

function generateWinnerEmail(winner: Winner, raffle: { id: string; name: string }): string {
  const firstName = winner.winnerName.split(' ')[0];
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
      
      <p>Hey ${firstName}!</p>
      
      <p>I have some incredible news to share with you! Your ticket #${winner.ticketNumber} was just drawn as the winner for ${winner.artistName}'s piece in our ${raffle.name} raffle.</p>
      
      <p>I'm honestly so excited for you right now. ${winner.artistName} is such a talented artist, and you're going to love what they've created.${winner.artworkTitle ? ` The piece "${winner.artworkTitle}" is absolutely stunning.` : ''}</p>
      
      ${winner.artworkDescription ? `<p><em>"${winner.artworkDescription}"</em></p>` : ''}
      
      <p><strong>What happens next?</strong></p>
      
      <p>I'll be reaching out to you personally within the next day or two to coordinate getting your artwork to you. We can arrange pickup at one of our events, or if that doesn't work, we'll figure out another way to get it in your hands.</p>
      
      <p>In the meantime, feel free to reply to this email if you have any questions or just want to share in the excitement! You can also watch the video of your winning moment - we filmed the whole drawing process for transparency.</p>
      
      <p>Thank you so much for supporting our artists and being part of the Art Night Detroit community. It's people like you who make this whole thing possible.</p>
      
      <p>Can't wait to get this amazing piece to you!</p>
      
      <p>All the best,<br>
      John & the Art Night Detroit team</p>
      
      <p>---</p>
      
      <p><strong>Links:</strong></p>
      <ul>
        <li>Watch the drawing: <a href="https://www.youtube.com/watch?v=TqG7JcIHdsQ">https://www.youtube.com/watch?v=TqG7JcIHdsQ</a></li>
        <li>See all results: <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com'}/raffles/${raffle.id}">${process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com'}/raffles/${raffle.id}</a></li>
      </ul>
      
      <p><em>Art Night Detroit • Detroit, MI<br>
      You're receiving this because you won artwork in our raffle. Reply anytime with questions!</em></p>
      
    </div>
  `;
}

function generateParticipantEmail(participant: Participant, winners: Winner[], raffle: { id: string; name: string }): string {
  const firstName = participant.fullName.split(' ')[0];
  const winnersList = winners.map(winner => 
    `<li>${winner.artistName} - Winner: ${winner.winnerName.split(' ')[0]} ${winner.winnerName.split(' ')[winner.winnerName.split(' ').length - 1]?.charAt(0)}. (Ticket #${winner.ticketNumber})</li>`
  ).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.5;">
      
      <p>Hey ${firstName}!</p>
      
      <p>The results are in for our ${raffle.name} raffle, and I wanted to share them with you personally since you were part of making it happen!</p>
      
      <p>Even though your number didn't come up this time, I can't thank you enough for participating. Seriously - it's supporters like you who make it possible for us to do these raffles and support Detroit artists.</p>
      
      <p><strong>Here are our lucky winners:</strong></p>
      <ul>
        ${winnersList}
      </ul>
      
      <p>I know it's always a little disappointing when you don't win, but I hope you know how much your participation means to our community. Every ticket helps us support more artists and create more opportunities like this.</p>
      
      <p>We've got more events and raffles coming up, so keep an eye out! If you're curious about how the drawing worked, you can watch the whole process on our YouTube video - we believe in total transparency. And as always, feel free to reply to this email if you want to chat about anything art-related or have ideas for what you'd like to see us do next.</p>
      
      <p>Thanks again for being part of this,<br>
      John & the Art Night Detroit team</p>
      
      <p>---</p>
      
      <p><strong>Links:</strong></p>
      <ul>
        <li>Watch the drawing: <a href="https://www.youtube.com/watch?v=TqG7JcIHdsQ">https://www.youtube.com/watch?v=TqG7JcIHdsQ</a></li>
        <li>See what's coming up: <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com'}/events">${process.env.NEXT_PUBLIC_BASE_URL || 'https://artnightdetroit.com'}/events</a></li>
      </ul>
      
      <p><em>Art Night Detroit • Detroit, MI<br>
      You're receiving this because you participated in our raffle. Reply anytime - we love hearing from you!</em></p>
      
    </div>
  `;
}
