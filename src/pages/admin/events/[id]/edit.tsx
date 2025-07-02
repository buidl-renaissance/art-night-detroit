import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';
import { 
  formatDateTimeForDatabase, 
  formatDateTimeForInput, 
  validateEventDates 
} from '@/lib/events';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;

    @media (min-width: 768px) {
      font-size: 2.5rem;
    }
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
  }
`;

const Form = styled.form`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;

  @media (min-width: 768px) {
    margin-bottom: 1.5rem;
  }

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
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
    margin-top: 2rem;
  }
`;

const Button = styled.button<{ variant?: 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
  }

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
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
    padding: 0.5rem 1rem;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.primary};
    transform: translateY(-2px);
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.error}20;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.error};

  @media (min-width: 768px) {
    padding: 0.75rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.light};
  padding: 1rem;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
  attendance_limit?: number;
}

export default function EditEvent() {
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    status: 'draft',
    attendance_limit: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setEvent(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        start_date: data.start_date ? formatDateTimeForInput(data.start_date) : '',
        end_date: data.end_date ? formatDateTimeForInput(data.end_date) : '',
        location: data.location || '',
        status: data.status,
        attendance_limit: data.attendance_limit ? data.attendance_limit.toString() : ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
        .update(eventData)
        .eq('id', id);

      if (error) throw error;

      router.push('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <LoadingContainer>
          Loading event...
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer theme="dark">
        <FormContainer>
          <BackButton onClick={() => router.push('/admin/events')}>
            ← Back to Events
          </BackButton>
          <ErrorMessage>Event not found</ErrorMessage>
        </FormContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <FormContainer>
        <BackButton onClick={() => router.push('/admin/events')}>
          ← Back to Events
        </BackButton>

        <Header>
          <h1>Edit Event</h1>
          <p>Update event details for {event.name}</p>
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

          <ButtonGroup>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
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