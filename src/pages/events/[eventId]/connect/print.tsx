import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { getEvent } from '@/data/events';
import { Event } from '@/types/events';
import QRCode from 'react-qr-code';

interface EventConnectPrintProps {
  event: Event;
}

const EventConnectPrint: React.FC<EventConnectPrintProps> = ({ event }) => {
  const eventConnectUrl = `https://artnightdetroit.com/events/${event.id}/connect`;

  const printPage = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>{event.name} - Event Flyer | Art Night Detroit</title>
        <meta name="description" content={`Marketing flyer for ${event.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <PageContainer>
        <FlyerContainer>
          {/* Header Section */}
          {/* <FlyerHeader>
            <BrandSection>
              <LogoImage src="/images/art-night-detroit-logo.png" alt="Art Night Detroit" />
              <BrandText>Art Night Detroit</BrandText>
            </BrandSection>
            <EventSection>
              <EventTitle>{event.name}</EventTitle>
              {event.description && (
                <EventDescription>{event.description}</EventDescription>
              )}
            </EventSection>
          </FlyerHeader> */}

          {/* Event Image Section */}
          {event.image_url && (
            <EventImageSection>
              <EventImage src={event.image_url} alt={event.name} />
            </EventImageSection>
          )}

          {/* Event Details Section */}
          {/* <EventDetailsSection>
            <DetailCard>
              <DetailIcon>
                <FontAwesomeIcon icon={faCalendarAlt} />
              </DetailIcon>
              <DetailContent>
                <DetailLabel>Date & Time</DetailLabel>
                <DetailValue>{formatDate(event.start_date)}</DetailValue>
                <DetailTime>{formatDateTime(event.start_date)}</DetailTime>
                {event.end_date && (
                  <DetailTime>Ends: {formatDateTime(event.end_date)}</DetailTime>
                )}
              </DetailContent>
            </DetailCard>

            {event.location && (
              <DetailCard>
                <DetailIcon>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Location</DetailLabel>
                  <DetailValue>{event.location}</DetailValue>
                </DetailContent>
              </DetailCard>
            )}
          </EventDetailsSection> */}

          {/* QR Code Section */}
          <QRCodeSection>
            <QRCodeContainer>
              <QRCodeWrapper>
                <QRCode
                  value={eventConnectUrl}
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </QRCodeWrapper>
              <QRCodeText>
                <QRCodeTitle>Connect & Network</QRCodeTitle>
                <QRCodeDescription>
                  Scan the QR code to access the event connect page and network with fellow artists!
                </QRCodeDescription>
              </QRCodeText>
            </QRCodeContainer>
          </QRCodeSection>

          {/* Footer */}
          <FlyerFooter>
            <FooterText>
              <strong>Art Night Detroit</strong> - Building Community Through Art
            </FooterText>
            <FooterText>
              Join us for an evening of creativity, connection, and community!
            </FooterText>
          </FlyerFooter>

          <PrintButton onClick={printPage}>
            <FontAwesomeIcon icon={faPrint} />
            Print Flyer
          </PrintButton>
        </FlyerContainer>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  background: #f8f8f8;
  padding: 20px;
  
  @media print {
    width: auto;
    height: auto;
    background: white;
    padding: 0.25in;
  }
`;

const FlyerContainer = styled.div`
  max-width: 6.5in;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  
  @media print {
    box-shadow: none;
    border-radius: 0;
    max-width: none;
    margin: 0;
  }
`;

const EventImageSection = styled.div`
  padding: 0;
  background: white;
  text-align: center;
  max-width: 70%;
  margin: 0 auto;
`;

const EventImage = styled.img`
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: auto;
  object-fit: cover;
  display: block;
`;



const QRCodeSection = styled.div`
  padding: 0.4in;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  text-align: center;
`;

const QRCodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3in;
  max-width: 600px;
  margin: 0 auto;
  
  @media print {
    gap: 0.2in;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.2in;
  }
`;

const QRCodeWrapper = styled.div`
  width: 150px;
  height: 150px;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media print {
    width: 256px;
    height: 256px;
    padding: 8px;
  }
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const QRCodeText = styled.div`
  flex: 1;
  text-align: left;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const QRCodeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 0.1in 0;
  font-family: "Baloo 2", sans-serif;
  
  @media print {
    font-size: 2rem;
  }
`;

const QRCodeDescription = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
  
  @media print {
    font-size: 0.9rem;
  }
`;

const FlyerFooter = styled.div`
  text-align: center;
  padding: 0.1in;
  background: #333;
  color: white;
`;

const FooterText = styled.p`
  margin: 0.05in 0;
  font-size: 0.9rem;
  
  @media print {
    font-size: 0.8rem;
  }
`;

const PrintButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  
  &:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
  }
  
  @media print {
    display: none;
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId } = context.params as { eventId: string };

  try {
    const event = await getEvent(eventId);

    if (!event) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        event,
      },
    };
  } catch (error) {
    console.error('Error fetching event data:', error);
    return {
      notFound: true,
    };
  }
};

export default EventConnectPrint;
