import { keyframes } from 'styled-components';

export const shimmer = keyframes`
  to {
    background-position: 200% center;
  }
`;

export const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;
