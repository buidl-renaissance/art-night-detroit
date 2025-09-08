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
  businessDescription: string;
  productsServices: string;
  setupRequirements: string;
  insuranceCoverage: boolean;
  previousEventExperience: string;
  willingToDonatRaffleItem: boolean;
  raffleItemDescription: string;
  additionalNotes: string;
  businessLicenseFiles: File[];
  productImages: File[];
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
    businessDescription: "",
    productsServices: "",
    setupRequirements: "",
    insuranceCoverage: false,
    previousEventExperience: "",
    willingToDonatRaffleItem: false,
    raffleItemDescription: "",
    additionalNotes: "",
    businessLicenseFiles: [],
    productImages: [],
  });

  const [phoneError, setPhoneError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    type: 'license' | 'product';
    files: {
      id: string;
      file: File;
      url: string;
      uploading: boolean;
      error?: string;
      processing?: boolean;
    }[];
  }>({
    type: 'product',
    files: []
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);

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

  const convertImageToJpeg = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // If it's not an image, return as-is
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate optimal dimensions (max 2048px on longest side)
        const maxDimension = 2048;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        // Set canvas dimensions to optimized size
        canvas.width = width;
        canvas.height = height;

        // Draw image to canvas with resizing
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to JPEG blob with good quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file with .jpg extension
              const fileName = file.name.replace(/\.[^/.]+$/, ".jpg");
              const convertedFile = new File([blob], fileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              console.log(
                `Image converted: ${file.name} (${file.size} bytes) -> ${fileName} (${convertedFile.size} bytes)`
              );
              resolve(convertedFile);
            } else {
              // If conversion fails, return original file
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        ); // 85% quality for good balance of size/quality
      };

      img.onerror = () => {
        // If image loading fails, return original file
        console.warn(`Failed to load image for conversion: ${file.name}`);
        resolve(file);
      };

      // Load the image
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File, bucket: string = 'vendor-submissions'): Promise<string> => {
    // Convert images to JPEG first
    const processedFile = await convertImageToJpeg(file);

    const formData = new FormData();
    formData.append("file", processedFile);
    formData.append("bucket", bucket);

    const response = await fetch("/api/upload-portfolio-file", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload file");
    }

    const result = await response.json();
    return result.url;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const fileType = name === 'businessLicenseFiles' ? 'license' : 'product';
    
    setIsUploading(true);

    // Create temporary upload status entries
    const tempFiles = fileArray.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: "",
      uploading: true,
      processing: true,
    }));

    setUploadedFiles(prev => ({
      type: fileType,
      files: [...prev.files, ...tempFiles]
    }));

    // Upload files one by one
    for (const tempFile of tempFiles) {
      try {
        console.log(`Starting upload for: ${tempFile.file.name}`);

        // Update status to uploading (processing complete)
        setUploadedFiles(prev => ({
          ...prev,
          files: prev.files.map(f =>
            f.id === tempFile.id
              ? { ...f, processing: false, uploading: true }
              : f
          )
        }));

        const url = await uploadFile(tempFile.file);
        console.log(`Upload successful for: ${tempFile.file.name}`, url);

        // Update with success
        setUploadedFiles(prev => ({
          ...prev,
          files: prev.files.map(f =>
            f.id === tempFile.id
              ? { ...f, url, uploading: false }
              : f
          )
        }));

        // Update form data
        setFormData(prev => ({
          ...prev,
          [name]: [...prev[name as keyof VendorFormData] as File[], tempFile.file]
        }));

      } catch (error) {
        console.error(`Upload failed for: ${tempFile.file.name}`, error);

        // Update with error
        setUploadedFiles(prev => ({
          ...prev,
          files: prev.files.map(f =>
            f.id === tempFile.id
              ? {
                  ...f,
                  uploading: false,
                  processing: false,
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          )
        }));
      }
    }

    setIsUploading(false);
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.files.find(f => f.id === fileId);
    if (!fileToRemove) return;

    // Remove from uploaded files state
    setUploadedFiles(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));

    // Remove from form data
    const fieldName = uploadedFiles.type === 'license' ? 'businessLicenseFiles' : 'productImages';
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] as File[]).filter(f => f !== fileToRemove.file)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate phone number
    const phoneValidationError = validatePhoneNumber(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    // Check for required fields
    if (!formData.businessName || !formData.contactName || !formData.email || 
        !formData.phone || !formData.businessType || !formData.businessDescription ||
        !formData.productsServices) {
      setSubmitMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get uploaded file URLs
      const businessLicenseFileUrls = uploadedFiles.files
        .filter(f => f.url && uploadedFiles.type === 'license')
        .map(f => f.url);
      
      const productImageUrls = uploadedFiles.files
        .filter(f => f.url && uploadedFiles.type === 'product')
        .map(f => f.url);

      const submissionData = {
        businessName: formData.businessName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        websiteLink: formData.websiteLink,
        instagramLink: formData.instagramLink,
        businessType: formData.businessType,
        businessDescription: formData.businessDescription,
        productsServices: formData.productsServices,
        setupRequirements: formData.setupRequirements,
        insuranceCoverage: formData.insuranceCoverage,
        previousEventExperience: formData.previousEventExperience,
        willingToDonatRaffleItem: formData.willingToDonatRaffleItem,
        raffleItemDescription: formData.raffleItemDescription,
        additionalNotes: formData.additionalNotes,
        businessLicenseFileUrls,
        productImageUrls,
      };

      console.log('Submitting vendor application:', submissionData);

      const response = await fetch('/api/submit-vendor-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSubmitMessage({
        type: "success",
        text: "Your vendor application has been submitted successfully! We'll review it and get back to you soon.",
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
        businessDescription: "",
        productsServices: "",
        setupRequirements: "",
        insuranceCoverage: false,
        previousEventExperience: "",
        willingToDonatRaffleItem: false,
        raffleItemDescription: "",
        additionalNotes: "",
        businessLicenseFiles: [],
        productImages: [],
      });
      setUploadedFiles({ type: 'product', files: [] });

    } catch (error) {
      console.error('Error submitting vendor application:', error);
      setSubmitMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vendor Application - Art Night Detroit</title>
        <meta
          name="description"
          content="Apply to be a vendor at Art Night Detroit events. Join our community of local businesses and creators."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeroSection>
        <HeroTitle>🏪 Vendor Application</HeroTitle>
        <HeroSubtitle>
          Join Art Night Detroit as a vendor and connect with our vibrant community of art lovers and creators
        </HeroSubtitle>
      </HeroSection>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>🏢 Business Information</SectionTitle>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              Tell us about your business
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
              <Select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select business type</option>
                <option value="food">Food & Beverage</option>
                <option value="retail">Retail & Merchandise</option>
                <option value="services">Services</option>
                <option value="crafts">Arts & Crafts</option>
                <option value="wellness">Health & Wellness</option>
                <option value="technology">Technology</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Do you have business insurance? *</Label>
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  name="insuranceCoverage"
                  checked={formData.insuranceCoverage}
                  onChange={handleInputChange}
                />
                <CheckboxLabel>Yes, I have business insurance coverage</CheckboxLabel>
              </CheckboxContainer>
              <HelpText>
                Business insurance is typically required for vendor participation at events
              </HelpText>
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>📝 Business Details</SectionTitle>
            
            <FormGroup>
              <Label>Business Description *</Label>
              <TextArea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Describe your business, its mission, and what makes it unique..."
                rows={4}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Products & Services *</Label>
              <TextArea
                name="productsServices"
                value={formData.productsServices}
                onChange={handleInputChange}
                placeholder="What products or services will you offer at our events?"
                rows={4}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Setup Requirements</Label>
              <TextArea
                name="setupRequirements"
                value={formData.setupRequirements}
                onChange={handleInputChange}
                placeholder="Do you need electricity, water, specific space dimensions, etc.?"
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Previous Event Experience</Label>
              <TextArea
                name="previousEventExperience"
                value={formData.previousEventExperience}
                onChange={handleInputChange}
                placeholder="Tell us about your experience at markets, festivals, or similar events..."
                rows={3}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>🎁 Community Participation</SectionTitle>
            
            <FormGroup>
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  name="willingToDonatRaffleItem"
                  checked={formData.willingToDonatRaffleItem}
                  onChange={handleInputChange}
                />
                <CheckboxLabel>I&apos;m willing to donate an item for event raffles</CheckboxLabel>
              </CheckboxContainer>
            </FormGroup>

            {formData.willingToDonatRaffleItem && (
              <FormGroup>
                <Label>Raffle Item Description</Label>
                <TextArea
                  name="raffleItemDescription"
                  value={formData.raffleItemDescription}
                  onChange={handleInputChange}
                  placeholder="Describe the item you'd be willing to donate for raffles..."
                  rows={2}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Additional Notes</Label>
              <TextArea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Anything else you'd like us to know?"
                rows={3}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>📎 File Uploads</SectionTitle>
            
            <FormGroup>
              <Label>Product Images</Label>
              <HelpText>Upload photos of your products or services (optional)</HelpText>
              <FileUpload>
                <input
                  type="file"
                  name="productImages"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    setUploadedFiles(prev => ({ ...prev, type: 'product' }));
                    handleFileChange(e);
                  }}
                  style={{ display: "none" }}
                  id="productImages"
                />
                <FileUploadButton htmlFor="productImages">
                  Choose Product Images
                </FileUploadButton>
              </FileUpload>
            </FormGroup>

            <FormGroup>
              <Label>Business License/Permits</Label>
              <HelpText>Upload your business license or permits (optional)</HelpText>
              <FileUpload>
                <input
                  type="file"
                  name="businessLicenseFiles"
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => {
                    setUploadedFiles(prev => ({ ...prev, type: 'license' }));
                    handleFileChange(e);
                  }}
                  style={{ display: "none" }}
                  id="businessLicenseFiles"
                />
                <FileUploadButton htmlFor="businessLicenseFiles">
                  Choose License Files
                </FileUploadButton>
              </FileUpload>
            </FormGroup>

            {uploadedFiles.files.length > 0 && (
              <FileList>
                <FileListTitle>Uploaded Files:</FileListTitle>
                {uploadedFiles.files.map((file) => (
                  <FileItem key={file.id}>
                    <FileInfo>
                      <FileName>{file.file.name}</FileName>
                      {file.processing && <FileStatus>Processing...</FileStatus>}
                      {file.uploading && !file.processing && (
                        <FileStatus>Uploading...</FileStatus>
                      )}
                      {file.error && <FileError>Error: {file.error}</FileError>}
                      {file.url && !file.uploading && !file.error && (
                        <FileSuccess>✓ Uploaded</FileSuccess>
                      )}
                    </FileInfo>
                    {!file.uploading && (
                      <RemoveButton
                        type="button"
                        onClick={() => removeFile(file.id)}
                      >
                        Remove
                      </RemoveButton>
                    )}
                  </FileItem>
                ))}
              </FileList>
            )}
          </FormSection>

          {submitMessage && (
            <SubmitMessage type={submitMessage.type}>
              {submitMessage.text}
            </SubmitMessage>
          )}

          <SubmitButton type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Submitting..." : "Submit Vendor Application"}
          </SubmitButton>
        </form>
      </FormContainer>

      {selectedImage && (
        <ImageModal onClick={() => setSelectedImage(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedImage(null)}>×</CloseButton>
            <ModalImage src={selectedImage} alt="Preview" />
          </ModalContent>
        </ImageModal>
      )}
    </>
  );
};

// Styled Components (reusing and adapting from artist submissions)
const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:invalid {
    border-color: #ff4444;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: auto;
  margin: 0;
`;

const CheckboxLabel = styled.label`
  margin: 0;
  font-weight: normal;
  cursor: pointer;
`;

const HelpText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0 0 0;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const FileUpload = styled.div`
  margin-top: 0.5rem;
`;

const FileUploadButton = styled.label`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  color: #495057;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`;

const FileList = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const FileListTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
`;

const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;

  &:last-child {
    border-bottom: none;
  }
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #333;
`;

const FileStatus = styled.div`
  font-size: 0.8rem;
  color: #007bff;
  margin-top: 0.25rem;
`;

const FileError = styled.div`
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 0.25rem;
`;

const FileSuccess = styled.div`
  font-size: 0.8rem;
  color: #28a745;
  margin-top: 0.25rem;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background: #c82333;
  }
`;

const SubmitMessage = styled.div<{ type: "success" | "error" }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 500;

  ${(props) =>
    props.type === "success"
      ? `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `
      : `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ImageModal = styled.div`
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
`;

const CloseButton = styled.button`
  position: absolute;
  top: -3rem;
  right: -1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  color: #333;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;

  &:hover {
    background: #f0f0f0;
  }
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

export default VendorSubmissionsPage;
