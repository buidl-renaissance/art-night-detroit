import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import CopyButton from '@/components/CopyButton';

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

interface ArtistWinner {
  artistId: string;
  winnerTicketId: string | null;
  winnerTicketNumber: number | null;
  winnerParticipantName: string | null;
  winnerSelectedAt: string | null;
}

interface WinnerTicketData {
  ticket_number: number;
  participants: { name: string }[];
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
  const [winners, setWinners] = useState<Map<string, ArtistWinner>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingWinner, setSelectingWinner] = useState<string | null>(null);
  const [animatingTicket, setAnimatingTicket] = useState<{artistId: string, ticketNumber: number} | null>(null);
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

        // Fetch winner information
        if (uniqueArtistIds.length > 0) {
          const { data: winnersData } = await supabase
            .from('raffle_artists')
            .select(`
              artist_id,
              winner_ticket_id,
              winner_selected_at,
              winner_ticket:tickets!winner_ticket_id (
                ticket_number,
                participants (name)
              )
            `)
            .eq('raffle_id', id)
            .in('artist_id', uniqueArtistIds);

          // Format participant name to show first name and last initial only
          const formatName = (fullName: string | null) => {
            if (!fullName) return null;
            const nameParts = fullName.trim().split(' ');
            if (nameParts.length === 1) {
              return nameParts[0]; // Just first name if only one name
            }
            const firstName = nameParts[0];
            const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            return `${firstName} ${lastInitial}.`;
          };

          const winnersMap = new Map<string, ArtistWinner>();
          winnersData?.forEach(winnerData => {
            // Only add to winners map if there's actually a winning ticket selected
            if (winnerData.winner_ticket_id && winnerData.winner_ticket) {
              const winnerTickets = winnerData.winner_ticket as WinnerTicketData[];
              const winnerTicket = winnerTickets[0]; // Get the first (and should be only) ticket
              const participant = winnerTicket?.participants?.[0];

              const formattedName = participant?.name ? formatName(participant.name) : null;

              winnersMap.set(winnerData.artist_id, {
                artistId: winnerData.artist_id,
                winnerTicketId: winnerData.winner_ticket_id,
                winnerTicketNumber: winnerTicket?.ticket_number || null,
                winnerParticipantName: formattedName,
                winnerSelectedAt: winnerData.winner_selected_at
              });
            }
          });
          setWinners(winnersMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleAndTickets();
  }, [id, router, supabase]);

  const handleSelectWinner = async (artistId: string) => {
    setSelectingWinner(artistId);
    
    // Get all ticket numbers for this artist for animation
    const artistTickets = tickets.filter(t => t.artist_id === artistId && t.artist_name);
    const ticketNumbers = artistTickets.map(t => t.ticket_number);
    
    if (ticketNumbers.length === 0) {
      setError('No tickets found for this artist');
      setSelectingWinner(null);
      return;
    }

    // Start the animation
    let animationCount = 0;
    const maxAnimations = 20; // Number of ticket flashes
    const animationSpeed = 100; // ms between animations

    const animationInterval = setInterval(() => {
      const randomTicket = ticketNumbers[Math.floor(Math.random() * ticketNumbers.length)];
      setAnimatingTicket({ artistId, ticketNumber: randomTicket });
      animationCount++;

      if (animationCount >= maxAnimations) {
        clearInterval(animationInterval);
        // After animation, make the actual API call
        selectActualWinner(artistId);
      }
    }, animationSpeed);
  };

  const selectActualWinner = async (artistId: string) => {
    try {
      const response = await fetch(`/api/raffles/${id}/select-winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          action: 'select'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Clear animation state
        setAnimatingTicket(null);
        
        // Update winners state
        setWinners(prev => {
          const newWinners = new Map(prev);
          newWinners.set(artistId, {
            artistId,
            winnerTicketId: data.winner.ticketId,
            winnerTicketNumber: data.winner.ticketNumber,
            winnerParticipantName: data.winner.participant?.displayName || null,
            winnerSelectedAt: new Date().toISOString()
          });
          return newWinners;
        });
      } else {
        setError(data.error || 'Failed to select winner');
        setAnimatingTicket(null);
      }
    } catch {
      setError('Failed to select winner');
      setAnimatingTicket(null);
    } finally {
      setSelectingWinner(null);
    }
  };



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
        <HeaderRow>
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
          
          {tickets.length > 0 && (
            <CopyActionsGroup>
              <CopyButton 
                textToCopy={tickets.map(t => `#${t.ticket_number}`).join(', ')}
                label="Copy All Numbers"
                variant="secondary"
                size="medium"
              />
              <CopyButton 
                textToCopy={tickets.map(t => t.ticket_number).join('\n')}
                label="Copy List"
                variant="secondary"
                size="medium"
              />
            </CopyActionsGroup>
          )}
        </HeaderRow>

        {/* Artist Allocation Summary */}
        {tickets.length > 0 && (
          <ArtistSummary>
            <SummaryHeader>
              <SummaryTitle>Ticket Allocation by Artist</SummaryTitle>
              {(() => {
                // Group tickets by artist with ticket numbers
                const artistTickets = tickets.reduce((acc, ticket) => {
                  if (ticket.artist_name) {
                    if (!acc[ticket.artist_name]) {
                      acc[ticket.artist_name] = [];
                    }
                    acc[ticket.artist_name].push(ticket.ticket_number);
                  }
                  return acc;
                }, {} as Record<string, number[]>);

                const allArtistTickets = Object.entries(artistTickets)
                  .map(([artistName, ticketNumbers]) => `${artistName}:\n${ticketNumbers.map(num => `#${num}`).join(', ')}`)
                  .join('\n\n');

                return Object.keys(artistTickets).length > 0 && (
                  <CopyButton 
                    textToCopy={allArtistTickets}
                    label="Copy All Artists"
                    variant="secondary"
                    size="small"
                  />
                );
              })()}
            </SummaryHeader>
            <ArtistAllocationGrid>
              {(() => {
                // Group tickets by artist with ticket numbers
                const artistTickets = tickets.reduce((acc, ticket) => {
                  if (ticket.artist_name) {
                    if (!acc[ticket.artist_name]) {
                      acc[ticket.artist_name] = [];
                    }
                    acc[ticket.artist_name].push(ticket.ticket_number);
                  }
                  return acc;
                }, {} as Record<string, number[]>);

                const sortedArtists = Object.entries(artistTickets)
                  .sort(([, a], [, b]) => b.length - a.length); // Sort by count descending

                return sortedArtists.map(([artistName, ticketNumbers]) => {
                  const artistId = tickets.find(t => t.artist_name === artistName)?.artist_id;
                  const winner = artistId ? winners.get(artistId) : null;
                  const isSelecting = selectingWinner === artistId;

                  return (
                    <ArtistAllocationCard key={artistName} $hasWinner={!!winner}>
                      <ArtistCardHeader>
                        <div>
                          <ArtistAllocationName>{artistName}</ArtistAllocationName>
                          <ArtistAllocationCount>{ticketNumbers.length} ticket{ticketNumbers.length !== 1 ? 's' : ''}</ArtistAllocationCount>
                        </div>
                        <ArtistCopyActions>
                          <CopyButton 
                            textToCopy={ticketNumbers.map(num => `#${num}`).join(', ')}
                            label="Copy"
                            variant="secondary"
                            size="small"
                          />
                        </ArtistCopyActions>
                      </ArtistCardHeader>

                      {winner && (
                        <WinnerDisplay>
                          <WinnerIcon>🏆</WinnerIcon>
                          <WinnerInfo>
                            <WinnerLabel>Winner</WinnerLabel>
                            <WinnerTicket>Ticket #{winner.winnerTicketNumber}</WinnerTicket>
                            {winner.winnerParticipantName && (
                              <WinnerName>{winner.winnerParticipantName}</WinnerName>
                            )}
                          </WinnerInfo>
                        </WinnerDisplay>
                      )}

                      <TicketNumbersList>
                        {ticketNumbers.map(num => {
                          const isWinning = winner?.winnerTicketNumber === num;
                          const isAnimating = animatingTicket?.artistId === artistId && animatingTicket?.ticketNumber === num;
                          return (
                            <TicketNumberChip key={num} $isWinner={isWinning} $isAnimating={isAnimating}>
                              #{num}
                            </TicketNumberChip>
                          );
                        })}
                      </TicketNumbersList>

                      <WinnerActions>
                        {!winner ? (
                          <WinnerButton
                            onClick={() => artistId && handleSelectWinner(artistId)}
                            disabled={isSelecting || !artistId}
                            $variant="select"
                          >
                            {isSelecting ? '🎰 Drawing Winner...' : '🎲 Select Winner'}
                          </WinnerButton>
                        ) : (
                          <WinnerConfirmation>
                            ✅ Winner Selected
                          </WinnerConfirmation>
                        )}
                      </WinnerActions>
                    </ArtistAllocationCard>
                  );
                });
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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
`;

const CopyActionsGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
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

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
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

const ArtistAllocationCard = styled.div<{ $hasWinner?: boolean }>`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 8px;
  padding: 1rem;
  border: ${({ theme, $hasWinner }) => 
    $hasWinner 
      ? '2px solid #FFD700' 
      : `1px solid ${theme.colors.border}`
  };
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
  }

  ${({ $hasWinner }) => $hasWinner && `
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  `}

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const ArtistCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const ArtistCopyActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TicketNumbersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 0.2rem;
  }
`;

const TicketNumberChip = styled.span<{ $isWinner?: boolean; $isAnimating?: boolean }>`
  background: ${({ theme, $isWinner, $isAnimating }) => {
    if ($isWinner) return '#FFD700';
    if ($isAnimating) return '#FF6B6B';
    return theme.colors.primary;
  }};
  color: ${({ $isWinner, $isAnimating }) => {
    if ($isWinner || $isAnimating) return '#000';
    return 'white';
  }};
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: ${({ $isWinner, $isAnimating }) => ($isWinner || $isAnimating) ? '700' : '500'};
  position: relative;
  transition: all 0.1s ease;
  
  ${({ $isWinner }) => $isWinner && `
    animation: winnerPulse 2s infinite;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  `}
  
  ${({ $isAnimating }) => $isAnimating && `
    animation: randomizerFlash 0.1s ease;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.6);
    transform: scale(1.1);
  `}
  
  @media (max-width: 768px) {
    padding: 0.15rem 0.4rem;
    font-size: 0.7rem;
  }

  @keyframes winnerPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes randomizerFlash {
    0% { transform: scale(1); background: #FF6B6B; }
    50% { transform: scale(1.15); background: #FF4757; }
    100% { transform: scale(1.1); background: #FF6B6B; }
  }
`;

const WinnerDisplay = styled.div`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 6px;
  padding: 0.75rem;
  margin: 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #000;
`;

const WinnerIcon = styled.div`
  font-size: 1.5rem;
`;

const WinnerInfo = styled.div`
  flex: 1;
`;

const WinnerLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
`;

const WinnerTicket = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const WinnerName = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
`;

const WinnerActions = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
`;

const WinnerButton = styled.button<{ $variant: 'select' }>`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  }
`;

const WinnerConfirmation = styled.div`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
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