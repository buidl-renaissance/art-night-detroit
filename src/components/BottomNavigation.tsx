import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

interface BottomNavigationProps {
  eventId?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ eventId }) => {
  const router = useRouter();

  const handleConnectClick = () => {
    if (eventId) {
      router.push(`/events/${eventId}/connect/add`);
    }
  };

  return (
    <NavigationContainer>
      <ConnectButton onClick={handleConnectClick}>
        Connect
      </ConnectButton>
    </NavigationContainer>
  );
};

export default BottomNavigation;

const NavigationContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`; 