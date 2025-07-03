import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Event } from '@/types/events';

interface RSVPModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onRSVPSuccess?: () => void;
}

interface RSVPData {
  handle: string;
  name: string;
  phone: string;
  email: string;
}

const RSVPModal: React.FC<RSVPModalProps> = ({ event, isOpen, onClose, onRSVPSuccess }) => {
  const [formData, setFormData] = useState<RSVPData>({
    handle: "",
    name: "",
    phone: "",
    email: "",
  });
  const [formStatus, setFormStatus] = useState<null | "success" | "error">(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [rsvpStats, setRsvpStats] = useState<{
    remaining_spots: number | null;
    confirmed: number;
    waitlisted: number;
  } | null>(null);
  const [lastRsvpStatus, setLastRsvpStatus] = useState<string>("confirmed");

  // Load user data from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('rsvp_user_data');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        } catch (error) {
          console.error('Failed to parse saved RSVP data:', error);
        }
      }

      // Load RSVP stats when modal opens
      const loadStats = async () => {
        try {
          const statsResponse = await fetch(`/api/rsvps/${event.id}/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setRsvpStats(statsData.stats.counts);
          }
        } catch (error) {
          console.error('Failed to load RSVP stats:', error);
        }
      };
      
      loadStats();
    }
  }, [isOpen, event.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: event.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If user has already RSVP'd, treat it as success
        if (response.status === 409 && data.error?.includes('already RSVP')) {
          setFormStatus("success");
          setErrorMessage("");
          setLastRsvpStatus("confirmed");
          
          // Save user data to localStorage
          localStorage.setItem('rsvp_user_data', JSON.stringify(formData));
          
          // Notify parent component of successful RSVP
          if (onRSVPSuccess) {
            onRSVPSuccess();
          }
          
          // Close modal after success
          setTimeout(() => {
            onClose();
          }, 2000);
          return;
        }
        
        setErrorMessage(data.error || "Failed to submit RSVP");
        throw new Error(data.error || "Failed to submit RSVP");
      }

      // Save user data to localStorage
      localStorage.setItem('rsvp_user_data', JSON.stringify(formData));

      setFormStatus("success");
      setErrorMessage("");
      setLastRsvpStatus(data.status || "confirmed");

      // Notify parent component of successful RSVP
      if (onRSVPSuccess) {
        onRSVPSuccess();
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("RSVP submission error:", error);
      setFormStatus("error");
    }
  };

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

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>RSVP for {event.name}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <EventInfo>
          <EventDate>{formatEventDate(event.start_date)}</EventDate>
          <EventTime>
            {formatEventTime(event.start_date)}
            {event.end_date && ` - ${formatEventTime(event.end_date)}`}
          </EventTime>
          {event.location && <EventLocation>{event.location}</EventLocation>}
          {rsvpStats && event?.attendance_limit && event.attendance_limit - rsvpStats.confirmed > 0 && (
            <SpotsRemaining>
              {`${event.attendance_limit - rsvpStats.confirmed} Spots Remaining`}
            </SpotsRemaining>
          )}
        </EventInfo>

        <RSVPForm onSubmit={handleSubmit}>
          {formStatus === "success" && (
            <SuccessMessage>
              {lastRsvpStatus === "waitlisted"
                ? "Thank you! You've been added to the waitlist. We'll notify you if a spot becomes available."
                : "Thank you for your RSVP! We'll see you at the event."}
            </SuccessMessage>
          )}
          {formStatus === "error" && (
            <ErrorMessage>
              {errorMessage || "There was an error submitting your RSVP. Please try again."}
            </ErrorMessage>
          )}
          
          <FormGroup>
            <FormLabel htmlFor="handle">Handle</FormLabel>
            <FormInput
              type="text"
              id="handle"
              name="handle"
              value={formData.handle}
              onChange={handleChange}
              placeholder="Your handle"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="name">Name</FormLabel>
            <FormInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="phone">Phone Number (Optional)</FormLabel>
            <FormInput
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </FormGroup>
          
          <SubmitButton type="submit">
            {rsvpStats && event?.attendance_limit && event.attendance_limit - rsvpStats.confirmed <= 0
              ? "Join Waitlist"
              : "Submit RSVP"}
          </SubmitButton>
        </RSVPForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RSVPModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const EventInfo = styled.div`
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
`;

const EventDate = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
`;

const EventTime = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.25rem 0;
`;

const EventLocation = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  font-style: italic;
`;

const SpotsRemaining = styled.div`
  background-color: #27AE60;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
`;

const RSVPForm = styled.form`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #333;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #27AE60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #219653;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`; 