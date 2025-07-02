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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ArtistImage = styled.div<{ imageUrl: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const ArtistInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 80px;

  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    margin-bottom: 0.5rem;
    line-height: 1.3;
    font-size: 0.85rem;
    flex: 1;
  }
`;

const EditLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0;
  transition: all 0.2s;
  cursor: pointer;
  align-self: flex-start;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }

  svg {
    width: 12px;
    height: 12px;
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
                <EditLink onClick={() => router.push(`/admin/artists/${artist.id}/edit`)}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Edit Artist
                </EditLink>
              </ArtistInfo>
            </ArtistCard>
          ))}
        </ArtistsGrid>
      </ArtistsContainer>
    </PageContainer>
  );
} 