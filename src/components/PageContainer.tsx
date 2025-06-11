import styled from 'styled-components';
import { ReactNode, CSSProperties } from 'react';

export type ContainerWidth = 'narrow' | 'medium' | 'wide' | 'full';
export type ThemeMode = 'light' | 'dark';

interface PageContainerProps {
  children: ReactNode;
  width?: ContainerWidth;
  theme?: ThemeMode;
  className?: string;
  containerStyle?: CSSProperties;
  wrapperStyle?: CSSProperties;
}

const getMaxWidth = (width: ContainerWidth) => {
  switch (width) {
    case 'narrow':
      return '600px';
    case 'medium':
      return '900px';
    case 'wide':
      return '1200px';
    case 'full':
      return '100%';
    default:
      return '1200px';
  }
};

const Wrapper = styled.div<{ $themeMode: ThemeMode }>`
  width: 100%;
  background: ${({ $themeMode }) => $themeMode === 'dark' ? '#121212' : '#ffffff'};
  color: ${({ $themeMode }) => $themeMode === 'dark' ? '#ffffff' : '#121212'};
`;

const Container = styled.div<{ $width: ContainerWidth }>`
  margin: 0 auto;
  padding: 40px 16px;
  width: 100%;
  max-width: ${({ $width }) => getMaxWidth($width)};
  
  /* Responsive padding */
  @media (min-width: 768px) {
    padding: 40px 32px;
  }
`;

export const PageContainer = ({ 
  children, 
  width = 'medium', 
  theme = 'light',
  className,
  containerStyle,
  wrapperStyle
}: PageContainerProps) => {
  return (
    <Wrapper $themeMode={theme} style={wrapperStyle}>
      <Container $width={width} className={className} style={containerStyle}>
        {children}
      </Container>
    </Wrapper>
  );
};

export default PageContainer;