import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
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
  margin-bottom: 1rem;

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

const FieldError = styled.div`
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const ParticipantInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const ParticipantInfoTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0;
`;

const ParticipantInfoDescription = styled.p`
  font-size: 1rem;
  color: #aaa;
  margin-bottom: 1.5rem;
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









interface UploadFormData {
  name: string;
  email: string;
  tagline: string;
  website?: string;
  instagram?: string;
}



const ParticipantUploadPage: React.FC<ParticipantUploadPageProps> = ({ event }) => {
  const router = useRouter();
  const [step, setStep] = useState<'handle' | 'new-profile'>('handle');
  const [handle, setHandle] = useState('');
  const [defaultRole, setDefaultRole] = useState<'DJ' | 'Featured Artist' | 'Vendor' | 'Attendee'>('Attendee');

  const [checkingHandle, setCheckingHandle] = useState(false);
  const [formData, setFormData] = useState<UploadFormData>({
    name: '',
    email: '',
    tagline: '',
    website: '',
    instagram: '',
  });

  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Extract role from query parameters
  useEffect(() => {
    if (router.query.role) {
      const role = router.query.role as string;
      if (['DJ', 'Featured Artist', 'Vendor', 'Attendee'].includes(role)) {
        setDefaultRole(role as 'DJ' | 'Featured Artist' | 'Vendor' | 'Attendee');
      }
    }
  }, [router.query.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateHandle = (handle: string): string | null => {
    if (!handle.trim()) {
      return 'Handle is required';
    }
    if (handle.length < 2) {
      return 'Handle must be at least 2 characters long';
    }
    if (handle.length > 30) {
      return 'Handle must be 30 characters or less';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(handle)) {
      return 'Handle can only contain letters, numbers, hyphens, and underscores';
    }
    return null;
  };

  const handleHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const handleError = validateHandle(handle);
    if (handleError) {
      setStatus('error');
      setMessage(handleError);
      return;
    }

    setCheckingHandle(true);
    setStatus('idle');
    setValidationErrors({});

    try {
      const response = await fetch('/api/profiles/check-handle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: handle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check handle');
      }

      if (data.exists) {
        // Automatically add existing profile to the event with the specified role
        await handleAddExistingProfile(data.profile.id, defaultRole);
      } else {
        setStep('new-profile');
      }

    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setMessage('Network error. Please check your internet connection and try again.');
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setCheckingHandle(false);
    }
  };

  const handleAddExistingProfile = async (profileId: string, role: string) => {
    setSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch(`/api/events/${event.id}/add-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileId,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add participant');
      }

      setStatus('success');
      setMessage('Profile added successfully! Redirecting...');

      setTimeout(() => {
        window.location.href = data.redirectUrl;
      }, 2000);

    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setMessage('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('duplicate')) {
          setMessage('This profile is already registered for this event.');
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage('An unexpected error occurred while adding your profile. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
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
        if (error instanceof Error && error.message.includes('size')) {
          setMessage('Image file is too large. Please choose an image smaller than 5MB.');
        } else if (error instanceof Error && error.message.includes('type')) {
          setMessage('Invalid file type. Please choose a JPEG, PNG, or WebP image.');
        } else {
          setMessage('Failed to upload profile image. Please try again.');
        }
        setImagePreview('');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleImageClick = () => {
    document.getElementById('profile-image-input')?.click();
  };

  const validateForm = (): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.instagram || !formData.instagram.trim()) {
      errors.instagram = 'Instagram handle is required';
    } else if (formData.instagram.trim().length < 2) {
      errors.instagram = 'Instagram handle must be at least 2 characters long';
    } else if (!/^@?[a-zA-Z0-9._]+$/.test(formData.instagram.replace('@', ''))) {
      errors.instagram = 'Instagram handle can only contain letters, numbers, dots, and underscores';
    }

    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        errors.website = 'Please enter a valid website URL (including http:// or https://)';
      }
    }

    if (formData.tagline && formData.tagline.length > 500) {
      errors.tagline = 'Tagline must be 500 characters or less';
    }





    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setStatus('error');
      setMessage('Please fix the errors below and try again.');
      return;
    }

    setSubmitting(true);
    setStatus('idle');
    setValidationErrors({});

    try {
      const response = await fetch(`/api/events/${event.id}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          ...formData,
          role: defaultRole,
          handle: handle.trim(),
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
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setMessage('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('duplicate')) {
          setMessage('A profile with this email or handle already exists for this event.');
        } else if (error.message.includes('validation')) {
          setMessage('Please check your information and try again.');
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage('An unexpected error occurred while submitting your information. Please try again.');
      }
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





  return (
    <PageContainer theme="dark" noPadding>
      <Head>
        <title>Participant Upload - {event.name} | Art Night Detroit</title>
        <meta name="description" content={`Upload your participation information for ${event.name}`} />
      </Head>

      <HeroSection imageUrl={event.image_url}>
        <HeroTitle>{event.name}</HeroTitle>
        <HeroSubtitle>{formatDate(event.start_date)}</HeroSubtitle>
        <HeroSubtitle>{formatTime(event.start_date)}{event.end_date && ` - ${formatTime(event.end_date)}`}</HeroSubtitle>
      </HeroSection>

      <Container>
        <UploadSection>

          <ParticipantInfo>
            <ParticipantInfoTitle>Participant Information</ParticipantInfoTitle>
            <ParticipantInfoDescription>
              Fill out the following to connect with other participants at the event.
            </ParticipantInfoDescription>
          </ParticipantInfo>

          {step === 'handle' && (
            <Form onSubmit={handleHandleSubmit}>
              <FormGroup>
                <Label htmlFor="handle">Enter your handle</Label>
                <Input
                  type="text"
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="your-handle"
                  required
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={checkingHandle}>
                {checkingHandle ? 'Checking...' : 'Continue'}
              </SubmitButton>
            </Form>
          )}

          {step === 'handle' && status === 'success' && (
            <SuccessMessage>{message}</SuccessMessage>
          )}

          {step === 'handle' && status === 'error' && (
            <ErrorMessage>{message}</ErrorMessage>
          )}



          {step === 'new-profile' && (
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
                <Label htmlFor="handle">Handle *</Label>
                <Input
                  type="text"
                  id="handle"
                  name="handle"
                  value={handle}
                  disabled
                  style={{ opacity: 0.7 }}
                />
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
                {validationErrors.instagram && (
                  <FieldError>{validationErrors.instagram}</FieldError>
                )}
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
                {validationErrors.name && (
                  <FieldError>{validationErrors.name}</FieldError>
                )}
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
                {validationErrors.email && (
                  <FieldError>{validationErrors.email}</FieldError>
                )}
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
                {validationErrors.tagline && (
                  <FieldError>{validationErrors.tagline}</FieldError>
                )}
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
                {validationErrors.website && (
                  <FieldError>{validationErrors.website}</FieldError>
                )}
              </FormGroup>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <SubmitButton type="submit" disabled={submitting || uploadingImage} style={{ flex: 1 }}>
                  {submitting ? 'Submitting...' : 'Submit Profile'}
                </SubmitButton>
              </div>
            </Form>
          )}

          {step === 'new-profile' && status === 'success' && (
            <SuccessMessage>{message}</SuccessMessage>
          )}

          {step === 'new-profile' && status === 'error' && (
            <ErrorMessage>{message}</ErrorMessage>
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