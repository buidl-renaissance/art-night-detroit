import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import RaffleCountdown from '@/components/RaffleCountdown';

interface Raffle {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_tickets: number;
  status: 'draft' | 'active' | 'ended';
  tickets_sold: number;
}

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  raffle_artist_id: string;
}

interface ArtistData {
  id: string;
  artists: {
    id: string;
    name: string;
    bio: string;
    image_url: string;
  };
}

interface UnusedTicket {
  id: string;
  ticket_number: number;
  created_at: string;
}

const RaffleContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 4rem;
`;

const RaffleHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const RaffleTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const RaffleDescription = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ArtistImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ArtistInfo = styled.div`
  padding: 1.5rem;
`;

const ArtistName = styled.h3`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const ArtistBio = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const TicketInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;
`;

const TicketInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  text-align: center;

  /* Hide default number input arrows */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const ArrowButton = styled.button`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TicketSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TicketForm = styled.form`
  background: ${({ theme }) => theme.colors.background.secondary};
  /* padding: 1rem; */
  border-radius: 12px;
  margin-top: 1.5rem;
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.text.light};
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  padding-top: 0;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 1rem;
  text-align: center;
`;

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const AvailableTickets = styled.div`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: bold;
`;

export default function RafflePage() {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [unusedTickets, setUnusedTickets] = useState<UnusedTicket[]>([]);
  const [ticketCounts, setTicketCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRaffleData = async () => {
      if (!id) return;

      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch raffle details
        const { data: raffleData, error: raffleError } = await supabase
          .from('raffles')
          .select('*')
          .eq('id', id)
          .single();

        if (raffleError) throw raffleError;

        // Get ticket count
        const { count } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('raffle_id', id);

        setRaffle({
          ...raffleData,
          tickets_sold: count || 0
        });

        // Fetch artists in the raffle
        const { data: artistsData, error: artistsError } = await supabase
          .from('raffle_artists')
          .select(`
            id,
            artists (
              id,
              name,
              bio,
              image_url
            )
          `)
          .eq('raffle_id', id);

        if (artistsError) throw artistsError;

        // Type assertion to handle the nested artists data
        const formattedArtists = (artistsData as unknown as ArtistData[]).map(ra => ({
          id: ra.artists.id,
          name: ra.artists.name,
          bio: ra.artists.bio,
          image_url: ra.artists.image_url,
          raffle_artist_id: ra.id
        }));

        setArtists(formattedArtists);

        // Fetch unused tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('id, ticket_number, created_at')
          .eq('user_id', session.user.id)
          .is('raffle_id', null)
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;
        setUnusedTickets(ticketsData || []);

      } catch (err) {
        console.error('Error fetching raffle data:', err);
        setError('Failed to load raffle details');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchRaffleData();
    }
  }, [id, router.isReady]);

  const handleTicketCountChange = (artistId: string, count: number) => {
    setTicketCounts(prev => ({
      ...prev,
      [artistId]: Math.max(0, Math.min(count, unusedTickets.length))
    }));
  };

  const handleIncrement = (artistId: string) => {
    const currentCount = ticketCounts[artistId] || 0;
    if (currentCount < unusedTickets.length) {
      handleTicketCountChange(artistId, currentCount + 1);
    }
  };

  const handleDecrement = (artistId: string) => {
    const currentCount = ticketCounts[artistId] || 0;
    if (currentCount > 0) {
      handleTicketCountChange(artistId, currentCount - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get all tickets that have been allocated
    const totalTicketsRequested = Object.values(ticketCounts).reduce((sum, count) => sum + count, 0);
    if (totalTicketsRequested === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      // For each artist, submit their tickets
      for (const [artistId, count] of Object.entries(ticketCounts)) {
        if (count === 0) continue;

        // Get the next batch of tickets for this artist
        const ticketIds = unusedTickets
          .slice(0, count)
          .map(ticket => ticket.id);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`/api/raffles/${id}/submit-tickets`, {
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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <RaffleContainer>
          <p>Loading raffle details...</p>
        </RaffleContainer>
      </PageContainer>
    );
  }

  if (error || !raffle) {
    return (
      <PageContainer theme="dark">
        <RaffleContainer>
          <ErrorMessage>{error || 'Raffle not found'}</ErrorMessage>
        </RaffleContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <RaffleContainer>
        <RaffleHeader>
          <RaffleTitle>{raffle.name}</RaffleTitle>
          <RaffleDescription>{raffle.description}</RaffleDescription>
        </RaffleHeader>

        <RaffleCountdown endDate={raffle.end_date} />

        {unusedTickets.length > 0 && (
          <TicketSection>
            <h2>Submit Tickets</h2>
            <TicketForm onSubmit={handleSubmit}>
              <ArtistsGrid>
                {artists.map((artist) => (
                  <ArtistCard key={artist.id}>
                    <ArtistImage src={artist.image_url} alt={artist.name} />
                    <ArtistInfo>
                      <ArtistName>{artist.name}</ArtistName>
                      <ArtistBio>{artist.bio}</ArtistBio>
                      <TicketInputContainer>
                        <ArrowButton
                          type="button"
                          onClick={() => handleDecrement(artist.id)}
                          disabled={(ticketCounts[artist.id] || 0) === 0}
                        >
                          -
                        </ArrowButton>
                        <TicketInput
                          type="number"
                          min="0"
                          max={unusedTickets.length}
                          value={ticketCounts[artist.id] || 0}
                          onChange={(e) => handleTicketCountChange(artist.id, parseInt(e.target.value) || 0)}
                        />
                        <ArrowButton
                          type="button"
                          onClick={() => handleIncrement(artist.id)}
                          disabled={(ticketCounts[artist.id] || 0) >= unusedTickets.length}
                        >
                          +
                        </ArrowButton>
                      </TicketInputContainer>
                    </ArtistInfo>
                  </ArtistCard>
                ))}
              </ArtistsGrid>
              <ButtonContainer>
                <SubmitButton
                  type="submit"
                  disabled={Object.values(ticketCounts).reduce((sum, count) => sum + count, 0) === 0 || submitting}
                  >
                  {submitting ? 'Submitting...' : 'Submit Tickets'}
                </SubmitButton>
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </ButtonContainer>
            </TicketForm>
          </TicketSection>
        )}
      </RaffleContainer>
      {unusedTickets.length > 0 && (
        <BottomBar>
          <AvailableTickets>
            Available Tickets: {unusedTickets.length}
          </AvailableTickets>
        </BottomBar>
      )}
    </PageContainer>
  );
} 