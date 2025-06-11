import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UnusedTicket {
  id: string;
  // Add other ticket properties as needed
}

interface UseRaffleTicketManagerProps {
  raffleId: string | string[] | undefined;
  unusedTickets: UnusedTicket[];
}

interface UseRaffleTicketManagerReturn {
  error: string | null;
  submitTickets: (artistQuantities: { [artistId: string]: number }) => Promise<void>;
}

export function useRaffleTicketManager({
  raffleId,
  unusedTickets,
}: UseRaffleTicketManagerProps): UseRaffleTicketManagerReturn {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const submitTickets = useCallback(async (artistQuantities: { [artistId: string]: number }) => {
    const totalTicketsRequested = Object.values(artistQuantities).reduce((sum, count) => sum + count, 0);
    if (totalTicketsRequested === 0) return;

    setError(null);

    try {
      // Group tickets by artist
      const artistTickets: { [artistId: string]: string[] } = {};
      let currentTicketIndex = 0;

      Object.entries(artistQuantities).forEach(([artistId, count]) => {
        if (count > 0) {
          artistTickets[artistId] = unusedTickets
            .slice(currentTicketIndex, currentTicketIndex + count)
            .map(ticket => ticket.id);
          currentTicketIndex += count;
        }
      });

      // Submit tickets for each artist
      for (const [artistId, ticketIds] of Object.entries(artistTickets)) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`/api/raffles/${raffleId}/submit-tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            artistId,
            ticketIds,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to submit tickets');
        }
      }

      // Refresh the page to show updated data
      router.reload();
    } catch (err) {
      console.error('Error submitting tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit tickets. Please try again.');
    }
  }, [raffleId, unusedTickets, router, supabase.auth]);

  return {
    error,
    submitTickets,
  };
} 