import React from "react";
import styled from "styled-components";
import { keyframes } from "styled-components";
import Link from "next/link";
import Head from "next/head";

export const getServerSideProps = async () => {
  return {
    props: {
      metadata: {
        title: "Art Night Detroit x Spotlite Vol. 08",
        description:
          "Join us for Art Night Detroit x Spotlite Vol. 08 on April 30, 2025. Creative projects, visual art showcase, live music, and more!",
        image: "/images/art-night-spot-lite-vol-08.jpg",
      },
    },
  };
};

const ArtNightSpotLiteVol8Page = () => {
  return (
    <Container>
      <Head>
        <title>
          Art Night Detroit x Spot Lite Vol. 08 | Lord Smearington&apos;s Realm
        </title>
        <meta
          name="description"
          content="Join us for Art Night Detroit x Spotlite Vol. 08 on April 30, 2025. Creative projects, visual art showcase, live music, and more!"
        />
      </Head>

      <PageBackground />

      {[...Array(10)].map((_, i) => (
        <FloatingElement
          key={i}
          top={`${Math.random() * 100}%`}
          left={`${Math.random() * 100}%`}
          size={`${Math.random() * 50 + 20}px`}
          animationDuration={`${Math.random() * 10 + 5}s`}
        />
      ))}

      <Header>
        <HeaderTitle>
          ART NIGHT DETROIT X SPOTLITE
          <br />
          <span style={{ fontSize: "1.5rem" }}>VOL. 08</span>
        </HeaderTitle>
        <HeaderSubtitle>
          Close out the month of April in style with us!
        </HeaderSubtitle>
        <EventDate>Wednesday, April 30, 2025 • 7:30PM-2AM</EventDate>
      </Header>

      <ContentWrapper>
        <EventSection>
          <EventDescription>
            <p>
              As always it&apos;s encouraged to bring a creative project to work
              on, arrive early and kick it with the @homiehangz crew from 7:30-9
              introducing their one of a kind creative community, visual art
              showcase by @darklord_escada, live music all night &
              @hazelnut.helper magnet making workshop making a return to
              Spotlite.
            </p>

            <SoundsBySection>
              <SoundsByTitle>SOUNDS BY:</SoundsByTitle>
              <ArtistList>
                <ArtistItem>@emberlafi</ArtistItem>
                <ArtistItem>@homiehangz</ArtistItem>
                <ArtistItem>@_djpressure</ArtistItem>
                <ArtistItem>@nathankarinen</ArtistItem>
                <ArtistItem>
                  @rapharazzi b2b @discjockeygeorge b2b @djgoodevening
                </ArtistItem>
              </ArtistList>
            </SoundsBySection>

            <EventDetails>
              <DetailItem>
                <DetailIcon>💰</DetailIcon>
                <DetailText>$5 donation at the door</DetailText>
              </DetailItem>
              <DetailItem>
                <DetailIcon>🕗</DetailIcon>
                <DetailText>7:30PM-2AM</DetailText>
              </DetailItem>
              <DetailItem>
                <DetailIcon>📅</DetailIcon>
                <DetailText>April 30, 2025</DetailText>
              </DetailItem>
            </EventDetails>

            <ClosingText>
              Looking forward to creating together ❤️🎨🔊
            </ClosingText>
          </EventDescription>

          <EventImageContainer>
            <EventImage
              src="/images/art-night-spot-lite-vol-08.jpg"
              alt="Art Night Detroit x Spotlite Vol. 08"
            />
            <ImageCaption>ART NIGHT DETROIT X SPOTLITE VOL. 08</ImageCaption>
          </EventImageContainer>
        </EventSection>

        <CTASection>
          <CTATitle>JOIN THE NIGHT OF CREATIVITY</CTATitle>
          <CTAButtons>
            <PrimaryButton href="https://discord.gg/kSuS9kdgTk" target="_blank">
              RSVP ON DISCORD
            </PrimaryButton>
            <SecondaryButton href="/events">LEARN MORE</SecondaryButton>
          </CTAButtons>
        </CTASection>
      </ContentWrapper>
    </Container>
  );
};

export default ArtNightSpotLiteVol8Page;

// Animations
const float = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #0a0a23;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

const PageBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0a0a23;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  z-index: -2;
`;

const FloatingElement = styled.div<{
  top: string;
  left: string;
  size: string;
  animationDuration: string;
}>`
  position: absolute;
  width: ${(props: { size: string }) => props.size};
  height: ${(props: { size: string }) => props.size};
  top: ${(props: { top: string }) => props.top};
  left: ${(props: { left: string }) => props.left};
  background: linear-gradient(
    135deg,
    rgba(255, 0, 0, 0.1),
    rgba(255, 215, 0, 0.05)
  );
  border-radius: 50%;
  z-index: -1;
  animation: ${float} ${(props: { animationDuration: string }) => props.animationDuration} infinite ease-in-out;
`;

const Header = styled.header`
  padding: 6rem 2rem 3rem;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 3px;
    background: #ff0000;
    mask-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='%23FF0000' stroke-width='4' stroke-dasharray='6, 14' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E");
  }
`;

const HeaderTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ff0000, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const EventDate = styled.div`
  font-size: 1.2rem;
  color: #ffffff;
  margin-top: 1rem;
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 0;
  background: #0033ff;
  font-weight: 600;
  position: relative;

  &:before,
  &:after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 10px;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L5,0 L10,50 L5,100 L0,100 Z' fill='%230033FF'/%3E%3C/svg%3E");
  }

  &:before {
    left: -10px;
  }

  &:after {
    right: -10px;
    transform: scaleX(-1);
  }
`;

const ContentWrapper = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  animation: ${fadeIn} 1s ease-out 0.2s both;
`;

const EventSection = styled.section`
  display: flex;
  gap: 3rem;
  margin-bottom: 4rem;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 80%;
    background: #ff0000;
    opacity: 0.3;
    display: none;
  }

  @media (min-width: 993px) {
    &:after {
      display: block;
    }
  }

  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const EventDescription = styled.div`
  flex: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperTexture'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperTexture)' opacity='0.03'/%3E%3C/svg%3E");
  padding: 2rem;
  border-left: 4px solid #ff0000;

  p {
    font-size: 1.1rem;
    line-height: 1.7;
    margin-bottom: 2rem;
    color: #ffffff;
  }
`;

const SoundsBySection = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 215, 0, 0.1);
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='crumpled'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.15' numOctaves='3' stitchTiles='stitch'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23crumpled)' opacity='0.1'/%3E%3C/svg%3E");
    z-index: -1;
  }
`;

const SoundsByTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 1px;
  position: relative;
  display: inline-block;

  &:after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #0033ff;
  }
`;

const ArtistList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ArtistItem = styled.li`
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: #ffffff;
  position: relative;
  padding-left: 20px;

  &:before {
    content: ">";
    position: absolute;
    left: 0;
    color: #0033ff;
    font-weight: bold;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventDetails = styled.div`
  margin: 2rem 0;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const DetailIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 1rem;
  background: #ffd700;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;

const DetailText = styled.span`
  font-size: 1.1rem;
  color: #ffffff;
  font-weight: 500;
`;

const ClosingText = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 2rem;
  color: #ffffff;
  padding: 1rem;
  border: 2px solid #ff0000;
  display: inline-block;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    top: 5px;
    left: 5px;
    right: -5px;
    bottom: -5px;
    border: 1px dashed #0033ff;
    z-index: -1;
  }
`;

const EventImageContainer = styled.div`
  flex: 1;
  position: relative;

  @media (max-width: 992px) {
    margin-top: 2rem;
  }
`;

const EventImage = styled.img`
  width: 100%;
  border: 3px solid #ffffff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 0, 0, 0.2),
      rgba(0, 51, 255, 0.2)
    );
    mix-blend-mode: overlay;
  }
`;

const ImageCaption = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ff0000;
  padding: 1rem;
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
  font-weight: 800;
  letter-spacing: 1px;
`;

const CTASection = styled.section`
  text-align: center;
  padding: 3rem;
  background: linear-gradient(to right, #0a0a23 50%, #ffd700 50%);
  position: relative;
  margin-bottom: 3rem;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
    z-index: 0;
  }

  &:after {
    content: "X";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 15rem;
    color: rgba(255, 0, 0, 0.1);
    font-weight: 900;
    z-index: 0;
  }
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #ffffff;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  z-index: 1;
  text-shadow: 3px 3px 0 #ff0000;
`;

const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PrimaryButton = styled(Link)`
  background: #ff0000;
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
  padding: 1rem 2rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 5px 5px 0 #0033ff;
  text-decoration: none;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 8px 8px 0 #0033ff;

    &:before {
      transform: translateX(100%);
    }
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -50px;
    width: 50%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transform: skewX(-25deg);
    transition: transform 0.5s ease;
  }
`;

const SecondaryButton = styled(Link)`
  background: transparent;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 800;
  padding: 1rem 2rem;
  border: 2px solid #0033ff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;

  &:hover {
    background: #0033ff;
    color: #ffffff;
    transform: translateY(-3px) translateX(3px);
  }

  &:after {
    content: "";
    position: absolute;
    top: 5px;
    left: 5px;
    right: -5px;
    bottom: -5px;
    border: 1px dashed #0033ff;
    z-index: -1;
    transition: all 0.3s ease;
  }

  &:hover:after {
    top: 8px;
    left: 8px;
    right: -8px;
    bottom: -8px;
  }
`;
