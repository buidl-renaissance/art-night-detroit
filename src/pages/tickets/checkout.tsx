import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import { loadStripe } from '@stripe/stripe-js';
import PageContainer from '@/components/PageContainer';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const TICKET_PRICE = 10; // $10 per ticket

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

const TicketInfo = styled.div`
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

interface RaffleInfo {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface ArtistInfo {
  id: string;
  name: string;
  bio: string;
  image_url: string;
}

export default function Checkout() {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raffleInfo, setRaffleInfo] = useState<RaffleInfo | null>(null);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRaffleAndArtistInfo = async () => {
      const params = new URLSearchParams(window.location.search);
      const raffleId = params.get('raffle_id');
      const artistId = params.get('artist_id');

      if (raffleId) {
        const { data: raffle, error: raffleError } = await supabase
          .from('raffles')
          .select('id, name, description, image_url')
          .eq('id', raffleId)
          .single();

        if (!raffleError && raffle) {
          setRaffleInfo(raffle);
        }
      }

      if (artistId) {
        const { data: artist, error: artistError } = await supabase
          .from('artists')
          .select('id, name, bio, image_url')
          .eq('id', artistId)
          .single();

        if (!artistError && artist) {
          setArtistInfo(artist);
        }
      }
    };

    fetchRaffleAndArtistInfo();
  }, []);

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
    try {
      setLoading(true);
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
          quantity,
          price: TICKET_PRICE,
          raffleId: raffleInfo?.id,
          artistId: artistInfo?.id,
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
      setLoading(false);
    }
  };

  const total = TICKET_PRICE * quantity;

  return (
    <PageContainer theme="dark">
      <CheckoutContainer>
        <h1>Purchase Tickets</h1>
        
        <TicketInfo>
          <h2>
            {raffleInfo ? `${raffleInfo.name} Tickets` : 
             artistInfo ? `Support ${artistInfo.name}` : 
             'General Admission Tickets'}
          </h2>
          {raffleInfo && (
            <p>{raffleInfo.description}</p>
          )}
          {artistInfo && (
            <p>Support {artistInfo.name} in their artistic journey. Your ticket purchase directly contributes to their success.</p>
          )}
          {!raffleInfo && !artistInfo && (
            <p>These tickets can be used to vote for artists in any active raffle. Each ticket gives you one vote per raffle.</p>
          )}
          <p>Price per ticket: ${TICKET_PRICE.toFixed(2)}</p>
        </TicketInfo>

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
            <span>${TICKET_PRICE.toFixed(2)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </SummaryRow>
        </Summary>

        <CheckoutButton
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </CheckoutButton>

        {error && (
          <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </CheckoutContainer>
    </PageContainer>
  );
} 