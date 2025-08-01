import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';
import QuantityControls from '@/components/QuantityControls';

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
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
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
    margin-bottom: 0.75rem;
  }
`;

const TicketList = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const TicketItem = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
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
  overflow: hidden;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;

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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const ArtistName = styled.h3`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ArtistBio = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
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

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
`;

export default function ClaimSuccess() {
  const router = useRouter();
  const { id, sessionCode } = router.query;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [artistQuantities, setArtistQuantities] = useState<{ [artistId: string]: number }>({});
  const [existingSubmissions, setExistingSubmissions] = useState<{ ticket_id: string; raffle_artists: { artist_id: string } }[]>([]);
  const [debugInfo, setDebugInfo] = useState<{ sessionCode?: string; participantId?: string; raffleId?: string; sessionActive?: boolean }>({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id && sessionCode) {
      fetchData();
    }
  }, [id, sessionCode]);

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

      // Set debug info
      setDebugInfo({
        sessionCode: sessionCode as string,
        participantId: session?.participant_id,
        raffleId: id as string,
        sessionActive: session?.is_active || false
      });

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

      // Insert ticket submissions
      console.log('Submitting tickets:', submissions);
      
      const { error: submitError } = await supabase
        .from('ticket_submissions')
        .insert(submissions);

      if (submitError) {
        console.error('Submit error:', submitError);
        throw new Error(`Failed to submit tickets: ${submitError.message}`);
      }

      setSuccess('Tickets successfully submitted to artists!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting tickets');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <Container>
          <LoadingMessage>Loading your tickets...</LoadingMessage>
        </Container>
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
      <Container>
        <Header>
          <Title>🎉 Tickets Claimed Successfully!</Title>
          <Subtitle>Now assign your tickets to your favorite artists</Subtitle>
        </Header>

        {/* Debug Info */}
        <div style={{ 
          background: '#f0f0f0', 
          padding: '1rem', 
          marginBottom: '1rem', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong><br/>
          Session Code: {debugInfo.sessionCode}<br/>
          Participant ID: {debugInfo.participantId || 'Not found'}<br/>
          Raffle ID: {debugInfo.raffleId}<br/>
          Tickets Found: {tickets.length}<br/>
          Session Active: {debugInfo.sessionActive ? 'Yes' : 'No'}<br/>
          <br/>
          <strong>Check Console:</strong> Look for Session data, Participant data, and Participant not found messages
        </div>

        <SuccessMessage>
          You have successfully claimed {tickets.length} ticket(s)!
        </SuccessMessage>

        <TicketsSection>
          <TicketsHeader>Your Tickets</TicketsHeader>
          <TicketList>
            {tickets.map((ticket) => {
              const submission = existingSubmissions.find(sub => sub.ticket_id === ticket.id);
              const assignedArtist = submission ? 
                artists.find(artist => artist.id === submission.raffle_artists?.artist_id) : null;
              
              return (
                <TicketItem key={ticket.id}>
                  <div>
                    <span>Ticket #{ticket.ticket_number}</span>
                    {assignedArtist && (
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                        Assigned to: <strong>{assignedArtist.name}</strong>
                      </div>
                    )}
                  </div>
                  {submission && (
                    <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>✓ Submitted</span>
                  )}
                </TicketItem>
              );
            })}
          </TicketList>
        </TicketsSection>

        <ArtistsSection>
          <ArtistsHeader>Assign Tickets to Artists</ArtistsHeader>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
            You have {remainingTickets} ticket(s) remaining to assign
          </p>

          <ArtistsGrid>
            {artists.map((artist) => (
              <ArtistCard key={artist.id}>
                <ArtistImage src={artist.image_url} alt={artist.name} />
                <ArtistInfo>
                  <ArtistName>{artist.name}</ArtistName>
                  <ArtistBio>{artist.bio}</ArtistBio>
                  
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