import React, { useState, ChangeEvent } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

interface DisplayRequirements {
  hangingHardware: boolean;
  tableSpace: boolean;
  pedestal: boolean;
}

interface FormData {
  name: string;
  artistAlias: string;
  email: string;
  phone: string;
  socialLink: string;
  artworkTitle: string;
  medium: string;
  dimensions: string;
  price: string;
  artworkImage: File | null;
  artworkDescription: string;
  isForSale: boolean;
  needsTransportation: boolean;
  displayRequirements: DisplayRequirements;
  raffleItemTitle: string;
  raffleItemDescription: string;
  estimatedValue: string;
  raffleItemImage: File | null;
  openToBundling: boolean;
  remainAnonymous: boolean;
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
  opacity: 0.6;
  z-index: 0;
`;

const SubmissionsPage = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [submissionType, setSubmissionType] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    artistAlias: '',
    email: '',
    phone: '',
    socialLink: '',
    artworkTitle: '',
    medium: '',
    dimensions: '',
    price: '',
    artworkImage: null,
    artworkDescription: '',
    isForSale: false,
    needsTransportation: false,
    displayRequirements: {
      hangingHardware: false,
      tableSpace: false,
      pedestal: false
    },
    raffleItemTitle: '',
    raffleItemDescription: '',
    estimatedValue: '',
    raffleItemImage: null,
    openToBundling: false,
    remainAnonymous: false,
    willingToVolunteer: false,
    interestedInFutureEvents: false,
    additionalNotes: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? target.checked : undefined;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'displayRequirements') {
        setFormData(prev => ({
          ...prev,
          displayRequirements: {
            ...prev.displayRequirements,
            [child]: checked ?? false
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked !== undefined ? checked : value
      } as FormData));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
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
        <title>Artist Submissions | Art Night Detroit</title>
        <meta name="description" content="Submit your artwork for upcoming Art Night Detroit events" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <HeroSection>
        <StyledPaintSplash top="10%" left="5%" color="#FF6B6B" size="150px" rotation="-15deg" />
        <StyledPaintSplash top="70%" left="85%" color="#4ECDC4" size="120px" rotation="25deg" />
        <HeroTitle>Artist Submissions</HeroTitle>
        <HeroSubtitle>Share your art with the Detroit community</HeroSubtitle>
      </HeroSection>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>🎨 Event Selection</SectionTitle>
            <FormGroup>
              <Label>Which event are you submitting for?</Label>
              <Select 
                name="selectedEvent" 
                value={selectedEvent} 
                onChange={(e) => setSelectedEvent(e.target.value)}
                required
              >
                <option value="">Select an event</option>
                <option value="artOfDance">Art of Dance (ArtNight x GoodLove)</option>
                <option value="artOfMusic">Art of Music (ArtNight Detroit @ The Elephant Room)</option>
              </Select>
            </FormGroup>
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
            <SectionTitle>🎭 Submission Type</SectionTitle>
            <RadioGroup>
              <RadioOption>
                <input 
                  type="radio" 
                  id="gallery" 
                  name="submissionType" 
                  value="gallery" 
                  checked={submissionType === 'gallery'} 
                  onChange={(e) => setSubmissionType(e.target.value)} 
                />
                <RadioLabel htmlFor="gallery">Gallery Artwork</RadioLabel>
              </RadioOption>
              
              <RadioOption>
                <input 
                  type="radio" 
                  id="raffle" 
                  name="submissionType" 
                  value="raffle" 
                  checked={submissionType === 'raffle'} 
                  onChange={(e) => setSubmissionType(e.target.value)} 
                />
                <RadioLabel htmlFor="raffle">Raffle Item</RadioLabel>
              </RadioOption>
              
              <RadioOption>
                <input 
                  type="radio" 
                  id="both" 
                  name="submissionType" 
                  value="both" 
                  checked={submissionType === 'both'} 
                  onChange={(e) => setSubmissionType(e.target.value)} 
                />
                <RadioLabel htmlFor="both">Both</RadioLabel>
              </RadioOption>
            </RadioGroup>
          </FormSection>

          {(submissionType === 'gallery' || submissionType === 'both') && (
            <FormSection>
              <SectionTitle>Gallery Submission</SectionTitle>
              
              <FormGroup>
                <Label>Title of Work</Label>
                <Input 
                  type="text" 
                  name="artworkTitle" 
                  value={formData.artworkTitle} 
                  onChange={handleInputChange} 
                  required={submissionType === 'gallery' || submissionType === 'both'} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Medium</Label>
                <Input 
                  type="text" 
                  name="medium" 
                  value={formData.medium} 
                  onChange={handleInputChange} 
                  required={submissionType === 'gallery' || submissionType === 'both'} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Dimensions</Label>
                <Input 
                  type="text" 
                  name="dimensions" 
                  value={formData.dimensions} 
                  onChange={handleInputChange} 
                  required={submissionType === 'gallery' || submissionType === 'both'} 
                  placeholder="e.g., 24in x 36in" 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Price (if for sale)</Label>
                <Input 
                  type="text" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  placeholder="$" 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Upload Image of Work</Label>
                <FileInput 
                  type="file" 
                  name="artworkImage" 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  required={submissionType === 'gallery' || submissionType === 'both'} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Artist Statement or Description (2–4 sentences)</Label>
                <TextArea 
                  name="artworkDescription" 
                  value={formData.artworkDescription} 
                  onChange={handleInputChange} 
                  required={submissionType === 'gallery' || submissionType === 'both'} 
                  rows={4} 
                />
              </FormGroup>
              
              <FormGroup>
                <CheckboxLabel>
                  <input 
                    type="checkbox" 
                    name="isForSale" 
                    checked={formData.isForSale} 
                    onChange={handleInputChange} 
                  />
                  Is the artwork for sale?
                </CheckboxLabel>
              </FormGroup>
              
              <FormGroup>
                <CheckboxLabel>
                  <input 
                    type="checkbox" 
                    name="needsTransportation" 
                    checked={formData.needsTransportation} 
                    onChange={handleInputChange} 
                  />
                  Do you need assistance transporting the work?
                </CheckboxLabel>
              </FormGroup>
              
              <FormGroup>
                <Label>Display Requirements</Label>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      name="displayRequirements.hangingHardware" 
                      checked={formData.displayRequirements.hangingHardware} 
                      onChange={handleInputChange} 
                    />
                    Hanging hardware
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      name="displayRequirements.tableSpace" 
                      checked={formData.displayRequirements.tableSpace} 
                      onChange={handleInputChange} 
                    />
                    Table space
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      name="displayRequirements.pedestal" 
                      checked={formData.displayRequirements.pedestal} 
                      onChange={handleInputChange} 
                    />
                    Pedestal
                  </CheckboxLabel>
                </CheckboxGroup>
              </FormGroup>
            </FormSection>
          )}

          {(submissionType === 'raffle' || submissionType === 'both') && (
            <FormSection>
              <SectionTitle>Raffle Submission</SectionTitle>
              
              <FormGroup>
                <Label>Item Title</Label>
                <Input 
                  type="text" 
                  name="raffleItemTitle" 
                  value={formData.raffleItemTitle} 
                  onChange={handleInputChange} 
                  required={submissionType === 'raffle' || submissionType === 'both'} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Item Description</Label>
                <TextArea 
                  name="raffleItemDescription" 
                  value={formData.raffleItemDescription} 
                  onChange={handleInputChange} 
                  required={submissionType === 'raffle' || submissionType === 'both'} 
                  rows={3} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Estimated Value</Label>
                <Input 
                  type="text" 
                  name="estimatedValue" 
                  value={formData.estimatedValue} 
                  onChange={handleInputChange} 
                  required={submissionType === 'raffle' || submissionType === 'both'} 
                  placeholder="$" 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Upload Image of Raffle Item</Label>
                <FileInput 
                  type="file" 
                  name="raffleItemImage" 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  required={submissionType === 'raffle' || submissionType === 'both'} 
                />
              </FormGroup>
              
              <FormGroup>
                <CheckboxLabel>
                  <input 
                    type="checkbox" 
                    name="openToBundling" 
                    checked={formData.openToBundling} 
                    onChange={handleInputChange} 
                  />
                  Are you open to us pairing this with other items for a themed bundle?
                </CheckboxLabel>
              </FormGroup>
              
              <FormGroup>
                <CheckboxLabel>
                  <input 
                    type="checkbox" 
                    name="remainAnonymous" 
                    checked={formData.remainAnonymous} 
                    onChange={handleInputChange} 
                  />
                  Would you like to remain anonymous in the raffle announcement?
                </CheckboxLabel>
              </FormGroup>
            </FormSection>
          )}

          {submissionType && (
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
                <Label>Any notes or requests for the curators/organizers?</Label>
                <TextArea 
                  name="additionalNotes" 
                  value={formData.additionalNotes} 
                  onChange={handleInputChange} 
                  rows={3} 
                />
              </FormGroup>
            </FormSection>
          )}

          {submissionType && (
            <SubmitButtonContainer>
              <SubmitButton type="submit">Submit Application</SubmitButton>
            </SubmitButtonContainer>
          )}
        </form>
      </FormContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`;

const HeroSection = styled.div`
  position: relative;
  text-align: center;
  padding: 4rem 1rem;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const HeroTitle = styled.h1`
  font-family: 'Baloo 2', cursive;
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const FormContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 3rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Baloo 2', cursive;
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
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
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #6c63ff;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    border-color: #6c63ff;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    border-color: #6c63ff;
    outline: none;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.5rem 0;
  font-size: 0.9rem;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
`;

const RadioLabel = styled.label`
  margin-left: 0.5rem;
  cursor: pointer;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  background-color: #6c63ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #5a52d5;
  }
`;

export default SubmissionsPage;
