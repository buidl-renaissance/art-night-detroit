import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Event } from '@/types/events';
import RSVPModal from './RSVPModal';
import ProcessedEventDescription from './EventDescription';

interface EventCardProps {
  event: Event;
}

interface RSVPData {
  handle: string;
  name: string;
  phone: string;
  email: string;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const eventUrl = event.external_url ? event.external_url : `/events/${event.slug || event.id}`;
  
  // Check if this is a future event
  const isFutureEvent = new Date(event.start_date) >= new Date();

  // Check if user has RSVP'd for this event
  useEffect(() => {
    const checkRSVPStatus = async () => {
      try {
        const savedData = localStorage.getItem('rsvp_user_data');
        if (savedData) {
          const userData: RSVPData = JSON.parse(savedData);
          
          // Check if user has RSVP'd for this specific event
          const response = await fetch(`/api/rsvps/${event.id}?email=${encodeURIComponent(userData.email)}`);
          if (response.ok) {
            const rsvpData = await response.json();
            setHasRSVPd(rsvpData.rsvp !== null);
          }
        }
      } catch (error) {
        console.error('Failed to check RSVP status:', error);
      }
    };

    if (isFutureEvent) {
      checkRSVPStatus();
    }
  }, [event.id, isFutureEvent]);
  
  const handleRSVP = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRSVPModal(true);
  };

  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(eventUrl, event.external_url ? '_blank' : '_self');
  };

  const handleRSVPSuccess = () => {
    setHasRSVPd(true);
  };
  
  return (
    <>
      <StyledEventCard>
        <EventImageWrapper>
          <EventImage src={event.image_url || '/images/art-night-detroit-logo-banner.png'} alt={event.name} />
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
          {event.description && <ProcessedEventDescription className="event-description">{event.description}</ProcessedEventDescription>}
          <ButtonContainer>
            {isFutureEvent && (
              <RSVPButton onClick={handleRSVP} $hasRSVPd={hasRSVPd}>
                {hasRSVPd ? 'Going' : 'RSVP'}
              </RSVPButton>
            )}
            <LearnMoreButton onClick={handleLearnMore}>
              Learn More
            </LearnMoreButton>
          </ButtonContainer>
        </EventContent>
      </StyledEventCard>
      
      {showRSVPModal && (
        <RSVPModal 
          event={event} 
          isOpen={showRSVPModal} 
          onClose={() => setShowRSVPModal(false)}
          onRSVPSuccess={handleRSVPSuccess}
        />
      )}
    </>
  );
};

export default EventCard;

// Styled Components
const StyledEventCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #34495E;
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(255, 215, 0, 0.25);
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
  background-color:rgb(71, 71, 71);
  border-bottom: 3px solid #C19A6B;
  
  ${StyledEventCard}:hover & {
    transform: scale(1.05);
  }
`;

const EventContent = styled.div`
  padding: 1.5rem;
  background-color: #34495E;

  .event-description {
    font-size: 0.8rem;
    line-height: 1.6;
    color: #ECF0F1;
    flex-grow: 1;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const EventTitle = styled.h3`
  font-family: 'Baloo 2', cursive;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  color: #FFFFFF;
  font-weight: 700;
`;

const EventDate = styled.p`
  font-size: 0.8rem;
  color: #BDC3C7;
  margin-bottom: 0.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const EventLocation = styled.p`
  font-size: 0.8rem;
  color: #95A5A6;
  margin-bottom: 0.5rem;
  font-style: italic;
`;



const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const LearnMoreButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3);
  }
`;

const RSVPButton = styled.button<{ $hasRSVPd: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$hasRSVPd 
    ? 'linear-gradient(135deg, #27AE60 0%, #219653 100%)' 
    : 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${props => props.$hasRSVPd 
    ? '0 4px 12px rgba(39, 174, 96, 0.3)' 
    : '0 4px 12px rgba(231, 76, 60, 0.3)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${props => props.$hasRSVPd 
      ? 'linear-gradient(135deg, #219653 0%, #1E8449 100%)' 
      : 'linear-gradient(135deg, #C0392B 0%, #A93226 100%)'};
    transform: translateY(-3px);
    box-shadow: ${props => props.$hasRSVPd 
      ? '0 8px 20px rgba(39, 174, 96, 0.4)' 
      : '0 8px 20px rgba(231, 76, 60, 0.4)'};
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: ${props => props.$hasRSVPd 
      ? '0 4px 12px rgba(39, 174, 96, 0.3)' 
      : '0 4px 12px rgba(231, 76, 60, 0.3)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: ${props => props.$hasRSVPd 
      ? '0 0 0 3px rgba(39, 174, 96, 0.3), 0 4px 12px rgba(39, 174, 96, 0.3)' 
      : '0 0 0 3px rgba(231, 76, 60, 0.3), 0 4px 12px rgba(231, 76, 60, 0.3)'};
  }
`; 