import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

export async function issueTickets(
  supabase: SupabaseClient,
  user: User,
  raffleId: string | null,
  artistId: string | null,
  numberOfTickets: number
) {
  // Get the current highest ticket number for this raffle
  const { data: lastTicket, error: lastTicketError } = await supabase
    .from('tickets')
    .select('ticket_number')
    .eq('raffle_id', raffleId)
    .order('ticket_number', { ascending: false })
    .limit(1)
    .single();

  if (lastTicketError && lastTicketError.code !== 'PGRST116') {
    throw lastTicketError;
  }

  const startNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

  // Create the tickets
  const tickets = Array.from({ length: numberOfTickets }, (_, i) => ({
    raffle_id: raffleId,
    artist_id: artistId,
    user_id: user.id,
    ticket_number: startNumber + i,
    status: 'active',
    created_at: new Date().toISOString(),
  }));

  const { data: newTickets, error: insertError } = await supabase
    .from('tickets')
    .insert(tickets)
    .select('id, ticket_number, created_at');

  if (insertError) throw insertError;

  return newTickets;
} 