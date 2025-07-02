export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  handle?: string;
  phone_number?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  handle?: string;
  phone_number?: string;
}

export interface ProfileWithTickets extends Profile {
  tickets?: {
    id: string;
    ticket_number: number;
    created_at: string;
  }[];
} 