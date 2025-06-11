export interface Raffle {
  id: string;
  name: string;
  description: string;
  slug: string;
  start_date: Date;
  end_date: Date;
  price_per_ticket: number;
  max_tickets: number;
  created_at: Date;
  updated_at: Date;
  winner_id?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Ticket {
  id: string;
  raffle_id?: string;
  user_id?: string;
  ticket_number: number;
  purchased_at: Date;
  created_at: Date;
  updated_at: Date;
}
