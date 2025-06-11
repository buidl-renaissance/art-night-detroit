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

interface AvailableRaffle {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_tickets: number;
  tickets_sold: number;
  status: 'draft' | 'active' | 'ended';
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [availableRaffles, setAvailableRaffles] = useState<AvailableRaffle[]>([]);
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
      const { data: ticketsData, error: ticketsError } = await supabase
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

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
      } else {
        // Type assertion to handle the nested events object
        const typedData = ticketsData as unknown as RaffleTicketWithEvent[];
        setTickets(typedData.map(ticket => ({
          id: ticket.id,
          event_id: ticket.event_id,
          event_name: ticket.events.name,
          ticket_number: ticket.ticket_number,
          created_at: ticket.created_at
        })));
      }

      // Fetch available raffles
      const { data: rafflesData, error: rafflesError } = await supabase
        .from('raffles')
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          max_tickets,
          status
        `)
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      if (rafflesError) {
        console.error('Error fetching raffles:', rafflesError);
      } else {
        // Get ticket counts for each raffle
        const rafflesWithTickets = await Promise.all(
          rafflesData.map(async (raffle) => {
            const { count } = await supabase
              .from('tickets')
              .select('*', { count: 'exact', head: true })
              .eq('raffle_id', raffle.id);
            
            return {
              ...raffle,
              tickets_sold: count || 0
            };
          })
        );
        
        setAvailableRaffles(rafflesWithTickets);
      }

      setLoading(false);
    };

    checkSession();
  }, [router, supabase]);

  if (loading) {
    return (
      <PageContainer theme="dark" width="medium">
        <LoadingMessage>Loading your dashboard...</LoadingMessage>
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
          <EmptyStateSubtext>Check out our available raffles below to get started!</EmptyStateSubtext>
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

      <SectionHeader>
        <SectionTitle>Available Raffles</SectionTitle>
        <SectionSubtitle>Enter these raffles for a chance to win!</SectionSubtitle>
      </SectionHeader>

      {availableRaffles.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🎲</EmptyStateIcon>
          <EmptyStateText>No active raffles at the moment</EmptyStateText>
          <EmptyStateSubtext>Check back soon for new opportunities!</EmptyStateSubtext>
        </EmptyState>
      ) : (
        <RaffleGrid>
          {availableRaffles.map((raffle) => (
            <RaffleCard key={raffle.id} onClick={() => router.push(`/raffles/${raffle.id}`)}>
              <RaffleHeader>
                <RaffleName>{raffle.name}</RaffleName>
                <TicketCount>
                  {raffle.tickets_sold} / {raffle.max_tickets} tickets sold
                </TicketCount>
              </RaffleHeader>
              
              <RaffleDescription>{raffle.description}</RaffleDescription>
              
              <RaffleDetails>
                <Detail>
                  <Label>Ends</Label>
                  <Value>
                    {new Date(raffle.end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Value>
                </Detail>
                <Detail>
                  <Label>Remaining</Label>
                  <Value>{raffle.max_tickets - raffle.tickets_sold}</Value>
                </Detail>
              </RaffleDetails>

              <EnterButton>Enter Raffle</EnterButton>
            </RaffleCard>
          ))}
        </RaffleGrid>
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
  margin-bottom: 40px;
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
  margin-bottom: 40px;
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

const SectionHeader = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 8px;
  font-family: var(--font-decorative);
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #e0e0e0;
`;

const RaffleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const RaffleCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const RaffleHeader = styled.div`
  margin-bottom: 16px;
`;

const RaffleName = styled.h3`
  font-size: 1.4rem;
  color: #ffffff;
  margin-bottom: 8px;
`;

const RaffleDescription = styled.p`
  color: #e0e0e0;
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const RaffleDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const Detail = styled.div`
  background: rgba(255, 215, 0, 0.05);
  padding: 12px;
  border-radius: 8px;
`;

const Label = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

const Value = styled.div`
  color: #ffd700;
  font-size: 1.1rem;
  font-weight: 600;
`;

const EnterButton = styled.button`
  width: 100%;
  background: #ffd700;
  color: #121212;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #ffed4a;
  }
`; 