import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

interface Raffle {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_tickets: number;
  status: 'draft' | 'active' | 'ended';
  created_at: string;
}

export default function RafflesAdmin() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activatingRaffle, setActivatingRaffle] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRaffles = async () => {
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

        // Fetch raffles
        const { data, error: fetchError } = await supabase
          .from('raffles')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setRaffles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, [router, supabase]);

  const getStatusColor = (status: Raffle['status']) => {
    switch (status) {
      case 'draft':
        return '#e0e0e0';
      case 'active':
        return '#4CAF50';
      case 'ended':
        return '#f44336';
      default:
        return '#e0e0e0';
    }
  };

  const activateRaffle = async (raffleId: string) => {
    setActivatingRaffle(raffleId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/raffles/${raffleId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate raffle');
      }

      // Refresh the raffles list
      const { data, error: fetchError } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRaffles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActivatingRaffle(null);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark" width="medium">
        <LoadingMessage>Loading raffles...</LoadingMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark" width="medium">
      <BackButton onClick={() => router.push('/admin')}>
        ← Back to Admin Dashboard
      </BackButton>

      <Header>
        <Title>Manage Raffles</Title>
        <CreateButton onClick={() => router.push('/admin/raffles/create')}>
          Create New Raffle
        </CreateButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {raffles.length === 0 ? (
        <EmptyState>
          <EmptyStateText>No raffles found</EmptyStateText>
          <EmptyStateSubtext>Create your first raffle to get started</EmptyStateSubtext>
        </EmptyState>
      ) : (
        <RaffleGrid>
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id}>
              <RaffleHeader>
                <RaffleName>{raffle.name}</RaffleName>
                <StatusBadge style={{ backgroundColor: getStatusColor(raffle.status) }}>
                  {raffle.status}
                </StatusBadge>
              </RaffleHeader>
              
              <RaffleDescription>{raffle.description}</RaffleDescription>
              
              <RaffleDetails>
                <Detail>
                  <Label>Start Date</Label>
                  <Value>
                    {new Date(raffle.start_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Value>
                </Detail>
                <Detail>
                  <Label>End Date</Label>
                  <Value>
                    {new Date(raffle.end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Value>
                </Detail>
                <Detail>
                  <Label>Max Tickets</Label>
                  <Value>{raffle.max_tickets}</Value>
                </Detail>
              </RaffleDetails>

              <ButtonGroup>
                <Button onClick={() => router.push(`/admin/raffles/${raffle.id}`)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => router.push(`/admin/raffles/${raffle.id}/tickets`)}>
                  View Tickets
                </Button>
                {raffle.status === 'draft' && (
                  <Button 
                    variant="success" 
                    onClick={() => activateRaffle(raffle.id)}
                    disabled={activatingRaffle === raffle.id}
                  >
                    {activatingRaffle === raffle.id ? 'Activating...' : 'Activate'}
                  </Button>
                )}
              </ButtonGroup>
            </RaffleCard>
          ))}
        </RaffleGrid>
      )}
    </PageContainer>
  );
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #ffd700;
  font-family: var(--font-decorative);
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #2a2a2a;
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;

  &:hover {
    background: #3a3a3a;
    transform: translateY(-2px);
  }
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: #ffd700;
  color: #121212;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #e0e0e0;
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
  background: rgba(255, 215, 0, 0.1);
  border-radius: 24px;
`;

const EmptyStateText = styled.h2`
  font-size: 1.5rem;
  color: #ffd700;
  margin-bottom: 8px;
  font-family: var(--font-decorative);
`;

const EmptyStateSubtext = styled.p`
  color: #e0e0e0;
  font-size: 1.1rem;
`;

const RaffleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const RaffleCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RaffleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const RaffleName = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  color: #121212;
`;

const RaffleDescription = styled.p`
  color: #e0e0e0;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
`;

const RaffleDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
`;

const Detail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  color: #e0e0e0;
  font-size: 0.8rem;
`;

const Value = styled.span`
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
`;

const Button = styled.button<{ variant?: 'secondary' | 'success' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  flex: 1;
  background: ${({ variant }) => {
    if (variant === 'secondary') return 'transparent';
    if (variant === 'success') return '#4CAF50';
    return '#ffd700';
  }};
  color: ${({ variant }) => {
    if (variant === 'secondary') return '#e0e0e0';
    if (variant === 'success') return '#ffffff';
    return '#121212';
  }};
  border: ${({ variant }) => variant === 'secondary' ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`; 