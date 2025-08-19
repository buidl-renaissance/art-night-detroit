import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

const UnsubscribeContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant, theme }) => 
    variant === 'secondary' 
      ? 'transparent' 
      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`
  };
  color: ${({ variant, theme }) => 
    variant === 'secondary' 
      ? theme.colors.primary 
      : 'white'
  };
  border: ${({ variant, theme }) => 
    variant === 'secondary' 
      ? `2px solid ${theme.colors.primary}` 
      : 'none'
  };
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  background: ${({ type }) => 
    type === 'success' 
      ? 'linear-gradient(135deg, #10b981, #059669)' 
      : 'linear-gradient(135deg, #ef4444, #dc2626)'
  };
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  margin: 2rem 0;
  font-weight: 600;
`;

export default function Unsubscribe() {
  const router = useRouter();
  const { email } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) return;

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/unsubscribe-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('You have been successfully unsubscribed from our emails.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer theme="dark" width="medium">
      <UnsubscribeContainer>
        <Title>Unsubscribe from Cultural Banking</Title>
        
        {email ? (
          <>
            <Description>
              Are you sure you want to unsubscribe <strong>{email}</strong> from receiving updates about the cultural central bank?
            </Description>
            
            {status === 'idle' && (
              <div>
                <Button onClick={handleUnsubscribe} disabled={isLoading}>
                  {isLoading ? 'Unsubscribing...' : 'Yes, Unsubscribe'}
                </Button>
                <Button variant="secondary" onClick={() => router.push('/bank')}>
                  Keep My Subscription
                </Button>
              </div>
            )}
            
            {status !== 'idle' && (
              <Message type={status}>
                {message}
              </Message>
            )}
            
            {status === 'success' && (
              <Button variant="secondary" onClick={() => router.push('/')}>
                Return to Home
              </Button>
            )}
          </>
        ) : (
          <Description>
            No email address provided. Please check your unsubscribe link.
          </Description>
        )}
      </UnsubscribeContainer>
    </PageContainer>
  );
}
