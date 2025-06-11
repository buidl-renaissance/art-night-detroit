import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

interface RaffleTicket {
  id: string;
  event_id: string;
  event_name: string;
  ticket_number: number;
  created_at: string;
}

interface RaffleTicketWithEvent {
  id: string;
  event_id: string;
  events: {
    name: string;
  };
  ticket_number: number;
  created_at: string;
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch user's raffle tickets
      const { data, error } = await supabase
        .from('raffle_tickets')
        .select(`
          id,
          event_id,
          events (
            name
          ),
          ticket_number,
          created_at
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
      } else {
        // Type assertion to handle the nested events object
        const typedData = data as unknown as RaffleTicketWithEvent[];
        setTickets(typedData.map(ticket => ({
          id: ticket.id,
          event_id: ticket.event_id,
          event_name: ticket.events.name,
          ticket_number: ticket.ticket_number,
          created_at: ticket.created_at
        })));
      }
      setLoading(false);
    };

    checkSession();
  }, [router, supabase]);

  if (loading) {
    return (
      <PageContainer theme="dark" width="medium">
        <LoadingMessage>Loading your tickets...</LoadingMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark" width="medium">
      <DashboardHeader>
        <Title>Your Raffle Tickets</Title>
        <TicketCount>{tickets.length} Tickets</TicketCount>
      </DashboardHeader>

      {tickets.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🎟️</EmptyStateIcon>
          <EmptyStateText>You haven&apos;t entered any raffles yet</EmptyStateText>
          <EmptyStateSubtext>Check out our upcoming events to get started!</EmptyStateSubtext>
        </EmptyState>
      ) : (
        <TicketGrid>
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id}>
              <TicketNumber>#{ticket.ticket_number}</TicketNumber>
              <EventName>{ticket.event_name}</EventName>
              <TicketDate>
                {new Date(ticket.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </TicketDate>
            </TicketCard>
          ))}
        </TicketGrid>
      )}
    </PageContainer>
  );
}

const DashboardHeader = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #ffd700;
  margin-bottom: 8px;
  font-family: var(--font-decorative);
`;

const TicketCount = styled.div`
  font-size: 1.2rem;
  color: #e0e0e0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #e0e0e0;
  font-size: 1.2rem;
  padding: 40px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 24px;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
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

const TicketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const TicketCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const TicketNumber = styled.div`
  font-size: 2rem;
  color: #ffd700;
  font-family: var(--font-decorative);
  margin-bottom: 12px;
`;

const EventName = styled.h3`
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 8px;
`;

const TicketDate = styled.div`
  font-size: 0.9rem;
  color: #e0e0e0;
`; 