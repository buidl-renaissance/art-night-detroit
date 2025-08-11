export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  handle?: string;
  phone_number?: string;
  tagline?: string;
  website?: string;
  image_url?: string;
  instagram?: string;
  is_admin: boolean;
  is_authenticated: boolean;
  auth_user_id?: string;
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