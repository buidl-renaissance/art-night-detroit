import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Event } from "@/types/events";
import { useAuth } from "@/hooks/useAuth";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface RSVP {
  id: string;
  handle: string;
  name: string;
  email: string;
  status: 'confirmed' | 'waitlisted' | 'rejected' | 'canceled';
  created_at: string;
  attended_at?: string;
}

interface RSVPListProps {
  eventId: string;
  event?: Event | null;
  showEventInfo?: boolean;
  showStats?: boolean;
  showTable?: boolean;
  showHandlesOnly?: boolean;
  title?: string;
}

const RSVPList: React.FC<RSVPListProps> = ({
  eventId,
  event,
  showEventInfo = true,
  showStats = true,
  showTable = true,
}) => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAttendance, setUpdatingAttendance] = useState<string | null>(null);
  const { isAdmin, loading: authLoading } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (eventId) {
      loadRSVPs(eventId);
    }
  }, [eventId]);

  const loadRSVPs = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rsvps/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch RSVPs');
      }

      setRsvps(data.rsvps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RSVPs');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (rsvpId: string, attended: boolean) => {
    try {
      setUpdatingAttendance(rsvpId);
      
      // Wait for auth to load if needed
      if (authLoading) {
        throw new Error('Authentication still loading');
      }
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('sessionError', sessionError);
      console.log('session', session);
      
      if (!session) {
        throw new Error('Not authenticated');
      }


      const response = await fetch(`/api/rsvps/${eventId}/mark-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ rsvpId, attended }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update attendance');
      }

      // Update the local state with the new attendance data
      setRsvps(prevRsvps => 
        prevRsvps.map(rsvp => 
          rsvp.id === rsvpId 
            ? { ...rsvp, attended_at: data.rsvp.attended_at }
            : rsvp
        )
      );
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      setError(err instanceof Error ? err.message : 'Failed to update attendance');
    } finally {
      setUpdatingAttendance(null);
    }
  };



  // Separate RSVPs by status
  const confirmedRSVPs = rsvps.filter(rsvp => rsvp.status === 'confirmed');
  const waitlistedRSVPs = rsvps.filter(rsvp => rsvp.status === 'waitlisted');
  const rejectedRSVPs = rsvps.filter(rsvp => rsvp.status === 'rejected');
  const canceledRSVPs = rsvps.filter(rsvp => rsvp.status === 'canceled');

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingText>Loading RSVPs...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorContainer>
      </Container>
    );
  }

  const renderRSVPTable = (rsvps: RSVP[], title: string, statusColor: string) => (
    <TableSection>
      <TableTitle style={{ color: statusColor }}>{title} ({rsvps.length})</TableTitle>
      <RSVPTable>
        <thead>
          <tr>
            <th>#</th>
            <th>Handle</th>
            <th>Name</th>
            {isAdmin && <th>✓</th>}
          </tr>
        </thead>
        <tbody>
          {rsvps.map((rsvp, index) => (
            <tr key={rsvp.id}>
              <td>{index + 1}</td>
              <td>
                <HandleCell>{rsvp.handle}</HandleCell>
              </td>
              <td>{rsvp.name}</td>
              {isAdmin && (
                <td>
                  <AttendanceCheckbox
                    type="checkbox"
                    checked={!!rsvp.attended_at}
                    onChange={(e) => markAttendance(rsvp.id, e.target.checked)}
                    disabled={updatingAttendance === rsvp.id || authLoading}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </RSVPTable>
    </TableSection>
  );

  return (
    <Container>
      {showEventInfo && event && (
        <EventInfoSection>
          <EventName>{event.name}</EventName>
          <EventDate>
            {new Date(event.start_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </EventDate>
        </EventInfoSection>
      )}

      {showStats && (
        <StatsSection>
          <StatCard>
            <StatNumber>{confirmedRSVPs.length}</StatNumber>
            <StatLabel>Confirmed</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{waitlistedRSVPs.length}</StatNumber>
            <StatLabel>Waitlisted</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{rejectedRSVPs.length}</StatNumber>
            <StatLabel>Rejected</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{canceledRSVPs.length}</StatNumber>
            <StatLabel>Canceled</StatLabel>
          </StatCard>
        </StatsSection>
      )}

      {showTable && (
        <RSVPSection>
          {/* Confirmed RSVPs Table */}
          {confirmedRSVPs.length > 0 && renderRSVPTable(confirmedRSVPs, 'Confirmed RSVPs', '#27ae60')}

          {/* Waitlisted RSVPs Table */}
          {waitlistedRSVPs.length > 0 && renderRSVPTable(waitlistedRSVPs, 'Waitlisted RSVPs', '#f39c12')}

          {/* Rejected RSVPs Table */}
          {rejectedRSVPs.length > 0 && renderRSVPTable(rejectedRSVPs, 'Rejected RSVPs', '#e74c3c')}

          {/* Canceled RSVPs Table */}
          {canceledRSVPs.length > 0 && renderRSVPTable(canceledRSVPs, 'Canceled RSVPs', '#95a5a6')}

          {rsvps.length === 0 && (
            <NoRSVPsMessage>
              No RSVPs found for this event.
            </NoRSVPsMessage>
          )}
        </RSVPSection>
      )}

    </Container>
  );
};

export default RSVPList;

// Styled Components
const Container = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: white;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #bdc3c7;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 1.1rem;
`;

const EventInfoSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border-radius: 12px;
`;

const EventName = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #ecf0f1;
`;

const EventDate = styled.p`
  font-size: 1.1rem;
  color: #bdc3c7;
`;

const StatsSection = styled.section`
  margin-bottom: 2rem;
  display: flex;
  gap: 0;
  justify-content: center;
  flex-wrap: nowrap;
  overflow-x: auto;
`;

const StatCard = styled.div`
  text-align: center;
  min-width: 82px;
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: #bdc3c7;
  font-weight: 500;
`;

const RSVPSection = styled.section`
  /* margin-bottom: 2rem; */
`;

const TableSection = styled.div`
  margin-bottom: 2rem;
`;

const TableTitle = styled.h3`
  font-size: 1.3rem;
  color: #ecf0f1;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

const RSVPTable = styled.table`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-collapse: collapse;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }

  th {
    background: rgba(255, 255, 255, 0.1);
    font-weight: 600;
    color: #ecf0f1;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    
    th, td {
      padding: 0.5rem 0.25rem;
    }
  }
`;

const HandleCell = styled.span`
  font-weight: 600;
  color: #e74c3c;
`;

const NoRSVPsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #bdc3c7;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;



const AttendanceCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #e74c3c;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

