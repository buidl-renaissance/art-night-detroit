import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';
import RaffleCountdown from '@/components/RaffleCountdown';
import { ParticipantFormData } from '@/types/participants';

interface Raffle {
  id: string;
  name: string;
  description: string;
  end_date: string;
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
    padding: 0rem;
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
  margin-bottom: 0rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.8rem;
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
    
    // Load saved form data from localStorage
    loadFormDataFromStorage();
  }, [id, sessionCode]);

  const getStorageKey = () => {
    return `raffle-claim-form-${id}-${sessionCode}`;
  };

  const loadFormDataFromStorage = () => {
    try {
      // Only load if we have both id and sessionCode
      if (!id || !sessionCode) return;
      
      const storageKey = getStorageKey();
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    }
  };

  const saveFormDataToStorage = (data: ParticipantFormData) => {
    try {
      // Only save if we have both id and sessionCode
      if (!id || !sessionCode) return;
      
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  };

  const clearFormDataFromStorage = () => {
    try {
      // Only clear if we have both id and sessionCode
      if (!id || !sessionCode) return;
      
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing form data from localStorage:', error);
    }
  };

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ParticipantFormData, value: string) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    setFormData(updatedData);
    saveFormDataToStorage(updatedData);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    const updatedData = {
      ...formData,
      phone: formatted
    };
    setFormData(updatedData);
    saveFormDataToStorage(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate phone number format
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setSubmitting(false);
      return;
    }

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

      // Clear form data from localStorage on successful submission
      clearFormDataFromStorage();
      
      // Redirect to success page immediately
      router.push(`/raffles/${id}/claim/${sessionCode}/success`);
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



  return (
    <PageContainer theme="dark">
      <Container>

        {session && raffle && (
          <>
            <RaffleCountdown endDate={raffle.end_date} raffleName={raffle.name} />
          </>
        )}

        <Form onSubmit={handleSubmit}>
        <Header>
          <Title>Claim Your Tickets</Title>
          <Subtitle>Enter your information to claim your tickets</Subtitle>
          <p>Session Code: {session?.session_code || 'N/A'}</p>
        </Header>

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
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
              maxLength={14}
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