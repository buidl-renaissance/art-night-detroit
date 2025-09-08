import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { getServerSideEvents } from '@/lib/getServerSideEvents';
import { Event } from '@/types/events';
import EventCard from '@/components/EventCard';
import Footer from '@/components/Footer';


interface HomePageProps {
  events: Event[];
}

const HomePage: React.FC<HomePageProps> = ({ events }) => {
  const today = new Date();
  const futureEvents = events.filter(event => new Date(event.start_date) >= today);
  const pastEvents = events.filter(event => new Date(event.start_date) < today)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 3);

  return (
    <PageContainer>
      <Head>
        <title>Art Night Detroit | Creative Essence</title>
        <meta name="description" content="Discover and join upcoming art events in Detroit" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <PaintSplash top="7%" left="5%" color="#87CEEB" size="150px" rotation="-15deg" />
        <PaintSplash top="50%" left="85%" color="#F7DC6F" size="120px" rotation="25deg" />
        <PaintSplash top="78%" left="15%" color="#8E44AD" size="100px" rotation="10deg" />
        <img src="/images/art-night-detroit-logo.png" alt="Art Night Detroit" width={300} height={300} style={{ marginBottom: '2rem' }} />
        <HeroSubtitle>Discover creative events in the heart of Detroit</HeroSubtitle>
        {/* <HeroCTA href="/events">Start Creating</HeroCTA> */}
      </HeroSection>

      {/* <RaffleSection>
        <RaffleContent>
          <RaffleTitle>Win Amazing Art Prizes!</RaffleTitle>
          <RaffleDescription>
            Enter our monthly raffle for a chance to win exclusive artwork and creative experiences. 
            Support local artists and take home something special.
          </RaffleDescription>
          <RaffleCTA href="/raffles/3c102268-f3b3-4fe5-8762-c57fbb9ed701">Enter Raffle</RaffleCTA>
        </RaffleContent>
      </RaffleSection> */}

      <EventsSection>
        <SectionTitle>Upcoming Events</SectionTitle>
        <EventsGrid>
          {futureEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </EventsGrid>

        <SectionTitle style={{ marginTop: '5rem' }}>Past Events</SectionTitle>
        <EventsGrid>
          {pastEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </EventsGrid>
      </EventsSection>

      <CTASection>
        <CTATitle>Join Our Community</CTATitle>
        <CTADescription>
          Connect with artists, attend events, and stay updated on the latest happenings in Detroit&apos;s art scene.
        </CTADescription>
        <CTAButtonContainer>
          <CTAButton href="/flyers" style={{ backgroundColor: '#45B7D1', marginRight: '0.5rem' }}>
            Community Events
          </CTAButton>
          <CTAButton href="https://instagram.com/artnightdetroit" target="_blank">
            Follow on Instagram
          </CTAButton>
          <CTAButton href="/submit-flyer" style={{ backgroundColor: '#4ECDC4', marginLeft: '0.5rem' }}>
            Submit Your Event
          </CTAButton>
        </CTAButtonContainer>
        <CTAButtonContainer style={{ marginTop: '1rem' }}>
          <CTAButton href="/submissions" style={{ backgroundColor: '#8E44AD', marginRight: '0.5rem' }}>
            Artist Application
          </CTAButton>
          <CTAButton href="/vendor-submissions" style={{ backgroundColor: '#E67E22', marginLeft: '0.5rem' }}>
            Vendor Application
          </CTAButton>
        </CTAButtonContainer>
      </CTASection>

      <Footer />
    </PageContainer>
  );
};

export default HomePage;

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  try {
    const events = await getServerSideEvents();
    
    return {
      props: {
        events,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        events: [],
      },
    };
  }
};

// Styled Components
const PageContainer = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #222;
  max-width: 100%;
  overflow-x: hidden;
`;

const PaintSplash = styled.div<{
  top?: string;
  left?: string;
  size?: string;
  color?: string;
  rotation?: string;
}>`
  position: absolute;
  width: ${props => props.size || '100px'};
  height: ${props => props.size || '100px'};
  border-radius: 50% 60% 50% 40%;
  background-color: ${props => props.color || '#87CEEB'};
  top: ${props => props.top || '0'};
  left: ${props => props.left || '0'};
  transform: rotate(${props => props.rotation || '0deg'});
  opacity: 0.6;
  z-index: 0;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg,rgb(32, 89, 127) 0%,rgb(71, 35, 86) 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  min-height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const HeroSubtitle = styled.p`
  font-size: 1.6rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 2.8rem;
  margin-bottom: 3rem;
  text-align: center;
  color: #fff;
  position: relative;
  
  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: #27AE60;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const EventsSection = styled.section`
  padding: 7rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const EventsGrid = styled.div`
  display: flex;
  gap: 2.5rem;
  overflow-x: auto;
  padding: 1rem 0;
  scroll-behavior: smooth;
  
  /* Hide scrollbar for webkit browsers */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for Firefox */
  scrollbar-width: none;
  
  /* Ensure cards don't shrink */
  & > * {
    flex-shrink: 0;
    width: 350px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    overflow-x: visible;
    gap: 2rem;
    
    & > * {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }
  }
`;

const CTASection = styled.section`
  background-color: #87CEEB;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  margin: 0 2rem 4rem;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem;
    margin: 0 1rem 3rem;
  }
`;

const CTATitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  color: #111;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.3rem;
  max-width: 600px;
  margin: 0 auto 2.5rem;
  color: #222;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CTAButton = styled.a`
  display: inline-block;
  padding: 1.2rem 2.5rem;
  background-color: #E74C3C;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.2rem;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  
  &:hover {
    background-color: #C0392B;
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
  
  @media (max-width: 768px) {
    margin: 0 !important;
  }
`;


