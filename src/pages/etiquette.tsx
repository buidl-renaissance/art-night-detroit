import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import QRCode from 'react-qr-code';

const EtiquettePage = () => {
  return (
    <PageContainer>
      <Head>
        <title>Studio 202 Etiquette | Art Night Detroit</title>
        <meta name="description" content="Studio 202 etiquette guidelines and information" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <HeroTitle>Studio 202</HeroTitle>
      </HeroSection>

      <ContentSection>
        <QRContainer>
          <QRCode
            value="https://stu.gods.work/about"
            size={512}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </QRContainer>
        <QRDescription>
          Scan the QR code to learn more.
        </QRDescription>
      </ContentSection>

    </PageContainer>
  );
};

export default EtiquettePage;

// Styled Components
const PageContainer = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #000;
  max-width: 100%;
  overflow-x: hidden;
  height: 100vh;
  background: #ffffff;
`;

const HeroSection = styled.section`
  background: #fff;
  color: white;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
`;

const HeroTitle = styled.h1`
  font-family: 'Baloo 2', cursive;
  font-size: 6rem;
  margin-top: 10rem;
  margin-bottom: 0rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  color: #000;

  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const ContentSection = styled.section`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: inline-block;
`;

const QRDescription = styled.p`
  font-size: 1.2rem;
  color: #333;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;
