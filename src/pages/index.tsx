import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';

const HomePage = () => {
  const featuredEvents = [
    {
      id: 'spot-lite-vol-08',
      title: 'Art Night Detroit x Spotlite Vol. 08',
      date: 'April 30, 2025',
      description: 'Join us for a night of creative projects, visual art showcase, live music, and more!',
      image: '/images/art-night-spot-lite-vol-08.jpg'
    },
    {
      id: 'a-window-into',
      title: 'A Window Into...',
      date: 'April 18, 2025',
      description: 'Gallery showcase at La Ventana Café exploring the boundaries between reality and imagination.',
      image: '/images/a-window-into.jpg'
    },
    {
      id: 'arts-for-the-earth',
      title: 'Arts for the Earth',
      date: 'April 26, 2025',
      description: 'Life is a precious gift, and our source of endless beauty, abundance, and diversity is all created from our Mother Earth.',
      image: '/images/arts-for-earth-blank.jpeg',
      location: '2804 WIGHT ST, DETROIT, MI',
      time: '12PM-2AM',
      url: 'https://earth.gods.work/'
    }
  ];

  return (
    <PageContainer>
      <Head>
        <title>Art Night Detroit | Creative Essence</title>
        <meta name="description" content="Discover and join upcoming art events in Detroit" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <PaintSplash top="10%" left="5%" color="#87CEEB" size="150px" rotation="-15deg" />
        <PaintSplash top="70%" left="85%" color="#F7DC6F" size="120px" rotation="25deg" />
        <PaintSplash top="85%" left="15%" color="#8E44AD" size="100px" rotation="10deg" />
        <HeroTitle>Art Night Detroit</HeroTitle>
        <HeroSubtitle>Discover creative events in the heart of Detroit</HeroSubtitle>
        <HeroCTA href="/events">Start Creating</HeroCTA>
      </HeroSection>

      <EventsSection>
        {/* <BrushStroke /> */}
        <SectionTitle>Past Events</SectionTitle>
        <EventsGrid>
          {featuredEvents.map(event => (
            <EventCard key={event.id}>
              <EventImageWrapper>
                <EventImage src={event.image} alt={event.title} />
              </EventImageWrapper>
              <EventContent>
                <EventTitle>{event.title}</EventTitle>
                <EventDate>{event.date}</EventDate>
                <EventDescription>{event.description}</EventDescription>
                <EventLink href={event.url ? event.url : `/events/${event.id}`}>Learn More</EventLink>
              </EventContent>
            </EventCard>
          ))}
        </EventsGrid>
      </EventsSection>

      <CTASection>
        <CTATitle>Join Our Community</CTATitle>
        <CTADescription>
          Connect with artists, attend events, and stay updated on the latest happenings in Detroit&apos;s art scene.
        </CTADescription>
        <CTAButton href="https://instagram.com/artnightdetroit" target="_blank">
          Follow on Instagram
        </CTAButton>
      </CTASection>

      <Footer>
        <FooterContent>
          <FooterTitle>Art Night Detroit</FooterTitle>
          <FooterLinks>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/events">All Events</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </PageContainer>
  );
};

export default HomePage;

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
  padding: 10rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
`;

const HeroTitle = styled.h1`
  font-family: 'Baloo 2', cursive;
  font-size: 4.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
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

const HeroCTA = styled(Link)`
  display: inline-block;
  background-color: #F7DC6F;
  color: #333;
  font-weight: 600;
  font-size: 1.2rem;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
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
    padding: 4rem 1rem;
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EventCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #C19A6B;
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const EventImageWrapper = styled.div`
  height: 420px;
  overflow: hidden;
  position: relative;
  
  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
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
  padding: 1.8rem;
  background-color: white;
`;

const EventTitle = styled.h3`
  font-family: 'Baloo 2', cursive;
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
  color: #111;
`;

const EventDate = styled.p`
  font-size: 1rem;
  color: #444;
  margin-bottom: 1rem;
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

const EventDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #333;
`;

const EventLink = styled(Link)`
  display: inline-block;
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
`;

const Footer = styled.footer`
  background-color: #0a0a23;
  color: white;
  padding: 4rem 2rem;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterTitle = styled.h3`
  font-family: 'Baloo 2', cursive;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const FooterLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0;
    height: 2px;
    background: #8E44AD;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #F7DC6F;

    &:after {
      width: 100%;
    }
  }
`;
