import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';
import QuantityControls from '@/components/QuantityControls';
import RaffleCountdown from '@/components/RaffleCountdown';

interface Ticket {
  id: string;
  ticket_number: number;
  participant_id: string;
  artist_id?: string;
  created_at: string;
}

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  raffle_artist_id: string;
}

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.light};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
`;

const ModalSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
`;


const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 120px; /* Add space for fixed bottom bar */
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0.5rem;
    padding-bottom: 120px;
    margin: 0;
  }
`;

const SuccessMessage = styled.div`
  color: #4CAF50;
  margin-top: 1rem;
  text-align: center;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
`;













const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 1rem;

  &:hover {
    transform: translateY(-4px);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const ArtistImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const ArtistInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const ArtistInfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const ArtistNameAndTickets = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const ArtistName = styled.h3`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.2;
`;

const QuantitySection = styled.div`
  text-align: center;
  margin-top: 1rem;
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
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    margin-top: 1rem;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 1rem;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function ClaimSuccess() {
  const router = useRouter();
  const { id, sessionCode } = router.query;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [raffle, setRaffle] = useState<{ end_date: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [artistQuantities, setArtistQuantities] = useState<{ [artistId: string]: number }>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabase = createClientComponentClient();

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchData = useCallback(async () => {
    try {
      // Get the session to find the participant
      const { data: session } = await supabase
        .from('qr_code_sessions')
        .select('*')
        .eq('session_code', sessionCode)
        .single();

      console.log('Session data:', session);

      // If no active session, try to get tickets by recent creation time
      if (!session) {
        console.log('No active session found');
      } else {
        // Check if the participant exists
        const { data: participant } = await supabase
          .from('participants')
          .select('*')
          .eq('id', session.participant_id)
          .single();

        console.log('Participant data:', participant);
        
        if (!participant) {
          console.log('Participant not found in participants table');
        }
      }

      // Get raffle data for countdown
      const { data: raffleData } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', id)
        .single();

      console.log('Raffle data:', raffleData);
      
      if (raffleData) {
        setRaffle(raffleData);
      }
      
      // Get tickets for this specific participant
      let userTickets: Ticket[] = [];
      
      if (session && session.participant_id) {
        // If we have a session with participant_id, get tickets for this specific participant
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('id, ticket_number, participant_id, artist_id, created_at')
          .eq('participant_id', session.participant_id)
          .order('ticket_number');

        console.log('Tickets for participant:', ticketsData);
        userTickets = ticketsData || [];
      } else {
        // If no session or no participant_id, show message
        console.log('No session or participant_id found');
        console.log('Session participant_id:', session?.participant_id);
      }



      if (userTickets.length > 0) {
        setTickets(userTickets);
        console.log('Setting user tickets:', userTickets);
      } else {
        console.log('No tickets found for this participant');
        setTickets([]);
      }



      // Get artists for this raffle
      console.log('Fetching artists for raffle:', id);
      
      // First, check if there are any raffle_artists entries
      const { data: raffleArtists, error: raffleArtistsError } = await supabase
        .from('raffle_artists')
        .select('*')
        .eq('raffle_id', id);

      console.log('Raffle artists error:', raffleArtistsError);
      console.log('Raffle artists data:', raffleArtists);

      if (raffleArtists && raffleArtists.length > 0) {
        // Get the artist details for each raffle_artist
        const artistIds = raffleArtists.map(ra => ra.artist_id);
        console.log('Artist IDs:', artistIds);

        const { data: artistsData, error: artistsError } = await supabase
          .from('artists')
          .select('*')
          .in('id', artistIds);

        console.log('Artists query error:', artistsError);
        console.log('Artists data:', artistsData);

        if (artistsData) {
                     const formattedArtists = artistsData.map((artist: { id: string; name: string; bio: string; image_url: string }) => ({
            id: artist.id,
            name: artist.name,
            bio: artist.bio,
            image_url: artist.image_url,
            raffle_artist_id: raffleArtists.find(ra => ra.artist_id === artist.id)?.id || ''
          }));
          
          console.log('Formatted artists:', formattedArtists);
          setArtists(formattedArtists);

          // Check existing ticket assignments (using tickets.artist_id)
          if (userTickets && userTickets.length > 0) {
            console.log('User tickets for assignment check:', userTickets);
            
            // artistQuantities should only track NEW assignments in this session
            // Existing assignments are shown as chips, quantity controls start at 0
            


            // Check if there are unassigned tickets and show modal if needed
            const unassignedTickets = userTickets.filter((ticket: Ticket) => 
              !ticket.artist_id
            );
            
            if (unassignedTickets.length > 0) {
              setIsModalOpen(true);
            }
          }
        }
      } else {
        console.log('No raffle_artists found for this raffle');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, sessionCode, supabase]);

  useEffect(() => {
    if (id && sessionCode) {
      fetchData();
    }
  }, [id, sessionCode, fetchData]);

  const handleQuantityChange = (artistId: string, quantity: number) => {
    setArtistQuantities(prev => ({
      ...prev,
      [artistId]: quantity
    }));
  };

  const totalTicketsRequested = Object.values(artistQuantities).reduce((sum, count) => sum + count, 0);
  const unassignedTickets = tickets.filter((ticket: Ticket) => 
    !ticket.artist_id
  );

  const handleSubmit = async () => {
    if (totalTicketsRequested === 0) {
      setError('Please assign at least one ticket to an artist');
      return;
    }

    if (totalTicketsRequested > unassignedTickets.length) {
      setError(`You cannot assign more tickets than you have unassigned (${unassignedTickets.length} available)`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get tickets to assign (only unassigned ones)
      const ticketsToAssign = unassignedTickets.slice(0, totalTicketsRequested);
      
      // Track assignments for each artist
      const assignments: { ticketId: string; artistId: string }[] = [];
      let ticketIndex = 0;

      for (const [artistId, quantity] of Object.entries(artistQuantities)) {
        if (quantity > 0) {
          for (let i = 0; i < quantity; i++) {
            if (ticketIndex < ticketsToAssign.length) {
              assignments.push({
                ticketId: ticketsToAssign[ticketIndex].id,
                artistId: artistId
              });
              ticketIndex++;
            }
          }
        }
      }

      if (assignments.length === 0) {
        setError('No assignments to process');
        return;
      }

      console.log('Updating tickets with artist assignments:', assignments);
      
      // Update each ticket with its artist_id directly
      const updatePromises = assignments.map(assignment => 
        supabase
          .from('tickets')
          .update({ artist_id: assignment.artistId })
          .eq('id', assignment.ticketId)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Update errors:', errors);
        throw new Error(`Failed to update ${errors.length} ticket(s)`);
      }

      setSuccess(`Successfully assigned ${assignments.length} ticket(s) to artists!`);
      
      // Refresh the page data to show updated assignments
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while assigning tickets');
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <PageContainer theme="dark">
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      </PageContainer>
    );
  }

  if (error && !tickets.length) {
    return (
      <PageContainer theme="dark">
        <Container>
          <ErrorMessage>{error}</ErrorMessage>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      {isModalOpen && (
        <Modal>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
            <ModalTitle>🎉 Tickets Claimed!</ModalTitle>
            <ModalSubtitle>Now assign your tickets to your favorite artists</ModalSubtitle>
            <ActionButton onClick={handleCloseModal}>
              Select Artists
            </ActionButton>
          </ModalContent>
        </Modal>
      )}
      
      <Container>
        {raffle && <RaffleCountdown endDate={raffle.end_date} raffleName={raffle.name} />}

        <CombinedSection>
          <CombinedHeader>Ticket Assignment</CombinedHeader>

          {/* Show unassigned tickets above artists */}
          {unassignedTickets.length > 0 && (
            <UnassignedTicketsDisplay>
              <UnassignedTicketsTitle>{unassignedTickets.length} Unassigned Ticket{unassignedTickets.length === 1 ? '' : 's'}</UnassignedTicketsTitle>
              <UnassignedTicketsContainer>
                {unassignedTickets.map((ticket: Ticket) => (
                  <UnassignedTicketChip key={ticket.id}>
                    #{ticket.ticket_number}
                  </UnassignedTicketChip>
                ))}
              </UnassignedTicketsContainer>
            </UnassignedTicketsDisplay>
          )}

          <ArtistsGrid>
            {artists.map((artist) => {
              const artistTickets = tickets.filter((ticket: Ticket) => 
                ticket.artist_id === artist.id
              );
              
              return (
                <ArtistCard key={artist.id}>
                  <ArtistInfoRow>  
                    <ArtistImage src={artist.image_url} alt={artist.name} />
                    <ArtistNameAndTickets>
                      <ArtistName>{artist.name}</ArtistName>
                      {/* Show assigned ticket chips directly below artist name */}
                      {artistTickets.length > 0 && (
                        <TicketChipsContainer>
                          {artistTickets.map((ticket: Ticket) => (
                            <TicketChip key={ticket.id}>
                              #{ticket.ticket_number}
                            </TicketChip>
                          ))}
                        </TicketChipsContainer>
                      )}
                    </ArtistNameAndTickets>
                  </ArtistInfoRow>
                  
                  <ArtistInfo>
                    {/* Only show quantity controls if there are unassigned tickets */}
                    {unassignedTickets.length > 0 && (
                      <QuantitySection>
                        <QuantityControls
                          quantity={artistQuantities[artist.id] || 0}
                          min={0}
                          max={(() => {
                            // Calculate how many tickets are available for this artist
                            const totalTicketsBeingAllocated = Object.entries(artistQuantities)
                              .filter(([id]) => id !== artist.id) // Exclude current artist
                              .reduce((sum, [, qty]) => sum + qty, 0);
                            const availableForThisArtist = unassignedTickets.length - totalTicketsBeingAllocated;
                            return Math.max(0, availableForThisArtist);
                          })()}
                          onChange={(value) => handleQuantityChange(artist.id, value)}
                        />
                      </QuantitySection>
                    )}
                  </ArtistInfo>
                </ArtistCard>
              );
            })}
          </ArtistsGrid>



          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </CombinedSection>


      </Container>

      {unassignedTickets.length > 0 && (
        <BottomBar>
          <ButtonContainer>
            <SubmitButton onClick={handleSubmit} disabled={submitting || totalTicketsRequested === 0}>
              {submitting ? 'Submitting...' : `Submit ${totalTicketsRequested} Ticket${totalTicketsRequested === 1 ? '' : 's'}`}
            </SubmitButton>
          </ButtonContainer>
          <RemainingTickets>
            {unassignedTickets.length - totalTicketsRequested} tickets remaining
          </RemainingTickets>
        </BottomBar>
      )}
    </PageContainer>
  );
}

const UnassignedTicketsInfo = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
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
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ButtonContainer = styled.div`
  margin-bottom: 0.5rem;
`;

const RemainingTickets = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const CombinedSection = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const CombinedHeader = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }
`;

const TicketChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-start;
  
  @media (max-width: 768px) {
    gap: 0.375rem;
  }
`;

const TicketChip = styled.span`
  background: #4CAF50;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }
`;

const UnassignedTicketsDisplay = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const UnassignedTicketsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 1rem;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
`;

const UnassignedTicketsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const UnassignedTicketChip = styled.span`
  background: #f0f0f0;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid #ddd;
  
  @media (max-width: 768px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }
`; 