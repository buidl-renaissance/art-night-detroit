import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Image from 'next/image';
import Layout from '../components/Layout';

const PageContainer = styled.div`
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: ${props => props.theme.fonts.primary};
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fonts.display};
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const CardInfoSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const CardNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const CardStatus = styled.div`
  font-size: 1.2rem;
  color: white;
  margin-bottom: 1.5rem;
`;

const RewardsSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  width: 100%;
`;

const SectionTitle = styled.h2`
  color: white;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
`;

const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const StarIcon = styled.div<{ $filled: boolean }>`
  font-size: 3rem;
  color: ${props => props.$filled ? '#ffd700' : 'rgba(255, 255, 255, 0.3)'};
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  &:before {
    content: ${props => props.$filled ? '"★"' : '"☆"'};
  }
`;

const RewardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const RewardItem = styled.div<{ $unlocked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, ${props => props.$unlocked ? '0.2' : '0.05'});
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, ${props => props.$unlocked ? '0.3' : '0.1'});
  color: ${props => props.$unlocked ? 'white' : 'rgba(255, 255, 255, 0.6)'};
`;

const RewardText = styled.div`
  font-size: 1.1rem;
`;

const RewardStars = styled.div`
  font-size: 0.9rem;
  color: #ffd700;
`;

const InstructionsSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const InstructionText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const LogoContainer = styled.div`
  margin: 2rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.div`
  position: relative;
  width: 200px;
  height: 120px;
`;

const ErrorMessage = styled.div`
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 2rem;
`;

interface RewardInfo {
  stars: number;
  title: string;
  description: string;
}

const REWARDS: RewardInfo[] = [
  { stars: 1, title: "Welcome Bonus", description: "10% off next event ticket" },
  { stars: 2, title: "Art Supplies", description: "Free sketch pad & pencil set" },
  { stars: 3, title: "Priority Access", description: "Early registration for popular events" },
  { stars: 4, title: "Art Print", description: "Limited edition ArtNight Detroit print" },
  { stars: 5, title: "Grand Prize", description: "Free private art session + supplies kit" },
];

const RewardsPage: React.FC = () => {
  const router = useRouter();
  const [cardId, setCardId] = useState<string | null>(null);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [isValidCard, setIsValidCard] = useState<boolean>(true);

  useEffect(() => {
    if (router.isReady) {
      const { card } = router.query;
      if (card && typeof card === 'string') {
        const cardNumber = parseInt(card, 10);
        if (cardNumber >= 1 && cardNumber <= 100) {
          setCardId(card.padStart(3, '0'));
          setIsValidCard(true);
          // Simulate random progress for demo purposes
          // In a real app, this would come from a database
          setStarsEarned(Math.floor(Math.random() * 6));
        } else {
          setIsValidCard(false);
        }
      } else {
        setCardId(null);
      }
    }
  }, [router.isReady, router.query]);

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon key={index} $filled={index < starsEarned} />
    ));
  };

  const getStatusMessage = () => {
    if (starsEarned === 0) {
      return "Get started by attending your first ArtNight event!";
    } else if (starsEarned === 5) {
      return "Congratulations! You've unlocked all rewards!";
    } else {
      return `${5 - starsEarned} more star${5 - starsEarned !== 1 ? 's' : ''} to unlock the grand prize!`;
    }
  };

  return (
    <Layout>
      <PageContainer>
        <LogoContainer>
          <Logo>
            <Image
              src="/images/art-night-detroit-logo.png"
              alt="ArtNight Detroit Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Logo>
        </LogoContainer>

        <Title>Rewards Program</Title>

        {!isValidCard && (
          <ErrorMessage>
            Invalid card number. Please check your QR code or card number and try again.
          </ErrorMessage>
        )}

        {cardId && isValidCard && (
          <>
            <CardInfoSection>
              <CardNumber>Card #{cardId}</CardNumber>
              <CardStatus>{getStatusMessage()}</CardStatus>
              <StarsContainer>
                {renderStars()}
              </StarsContainer>
            </CardInfoSection>

            <RewardsSection>
              <SectionTitle>Available Rewards</SectionTitle>
              <RewardsList>
                {REWARDS.map((reward, index) => (
                  <RewardItem key={index} $unlocked={starsEarned >= reward.stars}>
                    <RewardText>
                      <strong>{reward.title}</strong>
                      <br />
                      {reward.description}
                    </RewardText>
                    <RewardStars>{reward.stars} ★</RewardStars>
                  </RewardItem>
                ))}
              </RewardsList>
            </RewardsSection>
          </>
        )}

        <InstructionsSection>
          <SectionTitle>How It Works</SectionTitle>
          <InstructionText>
            Attend ArtNight Detroit events to earn stars on your punch card.
          </InstructionText>
          <InstructionText>
            Each event attendance earns you one star. Collect all 5 stars to unlock amazing rewards!
          </InstructionText>
          <InstructionText>
            Show your card to event organizers to get your stars punched.
          </InstructionText>
        </InstructionsSection>
      </PageContainer>
    </Layout>
  );
};

export default RewardsPage;
