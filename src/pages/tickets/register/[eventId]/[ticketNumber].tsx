import React, { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getEvent } from '@/data/events';
import { Event } from '@/types/events';
import { useRouter } from 'next/router';

interface TicketRegistrationProps {
  event: Event;
  ticketNumber: string;
}

const TicketRegistration: React.FC<TicketRegistrationProps> = ({ event, ticketNumber }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventId: event.id,
    ticketNumber: ticketNumber
  });
  const [phoneError, setPhoneError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const validatePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it's a valid US phone number (10 digits)
    if (cleaned.length === 0) return '';
    if (cleaned.length !== 10) return 'Phone number must be 10 digits';

    return '';
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Apply formatting as user types
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear submit message when user starts typing
    if (submitMessage) {
      setSubmitMessage(null);
    }

    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      const error = validatePhoneNumber(value);
      setPhoneError(error);

      setFormData(prev => ({
        ...prev,
        phone: formattedPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.phone) {
      setSubmitMessage({
        type: 'error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    // Validate phone number
    const phoneValidationError = validatePhoneNumber(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to success page
        router.push(`/tickets/register/${event.id}/${ticketNumber}/success`);
      } else {
        setSubmitMessage({
          type: 'error',
          text: result.error || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error registering ticket:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>ArtistXclusive Ticket Registration - {event.name} | Art Night Detroit</title>
        <meta name="description" content={`Register your ArtistXclusive after-party ticket for ${event.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <PageContainer>
        <RegistrationCard>
          <Header hasImage={true}>
            <EventImage src="/images/afters-ticket.png" alt="ArtistXclusive After Party" />
          </Header>

          {/* <EventInfo>
            <EventName>{event.name}</EventName>
            <EventDate>{formatEventDate(event.start_date)}</EventDate>
            {event.location && <EventLocation>{event.location}</EventLocation>}
          </EventInfo> */}

          <MarketingSection>
            <MarketingTitle>🎨 Exclusive Studio After-Party</MarketingTitle>
            <MarketingContent>
              <p>
                Join fellow artists and creatives for an intimate after-party experience! 
                This exclusive gathering is designed for contributing artists, creators, 
                and art enthusiasts who want to connect and celebrate creativity.
              </p>

              <p>
                <strong>Limited capacity</strong> - This exclusive event prioritizes 
                contributing artists and active community members. Your ticket 
                guarantees entry to this special gathering.
              </p>
            </MarketingContent>
          </MarketingSection>

          <TicketInfo>
            <TicketLabel>Ticket Number</TicketLabel>
            <TicketNumber>#{ticketNumber}</TicketNumber>
          </TicketInfo>

          {submitMessage?.type === 'success' ? (
            <SuccessContainer>
              <SuccessIcon>
                <FontAwesomeIcon icon={faCheck} />
              </SuccessIcon>
              <SuccessTitle>Registration Complete!</SuccessTitle>
              <SuccessMessage>{submitMessage.text}</SuccessMessage>
              <SuccessDetails>
                <p><strong>You&apos;re all set! Here&apos;s what happens next:</strong></p>
                <ul>
                  <li>📱 <strong>Save this confirmation</strong> - Screenshot or bookmark this page</li>
                  <li>🎫 <strong>Bring your physical ticket</strong> - Keep it safe for entry</li>
                  <li>📍 <strong>Location details</strong> - You&apos;ll receive the exact after-party location via text</li>
                  <li>🕐 <strong>Timing</strong> - After-party typically starts 30-60 minutes after the main event</li>
                  <li>👥 <strong>Dress code</strong> - Creative casual, express yourself!</li>
                </ul>
                
                <ExcitementBox>
                  <p><strong>🎉 Get ready for an amazing night!</strong></p>
                  <p>
                    You&apos;re about to join an exclusive community of artists and creatives. 
                    Come ready to make new connections, share your passion for art, 
                    and celebrate creativity in an intimate setting.
                  </p>
                </ExcitementBox>
              </SuccessDetails>
            </SuccessContainer>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="name">Name / Handle *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name or artist handle"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                  style={{ borderColor: phoneError ? '#ff4444' : undefined }}
                />
                {phoneError && <ErrorMessage>{phoneError}</ErrorMessage>}
                <HelpText>We&apos;ll send you a confirmation text</HelpText>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="ticketNumber">Ticket Number</Label>
                <Input
                  type="text"
                  id="ticketNumber"
                  name="ticketNumber"
                  value={`#${formData.ticketNumber}`}
                  disabled
                />
              </FormGroup>

              <HouseRulesSection>
                <HouseRulesTitle>House Rules (read & agree):</HouseRulesTitle>
                <HouseRulesList>
                  <HouseRule>Respect the place.</HouseRule>
                  <HouseRule>No smoking cigarettes.</HouseRule>
                  <HouseRule>No hard drugs.</HouseRule>
                  <HouseRule>BYOB.</HouseRule>
                  <HouseRule>No drinks on the pool table.</HouseRule>
                  <HouseRule>Clean up after yourself.</HouseRule>
                  <HouseRule>Respect the art. Peace. ✌️</HouseRule>
                </HouseRulesList>
                
                <RulesAgreement>
                  <AgreementCheckbox>
                    <input
                      type="checkbox"
                      id="rulesAccepted"
                      checked={rulesAccepted}
                      onChange={(e) => setRulesAccepted(e.target.checked)}
                      required
                    />
                    <label htmlFor="rulesAccepted">
                      I understand and agree to the house rules.
                    </label>
                  </AgreementCheckbox>
                </RulesAgreement>
              </HouseRulesSection>

              <SubmitButton type="submit" disabled={isSubmitting || !rulesAccepted}>
                {isSubmitting ? 'Registering...' : 'Register Ticket'}
              </SubmitButton>

              {submitMessage && submitMessage.type === 'error' && (
                <ErrorContainer>
                  <ErrorIcon>
                    <FontAwesomeIcon icon={faTimes} />
                  </ErrorIcon>
                  <ErrorText>{submitMessage.text}</ErrorText>
                </ErrorContainer>
              )}
            </Form>
          )}

          <Footer>
            <FooterLogo src="/images/art-night-detroit-logo.png" alt="Art Night Detroit" />
          </Footer>
        </RegistrationCard>
      </PageContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId, ticketNumber } = context.params!;

  try {
    const event = await getEvent(eventId as string);
    
    if (!event) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        event,
        ticketNumber: ticketNumber as string,
      },
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return {
      notFound: true,
    };
  }
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
`;

const RegistrationCard = styled.div`
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
`;

const Header = styled.div<{ hasImage: boolean }>`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => !props.hasImage && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 180px;
  `}
`;

const EventImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  z-index: 1;
`;

const MarketingSection = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #fff5f8 100%);
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
`;

const MarketingTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #495057;
  margin: 0 0 0.5rem 0;
`;

const MarketingContent = styled.div`
  line-height: 1.6;
  color: #495057;

  p {
    margin: 0 0 1.5rem 0;
  }

  strong {
    color: #343a40;
  }
`;


const TicketInfo = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
`;

const TicketLabel = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TicketNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
`;

const Form = styled.form`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
  background-color: #fff;
  color: #212529;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }

  &:disabled {
    background-color: #e9ecef;
    color: #495057;
    border-color: #ced4da;
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const HelpText = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SuccessContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  color: #28a745;
  margin-bottom: 1rem;
`;

const SuccessTitle = styled.h2`
  color: #28a745;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.p`
  color: #495057;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const SuccessDetails = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;

  p {
    margin: 0 0 1rem 0;
    font-weight: 600;
    color: #495057;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.5rem;
    color: #6c757d;
  }
`;

const ExcitementBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  text-align: center;

  p {
    margin: 0 0 1rem 0;
    
    &:last-child {
      margin: 0;
    }
  }

  strong {
    color: white;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const ErrorIcon = styled.div`
  color: #721c24;
  font-size: 1.25rem;
`;

const ErrorText = styled.div`
  color: #721c24;
  font-weight: 500;
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

const HouseRulesSection = styled.div`
  border: 2px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: #f8f9ff;
`;

const HouseRulesTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 1rem 0;
`;

const HouseRulesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const HouseRule = styled.li`
  padding: 0.5rem 0;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:before {
    content: "•";
    color: #667eea;
    font-weight: bold;
    margin-right: 0.5rem;
  }
`;

const RulesAgreement = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

const AgreementCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #667eea;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  label {
    color: #495057;
    font-weight: 500;
    cursor: pointer;
    line-height: 1.4;
  }
`;

export default TicketRegistration;
