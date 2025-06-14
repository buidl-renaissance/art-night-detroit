import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'draft' | 'active' | 'sold' | 'archived';
  image_url: string;
  created_at: string;
  artist: {
    name: string;
  };
}

export default function ItemsAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchItems = async () => {
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

        // Fetch items with artist information
        const { data, error: fetchError } = await supabase
          .from('items')
          .select(`
            *,
            artist:artist_id (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [router, supabase]);

  const getStatusColor = (status: Item['status']) => {
    switch (status) {
      case 'draft':
        return '#e0e0e0';
      case 'active':
        return '#4CAF50';
      case 'sold':
        return '#ffd700';
      case 'archived':
        return '#f44336';
      default:
        return '#e0e0e0';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents to dollars
  };

  if (loading) {
    return (
      <PageContainer theme="dark" width="medium">
        <LoadingMessage>Loading items...</LoadingMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark" width="medium">
      <Header>
        <Title>Manage Items</Title>
        <CreateButton onClick={() => router.push('/admin/items/create')}>
          Add New Item
        </CreateButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {items.length === 0 ? (
        <EmptyState>
          <EmptyStateText>No items found</EmptyStateText>
          <EmptyStateSubtext>Add your first item to get started</EmptyStateSubtext>
        </EmptyState>
      ) : (
        <ItemGrid>
          {items.map((item) => (
            <ItemCard key={item.id}>
              <ItemImage src={item.image_url} alt={item.name} />
              
              <ItemContent>
                <ItemHeader>
                  <ItemName>{item.name}</ItemName>
                  <StatusBadge style={{ backgroundColor: getStatusColor(item.status) }}>
                    {item.status}
                  </StatusBadge>
                </ItemHeader>

                <ItemDescription>{item.description}</ItemDescription>

                <ItemDetails>
                  <Detail>
                    <Label>Artist</Label>
                    <Value>{item.artist?.name || 'Unknown'}</Value>
                  </Detail>
                  <Detail>
                    <Label>Price</Label>
                    <Value>{formatCurrency(item.price)}</Value>
                  </Detail>
                  <Detail>
                    <Label>Added</Label>
                    <Value>
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Value>
                  </Detail>
                </ItemDetails>

                <ButtonGroup>
                  <Button onClick={() => router.push(`/admin/items/${item.id}`)}>
                    Edit
                  </Button>
                  <Button variant="secondary" onClick={() => router.push(`/admin/items/${item.id}/details`)}>
                    View Details
                  </Button>
                </ButtonGroup>
              </ItemContent>
            </ItemCard>
          ))}
        </ItemGrid>
      )}
    </PageContainer>
  );
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #ffd700;
  font-family: var(--font-decorative);
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: #ffd700;
  color: #121212;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #e0e0e0;
  font-size: 1.2rem;
  padding: 40px;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 24px;
`;

const EmptyStateText = styled.h2`
  font-size: 1.5rem;
  color: #ffd700;
  margin-bottom: 8px;
  font-family: var(--font-decorative);
`;

const EmptyStateSubtext = styled.p`
  color: #e0e0e0;
  font-size: 1.1rem;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const ItemCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.2);
`;

const ItemContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ItemName = styled.h3`
  font-size: 1.5rem;
  color: #ffffff;
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  color: #121212;
`;

const ItemDescription = styled.p`
  color: #e0e0e0;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
`;

const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const Detail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Value = styled.span`
  color: #ffffff;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.variant === 'secondary' ? 'transparent' : '#ffd700'};
  color: ${props => props.variant === 'secondary' ? '#ffd700' : '#121212'};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  flex: 1;
  border: ${props => props.variant === 'secondary' ? '1px solid #ffd700' : 'none'};

  &:hover {
    opacity: 0.9;
  }
`; 