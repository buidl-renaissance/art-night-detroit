import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';
import QuantityControls from '@/components/QuantityControls';
import RaffleCountdown from '@/components/RaffleCountdown';

interface Ticket {
  id: string;
  ticket_number: number;
  raffle_id: string;
  participant_id: string;
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
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0.5rem;
    margin: 0;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
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

const TicketsSection = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const TicketsHeader = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
`;





const ArtistsSection = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 2rem;
  border-radius: 12px;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ArtistsHeader = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
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

const ArtistName = styled.h3`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.2;
`;

const ArtistBio = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.9rem;
  line-height: 1.3;
  margin: 0;
  width: 100%;
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
  margin-top: 2rem;

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
  const [existingSubmissions, setExistingSubmissions] = useState<{ ticket_id: string; raffle_artists: { artist_id: string } }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id && sessionCode) {
      fetchData();
    }
  }, [id, sessionCode]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchData = async () => {
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
      let userTickets = [];
      
      if (session && session.participant_id) {
        // If we have a session with participant_id, get tickets for this specific participant
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('*')
          .eq('raffle_id', id)
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

          // Get existing ticket submissions for this user
          if (userTickets && userTickets.length > 0) {
            const ticketIds = userTickets.map((ticket: { id: string }) => ticket.id);
            const { data: submissions } = await supabase
              .from('ticket_submissions')
              .select(`
                *,
                raffle_artists (
                  id,
                  artist_id
                )
              `)
              .in('ticket_id', ticketIds);

            console.log('Existing submissions:', submissions);
            setExistingSubmissions(submissions || []);

            // Pre-populate artist quantities based on existing submissions
            const quantities: { [artistId: string]: number } = {};
            submissions?.forEach((submission: { raffle_artists: { artist_id: string } }) => {
              const artistId = submission.raffle_artists?.artist_id;
              if (artistId) {
                quantities[artistId] = (quantities[artistId] || 0) + 1;
              }
            });
            setArtistQuantities(quantities);

            // Check if there are unassigned tickets and show modal if needed
            const assignedTicketIds = submissions?.map(sub => sub.ticket_id) || [];
            const unassignedTickets = userTickets.filter(ticket => 
              !assignedTicketIds.includes(ticket.id)
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
  };

  const handleQuantityChange = (artistId: string, quantity: number) => {
    setArtistQuantities(prev => ({
      ...prev,
      [artistId]: quantity
    }));
  };

  const totalTicketsRequested = Object.values(artistQuantities).reduce((sum, count) => sum + count, 0);
  const remainingTickets = tickets.length - totalTicketsRequested;

  const handleSubmit = async () => {
    if (totalTicketsRequested === 0) {
      setError('Please assign at least one ticket to an artist');
      return;
    }

    if (totalTicketsRequested > tickets.length) {
      setError('You cannot assign more tickets than you have');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get tickets to assign
      const ticketsToAssign = tickets.slice(0, totalTicketsRequested);
      
      // Create ticket submissions for each artist
      const submissions = [];
      let ticketIndex = 0;

      for (const [artistId, quantity] of Object.entries(artistQuantities)) {
        if (quantity > 0) {
          // Find the raffle_artist_id for this artist
          const artist = artists.find(a => a.id === artistId);
          const raffleArtistId = artist?.raffle_artist_id;
          
          if (raffleArtistId) {
            for (let i = 0; i < quantity; i++) {
              if (ticketIndex < ticketsToAssign.length) {
                submissions.push({
                  raffle_artist_id: raffleArtistId,
                  ticket_id: ticketsToAssign[ticketIndex].id,
                  submitted_at: new Date().toISOString()
                });
                ticketIndex++;
              }
            }
          }
        }
      }

      // Check for existing submissions to avoid duplicates
      const ticketIds = ticketsToAssign.map(ticket => ticket.id);
      const { data: existingSubmissions } = await supabase
        .from('ticket_submissions')
        .select('ticket_id')
        .in('ticket_id', ticketIds);

      const existingTicketIds = existingSubmissions?.map(sub => sub.ticket_id) || [];
      const newSubmissions = submissions.filter(sub => !existingTicketIds.includes(sub.ticket_id));

      if (newSubmissions.length === 0) {
        setError('All tickets have already been submitted');
        return;
      }

      // Insert only new ticket submissions
      console.log('Submitting new tickets:', newSubmissions);
      
      const { error: submitError } = await supabase
        .from('ticket_submissions')
        .insert(newSubmissions);

      if (submitError) {
        console.error('Submit error:', submitError);
        throw new Error(`Failed to submit tickets: ${submitError.message}`);
      }

      setSuccess(`Successfully submitted ${newSubmissions.length} ticket(s) to artists!`);
      
      // Refresh the page data to show updated submissions
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting tickets');
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

        <TicketsSection>
          <TicketsHeader>Your Tickets</TicketsHeader>
          
          {/* Group tickets by artist */}
          {artists.map((artist) => {
            const artistSubmissions = existingSubmissions.filter(sub => 
              sub.raffle_artists?.artist_id === artist.id
            );
            const artistTickets = tickets.filter(ticket => 
              artistSubmissions.some(sub => sub.ticket_id === ticket.id)
            );
            
            if (artistTickets.length === 0) return null;
            
            return (
              <div key={artist.id} style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  color: '#4CAF50', 
                  marginBottom: '0rem',
                  fontSize: '1.2rem',
                  textAlign: 'center'
                }}>
                  {artist.name}
                </h3>
                {/* <p style={{ 
                  color: '#666', 
                  marginBottom: '0.5rem',
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }}>
                  {artistTickets.length} ticket(s)
                </p> */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  justifyContent: 'center'
                }}>
                  {artistTickets.map((ticket) => (
                    <span key={ticket.id} style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}>
                      #{ticket.ticket_number}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Unassigned tickets */}
          {(() => {
            const assignedTicketIds = existingSubmissions.map(sub => sub.ticket_id);
            const unassignedTickets = tickets.filter(ticket => 
              !assignedTicketIds.includes(ticket.id)
            );
            
            if (unassignedTickets.length > 0) {
              return (
                <div style={{ marginTop: '0.5rem' }}>
                  <h3 style={{ 
                    color: '#666', 
                    marginBottom: '0.5rem',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                  }}>
                    Unassigned Tickets
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}>
                    {unassignedTickets.map((ticket) => (
                      <span key={ticket.id} style={{
                        background: '#f0f0f0',
                        color: '#666',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ddd'
                      }}>
                        #{ticket.ticket_number}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </TicketsSection>

        <ArtistsSection>
          <ArtistsHeader>Assign Tickets to Artists</ArtistsHeader>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666', fontSize: '0.8rem' }}>
            You have {remainingTickets} ticket(s) remaining to assign
          </p>

          <ArtistsGrid>
            {artists.map((artist) => (
              <ArtistCard key={artist.id}>
                <ArtistInfoRow>  
                  <ArtistImage src={artist.image_url} alt={artist.name} />
                  <ArtistName>{artist.name}</ArtistName>
                </ArtistInfoRow>
                <ArtistInfo>
                  {/* <ArtistBio>{artist.bio}</ArtistBio> */}
                  
                  <QuantitySection>
                    <QuantityControls
                      quantity={artistQuantities[artist.id] || 0}
                      min={0}
                      max={remainingTickets + (artistQuantities[artist.id] || 0)}
                      onChange={(value) => handleQuantityChange(artist.id, value)}
                    />
                  </QuantitySection>
                </ArtistInfo>
              </ArtistCard>
            ))}
          </ArtistsGrid>

          <SubmitButton onClick={handleSubmit} disabled={submitting || totalTicketsRequested === 0}>
            {submitting ? 'Submitting...' : `Submit ${totalTicketsRequested} Ticket(s)`}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </ArtistsSection>
      </Container>
    </PageContainer>
  );
} 