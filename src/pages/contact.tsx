import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<null | 'success' | 'error'>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend or a service like Formspree
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <PageContainer>
      <Head>
        <title>Contact Us | Art Night Detroit</title>
        <meta name="description" content="Get in touch with Art Night Detroit for collaborations, questions, or just to say hello!" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <PaintSplash top="10%" left="5%" color="#87CEEB" size="150px" rotation="-15deg" />
        <PaintSplash top="70%" left="85%" color="#F7DC6F" size="120px" rotation="25deg" />
        <HeroTitle>Get In Touch</HeroTitle>
        <HeroSubtitle>We&apos;d love to hear from you!</HeroSubtitle>
      </HeroSection>

      <ContactContainer>
        <ContactInfo>
          <InfoTitle>Contact Information</InfoTitle>
          {/* <InfoItem>
            <InfoLabel>Email:</InfoLabel>
            <InfoValue>hello@artnightdetroit.com</InfoValue>
          </InfoItem> */}
          <InfoItem>
            <InfoLabel>Instagram:</InfoLabel>
            <InfoValue>
                <a href="https://instagram.com/artnightdetroit" target="_blank" rel="noopener noreferrer">@artnightdetroit</a>
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Location:</InfoLabel>
            <InfoValue>Detroit, Michigan</InfoValue>
          </InfoItem>
        </ContactInfo>

        <ContactForm onSubmit={handleSubmit}>
          <FormTitle>Send us a message</FormTitle>
          {formStatus === 'success' && (
            <SuccessMessage>
              Thank you for your message! We&apos;ll get back to you soon.
            </SuccessMessage>
          )}
          {formStatus === 'error' && (
            <ErrorMessage>
              There was an error sending your message. Please try again.
            </ErrorMessage>
          )}
          <FormGroup>
            <FormLabel htmlFor="name">Name</FormLabel>
            <FormInput 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormInput 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="subject">Subject</FormLabel>
            <FormSelect 
              id="subject" 
              name="subject" 
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a subject</option>
              <option value="Event Collaboration">Event Collaboration</option>
              <option value="Sponsorship">Sponsorship</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Other">Other</option>
            </FormSelect>
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="message">Message</FormLabel>
            <FormTextarea 
              id="message" 
              name="message" 
              rows={5} 
              value={formData.message}
              onChange={handleChange}
              required 
            />
          </FormGroup>
          <SubmitButton type="submit">Send Message</SubmitButton>
        </ContactForm>
      </ContactContainer>

      <Footer>
        <FooterContent>
          <FooterTitle>Art Night Detroit</FooterTitle>
          <FooterLinks>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/events">Events</FooterLink>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </PageContainer>
  );
};

export default ContactPage;

// Styled Components
const PageContainer = styled.div`
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: #222;
  max-width: 100%;
  overflow-x: hidden;
`;

const PaintSplash = styled.div<{
  top?: string;
  left?: string;
  size?: string;
  color?: string;
  rotation?: string;
}>`
  position: absolute;
  width: ${props => props.size || '100px'};
  height: ${props => props.size || '100px'};
  border-radius: 50% 60% 50% 40%;
  background-color: ${props => props.color || '#87CEEB'};
  top: ${props => props.top || '0'};
  left: ${props => props.left || '0'};
  transform: rotate(${props => props.rotation || '0deg'});
  opacity: 0.6;
  z-index: 0;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #3498DB 0%, #8E44AD 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-family: 'Baloo 2', cursive;
  font-size: 4rem;
  margin-bottom: 1rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.6rem;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ContactContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto 5rem;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled.div`
  background-color: #f8f8f8;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
`;

const InfoTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #222;
`;

const InfoItem = styled.div`
  margin-bottom: 1.2rem;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  display: block;
  margin-bottom: 0.3rem;
  color: #444;
`;

const InfoValue = styled.span`
  display: block;
  color: #222;
  
  a {
    color: #3498DB;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ContactForm = styled.form`
  background-color: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
`;

const FormTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #222;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3498DB;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498DB;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498DB;
  }
`;

const SubmitButton = styled.button`
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #C0392B;
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    background-color: #A93226;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: #D5F5E3;
  border-left: 4px solid #27AE60;
  color: #1E8449;
  margin-bottom: 1.5rem;
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #FADBD8;
  border-left: 4px solid #C0392B;
  color: #922B21;
  margin-bottom: 1.5rem;
  border-radius: 4px;
`;

const Footer = styled.footer`
  background-color: #222;
  color: white;
  padding: 3rem 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const FooterTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 1.8rem;
  margin: 0;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
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
