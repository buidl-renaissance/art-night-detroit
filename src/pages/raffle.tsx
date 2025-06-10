import { NextPage } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../components/Layout';

const RafflePage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Local Artist Raffle - MBAD African Bead Festival</title>
        <meta name="description" content="Support Detroit's talented artists at the MBAD African Bead Festival. Win exclusive artwork while supporting local artists. Tickets only $10!" />
        <meta name="keywords" content="Detroit Art, Artist Raffle, MBAD Museum, African Bead Festival, Local Artists, Art Night Detroit" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Local Artist Raffle - MBAD African Bead Festival" />
        <meta property="og:description" content="Support Detroit's talented artists at the MBAD African Bead Festival. Win exclusive artwork while supporting local artists." />
        <meta property="og:image" content="/images/mbad-dancers.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Local Artist Raffle - MBAD African Bead Festival" />
        <meta name="twitter:description" content="Support Detroit's talented artists at the MBAD African Bead Festival. Win exclusive artwork while supporting local artists." />
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
            <DetailTitle>MBAD African<br />Bead Festival</DetailTitle>
            <Image src="/images/mbad-dancers.png" alt="MBAD African Bead Museum" width={240} height={240}/>
            <DetailedItems>
                <DetailItem>Saturday, June 14th</DetailItem>
                <DetailItem>10AM - 9PM</DetailItem>
                <DetailItem>MBAD African Bead Museum</DetailItem>
                <DetailItem>Detroit, MI</DetailItem>
            </DetailedItems>
          </EventDetails>
        </HeroSection>

        <RaffleSection>
          <RaffleContent>
            <SectionTitle>
              <TitleEmoji>🎨</TitleEmoji>
              <TitleText>About the Raffle</TitleText>
            </SectionTitle>
            <BodyText>Support local talent and get a chance to win exclusive, one-of-a-kind artwork donated by Detroit&apos;s most inspiring creatives. All proceeds go directly to the artists.</BodyText>
          </RaffleContent>
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
                <Image 
                  src="https://picsum.photos/seed/artist1/800/600"
                  alt="Amari Johnson"
                  width={800}
                  height={600}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </ArtistImageWrapper>
              <ArtistInfo>
                <ArtistName>Amari Johnson</ArtistName>
                <ArtistBio>Known for vibrant mixed-media pieces celebrating African diaspora</ArtistBio>
                <ArtworkTitle>Donating: &ldquo;Spirit of Detroit&rdquo; - Mixed Media on Canvas</ArtworkTitle>
              </ArtistInfo>
            </ArtistSection>

            <ArtistSection>
              <ArtistImageWrapper>
                <Image 
                  src="https://picsum.photos/seed/artist2/800/600"
                  alt="Maya Thompson"
                  width={800}
                  height={600}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </ArtistImageWrapper>
              <ArtistInfo>
                <ArtistName>Maya Thompson</ArtistName>
                <ArtistBio>Contemporary sculptor working with recycled materials</ArtistBio>
                <ArtworkTitle>Donating: &ldquo;Urban Revival&rdquo; - Metal Sculpture</ArtworkTitle>
              </ArtistInfo>
            </ArtistSection>

            <ArtistSection>
              <ArtistImageWrapper>
                <Image 
                  src="https://picsum.photos/seed/artist3/800/600"
                  alt="Marcus Williams"
                  width={800}
                  height={600}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </ArtistImageWrapper>
              <ArtistInfo>
                <ArtistName>Marcus Williams</ArtistName>
                <ArtistBio>Digital artist and muralist</ArtistBio>
                <ArtworkTitle>Donating: &ldquo;Digital Dreams&rdquo; - Limited Edition Print</ArtworkTitle>
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
      </PageContent>
    </Layout>
  );
};

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 900px;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 2rem;
  padding: 3rem 2rem;
  padding-bottom: 1rem;
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    text-align: left;
    align-items: center;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
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

const EventDetails = styled.div`
  margin-top: 1.5rem;
  background: rgba(0, 122, 255, 0.35);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const DetailTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-family: 'Bungee', sans-serif;
  font-size: 1.8rem;
  color: #FFDD3C;
`;

const DetailedItems = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const DetailItem = styled.p`
  margin: 0.25rem 0;
  font-weight: 500;
  font-family: 'Bungee', sans-serif;
  color: #FFDD3C;
`;

const RaffleSection = styled.section`
  background: #0163ce;
  padding: 3rem 2rem;
  color: white;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
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
  font-family: 'Bungee', sans-serif;
  font-weight: 600;
  font-size: 1.8rem;
  color: #FF6B3B;
  margin: 0;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const BodyText = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-weight: 400;
  line-height: 1.6;
  color: #FFDD3C;
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
  background-color: #FF6B3B;
  color: white;
  padding: 1rem 2rem;
  border: none;
  font-size: 0.9rem;
  font-family: 'Bungee', sans-serif;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 59, 0.3);
  margin: auto;
  margin-top: 1rem;
  display: block;

  &:hover {
    background-color: #FFDD3C;
    color: #001B3D;
    transform: translateY(-2px);
  }
`;

const ArtistList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Section = styled.section`
  padding: 3rem 2rem;
  background: #002B5C;
  
  &:nth-child(odd) {
    background: #003b7d;
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ArtistSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 2rem;
  background: #002B5C;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const ArtistImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
`;

const ArtistInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  
  @media (min-width: 768px) {
    padding: 0 2rem;
  }
`;

const ArtistName = styled.h3`
  font-family: 'Bungee', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: #FF6B3B;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
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

const ContactSection = styled(Section)`
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(0, 122, 255, 0.15);

  @media (min-width: 768px) {
    max-width: 768px;
    margin: 0 auto;
    width: 100%;
  }
`;

const ContactInfo = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #002B5C;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    align-items: center;
  }
`;

export default RafflePage;
