import styled, { keyframes } from "styled-components";

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glow = keyframes`
  0% { text-shadow: 0 0 10px rgba(108, 73, 7, 0.5); }
  50% { text-shadow: 0 0 20px rgba(187, 137, 48, 0.8), 0 0 30px rgba(182, 85, 28, 0.6); }
  100% { text-shadow: 0 0 10px rgba(108, 73, 7, 0.5); }
`;

const PageWrapper = styled.div`
  background: linear-gradient(
    135deg,
    rgba(58, 38, 6, 0.9) 0%,
    rgba(108, 58, 20, 0.9) 50%,
    rgba(58, 38, 6, 0.9) 100%
  );
  color: #e6e6e6;
  position: relative;
  overflow: hidden;
  font-family: var(--font-primary);
  min-height: 100vh;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/images/collector-quest-background.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.25;
    z-index: 0;
  }
`;

const PageContainer = styled.div`
  position: relative;
  z-index: 1;
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 48px;
  }

  @media (min-width: 1024px) {
    padding: 64px;
  }
`;

const FestivalSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  background: rgba(187, 137, 48, 0.1);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(187, 137, 48, 0.3);
`;

const FestivalTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 16px;
  color: transparent;
  background: linear-gradient(90deg, #bb8930, #b6551c, #bb8930);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
  font-family: var(--font-decorative);

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const EventInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin: 20px 0;
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1rem;
  font-family: var(--font-primary);

  span {
    font-size: 1.5rem;
    animation: ${float} 6s infinite ease-in-out;
  }
`;

const FestivalFeatures = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
  margin-bottom: 0;
  font-size: 1rem;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(187, 137, 48, 0.2);
    border-radius: 16px;
    animation: ${float} 6s infinite ease-in-out;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 16px;
  margin-top: 40px;

  @media (min-width: 768px) {
    margin-bottom: 64px;
    padding: 0;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-top: 2rem;
  margin-bottom: 24px;
  font-family: var(--font-decorative);
  color: transparent;
  background: linear-gradient(90deg, #bb8930, #b6551c, #bb8930);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
  line-height: 1.2;

  span {
    font-size: 1.5rem;
    font-family: var(--font-decorative);
    color: #bb8930;
    line-height: 0.5;
  }

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }

  @media (min-width: 1024px) {
    font-size: 4rem;
    margin-bottom: 32px;
  }
`;

const Subtitle = styled.h5`
  font-size: 1.25rem;
  color: #bb8930;
  font-weight: 400;
  font-family: var(--font-primary);
  margin-bottom: 24px;
  /* animation: ${glow} 3s infinite ease-in-out; */
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.75rem;
    margin-bottom: 32px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  /* padding: 0 1rem; */

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }

  @media (min-width: 1024px) {
    gap: 48px;
    padding: 0;
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Card = styled.div`
  background: rgba(58, 38, 6, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(187, 137, 48, 0.3);
  padding: 1rem;
  transition: all 0.3s ease;
  height: 100%;

  @media (min-width: 768px) {
    padding: 1rem;
}

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(187, 137, 48, 0.6);
  }
`;

const CardTitle = styled.div`
  text-align: center;
  margin-bottom: 28px;

  .emoji {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 16px;
    animation: ${float} 6s infinite ease-in-out;
  }

  .icon-image {
    width: 128px;
    height: 128px;
    display: block;
    margin: 0 auto 16px;
    animation: ${float} 6s infinite ease-in-out;
    object-fit: contain;

    @media (min-width: 768px) {
      width: 80px;
      height: 80px;
    }
  }

  .text {
    font-size: 1.5rem;
    font-family: var(--font-accent);
    color: #bb8930;
    line-height: 1.2;

    @media (min-width: 768px) {
      font-size: 1.75rem;
    }
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  text-align: center;
`;

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  text-align: center;
  
  span {
    margin-bottom: 0.5rem;
    animation: ${float} 6s infinite ease-in-out;
    font-size: 1.5rem;
  }
`;

const ItemContent = styled.div`
  .primary {
    font-weight: 500;
    color: #e6e6e6;
    font-size: 1rem;
    margin-bottom: 2px;
  }
  
  .secondary {
    color: #bb8930;
    font-size: 0.875rem;
  }
`;

export default function DablsCollectorQuest() {
  return (
    <PageWrapper>
      <PageContainer>
        <HeroSection>
          <Title>
            Art Night Detroit
            <br />
            <span>x</span>
            <br />
            Dabls Fest
          </Title>
        </HeroSection>

        <FestivalSection>
          <FestivalTitle>15th Annual MBAD African Bead Festival</FestivalTitle>
          <EventInfo>
            <EventDetail>
              <span>🗓️</span>
              <div>Saturday, June 14, 2025 – 10am - 9pm</div>
            </EventDetail>
            <EventDetail>
              <span>📍</span>
              <div>
                Dabls MBAD African Bead Museum
                <br />
                6559 Grand River Ave, Detroit, MI
              </div>
            </EventDetail>
          </EventInfo>
          <FestivalFeatures>
            <span>🎨 Live Art</span>
            <span>🎵 Music</span>
            <span>🚚 Food Trucks</span>
            <span>🛍️ Vendors</span>
            <span>🤝 Community</span>
          </FestivalFeatures>
        </FestivalSection>

        <Grid>
          <Card>
            <CardTitle>
              <Title style={{ fontSize: "2rem" }}>COLLECTOR QUEST</Title>
              <Subtitle>
                Join the ultimate quest where digital meets reality! Complete
                challenges, earn raffle tickets, and win exclusive prizes.
              </Subtitle>
              <img
                src="/images/ticket.png"
                alt="Raffle Ticket"
                className="icon-image"
              />
              <div className="text">Earn Raffle Tickets</div>
            </CardTitle>
            <List>
              <ListItem>
                <span>✅</span>
                <ItemContent>
                  <div className="primary">Complete your first quest</div>
                  <div className="secondary">1 raffle ticket</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>✅</span>
                <ItemContent>
                  <div className="primary">Attend Dabls Fest in person</div>
                  <div className="secondary">1 bonus raffle ticket</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>✅</span>
                <ItemContent>
                  <div className="primary">Share on social media</div>
                  <div className="secondary">1 bonus ticket</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>✅</span>
                <ItemContent>
                  <div className="primary">Collect featured artist relic</div>
                  <div className="secondary">2 raffle tickets</div>
                </ItemContent>
              </ListItem>
            </List>
          </Card>

          <Card>
            <CardTitle>
              <span className="emoji">🧙‍♂️</span>
              <div className="text">Start Your Journey</div>
            </CardTitle>
            <List>
              <ListItem>
                <span>🛠️</span>
                <ItemContent>
                  <div className="primary">Create Your Character</div>
                  <div className="secondary">Begin at CollectorQuest.ai</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>📖</span>
                <ItemContent>
                  <div className="primary">Complete First Lore Quest</div>
                  <div className="secondary">
                    &quot;Seek the Spirit of Beads&quot;
                  </div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>🪙</span>
                <ItemContent>
                  <div className="primary">Receive Digital Token</div>
                  <div className="secondary">Unlock raffle rewards access</div>
                </ItemContent>
              </ListItem>
            </List>
          </Card>

          <Card>
            <CardTitle>
              <span className="emoji">🗺️</span>
              <div className="text">Festival Day Quests</div>
            </CardTitle>
            <List>
              <ListItem>
                <span>🖌️</span>
                <ItemContent>
                  <div className="primary">Take Photos with Artists</div>
                  <div className="secondary">Meet creators in person</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>🔍</span>
                <ItemContent>
                  <div className="primary">Find Hidden Relics</div>
                  <div className="secondary">Explore Arts Alley</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>📜</span>
                <ItemContent>
                  <div className="primary">Scan QR Codes</div>
                  <div className="secondary">Discover mural keywords</div>
                </ItemContent>
              </ListItem>
            </List>
          </Card>

          <Card>
            <CardTitle>
              <span className="emoji">🎨</span>
              <div className="text">Artist Relic Activation</div>
            </CardTitle>
            <List>
              <ListItem>
                <span>🖼️</span>
                <ItemContent>
                  <div className="primary">Viewable In-Game</div>
                  <div className="secondary">Part of Grandriver Realm</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>📱</span>
                <ItemContent>
                  <div className="primary">Digital Representations</div>
                  <div className="secondary">Scan QR codes on-site</div>
                </ItemContent>
              </ListItem>
              <ListItem>
                <span>✨</span>
                <ItemContent>
                  <div className="primary">Interactive Experience</div>
                  <div className="secondary">
                    Leave reflections & earn bonuses
                  </div>
                </ItemContent>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </PageContainer>
    </PageWrapper>
  );
}
