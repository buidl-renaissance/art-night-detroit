import React, { useState, ChangeEvent } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

interface FormData {
  name: string;
  artistAlias: string;
  email: string;
  phone: string;
  socialLink: string;
  multimediaFiles: File[];
  willingToVolunteer: boolean;
  interestedInFutureEvents: boolean;
  additionalNotes: string;
}

interface PaintSplashProps {
  top: string;
  left: string;
  color: string;
  size: string;
  rotation: string;
}

const StyledPaintSplash = styled.div<PaintSplashProps>`
  position: absolute;
  width: ${props => props.size};
  height: ${props => props.size};
  top: ${props => props.top};
  left: ${props => props.left};
  transform: rotate(${props => props.rotation});
  background-color: ${props => props.color};
  border-radius: 50%;
  opacity: 0.4;
  z-index: 0;
  
  @media (min-width: 768px) {
    opacity: 0.6;
  }
`;

const SubmissionsPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    artistAlias: '',
    email: '',
    phone: '',
    socialLink: '',
    multimediaFiles: [],
    willingToVolunteer: false,
    interestedInFutureEvents: false,
    additionalNotes: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? target.checked : undefined;
    
      setFormData(prev => ({
        ...prev,
        [name]: checked !== undefined ? checked : value
      } as FormData));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && name === 'multimediaFiles') {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        multimediaFiles: fileArray
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Thank you for your submission!');
  };

  return (
    <PageContainer>
      <Head>
        <title>Murals in the Market - Artist Application | Art Night Detroit</title>
        <meta name="description" content="Apply to be a featured artist for Detroit's Murals in the Market event" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <StyledPaintSplash top="10%" left="5%" color="#FF6B6B" size="150px" rotation="-15deg" />
        <StyledPaintSplash top="70%" left="85%" color="#4ECDC4" size="120px" rotation="25deg" />
        <HeroTitle>Murals in the Market</HeroTitle>
        <HeroSubtitle>Apply to be a featured artist for Detroit&apos;s vibrant market community</HeroSubtitle>
      </HeroSection>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>🎨 Artist Application</SectionTitle>
            <p style={{marginBottom: '1rem', color: '#666'}}>Apply to be selected as a featured artist for the Murals in the Market event. Share your portfolio and artistic vision with us.</p>
          </FormSection>

          <FormSection>
            <SectionTitle>✅ Basic Information</SectionTitle>
            <FormGroup>
              <Label>Name</Label>
              <Input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </FormGroup>

            <FormGroup>
              <Label>Artist Alias (if any)</Label>
              <Input 
                type="text" 
                name="artistAlias" 
                value={formData.artistAlias} 
                onChange={handleInputChange} 
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone Number</Label>
              <Input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
              />
            </FormGroup>

            <FormGroup>
              <Label>Instagram / Website / Portfolio Link</Label>
              <Input 
                type="url" 
                name="socialLink" 
                value={formData.socialLink} 
                onChange={handleInputChange} 
              />
            </FormGroup>
          </FormSection>

                    <FormSection>
            <SectionTitle>Portfolio & Examples</SectionTitle>
            
            <FormGroup>
              <Label>Upload Your Portfolio</Label>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem'}}>
                Upload images, videos, or other media files showcasing your previous work, artistic style, and creative vision. This helps us understand your artistic approach and capabilities. You can select multiple files.
              </p>
                <FileInput 
                  type="file" 
                name="multimediaFiles" 
                  onChange={handleFileChange} 
                accept="image/*,video/*,.pdf,.doc,.docx" 
                multiple
                required 
              />
              {formData.multimediaFiles.length > 0 && (
                <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#666'}}>
                  {formData.multimediaFiles.length} file(s) selected: {formData.multimediaFiles.map(f => f.name).join(', ')}
                </div>
              )}
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Additional Questions</SectionTitle>
              
                          <FormGroup>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  name="willingToVolunteer" 
                  checked={formData.willingToVolunteer} 
                  onChange={handleInputChange} 
                />
                Would you like to volunteer or help promote the event?
              </CheckboxLabel>
            </FormGroup>
            
            <FormGroup>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  name="interestedInFutureEvents" 
                  checked={formData.interestedInFutureEvents} 
                  onChange={handleInputChange} 
                />
                Would you be interested in future Art Night opportunities?
              </CheckboxLabel>
            </FormGroup>
            
            <FormGroup>
              <Label>Artist Statement & Vision</Label>
              <TextArea 
                name="additionalNotes" 
                value={formData.additionalNotes} 
                onChange={handleInputChange} 
                rows={4} 
                placeholder="Tell us about your artistic vision, what you hope to bring to the market community, and why you'd like to be part of this event..."
              />
            </FormGroup>
            </FormSection>

                      <SubmitButtonContainer>
            <SubmitButton type="submit">Submit Artist Application</SubmitButton>
          </SubmitButtonContainer>
        </form>
      </FormContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const HeroSection = styled.div`
  position: relative;
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  
  @media (min-width: 768px) {
    padding: 4rem 1rem;
    margin-bottom: 2rem;
  }
`;

const HeroTitle = styled.h1`
  font-family: ${props => props.theme.fonts.display};
  font-size: 2rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  line-height: 1.2;
  
  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text.light};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.4;
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FormContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
    margin-bottom: 3rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  
  @media (min-width: 768px) {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${props => props.theme.fonts.display};
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.5rem 0;
  font-size: 0.9rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
`;

const SubmitButtonContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const SubmitButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
  }
`;

export default SubmissionsPage;