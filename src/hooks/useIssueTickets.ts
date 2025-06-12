import { useState } from 'react';
import { OrderDetails } from '@/types/orders';

export function useIssueTickets() {
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const issueOrderTickets = async (orderId: string, onSuccess?: (order: OrderDetails) => void) => {
    setIsIssuing(true);
    setError(null);

    try {
      const updatedOrder = await issueTickets(orderId);
      onSuccess?.(updatedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue tickets');
    } finally {
      setIsIssuing(false);
    }
  };

  return {
    issueOrderTickets,
    isIssuing,
    error
  };
} 

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function issueTickets(orderId: string) {
  const supabase = createClientComponentClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/issue-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ orderId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to issue tickets');
  }

  return response.json();
} 