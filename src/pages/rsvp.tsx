import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/events";

const RSVPPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    handle: "",
    name: "",
    phone: "",
    email: "",
  });
  const [formStatus, setFormStatus] = useState<null | "success" | "error">(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Hardcoded event ID
  const EVENT_ID = "744f84a0-9e72-478f-9ff1-8a8e0360e3c5";
  
  const { fetchEvent } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEvent(EVENT_ID);
        if (eventData) {
          setEvent(eventData);
        } else {
          setError("Event not found");
        }
      } catch {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, []);

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
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: EVENT_ID,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to submit RSVP');
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      setFormStatus("success");
      setErrorMessage("");
      setFormData({
        handle: "",
        name: "",
        phone: "",
        email: "",
      });
      
      // Redirect to success page with event name
      setTimeout(() => {
        router.push(`/rsvp/success?eventName=${encodeURIComponent(event?.name || '')}`);
      }, 1500);
    } catch (error) {
      console.error('RSVP submission error:', error);
      setFormStatus("error");
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingText>Loading event details...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !event) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorMessage>
            {error || "Event not found"}
          </ErrorMessage>
          <BackLink href="/events">← Back to Events</BackLink>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Head>
        <title>RSVP | {event.name} | Art Night Detroit</title>
        <meta
          name="description"
          content={`RSVP to ${event.name} - ${event.description || 'Join us for this amazing event'}`}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <HeroSection>
        <HeroTitle>{event.name}</HeroTitle>
        <HeroSubtitle>{formatEventDate(event.start_date)}</HeroSubtitle>
        <HeroSubtitle>
          {formatEventTime(event.start_date)}
          {event.end_date && ` - ${formatEventTime(event.end_date)}`}
        </HeroSubtitle>
        {event.location && (
          <HeroLocation>{event.location}</HeroLocation>
        )}
      </HeroSection>

      <RSVPContainer>
        <RSVPForm onSubmit={handleSubmit}>
          {formStatus === "success" && (
            <SuccessMessage>
              Thank you for your RSVP! We&apos;ll see you at the event.
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
          <SubmitButton type="submit">Submit RSVP</SubmitButton>
        </RSVPForm>
      </RSVPContainer>

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

export default RSVPPage;

// Styled Components
const PageContainer = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #222;
  max-width: 100%;
  overflow-x: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 2rem;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
`;

const BackLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  margin-top: 1rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HeroSection = styled.section`
  background:
    linear-gradient(
      135deg,
      rgba(19, 61, 90, 0.5) 0%,
      rgba(30, 16, 37, 0.5) 100%
    ),
    url("/images/art-night-07-02-25.png");
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
`;

const HeroTitle = styled.h1`
  font-family: "Baloo 2", cursive;
  font-size: 4rem;
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
  font-size: 1.6rem;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  text-shadow:
    2px 2px 0px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const HeroLocation = styled.p`
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

const RSVPContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto 5rem;
  padding: 0 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const RSVPForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.6rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background-color: #f8f8f8;
  color: #000000;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SubmitButton = styled.button`
  display: block;
  width: 100%;
  padding: 1rem 2rem;
  background-color: #c0392b;
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: #a93226;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: #d5f5e3;
  border-left: 4px solid #27ae60;
  color: #1e8449;
  margin-bottom: 1.5rem;
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #fadbd8;
  border-left: 4px solid #c0392b;
  color: #922b21;
  margin-bottom: 1.5rem;
  border-radius: 4px;
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
