import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  created_at: string;
}

const ArtistsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;

  &:hover {
    background: ${({ theme }) => theme.colors.background.primary};
    transform: translateY(-2px);
  }
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
`;

const ArtistActions = styled.div`
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
    variant === 'danger' ? theme.colors.error : theme.colors.primary};
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'danger' ? theme.colors.errorHover : theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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

      fetchArtists();
    };

    checkAdmin();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtists(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (artistId: string) => {
    if (!confirm('Are you sure you want to delete this artist?')) return;

    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistId);

      if (error) throw error;
      await fetchArtists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <ArtistsContainer>
          <p>Loading...</p>
        </ArtistsContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <ArtistsContainer>
        <BackButton onClick={() => router.push('/admin')}>
          ← Back to Admin Dashboard
        </BackButton>

        <Header>
          <h1>Artists</h1>
          <AddButton onClick={() => router.push('/admin/artists/new')}>
            Add Artist
          </AddButton>
        </Header>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        )}

        <ArtistsGrid>
          {artists.map((artist) => (
            <ArtistCard key={artist.id}>
              <ArtistImage imageUrl={artist.image_url} />
              <ArtistInfo>
                <h3>{artist.name}</h3>
                <p>{artist.bio}</p>
              </ArtistInfo>
              <ArtistActions>
                <ActionButton onClick={() => router.push(`/admin/artists/${artist.id}/edit`)}>
                  Edit
                </ActionButton>
                <ActionButton onClick={() => router.push(`/admin/artists/${artist.id}/raffles`)}>
                  Manage Raffles
                </ActionButton>
                <ActionButton 
                  variant="danger"
                  onClick={() => handleDelete(artist.id)}
                >
                  Delete
                </ActionButton>
              </ArtistActions>
            </ArtistCard>
          ))}
        </ArtistsGrid>
      </ArtistsContainer>
    </PageContainer>
  );
} 