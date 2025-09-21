import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faCheck, faTimes, faEye, faImage, faPalette, faChevronLeft, faChevronRight, faEnvelope, faPaperPlane, faBox, faPhone, faCopy, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import PageContainer from '../../components/PageContainer';
import { Button } from '../../components/ui/Button';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface ArtistSubmission {
  id: string;
  name: string;
  artist_alias?: string;
  email: string;
  phone: string;
  instagram_link?: string;
  portfolio_link?: string;
  preferred_canvas_size?: string;
  portfolio_files: string[];
  willing_to_volunteer: boolean;
  interested_in_future_events: boolean;
  additional_notes?: string;
  status: 'pending_review' | 'under_review' | 'approved' | 'accepted' | 'rejected' | 'declined' | 'contacted';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  contacted?: boolean;
  created_at: string;
  updated_at: string;
}

const ArtistSubmissionsAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [submissions, setSubmissions] = useState<ArtistSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ArtistSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentSubmissionImages, setCurrentSubmissionImages] = useState<string[]>([]);
  const [isBulkEmailing, setIsBulkEmailing] = useState<boolean>(false);
  const [bulkEmailProgress, setBulkEmailProgress] = useState<{ sent: number; total: number }>({ sent: 0, total: 0 });

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('Fetching artist submissions - Filter:', filterStatus);
      
      const response = await fetch('/api/admin/artist-submissions');
      const result = await response.json();
      
      console.log('API response:', result);
      
      if (!response.ok) {
        console.error('Error fetching artist submissions:', result.error);
        return;
      }
      
      let submissions = result.submissions || [];
      
      // Apply client-side filtering if needed
      if (filterStatus !== 'all') {
        submissions = submissions.filter((s: ArtistSubmission) => s.status === filterStatus);
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
      const response = await fetch(`/api/admin/artist-submissions/${submissionId}/status`, {
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

      // Update local state instead of refetching
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(submission => 
          submission.id === submissionId 
            ? { 
                ...submission, 
                status: newStatus as ArtistSubmission['status'],
                admin_notes: notes || submission.admin_notes,
                updated_at: new Date().toISOString()
              }
            : submission
        )
      );

      // Update selected submission if it's currently open
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission(prev => prev ? {
          ...prev,
          status: newStatus as ArtistSubmission['status'],
          admin_notes: notes || prev.admin_notes,
          updated_at: new Date().toISOString()
        } : null);
      }
      
      // Close modal only if it was opened from the modal (when notes are provided)
      if (notes !== undefined) {
        setSelectedSubmission(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error in updateSubmissionStatus:', error);
    }
  };

  const sendAcceptanceEmail = async (submission: ArtistSubmission) => {
    try {
      const response = await fetch('/api/admin/artist-submissions/send-acceptance-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          artistData: {
            name: submission.name,
            artist_alias: submission.artist_alias,
            email: submission.email,
            preferred_canvas_size: submission.preferred_canvas_size
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error sending acceptance email:', result.error);
        alert(`Failed to send email: ${result.error}`);
        return;
      }

      console.log('Acceptance email sent successfully:', result);
      alert('Acceptance email sent successfully!');
      
      // Update local state immediately to show contacted status
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === submission.id 
            ? { ...sub, contacted: true }
            : sub
        )
      );

      // Also update selected submission if it's currently open
      if (selectedSubmission && selectedSubmission.id === submission.id) {
        setSelectedSubmission(prev => prev ? { ...prev, contacted: true } : null);
      }
      
      // Refresh submissions to ensure data consistency
      fetchSubmissions();
    } catch (error) {
      console.error('Error sending acceptance email:', error);
      alert('Failed to send acceptance email. Please try again.');
    }
  };

  const sendBulkEmails = async () => {
    // Get all uncontacted submissions that need emails (approved or rejected)
    const uncontactedSubmissions = submissions.filter(
      submission => (submission.status === 'approved' || submission.status === 'rejected') && !submission.contacted
    );

    if (uncontactedSubmissions.length === 0) {
      alert('No uncontacted submissions found that need emails.');
      return;
    }

    const approvedCount = uncontactedSubmissions.filter(s => s.status === 'approved').length;
    const rejectedCount = uncontactedSubmissions.filter(s => s.status === 'rejected').length;

    const confirmMessage = `Are you sure you want to send emails to ${uncontactedSubmissions.length} artists?\n\nApproval emails: ${approvedCount}\nRejection emails: ${rejectedCount}`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsBulkEmailing(true);
    setBulkEmailProgress({ sent: 0, total: uncontactedSubmissions.length });

    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < uncontactedSubmissions.length; i++) {
        const submission = uncontactedSubmissions[i];
        
        try {
          // Choose the appropriate API endpoint based on status
          const endpoint = submission.status === 'approved' 
            ? '/api/admin/artist-submissions/send-acceptance-email'
            : '/api/admin/artist-submissions/send-rejection-email';

          const requestBody = {
            submissionId: submission.id,
            artistData: submission.status === 'approved' 
              ? {
                  name: submission.name,
                  artist_alias: submission.artist_alias,
                  email: submission.email,
                  preferred_canvas_size: submission.preferred_canvas_size
                }
              : {
                  name: submission.name,
                  artist_alias: submission.artist_alias,
                  email: submission.email
                }
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          const result = await response.json();

          if (response.ok) {
            successCount++;
            console.log(`${submission.status} email sent successfully to ${submission.name} (${submission.email})`);
          } else {
            errorCount++;
            console.error(`Failed to send ${submission.status} email to ${submission.name}:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error sending ${submission.status} email to ${submission.name}:`, error);
        }

        // Update progress
        setBulkEmailProgress({ sent: i + 1, total: uncontactedSubmissions.length });
        
        // 1 second delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Show final results
      const message = `Bulk email completed!\n\nSent: ${successCount}\nFailed: ${errorCount}`;
      alert(message);

      // Refresh submissions to update contacted status
      fetchSubmissions();

    } catch (error) {
      console.error('Error in bulk email process:', error);
      alert('Bulk email process failed. Please try again.');
    } finally {
      setIsBulkEmailing(false);
      setBulkEmailProgress({ sent: 0, total: 0 });
    }
  };

  const sendCanvasPickupEmail = async (submission: ArtistSubmission) => {
    try {
      const response = await fetch('/api/admin/send-canvas-pickup-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId: submission.id,
          name: submission.name,
          artist_alias: submission.artist_alias,
          email: submission.email,
          preferred_canvas_size: submission.preferred_canvas_size || '18x18'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send canvas pickup email');
      }

      alert(`Canvas pickup email sent to ${submission.name}`);
      await fetchSubmissions(); // Refresh the data
    } catch (error) {
      console.error('Error sending canvas pickup email:', error);
      alert('Failed to send canvas pickup email. Please try again.');
    }
  };

  const sendBulkCanvasPickupEmails = async () => {
    // Get all approved submissions
    const approvedSubmissions = submissions.filter(
      submission => submission.status === 'approved'
    );

    if (approvedSubmissions.length === 0) {
      alert('No approved submissions found.');
      return;
    }

    if (!confirm(`Send canvas pickup emails to ${approvedSubmissions.length} approved artists?`)) {
      return;
    }

    setIsBulkEmailing(true);
    setBulkEmailProgress({ sent: 0, total: approvedSubmissions.length });

    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < approvedSubmissions.length; i++) {
        const submission = approvedSubmissions[i];
        
        try {
          await sendCanvasPickupEmail(submission);
          successCount++;
        } catch (error) {
          console.error(`Error sending canvas pickup email to ${submission.name}:`, error);
          errorCount++;
        }
        
        setBulkEmailProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
      }

      const message = `Canvas pickup emails completed!\n\nSent: ${successCount}\nFailed: ${errorCount}`;
      alert(message);

    } catch (error) {
      console.error('Error in bulk canvas pickup email process:', error);
      alert('Bulk canvas pickup email process failed. Please try again.');
    } finally {
      setIsBulkEmailing(false);
      setBulkEmailProgress({ sent: 0, total: 0 });
    }
  };

  const copyAllArtistNames = () => {
    const artistNames = submissions.map(submission => 
      submission.artist_alias || submission.name
    );
    const namesText = artistNames.join('\n');
    
    navigator.clipboard.writeText(namesText).then(() => {
      alert(`Copied ${artistNames.length} artist names to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy names:', err);
      alert('Failed to copy names to clipboard. Please try again.');
    });
  };

  const sendThankYouEmails = async () => {
    // Get all accepted submissions
    const acceptedSubmissions = submissions.filter(
      submission => submission.status === 'accepted'
    );

    if (acceptedSubmissions.length === 0) {
      alert('No accepted submissions found.');
      return;
    }

    const confirmMessage = `Send thank you emails to ${acceptedSubmissions.length} accepted artists?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/send-artist-thank-you-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Successfully prepared ${result.emailCount} thank you emails for accepted artists!`);
      } else {
        console.error('Error sending thank you emails:', result);
        alert(`Error: ${result.error || 'Failed to send thank you emails'}`);
      }
    } catch (error) {
      console.error('Error sending thank you emails:', error);
      alert('Failed to send thank you emails. Please try again.');
    }
  };

  const sendRejectionEmail = async (submission: ArtistSubmission) => {
    try {
      const response = await fetch('/api/admin/artist-submissions/send-rejection-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          artistData: {
            name: submission.name,
            artist_alias: submission.artist_alias,
            email: submission.email
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error sending rejection email:', result.error);
        alert(`Failed to send email: ${result.error}`);
        return;
      }

      console.log('Rejection email sent successfully:', result);
      alert('Rejection email sent successfully!');

      // Update local state immediately to show contacted status
      setSubmissions(prevSubmissions =>
        prevSubmissions.map(sub =>
          sub.id === submission.id
            ? { ...sub, contacted: true }
            : sub
        )
      );

      // Also update selected submission if it's currently open
      if (selectedSubmission && selectedSubmission.id === submission.id) {
        setSelectedSubmission(prev => prev ? { ...prev, contacted: true } : null);
      }

      fetchSubmissions(); // Refresh submissions to ensure data consistency
    } catch (error) {
      console.error('Error sending rejection email:', error);
      alert('Failed to send rejection email. Please try again.');
    }
  };

  const getCanvasTypeBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    
    submissions.forEach(submission => {
      const canvasType = submission.preferred_canvas_size || 'Not specified';
      breakdown[canvasType] = (breakdown[canvasType] || 0) + 1;
    });
    
    return breakdown;
  };

  const openSubmissionModal = (submission: ArtistSubmission) => {
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
      case 'accepted':
        return '#20c997';
      case 'rejected':
        return '#dc3545';
      case 'declined':
        return '#fd7e14';
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
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'declined':
        return 'Declined';
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

  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true;
    return submission.status === filterStatus;
  });

  return (
    <PageContainer>
      <AdminHeader>
        <Title>Artist Submissions</Title>
        <FilterContainer>
          <TabContainer>
            <Tab 
              active={filterStatus === 'all'} 
              onClick={() => setFilterStatus('all')}
            >
              All
            </Tab>
            <Tab 
              active={filterStatus === 'pending_review'} 
              onClick={() => setFilterStatus('pending_review')}
            >
              Pending Review
            </Tab>
            <Tab 
              active={filterStatus === 'approved'} 
              onClick={() => setFilterStatus('approved')}
            >
              Approved
            </Tab>
            <Tab 
              active={filterStatus === 'rejected'} 
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected
            </Tab>
            <Tab 
              active={filterStatus === 'accepted'} 
              onClick={() => setFilterStatus('accepted')}
            >
              Accepted
            </Tab>
            <Tab 
              active={filterStatus === 'declined'} 
              onClick={() => setFilterStatus('declined')}
            >
              Declined
            </Tab>
          </TabContainer>
          <BulkEmailButton 
            onClick={sendBulkEmails}
            disabled={isBulkEmailing}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            {isBulkEmailing 
              ? `Sending... (${bulkEmailProgress.sent}/${bulkEmailProgress.total})` 
              : 'Send All Emails'
            }
          </BulkEmailButton>
          <BulkCanvasPickupButton 
            onClick={sendBulkCanvasPickupEmails}
            disabled={isBulkEmailing}
          >
            <FontAwesomeIcon icon={faBox} />
            {isBulkEmailing 
              ? `Sending... (${bulkEmailProgress.sent}/${bulkEmailProgress.total})` 
              : 'Send Canvas Pickup'
            }
          </BulkCanvasPickupButton>
          <BulkCanvasPickupButton 
            onClick={copyAllArtistNames}
          >
            <FontAwesomeIcon icon={faCopy} />
            Copy All Names
          </BulkCanvasPickupButton>
          <BulkCanvasPickupButton 
            onClick={sendThankYouEmails}
            style={{ background: '#28a745' }}
          >
            <FontAwesomeIcon icon={faHeart} />
            Send Thank You Emails
          </BulkCanvasPickupButton>
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
            <StatCard>
              <StatNumber>{submissions.filter(s => s.status === 'accepted').length}</StatNumber>
              <StatLabel>Accepted</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{submissions.filter(s => s.status === 'declined').length}</StatNumber>
              <StatLabel>Declined</StatLabel>
            </StatCard>
          </StatsContainer>

          <CanvasBreakdownContainer>
            <CanvasBreakdownTitle>Canvas Type Breakdown</CanvasBreakdownTitle>
            <CanvasBreakdownGrid>
              {Object.entries(getCanvasTypeBreakdown()).map(([canvasType, count]) => (
                <CanvasBreakdownItem key={canvasType}>
                  <CanvasTypeLabel>{canvasType}</CanvasTypeLabel>
                  <CanvasTypeCount>{count}</CanvasTypeCount>
                </CanvasBreakdownItem>
              ))}
            </CanvasBreakdownGrid>
          </CanvasBreakdownContainer>

          <SubmissionsGrid>
            {filteredSubmissions.map((submission) => (
              <SubmissionCard key={submission.id}>
                <SubmissionHeader>
                  <ArtistInfo>
                    <ArtistName>{submission.name}</ArtistName>
                    {submission.artist_alias && (
                      <ArtistAlias>&quot;{submission.artist_alias}&quot;</ArtistAlias>
                    )}
                  </ArtistInfo>
                  <StatusBadge color={getStatusColor(submission.status)}>
                    {getStatusLabel(submission.status)}
                  </StatusBadge>
                </SubmissionHeader>

                <CompactContent>
                  <InfoSection>
                    <SubmissionDetails>
                      {submission.instagram_link && (
                        <DetailRow>
                          <FontAwesomeIcon icon={faInstagram} />
                          <LinkText href={submission.instagram_link} target="_blank" rel="noopener noreferrer">
                            {submission.instagram_link}
                          </LinkText>
                        </DetailRow>
                      )}
                      {submission.portfolio_link && (
                        <DetailRow>
                          <FontAwesomeIcon icon={faLink} />
                          <LinkText href={submission.portfolio_link} target="_blank" rel="noopener noreferrer">
                            {submission.portfolio_link}
                          </LinkText>
                        </DetailRow>
                      )}
                      {submission.preferred_canvas_size && (
                        <DetailRow>
                          <FontAwesomeIcon icon={faPalette} />
                          <span>
                            Canvas: {submission.preferred_canvas_size === '18x18' && '18" x 18"'}
                            {submission.preferred_canvas_size === '18x24' && '18" x 24"'}
                            {submission.preferred_canvas_size === 'own-canvas' && 'Own canvas'}
                          </span>
                        </DetailRow>
                      )}
                      <DetailRow>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{submission.email}</span>
                      </DetailRow>
                      <DetailRow>
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{submission.phone}</span>
                      </DetailRow>
                    </SubmissionDetails>

                    {submission.additional_notes && (
                      <NotesSection>
                        <NotesLabel>Artist Statement:</NotesLabel>
                        <CardNotesText>{submission.additional_notes}</CardNotesText>
                      </NotesSection>
                    )}

                    <SubmissionMeta>
                      <MetaText>Submitted: {new Date(submission.created_at).toLocaleDateString()}</MetaText>
                      {submission.willing_to_volunteer && <MetaText>• Willing to volunteer</MetaText>}
                      {submission.interested_in_future_events && <MetaText>• Interested in future events</MetaText>}
                      {submission.contacted && <MetaText>• Email sent</MetaText>}
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
                      {submission.status === 'approved' && (
                        <>
                          <ActionButton 
                            color="primary" 
                            onClick={() => sendAcceptanceEmail(submission)}
                            disabled={submission.contacted}
                          >
                            <FontAwesomeIcon icon={faEnvelope} />
                            {submission.contacted ? 'Email Sent' : 'Send Email'}
                          </ActionButton>
                          <ActionButton 
                            color="warning" 
                            onClick={() => sendCanvasPickupEmail(submission)}
                          >
                            <FontAwesomeIcon icon={faBox} />
                            Canvas Pickup
                          </ActionButton>
                          <ActionButton 
                            color="success" 
                            onClick={() => updateSubmissionStatus(submission.id, 'accepted')}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            Mark Accepted
                          </ActionButton>
                          <ActionButton 
                            color="danger" 
                            onClick={() => updateSubmissionStatus(submission.id, 'declined')}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                            Mark Declined
                          </ActionButton>
                        </>
                      )}
                      {submission.status === 'rejected' && (
                        <ActionButton 
                          color="warning" 
                          onClick={() => sendRejectionEmail(submission)}
                          disabled={submission.contacted}
                        >
                          <FontAwesomeIcon icon={faEnvelope} />
                          {submission.contacted ? 'Email Sent' : 'Send Rejection'}
                        </ActionButton>
                      )}
                      {submission.status === 'accepted' && (
                        <ActionButton 
                          color="success" 
                          disabled
                        >
                          <FontAwesomeIcon icon={faCheck} />
                          Accepted
                        </ActionButton>
                      )}
                      {submission.status === 'declined' && (
                        <ActionButton 
                          color="danger" 
                          disabled
                        >
                          <FontAwesomeIcon icon={faTimes} />
                          Declined
                        </ActionButton>
                      )}
                    </ActionButtons>
                  </InfoSection>

                  <PortfolioSection>
                    <PortfolioLabel>
                      <FontAwesomeIcon icon={faImage} />
                      Portfolio ({submission.portfolio_files.length} files)
                    </PortfolioLabel>
                    <PortfolioThumbnails>
                      {submission.portfolio_files.map((fileUrl, index) => (
                        <PortfolioThumbnail 
                          key={index} 
                          src={fileUrl} 
                          alt={`Portfolio ${index + 1}`}
                          onClick={() => openImageModal(fileUrl, submission.portfolio_files)}
                        />
                      ))}
                    </PortfolioThumbnails>
                  </PortfolioSection>
                </CompactContent>
              </SubmissionCard>
            ))}
          </SubmissionsGrid>

          {filteredSubmissions.length === 0 && (
            <EmptyState>
              <EmptyStateText>No submissions found</EmptyStateText>
              <EmptyStateSubtext>
                {filterStatus === 'all' 
                  ? 'No artist submissions have been received yet.' 
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
              <ModalTitle>Artist Application Details</ModalTitle>
              <CloseButton onClick={() => setSelectedSubmission(null)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              <Section>
                <SectionTitle>Artist Information</SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Name:</DetailLabel>
                    <DetailValue>{selectedSubmission.name}</DetailValue>
                  </DetailItem>
                  {selectedSubmission.artist_alias && (
                    <DetailItem>
                      <DetailLabel>Artist Alias:</DetailLabel>
                      <DetailValue>{selectedSubmission.artist_alias}</DetailValue>
                    </DetailItem>
                  )}
                  <DetailItem>
                    <DetailLabel>Email:</DetailLabel>
                    <DetailValue>{selectedSubmission.email}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Phone:</DetailLabel>
                    <DetailValue>{selectedSubmission.phone}</DetailValue>
                  </DetailItem>
                  {selectedSubmission.instagram_link && (
                    <DetailItem>
                      <DetailLabel>Instagram:</DetailLabel>
                      <DetailValue>{selectedSubmission.instagram_link}</DetailValue>
                    </DetailItem>
                  )}
                  {selectedSubmission.portfolio_link && (
                    <DetailItem>
                      <DetailLabel>Portfolio Link:</DetailLabel>
                      <DetailValue>
                        <a href={selectedSubmission.portfolio_link} target="_blank" rel="noopener noreferrer">
                          {selectedSubmission.portfolio_link}
                        </a>
                      </DetailValue>
                    </DetailItem>
                  )}
                  {selectedSubmission.preferred_canvas_size && (
                    <DetailItem>
                      <DetailLabel>Preferred Canvas Size:</DetailLabel>
                      <DetailValue>
                        {selectedSubmission.preferred_canvas_size === '18x18' && '18" x 18"'}
                        {selectedSubmission.preferred_canvas_size === '18x24' && '18" x 24"'}
                        {selectedSubmission.preferred_canvas_size === 'own-canvas' && "I'll provide my own canvas"}
                      </DetailValue>
                    </DetailItem>
                  )}
                </DetailGrid>
              </Section>

              <Section>
                <SectionTitle>Portfolio Files</SectionTitle>
                <PortfolioGrid>
                  {selectedSubmission.portfolio_files.map((fileUrl, index) => (
                    <PortfolioImage 
                      key={index} 
                      src={fileUrl} 
                      alt={`Portfolio ${index + 1}`}
                      onClick={() => openImageModal(fileUrl, selectedSubmission.portfolio_files)}
                    />
                  ))}
                </PortfolioGrid>
              </Section>

              {selectedSubmission.additional_notes && (
                <Section>
                  <SectionTitle>Artist Statement</SectionTitle>
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
            
            <FullImage src={selectedImage} alt="Portfolio preview" />
            
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

// Styled Components
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


const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#e9ecef'};
    color: ${props => props.active ? 'white' : '#333'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const RefreshButton = styled(Button)`
  background: #007bff;
  color: white;
  
  &:hover {
    background: #0056b3;
  }
`;

const BulkEmailButton = styled(Button)`
  background: #28a745;
  color: white;
  
  &:hover:not(:disabled) {
    background: #1e7e34;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const BulkCanvasPickupButton = styled(Button)`
  background: #fd7e14;
  color: white;
  
  &:hover:not(:disabled) {
    background: #e55a00;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
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

const CanvasBreakdownContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CanvasBreakdownTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`;

const CanvasBreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const CanvasBreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
`;

const CanvasTypeLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const CanvasTypeCount = styled.span`
  font-weight: bold;
  color: #007bff;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  min-width: 30px;
  text-align: center;
`;

const SubmissionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SubmissionCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CompactContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PortfolioSection = styled.div`
  width: 100%;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
`;

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const ArtistInfo = styled.div`
  flex: 1;
`;

const ArtistName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #333;
`;

const ArtistAlias = styled.div`
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
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

const LinkText = styled.a`
  color: #007bff;
  text-decoration: none;
  word-break: break-all;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
    color: #0056b3;
  }
`;

const NotesSection = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
  border-left: 3px solid #007bff;
`;

const NotesLabel = styled.div`
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const CardNotesText = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
  max-height: 4.5rem;
  overflow: hidden;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 1.2rem;
    background: linear-gradient(to right, transparent, #f8f9fa);
  }
`;

const PortfolioLabel = styled.div`
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

const PortfolioThumbnails = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  overflow-x: auto;
  padding: 0.5rem 0;
`;

const PortfolioThumbnail = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  &:hover {
    border-color: #007bff;
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const SubmissionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
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

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

const PortfolioImage = styled.img`
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

// Image Modal Components
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
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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
  max-width: calc(90vw - 4rem);
  max-height: calc(90vh - 4rem);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  display: block;
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

export default ArtistSubmissionsAdmin;
