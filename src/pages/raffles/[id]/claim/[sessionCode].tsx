import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';
import { ParticipantFormData } from '@/types/participants';

interface Raffle {
  id: string;
  name: string;
  description: string;
}

interface QRCodeSession {
  id: string;
  raffle_id: string;
  ticket_count: number;
  session_code: string;
  is_active: boolean;
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 1rem;
    margin: 0;
  }
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
  margin-bottom: 1rem;
`;

const Form = styled.form`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 2rem;
  border-radius: 12px;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.text.light};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #4CAF50;
  margin-top: 1rem;
  text-align: center;
  text-align: center;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
`;

const SessionInfo = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
`;

export default function ClaimTickets() {
  const router = useRouter();
  const { id, sessionCode } = router.query;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [session, setSession] = useState<QRCodeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ParticipantFormData>({
    name: '',
    phone: '',
    email: '',
    instagram: ''
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id && sessionCode) {
      fetchSessionData();
    }
  }, [id, sessionCode]);

  const fetchSessionData = async () => {
    try {
      // Fetch QR code session
      const { data: sessionData, error: sessionError } = await supabase
        .from('qr_code_sessions')
        .select('*')
        .eq('session_code', sessionCode)
        .eq('is_active', true)
        .single();

      if (sessionError) throw sessionError;

      setSession(sessionData);

      // Fetch raffle details
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', sessionData.raffle_id)
        .single();

      if (raffleError) throw raffleError;
      setRaffle(raffleData);

      // Check if there are enough available tickets
      const { data: availableTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id')
        .eq('raffle_id', sessionData.raffle_id)
        .is('user_id', null);

      if (ticketsError) throw ticketsError;

      if (availableTickets.length < sessionData.ticket_count) {
        throw new Error('Not enough tickets available for this session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ParticipantFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/raffles/${id}/claim-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionCode,
          participantData: formData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to claim tickets');
      }

      setSuccess(`Successfully claimed ${session!.ticket_count} ticket(s)! You will receive a confirmation email shortly.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while claiming tickets');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <Container>
          <LoadingMessage>Loading...</LoadingMessage>
        </Container>
      </PageContainer>
    );
  }

  if (error && !session) {
    return (
      <PageContainer theme="dark">
        <Container>
          <ErrorMessage>{error}</ErrorMessage>
        </Container>
      </PageContainer>
    );
  }

  if (success) {
    return (
      <PageContainer theme="dark">
        <Container>
          <Header>
            <Title>🎉 Tickets Claimed!</Title>
            <Subtitle>Thank you for participating!</Subtitle>
          </Header>
          <SuccessMessage>{success}</SuccessMessage>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <Container>
        <Header>
          <Title>Claim Your Tickets</Title>
          <Subtitle>Enter your information to claim your tickets</Subtitle>
        </Header>

        {session && raffle && (
          <SessionInfo>
            <h3>{raffle.name}</h3>
            <p>Tickets Available: {session.ticket_count}</p>
            <p>Session Code: {session.session_code}</p>
          </SessionInfo>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="instagram">Instagram Handle (Optional)</Label>
            <Input
              id="instagram"
              type="text"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@username"
            />
          </FormGroup>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Claiming Tickets...' : `Claim ${session?.ticket_count || 0} Ticket(s)`}
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </PageContainer>
  );
} 