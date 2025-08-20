import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import PageContainer from '@/components/PageContainer';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  min-width: 400px;
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
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
  font-size: 1.1rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PrimaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const SecondaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background.primary};
  }
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;

  &:hover {
    background: ${({ theme }) => theme.colors.background.primary};
    transform: translateY(-2px);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const CurrentImage = styled.div<{ imageUrl?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  border: 3px solid ${({ theme }) => theme.colors.border};
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const ImagePreview = styled.div<{ imageUrl: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  margin: 0 auto;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: scale(1.1);
  }
`;

const ImageUploadHint = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
`;

const UploadStatus = styled.div<{ status: 'idle' | 'uploading' | 'success' | 'error' }>`
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  background: ${({ theme, status }) => {
    switch (status) {
      case 'uploading':
        return 'rgba(59, 130, 246, 0.1)';
      case 'success':
        return 'rgba(34, 197, 94, 0.1)';
      case 'error':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'transparent';
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      default:
        return theme.colors.text.primary;
    }
  }};
`;

const ErrorMessage = styled.p`
  color: red;
  margin: 0.5rem 0;
`;

export default function NewArtist() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/dashboard');
        return;
      }
    };

    checkAdmin();
  }, [router, supabase]);

  const handleImageUpload = async (file: File) => {
    setUploadStatus('uploading');
    setUploadMessage('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-artist-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setSelectedImage(data.imageUrl);
      setUploadStatus('success');
      setUploadMessage('Image uploaded successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadStatus('error');
      setUploadMessage(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const artistData = {
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
    };

    if (!artistData.name.trim()) {
      setError('Artist name is required');
      setSaving(false);
      return;
    }

    if (!artistData.bio.trim()) {
      setError('Artist bio is required');
      setSaving(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('artists')
        .insert({
          name: artistData.name.trim(),
          bio: artistData.bio.trim(),
          image_url: selectedImage || null
        })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      // Redirect to the artist list
      router.push('/admin/artists');

    } catch (err) {
      console.error('Error creating artist:', err);
      setError(err instanceof Error ? err.message : 'Failed to create artist');
    } finally {
      setSaving(false);
    }
  };



  return (
    <PageContainer theme="dark">
      <FormContainer>
        <BackButton onClick={() => router.push('/admin/artists')}>
          ← Back to Artists
        </BackButton>

        <Header>
          <h1>Add New Artist</h1>
        </Header>

        <Card>
          {/* Image Section */}
          <ImageSection>
            {/* Current Image Display */}
            {!selectedImage && (
              <CurrentImage 
                imageUrl={undefined}
                onClick={handleImageClick}
              >
                {name ? name.charAt(0).toUpperCase() : '?'}
              </CurrentImage>
            )}

            {/* New Image Preview */}
            {selectedImage && (
              <ImagePreview 
                imageUrl={selectedImage}
                onClick={handleImageClick}
              >
                <RemoveButton onClick={removeSelectedImage}>×</RemoveButton>
              </ImagePreview>
            )}

            <ImageUploadHint>Click image to upload new photo</ImageUploadHint>

            {/* Hidden File Input */}
            <FileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />

            {/* Upload Status */}
            {uploadStatus !== 'idle' && (
              <UploadStatus status={uploadStatus}>
                {uploadMessage}
              </UploadStatus>
            )}
          </ImageSection>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter artist name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="bio">Bio</Label>
              <TextArea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about the artist..."
                required
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonGroup>
              <SecondaryButton 
                type="button" 
                onClick={() => router.push('/admin/artists')}
                disabled={saving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? 'Creating Artist...' : 'Create Artist'}
              </PrimaryButton>
            </ButtonGroup>
          </Form>
        </Card>
      </FormContainer>
    </PageContainer>
  );
}
