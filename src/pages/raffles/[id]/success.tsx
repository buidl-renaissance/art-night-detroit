import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

const SuccessContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0rem;
  color: ${({ theme }) => theme.colors.text.primary};

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    line-height: 1.6;
  }
`;

const SuccessMessage = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const TicketList = styled.div`
  margin-top: 2rem;
`;

const TicketItem = styled.div`
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.light};
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Array<{ ticket_number: number }>>([]);
  const router = useRouter();
  const { id: raffleId, session_id } = router.query;
  const supabase = createClientComponentClient();

  useEffect(() => {
    const processPayment = async () => {
      if (!raffleId || !session_id) return;

      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        // Verify the payment and create tickets
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            raffleId,
            sessionId: session_id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to verify payment');
        }

        const { tickets: newTickets } = await response.json();
        setTickets(newTickets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [raffleId, session_id, supabase]);

  if (loading) {
    return (
      <PageContainer theme="dark">
        <SuccessContainer>
          <LoadingMessage>Processing your payment...</LoadingMessage>
        </SuccessContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer theme="dark">
        <SuccessContainer>
          <ErrorMessage>
            <h2>Error</h2>
            <p>{error}</p>
          </ErrorMessage>
        </SuccessContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <SuccessContainer>
        <SuccessMessage>
          <h1>Payment Successful!</h1>
          <p>Thank you for your purchase. Your tickets have been created.</p>
        </SuccessMessage>

        <TicketList>
          <h2>Your Tickets</h2>
          {tickets.map((ticket) => (
            <TicketItem key={ticket.ticket_number}>
              <p>Ticket #{ticket.ticket_number}</p>
            </TicketItem>
          ))}
        </TicketList>
      </SuccessContainer>
    </PageContainer>
  );
} 