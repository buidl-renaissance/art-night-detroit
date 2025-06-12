import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Raffle {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_tickets: number;
  status: 'draft' | 'active' | 'ended';
  tickets_sold: number;
  price_per_ticket: number;
}

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  raffle_artist_id: string;
  total_tickets?: number;
  user_tickets?: number;
  artwork_title?: string;
}

interface UnusedTicket {
  id: string;
  ticket_number: number;
  created_at: string;
}

interface RaffleData {
  raffle: Raffle | null;
  artists: Artist[];
  unusedTickets: UnusedTicket[];
  loading: boolean;
  error: string | null;
}

export function useRaffleData(raffleId: string | string[] | undefined): RaffleData {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [unusedTickets, setUnusedTickets] = useState<UnusedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRaffleData = async () => {
      if (!raffleId) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const response = await fetch(`/api/raffles/${raffleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch raffle data');
        }

        const data = await response.json();
        setRaffle(data.raffle);
        setArtists(data.artists);
        setUnusedTickets(data.unusedTickets);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching raffle data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load raffle data');
        setLoading(false);
      }
    };

    fetchRaffleData();
  }, [raffleId, router, supabase]);

  return {
    raffle,
    artists,
    unusedTickets,
    loading,
    error
  };
} 