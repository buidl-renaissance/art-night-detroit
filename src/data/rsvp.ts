import { supabase } from '@/lib/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';

interface RSVP {
  id: string;
  event_id: string;
  user_id?: string;
  handle: string;
  name: string;
  email: string;
  phone?: string;
  status: 'confirmed' | 'waitlisted' | 'rejected' | 'canceled';
  created_at: string;
  updated_at?: string;
  attended_at?: string | null;
}

export async function getRSVPsByEvent(eventId: string): Promise<RSVP[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching RSVPs:', error);
    return [];
  }

  return data || [];
}

export async function getRSVPByUser(eventId: string, userId: string): Promise<RSVP | null> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching RSVP:', error);
    return null;
  }

  return data;
}

export async function createRSVP(rsvpData: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP | null> {
  const { data, error } = await supabase
    .from('rsvps')
    .insert([{
      ...rsvpData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating RSVP:', error);
    return null;
  }

  return data;
}

export async function updateRSVP(id: string, rsvpData: Partial<RSVP>, client?: SupabaseClient): Promise<RSVP | null> {
  const supabaseClient = client || supabase;
  
  console.log('updateRSVP called with id:', id, 'data:', rsvpData);
  
  // Update the RSVP and get the result
  const { data, error } = await supabaseClient
    .from('rsvps')
    .update(rsvpData)
    .eq('id', id)
    .select();

  console.log('updateRSVP result - data:', data, 'error:', error);

  if (error) {
    console.error('Error updating RSVP:', error);
    return null;
  }

  // Check if any rows were updated
  if (!data || data.length === 0) {
    console.error('RSVP not found with id:', id);
    return null;
  }

  console.log('Successfully updated RSVP:', data[0]);
  return data[0];
}

export async function updateRSVPAttendance(id: string, attended: boolean, client?: SupabaseClient): Promise<RSVP | null> {
  const updateData = attended 
    ? { attended_at: new Date().toISOString() }
    : { attended_at: null };

  return updateRSVP(id, updateData, client);
}

export async function updateRSVPStatus(id: string, status: RSVP['status'], client?: SupabaseClient): Promise<RSVP | null> {
  return updateRSVP(id, { status }, client);
}

export async function deleteRSVP(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting RSVP:', error);
    return false;
  }

  return true;
}
