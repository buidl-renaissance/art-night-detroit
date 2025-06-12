import styled from 'styled-components';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  width?: 'small' | 'medium' | 'large' | 'full';
}

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: #0056b3;
`;

const ContentContainer = styled.div<{ width: 'small' | 'medium' | 'large' | 'full' }>`
  margin: 0 auto;
  font-family: 'Work Sans', sans-serif;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: ${({ width }) => width === 'small' ? '500px' : width === 'large' ? '1200px' : width === 'full' ? '100%' : '800px'};
`;

const Layout = ({ children, width = 'large' }: LayoutProps) => {
  return (
    <LayoutWrapper>
      <ContentContainer width={width}>
        {children}
      </ContentContainer>
    </LayoutWrapper>
  );
};

export default Layout; 