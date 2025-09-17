import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { GetServerSideProps } from 'next';
import { supabase } from '../../../../../lib/supabaseClient';

interface Event {
  id: string;
  name: string;
  start_date: string;
  location?: string;
  address?: string;
  image_url?: string;
}

interface Registration {
  id: string;
  name: string;
  phone: string;
  ticket_number: number;
  created_at: string;
  event_id: string;
}

interface RegistrationSuccessProps {
  event: Event;
  registration: Registration;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({  }) => {

  const generateDirectionsLink = () => {
    const address = "Russell Industrial Center, Art Building Unit 202, Detroit, MI";
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
  };

  return (
    <>
      <Head>
        <title>Registration Complete - Art Night Detroit</title>
        <meta name="description" content="Your Artist-Exclusive registration is confirmed" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <PageContainer>
        <SuccessCard>
          <Header>
            <EventImage src="/images/afters-ticket.png" alt="ArtistXclusive After Party" />
          </Header>

          <ContentSection>
            <SuccessIcon>
              <FontAwesomeIcon icon={faCheckCircle} />
            </SuccessIcon>
            
            <Title>You&apos;re in.</Title>
            <Subtitle>Thanks for registering for this Artist-Exclusive.</Subtitle>

            <LocationSection>
              <LocationTitle>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Location
              </LocationTitle>
              <LocationAddress>
                Russell Industrial Center<br />
                Art Building Unit 202
              </LocationAddress>
              <DirectionsButton href={generateDirectionsLink()} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Get Directions
              </DirectionsButton>
            </LocationSection>
          </ContentSection>

          <Footer>
            <FooterLogo src="/images/art-night-detroit-logo.png" alt="Art Night Detroit" />
          </Footer>
        </SuccessCard>
      </PageContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId, ticketNumber } = context.query;

  if (!eventId || !ticketNumber) {
    return {
      notFound: true,
    };
  }

  try {
    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return {
        notFound: true,
      };
    }

    // Get registration details
    const { data: registration, error: registrationError } = await supabase
      .from('ticket_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('ticket_number', ticketNumber)
      .single();

    if (registrationError || !registration) {
      return {
        redirect: {
          destination: `/tickets/register/${eventId}/${ticketNumber}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        event,
        registration,
      },
    };
  } catch (error) {
    console.error('Error fetching registration data:', error);
    return {
      notFound: true,
    };
  }
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
`;

const SuccessCard = styled.div`
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
`;

const Header = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EventImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  z-index: 1;
`;

const ContentSection = styled.div`
  padding: 3rem;
`;

const SuccessIcon = styled.div`
  text-align: center;
  color: #28a745;
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
  text-align: center;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
  margin: 0 0 2rem 0;
`;

const LocationSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const LocationTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LocationAddress = styled.div`
  font-size: 1rem;
  color: #495057;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const DirectionsButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s;
  
  &:hover {
    background: #5a6fd8;
    color: white;
    text-decoration: none;
  }
`;

const Footer = styled.div`
  background: #f8f9fa;
  text-align: center;
  padding: 1.5rem 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const FooterLogo = styled.img`
  height: 60px;
  width: auto;
`;

export default RegistrationSuccess;
