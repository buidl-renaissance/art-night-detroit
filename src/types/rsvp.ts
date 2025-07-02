export interface RSVP {
  id: string;
  event_id: string;
  handle: string;
  name: string;
  email: string;
  phone?: string;
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