import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useState } from 'react';

const MarketingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 4rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 0.75rem 3rem;
  }
`;

const VideoSection = styled.section`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: 1.5rem;
  }
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 800px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 2rem 6rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}20, ${({ theme }) => theme.colors.background.primary});
  border-radius: 24px;
  margin-bottom: 4rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 3rem 1.5rem 4rem;
    margin-bottom: 3rem;
    border-radius: 16px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 2rem 1rem 3rem;
    margin-bottom: 2rem;
    border-radius: 12px;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.2rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryHover});
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(108, 99, 255, 0.4);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1rem;
    padding: 0.875rem 2rem;
    width: 100%;
  }
`;

const Section = styled.section`
  margin-bottom: 5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-bottom: 4rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: 3rem;
  }
`;

const SectionHeader = styled.h2`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin-bottom: 3rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2rem;
    margin-bottom: 2.5rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1.65rem;
    margin-bottom: 2rem;
    line-height: 1.3;
  }
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }
`;

const BenefitCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.75rem;
    border-radius: 12px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

const BenefitIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 2.5rem;
    margin-bottom: 1.25rem;
  }
`;

const BenefitTitle = styled.h3`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1.25rem;
    margin-bottom: 0.875rem;
  }
`;

const BenefitDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  line-height: 1.6;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }
`;

const StepCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '→';
    position: absolute;
    right: -1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.primary};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      display: none;
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.75rem;
    border-radius: 12px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

const StepNumber = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1.5rem;
`;

const StepTitle = styled.h3`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  line-height: 1.6;
`;





const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    gap: 1rem;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 1.25rem;
    max-width: 100%;
  }
`;

const EmailInput = styled.input`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 50px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  width: 100%;
  max-width: 350px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.95rem;
    padding: 0.875rem 1.25rem;
    max-width: 100%;
  }
`;



const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  margin-top: 1rem;
`;

export default function FractionalOwnership() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/subscribe-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'cultural-bank'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }
      
      setSubmitStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Email subscription error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer theme="dark" width="medium">
      <MarketingContainer>
        <VideoSection>
          <VideoContainer>
            <Video 
              autoPlay 
              loop 
              muted 
              playsInline
              src="https://dpop.nyc3.digitaloceanspaces.com/uploads/money-printer-7995f8d0-1755637282035.mov"
            >
              Your browser does not support the video tag.
            </Video>
          </VideoContainer>
        </VideoSection>

        <HeroSection>
          <HeroTitle>Earn Interest in People, Not Debt</HeroTitle>
          <HeroSubtitle>
            What if your bank earned interest from collective growth—their art, their stories, their journey? 
          </HeroSubtitle>
          
          <EmailForm onSubmit={handleEmailSubmit}>
            <EmailInput
              type="email"
              placeholder="Enter your email to stay updated"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <CTAButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Joining...' : 'Deposit Your Belief in Art'}
            </CTAButton>
          </EmailForm>
          
          {submitStatus === 'success' && (
            <SuccessMessage>
              Welcome to the cultural central bank! Check your email for next steps.
            </SuccessMessage>
          )}
          
          {submitStatus === 'error' && (
            <ErrorMessage>
              Something went wrong. Please try again or contact us directly.
            </ErrorMessage>
          )}
        </HeroSection>

        <Section>
          <SectionHeader>Bank for Culture.</SectionHeader>
          <BenefitsGrid>
            <BenefitCard>
              <BenefitIcon>🎨</BenefitIcon>
              <BenefitTitle>Direct Artist Investment</BenefitTitle>
              <BenefitDescription>
                Put your money directly into Detroit artists. Watch your investment grow as they create and thrive.
              </BenefitDescription>
            </BenefitCard>
            
            <BenefitCard>
              <BenefitIcon>💰</BenefitIcon>
              <BenefitTitle>Cultural Returns</BenefitTitle>
              <BenefitDescription>
                Earn returns from artistic growth, not corporate debt. Your profit comes from supporting creativity.
              </BenefitDescription>
            </BenefitCard>
          </BenefitsGrid>
        </Section>

        <Section>
          <SectionHeader>How It Works</SectionHeader>
          <StepsContainer>
            <StepCard>
              <StepNumber>1</StepNumber>
              <StepTitle>Choose an Artist</StepTitle>
              <StepDescription>
                Browse Detroit artists and invest in their creative journey.
              </StepDescription>
            </StepCard>
            
            <StepCard>
              <StepNumber>2</StepNumber>
              <StepTitle>Invest & Support</StepTitle>
              <StepDescription>
                Start with as little as $100. Your money funds their art and growth.
              </StepDescription>
            </StepCard>
            
            <StepCard>
              <StepNumber>3</StepNumber>
              <StepTitle>Earn Together</StepTitle>
              <StepDescription>
                As artists succeed and create value, your investment grows with the culture.
              </StepDescription>
            </StepCard>
          </StepsContainer>
        </Section>




      </MarketingContainer>
    </PageContainer>
  );
}
