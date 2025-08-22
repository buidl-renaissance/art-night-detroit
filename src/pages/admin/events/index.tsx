import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import ProcessedEventDescription from '@/components/EventDescription';
import { useRouter } from 'next/router';
import { getLoginUrlWithRedirect } from '@/lib/redirects';

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
  created_at: string;
  image_url?: string;
}

const EventsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0;
  }

  h1 {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;

    @media (min-width: 768px) {
      font-size: 2.5rem;
    }
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
  }
`;

const EventCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  width: 100%;

  &:hover {
    transform: translateY(-4px);
  }
`;

const EventImage = styled.div<{ imageUrl?: string }>`
  width: 100%;
  height: 200px;
  background: ${({ imageUrl, theme }) => 
    imageUrl ? `url(${imageUrl})` : theme.colors.background.primary};
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const EventHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: 768px) {
    padding: 1.5rem;
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'draft': return theme.colors.text.light;
      case 'scheduled': return theme.colors.primary;
      case 'active': return theme.colors.primary;
      case 'ended': return theme.colors.error;
      default: return theme.colors.text.light;
    }
  }};
  color: white;
`;

const EventInfo = styled.div`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .event-description {
    color: ${({ theme }) => theme.colors.text.light};
    margin-bottom: 1rem;
    line-height: 1.5;
  }
`;

const EventDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
`;

const DetailItem = styled.div`
  h4 {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.light};
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  span {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 500;
  }
`;

const ActionLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }

  svg {
    width: 16px;
    height: 16px;
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

const ErrorMessage = styled.p`
  color: red;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 0, 0, 0.2);
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.1rem;
`;

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(getLoginUrlWithRedirect());
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

      fetchEvents();
    };

    checkAdmin();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <EventsContainer>
          <LoadingMessage>Loading...</LoadingMessage>
        </EventsContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <EventsContainer>
        <BackButton onClick={() => router.push('/admin')}>
          ← Back to Admin Dashboard
        </BackButton>

        <Header>
          <h1>Events</h1>
          <AddButton onClick={() => router.push('/admin/events/new')}>
            Add Event
          </AddButton>
        </Header>

        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}

        <EventsGrid>
          {events.map((event) => (
            <EventCard key={event.id}>
              {event.image_url && (
                <EventImage imageUrl={event.image_url} />
              )}
              <EventHeader>
                <h3>{event.name}</h3>
                <StatusBadge status={event.status}>{event.status}</StatusBadge>
              </EventHeader>
              <EventInfo>
                {event.description && <ProcessedEventDescription className="event-description">{event.description}</ProcessedEventDescription>}
                <EventDetails>
                  <DetailItem>
                    <h4>Start Date</h4>
                    <span>{formatDate(event.start_date)}</span>
                  </DetailItem>
                  {event.end_date && (
                    <DetailItem>
                      <h4>End Date</h4>
                      <span>{formatDate(event.end_date)}</span>
                    </DetailItem>
                  )}
                  {event.location && (
                    <DetailItem>
                      <h4>Location</h4>
                      <span>{event.location}</span>
                    </DetailItem>
                  )}
                </EventDetails>
                <ActionLinks>
                  <ActionLink onClick={() => router.push(`/admin/events/${event.id}/edit`)}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Edit Event
                  </ActionLink>
                  <ActionLink onClick={() => router.push(`/admin/events/${event.id}/participants`)}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-1c0-1.38 2.69-2.5 6-2.5.3 0 .61.01.91.03-.61-.58-1.15-1.25-1.58-1.99-.81-.05-1.59-.08-2.33-.08C3.34 12.46 1 13.84 1 15.32V18h3zm7.5 0v-1c0-1.38 2.69-2.5 6-2.5s6 1.12 6 2.5v1h-12zM10 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm7.5 8c-1.83 0-3.5.5-3.5 2v1h7v-1c0-1.5-1.67-2-3.5-2z"/>
                    </svg>
                    Manage Participants
                  </ActionLink>
                </ActionLinks>
              </EventInfo>
            </EventCard>
          ))}
        </EventsGrid>
      </EventsContainer>
    </PageContainer>
  );
} 