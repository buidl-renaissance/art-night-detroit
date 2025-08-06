import { generateEventSlug } from '@/lib/events';
import { supabase } from '@/lib/supabaseClient';
import { Event, EventFormData, EventParticipant } from '@/types/events';

export async function getEvent(idOrSlug: string): Promise<Event | null> {
  if (idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
    return getEventById(idOrSlug);
  }
  console.log('idOrSlug', idOrSlug);
  return getEventBySlug(idOrSlug);
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export async function queryEvents(params: {
  status?: Event['status'];
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}): Promise<Event[]> {
  let query = supabase.from('events').select('*');

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.featured !== undefined) {
    query = query.eq('featured', params.featured);
  }

  if (params.startDate) {
    query = query.gte('start_date', params.startDate);
  }

  if (params.endDate) {
    query = query.lte('end_date', params.endDate);
  }

  if (params.orderBy) {
    query = query.order(params.orderBy, {
      ascending: params.orderDirection === 'asc'
    });
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error querying events:', error);
    return [];
  }

  return data || [];
}

export async function createEvent(eventData: EventFormData): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .insert([{
      ...eventData,
      slug: generateEventSlug(eventData.name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return null;
  }

  return data;
}

export async function updateEvent(id: string, eventData: Partial<EventFormData>): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .update({
      ...eventData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    return null;
  }

  return data;
}

export async function getNextEvent(): Promise<Event | null> {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .lte('start_date', twentyFourHoursFromNow.toISOString())
    .or(`end_date.gte.${now.toISOString()},end_date.is.null`)
    .order('start_date', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching next event:', error);
    return null;
  }

  return data;
}

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('event_id', eventId)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching event participants:', error);
    return [];
  }

  return data || [];
}

export async function getEventWithParticipants(eventId: string): Promise<{ event: Event | null; participants: EventParticipant[] }> {
  const [event, participants] = await Promise.all([
    getEventById(eventId),
    getEventParticipants(eventId)
  ]);

  return { event, participants };
}