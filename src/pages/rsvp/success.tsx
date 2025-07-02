import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/events";
import RSVPList from "@/components/RSVPList";

const RSVPSuccessPage = () => {
  const { events, loading } = useEvents();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      const upcoming = events
        .filter((event) => new Date(event.start_date) > now)
        .sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
      setUpcomingEvents(upcoming);
    }
  }, [events]);

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <PageContainer>
      <Head>
        <title>RSVP Confirmed | Art Night Detroit</title>
        <meta
          name="description"
          content="Your RSVP has been confirmed! Check out our upcoming events."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <SuccessSection>
        <SuccessIcon>✓</SuccessIcon>
        <SuccessTitle>RSVP Confirmed!</SuccessTitle>
      </SuccessSection>

      <UpcomingEventsSection>
        <SectionTitle>Upcoming Events</SectionTitle>
        <SectionSubtitle>
          Don&apos;t miss out on these amazing upcoming events!
        </SectionSubtitle>

        {loading ? (
          <LoadingContainer>
            <LoadingText>Loading upcoming events...</LoadingText>
          </LoadingContainer>
        ) : upcomingEvents.length > 0 ? (
          <EventsGrid>
            {upcomingEvents.map((event) => (
              <EventCard key={event.id}>
                {event.image_url && (
                  <EventImage src={event.image_url} alt={event.name} />
                )}
                <EventContent>
                  <EventTitle>{event.name}</EventTitle>
                  <EventDate>{formatEventDate(event.start_date)}</EventDate>
                  <EventTime>
                    {formatEventTime(event.start_date)}
                    {event.end_date && ` - ${formatEventTime(event.end_date)}`}
                  </EventTime>
                  {event.location && (
                    <EventLocation>{event.location}</EventLocation>
                  )}
                  {event.description && (
                    <EventDescription>{event.description}</EventDescription>
                  )}
                  {event.id === "744f84a0-9e72-478f-9ff1-8a8e0360e3c5" && (
                    <RSVPList
                      eventId="744f84a0-9e72-478f-9ff1-8a8e0360e3c5"
                      showEventInfo={false}
                      showStats={false}
                      showTable={true}
                      showHandlesOnly={true}
                    />
                  )}
                </EventContent>
              </EventCard>
            ))}
          </EventsGrid>
        ) : (
          <NoEventsMessage>
            No upcoming events at the moment. Check back soon!
          </NoEventsMessage>
        )}
      </UpcomingEventsSection>

      <Footer>
        <FooterContent>
          <FooterTitle>Art Night Detroit</FooterTitle>
          <FooterLinks>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/events">Events</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </PageContainer>
  );
};

export default RSVPSuccessPage;

// Styled Components
const PageContainer = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #222;
  max-width: 100%;
  overflow-x: hidden;
`;

const SuccessSection = styled.section`
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  padding: 2rem 2rem;
  text-align: center;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: 3rem;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.2);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const SuccessTitle = styled.h1`
  font-family: "Baloo 2", cursive;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const UpcomingEventsSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding: 0 2rem;
`;

const SectionTitle = styled.h2`
  font-family: "Baloo 2", cursive;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #cccccc;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 3rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: #666;
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EventCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`;

const EventImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const EventContent = styled.div`
  padding: 1.5rem;
`;

const EventTitle = styled.h3`
  font-family: "Baloo 2", cursive;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const EventDate = styled.p`
  font-size: 1rem;
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const EventTime = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const EventLocation = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  font-style: italic;
`;

const EventDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NoEventsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const Footer = styled.footer`
  background-color: #222;
  color: white;
  padding: 3rem 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const FooterTitle = styled.h2`
  font-family: "Baloo 2", cursive;
  font-size: 1.8rem;
  margin: 0;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
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
    background: #8e44ad;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #f7dc6f;

    &:after {
      width: 100%;
    }
  }
`;
