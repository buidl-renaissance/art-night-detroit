import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Event } from '@/types/events';

interface EventCardProps {
  event: Event;
  variant?: 'homepage' | 'events-page';
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventUrl = event.external_url ? event.external_url : `/events/${event.slug || event.id}`;

  return (
    <Link
      href={eventUrl}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <StyledEventCard>
        <EventImageWrapper>
          <EventImage src={event.image_url || '/images/art-night-07-02-25.png'} alt={event.name} />
        </EventImageWrapper>
          <EventContent>
          <EventTitle>{event.name}</EventTitle>
          <EventDate>
            {new Date(event.start_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {event.time_start && ` • ${event.time_start}`}
            {event.time_end && ` - ${event.time_end}`}
          </EventDate>
          {event.location && <EventLocation>{event.location}</EventLocation>}
          <EventDescription>{event.description}</EventDescription>
        </EventContent>
      </StyledEventCard>
    </Link>
  );
};

export default EventCard;

// Styled Components
const StyledEventCard = styled.div`
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
    width: 100%;
    height: auto;
    overflow: hidden;
    position: relative;
`;

const EventImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.5s ease;
  
  ${StyledEventCard}:hover & {
    transform: scale(1.05);
  }
`;

const EventContent = styled.div`
    padding: 1.5rem;
    background-color: white;
`;

const EventTitle = styled.h3`
  font-family: 'Baloo 2', cursive;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  color: #000;
  font-weight: 700;
`;

const EventDate = styled.p`
  font-size: 0.8rem;
  color: #444;
  margin-bottom: 0.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const EventLocation = styled.p`
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 0.5rem;
  font-style: italic;
`;

const EventDescription = styled.p`
  font-size: 0.8rem;
  line-height: 1.6;
  color: #333;
  flex-grow: 1;
`; 