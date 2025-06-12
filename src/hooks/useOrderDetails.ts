import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { OrderDetails } from '@/types/orders';

type Ticket = {
  id: string;
  ticket_number: string;
  created_at: string;
};

export function useOrderDetails(orderId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;

      try {
        const supabase = createClientComponentClient();
        
        // First fetch the order with raffle and artist details
        const { data: orderData, error: orderError } = await supabase
          .from('ticket_orders')
          .select(`
            *,
            raffle:raffle_id(id, name),
            artist:artist_id(id, name)
          `)
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // If there are issued tickets, fetch them separately
        let tickets: Ticket[] = [];
        if (orderData.issued_tickets && orderData.issued_tickets.length > 0) {
          const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('id, ticket_number, created_at')
            .in('id', orderData.issued_tickets);

          if (ticketError) throw ticketError;
          tickets = ticketData || [];
        }

        // Transform the data to match our OrderDetails type
        const transformedOrder: OrderDetails = {
          ...orderData,
          raffle: orderData.raffle?.[0] || null,
          artist: orderData.artist?.[0] || null,
          tickets
        };

        setOrder(transformedOrder);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  return {
    order,
    loading,
    error,
    setOrder
  };
} 