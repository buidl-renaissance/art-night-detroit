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
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    {
      id: string;
      file: File;
      url: string;
      uploading: boolean;
      error?: string;
      processing?: boolean;
    }[]
  >([]);
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
          }) as FormData
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

  const uploadFile = async (file: File): Promise<string> => {
    // Convert images to JPEG first
    const processedFile = await convertImageToJpeg(file);

    const formData = new FormData();
    formData.append("file", processedFile);

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

    // Clear submit message when user changes files
    if (submitMessage) {
      setSubmitMessage(null);
    }

    if (files && name === "multimediaFiles") {
      const fileArray = Array.from(files);

      // Add to existing files instead of replacing
      const allFiles = [...formData.multimediaFiles, ...fileArray];
      setFormData((prev) => ({
        ...prev,
        multimediaFiles: allFiles,
      }));

      // Start uploading new files immediately
      setIsUploading(true);

      // Add new files to uploaded files state with processing status and unique IDs
      const newUploadedFiles = fileArray.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        url: "",
        uploading: false,
        processing: true,
        error: "",
      }));
      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

      // Process and upload each new file
      try {
        const uploadPromises = newUploadedFiles.map(async (uploadedFile) => {
          try {
            // First mark as uploading (after processing)
            setUploadedFiles((prev) =>
              prev.map((item) =>
                item.id === uploadedFile.id
                  ? { ...item, processing: false, uploading: true }
                  : item
              )
            );

            const url = await uploadFile(uploadedFile.file);

            // Update the specific file's status
            setUploadedFiles((prev) =>
              prev.map((item) =>
                item.id === uploadedFile.id
                  ? { ...item, url, uploading: false }
                  : item
              )
            );
            return url;
          } catch (error) {
            console.error(`Failed to upload ${uploadedFile.file.name}:`, error);
            const errorMessage =
              error instanceof Error ? error.message : "Upload failed";
            // Mark this file as failed with error message
            setUploadedFiles((prev) =>
              prev.map((item) =>
                item.id === uploadedFile.id
                  ? {
                      ...item,
                      processing: false,
                      uploading: false,
                      url: "ERROR",
                      error: errorMessage,
                    }
                  : item
              )
            );
            throw error;
          }
        });

        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("File upload error:", error);
        setSubmitMessage({
          type: "error",
          text: "Some files failed to upload. You can try again or remove the failed files.",
        });
      } finally {
        setIsUploading(false);
      }
    }

    // Clear the input so the same files can be selected again if needed
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    // Find the file to remove
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    if (!fileToRemove) return;

    // Remove from uploaded files
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

    // Remove from form data
    setFormData((prev) => ({
      ...prev,
      multimediaFiles: prev.multimediaFiles.filter(
        (f) => f !== fileToRemove.file
      ),
    }));

    // Clear any submit messages when user removes files
    if (submitMessage) {
      setSubmitMessage(null);
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

    // Clear previous messages
    setSubmitMessage(null);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      setSubmitMessage({
        type: "error",
        text: "Please fill in all required fields: name, email, and phone",
      });
      return;
    }

    // Check if any files are still processing or uploading
    if (uploadedFiles.some((file) => file.uploading || file.processing)) {
      setSubmitMessage({
        type: "error",
        text: "Please wait for all files to finish processing and uploading",
      });
      return;
    }

    // Check if any files failed to upload
    if (uploadedFiles.some((file) => file.url === "ERROR")) {
      setSubmitMessage({
        type: "error",
        text: "Some files failed to upload. Please try uploading them again.",
      });
      return;
    }

    // Count only successfully uploaded files (not failed ones)
    const successfullyUploadedFiles = uploadedFiles.filter(
      (file) => file.url && file.url !== "ERROR"
    );
    if (successfullyUploadedFiles.length < 2) {
      setSubmitMessage({
        type: "error",
        text: "Please upload at least two examples of your artwork",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create submission data object with already uploaded file URLs
      const submissionData = {
        name: formData.name,
        artistAlias: formData.artistAlias,
        email: formData.email,
        phone: formData.phone,
        instagramLink: formData.instagramLink,
        portfolioLink: formData.portfolioLink,
        willingToVolunteer: formData.willingToVolunteer,
        interestedInFutureEvents: formData.interestedInFutureEvents,
        additionalNotes: formData.additionalNotes,
        portfolioFileUrls: successfullyUploadedFiles.map((file) => file.url),
      };

      // Submit to API
      const response = await fetch("/api/submit-artist-application", {
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
          text: "Thank you for your submission! We'll review your application and get back to you soon.",
        });

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
        setUploadedFiles([]);
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

  const MediaThumbnailWithStatus: React.FC<{
    file: File;
    uploading: boolean;
    processing?: boolean;
    uploadError: boolean;
    errorMessage?: string;
    onRemove: () => void;
    onClick?: (src: string) => void;
  }> = ({
    file,
    uploading,
    processing,
    uploadError,
    errorMessage,
    onRemove,
    onClick,
  }) => {
    const [thumbnailSrc, setThumbnailSrc] = useState<string>("");

    React.useEffect(() => {
      createThumbnail(file).then(setThumbnailSrc);
    }, [file]);

    const handleClick = () => {
      if (
        onClick &&
        file.type.startsWith("image/") &&
        !uploading &&
        !processing &&
        !uploadError
      ) {
        const reader = new FileReader();
        reader.onload = (e) => onClick(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    };

    const isProcessing = processing || uploading;

    return (
      <ThumbnailContainer
        onClick={handleClick}
        style={{
          opacity: isProcessing ? 0.7 : 1,
          border: uploadError ? "2px solid #ff4444" : undefined,
          cursor:
            onClick && !isProcessing && !uploadError ? "pointer" : "default",
        }}
      >
        <RemoveButton
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove file"
        >
          ×
        </RemoveButton>
        <ThumbnailImage src={thumbnailSrc} alt={file.name} />
        <ThumbnailLabel>{file.name}</ThumbnailLabel>
        {file.type.startsWith("video/") && !isProcessing && !uploadError && (
          <VideoIcon>▶</VideoIcon>
        )}
        {!file.type.startsWith("image/") &&
          !file.type.startsWith("video/") &&
          !isProcessing &&
          !uploadError && <FileIcon>📄</FileIcon>}
        {processing && (
          <UploadingOverlay>
            <UploadingSpinner />
            <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
              Processing...
            </div>
          </UploadingOverlay>
        )}
        {uploading && (
          <UploadingOverlay>
            <UploadingSpinner />
            <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
              Uploading...
            </div>
          </UploadingOverlay>
        )}
        {uploadError && (
          <ErrorOverlay>
            <div style={{ fontSize: "1.5rem" }}>⚠️</div>
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                textAlign: "center",
              }}
            >
              Upload Failed
              {errorMessage && (
                <div style={{ fontSize: "0.65rem", marginTop: "0.25rem" }}>
                  {errorMessage}
                </div>
              )}
            </div>
          </ErrorOverlay>
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
              <Label>Upload Your Portfolio *</Label>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "0.5rem",
                }}
              >
                Upload at least two examples of your artwork (images, videos, or
                other media files). You can select multiple files at once or add
                them one by one. Click the × button to remove any file.
              </p>
              <FileInput
                type="file"
                name="multimediaFiles"
                onChange={handleFileChange}
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
                required
              />
              {uploadedFiles.length > 0 && (
                <MediaPreviewContainer>
                  <div
                    style={{
                      marginBottom: "1rem",
                      fontSize: "0.9rem",
                      color:
                        uploadedFiles.filter((f) => f.url && f.url !== "ERROR")
                          .length < 2
                          ? "#ff4444"
                          : "#666",
                    }}
                  >
                    {uploadedFiles.length} file(s) selected (
                    {
                      uploadedFiles.filter((f) => f.url && f.url !== "ERROR")
                        .length
                    }{" "}
                    successfully uploaded){" "}
                    {uploadedFiles.filter((f) => f.url && f.url !== "ERROR")
                      .length < 2
                      ? "(minimum 2 required)"
                      : ""}
                    {uploadedFiles.some((f) => f.processing) && (
                      <span style={{ color: "#007bff" }}>
                        {" "}
                        - Processing images...
                      </span>
                    )}
                    {isUploading && (
                      <span style={{ color: "#007bff" }}> - Uploading...</span>
                    )}
                  </div>
                  <ThumbnailGrid>
                    {uploadedFiles.map((uploadedFile) => (
                      <MediaThumbnailWithStatus
                        key={uploadedFile.id}
                        file={uploadedFile.file}
                        uploading={uploadedFile.uploading}
                        processing={uploadedFile.processing}
                        uploadError={uploadedFile.url === "ERROR"}
                        errorMessage={uploadedFile.error}
                        onRemove={() => removeFile(uploadedFile.id)}
                        onClick={
                          uploadedFile.url && uploadedFile.url !== "ERROR"
                            ? setSelectedImage
                            : undefined
                        }
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
              {isSubmitting ? "Submitting..." : "Submit Artist Application"}
            </SubmitButton>
            {submitMessage && (
              <SubmitMessage type={submitMessage.type}>
                {submitMessage.text}
              </SubmitMessage>
            )}
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

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ff4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  z-index: 10;
  transition: background-color 0.2s;

  &:hover {
    background-color: #cc0000;
  }

  &:focus {
    outline: 2px solid #ff4444;
    outline-offset: 2px;
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

const UploadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
`;

const UploadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #ff4444;
`;

export default SubmissionsPage;
