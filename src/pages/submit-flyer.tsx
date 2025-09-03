import React, { useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faUpload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../components/PageContainer';
import { Button } from '../components/ui/Button';

interface FlyerSubmissionData {
  eventName: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  eventWebsite: string;
  instagramHandle: string;
  ticketPrice: string;
  eventCategory: string;
  flyerImage: File | null;
  additionalNotes: string;
  agreeToTerms: boolean;
}

const SubmitFlyerPage = () => {
  const [formData, setFormData] = useState<FlyerSubmissionData>({
    eventName: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventDescription: '',
    eventWebsite: '',
    instagramHandle: '',
    ticketPrice: '',
    eventCategory: '',
    flyerImage: null,
    additionalNotes: '',
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? target.checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      flyerImage: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const submitData = new FormData();
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'flyerImage' && value !== null) {
          submitData.append(key, value.toString());
        }
      });

      // Add file if present
      if (formData.flyerImage) {
        submitData.append('flyerImage', formData.flyerImage);
      }

      const response = await fetch('/api/submit-flyer', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit flyer');
      }

      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        eventName: '',
        organizerName: '',
        organizerEmail: '',
        organizerPhone: '',
        eventDate: '',
        eventTime: '',
        eventLocation: '',
        eventDescription: '',
        eventWebsite: '',
        instagramHandle: '',
        ticketPrice: '',
        eventCategory: '',
        flyerImage: null,
        additionalNotes: '',
        agreeToTerms: false,
      });

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer theme="dark">
      <Container>
        <HeroSection>
          <Title>Submit Your Event Flyer</Title>
          <Subtitle>
            Share your community event with Art Night Detroit! We love promoting creative events in our city.
          </Subtitle>
        </HeroSection>

        <FormContainer>
          <form onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle>
                <FontAwesomeIcon icon={faInfoCircle} />
                Event Information
              </SectionTitle>
              
              <FormGroup>
                <Label>Event Name *</Label>
                <Input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="e.g., Art & Soul Gallery Opening"
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Event Date *</Label>
                  <Input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Event Time *</Label>
                  <Input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Location *
                </Label>
                <Input
                  type="text"
                  name="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main St, Detroit, MI"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Event Category *</Label>
                <Select
                  name="eventCategory"
                  value={formData.eventCategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="art-exhibition">Art Exhibition</option>
                  <option value="music-performance">Music Performance</option>
                  <option value="dance-performance">Dance Performance</option>
                  <option value="theater">Theater</option>
                  <option value="workshop">Workshop</option>
                  <option value="community-event">Community Event</option>
                  <option value="fundraiser">Fundraiser</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Event Description *</Label>
                <TextArea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="Tell us about your event, what makes it special, and why the Art Night Detroit community should attend..."
                  rows={4}
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Ticket Price</Label>
                  <Input
                    type="text"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleInputChange}
                    placeholder="e.g., Free, $10, $15-25"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Event Website</Label>
                  <Input
                    type="url"
                    name="eventWebsite"
                    value={formData.eventWebsite}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection>
              <SectionTitle>Organizer Information</SectionTitle>
              
              <FormGroup>
                <Label>Organizer Name *</Label>
                <Input
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormRow>
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
              </FormRow>

              <FormGroup>
                <Label>Instagram Handle</Label>
                <Input
                  type="text"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                  placeholder="@yourusername"
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <FontAwesomeIcon icon={faUpload} />
                Event Flyer
              </SectionTitle>
              
              <FormGroup>
                <Label>Upload Flyer Image *</Label>
                <FileUploadWrapper>
                  <FileInput
                    type="file"
                    name="flyerImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                  />
                  <FileUploadText>
                    {formData.flyerImage ? formData.flyerImage.name : 'Choose file...'}
                  </FileUploadText>
                </FileUploadWrapper>
                <HelperText>
                  Please upload a high-quality image (JPG, PNG). Recommended size: 1080x1080px or larger.
                </HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Additional Notes</Label>
                <TextArea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Any additional information you'd like us to know..."
                  rows={3}
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                  />
                  I agree that Art Night Detroit may share this event information across our social media channels and website. I confirm that I have the right to share this event information and flyer image. *
                </CheckboxLabel>
              </CheckboxGroup>
            </FormSection>

            {submitStatus === 'success' && (
              <SuccessMessage>
                🎉 Thank you for your submission! We'll review your event and get back to you within 2-3 business days.
              </SuccessMessage>
            )}

            {submitStatus === 'error' && (
              <ErrorMessage>
                ❌ {errorMessage}
              </ErrorMessage>
            )}

            <SubmitButtonContainer>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.agreeToTerms}
                style={{
                  background: isSubmitting ? '#666' : 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Event Flyer'}
              </Button>
            </SubmitButtonContainer>
          </form>
        </FormContainer>
      </Container>
    </PageContainer>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #B0B0B0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FormSection = styled.div`
  margin-bottom: 2.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #FFFFFF;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #4ECDC4;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #4ECDC4;
    font-size: 0.9rem;
  }
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

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4ECDC4;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }
  
  option {
    background: #2A2A2A;
    color: #FFFFFF;
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
  
  &:focus + label {
    border-color: #4ECDC4;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }
`;

const FileUploadText = styled.label`
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
  
  &:hover {
    border-color: #4ECDC4;
    background: rgba(78, 205, 196, 0.1);
  }
`;

const HelperText = styled.p`
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.5rem;
`;

const CheckboxGroup = styled.div`
  margin-bottom: 1.5rem;
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

const SubmitButtonContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const SuccessMessage = styled.div`
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  border-radius: 8px;
  padding: 1rem;
  color: #81C784;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 8px;
  padding: 1rem;
  color: #EF5350;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

export default SubmitFlyerPage;
