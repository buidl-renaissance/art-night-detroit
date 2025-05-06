import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';

const EventsPage = () => {
  const events = [
    {
      id: 'spot-lite-vol-08',
      title: 'Art Night Detroit x Spotlite Vol. 08',
      date: 'April 30, 2025',
      description: 'Join us for a night of creative projects, visual art showcase, live music, and more!',
      image: '/images/art-night-spot-lite-vol-08.jpg',
      location: 'Spot Lite Detroit',
      time: '7:30PM-2AM'
    },
    {
      id: 'a-window-into',
      title: 'A Window Into...',
      date: 'April 18, 2025',
      description: 'Gallery showcase at La Ventana Café exploring the boundaries between reality and imagination.',
      image: '/images/a-window-into.jpg',
      location: 'La Ventana Café',
      time: '6:00PM-10:00PM'
    },
  ];

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
        {events.map(event => (
          <EventCard key={event.id}>
            <EventImageWrapper>
              <EventImage src={event.image} alt={event.title} />
            </EventImageWrapper>
            <EventContent>
              <EventTitle>{event.title}</EventTitle>
              <EventDate>{event.date} • {event.time}</EventDate>
              <EventLocation>{event.location}</EventLocation>
              <EventDescription>{event.description}</EventDescription>
              <EventLink href={`/events/${event.id}`}>View Details</EventLink>
            </EventContent>
          </EventCard>
        ))}
      </EventsContainer>

      <CTASection>
        <CTATitle>Want to host an event?</CTATitle>
        <CTADescription>
          We're always looking for new creative events to feature. Get in touch with us to discuss collaboration opportunities.
        </CTADescription>
        <CTAButton href="/contact">Contact Us</CTAButton>
      </CTASection>
    </PageContainer>
  );
};

export default EventsPage;

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
  padding: 6rem 2rem;
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
  font-size: 1.4rem;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
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

const EventCard = styled.div`
  display: flex;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EventImageWrapper = styled.div`
  flex: 0 0 350px;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    flex: 0 0 250px;
    width: 100%;
  }
`;

const EventImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${EventCard}:hover & {
    transform: scale(1.05);
  }
`;

const EventContent = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

const EventTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #111;
`;

const EventDate = styled.p`
  font-size: 1rem;
  color: #444;
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &:before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    background-color: #3498DB;
    border-radius: 50%;
    margin-right: 8px;
  }
`;

const EventLocation = styled.p`
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
  font-style: italic;
`;

const EventDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #333;
  flex-grow: 1;
`;

const EventLink = styled(Link)`
  align-self: flex-start;
  padding: 0.6rem 1.2rem;
  background-color: #27AE60;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.2s ease;
  
  &:hover {
    background-color: #219653;
    transform: translateY(-3px);
  }
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
