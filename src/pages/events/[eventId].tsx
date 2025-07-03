import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { Event } from '@/types/events';
import { getEvent } from '@/data/events';
import { Button } from '@/components/Button';
import Footer from '@/components/Footer';

interface EventPageProps {
    event: Event;
}

const EventPage: React.FC<EventPageProps> = ({ event }) => {
    return (
        <>
            <PageContainer>
                <Head>
                    <title>{event.name} | Events</title>
                    <meta name="description" content={event.description} />
                </Head>

                <BackButtonContainer>
                    <Link href="/events" passHref>
                        <Button variant="secondary">
                            ← Back to All Events
                        </Button>
                    </Link>
                </BackButtonContainer>

                <HeroSection>
                    {event.image_url && (
                        <EventImage src={event.image_url} alt={event.name} />
                    )}
                    <EventTitle>{event.name}</EventTitle>
                </HeroSection>

                <EventDetails>
                    <DetailItem>
                        <DetailLabel>Date:</DetailLabel>
                        <DetailValue>
                            {(() => {
                                const startDate = new Date(event.start_date);
                                const endDate = event.end_date ? new Date(event.end_date) : null;

                                if (!endDate || startDate.toDateString() === endDate.toDateString()) {
                                    // Same date or no end date
                                    return startDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    });
                                } else {
                                    // Different dates
                                    return `${startDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} - ${endDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}`;
                                }
                            })()}
                        </DetailValue>
                    </DetailItem>

                    <DetailItem>
                        <DetailLabel>Time:</DetailLabel>
                        <DetailValue>
                            {(() => {
                                const startDate = new Date(event.start_date);
                                const endDate = event.end_date ? new Date(event.end_date) : null;

                                const startTime = startDate.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                });

                                if (!endDate) {
                                    return startTime;
                                }

                                const endTime = endDate.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                });

                                return `${startTime} - ${endTime}`;
                            })()}
                        </DetailValue>
                    </DetailItem>

                    {event.location && (
                        <DetailItem>
                            <DetailLabel>Location:</DetailLabel>
                            <DetailValue>{event.location}</DetailValue>
                        </DetailItem>
                    )}
                </EventDetails>

                {event.description && (
                    <Description>{event.description}</Description>
                )}

            </PageContainer>
            <Footer />
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId } = context.params as { eventId: string };

    try {
        const event = await getEvent(eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        console.log('event', event);

        return {
            props: {
                event,
            },
        };
    } catch (error) {
        console.error('Error fetching event:', error);
        return {
            notFound: true,
        };
    }
};

export default EventPage;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: white;
`;

const BackButtonContainer = styled.div`
  margin-bottom: 2rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const EventImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const EventTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const EventDetails = styled.div`
  margin-bottom: 2rem;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  min-width: 100px;
`;

const DetailValue = styled.span`
  color: #e0e0e0;
`;

const Description = styled.div`
  line-height: 1.6;
  color: #f0f0f0;
  white-space: pre-wrap;
`;
