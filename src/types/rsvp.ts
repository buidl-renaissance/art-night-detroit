export interface RSVP {
  id: string;
  event_id: string;
  handle: string;
  name: string;
  email: string;
  phone?: string;
  status: 'confirmed' | 'waitlisted' | 'rejected' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface CreateRSVPData {
  event_id: string;
  handle: string;
  name: string;
  email: string;
  phone?: string;
} 