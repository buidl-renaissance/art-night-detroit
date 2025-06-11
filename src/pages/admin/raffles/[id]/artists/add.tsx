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
  instagram_handle?: string;
}

const AddArtistContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.background.secondary};
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text.primary};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, active }) => 
      active ? theme.colors.primaryHover : theme.colors.background.primary};
    transform: translateY(-2px);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ArtistInfo = styled.div`
  padding: 1.5rem;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    margin-bottom: 1rem;
    line-height: 1.5;
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
  font-size: 1rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.secondary};
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
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  min-height: 100px;
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
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(Button)`
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.background.primary};
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ImagePreview = styled.div<{ imageUrl?: string }>`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  background: ${({ imageUrl, theme }) => 
    imageUrl ? `url(${imageUrl})` : theme.colors.background.secondary};
  background-size: cover;
  background-position: center;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UploadText = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  text-align: center;
  padding: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadProgress = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  transition: width 0.3s ease;
`;

export default function AddArtist() {
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image_url: '',
    instagram_handle: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { id: raffleId } = router.query;
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

      fetchArtists();
    };

    if (router.isReady) {
      checkAdmin();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (searchQuery) {
      searchArtists();
    } else {
      fetchArtists();
    }
  }, [searchQuery]);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');

      if (error) throw error;
      setArtists(data || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const searchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .order('name');

      if (error) throw error;
      setArtists(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleArtistSelect = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from('raffle_artists')
        .insert([{
          raffle_id: raffleId,
          artist_id: artistId,
          ticket_count: 0
        }]);

      if (error) throw error;
      router.push(`/admin/raffles/${raffleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create the artist
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .insert([formData])
        .select()
        .single();

      if (artistError) throw artistError;

      // Then add them to the raffle
      const { error: raffleArtistError } = await supabase
        .from('raffle_artists')
        .insert([{
          raffle_id: raffleId,
          artist_id: artist.id,
          ticket_count: 0
        }]);

      if (raffleArtistError) throw raffleArtistError;

      router.push(`/admin/raffles/${raffleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `artist-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('artists')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artists')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <AddArtistContainer>
          <p>Loading...</p>
        </AddArtistContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <AddArtistContainer>
        <Header>
          <h1>Add Artist to Raffle</h1>
        </Header>

        <Tabs>
          <Tab 
            active={activeTab === 'search'} 
            onClick={() => setActiveTab('search')}
          >
            Search Existing Artists
          </Tab>
          <Tab 
            active={activeTab === 'create'} 
            onClick={() => setActiveTab('create')}
          >
            Create New Artist
          </Tab>
        </Tabs>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        )}

        {activeTab === 'search' ? (
          <>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search artists by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>

            <ArtistsGrid>
              {artists.map((artist) => (
                <ArtistCard 
                  key={artist.id}
                  onClick={() => handleArtistSelect(artist.id)}
                >
                  <ArtistInfo>
                    <h3>{artist.name}</h3>
                    <p>{artist.bio}</p>
                  </ArtistInfo>
                </ArtistCard>
              ))}
            </ArtistsGrid>
          </>
        ) : (
          <Form onSubmit={handleCreateArtist}>
            <FormGroup>
              <Label htmlFor="name">Artist Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="bio">Bio</Label>
              <TextArea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="instagram_handle">Instagram Handle</Label>
              <Input
                type="text"
                id="instagram_handle"
                name="instagram_handle"
                value={formData.instagram_handle}
                onChange={handleInputChange}
                placeholder="@username"
              />
            </FormGroup>

            <FormGroup>
              <Label>Artist Image</Label>
              <ImageUploadContainer>
                <ImagePreview 
                  imageUrl={formData.image_url}
                  onClick={handleImageClick}
                >
                  {!formData.image_url && (
                    <UploadText>
                      Click to upload image<br />
                      (Max 5MB)
                    </UploadText>
                  )}
                </ImagePreview>
                <FileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {isUploading && (
                  <UploadProgress>
                    <ProgressBar progress={uploadProgress} />
                  </UploadProgress>
                )}
              </ImageUploadContainer>
            </FormGroup>

            <ButtonGroup>
              <Button 
                type="submit"
                disabled={isUploading || !formData.image_url}
              >
                Create Artist
              </Button>
              <CancelButton 
                type="button"
                onClick={() => router.push(`/admin/raffles/${raffleId}`)}
              >
                Cancel
              </CancelButton>
            </ButtonGroup>
          </Form>
        )}
      </AddArtistContainer>
    </PageContainer>
  );
} 