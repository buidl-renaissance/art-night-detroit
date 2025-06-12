import { NextPage } from "next";
import { useRouter } from "next/router";
import styled from "styled-components";
import Image from "next/image";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/hooks/useAuth";

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  raffle_artist_id: string;
  total_tickets?: number;
}

interface ArtistData {
  id: string;
  artists: {
    id: string;
    name: string;
    bio: string;
    image_url: string;
  };
}

interface Raffle {
  id: string;
  name: string;
  description: string;
  price_per_ticket: number;
  status: "draft" | "active" | "ended";
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
    const fetchData = async () => {
      if (!raffleId || !artistId) return;

      try {
        // Fetch raffle details
        const { data: raffleData, error: raffleError } = await supabase
          .from("raffles")
          .select("*")
          .eq("id", raffleId)
          .single();

        if (raffleError) throw raffleError;
        setRaffle(raffleData);

        // Fetch artist details
        const {
          data: artistData,
          error: artistError,
        }: { data: ArtistData | null; error: Error | null } = await supabase
          .from("raffle_artists")
          .select(
            `
            id,
            artists (
              id,
              name,
              bio,
              image_url
            )
          `
          )
          .eq("id", artistId)
          .single();

        if (artistError || !artistData) throw artistError;

        // Transform the data to match our Artist interface
        const transformedArtist: Artist = {
          id: artistData.artists.id,
          name: artistData.artists.name,
          bio: artistData.artists.bio,
          image_url: artistData.artists.image_url,
          raffle_artist_id: artistData.id,
        };

        setArtist(transformedArtist);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [raffleId, artistId, supabase]);

  const handleBuyTickets = () => {
    router.push(
      `/tickets/checkout?raffle_id=${raffleId}&raffle_artist_id=${artistId}`
    );
  };

  if (loading) {
    return (
      <Layout>
        <LoadingContainer>
          <LoadingSpinner>
            <LoadingCircle />
            <LoadingCircle />
            <LoadingCircle />
          </LoadingSpinner>
          <LoadingText>Loading...</LoadingText>
        </LoadingContainer>
      </Layout>
    );
  }

  if (error || !artist || !raffle) {
    return (
      <Layout>
        <ErrorContainer>
          <h1>Error</h1>
          <p>{error || "Artist or raffle not found"}</p>
          <BackButton onClick={() => router.push("/raffle")}>
            Back to Raffles
          </BackButton>
        </ErrorContainer>
      </Layout>
    );
  }

  return (
    <Layout width="full">
      <Head>
        <title>{artist.name} - Art Night Detroit</title>
        <meta
          name="description"
          content={`View ${artist.name}'s artwork in the ${raffle.name} raffle`}
        />
      </Head>

      <PageContainer>
        <ArtistSection>
          <ArtistImageWrapper>
            <Image
              src={artist.image_url}
              alt={artist.name}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </ArtistImageWrapper>
          <ArtistInfo>
            <ArtistName>{artist.name}</ArtistName>
            <ArtistBio>{artist.bio}</ArtistBio>
          </ArtistInfo>
        </ArtistSection>

        <Section>
          <SectionTitle>
            <TitleEmoji>🎟️</TitleEmoji>
            <TitleText>Ticket Information</TitleText>
          </SectionTitle>
          <TicketInfo>
            <PriceText>${raffle.price_per_ticket} per Raffle Ticket</PriceText>
            <DescriptionText>
              Purchase raffle tickets to support {artist.name} and get a chance
              to win their exclusive artwork. All proceeds go directly to the
              artist.
            </DescriptionText>
          <PurchaseButton onClick={handleBuyTickets}>
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
            <StepItem>2. View the artwork at the event</StepItem>
            <StepItem>3. Winners will be announced at the event</StepItem>
            <StepItem>
              4. Winners can claim their artwork at the event or coordinate
              pickup
            </StepItem>
          </StepsList>
        </Section>
      </PageContainer>
    </Layout>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background: #002b5c;
  width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Section = styled.section`
  padding: 3rem 1rem;
  background: #002b5c;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;

  &:nth-child(even) {
    background: #003b7d;
    background-image: url("/images/mbad-background.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      z-index: 1;
    }
  }

  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const ArtistSection = styled.div`
  position: relative;
  /* margin-bottom: 4rem; */
  background: #002b5c;
  /* border-radius: 8px; */
  overflow: hidden;
  /* box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); */
  width: 100%;
  box-sizing: border-box;
`;

const ArtistImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  position: relative;
`;

const ArtistInfo = styled.div`
  position: relative;
  padding: 1.5rem;
  z-index: 2;
  pointer-events: auto;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ArtistName = styled.h3`
  font-family: "Bungee", sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: #ff6b3b;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const ArtistBio = styled.p`
  font-family: "Work Sans", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #ffdd3c;
  margin: 0 0 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
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
  font-family: "Bungee", sans-serif;
  font-size: 2rem;
  color: #ff6b3b;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const TicketInfo = styled.div`
  background: #002b5c;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  color: white;
  border: 2px solid #ff6b3b;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 2rem;
    max-width: 800px;
  }
`;

const PriceText = styled.p`
  font-family: "Bungee", sans-serif;
  font-size: 1.75rem;
  color: #ffdd3c;
  margin: 0 0 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const DescriptionText = styled.p`
  font-family: "Work Sans", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #ffdd3c;
  margin: 0 0 2rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PurchaseButton = styled.button`
  background-color: #ff6b3b;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  font-size: 1rem;
  font-family: "Bungee", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 59, 0.3);
  border-radius: 8px;
  margin-top: 1rem;
  position: relative;
  width: 100%;
  max-width: 300px;
  z-index: 3;
  box-sizing: border-box;

  &:hover {
    background-color: #ffdd3c;
    color: #002b5c;
    transform: translateY(-2px);
  }
`;

const StepsList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const StepItem = styled.li`
  margin: 0.75rem 0;
  font-family: "Work Sans", sans-serif;
  font-size: 1rem;
  padding: 1.25rem;
  background: rgba(0, 122, 255, 0.15);
  color: #ffdd3c;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 1.1rem;
    padding: 1.5rem;
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
  font-family: "Bungee", sans-serif;
  font-size: 1.5rem;
  color: #ffdd3c;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  margin: 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #ff6b3b;
`;

const BackButton = styled.button`
  background-color: #ff6b3b;
  color: white;
  padding: 1rem 2rem;
  border: none;
  font-size: 1.1rem;
  font-family: "Bungee", sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 59, 0.3);
  border-radius: 8px;

  &:hover {
    background-color: #ffdd3c;
    color: #002b5c;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.875rem 1.75rem;
  }
`;

export default ArtistPage;
