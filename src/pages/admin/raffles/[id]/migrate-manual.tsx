import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 400px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  resize: vertical;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.text.light};
    cursor: not-allowed;
  }
`;

const Results = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const SuccessCount = styled.div`
  color: #4CAF50;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ErrorCount = styled.div`
  color: #f44336;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ResultItem = styled.div<{ success: boolean }>`
  padding: 0.5rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  background: ${({ success }) => 
    success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
  };
  border-left: 4px solid ${({ success }) => 
    success ? '#4CAF50' : '#f44336'
  };
`;

const Error = styled.div`
  color: #f44336;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
  border-left: 4px solid #f44336;
`;

const Loading = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  text-align: center;
  margin: 2rem 0;
`;

const SampleData = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SampleTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SampleText = styled.pre`
  font-family: monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.light};
  white-space: pre-wrap;
  margin: 0;
`;

export default function MigrateManualEntries() {
  const router = useRouter();
  const { id: raffleId } = router.query;
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
    results: Array<{
      success: boolean;
      entry: { ticket_number: number; name: string; email: string; artist: string; payment: string };
      ticket_number?: number;
      participant_id?: string;
      ticket_id?: string;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Sample data from the paper sheet
  const sampleData = `Raffle #,Name,Email,Artist,Payment
1,Michael F,Afluker319@gmail,DARKLORD ESCADA,Cash
2,Phil Dean,DPhil1786@gmail,Molly Anna,Cash
3,Ian Herdegen,ian.herdegen@gmail,DARKLORD ESCADA,Venmo
4,Hema,hema.lakshmi18@gmail.com,DARKLORD ESCADA,Venmo
5,Ethan Hedeen,ethan.j.hedeen@gmail.com,DARKLORD ESCADA,Paypal
6,Steve Burrows,rsburrows@me.com,DARKLORD ESCADA,Venmo
7,Sabrina Melo,sabrinamelo@gmail.com,Molly Anna,Cash
8,Laurence Turvell,laurenceturvell@yahoo.com,Daniel Geanes,Venmo
9,Dew G Sloan,cjsloan4@ford.com,Molly Anna,Cash
10,KETO GREEN,ketogreen6@gmail.com,Molly Anna,CashApp
11,KETO GREEN,ketogreen6@gmail.com,Daniel Geanes,CashApp
12,KETO GREEN,ketogreen6@gmail.com,Daniel Geanes,CashApp
13,Joseph Eckel,josephekel@hotmail.com,DARKLORD ESCADA,Cash
14,Philip Carrel,philipcarrel@gmail.com,DARKLORD ESCADA,Cash
15,Neena Wang,neenawang@gmail.com,Daniel Geanes,Venmo
16,Zina Smith,detroitstylistcrew@gmail.com,DARKLORD ESCADA,Venmo
17,Daniel Blonk,danielblonkcreator@gmail.com,DARKLORD ESCADA,CashApp
18,Loris Belaich,loris.belaich@gmail.com,Daniel Geanes,Cash
19,Samantha McGreir,smcgreir9@gmail.com,DARKLORD ESCADA,Cash
20,Dani Dillard,danidillard@gmail.com,Molly Anna,Cash
21,Milan Atkins,milanarelmusic@gmail.com,DARKLORD ESCADA,Cash
22,Cathy,cashfornara@icloud.com,Daniel Geanes,Venmo
23,Dane Switzer,switzerdane@gmail.com,Daniel Geanes,Cash
24,Dane Switzer,switzerdane@gmail.com,Daniel Geanes,Cash
25,Elton Pinto,elton.pinto02@gmail.com,Daniel Geanes,Cash
26,Matthew S,mathew.mail@gmail.com,Daniel Geanes,Cash`;

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    const entries = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const entry = {
        ticket_number: parseInt(values[0]?.trim() || '0'),
        name: values[1]?.trim() || '',
        email: values[2]?.trim() || '',
        artist: values[3]?.trim() || '',
        payment: values[4]?.trim() || ''
      };
      
      if (entry.name && entry.email && entry.artist && entry.ticket_number > 0) {
        entries.push(entry);
      }
    }

    return entries;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Check if user is admin
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
        router.push('/');
        return;
      }

      const entries = parseCSV(csvData);
      
      if (entries.length === 0) {
        setError('No valid entries found in the CSV data');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/raffles/${raffleId}/migrate-manual-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ entries })
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result?.error || 'Failed to migrate entries';
        throw { message: errorMessage };
      }

      setResults(result as typeof results);
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
      if (err instanceof Error) {
        errorMessage = (err as Error).message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        try {
          errorMessage = String(err);
        } catch {
          errorMessage = 'An error occurred';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setCsvData(sampleData);
  };

  if (!raffleId) {
    return (
      <PageContainer theme="dark">
        <Container>
          <Error>Raffle ID not found</Error>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <Container>
        <Header>
          <Title>Migrate Manual Entries</Title>
          <Description>
            Upload manual entries from the paper sheet to migrate them into the database.
            The first column should be the ticket number, followed by name, email, artist, and payment method.
            Paste the CSV data below, including the header row.
          </Description>
        </Header>

        <SampleData>
          <SampleTitle>Sample Data Format (Ticket #, Name, Email, Artist, Payment):</SampleTitle>
          <SampleText>{sampleData}</SampleText>
          <Button type="button" onClick={handleLoadSample} style={{ marginTop: '1rem' }}>
            Load Sample Data
          </Button>
        </SampleData>

        <Form onSubmit={handleSubmit}>
          <TextArea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Paste CSV data here..."
            required
          />
          <Button type="submit" disabled={loading || !csvData.trim()}>
            {loading ? 'Migrating...' : 'Migrate Entries'}
          </Button>
        </Form>

        {error && <Error>{error}</Error>}

        {loading && <Loading>Processing entries...</Loading>}

        {results && (
          <Results>
            <SuccessCount>
              ✅ Successfully migrated: {results.summary.successful} entries
            </SuccessCount>
            <ErrorCount>
              ❌ Failed: {results.summary.failed} entries
            </ErrorCount>
            
            {results.results.map((result, index: number) => (
              <ResultItem key={index} success={result.success}>
                {result.success ? (
                  <>
                    <strong>✅ {result.entry.name}</strong> - Ticket #{result.ticket_number} for {result.entry.artist}
                  </>
                ) : (
                  <>
                    <strong>❌ {result.entry.name}</strong> - {result.error}
                  </>
                )}
              </ResultItem>
            ))}
          </Results>
        )}
      </Container>
    </PageContainer>
  );
}
