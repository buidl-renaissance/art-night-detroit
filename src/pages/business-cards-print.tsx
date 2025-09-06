import React, { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import QRCode from 'react-qr-code';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
  font-family: ${props => props.theme.fonts.primary};
  
  @media print {
    padding: 0;
    background: white;
    min-height: auto;
  }
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fonts.display};
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  
  @media print {
    display: none;
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media print {
    display: none;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #2980b9;
  }
  
  &.active {
    background: #2c3e50;
  }
`;

const PrintSheet = styled.div`
  width: 8in;
  height: 11in;
  margin: 0 auto;
  background: white;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  align-items: center;
  justify-items: center;
  
  @media print {
    box-shadow: none;
    margin: 0;
    page-break-after: always;
    
    &:last-child {
      page-break-after: auto;
    }
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0in;
  padding: 0.5in;
  height: 100%;
  box-sizing: border-box;
  place-items: center;
  padding-left: 1.5in;
`;

const BusinessCard = styled.div`
  width: 3.5in;
  height: 2in;
  background: white;
  border: 1px solid #ddd;
  /* border-radius: 8px; */
  position: relative;
  overflow: hidden;
  
  /* @media print {
    border: 1px solid #000;
    border-radius: 4px;
  } */
`;

const CardFront = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  background: rgb(135, 206, 250);
  /* border-radius: 8px; */
  
  /* @media print {
    border-radius: 4px;
    padding: 12px;
  } */
`;

const CardBack = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  position: relative;
  background: white;
  /* border-radius: 8px; */
  
  /* @media print {
    border-radius: 4px;
    padding: 12px;
  } */
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
  height: 120px;
`;

const PunchCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  gap: 6px;
`;

const StarsRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
`;

const StarIcon = styled.span`
  font-size: 22px;
  color: #fff9c4;
  
  &:before {
    content: "☆";
  }
  
  @media print {
    font-size: 22px;
  }
`;

const BackStarIcon = styled.span`
  font-size: 22px;
  color: #ccc;
  
  &:before {
    content: "☆";
  }
  
  @media print {
    font-size: 22px;
  }
`;

const QRContainer = styled.div`
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 6px;
  padding: 4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media print {
    width: 96px;
    height: 96px;
  }
`;

const StyledQRCode = styled(QRCode)`
  width: 100% !important;
  height: 100% !important;
`;

const BackPunchCardText = styled.p`
  font-size: 12px;
  color: #2c3e50;
  margin: 0;
  text-align: center;
  font-weight: 500;
`;

const CardNumber = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 10px;
  color: #666;
  font-weight: 500;
  
  @media print {
    bottom: 6px;
    right: 6px;
    font-size: 9px;
  }
`;

const SheetLabel = styled.div`
  position: absolute;
  top: 0.25in;
  right: 0.25in;
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
  
  @media print {
    display: none;
  }
`;

const BusinessCardsPrintPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  
  const handlePrint = () => {
    window.print();
  };

  const renderCard = (index: number) => {
    if (viewMode === 'front') {
      return (
        <BusinessCard key={`front-${index}`}>
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
              <StarsRow>
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <StarIcon key={starIndex} />
                ))}
              </StarsRow>
            </PunchCardContainer>
          </CardFront>
        </BusinessCard>
      );
    } else {
      return (
        <BusinessCard key={`back-${index}`}>
          <CardBack>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <QRContainer>
                <StyledQRCode
                  value={`https://artnightdetroit.com/rewards?card=${index+1}`}
                  size={96}
                  fgColor="#2c3e50"
                  bgColor="#ffffff"
                />
              </QRContainer>
            </div>
            
            <PunchCardContainer>
              <BackPunchCardText>Collect 5 Stars to unlock art night prizes</BackPunchCardText>
              <StarsRow>
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <BackStarIcon key={starIndex} />
                ))}
              </StarsRow>
            </PunchCardContainer>
            
            <CardNumber>#{String(index + 1).padStart(3, '0')}</CardNumber>
          </CardBack>
        </BusinessCard>
      );
    }
  };

  const renderSheets = () => {
    if (viewMode === 'front') {
      // Only one sheet for front side
      return (
        <PrintSheet>
          <SheetLabel>Front Side</SheetLabel>
          <CardGrid>
            {Array.from({ length: 10 }).map((_, index) => renderCard(index))}
          </CardGrid>
        </PrintSheet>
      );
    } else {
      // Multiple sheets for back side (10 sheets for 100 cards total)
      return Array.from({ length: 10 }).map((_, sheetIndex) => (
        <PrintSheet key={`sheet-${sheetIndex}`}>
          <SheetLabel>Back Side - Sheet {sheetIndex + 1}/10</SheetLabel>
          <CardGrid>
            {Array.from({ length: 10 }).map((_, cardIndex) => {
              const globalCardIndex = sheetIndex * 10 + cardIndex;
              return renderCard(globalCardIndex);
            })}
          </CardGrid>
        </PrintSheet>
      ));
    }
  };

  return (
    <PageContainer>
      <Title>Business Cards Print Sheet</Title>
      
      <Controls>
        <Button 
          className={viewMode === 'front' ? 'active' : ''} 
          onClick={() => setViewMode('front')}
        >
          Front Side (1 Sheet)
        </Button>
        <Button 
          className={viewMode === 'back' ? 'active' : ''} 
          onClick={() => setViewMode('back')}
        >
          Back Side (10 Sheets)
        </Button>
        <Button onClick={handlePrint}>
          Print
        </Button>
      </Controls>

      {renderSheets()}

      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </PageContainer>
  );
};

export default BusinessCardsPrintPage;
