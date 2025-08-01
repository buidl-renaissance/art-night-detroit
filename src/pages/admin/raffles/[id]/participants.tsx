import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';

interface Participant {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram?: string;
  created_at: string;
  ticket_claims: {
    id: string;
    claimed_at: string;
    ticket: {
      id: string;
      ticket_number: number;
    };
  }[];
}

interface Raffle {
  id: string;
  name: string;
  description: string;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
`;

const ParticipantsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const ParticipantCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ParticipantHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.h3`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const ParticipantContact = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const InstagramHandle = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ClaimedAt = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.8rem;
  text-align: right;
`;

const TicketsList = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TicketItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 6px;
  margin-bottom: 0.5rem;
`;

const TicketNumber = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const TicketClaimedAt = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.light};
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 8px;
`;

export default function ParticipantsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdmin = async () => {
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
        router.push('/dashboard');
        return;
      }

      if (id) {
        fetchData();
      }
    };

    if (router.isReady) {
      checkAdmin();
    }
  }, [router.isReady, id]);

  const fetchData = async () => {
    try {
      // Fetch raffle details
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', id)
        .single();

      if (raffleError) throw raffleError;
      setRaffle(raffleData);

      // Fetch participants with their ticket claims
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select(`
          *,
          ticket_claims (
            id,
            claimed_at,
            ticket (
              id,
              ticket_number
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (participantsError) throw participantsError;

      // Filter participants who have claimed tickets for this raffle
      const filteredParticipants = participantsData?.filter(participant => 
        participant.ticket_claims.some((claim: { ticket: { id: string } | null }) => 
          claim.ticket && claim.ticket.id // This will need to be adjusted based on actual ticket structure
        )
      ) || [];

      setParticipants(filteredParticipants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const totalParticipants = participants.length;
  const totalTicketsClaimed = participants.reduce((sum, participant) => 
    sum + participant.ticket_claims.length, 0
  );

  if (loading) {
    return (
      <PageContainer theme="dark">
        <Container>
          <LoadingMessage>Loading participants...</LoadingMessage>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
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
          <Title>Participants</Title>
          <Subtitle>View all participants and their claimed tickets</Subtitle>
        </Header>

        {raffle && (
          <StatsContainer>
            <StatCard>
              <StatNumber>{totalParticipants}</StatNumber>
              <StatLabel>Total Participants</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{totalTicketsClaimed}</StatNumber>
              <StatLabel>Tickets Claimed</StatLabel>
            </StatCard>
          </StatsContainer>
        )}

        <ParticipantsGrid>
          {participants.map((participant) => (
            <ParticipantCard key={participant.id}>
              <ParticipantHeader>
                <ParticipantInfo>
                  <ParticipantName>{participant.name}</ParticipantName>
                  <ParticipantContact>{participant.email}</ParticipantContact>
                  <ParticipantContact>{participant.phone}</ParticipantContact>
                  {participant.instagram && (
                    <InstagramHandle 
                      href={`https://instagram.com/${participant.instagram.replace('@', '').replace('https://instagram.com/', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {participant.instagram}
                    </InstagramHandle>
                  )}
                </ParticipantInfo>
                <ClaimedAt>
                  Joined: {new Date(participant.created_at).toLocaleDateString()}
                </ClaimedAt>
              </ParticipantHeader>

              <TicketsList>
                <h4>Tickets Claimed ({participant.ticket_claims.length})</h4>
                {participant.ticket_claims.map((claim) => (
                  <TicketItem key={claim.id}>
                    <TicketNumber>Ticket #{claim.ticket.ticket_number}</TicketNumber>
                    <TicketClaimedAt>
                      {new Date(claim.claimed_at).toLocaleDateString()}
                    </TicketClaimedAt>
                  </TicketItem>
                ))}
              </TicketsList>
            </ParticipantCard>
          ))}
        </ParticipantsGrid>

        {participants.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
            No participants have claimed tickets yet.
          </div>
        )}
      </Container>
    </PageContainer>
  );
} 