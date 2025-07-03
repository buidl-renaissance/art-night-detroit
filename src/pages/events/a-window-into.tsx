import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Footer from '@/components/Footer';

const WindowIntoPage = () => {
  return (
    <PageContainer>
      <Head>
        <title>A Window Into... | Artist Showcase</title>
        <meta name="description" content="Submit your work for our gallery showcase at La Ventana Café" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <img className="hero-image" src="/images/a-window-into.jpg" alt="A Window Into..." width={600} />
        <CtaButton>Submit Your Work</CtaButton>
      </HeroSection>

      <AboutSection>
        <SectionTitle>Gallery Showcase at La Ventana Café</SectionTitle>
        <Description>
          Join us for an extraordinary exhibition that explores the boundaries between reality and imagination. 
          &quot;A Window Into...&quot; invites artists to share their unique perspective on what lies beyond our everyday 
          perception. Through various mediums, we aim to create a collective glimpse into the cosmic unknown.
        </Description>
      </AboutSection>

      <KeyDatesSection>
        <SectionTitle>Key Dates</SectionTitle>
        <DateContainer>
          <DateItem>
            <DateIcon>📅</DateIcon>
            <DateInfo>
              <DateTitle>Submission Deadline</DateTitle>
              <DateValue>April 14, 2025</DateValue>
            </DateInfo>
          </DateItem>
          <DateItem>
            <DateIcon>🎨</DateIcon>
            <DateInfo>
              <DateTitle>Opening Reception</DateTitle>
              <DateValue>April 18, 2025</DateValue>
            </DateInfo>
          </DateItem>
        </DateContainer>
      </KeyDatesSection>

      <GuidelinesSection>
        <SectionTitle>Submission Guidelines</SectionTitle>
        <GuidelinesList>
          <GuidelineItem>All mediums accepted: painting, photography, digital art, sculpture</GuidelineItem>
          <GuidelineItem>Work must relate to the theme of &quot;windows&quot; or &quot;portals&quot;</GuidelineItem>
          <GuidelineItem>Maximum 3 submissions per artist</GuidelineItem>
          <GuidelineItem>Include artist statement (max 250 words)</GuidelineItem>
          <GuidelineItem>High-resolution images required for digital submissions</GuidelineItem>
        </GuidelinesList>
      </GuidelinesSection>

      <Footer />
    </PageContainer>
  );
};

export default WindowIntoPage;

// Styled Components
const PageContainer = styled.div`
  background-color: #fefef6;
  font-family: 'Playfair Display', serif;
  color: #333;
  max-width: 100%;
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  .hero-image {
    width: 100%;
    height: auto;
    max-width: 600px;
    @media (max-width: 768px) {
      max-width: 100%;
      padding: 0;
    }
  }
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CtaButton = styled.button`
  background-color: #000;
  color: white;
  font-family: inherit;
  font-size: 1.2rem;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 2rem;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const AboutSection = styled.section`
  padding: 5rem 2rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  @media (max-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const KeyDatesSection = styled.section`
  padding: 5rem 2rem;
  background-color: #FFFAF0;
  text-align: center;
  @media (max-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const DateContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3rem;
  max-width: 800px;
  margin: 0 auto;
`;

const DateItem = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  min-width: 300px;
  border: 2px solid #F0E6D2;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const DateIcon = styled.div`
  font-size: 2.5rem;
  margin-right: 1rem;
`;

const DateInfo = styled.div`
  text-align: left;
`;

const DateTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const DateValue = styled.p`
  font-size: 1.5rem;
  font-weight: 600;
`;

const GuidelinesSection = styled.section`
  padding: 5rem 2rem;
  background-color: #FFF8E8;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const GuidelinesList = styled.ul`
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
  list-style: none;
  background-color: #FFFDF7;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
`;

const GuidelineItem = styled.li`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-left: 2rem;
  position: relative;
  
  &::before {
    content: '★';
    position: absolute;
    left: 0;
    color: #FF85B3;
  }
`;


