import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import RaffleCountdown from '@/components/RaffleCountdown';

interface RaffleTicket {
  id: string;
  event_id: string;
  event_name: string;
  ticket_number: number;
  created_at: string;
}

interface UnusedTicket {
  id: string;
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

// Header Components
const DashboardHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
  font-family: var(--font-decorative);
`;

const TicketCount = styled.div`
  font-size: 1.4rem;
  color: #FFD700;
  font-weight: 600;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &::before {
    content: "🎟️";
    font-size: 1.6rem;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
  font-family: var(--font-decorative);
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.light};
`;

// Raffle Grid Components
const RaffleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const RaffleCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
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
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`;

const RaffleDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const EnterRaffleButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background.primary};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

// Modal Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Ticket Components
const TicketList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const TicketItem = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const TicketNumber = styled.div`
  font-family: monospace;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const TicketDate = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.light};
`;

// Empty State Components
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 24px;
  margin-bottom: 40px;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
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

// Loading State
const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.2rem;
  padding: 40px;
`;

export default function Dashboard() {
  const [, setTickets] = useState<RaffleTicket[]>([]);
  const [unusedTickets, setUnusedTickets] = useState<UnusedTicket[]>([]);
  const [availableRaffles, setAvailableRaffles] = useState<AvailableRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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

      // Fetch unused tickets
      const { data: unusedTicketsData, error: unusedTicketsError } = await supabase
        .from('tickets')
        .select('id, ticket_number, created_at')
        .eq('user_id', session.user.id)
        .is('raffle_id', null)
        .order('created_at', { ascending: false });

      if (unusedTicketsError) {
        console.error('Error fetching unused tickets:', unusedTicketsError);
      } else {
        setUnusedTickets(unusedTicketsData || []);
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

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Your Ticket Numbers</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <TicketList>
              {unusedTickets.map((ticket) => (
                <TicketItem key={ticket.id}>
                  <TicketNumber>#{ticket.ticket_number}</TicketNumber>
                  <TicketDate>
                    {new Date(ticket.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TicketDate>
                </TicketItem>
              ))}
            </TicketList>
          </ModalContent>
        </Modal>
      )}

      <DashboardHeader>
        <Title>Your Raffle Tickets</Title>
        <TicketCount>{unusedTickets.length} Tickets Available</TicketCount>
      </DashboardHeader>

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
              </RaffleHeader>
              
              <RaffleDescription>{raffle.description}</RaffleDescription>
              
              <RaffleCountdown endDate={raffle.end_date} label="Raffle Ends" />
              
              <EnterRaffleButton onClick={(e) => {
                e.stopPropagation();
                router.push(`/raffles/${raffle.id}`);
              }}>
                Enter Raffle
              </EnterRaffleButton>
            </RaffleCard>
          ))}
        </RaffleGrid>
      )}
    </PageContainer>
  );
} 