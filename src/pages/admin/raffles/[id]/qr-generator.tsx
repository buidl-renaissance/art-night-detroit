import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';
import QRCode from 'react-qr-code';
import QuantityControls from '@/components/QuantityControls';

interface Raffle {
  id: string;
  name: string;
  description: string;
  status: string;
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
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

const ResetButton = styled(Button)`
  background: ${({ theme }) => theme.colors.text.light};
  margin-top: 2rem;
  width: auto;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const QRCodeWrapper = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SessionInfo = styled.div`
  text-align: center;
  margin-top: 1rem;
`;

const SessionCode = styled.div`
  font-family: monospace;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  margin: 0.5rem 0;
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
`;

export default function QRGenerator() {
  const router = useRouter();
  const { id } = router.query;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdmin = async () => {
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
        router.push('/dashboard');
        return;
      }

      if (id) {
        fetchRaffle();
      }
    };

    if (router.isReady) {
      checkAdmin();
    }
  }, [router.isReady, id]);

  const fetchRaffle = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRaffle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Generate a unique session code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create QR code session
      const { error: qrError } = await supabase
        .from('qr_code_sessions')
        .insert({
          raffle_id: id,
          admin_id: session.user.id,
          ticket_count: ticketCount,
          session_code: code
        });

      if (qrError) throw qrError;

      setSessionCode(code);
      setQrUrl(`${window.location.origin}/raffles/${id}/claim/${code}`);
      setSuccess(`QR code generated successfully! Session code: ${code}`);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTicketCount(1);
    setSessionCode(null);
    setQrUrl(null);
    setSuccess(null);
    setError(null);
    setHasGenerated(false);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setTicketCount(newQuantity);
    // Clear QR code when quantity changes
    if (sessionCode || qrUrl || success) {
      setSessionCode(null);
      setQrUrl(null);
      setSuccess(null);
      setHasGenerated(false);
    }
  };

  if (!raffle) {
    return (
      <PageContainer theme="dark">
        <Container>
          <p>Loading...</p>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <Container>
        <Header>
          <Title>{raffle.name}</Title>
          <Subtitle>Generate QR codes for ticket distribution</Subtitle>
        </Header>

        <FormGroup>
          <div style={{ textAlign: 'center' }}>
            <Label htmlFor="ticketCount">Number of Tickets</Label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <QuantityControls
              quantity={ticketCount}
              min={1}
              max={100}
              onChange={handleQuantityChange}
            />
          </div>
        </FormGroup>

        <Button onClick={generateQRCode} disabled={loading}>
          {loading ? 'Generating...' : 'Generate QR Code'}
        </Button>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {hasGenerated && sessionCode && qrUrl && success && (
          <QRContainer>
            <h3>Scan this QR code to claim tickets</h3>
            <QRCodeWrapper>
              <QRCode value={qrUrl} size={256} />
            </QRCodeWrapper>
            <SessionInfo>
              <p>Session Code: <SessionCode>{sessionCode}</SessionCode></p>
              <p>Tickets Available: {ticketCount}</p>
            </SessionInfo>
          </QRContainer>
        )}

        {(sessionCode || success) && (
          <div style={{ textAlign: 'center' }}>
            <ResetButton type="button" onClick={resetForm}>
              Reset Form
            </ResetButton>
          </div>
        )}
      </Container>
    </PageContainer>
  );
} 