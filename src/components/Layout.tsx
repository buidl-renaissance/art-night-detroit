import styled from 'styled-components';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: #0056b3;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Work Sans', sans-serif;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutWrapper>
      <ContentContainer>
        {children}
      </ContentContainer>
    </LayoutWrapper>
  );
};

export default Layout; 