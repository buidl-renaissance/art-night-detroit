import { Profile } from './profiles';

export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
  attendance_limit?: number;
  image_url?: string;
  external_url?: string;
  time_start?: string;
  time_end?: string;
  slug?: string;
  featured?: boolean;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EventWithRaffles extends Event {
  raffles?: {
    id: string;
    name: string;
    status: string;
  }[];
}

export interface EventParticipant {
  id: string;
  event_id: string;
  profile_id: string;
  role: 'DJ' | 'Featured Artist' | 'Vendor' | 'Attendee';
  bio?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile | null | undefined;
}

export interface EventFormData {
  name: string;
  description: string;
  start_date: string; // Local datetime string (YYYY-MM-DDTHH:MM format)
  end_date: string; // Local datetime string (YYYY-MM-DDTHH:MM format)
  location: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
}
