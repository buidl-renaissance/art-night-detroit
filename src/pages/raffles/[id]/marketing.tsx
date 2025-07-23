import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';
import { useRaffleData } from '@/hooks/useRaffleData';

const MarketingContainer = styled.div`
  max-width: 900px;
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
  font-size: 2.7rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: 1.1rem;
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
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 0 auto;
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  width: 300px;
`;

const ArtistImage = styled.img`
  width: 100%;
  height: 320px;
  object-fit: cover;
`;

const ArtistInfo = styled.div`
  padding: 0.7rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const ArtistName = styled.h3`
  font-size: 1.1rem;
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
  font-size: 0.95rem;
  text-decoration: none;
  margin-top: 0.2rem;
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
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin-bottom: 0.7rem;
  text-align: center;
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
    <PageContainer theme="dark" width="medium">
      <MarketingContainer>
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
                  <ArtistBio>{artist.bio}</ArtistBio>
                  {artist.instagram_handle && (
                    <InstagramLink
                      href={`https://instagram.com/${artist.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{artist.instagram_handle}
                    </InstagramLink>
                  )}
                </ArtistInfo>
              </ArtistCard>
            ))}
          </ArtistsGrid>
        </Section>
      </MarketingContainer>
    </PageContainer>
  );
} 