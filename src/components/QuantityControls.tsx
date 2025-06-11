import styled from 'styled-components';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const QuantityButton = styled.button`
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const QuantityInput = styled.input`
  width: 80px;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;


interface QuantityControlsProps {
  quantity: number;
  min?: number;
  max?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (value: number) => void;
}

const QuantityControls: React.FC<QuantityControlsProps> = ({
  quantity,
  min = 1,
  max = 10,
  onIncrement,
  onDecrement,
  onChange,
}) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      onChange(value);
    }
  };

  return (
    <ControlsContainer>
      <QuantityButton 
        onClick={onDecrement}
        disabled={quantity <= min}
      >
        -
      </QuantityButton>
      <QuantityInput
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={handleQuantityChange}
      />
      <QuantityButton 
        onClick={onIncrement}
        disabled={quantity >= max}
      >
        +
      </QuantityButton>
    </ControlsContainer>
  );
};

export default QuantityControls; 