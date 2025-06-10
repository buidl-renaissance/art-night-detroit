import { NextPage } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import Image from 'next/image';

const RafflePage: NextPage = () => {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&family=Bungee&family=Amatic+SC:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <PageContainer>
        <HeroSection>
          <MainTitle>Local Artist Raffle</MainTitle>
          <SubTitle>Support Detroit's Talented Artists</SubTitle>
          <EventDetails>
            <DetailTitle>MBAD African<br />Bead Festival</DetailTitle>
            <Image src="/images/mbad-dancers.png" alt="MBAD African Bead Museum" width={240} height={240}/>
            <DetailItem>Saturday, June 14th</DetailItem>
            <DetailItem>10AM - 9PM</DetailItem>
            <DetailItem>MBAD African Bead Museum</DetailItem>
            <DetailItem>Detroit, MI</DetailItem>
          </EventDetails>
        </HeroSection>

        <RaffleSection>
          <SectionTitle>
            <TitleEmoji>🎨</TitleEmoji>
            <TitleText>About the Raffle</TitleText>
          </SectionTitle>
          <BodyText>Support local talent and get a chance to win exclusive, one-of-a-kind artwork donated by Detroit's most inspiring creatives. All proceeds go directly to the artists.</BodyText>
          <EventHighlights>
            <DetailItem style={{ fontSize: '3.5rem' }}>🎟️</DetailItem>
            <DetailItem>$10 per Raffle Ticket</DetailItem>
            <DetailItem>Winners Announced at 8 PM</DetailItem>
            <RaffleButton>Purchase Raffle Tickets</RaffleButton>
          </EventHighlights>
        </RaffleSection>

        <Section>
          <SectionTitle>
            <TitleEmoji>✨</TitleEmoji>
            <TitleText>Featured Artists</TitleText>
          </SectionTitle>
          <ArtistList>
            <ArtistSection>
              <ArtistImageWrapper>
                <ArtistImage src="/artists/artist1.jpg" alt="Amari Johnson" />
              </ArtistImageWrapper>
              <ArtistInfo>
                <ArtistName>Amari Johnson</ArtistName>
                <ArtistBio>Known for vibrant mixed-media pieces celebrating African diaspora</ArtistBio>
                <ArtworkTitle>Donating: "Spirit of Detroit" - Mixed Media on Canvas</ArtworkTitle>
              </ArtistInfo>
            </ArtistSection>

            <ArtistSection>
              <ArtistImageWrapper>
                <ArtistImage src="/artists/artist2.jpg" alt="Maya Thompson" />
              </ArtistImageWrapper>
              <ArtistInfo>
                <ArtistName>Maya Thompson</ArtistName>
                <ArtistBio>Contemporary sculptor working with recycled materials</ArtistBio>
                <ArtworkTitle>Donating: "Urban Revival" - Metal Sculpture</ArtworkTitle>
              </ArtistInfo>
            </ArtistSection>

            <ArtistSection>
              <ArtistImageWrapper>
                <ArtistImage src="/artists/artist3.jpg" alt="Marcus Williams" />
              </ArtistImageWrapper>
              <ArtistInfo>
                <ArtistName>Marcus Williams</ArtistName>
                <ArtistBio>Digital artist and muralist</ArtistBio>
                <ArtworkTitle>Donating: "Digital Dreams" - Limited Edition Print</ArtworkTitle>
              </ArtistInfo>
            </ArtistSection>
          </ArtistList>
        </Section>

        <Section>
          <SectionTitle>
            <TitleEmoji>🏆</TitleEmoji>
            <TitleText>How to Participate</TitleText>
          </SectionTitle>
          <StepsList>
            <StepItem>1. Purchase your raffle tickets online or at the event</StepItem>
            <StepItem>2. View the artwork on display at the festival or check social media for updates</StepItem>
            <StepItem>3. Winners will be announced at 8 PM</StepItem>
            <StepItem>4. Winners can claim their artwork at the event or coordinate with Art Night Detroit to pick up their artwork</StepItem>
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
        </ContactSection>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Work Sans', sans-serif;
  color: #FFFFFF;
  background: #0056b3;
//   background: #001B3D;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 2rem;
  padding: 3rem 2rem;
  padding-bottom: 1rem;
`;

const MainTitle = styled.h1`
  font-family: 'Bungee', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #FF6B3B;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const SubTitle = styled.h2`
  font-family: 'Amatic SC', cursive;
  font-weight: 700;
  font-size: 2rem;
  color: #FFDD3C;
  margin: 1rem 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const Section = styled.section`
  padding: 3rem 2rem;
  background: #002B5C;
  &:nth-child(odd) {
    background: #003b7d;
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
  font-family: 'Bungee', sans-serif;
  font-weight: 600;
  font-size: 2rem;
  color: #FF6B3B;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const BodyText = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-weight: 400;
  line-height: 1.6;
  color: #FFDD3C;
`;

const EventDetails = styled.div`
  margin-top: 1.5rem;
  background: rgba(0, 122, 255, 0.35);
  padding: 1.5rem;
`;

const DetailTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-family: 'Bungee', sans-serif;
  font-size: 1.8rem;
  color: #FFDD3C;
`;

const DetailItem = styled.p`
  margin: 0.5rem 0;
  font-weight: 500;
  font-family: 'Bungee', sans-serif;
  color: #FFDD3C;
`;

const RaffleSection = styled.section`
  background: #0163ce;
  padding: 3rem 2rem;
  color: white;
`;

const EventHighlights = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  padding-top: 0.5rem;
  background: rgba(0, 122, 255, 0.35);
  text-align: center;
`;

const RaffleButton = styled.button`
  background-color: #FF6B3B;
  color: white;
  padding: 1rem 2rem;
  border: none;
  font-size: 1rem;
  font-family: 'Bungee', sans-serif;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 59, 0.3);
  margin: auto;
  margin-top: 2rem;
  display: block;

  &:hover {
    background-color: #FFDD3C;
    color: #001B3D;
    transform: translateY(-2px);
  }
`;

const ArtistList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1.5rem;
`;

const ArtistSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  padding: 2rem;
  background: #002B5C;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ArtistImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
`;

const ArtistImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ArtistInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
`;

const ArtistName = styled.h3`
  font-family: 'Bungee', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: #FF6B3B;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 100%;
`;

const ArtistBio = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.2rem;
  line-height: 1.6;
  color: #FFDD3C;
  margin: 0;
`;

const ArtworkTitle = styled.p`
  font-family: 'Amatic SC', cursive;
  font-size: 1.8rem;
  font-weight: 700;
  color: #FF6B3B;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const StepsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const StepItem = styled.li`
  margin: 0.75rem 0;
  font-family: 'Work Sans', sans-serif;
  font-size: 1.1rem;
  padding: 1.5rem;
  background: rgba(0, 122, 255, 0.15);
  color: #FFDD3C;
`;

const ContactSection = styled.section`
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(0, 122, 255, 0.15);
`;

const ContactInfo = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #002B5C;
`;

export default RafflePage;
