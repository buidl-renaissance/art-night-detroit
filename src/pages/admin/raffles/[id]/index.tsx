import { useState, useEffect } from 'react';
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
  image_url?: string;
}

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  raffle_artist_id: string;
  ticket_count: number;
}

interface RaffleArtistResponse {
  id: string;
  ticket_count: number;
  artists: {
    id: string;
    name: string;
    bio: string;
    image_url: string;
  };
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

const RaffleContainer = styled.div`
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

const ActionButton = styled.button`
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

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.8rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ArtistImage = styled.div<{ imageUrl: string }>`
  height: 200px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
`;

const ArtistInfo = styled.div`
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

  .ticket-count {
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ArtistActions = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.colors.background.primary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button<{ variant?: 'danger' }>`
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

const RaffleInfo = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    line-height: 1.6;
    margin-bottom: 1rem;
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
`;

const EditForm = styled.form`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  max-width: 600px;
`;

const EditInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1.1rem;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EditTextarea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1.1rem;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 80px;
`;

const EditActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export default function RaffleAdmin() {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;
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
        fetchArtists();
      }
    };

    if (router.isReady) {
      checkAdmin();
    }
  }, [router.isReady, id]);

  useEffect(() => {
    if (raffle) {
      setEditName(raffle.name);
      setEditDescription(raffle.description);
      setEditStatus(raffle.status);
    }
  }, [raffle]);

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

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('raffle_artists')
        .select(`
          id,
          ticket_count,
          artists (
            id,
            name,
            bio,
            image_url
          )
        `)
        .eq('raffle_id', id) as { data: RaffleArtistResponse[] | null, error: SupabaseError | null };

      if (error) throw error;

      if (data) {
        const formattedArtists = data.map(ra => ({
          id: ra.artists.id,
          name: ra.artists.name,
          bio: ra.artists.bio,
          image_url: ra.artists.image_url,
          raffle_artist_id: ra.id,
          ticket_count: ra.ticket_count
        }));

        setArtists(formattedArtists);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleRemoveArtist = async (raffleArtistId: string) => {
    if (!confirm('Are you sure you want to remove this artist from the raffle?')) return;

    try {
      const { error } = await supabase
        .from('raffle_artists')
        .delete()
        .eq('id', raffleArtistId);

      if (error) throw error;
      await fetchArtists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const { error } = await supabase
        .from('raffles')
        .update({ name: editName, description: editDescription, status: editStatus })
        .eq('id', id);
      if (error) throw error;
      await fetchRaffle();
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update raffle');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <RaffleContainer>
          <p>Loading...</p>
        </RaffleContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <RaffleContainer>
        <Header>
          <h1>Raffle Management</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ActionButton onClick={() => setEditing(true)}>
              Edit
            </ActionButton>
            <ActionButton onClick={() => router.push(`/raffles/${id}/marketing`)}>
              View Marketing Page
            </ActionButton>
            <ActionButton onClick={() => router.push(`/admin/raffles/${id}/tickets`)}>
              View Tickets
            </ActionButton>
          </div>
        </Header>

        {editing && (
          <EditForm onSubmit={handleEditSubmit}>
            <label>
              Name
              <EditInput
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
              />
            </label>
            <label>
              Description
              <EditTextarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                required
              />
            </label>
            <label>
              Status
              <EditInput
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                required
              />
            </label>
            {editError && <p style={{ color: 'red' }}>{editError}</p>}
            <EditActions>
              <ActionButton type="submit" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </ActionButton>
              <ActionButton type="button" onClick={() => setEditing(false)}>
                Cancel
              </ActionButton>
            </EditActions>
          </EditForm>
        )}

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        )}

        {raffle && (
          <RaffleInfo>
            <h2>{raffle.name}</h2>
            <p>{raffle.description}</p>
            <span className="status">{raffle.status}</span>
          </RaffleInfo>
        )}

        <Section>
          <SectionHeader>
            <h2>Artists</h2>
            <ActionButton onClick={() => router.push(`/admin/raffles/${id}/artists/add`)}>
              Add Artist
            </ActionButton>
          </SectionHeader>

          <ArtistsGrid>
            {artists.map((artist) => (
              <ArtistCard key={artist.id}>
                <ArtistImage imageUrl={artist.image_url} />
                <ArtistInfo>
                  <h3>{artist.name}</h3>
                  <p>{artist.bio}</p>
                  <div className="ticket-count">
                    {artist.ticket_count} tickets
                  </div>
                </ArtistInfo>
                <ArtistActions>
                  <Button 
                    variant="danger"
                    onClick={() => handleRemoveArtist(artist.raffle_artist_id)}
                  >
                    Remove from Raffle
                  </Button>
                </ArtistActions>
              </ArtistCard>
            ))}
          </ArtistsGrid>
        </Section>
      </RaffleContainer>
    </PageContainer>
  );
} 