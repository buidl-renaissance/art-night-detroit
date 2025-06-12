import { NextPage } from "next";
import styled from "styled-components";
import Head from "next/head";
import Image from "next/image";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import QRCode from "react-qr-code";
import { useRaffleData } from "../hooks/useRaffleData";

const RafflePage: NextPage = () => {
  const router = useRouter();
  const { raffle, artists, loading, error } = useRaffleData(
    "3c102268-f3b3-4fe5-8762-c57fbb9ed701"
  );

  if (error) {
    return (
      <Layout width="full">
        <PageContent>
          <ErrorMessage>{error}</ErrorMessage>
        </PageContent>
      </Layout>
    );
  }

  return (
    <Layout width="full">
      <Head>
        <title>
          Local Artist Raffle - MBAD African Bead Festival x ArtNightDetroit
        </title>
        <meta
          name="description"
          content="Support Detroit's talented artists at the MBAD African Bead Festival. Win exclusive artwork while supporting local artists. Tickets only $10!"
        />
        <meta
          name="keywords"
          content="Detroit Art, Artist Raffle, MBAD Museum, African Bead Festival, Local Artists, Art Night Detroit"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Local Artist Raffle - MBAD African Bead Festival x ArtNightDetroit"
        />
        <meta
          property="og:description"
          content="Support Detroit's talented artists at the MBAD African Bead Festival. Win exclusive artwork while supporting local artists."
        />
        <meta property="og:image" content="/images/mbad-dancers.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Local Artist Raffle - MBAD African Bead Festival"
        />
        <meta
          name="twitter:description"
          content="Support Detroit's talented artists at the MBAD African Bead Festival. Win exclusive artwork while supporting local artists."
        />
        <meta name="twitter:image" content="/images/mbad-dancers.png" />

        {/* Other */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0056b3" />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&family=Bungee&family=Amatic+SC:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <PageContent>
        <HeroSection>
          <HeroContent>
            <MainTitle>Local Artist Raffle</MainTitle>
            <SubTitle>Support Detroit&apos;s Talented Artists</SubTitle>
          </HeroContent>
          <EventDetails>
            <DetailTitle>
              MBAD African
              <br />
              Bead Festival
            </DetailTitle>
            <Image
              src="/images/mbad-dancers.png"
              alt="MBAD African Bead Museum"
              width={240}
              height={240}
            />
            <DetailedItems>
              <DetailItem>Saturday, June 14th</DetailItem>
              <DetailItem>10AM - 9PM</DetailItem>
              <DetailItem>MBAD African Bead Museum</DetailItem>
              <DetailItem>Detroit, MI</DetailItem>
            </DetailedItems>
          </EventDetails>
        </HeroSection>

        <MainContent>
          <RaffleSection>
            <RaffleContent>
              <SectionTitle>
                <TitleEmoji>🎨</TitleEmoji>
                <TitleText>About the Raffle</TitleText>
              </SectionTitle>
              <BodyText>
                Support local talent and get a chance to win exclusive, one-of-a-kind artwork donated by Detroit&apos;s most inspiring creatives. All proceeds go directly to the artists.
              </BodyText>
            </RaffleContent>
            <EventHighlights>
              <DetailItem style={{ fontSize: "3.5rem" }}>🎟️</DetailItem>
              <DetailItem>
                ${raffle?.price_per_ticket || 10} per Raffle Ticket
              </DetailItem>
              <DetailItem>Winners Announced at 8 PM</DetailItem>
              <RaffleButton
                onClick={() =>
                  router.push(`/tickets/checkout?raffle_id=${raffle?.id}`)
                }
              >
                Purchase Raffle Tickets
              </RaffleButton>
            </EventHighlights>
          </RaffleSection>

          <Section>
            <SectionTitle>
              <TitleEmoji>✨</TitleEmoji>
              <TitleText>Featured Artists</TitleText>
            </SectionTitle>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner>
                  <LoadingCircle />
                  <LoadingCircle />
                  <LoadingCircle />
                </LoadingSpinner>
                <LoadingText>Loading amazing artwork...</LoadingText>
              </LoadingContainer>
            ) : (
              <ArtistList>
                {artists.map((artist) => (
                  <ArtistSection key={artist.id}>
                    <ArtistImageWrapper>
                      <Image
                        src={
                          artist.image_url ||
                          `https://picsum.photos/seed/${artist.id}/800/600`
                        }
                        alt={artist.name}
                        width={800}
                        height={600}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    </ArtistImageWrapper>
                    <ArtistInfo>
                      <ArtistName>{artist.name}</ArtistName>
                      <ArtistBio>{artist.bio}</ArtistBio>
                      {/* <ArtworkTitle>
                        Donating: &ldquo;
                        {artist.artwork_title || "Featured Artwork"}&rdquo;
                      </ArtworkTitle> */}
                      {raffle && (
                        <BuyTicketsButton
                          onClick={() => router.push(`/tickets/checkout?raffle_id=${raffle.id}&raffle_artist_id=${artist.raffle_artist_id}`)}
                        >
                          Buy Tickets
                        </BuyTicketsButton>
                      )}
                    </ArtistInfo>
                  </ArtistSection>
                ))}
              </ArtistList>
            )}
          </Section>

          <Section>
            <SectionTitle>
              <TitleEmoji>🏆</TitleEmoji>
              <TitleText>How to Participate</TitleText>
            </SectionTitle>
            <StepsList>
              <StepItem>
                1. Purchase your raffle tickets online or at the event
              </StepItem>
              <StepItem>
                2. View the artwork on display at the festival or check social
                media for updates
              </StepItem>
              <StepItem>3. Winners will be announced at 8 PM</StepItem>
              <StepItem>
                4. Winners can claim their artwork at the event or coordinate
                with Art Night Detroit to pick up their artwork
              </StepItem>
            </StepsList>
          </Section>

          <ContactSection>
            <SectionTitle>
              <TitleEmoji>📩</TitleEmoji>
              <TitleText>Questions About the Raffle?</TitleText>
            </SectionTitle>
            <ContactInfo>
              <BodyText>Email: john@artnightdetroit.com</BodyText>
              <BodyText>Phone: (313) 550-3518</BodyText>
            </ContactInfo>
            <QRCodeWrapper>
              <QRCode
                value="https://artnightdetroit.com/raffle"
                bgColor="#002b5c"
                fgColor="#ffdd3c"
                size={300}
              />
              <QRCodeLabel>Scan to share this page</QRCodeLabel>
            </QRCodeWrapper>
          </ContactSection>
        </MainContent>
      </PageContent>
    </Layout>
  );
};

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 100%;
  min-height: 100vh;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: 1fr;
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

  @media (min-width: 768px) {
    width: 500px;
    min-height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    grid-template-columns: 1fr;
    text-align: center;
    padding: 2rem;
  }
`;

const MainContent = styled.div`
  @media (min-width: 768px) {
    margin-left: 500px;
    width: calc(100% - 500px);
    padding: 2rem;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
`;

const MainTitle = styled.h1`
  font-family: "Bungee", sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #ff6b3b;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const SubTitle = styled.h2`
  font-family: "Amatic SC", cursive;
  font-weight: 700;
  font-size: 2rem;
  color: #ffdd3c;
  margin: 1rem 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const EventDetails = styled.div`
  margin-top: 1.5rem;
  background: rgba(5, 76, 152, 0.5);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const DetailTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-family: "Bungee", sans-serif;
  font-size: 1.8rem;
  color: #ffdd3c;
`;

const DetailedItems = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const DetailItem = styled.p`
  margin: 0.25rem 0;
  font-weight: 500;
  font-family: "Bungee", sans-serif;
  color: #ffdd3c;
`;

const RaffleSection = styled.section`
  background: #0163ce;
  padding: 3rem 2rem;
  color: white;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    background: none;
    color: ${(props) => props.theme.colors.text.primary};
    grid-template-columns: 1fr 1fr;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
`;

const RaffleContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const TitleEmoji = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const TitleText = styled.h2`
  font-family: "Bungee", sans-serif;
  font-weight: 600;
  font-size: 1.8rem;
  color: #ff6b3b;
  margin: 0;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const BodyText = styled.p`
  font-family: "Work Sans", sans-serif;
  font-weight: 400;
  line-height: 1.6;
  color: #ffdd3c;
`;

const EventHighlights = styled.div`
  margin: 1rem 0;
  padding: 1.5rem;
  padding-top: 0.5rem;
  background: rgba(0, 122, 255, 0.35);
  text-align: center;

  @media (min-width: 768px) {
    margin: 0;
  }
`;

const RaffleButton = styled.button`
  background-color: #ff6b3b;
  color: white;
  padding: 1rem 2rem;
  border: none;
  font-size: 0.9rem;
  font-family: "Bungee", sans-serif;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 59, 0.3);
  margin: auto;
  margin-top: 1rem;
  display: block;

  &:hover {
    background-color: #ffdd3c;
    color: #001b3d;
    transform: translateY(-2px);
  }
`;

const ArtistList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const Section = styled.section`
  padding: 3rem 2rem;
  background: #002b5c;

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
    background: none;
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;

    &:nth-child(even) {
      background: none;
      &::before {
        display: none;
      }
    }
  }
`;

const ArtistSection = styled.div`
  position: relative;
  margin-bottom: 4rem;
  background: #002b5c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const ArtistImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
`;

const ArtistInfo = styled.div`
  position: relative;
  padding: 2rem;
  z-index: 2;
  pointer-events: auto;
`;

const ArtistName = styled.h3`
  font-family: "Bungee", sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: #ff6b3b;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  width: 100%;
`;

const ArtistBio = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #ffdd3c;
  margin: 0 0 1rem;
`;

// const ArtworkTitle = styled.h3`
//   font-family: 'Amatic SC', cursive;
//   font-size: 1.5rem;
//   color: #ff6b3b;
//   margin: 0;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
// `;

const BuyTicketsButton = styled.button`
  background-color: #ff6b3b;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  font-size: 1rem;
  font-family: 'Bungee', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 59, 0.3);
  border-radius: 8px;
  margin-top: 1rem;
  position: relative;
  width: 100%;
  z-index: 3;

  &:hover {
    background-color: #ffdd3c;
    color: #002b5c;
    transform: translateY(-2px);
  }
`;

const StepsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const StepItem = styled.li`
  margin: 0.75rem 0;
  font-family: "Work Sans", sans-serif;
  font-size: 1.1rem;
  padding: 1.5rem;
  background: rgba(0, 122, 255, 0.15);
  color: #ffdd3c;
`;

const ContactSection = styled(Section)`
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(0, 122, 255, 0.15);

  @media (min-width: 768px) {
    background: none;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
`;

const ContactInfo = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #002b5c;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    align-items: center;
  }
`;

const QRCodeWrapper = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  display: inline-block;
`;

const QRCodeLabel = styled.p`
  font-family: "Work Sans", sans-serif;
  font-size: 1.1rem;
  color: #ffdd3c;
  margin-top: 1rem;
  font-weight: 500;
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

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #ff6b3b;
`;

export default RafflePage;
