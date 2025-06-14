import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
  total_amount: number;
  user_id: string;
  user: {
    email: string;
  };
  tickets: {
    id: string;
    raffle: {
      name: string;
    };
  }[];
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Check if user is admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // const { data: profile } = await supabase
        //   .from('profiles')
        //   .select('is_admin')
        //   .eq('id', session.user.id)
        //   .single();

        // if (!profile?.is_admin) {
        //   router.push('/');
        //   return;
        // }

        // Fetch orders with related data
        const { data, error: fetchError } = await supabase
          .from('ticket_orders')
          .select(`
            *,
            user:user_id (
              email
            ),
            tickets (
              id,
              raffle:raffle_id (
                name
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router, supabase]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#ffd700';
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#f44336';
      default:
        return '#e0e0e0';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents to dollars
  };

  if (loading) {
    return (
      <PageContainer theme="dark" width="medium">
        <LoadingMessage>Loading orders...</LoadingMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark" width="medium">
      <Header>
        <Title>Manage Orders</Title>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {orders.length === 0 ? (
        <EmptyState>
          <EmptyStateText>No orders found</EmptyStateText>
          <EmptyStateSubtext>Orders will appear here when customers make purchases</EmptyStateSubtext>
        </EmptyState>
      ) : (
        <OrderGrid>
          {orders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderId>Order #{order.id.slice(0, 8)}</OrderId>
                <StatusBadge style={{ backgroundColor: getStatusColor(order.status) }}>
                  {order.status}
                </StatusBadge>
              </OrderHeader>
              
              <OrderDetails>
                <Detail>
                  <Label>Customer</Label>
                  <Value>{order.user?.email || 'Unknown'}</Value>
                </Detail>
                <Detail>
                  <Label>Date</Label>
                  <Value>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Value>
                </Detail>
                <Detail>
                  <Label>Amount</Label>
                  <Value>{formatCurrency(order.total_amount)}</Value>
                </Detail>
              </OrderDetails>

              <TicketsSection>
                <Label>Tickets</Label>
                <TicketList>
                  {order.tickets.map((ticket) => (
                    <TicketItem key={ticket.id}>
                      {ticket.raffle.name}
                    </TicketItem>
                  ))}
                </TicketList>
              </TicketsSection>

              <ButtonGroup>
                <Button onClick={() => router.push(`/admin/orders/${order.id}`)}>
                  View Details
                </Button>
              </ButtonGroup>
            </OrderCard>
          ))}
        </OrderGrid>
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

const OrderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const OrderCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const OrderId = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  color: #121212;
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const Detail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Value = styled.span`
  color: #ffffff;
  font-size: 1rem;
`;

const TicketsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TicketItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #ffd700;
  color: #121212;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  flex: 1;

  &:hover {
    opacity: 0.9;
  }
`; 