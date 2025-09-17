import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { getEvent } from '@/data/events';
import { Event } from '@/types/events';
import QRCode from 'react-qr-code';

interface EventTicketsPrintProps {
  event: Event;
}

const EventTicketsPrint: React.FC<EventTicketsPrintProps> = ({ event }) => {
  const getTicketRegistrationUrl = (ticketNumber: number) => {
    return `https://artnightdetroit.com/tickets/register/${event.id}/${ticketNumber}`;
  };

  const printPage = () => {
    window.print();
  };

  // Generate ticket numbers
  const ticketNumbers = Array.from({ length: 40 }, (_, index) => index + 1);

  return (
    <>
      <Head>
        <title>{event.name} - Event Tickets | Art Night Detroit</title>
        <meta name="description" content={`Printable tickets for ${event.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <PageContainer>
        <TicketsContainer>
          {ticketNumbers.map((ticketNumber) => (
            <Ticket key={ticketNumber}>
              {/* Left Side - Event Information */}
              <TicketLeft>
                {/* <TicketInfo>
                  <TicketTitle>{event.name}</TicketTitle>
                  <TicketDate>
                    {new Date(event.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </TicketDate>
                  {event.location && (
                    <TicketLocation>{event.location}</TicketLocation>
                  )}
                  <TicketNumber>#{ticketNumber}</TicketNumber>
                  <BrandText>Art Night Detroit</BrandText>
                </TicketInfo> */}
              </TicketLeft>

              {/* Right Side - Full Height QR Code */}
              <TicketRight>
                <QRCodeSection>
                  <QRCodeWrapper>
                    <QRCode
                      value={getTicketRegistrationUrl(ticketNumber)}
                      size={96}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </QRCodeWrapper>
                </QRCodeSection>
              </TicketRight>
            </Ticket>
          ))}
        </TicketsContainer>

        <PrintButton onClick={printPage}>
          <FontAwesomeIcon icon={faPrint} />
          Print Tickets
        </PrintButton>
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

const TicketsContainer = styled.div`
  max-width: 8.5in;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.1in;
  
  @media print {
    max-width: none;
    margin: 0;
    gap: 0.05in;
  }
`;

const Ticket = styled.div`
  /* background: white; */
  /* border: 2px solid #333; */
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  width: 5in;
  height: 1.6in;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  page-break-inside: avoid;
  background-image: url(/images/afters-ticket.png);
  background-size: 68%;
  background-position: inherit;
  background-repeat: no-repeat;
  
  @media print {
    box-shadow: none;
  }
`;

const TicketLeft = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.15in;
`;


const TicketRight = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.1in;
`;

const QRCodeSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const QRCodeWrapper = styled.div`
  width: 1.2in;
  height: 1.2in;
  border: 2px solid #333;
  border-radius: 4px;
  background: white;
  padding: 0.1in;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media print {
    border: 2px solid #000;
  }
  
  svg {
    width: 100%;
    height: 100%;
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

export default EventTicketsPrint;
