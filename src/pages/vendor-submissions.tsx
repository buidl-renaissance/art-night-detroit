import React, { useState, ChangeEvent } from "react";
import Head from "next/head";
import styled from "styled-components";

interface VendorFormData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  websiteLink: string;
  instagramLink: string;
  businessType: string;
}

const VendorSubmissionsPage = () => {
  const [formData, setFormData] = useState<VendorFormData>({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    websiteLink: "",
    instagramLink: "",
    businessType: "",
  });

  const [phoneError, setPhoneError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

    // Clear submit message when user starts typing
    if (submitMessage) {
      setSubmitMessage(null);
    }

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
          }) as VendorFormData
      );
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate phone number before submission
    const phoneValidationError = validatePhoneNumber(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    // Clear previous messages
    setSubmitMessage(null);

    // Validate required fields
    if (!formData.businessName || !formData.contactName || !formData.email || 
        !formData.phone || !formData.businessType) {
      setSubmitMessage({
        type: "error",
        text: "Please fill in all required fields: business name, contact name, email, phone, and business type",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        businessName: formData.businessName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        websiteLink: formData.websiteLink,
        instagramLink: formData.instagramLink,
        businessType: formData.businessType,
      };

      // Submit to API
      const response = await fetch("/api/submit-vendor-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: "success",
          text: "Thank you for your vendor application! We'll review your submission and get back to you soon.",
        });

        // Reset form
        setFormData({
          businessName: "",
          contactName: "",
          email: "",
          phone: "",
          websiteLink: "",
          instagramLink: "",
          businessType: "",
        });
        setPhoneError("");
      } else {
        console.error("Submission error:", result);
        setSubmitMessage({
          type: "error",
          text: `Error submitting application: ${result.error || "Unknown error"}`,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage({
        type: "error",
        text: "Error submitting application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <PageContainer>
      <Head>
        <title>Vendor Application - Art Night Detroit</title>
        <meta
          name="description"
          content="Apply to be a vendor at Art Night Detroit events. Join our community of local businesses and creators."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <HeroSection>
        <HeroTitle>Art Night Detroit<br />Vendor Application</HeroTitle>
        <HeroSubtitle>Join our community of local businesses and creators</HeroSubtitle>
      </HeroSection>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>🏢 Vendor Application</SectionTitle>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              Connect with Detroit's vibrant art community
            </p>
            
            <FormGroup>
              <Label>Business Name *</Label>
              <Input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Contact Name *</Label>
              <Input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email *</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone Number *</Label>
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
              <Label>Website</Label>
              <Input
                type="url"
                name="websiteLink"
                value={formData.websiteLink}
                onChange={handleInputChange}
                placeholder="https://yourbusiness.com"
              />
            </FormGroup>

            <FormGroup>
              <Label>Instagram Handle</Label>
              <Input
                type="text"
                name="instagramLink"
                value={formData.instagramLink}
                onChange={handleInputChange}
                placeholder="@yourbusiness"
              />
            </FormGroup>

            <FormGroup>
              <Label>Business Type *</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    name="businessType"
                    value="food"
                    checked={formData.businessType === "food"}
                    onChange={handleInputChange}
                    required
                  />
                  Food & Beverage
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    name="businessType"
                    value="retail"
                    checked={formData.businessType === "retail"}
                    onChange={handleInputChange}
                    required
                  />
                  Retail & Merchandise
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    name="businessType"
                    value="services"
                    checked={formData.businessType === "services"}
                    onChange={handleInputChange}
                    required
                  />
                  Services
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    name="businessType"
                    value="crafts"
                    checked={formData.businessType === "crafts"}
                    onChange={handleInputChange}
                    required
                  />
                  Arts & Crafts
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    name="businessType"
                    value="wellness"
                    checked={formData.businessType === "wellness"}
                    onChange={handleInputChange}
                    required
                  />
                  Health & Wellness
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    name="businessType"
                    value="other"
                    checked={formData.businessType === "other"}
                    onChange={handleInputChange}
                    required
                  />
                  Other
                </RadioLabel>
              </RadioGroup>
            </FormGroup>

          </FormSection>

          <SubmitButtonContainer>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Vendor Application"}
            </SubmitButton>
            {submitMessage && (
              <SubmitMessage type={submitMessage.type}>
                {submitMessage.text}
              </SubmitMessage>
            )}
          </SubmitButtonContainer>
        </form>
      </FormContainer>

    </PageContainer>
  );
};

// Styled Components - Using exact same styling as artist submissions
const PageContainer = styled.div`
  margin: 0 auto;
  padding: 1rem;
  font-family: "Inter", sans-serif;
  background-color: #333;

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
  padding: 2rem;
  margin: 0 auto 2rem;
  max-width: 100%;
  background-color: #222;

  @media (min-width: 768px) {
    padding: 2rem;
    margin: 0 auto 3rem;
    max-width: 600px;
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
  color: #888;
`;

const CanvasSubtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: -0.25rem 0 1rem 0;
  line-height: 1.4;
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



const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 400;
  color: #aaa;
  margin-left: 1rem;
  font-size: 1.1rem;

  input {
    margin-right: 0.75rem;
    cursor: pointer;
    width: 18px;
    height: 18px;
    transform: scale(1);
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

const SubmitMessage = styled.div<{ type: "success" | "error" }>`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;

  ${(props) =>
    props.type === "success" &&
    `
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `}

  ${(props) =>
    props.type === "error" &&
    `
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;


export default VendorSubmissionsPage;