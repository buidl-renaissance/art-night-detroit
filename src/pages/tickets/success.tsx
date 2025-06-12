import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

interface Purchase {
  id: string;
  quantity: number;
  total_amount: number;
  created_at: string;
  raffle: {
    name: string;
  };
  raffle_artists: {
    artists: {
      name: string;
    };
    artwork_title?: string;
  };
}

const SuccessPage: NextPage = () => {
  const router = useRouter();
  const { purchase_id } = router.query;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      if (!purchase_id) return;

      try {
        const { data, error: purchaseError } = await supabase
          .from('ticket_purchases')
          .select(`
            id,
            quantity,
            total_amount,
            created_at,
            raffle (
              name
            ),
            raffle_artists (
              artists (
                name
              ),
              artwork_title
            )
          `)
          .eq('id', purchase_id)
          .single();

        if (purchaseError) throw purchaseError;
        setPurchase({
          id: data.id,
          quantity: data.quantity,
          total_amount: data.total_amount,
          created_at: data.created_at,
          raffle: {
            name: data.raffle[0].name
          },
          raffle_artists: {
            artists: {
              name: data.raffle_artists[0].artists[0].name
            },
            artwork_title: data.raffle_artists[0].artwork_title
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load purchase details');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [purchase_id, supabase]);

  if (loading) {
    return (
      <Layout width="full">
        <PageContent>
          <LoadingContainer>
            <LoadingSpinner>
              <LoadingCircle />
              <LoadingCircle />
              <LoadingCircle />
            </LoadingSpinner>
            <LoadingText>Loading purchase details...</LoadingText>
          </LoadingContainer>
        </PageContent>
      </Layout>
    );
  }

  if (error || !purchase) {
    return (
      <Layout width="full">
        <PageContent>
          <ErrorMessage>{error || 'Purchase not found'}</ErrorMessage>
        </PageContent>
      </Layout>
    );
  }

  return (
    <Layout width="full">
      <Head>
        <title>Purchase Successful - MBAD African Bead Festival</title>
        <meta name="description" content="Thank you for supporting the MBAD African Bead Festival raffle" />
      </Head>
      <PageContent>
        <SuccessContainer>
          <SuccessIcon>🎉</SuccessIcon>
          <Title>Thank You for Your Purchase!</Title>
          
          <PurchaseDetails>
            <DetailRow>
              <DetailLabel>Artist:</DetailLabel>
              <DetailValue>{purchase.raffle_artists.artists.name}</DetailValue>
            </DetailRow>
            {purchase.raffle_artists.artwork_title && (
              <DetailRow>
                <DetailLabel>Artwork:</DetailLabel>
                <DetailValue>{purchase.raffle_artists.artwork_title}</DetailValue>
              </DetailRow>
            )}
            <DetailRow>
              <DetailLabel>Number of Tickets:</DetailLabel>
              <DetailValue>{purchase.quantity}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Total Amount:</DetailLabel>
              <DetailValue>${purchase.total_amount.toFixed(2)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Purchase Date:</DetailLabel>
              <DetailValue>
                {new Date(purchase.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </DetailValue>
            </DetailRow>
          </PurchaseDetails>

          <Message>
            Your raffle tickets have been successfully purchased. Thank you for supporting the artist!
            Winners will be announced at the MBAD African Bead Festival on June 14th at 8 PM.
          </Message>

          <ButtonGroup>
            <Button as={Link} href="/raffle">
              View All Raffles
            </Button>
            <Button as={Link} href="/dashboard">
              View My Tickets
            </Button>
          </ButtonGroup>
        </SuccessContainer>
      </PageContent>
    </Layout>
  );
};

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem;
`;

const SuccessContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-family: 'Bungee', sans-serif;
  font-size: 2rem;
  color: #002b5c;
  margin-bottom: 2rem;
`;

const PurchaseDetails = styled.div`
  background: rgba(0, 43, 92, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 43, 92, 0.1);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.1rem;
  color: #002b5c;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.1rem;
  color: #ff6b3b;
`;

const Message = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #002b5c;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.a`
  padding: 1rem 2rem;
  background-color: #ff6b3b;
  color: white;
  text-decoration: none;
  font-family: 'Bungee', sans-serif;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffdd3c;
    color: #002b5c;
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: #002b5c;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const LoadingSpinner = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const LoadingCircle = styled.div`
  width: 20px;
  height: 20px;
  background: #ff6b3b;
  border-radius: 50%;
  animation: bounce 0.6s infinite alternate;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-20px);
    }
  }
`;

const LoadingText = styled.p`
  font-family: 'Bungee', sans-serif;
  font-size: 1.5rem;
  color: #ffdd3c;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  margin: 0;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #ff6b3b;
`;

export default SuccessPage; 