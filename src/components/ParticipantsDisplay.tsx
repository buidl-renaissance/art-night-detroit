import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { EventParticipant } from '@/types/events';

interface AnonymousParticipant {
  id: string;
  event_id: string;
  email: string;
  full_name: string;
  tagline?: string;
  website?: string;
  instagram: string;
  role: string;
  image_url?: string;
  performance_details?: string;
  setup_requirements?: string;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface ParticipantsDisplayProps {
  participants: EventParticipant[];
  anonymousParticipants: AnonymousParticipant[];
  showAddButton?: boolean;
  onAddParticipant?: () => void;
}

const ParticipantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
`;

const ParticipantCard = styled.div`
  padding: 2rem;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ParticipantImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ParticipantName = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: white;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const InstagramHandle = styled.p`
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
  opacity: 0.8;
`;

const ParticipantTagline = styled.p`
  color: #e0e0e0;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-style: italic;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
`;

const SocialLink = styled.a`
  color: #e0e0e0;
  text-decoration: none;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: color 0.2s ease;
  
  &:hover {
    color: white;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
    padding: 0.4rem;
  }
`;

const GroupTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin: 1.5rem 0 0.75rem 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #e0e0e0;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
`;

const EmptyStateText = styled.p`
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #e0e0e0;
`;

const AddButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 2rem;

  &:hover {
    background: #2563eb;
  }
`;

export default function ParticipantsDisplay({ 
  participants, 
  anonymousParticipants, 
  showAddButton = false, 
  onAddParticipant 
}: ParticipantsDisplayProps) {
  const allParticipants = [
    ...participants.map(p => ({
      ...p,
      type: 'authenticated' as const,
      displayName: p.profile?.full_name || 'Unknown',
      tagline: p.profile?.tagline,
      website: p.profile?.website,
      imageUrl: p.profile?.image_url,
      instagram: p.profile?.handle,
    })),
    ...anonymousParticipants.map(p => ({
      ...p,
      type: 'anonymous' as const,
      displayName: p.full_name,
      tagline: p.tagline,
      website: p.website,
      imageUrl: p.image_url,
      instagram: p.instagram,
    }))
  ];

  // Group participants by role in the specified order
  const roleOrder = ['Featured Artist', 'DJ', 'Vendor', 'Attendee'];
  const groupedParticipants = roleOrder.map(role => ({
    role,
    participants: allParticipants.filter(p => p.role === role)
  })).filter(group => group.participants.length > 0);

  return (
    <>
      {allParticipants.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No Participants Yet</EmptyStateTitle>
          <EmptyStateText>
            Be the first to add your information to this event!
          </EmptyStateText>
          {showAddButton && onAddParticipant && (
            <AddButton onClick={onAddParticipant}>Add Your Information</AddButton>
          )}
        </EmptyState>
      ) : (
        <>
          {showAddButton && onAddParticipant && (
            <AddButton onClick={onAddParticipant}>Add Your Information</AddButton>
          )}
          
          {groupedParticipants.map((group) => (
            <div key={group.role}>
              <GroupTitle>{group.role}s</GroupTitle>
              <ParticipantsGrid>
                {group.participants.map((participant, index) => (
                  <ParticipantCard key={`${participant.type}-${index}`}>
                    {participant.imageUrl && (
                      <ParticipantImage src={participant.imageUrl} alt={participant.displayName} />
                    )}
                    <ParticipantName>{participant.displayName}</ParticipantName>
                    {participant.instagram && (
                      <InstagramHandle>@{participant.instagram.replace('@', '')}</InstagramHandle>
                    )}
                    {participant.tagline && (
                      <ParticipantTagline>&ldquo;{participant.tagline}&rdquo;</ParticipantTagline>
                    )}
                    {(participant.website || participant.instagram) && (
                      <SocialLinks>
                        {participant.website && (
                          <SocialLink href={participant.website} target="_blank" rel="noopener noreferrer" title="Visit Website">
                            <FontAwesomeIcon icon={faGlobe} />
                          </SocialLink>
                        )}
                        {participant.instagram && (
                          <SocialLink 
                            href={`https://instagram.com/${participant.instagram.replace('@', '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            title={`Follow ${participant.displayName} on Instagram`}
                          >
                            <FontAwesomeIcon icon={faInstagram} />
                          </SocialLink>
                        )}
                      </SocialLinks>
                    )}
                  </ParticipantCard>
                ))}
              </ParticipantsGrid>
            </div>
          ))}
        </>
      )}
    </>
  );
} 