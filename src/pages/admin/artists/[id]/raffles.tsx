import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import PageContainer from '@/components/PageContainer';

interface Raffle {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface ArtistRaffle {
  raffle_id: string;
  artist_id: string;
  ticket_count: number;
}

const RafflesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1rem;
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

const RafflesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const RaffleCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const RaffleInfo = styled.div`
  padding: 1.5rem;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    font-weight: bold;
    background: ${({ theme }) => theme.colors.primary}33;
    color: ${({ theme }) => theme.colors.primary};
  }

  .ticket-count {
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const RaffleActions = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.colors.background.primary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled.button<{ variant?: 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme, variant }) => 
    variant === 'danger' ? '#dc2626' : theme.colors.primary};
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'danger' ? '#b91c1c' : theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

export default function ArtistRaffles() {
  const [artist, setArtist] = useState<{ id: string; name: string } | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [artistRaffles, setArtistRaffles] = useState<ArtistRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClientComponentClient();

  const fetchArtist = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [supabase, id]);

  const fetchRaffles = useCallback(async () => {
    try {
      // Fetch all active raffles
      const { data: rafflesData, error: rafflesError } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (rafflesError) throw rafflesError;
      setRaffles(rafflesData || []);

      // Fetch artist's raffles
      const { data: artistRafflesData, error: artistRafflesError } = await supabase
        .from('raffle_artists')
        .select('*')
        .eq('artist_id', id);

      if (artistRafflesError) throw artistRafflesError;
      setArtistRaffles(artistRafflesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [supabase, id]);

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
        fetchArtist();
        fetchRaffles();
      }
    };

    if (router.isReady) {
      checkAdmin();
    }
  }, [router.isReady, id, router, supabase, fetchArtist, fetchRaffles]);



  const handleAddToRaffle = async (raffleId: string) => {
    try {
      const { error } = await supabase
        .from('raffle_artists')
        .insert([{
          raffle_id: raffleId,
          artist_id: id,
          ticket_count: 0,
        }]);

      if (error) throw error;
      await fetchRaffles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRemoveFromRaffle = async (raffleId: string) => {
    if (!confirm('Are you sure you want to remove this artist from the raffle?')) return;

    try {
      const { error } = await supabase
        .from('raffle_artists')
        .delete()
        .eq('raffle_id', raffleId)
        .eq('artist_id', id);

      if (error) throw error;
      await fetchRaffles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <RafflesContainer>
          <p>Loading...</p>
        </RafflesContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <RafflesContainer>
        <Header>
          <h1>{artist?.name}&apos;s Raffles</h1>
          <AddButton onClick={() => router.push('/admin/raffles/new')}>
            Create New Raffle
          </AddButton>
        </Header>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        )}

        <RafflesGrid>
          {raffles.map((raffle) => {
            const artistRaffle = artistRaffles.find(ar => ar.raffle_id === raffle.id);
            const isInRaffle = !!artistRaffle;

            return (
              <RaffleCard key={raffle.id}>
                <RaffleInfo>
                  <h3>{raffle.name}</h3>
                  <p>{raffle.description}</p>
                  <span className="status">{raffle.status}</span>
                  {isInRaffle && (
                    <div className="ticket-count">
                      {artistRaffle.ticket_count} tickets
                    </div>
                  )}
                </RaffleInfo>
                <RaffleActions>
                  {isInRaffle ? (
                    <ActionButton 
                      variant="danger"
                      onClick={() => handleRemoveFromRaffle(raffle.id)}
                    >
                      Remove from Raffle
                    </ActionButton>
                  ) : (
                    <ActionButton onClick={() => handleAddToRaffle(raffle.id)}>
                      Add to Raffle
                    </ActionButton>
                  )}
                </RaffleActions>
              </RaffleCard>
            );
          })}
        </RafflesGrid>
      </RafflesContainer>
    </PageContainer>
  );
} 