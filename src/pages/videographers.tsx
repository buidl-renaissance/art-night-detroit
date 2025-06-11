import styled from 'styled-components';
import { shimmer, float } from '@/components/styled/animations';
import PageContainer from '@/components/PageContainer';
import { useState } from 'react';

const VideographerPage = () => {
  const [selectedRole, setSelectedRole] = useState<'videographer' | 'archivist' | null>(null);

  const roles = {
    videographer: {
      emoji: '🎥',
      title: 'Event Videographer',
      description: 'Capture high-quality video footage at Art Night events and community activations.',
      responsibilities: [
        'Film on-site during scheduled events (including special productions)',
        'Capture b-roll and interviews for post-event content',
        'Coordinate with creative leads to identify key moments and narrative arcs',
        'Upload footage to our archival system for AI-assisted tagging and organization',
        'Review AI-generated edits and support final content curation',
        'Ensure proper handling, storage, and backup of media assets'
      ],
      qualifications: [
        'Experience with DSLR or mirrorless cameras, audio capture, and lighting',
        'Ability to work in fast-paced, dynamic environments',
        'Strong eye for composition and storytelling',
        'Familiarity with editing software and file management tools'
      ]
    },
    archivist: {
      emoji: '🗂',
      title: 'Digital Archivist & Content Reviewer',
      description: 'Support the long-term documentation and organization of community-generated media.',
      responsibilities: [
        'Review AI-tagged content and confirm metadata accuracy',
        'Organize footage into thematic collections tied to events, artists, and creative outputs',
        'Manage a peer-review system to verify quality and integrity of documented content',
        'Collaborate with developers to improve archive accessibility and searchability',
        'Ensure all archived media meets community standards and licensing terms'
      ],
      qualifications: [
        'Experience with digital asset management or content libraries',
        'Familiarity with metadata systems and file organization workflows',
        'Strong attention to detail and cultural sensitivity',
        'Interest in emerging technologies (AI, blockchain, decentralized media)'
      ]
    }
  };

  return (
    <PageContainer theme="dark" width="medium">
      <HeroSection>
        <Title>Join Our Creative Team</Title>
        <Subtitle>Help us capture and preserve Art Night&apos;s magical moments</Subtitle>
      </HeroSection>

      <RolesGrid>
        {Object.entries(roles).map(([key, role]) => (
          <RoleCard key={key} onClick={() => setSelectedRole(key as 'videographer' | 'archivist')}>
        <RoleTitle>
              <span>{role.emoji}</span> {role.title}
        </RoleTitle>
            <RoleDescription>{role.description}</RoleDescription>
            <LearnMoreButton>Learn More</LearnMoreButton>
          </RoleCard>
        ))}
      </RolesGrid>

      {selectedRole && (
        <Modal onClick={() => setSelectedRole(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedRole(null)}>×</CloseButton>
        <RoleTitle>
              <span>{roles[selectedRole].emoji}</span> {roles[selectedRole].title}
        </RoleTitle>
            <RoleDescription>{roles[selectedRole].description}</RoleDescription>

            <SectionTitle>Responsibilities</SectionTitle>
        <ResponsibilitiesList>
              {roles[selectedRole].responsibilities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
        </ResponsibilitiesList>

            <SectionTitle>Qualifications</SectionTitle>
        <QualificationsList>
              {roles[selectedRole].qualifications.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
        </QualificationsList>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 64px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 24px;
  font-family: var(--font-decorative);
  color: transparent;
  background: linear-gradient(90deg, #ffd700, #ffa500, #ffd700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;

  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #ffd700;
  font-weight: 400;
  font-family: var(--font-primary);

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const RolesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RoleCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border-radius: 24px;
  padding: 40px;
  cursor: pointer;
  transition: transform 0.2s;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &:hover {
    transform: translateY(-4px);
  }
`;

const RoleTitle = styled.h3`
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-decorative);
  grid-column: 1 / -1;

  span {
    animation: ${float} 6s infinite ease-in-out;
  }
`;

const RoleDescription = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 0;
  color: #e0e0e0;
`;

const LearnMoreButton = styled.button`
  background: #ffd700;
  color: #121212;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  height: fit-content;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: 100%;
  }

  &:hover {
    opacity: 0.9;
  }
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
  padding: 16px;
`;

const ModalContent = styled.div`
  background: #121212;
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #ffd700;
  font-size: 2rem;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
`;

const SectionTitle = styled.h4`
  color: #ffd700;
  font-size: 1.25rem;
  margin-bottom: 16px;
  margin-top: 24px;
`;

const ResponsibilitiesList = styled.ul`
  margin-bottom: 24px;
  padding-left: 20px;

  li {
    margin-bottom: 12px;
    line-height: 1.5;
    color: #e0e0e0;
    
    &:before {
      content: "•";
      color: #ffd700;
      font-weight: bold;
      display: inline-block;
      width: 1em;
      margin-left: -1em;
    }
  }
`;

const QualificationsList = styled(ResponsibilitiesList)`
  margin-bottom: 0;
`;

export default VideographerPage;
