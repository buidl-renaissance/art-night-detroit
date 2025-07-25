import styled from 'styled-components';
import { ReactNode } from 'react';

export type ContainerWidth = 'narrow' | 'medium' | 'wide' | 'full';
export type ThemeMode = 'light' | 'dark';

interface PageContainerProps {
  children: ReactNode;
  width?: ContainerWidth;
  theme?: ThemeMode;
  className?: string;
}

const getMaxWidth = (width: ContainerWidth) => {
  switch (width) {
    case 'narrow':
      return '800px';
    case 'medium':
      return '1200px';
    case 'wide':
      return '1600px';
    case 'full':
      return '100%';
    default:
      return '1200px';
  }
};

const Wrapper = styled.div<{ $themeMode: ThemeMode }>`
  width: 100%;
  min-height: 100vh;
  background: ${({ $themeMode }) => $themeMode === 'dark' ? '#121212' : '#ffffff'};
  color: ${({ $themeMode }) => $themeMode === 'dark' ? '#ffffff' : '#121212'};
`;

const Container = styled.div<{ $width: ContainerWidth }>`
  margin: 0 auto;
  padding: 3rem 2rem;
  width: 100%;
  max-width: ${({ $width }) => getMaxWidth($width)};
  display: flex;
  flex-direction: column;
  
  /* Responsive padding */
  @media (min-width: 768px) {
    padding: 60px 32px;
  }
`;

export const PageContainer = ({ 
  children, 
  width = 'medium', 
  theme = 'light',
  className 
}: PageContainerProps) => {
  return (
    <Wrapper $themeMode={theme}>
      <Container $width={width} className={className}>
        {children}
      </Container>
    </Wrapper>
  );
};

export default PageContainer;