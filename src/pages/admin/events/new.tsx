import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';
import { 
  formatDateTimeForDatabase, 
  getCurrentLocalDateTimeString, 
  validateEventDates 
} from '@/lib/events';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
  }
`;

const Form = styled.form`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 6px;
    background: ${({ theme }) => theme.colors.background.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  background: ${({ theme, variant }) => {
    if (variant === 'secondary') return theme.colors.background.primary;
    if (variant === 'danger') return theme.colors.error;
    return theme.colors.primary;
  }};

  color: ${({ theme, variant }) => {
    if (variant === 'secondary') return theme.colors.text.primary;
    return 'white';
  }};

  &:hover {
    background: ${({ theme, variant }) => {
      if (variant === 'secondary') return theme.colors.background.secondary;
      if (variant === 'danger') return theme.colors.errorHover;
      return theme.colors.primaryHover;
    }};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.error}20;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.error};
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

export default function NewEvent() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: getCurrentLocalDateTimeString(),
    end_date: '',
    location: '',
    status: 'draft',
    attendance_limit: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const filePath = `event-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('events')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate dates
      const dateErrors = validateEventDates(formData.start_date, formData.end_date);
      if (dateErrors.length > 0) {
        throw new Error(dateErrors.join(', '));
      }

      // Prepare data for database with proper timezone handling
      const eventData = {
        ...formData,
        start_date: formatDateTimeForDatabase(formData.start_date),
        end_date: formData.end_date ? formatDateTimeForDatabase(formData.end_date) : null,
        attendance_limit: formData.attendance_limit ? parseInt(formData.attendance_limit) : null
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) throw error;

      router.push('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer theme="dark">
      <FormContainer>
        <BackButton onClick={() => router.push('/admin/events')}>
          ← Back to Events
        </BackButton>

        <Header>
          <h1>Add New Event</h1>
          <p>Create a new event for Art Night Detroit</p>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <label htmlFor="name">Event Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter event name"
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <label htmlFor="start_date">Start Date *</label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor="end_date">End Date</label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Row>

          <FormGroup>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter event location"
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="attendance_limit">Attendance Limit (Optional)</label>
            <input
              type="number"
              id="attendance_limit"
              name="attendance_limit"
              value={formData.attendance_limit}
              onChange={handleInputChange}
              placeholder="Enter maximum number of attendees"
              min="1"
            />
            <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem', display: 'block' }}>
              Leave empty for unlimited attendance. When limit is reached, new RSVPs will be added to waitlist.
            </small>
          </FormGroup>

          <FormGroup>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </FormGroup>

          <FormGroup>
            <label>Event Image</label>
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
            <Button type="submit" disabled={loading || isUploading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => router.push('/admin/events')}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </PageContainer>
  );
} 