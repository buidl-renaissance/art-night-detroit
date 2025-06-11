import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import { loadStripe } from '@stripe/stripe-js';
import PageContainer from '@/components/PageContainer';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Raffle {
  id: string;
  name: string;
  description: string;
  price_per_ticket: number;
  max_tickets: number;
  status: 'draft' | 'active' | 'ended';
}

const CheckoutContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0rem;
  color: ${({ theme }) => theme.colors.text.primary};

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h3 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    line-height: 1.6;
  }
`;

const RaffleInfo = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TicketSelector = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const QuantityControls = styled.div`
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

const Summary = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.light};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    font-weight: bold;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1.25rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default function Checkout() {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRaffle = async () => {
      if (!id) return;

      try {
        const { data: raffleData, error: raffleError } = await supabase
          .from('raffles')
          .select('*')
          .eq('id', id)
          .single();

        if (raffleError) throw raffleError;
        setRaffle(raffleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffle();
  }, [id, supabase]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleCheckout = async () => {
    if (!raffle) return;

    try {
      setCheckoutLoading(true);
      setError(null);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          raffleId: raffle.id,
          quantity,
          price: raffle.price_per_ticket,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error('No session ID received');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer theme="dark">
        <CheckoutContainer>
          <p>Loading...</p>
        </CheckoutContainer>
      </PageContainer>
    );
  }

  if (error || !raffle) {
    return (
      <PageContainer theme="dark">
        <CheckoutContainer>
          <p>Error: {error || 'Raffle not found'}</p>
        </CheckoutContainer>
      </PageContainer>
    );
  }

  const total = raffle.price_per_ticket * quantity;

  return (
    <PageContainer theme="dark">
      <CheckoutContainer>
        <h1>Checkout</h1>
        
        <RaffleInfo>
          <h2>{raffle.name}</h2>
          <p>{raffle.description}</p>
          <p>Price per ticket: ${raffle.price_per_ticket.toFixed(2)}</p>
        </RaffleInfo>

        <TicketSelector>
          <h3>Select Number of Tickets</h3>
          <QuantityControls>
            <QuantityButton 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              -
            </QuantityButton>
            <QuantityInput
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={handleQuantityChange}
            />
            <QuantityButton 
              onClick={incrementQuantity}
              disabled={quantity >= 10}
            >
              +
            </QuantityButton>
          </QuantityControls>
        </TicketSelector>

        <Summary>
          <h3>Order Summary</h3>
          <SummaryRow>
            <span>Number of tickets:</span>
            <span>{quantity}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Price per ticket:</span>
            <span>${raffle.price_per_ticket.toFixed(2)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </SummaryRow>
        </Summary>

        <CheckoutButton
          onClick={handleCheckout}
          disabled={checkoutLoading || raffle.status !== 'active'}
        >
          {checkoutLoading ? 'Processing...' : 'Proceed to Payment'}
        </CheckoutButton>
      </CheckoutContainer>
    </PageContainer>
  );
} 