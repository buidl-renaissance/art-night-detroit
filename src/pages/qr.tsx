import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import QRCode from 'react-qr-code';

const QRPage: React.FC = () => {
  return (
    <PageContainer>
      <Head>
        <title>Art Night Detroit | QR Code</title>
        <meta name="description" content="Scan the QR code to visit Art Night Detroit" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <MainSection>
        <LogoContainer>
          <Logo src="/images/art-night-detroit-logo.png" alt="Art Night Detroit" />
        </LogoContainer>
        
        <QRContainer>
          <QRCode
            value="https://artnightdetroit.com"
            size={256}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </QRContainer>

      </MainSection>
    </PageContainer>
  );
};

export default QRPage;

// Styled Components
const PageContainer = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #222;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 100vh;
  background: linear-gradient(135deg, rgb(32, 89, 127) 0%, rgb(71, 35, 86) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rem;
`;

const MainSection = styled.section`
  text-align: center;
  padding: 12rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const LogoContainer = styled.div`
  margin-bottom: 6rem;
`;

const Logo = styled.img`
  width: 1200px;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  
  @media (max-width: 768px) {
    width: 400px;
  }
`;

const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 288px;
  height: 288px;
  padding: 16px;
`; 