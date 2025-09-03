import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faPlus, faTimes, faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../components/PageContainer';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';

interface FlyerSubmission {
  id: string;
  event_name: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone?: string;
  event_date: string;
  event_location: string;
  event_description: string;
  event_website?: string;
  instagram_handle?: string;
  ticket_price?: string;
  event_category: string;
  additional_notes?: string;
  flyer_image_url?: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'published';
  created_at: string;
}

interface QuickSubmissionData {
  flyerImage: File | null;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  additionalNotes: string;
  agreeToTerms: boolean;
}

const FlyersLandingPage = () => {
  const [flyers, setFlyers] = useState<FlyerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<QuickSubmissionData>({
    flyerImage: null,
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    additionalNotes: '',
    agreeToTerms: false,
  });

  useEffect(() => {
    fetchApprovedFlyers();
  }, []);

  const fetchApprovedFlyers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flyer_submissions')
        .select('*')
        .in('status', ['approved', 'published'])
        .gte('event_date', new Date().toISOString()) // Only future events
        .order('event_date', { ascending: true });

      if (error) throw error;
      setFlyers(data || []);
    } catch (error) {
      console.error('Error fetching flyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? target.checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      flyerImage: file
    }));

    // If a file is selected, automatically extract information
    if (file) {
      await extractFlyerInformation(file);
    }
  };

  const extractFlyerInformation = async (file: File) => {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('flyerImage', file);

      const response = await fetch('/api/extract-flyer-info', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract flyer information');
      }

      // The extraction will auto-populate form fields
      console.log('Extracted information:', result);
    } catch (error) {
      console.error('Error extracting flyer information:', error);
      // Continue with manual entry if extraction fails
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      if (!formData.flyerImage) {
        throw new Error('Please upload a flyer image');
      }

      const submitFormData = new FormData();
      submitFormData.append('flyerImage', formData.flyerImage);
      submitFormData.append('organizerName', formData.organizerName);
      submitFormData.append('organizerEmail', formData.organizerEmail);
      submitFormData.append('organizerPhone', formData.organizerPhone);
      submitFormData.append('additionalNotes', formData.additionalNotes);
      submitFormData.append('agreeToTerms', formData.agreeToTerms.toString());
      submitFormData.append('isQuickSubmission', 'true');

      const response = await fetch('/api/submit-flyer', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit flyer');
      }

      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        flyerImage: null,
        organizerName: '',
        organizerEmail: '',
        organizerPhone: '',
        additionalNotes: '',
        agreeToTerms: false,
      });

      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'art-exhibition': 'Art Exhibition',
      'music-performance': 'Music Performance',
      'dance-performance': 'Dance Performance',
      'theater': 'Theater',
      'workshop': 'Workshop',
      'community-event': 'Community Event',
      'fundraiser': 'Fundraiser',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  return (
    <PageContainer theme="dark">
      <Container>
        <HeroSection>
          <Title>Community Events</Title>
          <Subtitle>
            Discover upcoming events in Detroit&apos;s vibrant creative community
          </Subtitle>
          <SubmitButton onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Submit Your Event
          </SubmitButton>
        </HeroSection>

        <FlyersSection>
          {loading ? (
            <LoadingText>Loading events...</LoadingText>
          ) : flyers.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📅</EmptyIcon>
              <EmptyTitle>No upcoming events</EmptyTitle>
              <EmptySubtitle>Be the first to share your event with the community!</EmptySubtitle>
            </EmptyState>
          ) : (
            <FlyersGrid>
              {flyers.map((flyer) => (
                <FlyerCard key={flyer.id}>
                  <FlyerImageContainer>
                    {flyer.flyer_image_url ? (
                      <FlyerImage src={flyer.flyer_image_url} alt={flyer.event_name} />
                    ) : (
                      <PlaceholderImage>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </PlaceholderImage>
                    )}
                    <CategoryBadge>{getCategoryDisplay(flyer.event_category)}</CategoryBadge>
                  </FlyerImageContainer>

                  <FlyerContent>
                    <EventTitle>{flyer.event_name}</EventTitle>
                    
                    <EventDetails>
                      <DetailRow>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>
                          {formatDate(flyer.event_date)} at {formatTime(flyer.event_date)}
                        </span>
                      </DetailRow>
                      
                      <DetailRow>
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{flyer.event_location}</span>
                      </DetailRow>

                      {flyer.ticket_price && (
                        <PriceTag>{flyer.ticket_price}</PriceTag>
                      )}
                    </EventDetails>

                    <EventDescription>{flyer.event_description}</EventDescription>

                    {flyer.event_website && (
                      <EventLink
                        href={flyer.event_website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn More
                      </EventLink>
                    )}
                  </FlyerContent>
                </FlyerCard>
              ))}
            </FlyersGrid>
          )}
        </FlyersSection>

        {/* Quick Submission Modal */}
        {showModal && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Submit Your Event Flyer</ModalTitle>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>

              <ModalContent>
                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label>Event Flyer *</Label>
                    <FileUploadWrapper>
                      <FileInput
                        type="file"
                        name="flyerImage"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                        id="flyerImageInput"
                      />
                      <FileUploadLabel htmlFor="flyerImageInput">
                        <FontAwesomeIcon icon={faUpload} />
                        {formData.flyerImage ? formData.flyerImage.name : 'Choose flyer image...'}
                      </FileUploadLabel>
                    </FileUploadWrapper>
                    <HelperText>
                      Upload your event flyer and our AI will automatically extract event details!
                    </HelperText>
                    {isExtracting && (
                      <ExtractionStatus>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Extracting event information from your flyer...
                      </ExtractionStatus>
                    )}
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <Label>Your Name *</Label>
                      <Input
                        type="text"
                        name="organizerName"
                        value={formData.organizerName}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        name="organizerEmail"
                        value={formData.organizerEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      name="organizerPhone"
                      value={formData.organizerPhone}
                      onChange={handleInputChange}
                      placeholder="(xxx) xxx-xxxx"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Additional Notes</Label>
                    <TextArea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </FormGroup>

                  <FormGroup>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                      />
                      I agree that Art Night Detroit may share this event information and confirm I have the right to share this flyer. *
                    </CheckboxLabel>
                  </FormGroup>

                  {submitStatus === 'success' && (
                    <SuccessMessage>
                      🎉 Thank you! Your flyer has been submitted for review.
                    </SuccessMessage>
                  )}

                  {submitStatus === 'error' && (
                    <ErrorMessage>
                      ❌ {errorMessage}
                    </ErrorMessage>
                  )}

                  <ModalActions>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.agreeToTerms}
                      style={{
                        background: isSubmitting ? '#666' : 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        width: '100%'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Event Flyer'}
                    </Button>
                  </ModalActions>
                </form>
              </ModalContent>
            </Modal>
          </ModalOverlay>
        )}
      </Container>
    </PageContainer>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 0;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: #B0B0B0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto 2rem;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #4ECDC4, #45B7D1);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
  }
`;

const FlyersSection = styled.div`
  padding: 2rem 0;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #B0B0B0;
  font-size: 1.2rem;
  margin: 3rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  color: #FFFFFF;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const EmptySubtitle = styled.p`
  color: #B0B0B0;
  font-size: 1.1rem;
`;

const FlyersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FlyerCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const FlyerImageContainer = styled.div`
  position: relative;
  height: 250px;
  overflow: hidden;
`;

const FlyerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
`;

const CategoryBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(78, 205, 196, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const FlyerContent = styled.div`
  padding: 1.5rem;
`;

const EventTitle = styled.h3`
  color: #FFFFFF;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  line-height: 1.3;
`;

const EventDetails = styled.div`
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #E0E0E0;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  
  svg {
    color: #4ECDC4;
    width: 16px;
  }
`;

const PriceTag = styled.div`
  background: rgba(255, 107, 107, 0.2);
  color: #FF6B6B;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  margin-top: 0.5rem;
`;

const EventDescription = styled.p`
  color: #B0B0B0;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EventLink = styled.a`
  color: #4ECDC4;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const Modal = styled.div`
  background: #1A1A1A;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: #FFFFFF;
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #B0B0B0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #FFFFFF;
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  color: #E0E0E0;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4ECDC4;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }
  
  &::placeholder {
    color: #888;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4ECDC4;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }
  
  &::placeholder {
    color: #888;
  }
`;

const FileUploadWrapper = styled.div`
  position: relative;
  overflow: hidden;
  display: inline-block;
  width: 100%;
`;

const FileInput = styled.input`
  position: absolute;
  left: -9999px;
`;

const FileUploadLabel = styled.label`
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #FFFFFF;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: #4ECDC4;
    background: rgba(78, 205, 196, 0.1);
  }
`;

const HelperText = styled.p`
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const ExtractionStatus = styled.div`
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  color: #4ECDC4;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #E0E0E0;
  font-size: 0.95rem;
  line-height: 1.5;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin-top: 0.25rem;
    transform: scale(1.2);
    accent-color: #4ECDC4;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  border-radius: 8px;
  padding: 1rem;
  color: #81C784;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 8px;
  padding: 1rem;
  color: #EF5350;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const ModalActions = styled.div`
  margin-top: 1.5rem;
`;

export default FlyersLandingPage;
