import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

interface Ticket {
  id: string;
  ticket_number: number;
  user_id: string;
  created_at: string;
  email: string;
  full_name: string | null;
  artist_name?: string | null;
  artist_id?: string | null;
}



interface Raffle {
  id: string;
  name: string;
  max_tickets: number;
  status: 'draft' | 'active' | 'ended';
}

export default function RaffleTickets() {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRaffleAndTickets = async () => {
      if (!id) return;

      try {
        // Check if user is admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (!profile?.is_admin) {
          router.push('/');
          return;
        }

        // Fetch raffle details
        const { data: raffleData, error: raffleError } = await supabase
          .from('raffles')
          .select('id, name, max_tickets, status')
          .eq('id', id)
          .single();

        if (raffleError) throw raffleError;
        setRaffle(raffleData);

        // Fetch tickets directly from the tickets table using raffle_id
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            created_at,
            artist_id,
            participant_id,
            participants(name, email, phone)
          `)
          .eq('raffle_id', id)
          .order('ticket_number');

        if (ticketsError) {
          console.error('Error fetching tickets:', ticketsError);
          throw ticketsError;
        }

        console.log('Tickets data:', ticketsData);

        // Get artist names for assigned tickets
        const artistIds = ticketsData?.filter(t => t.artist_id).map(t => t.artist_id) || [];
        const uniqueArtistIds = [...new Set(artistIds)];

        const artistsMap = new Map();
        if (uniqueArtistIds.length > 0) {
          const { data: artistsData } = await supabase
            .from('artists')
            .select('id, name')
            .in('id', uniqueArtistIds);
          
          artistsData?.forEach(artist => {
            artistsMap.set(artist.id, artist.name);
          });
        }

        // Transform tickets data to match the expected format
        const allTickets = ticketsData?.map(ticket => {
          // Handle both array and object forms of participants data
          const participant = Array.isArray(ticket.participants) 
            ? ticket.participants[0] 
            : ticket.participants;
          
          return {
            id: ticket.id,
            ticket_number: ticket.ticket_number,
            user_id: '', // No user_id for these tickets
            created_at: ticket.created_at,
            email: participant?.email || '',
            full_name: participant?.name || null,
            artist_name: ticket.artist_id ? artistsMap.get(ticket.artist_id) : null,
            artist_id: ticket.artist_id || null
          };
        }) || [];

        console.log('All tickets:', allTickets);
        setTickets(allTickets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleAndTickets();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <PageContainer theme="dark" width="medium">
        <LoadingMessage>Loading tickets...</LoadingMessage>
      </PageContainer>
    );
  }

  if (!raffle) {
    return (
      <PageContainer theme="dark" width="medium">
        <ErrorMessage>Raffle not found</ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark" width="medium">
      <Header>
        <Title>{raffle.name} - Tickets</Title>
        <Stats>
          <Stat>
            <StatLabel>Total</StatLabel>
            <StatValue>{tickets.length}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Assigned</StatLabel>
            <StatValue>{tickets.filter(t => t.artist_name).length}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Unassigned</StatLabel>
            <StatValue>{tickets.filter(t => !t.artist_name).length}</StatValue>
          </Stat>
        </Stats>

        {/* Artist Allocation Summary */}
        {tickets.length > 0 && (
          <ArtistSummary>
            <SummaryTitle>Ticket Allocation by Artist</SummaryTitle>
            <ArtistAllocationGrid>
              {(() => {
                // Group tickets by artist
                const artistAllocations = tickets.reduce((acc, ticket) => {
                  if (ticket.artist_name) {
                    acc[ticket.artist_name] = (acc[ticket.artist_name] || 0) + 1;
                  }
                  return acc;
                }, {} as Record<string, number>);

                const sortedAllocations = Object.entries(artistAllocations)
                  .sort(([, a], [, b]) => b - a); // Sort by count descending

                return sortedAllocations.map(([artistName, count]) => (
                  <ArtistAllocationCard key={artistName}>
                    <ArtistAllocationName>{artistName}</ArtistAllocationName>
                    <ArtistAllocationCount>{count} ticket{count !== 1 ? 's' : ''}</ArtistAllocationCount>
                  </ArtistAllocationCard>
                ));
              })()}
            </ArtistAllocationGrid>
          </ArtistSummary>
        )}
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {tickets.length === 0 ? (
        <EmptyState>
          <EmptyStateText>No tickets sold yet</EmptyStateText>
          <EmptyStateSubtext>Share the raffle to start selling tickets!</EmptyStateSubtext>
        </EmptyState>
      ) : (
        <TicketTable>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Owner</Th>
              <Th>Assigned To</Th>
              <Th>Created Date</Th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <Td>#{ticket.ticket_number}</Td>
                <Td>
                  {ticket.full_name ? (() => {
                    const nameParts = ticket.full_name.trim().split(' ');
                    if (nameParts.length === 1) {
                      return nameParts[0];
                    }
                    const firstName = nameParts[0];
                    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
                    return `${firstName} ${lastInitial}.`;
                  })() : 'Anonymous'}
                </Td>
                <Td>
                  {ticket.artist_name ? (
                    <AssignedArtist>{ticket.artist_name}</AssignedArtist>
                  ) : (
                    <UnassignedText>Not assigned</UnassignedText>
                  )}
                </Td>
                <Td>
                  {new Date(ticket.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Td>
              </tr>
            ))}
          </tbody>
        </TicketTable>
      )}

      <ButtonGroup>
        <Button onClick={() => router.push('/admin/raffles')} variant="secondary">
          Back to Raffles
        </Button>
        <Button onClick={() => router.push(`/admin/raffles/${id}`)}>
          Edit Raffle
        </Button>
      </ButtonGroup>
    </PageContainer>
  );
}

const Header = styled.div`
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-family: var(--font-decorative);
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    text-align: center;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
`;

const Stat = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    border-radius: 8px;
  }
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.8rem;
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin-bottom: 0.2rem;
  }
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  font-family: var(--font-decorative);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.2rem;
  padding: 40px;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
`;

const EmptyStateText = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
  font-family: var(--font-decorative);
`;

const EmptyStateSubtext = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
`;

const TicketTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background.primary};

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
`;

const Td = styled.td`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ variant, theme }) => variant === 'secondary' ? 'transparent' : theme.colors.primary};
  color: ${({ variant, theme }) => variant === 'secondary' ? theme.colors.text.primary : 'white'};
  border: ${({ variant, theme }) => variant === 'secondary' ? `1px solid ${theme.colors.border}` : 'none'};
  box-shadow: ${({ variant }) => variant === 'secondary' ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'};

  &:hover {
    background: ${({ variant, theme }) => variant === 'secondary' ? theme.colors.background.secondary : theme.colors.primaryHover};
    transform: ${({ variant }) => variant === 'secondary' ? 'none' : 'translateY(-1px)'};
    box-shadow: ${({ variant }) => variant === 'secondary' ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.3)'};
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const AssignedArtist = styled.span`
  color: #4ade80;
  font-weight: 500;
`;

const UnassignedText = styled.span`
  color: ${({ theme }) => theme.colors.text.light};
  font-style: italic;
`;



const ArtistSummary = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);

  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
`;

const ArtistAllocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }
`;

const ArtistAllocationCard = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const ArtistAllocationName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
`;

const ArtistAllocationCount = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`; 