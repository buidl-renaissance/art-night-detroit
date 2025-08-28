import React, { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';

import QRCode from 'react-qr-code';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #2c2c2c;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: ${props => props.theme.fonts.primary};
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fonts.display};
  color: white;
  margin-bottom: 3rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const CardContainer = styled.div`
  display: flex;
  gap: 4rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1200px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const BusinessCard = styled.div`
  width: 3.5in;
  height: 2in;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const CardFront = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  background: rgb(135, 206, 250);
  border-radius: 12px;
`;

const CardBack = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  position: relative;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
`;

const Logo = styled.div`
  position: relative;
  width: 200px;
  height: 100px;
`;

const PunchCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  gap: 8px;
`;

const StarsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;



const BackPunchCardText = styled.p`
  font-size: 10px;
  color: #2c3e50;
  margin: 0;
  text-align: center;
  font-weight: 500;
`;

const BackStarIcon = styled.span<{ $punched?: boolean }>`
  font-size: 20px;
  color: ${props => props.$punched ? '#ffd700' : '#ccc'};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 1;
  user-select: none;
  
  &:hover {
    color: ${props => props.$punched ? '#ffed4a' : '#999'};
    transform: scale(1.1);
  }
  
  &:before {
    content: ${props => props.$punched ? '"★"' : '"☆"'};
  }
`;

const StarIcon = styled.span<{ $punched?: boolean }>`
  font-size: 20px;
  color: ${props => props.$punched ? '#ffd700' : '#fff9c4'};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 1;
  user-select: none;
  
  &:hover {
    color: ${props => props.$punched ? '#ffed4a' : '#ffeb9c'};
    transform: scale(1.1);
  }
  
  &:before {
    content: ${props => props.$punched ? '"★"' : '"☆"'};
  }
`;

const QRContainer = styled.div`
  width: 108px;
  height: 108px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledQRCode = styled(QRCode)`
  width: 100% !important;
  height: 100% !important;
`;



const CardLabel = styled.div`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;



// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BusinessCardPageProps {}

const BusinessCardPage: React.FC<BusinessCardPageProps> = () => {
  const [punchedStars, setPunchedStars] = useState<boolean[]>([false, false, false, false, false]);

  const toggleStar = (index: number) => {
    const newPunchedStars = [...punchedStars];
    newPunchedStars[index] = !newPunchedStars[index];
    setPunchedStars(newPunchedStars);
  };



  return (
    <PageContainer>
      <Title>ArtNight Detroit Business Cards</Title>
      
      <CardContainer>
        {/* Front Side */}
        <div>
          <BusinessCard>
            <CardFront>
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
              
              <PunchCardContainer>
                {/* <PunchCardText>Collect 5 Stars to unlock art night prizes</PunchCardText> */}
                <StarsRow>
                  {punchedStars.map((punched, index) => (
                    <StarIcon
                      key={index}
                      $punched={punched}
                      onClick={() => toggleStar(index)}
                      title={`Star ${index + 1} - Click to ${punched ? 'unpunch' : 'punch'}`}
                    />
                  ))}
                </StarsRow>
              </PunchCardContainer>
            </CardFront>
          </BusinessCard>
          <CardLabel>Front Side</CardLabel>
        </div>

        {/* Back Side */}
        <div>
          <BusinessCard>
            <CardBack>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <QRContainer>
                  <StyledQRCode
                    value="https://artnight.thebarefoot.dev"
                    size={144}
                    fgColor="#2c3e50"
                    bgColor="#ffffff"
                  />
                </QRContainer>
                
                {/* <Tagline>Creating Together in Detroit</Tagline> */}
                
                {/* <div>
                  <InfoText className="website">artnight.thebarefoot.dev</InfoText>
                  <InfoText>@artnightdetroit</InfoText>
                  <InfoText>Scan to learn more</InfoText>
                </div> */}
              </div>
              
              <PunchCardContainer>
                <BackPunchCardText>Collect 5 Stars to unlock art night prizes</BackPunchCardText>
                <StarsRow>
                  {punchedStars.map((punched, index) => (
                    <BackStarIcon
                      key={index}
                      $punched={punched}
                      onClick={() => toggleStar(index)}
                      title={`Star ${index + 1} - Click to ${punched ? 'unpunch' : 'punch'}`}
                    />
                  ))}
                </StarsRow>
              </PunchCardContainer>
            </CardBack>
          </BusinessCard>
          <CardLabel>Back Side</CardLabel>
        </div>
      </CardContainer>
    </PageContainer>
  );
};

export default BusinessCardPage;
