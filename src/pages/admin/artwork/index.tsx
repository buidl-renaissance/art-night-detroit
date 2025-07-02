import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';
import { ArtworkWithArtist } from '@/data/artwork';

const ArtworkContainer = styled.div`
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

const ArtworkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const ArtworkCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ArtworkImage = styled.div<{ imageUrl?: string }>`
  height: 250px;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(45deg, #f0f0f0, #e0e0e0)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
`;

const ArtworkInfo = styled.div`
  padding: 1.5rem;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .artist-name {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 0.5rem;
  }

  .status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 1rem;

    &.draft {
      background: #fef3c7;
      color: #92400e;
    }

    &.active {
      background: #d1fae5;
      color: #065f46;
    }

    &.archived {
      background: #f3f4f6;
      color: #374151;
    }
  }
`;

const ArtworkActions = styled.div`
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

export default function ArtworkAdmin() {
  const [artwork, setArtwork] = useState<ArtworkWithArtist[]>([]);
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

      fetchArtwork();
    };

    checkAdmin();
  }, []);

  const fetchArtwork = async () => {
    try {
      const response = await fetch('/api/artwork', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch artwork');
      }

      const data = await response.json();
      setArtwork(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
      const response = await fetch(`/api/artwork/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete artwork');
      }

      await fetchArtwork();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <ArtworkContainer>
          <p>Loading artwork...</p>
        </ArtworkContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <ArtworkContainer>
        <BackButton onClick={() => router.push('/admin')}>
          ← Back to Admin Dashboard
        </BackButton>

        <Header>
          <h1>Artwork Management</h1>
          <AddButton onClick={() => router.push('/admin/artwork/create')}>
            Add New Artwork
          </AddButton>
        </Header>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            Error: {error}
          </div>
        )}

        <ArtworkGrid>
          {artwork.map((item) => (
            <ArtworkCard key={item.id}>
              <ArtworkImage imageUrl={item.image_url}>
                {!item.image_url && 'No Image'}
              </ArtworkImage>
              <ArtworkInfo>
                <h3>{item.title}</h3>
                <div className="artist-name">by {item.artist_name}</div>
                <div className="price">{formatPrice(item.price)}</div>
                <div className={`status ${item.status}`}>{item.status}</div>
              </ArtworkInfo>
              <ArtworkActions>
                <ActionButton onClick={() => router.push(`/admin/artwork/${item.id}/edit`)}>
                  Edit
                </ActionButton>
                <ActionButton 
                  variant="danger" 
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </ActionButton>
              </ArtworkActions>
            </ArtworkCard>
          ))}
        </ArtworkGrid>

        {artwork.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            No artwork found. Create your first piece!
          </div>
        )}
      </ArtworkContainer>
    </PageContainer>
  );
} 