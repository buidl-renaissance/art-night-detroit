import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Button as ButtonComponent } from '@/components/Button';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { Title } from '@/components/Title';
import { ArtistList } from '@/components/ArtistList';
import { supabase } from '@/lib/supabaseClient';

interface Artist {
  id: string;
  name: string;
  description: string;
  image_url: string;
  ticket_count: number;
}

interface RaffleArtist {
  id: string;
  ticket_count: number;
  artists: {
    id: string;
    name: string;
    description: string;
    image_url: string;
  };
}

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const ArtistImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const ArtistInfo = styled.div`
  flex: 1;
`;

const ArtistName = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
`;

const ArtistDescription = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const TicketCount = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;

  @media (min-width: 768px) {
    margin-left: auto;
  }
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
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
  }

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'danger' ? '#b91c1c' : theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const ArtistsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    if (id) {
      fetchArtists();
    }
  }, [id]);

  const fetchArtists = async () => {
    try {
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

      const { data, error: fetchError } = await supabase
        .from('raffle_artists')
        .select(`
          id,
          ticket_count,
          artists (
            id,
            name,
            description,
            image_url
          )
        `)
        .eq('raffle_id', id) as { data: RaffleArtist[] | null, error: Error | null };

      if (fetchError) throw fetchError;

      setArtists((data || []).map((item) => ({
        id: item.artists.id,
        name: item.artists.name,
        description: item.artists.description,
        image_url: item.artists.image_url,
        ticket_count: item.ticket_count,
      })));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveArtist = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from('raffle_artists')
        .delete()
        .eq('raffle_id', id)
        .eq('artist_id', artistId);

      if (error) throw error;
      fetchArtists();
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An error occurred'));
    }
  };

  return (
    <Container>
      <Header>
        <Title>Manage Artists</Title>
        <ButtonComponent onClick={() => router.push(`/admin/raffles/${id}/artists/add`)}>
          Add Artist
        </ButtonComponent>
      </Header>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <ArtistList>
          {artists.map((artist) => (
            <ArtistCard key={artist.id}>
              <ArtistImage $imageUrl={artist.image_url || '/placeholder-artist.jpg'} />
              <ArtistInfo>
                <ArtistName>{artist.name}</ArtistName>
                <ArtistDescription>{artist.description}</ArtistDescription>
              </ArtistInfo>
              <TicketCount>
                <span>🎫</span>
                {artist.ticket_count || 0} tickets
              </TicketCount>
              <Button
                onClick={() => handleRemoveArtist(artist.id)}
                variant="danger"
              >
                Remove
              </Button>
            </ArtistCard>
          ))}
        </ArtistList>
      )}
    </Container>
  );
};

export default ArtistsPage; 