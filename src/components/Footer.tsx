import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterTitle>Art Night Detroit</FooterTitle>
        <FooterLinks>
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/events">All Events</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/submissions">Artist Application</FooterLink>
          <FooterLink href="/vendor-submissions">Vendor Application</FooterLink>
        </FooterLinks>
      </FooterContent>
      <FooterAbout>
        <FooterAboutText>
          Art Night Detroit is a community-driven initiative that celebrates the creative spirit of Detroit. We believe in the power of art to bring people together and inspire positive change.
        </FooterAboutText>
        <Image src="/images/barefoot-developers-detroit.png" alt="Built by Barefoot Developers Detroit" width={100} height={100} style={{ marginTop: '2rem' }} />
      </FooterAbout>
    </FooterContainer>
  );
};

export default Footer;

// Styled Components
const FooterContainer = styled.footer`
  background-color: #0a0a23;
  color: white;
  padding: 4rem 2rem;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterTitle = styled.h3`
  font-family: 'Baloo 2', cursive;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const FooterLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0;
    height: 2px;
    background: #8E44AD;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #F7DC6F;

    &:after {
      width: 100%;
    }
  }
`; 

const FooterAbout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const FooterAboutText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  margin-top: 2rem;
`;