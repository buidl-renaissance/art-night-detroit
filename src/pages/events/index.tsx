import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { getServerSideEvents } from '@/lib/getServerSideEvents';
import { Event } from '@/types/events';
import EventCard from '@/components/EventCard';

interface EventsPageProps {
  events: Event[];
}

const EventsPage: React.FC<EventsPageProps> = ({ events }) => {
  const today = new Date();
  const futureEvents = events.filter(event => new Date(event.start_date) >= today);
  const pastEvents = events.filter(event => new Date(event.start_date) < today)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  return (
    <PageContainer>
      <Head>
        <title>Events | Art Night Detroit</title>
        <meta name="description" content="Discover upcoming art events in Detroit" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <PaintSplash top="10%" left="5%" color="#87CEEB" size="150px" rotation="-15deg" />
        <PaintSplash top="70%" left="85%" color="#F7DC6F" size="120px" rotation="25deg" />
        <HeroTitle>Upcoming Events</HeroTitle>
        <HeroSubtitle>Discover and join creative events in Detroit</HeroSubtitle>
      </HeroSection>

      <EventsContainer>
        {futureEvents.length > 0 ? (
          futureEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <NoEventsMessage>
            <NoEventsTitle>No upcoming events</NoEventsTitle>
            <NoEventsDescription>
              Check back soon for new events, or browse our past events below.
            </NoEventsDescription>
          </NoEventsMessage>
        )}
      </EventsContainer>

      {pastEvents.length > 0 && (
        <>
          <SectionTitle>Past Events</SectionTitle>
          <EventsContainer>
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </EventsContainer>
        </>
      )}

      <CTASection>
        <CTATitle>Want to host an event?</CTATitle>
        <CTADescription>
          We&apos;re always looking for new creative events to feature. Get in touch with us to discuss collaboration opportunities.
        </CTADescription>
        <CTAButton href="/contact">Contact Us</CTAButton>
      </CTASection>
    </PageContainer>
  );
};

export default EventsPage;

export const getServerSideProps: GetServerSideProps<EventsPageProps> = async () => {
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
  background: linear-gradient(135deg, #3498DB 0%, #8E44AD 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-family: 'Baloo 2', cursive;
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const EventsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #fff;
  text-align: center;
    
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const NoEventsMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f0f0f0;
  border-radius: 16px;
  margin-bottom: 4rem;
`;

const NoEventsTitle = styled.h3`
  font-family: 'Baloo 2', cursive;
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const NoEventsDescription = styled.p`
  font-size: 1.2rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto;
`;

const CTASection = styled.section`
  background-color: #87CEEB;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  margin: 0 2rem 4rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
    margin: 0 1rem 3rem;
  }
`;

const CTATitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #111;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  color: #222;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #E74C3C;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  
  &:hover {
    background-color: #C0392B;
    transform: translateY(-3px);
    box-shadow: 0 7px 15px rgba(0,0,0,0.2);
  }
`;
