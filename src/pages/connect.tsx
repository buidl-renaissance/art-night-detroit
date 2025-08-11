import { GetServerSideProps } from 'next';
import { useState } from 'react';
import styled from 'styled-components';
import { getNextEvent, getEventParticipants } from '@/data/events';
import { Event, EventParticipant } from '@/types/events';
import { PageContainer } from '@/components/PageContainer';
import { Container } from '@/components/Container';
import ParticipantsDisplay from '@/components/ParticipantsDisplay';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';

interface ConnectPageProps {
  event: Event | null;
  participants: EventParticipant[];
}

const HeroSection = styled.section<{ imageUrl?: string }>`
  background:
    linear-gradient(
      135deg,
      rgba(19, 61, 90, 0.7) 0%,
      rgba(30, 16, 37, 0.7) 100%
    ),
    url(${({ imageUrl }) => imageUrl || "/images/art-night-07-02-25.png"});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const HeroTitle = styled.h1`
  font-family: "Baloo 2", cursive;
  font-size: 4rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  text-shadow:
    3px 3px 0px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.6rem;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  text-shadow:
    2px 2px 0px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const HeroLocation = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 1rem auto 0;
  position: relative;
  z-index: 1;
  text-shadow:
    2px 2px 0px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(0, 0, 0, 0.6);
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const EventStatus = styled.span<{ isActive: boolean }>`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 1rem;
  text-shadow: none;
  background: ${({ isActive }) => 
    isActive 
      ? 'rgba(67, 233, 123, 0.9)'
      : 'rgba(102, 126, 234, 0.9)'
  };
  color: white;
`;

const NoEventMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: white;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    opacity: 0.9;
  }
`;

const ShareButton = styled.button`
  display: block;
  width: auto;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #666;
  border: none;
  font-weight: 400;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  margin: 1rem auto 0;
  text-decoration: underline;
  text-align: center;

  &:hover {
    color: #333;
  }
`;

const QRCodeContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f0f0f0;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const QRCodeTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.8rem;
`;

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  margin: 0 auto 1rem;
  display: block;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const PageWrapper = styled.div`
  padding-bottom: 80px; /* Account for fixed bottom navigation */
`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const isEventActive = (event: Event) => {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  
  return now >= startDate && (!endDate || now <= endDate);
};

export default function ConnectPage({ event, participants }: ConnectPageProps) {
  const [showQRCode, setShowQRCode] = useState(false);

  const handleShareClick = () => {
    setShowQRCode(!showQRCode);
  };

  const generateQRCode = () => {
    const url = "https://artnightdetroit.com/connect";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrCodeUrl;
  };

  return (
    <PageContainer theme="dark" noPadding>
      <PageWrapper>
        {event ? (
          <>
            <HeroSection imageUrl={event.image_url}>
              <EventStatus isActive={isEventActive(event)}>
                {isEventActive(event) ? 'Happening Now' : 'Upcoming'}
              </EventStatus>
              <HeroTitle>{event.name}</HeroTitle>
              <HeroSubtitle>{formatDate(event.start_date)}</HeroSubtitle>
              <HeroSubtitle>
                {formatTime(event.start_date)}
                {event.end_date && ` - ${formatTime(event.end_date)}`}
              </HeroSubtitle>
              {event.location && <HeroLocation>{event.location}</HeroLocation>}
            </HeroSection>

            <Container>
              <ParticipantsDisplay
                participants={participants}
                showAddButton={false}
              />
              
              <ShareButton type="button" onClick={handleShareClick}>
                📱 Share Connect Page
              </ShareButton>
              
                          {showQRCode && (
              <QRCodeContainer>
                <QRCodeTitle>Scan to share this connect page</QRCodeTitle>
                <QRCodeImage src={generateQRCode()} alt="QR Code for connect page" />
              </QRCodeContainer>
            )}
            </Container>
            {event && <BottomNavigation eventId={event.id} />}
          </>
        ) : (
          <Container>
            <NoEventMessage>
              <h2>No Active Events</h2>
              <p>There are no active events currently happening or scheduled to start within the next 24 hours.</p>
              <p>Check back later for upcoming events!</p>
            </NoEventMessage>
          </Container>
        )}
        <Footer />
      </PageWrapper>
    </PageContainer>
  );
}

export const getServerSideProps: GetServerSideProps<ConnectPageProps> = async () => {
  try {
    const event = await getNextEvent();
    
    if (!event) {
      return {
        props: {
          event: null,
          participants: [],
        },
      };
    }

    const participants = await getEventParticipants(event.id);

    return {
      props: {
        event,
        participants,
      },
    };
  } catch (error) {
    console.error('Error fetching connect page data:', error);
    return {
      props: {
        event: null,
        participants: [],
      },
    };
  }
}; 