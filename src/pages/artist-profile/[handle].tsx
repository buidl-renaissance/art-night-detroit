import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled from 'styled-components';
import QRCode from 'react-qr-code';
import { createClient } from '@supabase/supabase-js';

interface ArtistProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  tagline?: string;
  website?: string;
  instagram?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const ArtistProfilePage = () => {
  const router = useRouter();
  const { handle } = router.query;
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!handle || typeof handle !== 'string') return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('handle', handle)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data) {
          throw new Error('Artist profile not found');
        }

        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a handle and router is ready
    if (router.isReady && handle) {
      fetchProfile();
    }
  }, [handle, supabase, router.isReady]);

  const generateQRCode = useMemo(() => {
    if (!profile) return '';
    return `${window.location.origin}/artist-profile/${profile.handle}`;
  }, [profile]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingText>Loading artist profile...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorText>{error || 'Artist profile not found'}</ErrorText>
          <BackButton onClick={() => router.push('/')}>
            Back to Home
          </BackButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <>
      <Head>
        <title>{profile.name} | Art Night Detroit</title>
        <meta name="description" content={`Artist profile for ${profile.name} - ${profile.tagline || 'Art Night Detroit'}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <PageContainer>
        <ProfileSection>
          <ProfileImageContainer>
            {profile.image_url ? (
              <ProfileImage src={profile.image_url} alt={profile.name} />
            ) : (
              <DefaultProfileImage>
                <DefaultIcon>🎨</DefaultIcon>
              </DefaultProfileImage>
            )}
          </ProfileImageContainer>
          
          <ProfileInfo>
            <ArtistName>{profile.name}</ArtistName>
            <ArtistHandle>@{profile.handle}</ArtistHandle>
            {profile.tagline && <ArtistTagline>{profile.tagline}</ArtistTagline>}
            
            <SocialLinks>
              {profile.instagram && (
                <SocialLink 
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon>📷</SocialIcon>
                  @{profile.instagram.replace('@', '')}
                </SocialLink>
              )}
              {profile.website && (
                <SocialLink 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon>🌐</SocialIcon>
                  Website
                </SocialLink>
              )}
            </SocialLinks>
          </ProfileInfo>
        </ProfileSection>

        <QRCodeSection>
          <QRCodeTitle>Share This Profile</QRCodeTitle>
          <QRCodeContainer>
            <QRCode
              value={generateQRCode}
              size={200}
              level="Q"
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </QRCodeContainer>
          <QRCodeText>Scan to view this artist&apos;s profile</QRCodeText>
        </QRCodeSection>

        <ArtNightBranding>
          <BrandingText>Art Night Detroit</BrandingText>
          <BrandingSubtext>Connecting Artists & Community</BrandingSubtext>
        </ArtNightBranding>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  gap: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 2rem;
  }
`;

const ProfileSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
`;

const ProfileImageContainer = styled.div`
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const DefaultProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const DefaultIcon = styled.span`
  font-size: 4rem;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ArtistName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  font-family: "Baloo 2", sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ArtistHandle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #666;
  margin: 0;
  font-family: "Inter", sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ArtistTagline = styled.p`
  font-size: 1.25rem;
  color: #777;
  margin: 0.5rem 0;
  font-style: italic;
  font-family: "Inter", sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #764ba2;
  }
`;

const SocialIcon = styled.span`
  font-size: 1.25rem;
`;

const QRCodeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
    padding: 1.5rem;
  }
`;

const QRCodeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-align: center;
  font-family: "Baloo 2", sans-serif;
`;

const QRCodeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const QRCodeText = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
  text-align: center;
  font-family: "Inter", sans-serif;
`;

const ArtNightBranding = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  text-align: right;
  color: rgba(255, 255, 255, 0.8);
  
  @media (max-width: 768px) {
    position: static;
    text-align: center;
    margin-top: 1rem;
  }
`;

const BrandingText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  font-family: "Baloo 2", sans-serif;
`;

const BrandingSubtext = styled.div`
  font-size: 1rem;
  font-family: "Inter", sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const LoadingText = styled.p`
  font-size: 1.5rem;
  color: white;
  font-family: "Inter", sans-serif;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 2rem;
`;

const ErrorText = styled.p`
  font-size: 1.5rem;
  color: white;
  text-align: center;
  font-family: "Inter", sans-serif;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Inter", sans-serif;
  
  &:hover {
    background: white;
    color: #667eea;
  }
`;

export default ArtistProfilePage;
