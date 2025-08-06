import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import { PageContainer } from '@/components/PageContainer';
import { Container } from '@/components/Container';
import { getEvent, getEventParticipants } from '@/data/events';
import { Event, EventParticipant } from '@/types/events';
import { createClient } from '@supabase/supabase-js';
import ParticipantsDisplay from '@/components/ParticipantsDisplay';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';

interface AnonymousParticipant {
  id: string;
  event_id: string;
  email: string;
  full_name: string;
  tagline?: string;
  website?: string;
  instagram: string;
  role: string;
  image_url?: string;
  performance_details?: string;
  setup_requirements?: string;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface ParticipantsPageProps {
  event: Event;
  participants: EventParticipant[];
  anonymousParticipants: AnonymousParticipant[];
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
  font-size: 3rem;
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

export default function ParticipantsPage({ event, participants, anonymousParticipants }: ParticipantsPageProps) {
  const router = useRouter();
  const [showQRCode, setShowQRCode] = useState(false);

  const handleAddParticipant = () => {
    router.push(`/events/${event.id}/connect/add`);
  };

  const handleShareClick = () => {
    setShowQRCode(!showQRCode);
  };

  const generateQRCode = () => {
    const url = `https://artnightdetroit.com/events/${event.id}/connect`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrCodeUrl;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const startTime = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (!endDate) {
      return startTime;
    }

    const end = new Date(endDate);
    const endTime = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${startTime} - ${endTime}`;
  };

  return (
    <PageContainer theme="dark" noPadding>
      <PageWrapper>
        <HeroSection imageUrl={event.image_url}>
          <HeroTitle>{event.name}</HeroTitle>
          <HeroSubtitle>
            {formatDate(event.start_date)}
            <br />
            {formatTimeRange(event.start_date, event.end_date)}
          </HeroSubtitle>
        </HeroSection>

        <Container>
          <ParticipantsDisplay
            participants={participants}
            anonymousParticipants={anonymousParticipants}
            showAddButton={false}
            onAddParticipant={handleAddParticipant}
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
        <Footer />
        <BottomNavigation eventId={event.id} />
      </PageWrapper>
    </PageContainer>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const eventId = params?.eventId as string;

  if (!eventId) {
    return {
      notFound: true,
    };
  }

  try {
    const event = await getEvent(eventId);
    
    if (!event) {
      return {
        notFound: true,
      };
    }

    // Get authenticated participants
    const participants = await getEventParticipants(event.id);

    // Get anonymous participants
    const { data: anonymousParticipants } = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
      .from('anonymous_participants')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true });

    return {
      props: {
        event,
        participants: participants || [],
        anonymousParticipants: anonymousParticipants || [],
      },
    };
  } catch (error) {
    console.error('Error fetching event participants:', error);
    return {
      notFound: true,
    };
  }
}; 