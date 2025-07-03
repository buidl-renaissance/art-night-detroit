import { createClient } from '@supabase/supabase-js';
import { Event } from '@/types/events';

// Create a server-side Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getServerSideEvents(): Promise<Event[]> {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return events || [];
  } catch (error) {
    console.error('Error in getServerSideEvents:', error);
    return [];
  }
}

export async function getServerSideFeaturedEvents(): Promise<Event[]> {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('featured', true)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching featured events:', error);
      return [];
    }

    return events || [];
  } catch (error) {
    console.error('Error in getServerSideFeaturedEvents:', error);
    return [];
  }
} 