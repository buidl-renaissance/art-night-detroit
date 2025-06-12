import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Image from 'next/image';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  raffle_artist_id: string;
  artwork_title?: string;
  total_tickets?: number;
}

interface Raffle {
  id: string;
  name: string;
  description: string;
  price_per_ticket: number;
  status: 'draft' | 'active' | 'ended';
}

const ArtistPage: NextPage = () => {
  const router = useRouter();
  const { raffleId, artistId } = router.query;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchArtistAndRaffleData = async () => {
      if (!raffleId || !artistId) return;

      try {
        // Fetch raffle details
        const { data: raffleData, error: raffleError } = await supabase
          .from('raffles')
          .select('id, name, description, price_per_ticket, status')
          .eq('id', raffleId)
          .single();

        if (raffleError) throw raffleError;
        setRaffle(raffleData);

        // Fetch artist details
        const { data: artistData, error: artistError } = await supabase
          .from('raffle_artists')
          .select(`
            id,
            artists (
              id,
              name,
              bio,
              image_url
            ),
            artwork_title
          `)
          .eq('id', artistId)
          .single();

        if (artistError) throw artistError;

        // Transform the data to match our Artist interface
        const transformedArtist: Artist = {
          id: artistData.artists[0].id,
          name: artistData.artists[0].name,
          bio: artistData.artists[0].bio,
          image_url: artistData.artists[0].image_url,
          raffle_artist_id: artistData.id,
          artwork_title: artistData.artwork_title
        };

        setArtist(transformedArtist);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load artist data');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistAndRaffleData();
  }, [raffleId, artistId, supabase]);

  const handlePurchaseTickets = () => {
    router.push(`/tickets/checkout?raffle_id=${raffleId}&raffle_artist_id=${artistId}&artist_name=${artist?.name}`);
  };

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
            <LoadingText>Loading artist details...</LoadingText>
          </LoadingContainer>
        </PageContent>
      </Layout>
    );
  }

  if (error || !artist || !raffle) {
    return (
      <Layout width="full">
        <PageContent>
          <ErrorMessage>{error || 'Artist not found'}</ErrorMessage>
        </PageContent>
      </Layout>
    );
  }

  return (
    <Layout width="full">
      <Head>
        <title>{artist.name} - MBAD African Bead Festival Raffle</title>
        <meta name="description" content={`Support ${artist.name} at the MBAD African Bead Festival. Enter to win their exclusive artwork: ${artist.artwork_title || 'Featured Artwork'}`} />
      </Head>
      <PageContent>
        <HeroSection>
          <ArtistImageWrapper>
            <Image
              src={artist.image_url || `https://picsum.photos/seed/${artist.id}/1200/800`}
              alt={artist.name}
              width={1200}
              height={800}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
            />
          </ArtistImageWrapper>
          <HeroContent>
            <ArtistName>{artist.name}</ArtistName>
            <ArtworkTitle>
              Donating: &ldquo;{artist.artwork_title || 'Featured Artwork'}&rdquo;
            </ArtworkTitle>
          </HeroContent>
        </HeroSection>

        <MainContent>
          <Section>
            <SectionTitle>
              <TitleEmoji>🎨</TitleEmoji>
              <TitleText>About the Artist</TitleText>
            </SectionTitle>
            <ArtistBio>{artist.bio}</ArtistBio>
          </Section>

          <Section>
            <SectionTitle>
              <TitleEmoji>🎟️</TitleEmoji>
              <TitleText>Support This Artist</TitleText>
            </SectionTitle>
            <TicketInfo>
              <PriceText>${raffle.price_per_ticket} per Raffle Ticket</PriceText>
              <DescriptionText>
                Purchase raffle tickets to support {artist.name} and get a chance to win their exclusive artwork.
                All proceeds go directly to the artist.
              </DescriptionText>
              <PurchaseButton onClick={handlePurchaseTickets}>
                Purchase Raffle Tickets
              </PurchaseButton>
            </TicketInfo>
          </Section>

          <Section>
            <SectionTitle>
              <TitleEmoji>🏆</TitleEmoji>
              <TitleText>How It Works</TitleText>
            </SectionTitle>
            <StepsList>
              <StepItem>1. Purchase your raffle tickets</StepItem>
              <StepItem>2. View the artwork at the MBAD African Bead Festival</StepItem>
              <StepItem>3. Winners will be announced at 8 PM on June 14th</StepItem>
              <StepItem>4. Winners can claim their artwork at the event or coordinate pickup</StepItem>
            </StepsList>
          </Section>
        </MainContent>
      </PageContent>
    </Layout>
  );
};

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const HeroSection = styled.section`
  position: relative;
  height: 60vh;
  min-height: 400px;
  background: #002b5c;
  overflow: hidden;
`;

const ArtistImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 43, 92, 0.7), rgba(0, 43, 92, 0.9));
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;
`;

const ArtistName = styled.h1`
  font-family: 'Bungee', sans-serif;
  font-size: 3rem;
  margin: 0;
  color: #ff6b3b;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const ArtworkTitle = styled.h2`
  font-family: 'Amatic SC', cursive;
  font-size: 2rem;
  margin: 1rem 0 0;
  color: #ffdd3c;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const TitleEmoji = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const TitleText = styled.h2`
  font-family: 'Bungee', sans-serif;
  font-size: 2rem;
  color: #ff6b3b;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const ArtistBio = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.2rem;
  line-height: 1.8;
  color: #002b5c;
  margin: 0;
`;

const TicketInfo = styled.div`
  background: #002b5c;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: white;
`;

const PriceText = styled.p`
  font-family: 'Bungee', sans-serif;
  font-size: 2rem;
  color: #ffdd3c;
  margin: 0 0 1rem;
`;

const DescriptionText = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #ffdd3c;
  margin: 0 0 2rem;
`;

const PurchaseButton = styled.button`
  background-color: #ff6b3b;
  color: white;
  padding: 1rem 2rem;
  border: none;
  font-size: 1.1rem;
  font-family: 'Bungee', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 59, 0.3);
  border-radius: 8px;

  &:hover {
    background-color: #ffdd3c;
    color: #002b5c;
    transform: translateY(-2px);
  }
`;

const StepsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StepItem = styled.li`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.1rem;
  padding: 1.5rem;
  background: rgba(0, 43, 92, 0.1);
  color: #002b5c;
  margin-bottom: 1rem;
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
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

export default ArtistPage; 