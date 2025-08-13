import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageContainer from '@/components/PageContainer';
import { Container } from '@/components/Container';
import { Title } from '@/components/Title';
import { Event, EventParticipant } from '@/types/events';

interface ParticipantFormData {
  profile_id: string;
  role: 'DJ' | 'Featured Artist' | 'Vendor' | 'Attendee';
}

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
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





const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ParticipantsList = styled.div`
  margin-top: 2rem;
`;

const ParticipantCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.h3`
  color: #fff;
  margin-bottom: 0.5rem;
`;

const ParticipantRole = styled.span<{ role: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ role }) => {
    switch (role) {
      case 'DJ':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'Featured Artist':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'Vendor':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'Attendee':
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }};
  color: white;
`;

const DeleteButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ShareLinksSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
`;

const ShareLinkItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const ShareLinkLabel = styled.div`
  min-width: 120px;
  font-weight: 600;
  color: #fff;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const ShareLinkUrl = styled.input`
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.9rem;
  font-family: monospace;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CopyButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ccc;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
`;

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  handle?: string;
  phone_number?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export default function EventParticipantsPage() {
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClientComponentClient();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ParticipantFormData>({
    profile_id: '',
    role: 'Attendee',
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('event_participants')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('event_id', id)
        .order('role', { ascending: true })
        .order('created_at', { ascending: true });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Fetch all profiles for the dropdown
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: id,
          profile_id: formData.profile_id,
          role: formData.role,
        });

      if (error) throw error;

      // Reset form
      setFormData({
        profile_id: '',
        role: 'Attendee',
      });

      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (participantId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('Failed to copy link. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const generateShareLinks = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const roles = ['Attendee', 'DJ', 'Featured Artist', 'Vendor'];
    
    return roles.map(role => ({
      role,
      url: `${baseUrl}/events/${id}/connect/add?role=${encodeURIComponent(role)}`
    }));
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <Container>
          <LoadingMessage>Loading event participants...</LoadingMessage>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer theme="dark">
        <Container>
          <ErrorMessage>{error}</ErrorMessage>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <Container>
        <Title>Manage Event Participants</Title>
        
        {event && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>{event.name}</h2>
            <p style={{ color: '#ccc' }}>Event ID: {event.id}</p>
          </div>
        )}

        <ShareLinksSection>
          <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Share Registration Links</h3>
          <p style={{ color: '#ccc', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Share these links to allow people to register directly for specific roles at this event.
          </p>
          {generateShareLinks().map(({ role, url }) => (
            <ShareLinkItem key={role}>
              <ShareLinkLabel>
                <ParticipantRole role={role}>{role}</ParticipantRole>
              </ShareLinkLabel>
              <ShareLinkUrl
                value={url}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <CopyButton onClick={() => copyToClipboard(url)}>
                Copy Link
              </CopyButton>
            </ShareLinkItem>
          ))}
        </ShareLinksSection>

        <FormSection>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Add Participant</h3>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Profile</Label>
              <Select
                value={formData.profile_id}
                onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                required
              >
                <option value="">Select a profile...</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email} {profile.handle && `(@${profile.handle})`}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Role</Label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'DJ' | 'Featured Artist' | 'Vendor' | 'Attendee' })}
                required
              >
                <option value="Attendee">Attendee</option>
                <option value="DJ">DJ</option>
                <option value="Featured Artist">Featured Artist</option>
                <option value="Vendor">Vendor</option>
              </Select>
            </FormGroup>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Participant'}
            </Button>
          </Form>
        </FormSection>

        <ParticipantsList>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Current Participants ({participants.length})</h3>
          
          {participants.length === 0 ? (
            <p style={{ color: '#ccc', textAlign: 'center', padding: '2rem' }}>
              No participants have been added to this event yet.
            </p>
          ) : (
            participants.map((participant) => (
              <ParticipantCard key={participant.id}>
                <ParticipantInfo>
                  <ParticipantName>
                    {participant.profile?.full_name || participant.profile?.email || 'Unknown'}
                  </ParticipantName>
                  <ParticipantRole role={participant.role}>
                    {participant.role}
                  </ParticipantRole>
                  {participant.profile?.tagline && (
                    <p style={{ color: '#ccc', marginTop: '0.5rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      {participant.profile.tagline}
                    </p>
                  )}
                  {participant.profile?.website && (
                    <a 
                      href={participant.profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'none', 
                        fontSize: '0.9rem',
                        display: 'block',
                        marginTop: '0.5rem'
                      }}
                    >
                      {participant.profile.website}
                    </a>
                  )}
                </ParticipantInfo>
                <DeleteButton onClick={() => handleDelete(participant.id)}>
                  Remove
                </DeleteButton>
              </ParticipantCard>
            ))
          )}
        </ParticipantsList>
      </Container>
    </PageContainer>
  );
} 