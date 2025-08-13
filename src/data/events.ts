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

  // First, try to find currently active events (events that are happening now)
  const { data: activeEvent, error: activeError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .lte('start_date', now.toISOString())
    .or(`end_date.gte.${now.toISOString()},end_date.is.null`)
    .order('start_date', { ascending: true })
    .limit(1)
    .single();

  if (activeError && activeError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching active event:', activeError);
  }

  if (activeEvent) {
    return activeEvent;
  }

  // If no active event, find the next upcoming event
  const { data: nextEvent, error: nextError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .gt('start_date', now.toISOString())
    .order('start_date', { ascending: true })
    .limit(1)
    .single();

  if (nextError && nextError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching next event:', nextError);
    return null;
  }

  return nextEvent;
}

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  console.log('=== FETCHING EVENT PARTICIPANTS WITH MANUAL JOIN ===');
  console.log('Event ID:', eventId);

  // Step 1: Get event participants (without profiles)
  console.log('Step 1: Fetching event participants...');
  const { data: participants, error: participantsError } = await supabase
    .from('event_participants')
    .select(`
      id,
      event_id,
      profile_id,
      role,
      created_at,
      updated_at
    `)
    .eq('event_id', eventId)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });

  if (participantsError) {
    console.error('Error fetching participants:', participantsError);
    return [];
  }

  if (!participants || participants.length === 0) {
    console.log('No participants found for event:', eventId);
    return [];
  }

  console.log(`Found ${participants.length} participants`);

  // Step 2: Extract all unique profile IDs
  const profileIds = participants
    .map(p => p.profile_id)
    .filter((id): id is string => Boolean(id))
    .filter((id, index, array) => array.indexOf(id) === index); // Remove duplicates

  console.log('Step 2: Profile IDs to fetch:', profileIds);

  if (profileIds.length === 0) {
    console.warn('No valid profile IDs found');
    return participants.map(p => ({ ...p, profile: null }));
  }

  // Step 3: Fetch all profiles in a single query
  console.log('Step 3: Fetching profiles...');
  console.log('Profile IDs to query:', JSON.stringify(profileIds));
  console.log('Profile IDs types:', profileIds.map(id => ({ id, type: typeof id, length: id.length })));

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      handle,
      phone_number,
      tagline,
      website,
      image_url,
      is_admin,
      created_at,
      updated_at
    `)
    .in('id', profileIds);

  console.log('Profile query result:', { profiles, profilesError });
  console.log('Raw profile data:', JSON.stringify(profiles, null, 2));

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    console.error('Error details:', JSON.stringify(profilesError, null, 2));
    return participants.map(p => ({ ...p, profile: null }));
  }

  // Test with a direct query for the specific profile ID
  const testProfileId = profileIds[0];
  console.log('Testing direct profile query for ID:', testProfileId);
  
  const { data: directProfile, error: directError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', testProfileId)
    .single();
  
  console.log('Direct profile query result:', { directProfile, directError });

  // Also test if any profiles exist at all
  const { data: anyProfiles, error: anyError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .limit(3);
  
  console.log('Sample profiles in database:', { anyProfiles, anyError });

  // Test if we can bypass RLS by using the service role (if available)
  console.log('Testing if this is an RLS policy issue...');
  
  // Try to get count of profiles (this might reveal RLS blocking)
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  console.log('Profile count test:', { count, countError });
  
  // Check current user context
  const { data: session } = await supabase.auth.getSession();
  console.log('Current auth session:', { 
    user: session?.session?.user?.id || 'anonymous',
    role: session?.session?.user?.role || 'anon'
  });

  console.log(`Found ${profiles?.length || 0} profiles via .in() query`);
  console.log('Profiles fetched:', profiles?.map(p => ({ id: p.id, name: p.full_name, email: p.email })));

  // Step 4: Create a profile lookup map for fast access
  const profileMap = new Map();
  (profiles || []).forEach(profile => {
    profileMap.set(profile.id, profile);
  });

  console.log('Step 4: Created profile map with', profileMap.size, 'entries');

  // Step 5: Map participants with their profiles
  console.log('Step 5: Mapping participants with profiles...');
  const participantsWithProfiles = participants.map(participant => {
    const profile = profileMap.get(participant.profile_id);
    
    if (profile) {
      console.log(`✅ Participant ${participant.id} mapped to profile: ${profile.full_name || profile.email || profile.handle}`);
    } else {
      console.log(`❌ No profile found for participant ${participant.id} (profile_id: ${participant.profile_id})`);
    }

    return {
      ...participant,
      profile: profile || null
    };
  });

  console.log('=== FINAL RESULT ===');
  console.log(`Successfully mapped ${participantsWithProfiles.length} participants`);
  console.log('Participants with profiles:', participantsWithProfiles.filter(p => p.profile).length);
  console.log('Participants without profiles:', participantsWithProfiles.filter(p => !p.profile).length);

  return participantsWithProfiles;
}

export async function getEventWithParticipants(eventId: string): Promise<{ event: Event | null; participants: EventParticipant[] }> {
  const [event, participants] = await Promise.all([
    getEventById(eventId),
    getEventParticipants(eventId)
  ]);

  return { event, participants };
}