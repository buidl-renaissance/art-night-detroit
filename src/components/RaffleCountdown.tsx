import { useState, useEffect } from 'react';
import styled from 'styled-components';

interface RaffleCountdownProps {
  endDate: string;
  raffleName?: string;
}

const CountdownContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const RaffleName = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CountdownTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CountdownTime = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
`;

const TimeValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const TimeLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.light};
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const ExpiredMessage = styled.div`
  color: #ff4444;
  font-weight: bold;
  font-size: 1.1rem;
`;

export default function RaffleCountdown({ endDate, raffleName }: RaffleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <CountdownContainer>
        {raffleName && <RaffleName>{raffleName}</RaffleName>}
        <ExpiredMessage>🎉 Raffle has ended!</ExpiredMessage>
      </CountdownContainer>
    );
  }

  return (
    <CountdownContainer>
      {raffleName && <RaffleName>{raffleName}</RaffleName>}
      <CountdownTitle>⏰ Raffle Ends In</CountdownTitle>
      <CountdownTime>
        <TimeUnit>
          <TimeValue>{timeLeft.days}</TimeValue>
          <TimeLabel>Days</TimeLabel>
        </TimeUnit>
        <TimeUnit>
          <TimeValue>{timeLeft.hours}</TimeValue>
          <TimeLabel>Hours</TimeLabel>
        </TimeUnit>
        <TimeUnit>
          <TimeValue>{timeLeft.minutes}</TimeValue>
          <TimeLabel>Minutes</TimeLabel>
        </TimeUnit>
        <TimeUnit>
          <TimeValue>{timeLeft.seconds}</TimeValue>
          <TimeLabel>Seconds</TimeLabel>
        </TimeUnit>
      </CountdownTime>
    </CountdownContainer>
  );
} 