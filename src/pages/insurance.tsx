import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

const theme = {
  colors: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    text: {
      primary: '#333333',
      light: '#666666',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
    },
    border: '#e0e0e0',
  },
  spacing: {
    small: '1rem',
    medium: '2rem',
    large: '4rem',
  },
  borderRadius: '12px',
  typography: {
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.3rem',
    body: '1.2rem',
  },
};

const InsurancePage = () => {
  return (
    <PageContainer theme="dark">
      <Container>
        <Hero>
          <h1>Artist Insurance Pool</h1>
          <p>Creating art live at an event is a big commitment. Not every piece sells — but every artist should be supported.</p>
        </Hero>

        <Section>
          <h2>How It Works</h2>
          <FeatureGrid>
            <Feature>
              <h3>Collective Support</h3>
              <p>Every raffle ticket sold contributes to the Artist Guarantee Fund, ensuring all artists are supported.</p>
            </Feature>
            <Feature>
              <h3>Guaranteed Baseline</h3>
              <p>All participating artists are guaranteed a minimum payout of $50 for their work.</p>
            </Feature>
            <Feature>
              <h3>Keep What You Earn</h3>
              <p>Artists keep 100% of raffle earnings if they exceed the guarantee amount.</p>
            </Feature>
            <Feature>
              <h3>Safety Net</h3>
              <p>If earnings fall short, the insurance pool tops up to the guaranteed amount.</p>
            </Feature>
          </FeatureGrid>
        </Section>

        <Section>
          <h2>Payment Options</h2>
          <PaymentOptions>
            <Option>
              <h3>For Artists</h3>
              <ul>
                <li>PayPal</li>
                <li>Venmo</li>
                <li>Crypto wallet</li>
              </ul>
            </Option>
            <Option>
              <h3>For Participants</h3>
              <ul>
                <li>Credit Card</li>
                <li>ETH</li>
                <li>USDC</li>
              </ul>
            </Option>
          </PaymentOptions>
        </Section>

        <CTASection>
          <Button primary>Support the Pool</Button>
          <Button>Learn More</Button>
        </CTASection>
      </Container>
    </PageContainer>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.medium};
`;

const Hero = styled.div`
  text-align: center;
  margin: ${theme.spacing.large} 0;
  
  h1 {
    font-size: ${theme.typography.h1};
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${theme.spacing.small};
    line-height: 1.2;
  }
  
  p {
    font-size: ${theme.typography.body};
    color: ${({ theme }) => theme.colors.text.light};
    line-height: 1.6;
  }
`;

const Section = styled.section`
  margin: ${theme.spacing.large} 0;
  
  h2 {
    text-align: center;
    margin-bottom: ${theme.spacing.medium};
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${theme.typography.h2};
    line-height: 1.2;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.medium};
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Feature = styled.div`
  padding: ${theme.spacing.medium};
  border-radius: ${theme.borderRadius};
  background: ${({ theme }) => theme.colors.background.secondary};
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  h3 {
    margin-bottom: ${theme.spacing.small};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${theme.typography.h3};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    line-height: 1.5;
  }
`;

const PaymentOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(1fr);
  gap: ${theme.spacing.medium};
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
`;

const Option = styled.div`
  padding: ${theme.spacing.medium};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${theme.borderRadius};
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${theme.typography.h3};
  }

  ul {
    list-style: none;
    padding: 0;
    margin: ${theme.spacing.small} 0;
  }
  
  li {
    margin: 0.5rem 0;
    color: ${({ theme }) => theme.colors.text.light};
  }
`;

const CTASection = styled.div`
  text-align: center;
  margin: ${theme.spacing.large} 0;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  margin: 0 ${theme.spacing.small};
  border: none;
  border-radius: ${theme.borderRadius};
  font-size: ${theme.typography.body};
  font-weight: bold;
  cursor: pointer;
  background: ${props => props.primary ? theme.colors.primary : theme.colors.background.secondary};
  color: ${props => props.primary ? theme.colors.background.primary : theme.colors.text.primary};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? theme.colors.primaryHover : theme.colors.background.primary};
    transform: translateY(-2px);
  }
`;

export default InsurancePage;
