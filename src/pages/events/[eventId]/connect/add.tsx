import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { Event } from '@/types/events';
import { getEvent } from '@/data/events';
import { PageContainer } from '@/components/PageContainer';
import { Container } from '@/components/Container';
import Footer from '@/components/Footer';

interface ParticipantUploadPageProps {
  event: Event;
}

const HeroSection = styled.section<{ imageUrl?: string }>`
  background:
    linear-gradient(
      135deg,
      rgba(19, 61, 90, 0.7) 0%,
      rgba(30, 16, 37, 0.7) 100%
    ),
    url(${({ imageUrl }) => imageUrl || "/images/art-night-07-02-25.png"});
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

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const HeroTitle = styled.h1`
  font-family: "Baloo 2", cursive;
  font-size: 3rem;
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

const UploadSection = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 0 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #ccc;
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #ccc;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-size: 1rem;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background: rgba(67, 233, 123, 0.2);
  border: 1px solid rgba(67, 233, 123, 0.5);
  border-radius: 8px;
  color: #43e97b;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 8px;
  color: #ff6b6b;
  margin-bottom: 1rem;
`;

const InfoBox = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #667eea;
  font-size: 0.9rem;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

const ImagePreview = styled.div<{ hasImage: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed ${({ hasImage }) => hasImage ? 'transparent' : 'rgba(255, 255, 255, 0.3)'};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ hasImage }) => hasImage ? 'cover' : 'rgba(255, 255, 255, 0.1)'};
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
  }
`;

const UploadText = styled.p`
  color: #ccc;
  font-size: 0.8rem;
  text-align: center;
  margin: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadProgress = styled.div`
  color: #667eea;
  font-size: 0.8rem;
  text-align: center;
`;

const ShareButton = styled.button`
  display: block;
  width: auto;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #666;
  border: none;
  font-weight: 400;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  margin: 1rem auto 0;
  text-decoration: underline;
  text-align: center;

  &:hover {
    color: #333;
  }
`;

const QRCodeContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f0f0f0;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const QRCodeTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.8rem;
`;

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  margin: 0 auto 1rem;
  display: block;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

interface UploadFormData {
  name: string;
  email: string;
  role: 'DJ' | 'Featured Artist' | 'Vendor' | 'Attendee';
  tagline: string;
  website?: string;
  instagram?: string;
  performance_details?: string;
  setup_requirements?: string;
}

const ParticipantUploadPage: React.FC<ParticipantUploadPageProps> = ({ event }) => {
  const [formData, setFormData] = useState<UploadFormData>({
    name: '',
    email: '',
    role: 'Attendee',
    tagline: '',
    website: '',
    instagram: '',
    performance_details: '',
    setup_requirements: '',
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      try {
        // Upload image to Supabase Storage
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-profile-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        setProfileImageUrl(data.url);
        console.log('Image uploaded successfully:', data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        setStatus('error');
        setMessage('Failed to upload profile image. Please try again.');
        setImagePreview('');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleImageClick = () => {
    document.getElementById('profile-image-input')?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch(`/api/events/${event.id}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          ...formData,
          profile_image_url: profileImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit information');
      }

      setStatus('success');
      setMessage('Thank you! Your information has been submitted successfully.');
      
      // Redirect to connect list after successful submission
      setTimeout(() => {
        window.location.href = `/events/${event.id}/connect`;
      }, 2000);

    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleShareClick = () => {
    setShowQRCode(!showQRCode);
  };

  const generateQRCode = () => {
    const url = `https://artnightdetroit.com/events/${event.id}/connect`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrCodeUrl;
  };

  return (
    <PageContainer theme="dark" noPadding>
      <Head>
        <title>Participant Upload - {event.name} | Art Night Detroit</title>
        <meta name="description" content={`Upload your participation information for ${event.name}`} />
      </Head>

      <HeroSection imageUrl={event.image_url}>
        <HeroTitle>Participant Information</HeroTitle>
        <HeroSubtitle>
          {event.name} • {formatDate(event.start_date)} • {formatTime(event.start_date)}
        </HeroSubtitle>
      </HeroSection>

      <Container>
        <UploadSection>
          <InfoBox>
            <strong>Event Participant Upload</strong><br />
            Please provide your information for this event. This will help us prepare for your participation and share your details with attendees.
          </InfoBox>

          {status === 'success' && (
            <SuccessMessage>{message}</SuccessMessage>
          )}

          {status === 'error' && (
            <ErrorMessage>{message}</ErrorMessage>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <ImageUploadContainer>
                <ImagePreview 
                  hasImage={!!imagePreview}
                  style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none' }}
                  onClick={handleImageClick}
                >
                  {!imagePreview && <UploadText>Click to upload</UploadText>}
                </ImagePreview>
                <FileInput
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <UploadText>Upload a profile picture</UploadText>
                {uploadingImage && <UploadProgress>Uploading...</UploadProgress>}
              </ImageUploadContainer>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="instagram">Instagram Handle *</Label>
              <Input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@username"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="role">Your Role *</Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Attendee">Attendee</option>
                <option value="DJ">DJ</option>
                <option value="Featured Artist">Featured Artist</option>
                <option value="Vendor">Vendor</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Brief description about yourself, your work, or what you'll be doing at this event..."
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="website">Website</Label>
              <Input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </FormGroup>

            {(formData.role === 'DJ' || formData.role === 'Featured Artist') && (
              <>
                <FormGroup>
                  <Label htmlFor="performance_details">Performance Details</Label>
                  <Textarea
                    id="performance_details"
                    name="performance_details"
                    value={formData.performance_details}
                    onChange={handleChange}
                    placeholder="Describe your performance, set, or what you'll be showcasing..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="setup_requirements">Setup Requirements</Label>
                  <Textarea
                    id="setup_requirements"
                    name="setup_requirements"
                    value={formData.setup_requirements}
                    onChange={handleChange}
                    placeholder="Any specific equipment, space, or setup requirements..."
                  />
                </FormGroup>
              </>
            )}

            <SubmitButton type="submit" disabled={submitting || uploadingImage}>
              {submitting ? 'Submitting...' : 'Submit Information'}
            </SubmitButton>
          </Form>
          
          <ShareButton type="button" onClick={handleShareClick}>
            📱 Share Connect Page
          </ShareButton>
          
          {showQRCode && (
            <QRCodeContainer>
              <QRCodeTitle>Scan to share this connect page</QRCodeTitle>
              <QRCodeImage src={generateQRCode()} alt="QR Code for connect page" />
            </QRCodeContainer>
          )}
        </UploadSection>
      </Container>
      <Footer />
    </PageContainer>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId } = context.params as { eventId: string };

  try {
    const event = await getEvent(eventId);

    if (!event) {
      return {
        notFound: true,
      };
    }

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

export default ParticipantUploadPage; 