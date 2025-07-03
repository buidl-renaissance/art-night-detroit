import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/events";
import RSVPList from "@/components/RSVPList";

const RSVPListPage = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const [event, setEvent] = useState<Event | null>(null);
  
  const { fetchEvent } = useEvents();

  useEffect(() => {
    if (eventId && typeof eventId === 'string') {
      loadEvent(eventId);
    }
  }, [eventId]);

  const loadEvent = async (id: string) => {
    try {
      const eventData = await fetchEvent(id);
      if (eventData) {
        setEvent(eventData);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
    }
  };

  return (
    <PageContainer>
      <Head>
        <title>RSVP List | {event?.name || 'Event'} | Art Night Detroit</title>
        <meta
          name="description"
          content={`RSVP list for ${event?.name || 'event'}`}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Header>
        <HeaderContent>
          <Title>RSVP List</Title>
        </HeaderContent>
      </Header>

      <Content>
        {eventId && typeof eventId === 'string' && (
          <RSVPList 
            eventId={eventId}
            event={event}
            showEventInfo={true}
            showStats={true}
            showTable={true}
            showHandlesOnly={true}
            title="RSVP List"
          />
        )}
      </Content>
    </PageContainer>
  );
};

export default RSVPListPage;

// Styled Components
const PageContainer = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #222;
  max-width: 100%;
  overflow-x: hidden;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 2rem;
  text-align: center;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: "Baloo 2", cursive;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`; 