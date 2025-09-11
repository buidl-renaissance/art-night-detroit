import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled from 'styled-components';

interface ArtistProfileData {
  name: string;
  email: string;
  handle: string;
  tagline: string;
  website?: string;
  instagram: string;
  profileImage?: string;
}

const ArtistProfileSetupPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState<ArtistProfileData>({
    name: '',
    email: '',
    handle: '',
    tagline: '',
    website: '',
    instagram: '',
    profileImage: ''
  });
  
  const [loading, ] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'exists' | 'available' | 'error'>('idle');
  const [existingProfile, setExistingProfile] = useState<{
    id: string;
    handle: string;
    full_name?: string;
    name?: string;
    email: string;
    tagline?: string;
    website?: string;
    instagram?: string;
    image_url?: string;
  } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      // Fetch artist submission data to pre-populate form
      fetchArtistSubmission(id);
    }
  }, [id]);

  const fetchArtistSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/artist-submissions/${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.submission) {
          const handle = data.submission.artist_alias || data.submission.name?.toLowerCase().replace(/\s+/g, '') || '';
          setFormData(prev => ({
            ...prev,
            name: data.submission.name || '',
            email: data.submission.email || '',
            handle: handle,
            tagline: data.submission.additional_notes || '',
            website: data.submission.portfolio_link || '',
            instagram: data.submission.instagram_link || ''
          }));
        }
      }
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error fetching artist submission:', error);
      setIsInitialLoad(false);
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

  const checkHandleExists = useCallback(async (handle: string) => {
    const handleError = validateHandle(handle);
    if (handleError) {
      setValidationErrors(prev => ({ ...prev, handle: handleError }));
      setHandleStatus('error');
      return;
    }

    setCheckingHandle(true);
    setHandleStatus('checking');
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.handle;
      return newErrors;
    });

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
        setHandleStatus('exists');
        setExistingProfile(data.profile);
        
        // Only pre-populate form with existing profile data during initial load
        if (isInitialLoad) {
          setFormData(prev => ({
            ...prev,
            name: data.profile.full_name || data.profile.name || prev.name,
            email: data.profile.email || prev.email,
            tagline: data.profile.tagline || prev.tagline,
            website: data.profile.website || prev.website,
            instagram: data.profile.instagram || prev.instagram,
            profileImage: data.profile.image_url || prev.profileImage
          }));
          if (data.profile.image_url) {
            setImagePreview(data.profile.image_url);
          }
        } else {
          // If user manually changed handle to an existing one, show error
          setValidationErrors(prev => ({ 
            ...prev, 
            handle: 'This handle is already taken. Please choose a different one.' 
          }));
          setHandleStatus('error');
        }
      } else {
        setHandleStatus('available');
        setExistingProfile(null);
      }
    } catch (error) {
      setHandleStatus('error');
      setValidationErrors(prev => ({ 
        ...prev, 
        handle: error instanceof Error ? error.message : 'Failed to check handle availability' 
      }));
    } finally {
      setCheckingHandle(false);
    }
  }, [isInitialLoad]);

  // Debounced handle checking (only after initial load)
  useEffect(() => {
    // Don't check handle during initial load
    if (isInitialLoad) {
      return;
    }

    if (!formData.handle || formData.handle.length < 2) {
      setHandleStatus('idle');
      setExistingProfile(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkHandleExists(formData.handle);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [formData.handle, checkHandleExists, isInitialLoad]);

  const getHandleStatusMessage = () => {
    switch (handleStatus) {
      case 'checking':
        return { text: 'Checking availability...', type: 'info' as const };
      case 'exists':
        // Only show success message during initial load when pre-populating
        if (isInitialLoad) {
          return { text: '✓ Profile found - using existing profile data', type: 'success' as const };
        } else {
          return null; // Error message is shown via validationErrors.handle
        }
      case 'available':
        return { text: '✓ Handle is available', type: 'success' as const };
      case 'error':
        // Don't show error message here since validationErrors.handle is already displayed above
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Clear submit message when user starts typing
    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({ ...prev, profileImage: result.url }));
        setImagePreview(result.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to upload image. Please try again.'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/artist-profile-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'Profile setup completed successfully! We\'ll be in touch soon about your application.'
        });
        setIsSubmitted(true);
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            handle: '',
            tagline: '',
            website: '',
            instagram: '',
            profileImage: ''
          });
          setImagePreview('');
        }, 3000);
      } else {
        setSubmitMessage({
          type: 'error',
          text: result.error || 'Failed to save profile. Please try again.'
        });
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      setSubmitMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingMessage>Loading...</LoadingMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Head>
        <title>Artist Profile Setup - Art Night Detroit</title>
        <meta name="description" content="Complete your artist profile for Art Night Detroit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeroSection>
        <HeroTitle>🎨 Complete Your Artist Profile</HeroTitle>
        <HeroSubtitle>Help us get to know you and your artistic vision</HeroSubtitle>
      </HeroSection>

      <FormContainer>
        {isSubmitted ? (
          <SuccessContainer>
            <SuccessIcon>🎨</SuccessIcon>
            <SuccessTitle>Profile Setup Complete!</SuccessTitle>
            <SuccessMessage>
              Thank you for completing your artist profile! We&apos;ll review your application and get back to you soon.
            </SuccessMessage>
            <SuccessSubtext>
              Your profile is now set up and linked to your artist application. If you have any questions, please don&apos;t hesitate to contact us.
            </SuccessSubtext>
          </SuccessContainer>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle>Artist Profile Setup</SectionTitle>
            
            {/* Profile Image Upload */}
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
                  onChange={handleFileSelect}
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
                value={formData.handle}
                onChange={handleInputChange}
                placeholder="@yourhandle"
                required
                disabled={checkingHandle}
                style={{ opacity: checkingHandle ? 0.7 : 1 }}
              />
              {validationErrors.handle && (
                <FieldError>{validationErrors.handle}</FieldError>
              )}
              {getHandleStatusMessage() && (
                <HandleStatusMessage type={getHandleStatusMessage()!.type}>
                  {getHandleStatusMessage()!.text}
                </HandleStatusMessage>
              )}
              {existingProfile && isInitialLoad && (
                <ExistingProfileInfo>
                  <strong>Existing profile found:</strong> This handle belongs to an existing profile. 
                  We&apos;ve pre-filled the form with the existing profile data. You can modify any fields as needed.
                </ExistingProfileInfo>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="instagram">Instagram Handle *</Label>
              <Input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
              {validationErrors.email && (
                <FieldError>{validationErrors.email}</FieldError>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="tagline">Tagline</Label>
              <TextArea
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="Brief description about yourself, your work, or your artistic vision..."
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
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
              />
              {validationErrors.website && (
                <FieldError>{validationErrors.website}</FieldError>
              )}
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <SubmitButton type="submit" disabled={submitting || uploadingImage} style={{ flex: 1 }}>
                {submitting ? 'Submitting...' : 'Complete Profile Setup'}
              </SubmitButton>
            </div>

            {submitMessage && (
              <SubmitMessage type={submitMessage.type}>
                {submitMessage.text}
              </SubmitMessage>
            )}
          </FormSection>
        </form>
        )}
      </FormContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  margin: 0 auto;
  padding: 1rem;
  font-family: "Inter", sans-serif;
  background-color: #333;
  min-height: 100vh;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #ffffff;
  font-size: 1.2rem;
`;

const HeroSection = styled.div`
  position: relative;
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 1.5rem;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 4rem 1rem;
    margin-bottom: 2rem;
  }
`;

const HeroTitle = styled.h1`
  font-family: "Baloo 2", cursive;
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  color: #cccccc;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 1.6rem;
  }
`;

const FormContainer = styled.div`
  background-color: #222;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin: 0 auto 2rem;
  max-width: 100%;

  @media (min-width: 768px) {
    padding: 2rem;
    margin: 0 auto 3rem;
    max-width: 800px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #444;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-family: "Baloo 2", cursive;
  font-size: 1.25rem;
  color: #ffffff;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #cccccc;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #333;
  color: #ffffff;
  transition: border-color 0.3s;
  box-sizing: border-box;
  margin-bottom: 0.5rem;

  &:focus {
    border-color: #6c63ff;
    outline: none;
  }

  &::placeholder {
    color: #888;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
  font-family: "Inter", sans-serif;
  background-color: #333;
  color: #ffffff;
  resize: vertical;
  transition: border-color 0.3s;
  box-sizing: border-box;
  min-height: 100px;

  &:focus {
    border-color: #6c63ff;
    outline: none;
  }

  &::placeholder {
    color: #888;
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ImagePreview = styled.div<{ hasImage: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: ${props => props.hasImage ? 'transparent' : '#444'};
  border: 2px solid ${props => props.hasImage ? '#6c63ff' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;

  &:hover {
    border-color: #6c63ff;
    transform: scale(1.05);
  }
`;

const UploadText = styled.div`
  color: #cccccc;
  font-size: 0.9rem;
  text-align: center;
`;

const UploadProgress = styled.div`
  color: #6c63ff;
  font-size: 0.9rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FieldError = styled.div`
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const HandleStatusMessage = styled.div<{ type: 'info' | 'success' | 'error' }>`
  font-size: 0.875rem;
  margin-top: 0.25rem;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#22c55e';
      case 'error': return '#ff4444';
      case 'info': return '#6c63ff';
      default: return '#666';
    }
  }};
  font-weight: 500;
`;

const ExistingProfileInfo = styled.div`
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  font-size: 0.875rem;
  color: #e0e0e0;
  line-height: 1.4;
  
  strong {
    color: #6c63ff;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 3rem 2rem;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const SuccessTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 2rem;
  color: #28a745;
  margin-bottom: 1rem;
  font-weight: 600;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SuccessMessage = styled.p`
  font-size: 1.1rem;
  color: #e0e0e0;
  margin-bottom: 1rem;
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SuccessSubtext = styled.p`
  font-size: 0.95rem;
  color: #cccccc;
  line-height: 1.5;
  max-width: 450px;
  margin: 0 auto;
`;


const SubmitButton = styled.button`
  background-color: #6c63ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
  }

  &:hover:not(:disabled) {
    background-color: #5a52d5;
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const SubmitMessage = styled.div<{ type: "success" | "error" }>`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;

  ${(props) =>
    props.type === "success" &&
    `
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `}

  ${(props) =>
    props.type === "error" &&
    `
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

export default ArtistProfileSetupPage;
