import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faLink, faCheck, faTimes, faEye, faImage, faStore, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import PageContainer from '../../components/PageContainer';
import { Button } from '../../components/ui/Button';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface VendorSubmission {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website_link?: string;
  instagram_link?: string;
  business_type: string;
  business_description: string;
  products_services: string;
  setup_requirements?: string;
  insurance_coverage: boolean;
  previous_event_experience?: string;
  willing_to_donate_raffle_item: boolean;
  raffle_item_description?: string;
  additional_notes?: string;
  business_license_files: string[];
  product_images: string[];
  status: 'pending_review' | 'under_review' | 'approved' | 'rejected' | 'contacted';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

const VendorSubmissionsAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [submissions, setSubmissions] = useState<VendorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<VendorSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentSubmissionImages, setCurrentSubmissionImages] = useState<string[]>([]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('Fetching vendor submissions - Filter:', filterStatus);
      
      const response = await fetch('/api/admin/vendor-submissions');
      const result = await response.json();
      
      console.log('API response:', result);
      
      if (!response.ok) {
        console.error('Error fetching vendor submissions:', result.error);
        return;
      }
      
      let submissions = result.submissions || [];
      
      // Apply client-side filtering if needed
      if (filterStatus !== 'all') {
        submissions = submissions.filter((s: VendorSubmission) => s.status === filterStatus);
      }
      
      console.log('Filtered submissions:', submissions);
      setSubmissions(submissions);
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    console.log('Admin auth state - isAdmin:', isAdmin, 'authLoading:', authLoading);
    if (isAdmin && !authLoading) {
      fetchSubmissions();
    }
  }, [isAdmin, authLoading, fetchSubmissions]);

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedImage || currentSubmissionImages.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateImage(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateImage(1);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeImageModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage, currentImageIndex, currentSubmissionImages]);

  const openImageModal = (imageUrl: string, allImages: string[]) => {
    const imageIndex = allImages.indexOf(imageUrl);
    setCurrentSubmissionImages(allImages);
    setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentSubmissionImages([]);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction: number) => {
    if (currentSubmissionImages.length === 0) return;
    
    const newIndex = (currentImageIndex + direction + currentSubmissionImages.length) % currentSubmissionImages.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentSubmissionImages[newIndex]);
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/vendor-submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notes || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating submission:', result.error);
        return;
      }

      console.log('Status updated successfully:', result);

      // Refresh submissions
      fetchSubmissions();
      
      // Close modal
      setSelectedSubmission(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error in updateSubmissionStatus:', error);
    }
  };

  const openSubmissionModal = (submission: VendorSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || '');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return '#ffc107';
      case 'under_review':
        return '#17a2b8';
      case 'approved':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      case 'contacted':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'Pending Review';
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'contacted':
        return 'Contacted';
      default:
        return status;
    }
  };

  if (authLoading) {
    return <PageContainer><LoadingMessage>Loading...</LoadingMessage></PageContainer>;
  }

  if (!isAdmin) {
    return <PageContainer><ErrorMessage>Access denied. Admin privileges required.</ErrorMessage></PageContainer>;
  }

  const filteredSubmissions = submissions;

  return (
    <PageContainer>
      <AdminHeader>
        <Title>Vendor Submissions</Title>
        <FilterContainer>
          <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Submissions</option>
            <option value="pending_review">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="contacted">Contacted</option>
          </FilterSelect>
          <RefreshButton onClick={fetchSubmissions}>Refresh</RefreshButton>
        </FilterContainer>
      </AdminHeader>

      {loading ? (
        <LoadingMessage>Loading submissions...</LoadingMessage>
      ) : (
        <>
          <StatsContainer>
            <StatCard>
              <StatNumber>{submissions.length}</StatNumber>
              <StatLabel>Total Submissions</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{submissions.filter(s => s.status === 'pending_review').length}</StatNumber>
              <StatLabel>Pending Review</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{submissions.filter(s => s.status === 'approved').length}</StatNumber>
              <StatLabel>Approved</StatLabel>
            </StatCard>
          </StatsContainer>

          <SubmissionsGrid>
            {filteredSubmissions.map((submission) => (
              <SubmissionCard key={submission.id}>
                <SubmissionHeader>
                  <VendorInfo>
                    <BusinessName>{submission.business_name}</BusinessName>
                    <ContactName>Contact: {submission.contact_name}</ContactName>
                    <BusinessType>{submission.business_type}</BusinessType>
                  </VendorInfo>
                  <StatusBadge color={getStatusColor(submission.status)}>
                    {getStatusLabel(submission.status)}
                  </StatusBadge>
                </SubmissionHeader>

                <SubmissionDetails>
                  <DetailRow>
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{submission.email}</span>
                  </DetailRow>
                  <DetailRow>
                    <FontAwesomeIcon icon={faPhone} />
                    <span>{submission.phone}</span>
                  </DetailRow>
                  {submission.website_link && (
                    <DetailRow>
                      <FontAwesomeIcon icon={faLink} />
                      <span>{submission.website_link}</span>
                    </DetailRow>
                  )}
                  {submission.instagram_link && (
                    <DetailRow>
                      <FontAwesomeIcon icon={faInstagram} />
                      <span>{submission.instagram_link}</span>
                    </DetailRow>
                  )}
                  <DetailRow>
                    <FontAwesomeIcon icon={faStore} />
                    <span>Insurance: {submission.insurance_coverage ? 'Yes' : 'No'}</span>
                  </DetailRow>
                </SubmissionDetails>

                <BusinessDescriptionPreview>
                  <strong>Products/Services:</strong> {submission.products_services.substring(0, 100)}
                  {submission.products_services.length > 100 && '...'}
                </BusinessDescriptionPreview>

                {submission.product_images.length > 0 && (
                  <ProductPreview>
                    <ProductLabel>
                      <FontAwesomeIcon icon={faImage} />
                      Product Images ({submission.product_images.length} files)
                    </ProductLabel>
                    <ProductThumbnails>
                      {submission.product_images.map((imageUrl, index) => (
                        <ProductThumbnail 
                          key={index} 
                          src={imageUrl} 
                          alt={`Product ${index + 1}`}
                          onClick={() => openImageModal(imageUrl, submission.product_images)}
                        />
                      ))}
                    </ProductThumbnails>
                  </ProductPreview>
                )}

                <SubmissionMeta>
                  <MetaText>Submitted: {new Date(submission.created_at).toLocaleDateString()}</MetaText>
                  {submission.willing_to_donate_raffle_item && <MetaText>• Willing to donate raffle item</MetaText>}
                </SubmissionMeta>

                <ActionButtons>
                  <ActionButton onClick={() => openSubmissionModal(submission)}>
                    <FontAwesomeIcon icon={faEye} />
                    View Details
                  </ActionButton>
                  {submission.status === 'pending_review' && (
                    <>
                      <ActionButton 
                        color="success" 
                        onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Approve
                      </ActionButton>
                      <ActionButton 
                        color="danger" 
                        onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Reject
                      </ActionButton>
                    </>
                  )}
                </ActionButtons>
              </SubmissionCard>
            ))}
          </SubmissionsGrid>

          {filteredSubmissions.length === 0 && (
            <EmptyState>
              <EmptyStateText>No submissions found</EmptyStateText>
              <EmptyStateSubtext>
                {filterStatus === 'all' 
                  ? 'No vendor submissions have been received yet.' 
                  : `No submissions with status "${getStatusLabel(filterStatus)}" found.`
                }
              </EmptyStateSubtext>
            </EmptyState>
          )}
        </>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <Modal onClick={() => setSelectedSubmission(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Vendor Application Details</ModalTitle>
              <CloseButton onClick={() => setSelectedSubmission(null)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              <Section>
                <SectionTitle>Business Information</SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Business Name:</DetailLabel>
                    <DetailValue>{selectedSubmission.business_name}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Contact Name:</DetailLabel>
                    <DetailValue>{selectedSubmission.contact_name}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Email:</DetailLabel>
                    <DetailValue>{selectedSubmission.email}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Phone:</DetailLabel>
                    <DetailValue>{selectedSubmission.phone}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Business Type:</DetailLabel>
                    <DetailValue>{selectedSubmission.business_type}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Insurance Coverage:</DetailLabel>
                    <DetailValue>{selectedSubmission.insurance_coverage ? 'Yes' : 'No'}</DetailValue>
                  </DetailItem>
                  {selectedSubmission.website_link && (
                    <DetailItem>
                      <DetailLabel>Website:</DetailLabel>
                      <DetailValue>
                        <a href={selectedSubmission.website_link} target="_blank" rel="noopener noreferrer">
                          {selectedSubmission.website_link}
                        </a>
                      </DetailValue>
                    </DetailItem>
                  )}
                  {selectedSubmission.instagram_link && (
                    <DetailItem>
                      <DetailLabel>Instagram:</DetailLabel>
                      <DetailValue>{selectedSubmission.instagram_link}</DetailValue>
                    </DetailItem>
                  )}
                </DetailGrid>
              </Section>

              <Section>
                <SectionTitle>Business Description</SectionTitle>
                <NotesText>{selectedSubmission.business_description}</NotesText>
              </Section>

              <Section>
                <SectionTitle>Products & Services</SectionTitle>
                <NotesText>{selectedSubmission.products_services}</NotesText>
              </Section>

              {selectedSubmission.setup_requirements && (
                <Section>
                  <SectionTitle>Setup Requirements</SectionTitle>
                  <NotesText>{selectedSubmission.setup_requirements}</NotesText>
                </Section>
              )}

              {selectedSubmission.previous_event_experience && (
                <Section>
                  <SectionTitle>Previous Event Experience</SectionTitle>
                  <NotesText>{selectedSubmission.previous_event_experience}</NotesText>
                </Section>
              )}

              {selectedSubmission.willing_to_donate_raffle_item && selectedSubmission.raffle_item_description && (
                <Section>
                  <SectionTitle>Raffle Item Donation</SectionTitle>
                  <NotesText>{selectedSubmission.raffle_item_description}</NotesText>
                </Section>
              )}

              {selectedSubmission.product_images.length > 0 && (
                <Section>
                  <SectionTitle>Product Images</SectionTitle>
                  <ProductGrid>
                    {selectedSubmission.product_images.map((imageUrl, index) => (
                      <ProductImage 
                        key={index} 
                        src={imageUrl} 
                        alt={`Product ${index + 1}`}
                        onClick={() => openImageModal(imageUrl, selectedSubmission.product_images)}
                      />
                    ))}
                  </ProductGrid>
                </Section>
              )}

              {selectedSubmission.business_license_files.length > 0 && (
                <Section>
                  <SectionTitle>Business License Files</SectionTitle>
                  <FileList>
                    {selectedSubmission.business_license_files.map((fileUrl, index) => (
                      <FileLink 
                        key={index} 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        License Document {index + 1}
                      </FileLink>
                    ))}
                  </FileList>
                </Section>
              )}

              {selectedSubmission.additional_notes && (
                <Section>
                  <SectionTitle>Additional Notes</SectionTitle>
                  <NotesText>{selectedSubmission.additional_notes}</NotesText>
                </Section>
              )}

              <Section>
                <SectionTitle>Admin Notes</SectionTitle>
                <NotesTextarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  rows={4}
                />
              </Section>

              <Section>
                <SectionTitle>Status & Actions</SectionTitle>
                <StatusActions>
                  <StatusButton 
                    color="info" 
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'under_review', adminNotes)}
                  >
                    Mark Under Review
                  </StatusButton>
                  <StatusButton 
                    color="success" 
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved', adminNotes)}
                  >
                    Approve
                  </StatusButton>
                  <StatusButton 
                    color="danger" 
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected', adminNotes)}
                  >
                    Reject
                  </StatusButton>
                  <StatusButton 
                    color="primary" 
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'contacted', adminNotes)}
                  >
                    Mark as Contacted
                  </StatusButton>
                </StatusActions>
              </Section>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <ImageModal onClick={closeImageModal}>
          <ImageModalContent onClick={(e) => e.stopPropagation()}>
            <ImageCloseButton onClick={closeImageModal}>×</ImageCloseButton>
            
            {/* Navigation arrows */}
            {currentSubmissionImages.length > 1 && (
              <>
                <NavButton 
                  direction="left" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage(-1);
                  }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </NavButton>
                <NavButton 
                  direction="right" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage(1);
                  }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </NavButton>
              </>
            )}
            
            <FullImage src={selectedImage} alt="Product preview" />
            
            {/* Image counter */}
            {currentSubmissionImages.length > 1 && (
              <ImageCounter>
                {currentImageIndex + 1} of {currentSubmissionImages.length}
              </ImageCounter>
            )}
          </ImageModalContent>
        </ImageModal>
      )}
    </PageContainer>
  );
};

// Styled Components (reusing many from artist submissions with vendor-specific modifications)
const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 2rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const RefreshButton = styled(Button)`
  background: #007bff;
  color: white;
  
  &:hover {
    background: #0056b3;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
`;

const StatLabel = styled.div`
  color: #666;
  margin-top: 0.5rem;
`;

const SubmissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const SubmissionCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const VendorInfo = styled.div`
  flex: 1;
`;

const BusinessName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #333;
`;

const ContactName = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const BusinessType = styled.div`
  color: #007bff;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const StatusBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const SubmissionDetails = styled.div`
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;

  svg {
    width: 14px;
    color: #007bff;
  }
`;

const BusinessDescriptionPreview = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ProductPreview = styled.div`
  margin-bottom: 1rem;
`;

const ProductLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;

  svg {
    width: 14px;
    color: #007bff;
  }
`;

const ProductThumbnails = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ProductThumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &:hover {
    border-color: #007bff;
  }
`;

const SubmissionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const MetaText = styled.span``;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ color?: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${props => {
    switch (props.color) {
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyStateText = styled.h3`
  margin: 0 0 0.5rem 0;
`;

const EmptyStateSubtext = styled.p`
  margin: 0;
  opacity: 0.8;
`;

const Modal = styled.div`
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
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
`;

const DetailValue = styled.span`
  color: #333;
  
  a {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const NotesText = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  line-height: 1.5;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const StatusActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const StatusButton = styled.button<{ color: string }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  ${props => {
    switch (props.color) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'info':
        return `
          background: #17a2b8;
          color: white;
          &:hover { background: #138496; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
    }
  }}
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileLink = styled.a`
  color: #007bff;
  text-decoration: none;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  
  &:hover {
    background: #f8f9fa;
    text-decoration: underline;
  }
`;

// Image Modal Components (reused from artist submissions)
const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
`;

const ImageModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageCloseButton = styled.button`
  position: absolute;
  top: -3rem;
  right: -1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background: white;
  }
`;

const NavButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.direction}: -4rem;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background: white;
  }

  @media (max-width: 768px) {
    ${props => props.direction}: -2rem;
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const FullImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

export default VendorSubmissionsAdmin;
