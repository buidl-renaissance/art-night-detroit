import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import RaffleCountdown from '@/components/RaffleCountdown';
import FullScreenLoader from '@/components/FullScreenLoader';
import QuantityControls from '@/components/QuantityControls';
import { useRaffleData } from '@/hooks/useRaffleData';
import { useRaffleTicketManager } from '@/hooks/useRaffleTicketManager';

const RaffleContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 4rem;
`;

const RaffleHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const RaffleTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const RaffleDescription = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ArtistCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ArtistImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ArtistInfo = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const ArtistHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ArtistName = styled.h3`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ArtistBio = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
`;

const TotalTickets = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 1rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const TicketInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 8px;
  margin-top: auto;
  text-align: center;
`;

const TicketCount = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &::before {
    content: "🎟️";
  }
`;

const TicketValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

const TicketSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.text.light};
    cursor: not-allowed;
  }
`;

const PurchaseButton = styled(SubmitButton)`
  background: ${({ theme }) => theme.colors.primary};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  padding-top: 0;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 1rem;
  text-align: center;
`;

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const AvailableTickets = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: bold;
`;

const SectionHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.light};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

export default function RafflePage() {
  const router = useRouter();
  const { id } = router.query;
  const [artistQuantities, setArtistQuantities] = useState<{ [artistId: string]: number }>({});
  
  const { raffle, artists, unusedTickets, loading } = useRaffleData(id);
  const { error, submitTickets } = useRaffleTicketManager({
    raffleId: id,
    unusedTickets
  });

  const totalTicketsRequested = Object.values(artistQuantities).reduce((sum, count) => sum + count, 0);
  const remainingTickets = unusedTickets.length - totalTicketsRequested;

  if (loading) {
    return <FullScreenLoader label="Loading raffle details..." />;
  }

  if (!raffle) {
    return (
      <PageContainer theme="dark" width="medium">
        <ErrorMessage>Raffle not found</ErrorMessage>
      </PageContainer>
    );
  }

  const handleQuantityChange = (artistId: string, quantity: number) => {
    setArtistQuantities(prev => ({
      ...prev,
      [artistId]: quantity
    }));
  };

  return (
    <PageContainer theme="dark">
      <RaffleContainer>
        <RaffleHeader>
          <RaffleTitle>{raffle.name}</RaffleTitle>
          <RaffleDescription>{raffle.description}</RaffleDescription>
        </RaffleHeader>

        <RaffleCountdown endDate={raffle.end_date} />

        <TicketSection>
          <SectionHeader>
            <SectionTitle>Select Artists</SectionTitle>
            <SectionSubtitle>
              {unusedTickets.length > 0 
                ? `You have ${unusedTickets.length} ticket${unusedTickets.length === 1 ? '' : 's'} to assign`
                : 'You have no tickets available to assign'}
            </SectionSubtitle>
          </SectionHeader>

          <ArtistsGrid>
            {artists.map((artist) => (
              <ArtistCard key={artist.id}>
                <ArtistImage src={artist.image_url} alt={artist.name} />
                <ArtistInfo>
                  <ArtistHeader>
                    <ArtistName>{artist.name}</ArtistName>
                    <ArtistBio>{artist.bio}</ArtistBio>
                    <TotalTickets>
                      Tickets entered: {artist.total_tickets || 0}
                    </TotalTickets>
                  </ArtistHeader>
                  <TicketInfo>
                    <TicketCount>
                      Your Ticket Entries: <TicketValue>{artist.user_tickets || 0}</TicketValue>
                    </TicketCount>
                  </TicketInfo>
                  {unusedTickets.length > 0 && (
                    <QuantityControls
                      quantity={artistQuantities[artist.id] || 0}
                      min={0}
                      max={remainingTickets + (artistQuantities[artist.id] || 0)}
                      onChange={(value) => handleQuantityChange(artist.id, value)}
                    />
                  )}
                </ArtistInfo>
              </ArtistCard>
            ))}
          </ArtistsGrid>
        </TicketSection>
      </RaffleContainer>
      {unusedTickets.length > 0 ? (
        <BottomBar>
          <ButtonContainer>
            <SubmitButton
              onClick={() => submitTickets(artistQuantities)}
              disabled={totalTicketsRequested === 0}
            >
              Submit {totalTicketsRequested} Ticket{totalTicketsRequested === 1 ? '' : 's'}
            </SubmitButton>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </ButtonContainer>
          <AvailableTickets>
            Available Tickets: {remainingTickets}
          </AvailableTickets>
        </BottomBar>
      ) : (
        <BottomBar>
          <ButtonContainer>
            <PurchaseButton onClick={() => router.push(`/tickets/checkout?raffleId=${id}`)}>
              Purchase Tickets
            </PurchaseButton>
          </ButtonContainer>
        </BottomBar>
      )}
    </PageContainer>
  );
} 