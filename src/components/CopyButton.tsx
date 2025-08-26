import React, { useState } from 'react';
import styled from 'styled-components';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  variant = 'secondary',
  size = 'medium',
  className
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <StyledButton
      onClick={handleCopy}
      $variant={variant}
      $size={size}
      className={className}
      disabled={copied}
    >
      {copied ? '✓ Copied!' : `📋 ${label}`}
    </StyledButton>
  );
};

const StyledButton = styled.button<{
  $variant: 'primary' | 'secondary';
  $size: 'small' | 'medium' | 'large';
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '0.5rem 1rem';
      case 'large': return '1rem 1.5rem';
      default: return '0.75rem 1.25rem';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  background: ${props => props.$variant === 'primary' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#2a2a2a'
  };
  color: ${props => props.$variant === 'primary' ? '#ffffff' : '#e0e0e0'};
  border: ${props => props.$variant === 'secondary' ? '1px solid #404040' : 'none'};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${props => props.$variant === 'primary'
      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
      : '#333333'
    };
    border-color: ${props => props.$variant === 'secondary' ? '#505050' : 'transparent'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #1e5f3e;
    color: #90ee90;
    cursor: default;
    transform: none;
    border-color: #2e7d32;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.4);
  }
`;

export default CopyButton;
