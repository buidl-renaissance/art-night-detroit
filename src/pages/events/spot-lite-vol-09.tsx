import styled from 'styled-components';
import { useState } from 'react';
import RSVPModal from '@/components/RSVPModal';
import { Event } from '@/types/events';
import { useRaffleData } from '@/hooks/useRaffleData';

const Container = styled.div`
  background: linear-gradient(135deg, #C9B8FF, #9B2FFF);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`;

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  background: #1a093a; /* deep dark purple */
  padding: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/spot-lite-vol09-wide.jpg') center center / cover no-repeat;
    @media (max-width: 768px) {
      background: url('/images/spot-lite-vol09.jpg') center center / cover no-repeat;
    }
    z-index: 0;
  }
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(20, 10, 40, 0.82); /* strong dark overlay for contrast */
    z-index: 1;
  }

  > * {
    position: relative;
    z-index: 2;
  }
`;

const Title = styled.h1`
  font-family: 'Anton', sans-serif;
  font-size: 4rem;
  color: #FFFFFF;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.h2`
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  color: #7BE7FF;
  margin-bottom: 2rem;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CTAButton = styled.button`
  background: transparent;
  border: 2px solid #7FFFC1;
  color: #FFFFFF;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Sora', sans-serif;

  &:hover {
    background: #7FFFC1;
    color: #10182F;
  }
`;

const EventDetails = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  color: #FFFFFF;
  margin-top: 2rem;
  letter-spacing: 0.05em;
  line-height: 1.5;
  text-transform: uppercase;
`;

const AboutSection = styled.section`
  padding: 4rem 2rem;
  background: rgba(16, 24, 47, 0.3);
  backdrop-filter: blur(10px);
`;

const AboutText = styled.p`
  font-family: 'Space Grotesk', sans-serif;
  color: #FFFFFF;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  line-height: 1.6;
`;

const LineupSection = styled.section`
  padding: 2rem;
  background: rgba(16, 24, 47, 0.2);
`;

const LineupContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  color: #FFFFFF;
  font-family: 'Space Grotesk', sans-serif;
`;

const LineupTitle = styled.h3`
  color: #7BE7FF;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ArtistList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  text-align: center;
`;

const Artist = styled.li`
  color: #FFFFFF;
  margin: 0.5rem 0;
  font-size: 1.1rem;
`;

const SpotLiteVol09 = () => {
  const [isRSVPOpen, setRSVPOpen] = useState(false);

  // Construct the event object for RSVPModal
  const event: Event = {
    id: 'spot-lite-vol-09',
    name: 'Art Night Detroit × Spot Lite Vol. 09',
    description: `A night of art, sound, and community at Spot Lite Detroit.`,
    start_date: '2025-07-23T21:00:00',
    end_date: '2025-07-24T02:00:00',
    location: '2905 Beaufait St, Detroit, MI',
    status: 'active',
    attendance_limit: undefined, // Set if you want to enforce a limit
    created_at: '',
    updated_at: '',
  };

  const { raffle } = useRaffleData('5cd2d6da-54f4-4a1d-bbdf-434c91aaea91');

  return (
    <Container>
      <HeroSection>
        <Title>ART NIGHT DETROIT<br />×<br />SPOT LITE</Title>
        <Subtitle>Vol. 09</Subtitle>
        <CTAButton onClick={() => setRSVPOpen(true)}>RSVP NOW</CTAButton>
        <EventDetails>
          July 23, 2025 | 9PM–2AM | $5 Cover <br />2905 Beaufait St, Detroit
        </EventDetails>
      </HeroSection>
      <RSVPModal event={event} isOpen={isRSVPOpen} onClose={() => setRSVPOpen(false)} />
      
      <AboutSection>
        <AboutText>
          Join us for a vibrant night of musical talent, live art creation, and community connection. 
          Featuring an art raffle showcasing Detroit&apos;s finest visual artists, amazing vendors, and a 
          space to create and share artistic passions. Bring your sketchbook, creative materials, or 
          artistic activity to share - let&apos;s create together!
        </AboutText>
      </AboutSection>

      <LineupSection>
        <LineupContainer>
          <LineupTitle>Main Room</LineupTitle>
          <ArtistList>
            <Artist><a href="https://instagram.com/beatloaf" target="_blank" rel="noopener noreferrer">@beatloaf</a></Artist>
            <Artist><a href="https://instagram.com/yeriko_dj" target="_blank" rel="noopener noreferrer">@yeriko_dj</a></Artist>
            <Artist><a href="https://instagram.com/whosjmt" target="_blank" rel="noopener noreferrer">@whosjmt</a></Artist>
            <Artist><a href="https://instagram.com/iamfullbodydurag" target="_blank" rel="noopener noreferrer">@iamfullbodydurag</a></Artist>
          </ArtistList>

          <LineupTitle>Patio</LineupTitle>
          <ArtistList>
            <Artist><a href="https://instagram.com/steingoldmusic" target="_blank" rel="noopener noreferrer">@steingoldmusic</a></Artist>
            <Artist><a href="https://instagram.com/rapharazzi" target="_blank" rel="noopener noreferrer">@rapharazzi</a> b2b <a href="https://instagram.com/yannaisperuvian" target="_blank" rel="noopener noreferrer">@yannaisperuvian</a></Artist>
            <Artist><a href="https://instagram.com/acedspade" target="_blank" rel="noopener noreferrer">@acedspade</a></Artist>
            <Artist><a href="https://instagram.com/nathankarinen" target="_blank" rel="noopener noreferrer">@nathankarinen</a> b2b <a href="https://instagram.com/_pettycash" target="_blank" rel="noopener noreferrer">@_pettycash</a></Artist>
          </ArtistList>

          <LineupTitle>Hosted By</LineupTitle>
          <ArtistList>
            <Artist><a href="https://instagram.com/ceej.hill.official" target="_blank" rel="noopener noreferrer">@ceej.hill.official</a></Artist>
          </ArtistList>

          <LineupTitle>Art Curator</LineupTitle>
          <ArtistList>
            <Artist><a href="https://instagram.com/darklord_escada" target="_blank" rel="noopener noreferrer">@darklord_escada</a></Artist>
          </ArtistList>
          <AboutText style={{textAlign: 'center', margin: '1rem 0'}}>
            We&apos;ll be raffling off artwork created on site at the event so please engage and maybe win some new art in process. (All raffle proceeds go directly to the artists after canvas costs).
          </AboutText>
            {raffle && raffle.id && (
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                <a href={`/raffles/${raffle.id}`} style={{ color: '#7BE7FF', fontWeight: 600, fontSize: '1.1rem' }}>
                View Raffle Details
                </a>
            </div>
            )}

          <LineupTitle>Vendors</LineupTitle>
          <ArtistList>
            <Artist><a href="https://instagram.com/hazelnut.helpers.art.cart" target="_blank" rel="noopener noreferrer">@hazelnut.helpers.art.cart</a></Artist>
            <Artist><a href="https://instagram.com/stay_within" target="_blank" rel="noopener noreferrer">@stay_within</a></Artist>
            <Artist>More TBA</Artist>
          </ArtistList>
        </LineupContainer>
      </LineupSection>
    </Container>
  );
};

export default SpotLiteVol09;
