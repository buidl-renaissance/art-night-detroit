export interface OrderDetails {
  id: string;
  number_of_tickets: number;
  status: string;
  created_at: string;
  raffle_id?: string;
  artist_id?: string;
  raffle?: {
    id: string;
    name: string;
  } | null;
  artist?: {
    id: string;
    name: string;
  } | null;
  tickets?: {
    id: string;
    ticket_number: string;
    created_at: string;
  }[];
} 