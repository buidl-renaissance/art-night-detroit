import { useEffect, useState } from 'react';
import styled from 'styled-components';

interface RaffleCountdownProps {
  endDate: string;
  label?: string;
}

const RaffleDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 8px;
`;

const Detail = styled.div`
  border-radius: 8px;
  text-align: center;
`;

const CountdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
`;

const DateTimeDisplay = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const CountdownGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const CountdownItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CountdownValue = styled.div`
  color: #FFD700;
  font-size: 1.4rem;
  font-weight: 600;
`;

const CountdownLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.light};
  text-transform: uppercase;
`;

export default function RaffleCountdown({ endDate, label = 'Raffle Ends' }: RaffleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <RaffleDetails>
      <Detail>
        <CountdownContainer>
          <Label>{label}</Label>
          <DateTimeDisplay>
            {new Date(endDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            <br />
            {new Date(endDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short'
            })}
          </DateTimeDisplay>
          <CountdownGrid>
            <CountdownItem>
              <CountdownValue>{timeLeft.days}</CountdownValue>
              <CountdownLabel>Days</CountdownLabel>
            </CountdownItem>
            <CountdownItem>
              <CountdownValue>{timeLeft.hours}</CountdownValue>
              <CountdownLabel>Hours</CountdownLabel>
            </CountdownItem>
            <CountdownItem>
              <CountdownValue>{timeLeft.minutes}</CountdownValue>
              <CountdownLabel>Minutes</CountdownLabel>
            </CountdownItem>
            <CountdownItem>
              <CountdownValue>{timeLeft.seconds}</CountdownValue>
              <CountdownLabel>Seconds</CountdownLabel>
            </CountdownItem>
          </CountdownGrid>
        </CountdownContainer>
      </Detail>
    </RaffleDetails>
  );
} 