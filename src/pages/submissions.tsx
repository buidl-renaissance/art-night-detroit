import React, { useState, ChangeEvent } from "react";
import Head from "next/head";
import styled from "styled-components";

interface FormData {
  name: string;
  artistAlias: string;
  email: string;
  phone: string;
  instagramLink: string;
  portfolioLink: string;
  multimediaFiles: File[];
  willingToVolunteer: boolean;
  interestedInFutureEvents: boolean;
  additionalNotes: string;
}

const SubmissionsPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    artistAlias: "",
    email: "",
    phone: "",
    instagramLink: "",
    portfolioLink: "",
    multimediaFiles: [],
    willingToVolunteer: false,
    interestedInFutureEvents: false,
    additionalNotes: "",
  });

  const [phoneError, setPhoneError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validatePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Check if it's a valid US phone number (10 digits)
    if (cleaned.length === 0) return "";
    if (cleaned.length !== 10) return "Phone number must be 10 digits";

    return "";
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Apply formatting as user types
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" ? target.checked : undefined;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      const error = validatePhoneNumber(value);
      setPhoneError(error);

      setFormData((prev) => ({
        ...prev,
        phone: formattedPhone,
      }));
    } else {
      setFormData(
        (prev) =>
          ({
            ...prev,
            [name]: checked !== undefined ? checked : value,
          }) as FormData
      );
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && name === "multimediaFiles") {
      const fileArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        multimediaFiles: fileArray,
      }));
    }
  };

  const createThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          video.currentTime = 1; // Get frame at 1 second
        };
        video.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      } else {
        // For non-media files, return a generic file icon
        resolve("/file.svg");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate phone number before submission
    const phoneValidationError = validatePhoneNumber(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.multimediaFiles.length === 0) {
      alert("Please upload at least one portfolio file");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const submitFormData = new FormData();
      
      // Add form fields
      submitFormData.append('name', formData.name);
      submitFormData.append('artistAlias', formData.artistAlias);
      submitFormData.append('email', formData.email);
      submitFormData.append('phone', formData.phone);
      submitFormData.append('instagramLink', formData.instagramLink);
      submitFormData.append('portfolioLink', formData.portfolioLink);
      submitFormData.append('willingToVolunteer', formData.willingToVolunteer.toString());
      submitFormData.append('interestedInFutureEvents', formData.interestedInFutureEvents.toString());
      submitFormData.append('additionalNotes', formData.additionalNotes);

      // Add portfolio files
      formData.multimediaFiles.forEach((file) => {
        submitFormData.append('multimediaFiles', file);
      });

      // Submit to API
      const response = await fetch('/api/submit-artist-application', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Thank you for your submission! We'll review your application and get back to you soon.");
        
        // Reset form
        setFormData({
          name: "",
          artistAlias: "",
          email: "",
          phone: "",
          instagramLink: "",
          portfolioLink: "",
          multimediaFiles: [],
          willingToVolunteer: false,
          interestedInFutureEvents: false,
          additionalNotes: "",
        });
        setPhoneError("");
      } else {
        console.error('Submission error:', result);
        alert(`Error submitting application: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const MediaThumbnail: React.FC<{
    file: File;
    onClick: (src: string) => void;
  }> = ({ file, onClick }) => {
    const [thumbnailSrc, setThumbnailSrc] = useState<string>("");

    React.useEffect(() => {
      createThumbnail(file).then(setThumbnailSrc);
    }, [file]);

    const handleClick = () => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => onClick(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    };

    return (
      <ThumbnailContainer onClick={handleClick}>
        <ThumbnailImage src={thumbnailSrc} alt={file.name} />
        <ThumbnailLabel>{file.name}</ThumbnailLabel>
        {file.type.startsWith("video/") && <VideoIcon>▶</VideoIcon>}
        {!file.type.startsWith("image/") && !file.type.startsWith("video/") && (
          <FileIcon>📄</FileIcon>
        )}
      </ThumbnailContainer>
    );
  };

  return (
    <PageContainer>
      <Head>
        <title>
          Murals in the Market - Artist Application | Art Night Detroit
        </title>
        <meta
          name="description"
          content="Apply to be a featured artist for Detroit's Murals in the Market event"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <HeroSection>
        <HeroTitle>Murals in the Market</HeroTitle>
        <HeroSubtitle>Apply to be a featured artist</HeroSubtitle>
      </HeroSection>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>🎨 Artist Application</SectionTitle>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              Share your art with the Detroit community
            </p>
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
                placeholder="(555) 123-4567"
                style={{ borderColor: phoneError ? "#ff4444" : undefined }}
              />
              {phoneError && <ErrorMessage>{phoneError}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Instagram Handle</Label>
              <Input
                type="text"
                name="instagramLink"
                value={formData.instagramLink}
                onChange={handleInputChange}
                placeholder="@yourusername or instagram.com/yourusername"
              />
            </FormGroup>

            <FormGroup>
              <Label>Website / Portfolio Link</Label>
              <Input
                type="url"
                name="portfolioLink"
                value={formData.portfolioLink}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>Portfolio & Examples</SectionTitle>

            <FormGroup>
              <Label>Upload Your Portfolio</Label>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "0.5rem",
                }}
              >
                Upload images, videos, or other media files showcasing your
                previous work, artistic style, and creative vision. This helps
                us understand your artistic approach and capabilities. You can
                select multiple files.
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
                <MediaPreviewContainer>
                  <div
                    style={{
                      marginBottom: "1rem",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    {formData.multimediaFiles.length} file(s) selected
                  </div>
                  <ThumbnailGrid>
                    {formData.multimediaFiles.map((file, index) => (
                      <MediaThumbnail
                        key={index}
                        file={file}
                        onClick={setSelectedImage}
                      />
                    ))}
                  </ThumbnailGrid>
                </MediaPreviewContainer>
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
                placeholder="Tell us about your artistic vision and why you'd like to be part of this event..."
              />
            </FormGroup>
          </FormSection>

                     <SubmitButtonContainer>
             <SubmitButton type="submit" disabled={isSubmitting}>
               {isSubmitting ? 'Submitting...' : 'Submit Artist Application'}
             </SubmitButton>
           </SubmitButtonContainer>
        </form>
      </FormContainer>

      {selectedImage && (
        <Modal onClick={() => setSelectedImage(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedImage(null)}>×</CloseButton>
            <ModalImage src={selectedImage} alt="Preview" />
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: "Inter", sans-serif;

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
  font-family: ${(props) => props.theme.fonts.display};
  font-size: 2rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 0.5rem;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text.light};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FormContainer = styled.div`
  background-color: ${(props) => props.theme.colors.background};
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
  font-family: ${(props) => props.theme.fonts.display};
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 0.25rem;

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
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
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
  background-color: ${(props) => props.theme.colors.primary};
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

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.primaryHover};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const MediaPreviewContainer = styled.div`
  margin-top: 1rem;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ThumbnailContainer = styled.div`
  position: relative;
  cursor: pointer;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem;
  transition:
    border-color 0.3s,
    transform 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const ThumbnailLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
`;

const VideoIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const FileIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
`;

export default SubmissionsPage;
