export interface Participant {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketClaim {
  id: string;
  participant_id: string;
  ticket_id: string;
  claimed_at: string;
  created_at: string;
  updated_at: string;
}

export interface QRCodeSession {
  id: string;
  raffle_id: string;
  admin_id: string;
  ticket_count: number;
  session_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParticipantFormData {
  name: string;
  phone: string;
  email: string;
  instagram?: string;
}

export interface QRCodeSessionFormData {
  raffle_id: string;
  ticket_count: number;
} 