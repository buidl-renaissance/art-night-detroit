import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faEnvelope, faPhone, faCheck, faTimes, faEye } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import PageContainer from '../../components/PageContainer';
import { Button } from '../../components/ui/Button';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { supabase } from '../../lib/supabaseClient';

interface FlyerSubmission {
  id: string;
  event_name: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone?: string;
  event_date: string;
  event_location: string;
  event_description: string;
  event_website?: string;
  instagram_handle?: string;
  ticket_price?: string;
  event_category: string;
  additional_notes?: string;
  flyer_image_url?: string;
  status: 'pending_extraction' | 'pending_review' | 'approved' | 'rejected' | 'published';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const FlyerSubmissionsAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [submissions, setSubmissions] = useState<FlyerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FlyerSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    console.log('Admin auth state - isAdmin:', isAdmin, 'authLoading:', authLoading);
    if (isAdmin && !authLoading) {
      fetchSubmissions();
    }
  }, [isAdmin, authLoading]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching submissions via API - Filter:', filterStatus);
      
      // Use API endpoint that bypasses RLS issues
      const response = await fetch(`/api/admin/flyer-submissions?status=${filterStatus}`);
      const result = await response.json();

      console.log('API response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch submissions');
      }

      setSubmissions(result.submissions || []);
      console.log('Submissions loaded:', result.submissions?.length || 0);
      
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('flyer_submissions')
        .update({
          status,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchSubmissions();
      setSelectedSubmission(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'art-exhibition': 'Art Exhibition',
      'music-performance': 'Music Performance',
      'dance-performance': 'Dance Performance',
      'theater': 'Theater',
      'workshop': 'Workshop',
      'community-event': 'Community Event',
      'fundraiser': 'Fundraiser',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_extraction': return '#FF9800';
      case 'pending_review': return '#FFA726';
      case 'approved': return '#66BB6A';
      case 'rejected': return '#EF5350';
      case 'published': return '#42A5F5';
      default: return '#90A4AE';
    }
  };

  if (authLoading) {
    return (
      <PageContainer theme="dark">
        <Container>
          <LoadingText>Loading...</LoadingText>
        </Container>
      </PageContainer>
    );
  }

  if (!isAdmin) {
    return (
      <PageContainer theme="dark">
        <Container>
          <ErrorText>Access denied. Admin privileges required.</ErrorText>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <Container>
        <Header>
          <Title>Flyer Submissions</Title>
          <FilterContainer>
            <FilterSelect
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                fetchSubmissions();
              }}
            >
              <option value="all">All Submissions</option>
              <option value="pending_extraction">Pending AI Extraction</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </FilterSelect>
          </FilterContainer>
        </Header>

        {loading ? (
          <LoadingText>Loading submissions...</LoadingText>
        ) : submissions.length === 0 ? (
          <EmptyState>No submissions found.</EmptyState>
        ) : (
          <SubmissionsGrid>
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id}>
                <CardHeader>
                  <EventName>{submission.event_name}</EventName>
                  <StatusBadge color={getStatusColor(submission.status)}>
                    {submission.status.replace('_', ' ')}
                  </StatusBadge>
                </CardHeader>

                <CardContent>
                  <InfoRow>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(submission.event_date)}</span>
                  </InfoRow>
                  
                  <InfoRow>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{submission.event_location}</span>
                  </InfoRow>

                  <InfoRow>
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{submission.organizer_email}</span>
                  </InfoRow>

                  <Category>{getCategoryDisplay(submission.event_category)}</Category>
                  
                  {submission.flyer_image_url && (
                    <FlyerPreview>
                      <img src={submission.flyer_image_url} alt="Event flyer" />
                    </FlyerPreview>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    onClick={() => setSelectedSubmission(submission)}
                    style={{ background: '#4ECDC4', padding: '8px 16px', fontSize: '14px' }}
                  >
                    <FontAwesomeIcon icon={faEye} /> Review
                  </Button>
                </CardActions>
              </SubmissionCard>
            ))}
          </SubmissionsGrid>
        )}

        {/* Review Modal */}
        {selectedSubmission && (
          <ModalOverlay onClick={() => setSelectedSubmission(null)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Review Submission</ModalTitle>
                <CloseButton onClick={() => setSelectedSubmission(null)}>×</CloseButton>
              </ModalHeader>

              <ModalContent>
                <EventTitle>{selectedSubmission.event_name}</EventTitle>
                
                <DetailSection>
                  <SectionTitle>Event Details</SectionTitle>
                  <DetailRow>
                    <strong>Date:</strong> {formatDate(selectedSubmission.event_date)}
                  </DetailRow>
                  <DetailRow>
                    <strong>Location:</strong> {selectedSubmission.event_location}
                  </DetailRow>
                  <DetailRow>
                    <strong>Category:</strong> {getCategoryDisplay(selectedSubmission.event_category)}
                  </DetailRow>
                  {selectedSubmission.ticket_price && (
                    <DetailRow>
                      <strong>Price:</strong> {selectedSubmission.ticket_price}
                    </DetailRow>
                  )}
                  {selectedSubmission.event_website && (
                    <DetailRow>
                      <strong>Website:</strong> 
                      <a href={selectedSubmission.event_website} target="_blank" rel="noopener noreferrer">
                        {selectedSubmission.event_website}
                      </a>
                    </DetailRow>
                  )}
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Organizer Info</SectionTitle>
                  <DetailRow>
                    <strong>Name:</strong> {selectedSubmission.organizer_name}
                  </DetailRow>
                  <DetailRow>
                    <strong>Email:</strong> {selectedSubmission.organizer_email}
                  </DetailRow>
                  {selectedSubmission.organizer_phone && (
                    <DetailRow>
                      <strong>Phone:</strong> {selectedSubmission.organizer_phone}
                    </DetailRow>
                  )}
                  {selectedSubmission.instagram_handle && (
                    <DetailRow>
                      <strong>Instagram:</strong> {selectedSubmission.instagram_handle}
                    </DetailRow>
                  )}
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Description</SectionTitle>
                  <Description>{selectedSubmission.event_description}</Description>
                </DetailSection>

                {selectedSubmission.additional_notes && (
                  <DetailSection>
                    <SectionTitle>Additional Notes</SectionTitle>
                    <Description>{selectedSubmission.additional_notes}</Description>
                  </DetailSection>
                )}

                {selectedSubmission.flyer_image_url && (
                  <DetailSection>
                    <SectionTitle>Flyer Image</SectionTitle>
                    <FlyerImage>
                      <img src={selectedSubmission.flyer_image_url} alt="Event flyer" />
                    </FlyerImage>
                  </DetailSection>
                )}

                <DetailSection>
                  <SectionTitle>Admin Notes</SectionTitle>
                  <NotesTextArea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this submission..."
                    rows={3}
                  />
                </DetailSection>
              </ModalContent>

              <ModalActions>
                <Button
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved', adminNotes)}
                  style={{ background: '#66BB6A', marginRight: '10px' }}
                >
                  <FontAwesomeIcon icon={faCheck} /> Approve
                </Button>
                <Button
                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected', adminNotes)}
                  style={{ background: '#EF5350' }}
                >
                  <FontAwesomeIcon icon={faTimes} /> Reject
                </Button>
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}
      </Container>
    </PageContainer>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #FFFFFF;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  
  option {
    background: #2A2A2A;
    color: #FFFFFF;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #B0B0B0;
  font-size: 1.2rem;
  margin: 2rem 0;
`;

const ErrorText = styled.div`
  text-align: center;
  color: #EF5350;
  font-size: 1.2rem;
  margin: 2rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #B0B0B0;
  font-size: 1.1rem;
  margin: 3rem 0;
`;

const SubmissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const SubmissionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const EventName = styled.h3`
  color: #FFFFFF;
  margin: 0;
  flex: 1;
  margin-right: 1rem;
`;

const StatusBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
`;

const CardContent = styled.div`
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #B0B0B0;
  margin-bottom: 0.5rem;
  font-size: 14px;
  
  svg {
    color: #4ECDC4;
    width: 14px;
  }
`;

const Category = styled.div`
  background: rgba(78, 205, 196, 0.2);
  color: #4ECDC4;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-block;
  margin: 0.5rem 0;
`;

const FlyerPreview = styled.div`
  margin-top: 1rem;
  
  img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const Modal = styled.div`
  background: #1A1A1A;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: #FFFFFF;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #B0B0B0;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #FFFFFF;
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const EventTitle = styled.h2`
  color: #FFFFFF;
  margin-bottom: 1.5rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #4ECDC4;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
`;

const DetailRow = styled.div`
  color: #E0E0E0;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  
  strong {
    color: #FFFFFF;
    margin-right: 0.5rem;
  }
  
  a {
    color: #4ECDC4;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Description = styled.p`
  color: #E0E0E0;
  line-height: 1.6;
  margin: 0;
`;

const FlyerImage = styled.div`
  img {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
  }
`;

const NotesTextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4ECDC4;
  }
  
  &::placeholder {
    color: #888;
  }
`;

const ModalActions = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
`;

export default FlyerSubmissionsAdmin;
