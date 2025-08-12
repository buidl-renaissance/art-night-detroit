import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import PageContainer from '@/components/PageContainer';

interface Artist {
  id: string;
  name: string;
  bio: string;
  image_url: string;
}

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

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.background.secondary : theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'secondary' ? theme.colors.border : theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }
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
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 2.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
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
  font-weight: 500;
  background: ${({ theme, status }) => {
    switch (status) {
      case 'uploading':
        return theme.colors.background.secondary;
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

export default function EditArtist() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { id } = router.query;
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

      if (id !== 'new') {
        fetchArtist();
      } else {
        setLoading(false);
      }
    };

    if (router.isReady) {
      checkAdmin();
    }
  }, [router.isReady, id]);

  const fetchArtist = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setSelectedImage(result.url);
      setUploadStatus('success');
      setUploadMessage('Image uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);
    } catch (err) {
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

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const artistData = {
        name: formData.get('name'),
        bio: formData.get('bio'),
        image_url: selectedImage || formData.get('image_url'),
      };

      if (id === 'new') {
        const { error } = await supabase
          .from('artists')
          .insert([artistData]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('artists')
          .update(artistData)
          .eq('id', id);

        if (error) throw error;
      }

      router.push('/admin/artists');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <FormContainer>
          <p>Loading...</p>
        </FormContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <FormContainer>
        <Header>
          <h1>{id === 'new' ? 'Add Artist' : 'Edit Artist'}</h1>
        </Header>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        )}

        {/* Form Card */}
        <Card>
          {/* Image Section */}
          <ImageSection>
            {/* Current Image Display */}
            {!selectedImage && (
              <CurrentImage 
                imageUrl={artist?.image_url}
                onClick={handleImageClick}
              >
                {!artist?.image_url && artist?.name?.charAt(0).toUpperCase()}
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
                defaultValue={artist?.name}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="bio">Bio</Label>
              <TextArea
                id="bio"
                name="bio"
                defaultValue={artist?.bio}
                required
              />
            </FormGroup>

            <ButtonGroup>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Artist'}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => router.push('/admin/artists')}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        </Card>
      </FormContainer>
    </PageContainer>
  );
} 