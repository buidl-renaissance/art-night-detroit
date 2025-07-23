import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

const MarketingContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  text-align: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.7rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 2rem;
  line-height: 1.6;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionHeader = styled.h2`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const QRGrid = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const QRCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 1.5rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
`;

const QRImage = styled.img`
  width: 180px;
  height: 180px;
  object-fit: contain;
  margin-bottom: 1rem;
`;

const QRLabel = styled.div`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

const PriceBadge = styled.div`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 2.2rem;
  font-weight: bold;
  border-radius: 2rem;
  padding: 1rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  letter-spacing: 0.03em;
  text-align: center;
`;

// Static data for demo
const TICKET_PRICE = 10;

export default function RaffleMarketing() {
  return (
    <PageContainer theme="dark" width="medium">
      <MarketingContainer>
        <Header>
          <Title>Live Art Raffles</Title>
          <Description>
            Enter for a chance to win original artwork from Detroit artists! Purchase raffle tickets and support the local art community. Winners will be drawn live at the event.
          </Description>
        </Header>

        <Section>
          <SectionHeader>Payment Methods</SectionHeader>
          <PriceBadge>Tickets ${TICKET_PRICE} each</PriceBadge>
          <QRGrid>
            <QRCard>
              <QRImage src="/images/jg-venmo.jpg" alt="Venmo QR" />
              <QRLabel>Venmo: @johngulbronson</QRLabel>
            </QRCard>
            <QRCard>
              <QRImage src="/images/jg-cash-app.jpg" alt="Cash App QR" />
              <QRLabel>Cash App: $johngulbronson</QRLabel>
            </QRCard>
          </QRGrid>
          <Description>
            Scan a QR code above to pay for your tickets.
          </Description>
        </Section>
      </MarketingContainer>
    </PageContainer>
  );
} 