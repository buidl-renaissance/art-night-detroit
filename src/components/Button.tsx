import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const StyledButton = styled.button<{ $variant?: ButtonProps['variant'] }>`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'secondary':
        return `
          background: ${theme.colors.background.secondary};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border};

          &:hover:not(:disabled) {
            background: ${theme.colors.background.primary};
          }
        `;
      case 'danger':
        return `
          background: #dc2626;
          color: white;

          &:hover:not(:disabled) {
            background: #b91c1c;
          }
        `;
      default:
        return `
          background: ${theme.colors.primary};
          color: white;

          &:hover:not(:disabled) {
            background: ${theme.colors.primaryHover};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
  type = 'button',
  disabled = false,
}) => {
  return (
    <StyledButton
      $variant={variant}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
}; 