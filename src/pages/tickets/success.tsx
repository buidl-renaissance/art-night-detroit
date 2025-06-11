import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

const SuccessContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.colors.text.light};
  }

  .ticket-count {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin: 1rem 0;
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }
`;

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const { session_id } = router.query;
        if (!session_id) {
          throw new Error('No session ID found');
        }

        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        // Create tickets
        const response = await fetch('/api/create-tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            sessionId: session_id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create tickets');
        }

        const { ticketCount } = await response.json();
        setTicketCount(ticketCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      handleSuccess();
    }
  }, [router.isReady, router.query]);

  if (loading) {
    return (
      <PageContainer theme="dark">
        <SuccessContainer>
          <h1>Processing your purchase...</h1>
          <p>Please wait while we create your tickets.</p>
        </SuccessContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer theme="dark">
        <SuccessContainer>
          <h1>Error</h1>
          <p>{error}</p>
          <Button onClick={() => router.push('/tickets/checkout')}>
            Try Again
          </Button>
        </SuccessContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <SuccessContainer>
        <h1>Purchase Successful!</h1>
        <p>Thank you for your purchase. Your tickets have been created.</p>
        {ticketCount && (
          <div className="ticket-count">
            {ticketCount} ticket{ticketCount > 1 ? 's' : ''} added to your account
          </div>
        )}
        <Button onClick={() => router.push('/dashboard')}>
          View My Tickets
        </Button>
      </SuccessContainer>
    </PageContainer>
  );
} 