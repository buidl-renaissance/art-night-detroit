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
}

interface TicketResponse {
  id: string;
  ticket_number: number;
  user_id: string;
  created_at: string;
  email: string;
  full_name: string | null;
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

        // Fetch tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .rpc('get_tickets_with_profiles', { raffle_id: id });

        if (ticketsError) throw ticketsError;
        
        // Type assertion to handle the nested user object
        const typedTickets = ticketsData as unknown as TicketResponse[];
        setTickets(typedTickets);
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
            <StatLabel>Total Tickets</StatLabel>
            <StatValue>{tickets.length}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Max Tickets</StatLabel>
            <StatValue>{raffle.max_tickets}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>Remaining</StatLabel>
            <StatValue>{raffle.max_tickets - tickets.length}</StatValue>
          </Stat>
        </Stats>
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
              <Th>Ticket #</Th>
              <Th>Purchased By</Th>
              <Th>Email</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <Td>#{ticket.ticket_number}</Td>
                <Td>{ticket.full_name || 'Anonymous'}</Td>
                <Td>{ticket.email}</Td>
                <Td>
                  {new Date(ticket.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
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
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #ffd700;
  font-family: var(--font-decorative);
  margin-bottom: 1.5rem;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Stat = styled.div`
  background: rgba(255, 215, 0, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
`;

const StatLabel = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  color: #ffd700;
  font-size: 2rem;
  font-weight: 600;
  font-family: var(--font-decorative);
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
  margin-bottom: 2rem;
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

const TicketTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  color: #ffd700;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
`;

const Td = styled.td`
  padding: 1rem;
  color: #e0e0e0;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  background: ${({ variant }) => variant === 'secondary' ? 'transparent' : '#ffd700'};
  color: ${({ variant }) => variant === 'secondary' ? '#e0e0e0' : '#121212'};
  border: ${({ variant }) => variant === 'secondary' ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'};

  &:hover {
    opacity: 0.9;
  }
`; 