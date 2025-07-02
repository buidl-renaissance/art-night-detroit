import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Event } from "@/types/events";

interface RSVP {
  handle: string;
  name: string;
  email: string;
  status: 'confirmed' | 'waitlisted' | 'rejected' | 'canceled';
  created_at: string;
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

  // Separate confirmed and waitlisted RSVPs
  const confirmedRSVPs = rsvps.filter(rsvp => rsvp.status === 'confirmed');
  const waitlistedRSVPs = rsvps.filter(rsvp => rsvp.status === 'waitlisted');

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
            <StatLabel>Confirmed RSVPs</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{waitlistedRSVPs.length}</StatNumber>
            <StatLabel>Waitlisted RSVPs</StatLabel>
          </StatCard>
        </StatsSection>
      )}

      {showTable && (
        <RSVPSection>
          {/* Confirmed RSVPs Table */}
          {confirmedRSVPs.length > 0 && (
            <TableSection>
              <TableTitle>Confirmed RSVPs ({confirmedRSVPs.length})</TableTitle>
              <RSVPTable>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Handle</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedRSVPs.map((rsvp, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <HandleCell>{rsvp.handle}</HandleCell>
                      </td>
                      <td>{rsvp.name}</td>
                    </tr>
                  ))}
                </tbody>
              </RSVPTable>
            </TableSection>
          )}

          {/* Waitlisted RSVPs Table */}
          {waitlistedRSVPs.length > 0 && (
            <TableSection>
              <TableTitle>Waitlisted RSVPs ({waitlistedRSVPs.length})</TableTitle>
              <RSVPTable>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Handle</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistedRSVPs.map((rsvp, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <HandleCell>{rsvp.handle}</HandleCell>
                      </td>
                      <td>{rsvp.name}</td>
                    </tr>
                  ))}
                </tbody>
              </RSVPTable>
            </TableSection>
          )}

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
  color: #222;
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
  color: #666;
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
  color: #c0392b;
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
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 150px;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #c0392b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #666;
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
  color: #2c3e50;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 2px solid #ecf0f1;
`;

const RSVPTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
  }

  tr:hover {
    background: #f8f9fa;
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
  color: #c0392b;
`;

const NoRSVPsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;
