import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';
import { useRaffleData } from '@/hooks/useRaffleData';

const MarketingContainer = styled.div`
  margin: 0 auto;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  margin-bottom: 1.2rem;
  text-align: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 1rem;
  line-height: 1.4;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 1.2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionHeader = styled.h2`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
  margin-top: 5rem;
`;

const QRGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const QRCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 1rem 1.2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
`;

const QRImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 0.5rem;
`;

const QRLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

const CashIcon = styled.div`
  font-size: 8rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 8px;
  margin: 0 auto 0.5rem auto;
`;

// const CashDescription = styled.div`
//   font-size: 0.9rem;
//   color: ${({ theme }) => theme.colors.text.light};
//   margin-top: 0.25rem;
// `;

const PriceBadge = styled.div`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 2rem;
  padding: 0.5rem 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  letter-spacing: 0.03em;
  text-align: center;
  border: 2px solid #fff;

  @media print {
    background: #000 !important;
    color: #fff !important;
    border: 2px solid #000 !important;
    box-shadow: none !important;
  }
`;

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 0 auto;
  justify-items: center;
  width: 100%;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
  @media print {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 0.5rem !important;
    margin: 0 !important;
    width: 100% !important;
  }
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  width: 300px;
  @media print {
    width: 220px !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
`;

const ArtistImage = styled.img`
  width: 100%;
  height: 320px;
  object-fit: cover;
  @media print {
    height: 220px !important;
  }
`;

const ArtistInfo = styled.div`
  padding: 0.7rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const ArtistName = styled.h3`
  font-size: 1.8rem;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ArtistBio = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.95rem;
  line-height: 1.3;
  margin: 0;
`;

const InstagramLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.25rem;
  text-decoration: none;
  margin-top: 0rem;
  &:hover { text-decoration: underline; }
`;

const Loading = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1.3rem;
  text-align: center;
  margin-top: 4rem;
`;

const Error = styled.div`
  color: #ff4444;
  font-size: 1.2rem;
  text-align: center;
  margin-top: 4rem;
`;

const EndDate = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const LogoContainer = styled.div`
  margin-top: 5rem;
  margin-bottom: 1.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Logo = styled.img`
  max-width: 500px;
  height: auto;
`;

function formatDateTime(dateStr: string | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) +
    ' at ' + date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function RaffleMarketingById() {
  const router = useRouter();
  const { id } = router.query;
  const { raffle, artists, loading, error } = useRaffleData(id);

  if (loading) {
    return (
      <PageContainer theme="dark" width="medium">
        <Loading>Loading raffle details...</Loading>
      </PageContainer>
    );
  }

  if (error || !raffle) {
    return (
      <PageContainer theme="dark" width="medium">
        <Error>Raffle not found.</Error>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark" width="full">
      <MarketingContainer>
        <LogoContainer>
          <Logo src="/images/art-night-detroit-logo.png" alt="Art Night Detroit" />
        </LogoContainer>
        
        <Header>
          <Title>{raffle.name}</Title>
          <Description>{raffle.description}</Description>
          <EndDate>
            RAFFLE ENDS <br /> {formatDateTime(raffle.end_date)}
          </EndDate>
        </Header>

        <Section>
          <SectionHeader>Payment Methods</SectionHeader>
          <PriceBadge>Tickets ${raffle.price_per_ticket} each</PriceBadge>
          <QRGrid>
            <QRCard>
              <QRImage src="/images/jg-venmo.jpg" alt="Venmo QR" />
              <QRLabel>Venmo: @John-Gulbronson</QRLabel>
            </QRCard>
            <QRCard>
              <QRImage src="/images/jg-cash-app.jpg" alt="Cash App QR" />
              <QRLabel>Cash App: $JohnGulbronson</QRLabel>
            </QRCard>
            <QRCard>
              <QRImage src="/images/base-chain.jpg" alt="Base App QR" />
              <QRLabel>Base App: wiredinsamurai</QRLabel>
            </QRCard>
            <QRCard>
              <CashIcon>💵</CashIcon>
              <QRLabel>Cash</QRLabel>
            </QRCard>
          </QRGrid>
          {/* <Description>
            Scan a QR code above to pay for your tickets.
          </Description> */}
        </Section>

        <Section>
          <SectionHeader>Participating Artists</SectionHeader>
          <ArtistsGrid>
            {artists.map((artist) => (
              <ArtistCard key={artist.id}>
                <ArtistImage src={artist.image_url} alt={artist.name} />
                <ArtistInfo>
                  <ArtistName>{artist.name}</ArtistName>
                  {artist.instagram_handle && (
                    <InstagramLink
                      href={`https://instagram.com/${artist.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{artist.instagram_handle}
                    </InstagramLink>
                  )}
                  <ArtistBio>{artist.bio}</ArtistBio>
                </ArtistInfo>
              </ArtistCard>
            ))}
          </ArtistsGrid>
        </Section>
      </MarketingContainer>
    </PageContainer>
  );
} 