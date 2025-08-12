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

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  console.log('=== DEBUGGING EVENT PARTICIPANTS ===');
  console.log('Fetching participants for event:', eventId);
  console.log('Event ID type:', typeof eventId);
  
  // Check Supabase configuration
  console.log('Supabase client check:');
  console.log('- URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('- Client exists:', !!supabase);
  
  // First test basic database connectivity
  try {
    console.log('Testing basic database connection...');
    const { data: testData, error: testError } = await supabase
      .from('event_participants')
      .select('*')
      .limit(1);
    
    console.log('Basic DB test result:', { testData, testError });
    
    if (testError) {
      console.error('Basic database connection failed:', testError);
      return [];
    }
  } catch (dbError) {
    console.error('Database connection exception:', dbError);
    return [];
  }

  // Test if the event exists
  console.log('Testing if event exists...');
  const { data: eventTest, error: eventError } = await supabase
    .from('events')
    .select('id, name')
    .eq('id', eventId)
    .single();
  
  console.log('Event existence test:', { eventTest, eventError });

  // Get participants without join first
  console.log('Getting participants without join...');
  const { data: basicParticipants, error: basicError } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId);

  console.log('Basic participants query:', { basicParticipants, basicError });

  if (basicError) {
    console.error('Basic participants query failed:', basicError);
    return [];
  }

  if (!basicParticipants || basicParticipants.length === 0) {
    console.log('No participants found for event:', eventId);
    return [];
  }

  // Test if the specific profile exists
  const profileIds = basicParticipants.map(p => p.profile_id).filter(Boolean);
  console.log('Testing if profiles exist for IDs:', profileIds);
  
  const { data: profileCheck, error: profileCheckError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', profileIds);
  
  console.log('Profile existence check:', { profileCheck, profileCheckError });
  console.log('Profile check - full data:', JSON.stringify(profileCheck, null, 2));
  
  if (profileCheckError) {
    console.error('⚠️  ERROR: Failed to query profiles table:', profileCheckError);
    console.error('This suggests a database schema issue');
  } else if (profileCheck && profileCheck.length === 0) {
    console.warn('⚠️  PROBLEM: No profiles found for the participant profile IDs!');
    console.warn('This means the profile_id in event_participants points to non-existent profiles');
    
    // Let's also try to see what profiles DO exist
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, handle')
      .limit(5);
    
    console.log('Sample of existing profiles:', { allProfiles, allProfilesError });
  } else {
    console.log('✅ Found profiles! The issue is with the join syntax.');
  }

  // Try multiple relational query approaches
  console.log('Attempting relational query with explicit foreign key...');
  
  // First try with explicit foreign key reference
  let { data, error } = await supabase
    .from('event_participants')
    .select(`
      id,
      event_id,
      profile_id,
      role,
      created_at,
      updated_at,
      profile:profiles!profile_id (
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
      )
    `)
    .eq('event_id', eventId)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });

  console.log('Explicit FK query result:', { data, error });

  // If that fails, try with inner join
  if (error || !data || (data as any[]).every((p: any) => !p.profile)) {
    console.log('Trying with inner join syntax...');
    
    const result2 = await supabase
      .from('event_participants')
      .select(`
        id,
        event_id,
        profile_id,
        role,
        created_at,
        updated_at,
        profiles!inner (
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
        )
      `)
      .eq('event_id', eventId)
      .order('role', { ascending: true })
      .order('created_at', { ascending: true });

    console.log('Inner join query result:', { data: result2.data, error: result2.error });
    
    if (!error) {
      data = result2.data as any;
      error = result2.error;
    }
  }

  // If both fail, try the basic syntax again
  if (error || !data || (data as any[]).every((p: any) => !p.profile && !p.profiles)) {
    console.log('Trying basic profiles syntax...');
    
    const result3 = await supabase
      .from('event_participants')
      .select(`
        id,
        event_id,
        profile_id,
        role,
        created_at,
        updated_at,
        profiles (
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
        )
      `)
      .eq('event_id', eventId)
      .order('role', { ascending: true })
      .order('created_at', { ascending: true });

    console.log('Basic profiles query result:', { data: result3.data, error: result3.error });
    
    if (!error) {
      data = result3.data as any;
      error = result3.error;
    }
  }

  console.log('Relational query result:', { data, error });
  
  if (error) {
    console.error('Error fetching event participants with profiles:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
    
    // Fallback to basic participants without profiles
    console.log('Falling back to basic participants...');
    return basicParticipants.map(p => ({ ...p, profile: null }));
  }

  if (!data || data.length === 0) {
    console.log('No data returned from relational query');
    
    // Use the basic participants we already fetched
    console.log('Using basic participants without profiles...');
    return basicParticipants.map(p => ({ ...p, profile: null }));
  }

  console.log('Raw data structure analysis:');
  data.forEach((participant: any, index: number) => {
    console.log(`Participant ${index}:`, {
      id: participant.id,
      profile_id: participant.profile_id,
      has_profile_field: 'profile' in participant,
      has_profiles_field: 'profiles' in participant,
      profile_type: typeof participant.profile,
      profiles_field: typeof participant.profiles,
      profiles_isArray: Array.isArray(participant.profiles),
      profiles_value: participant.profiles,
      profiles_length: Array.isArray(participant.profiles) ? participant.profiles.length : 'N/A'
    });
  });

  // Map the result to ensure profile is a single object (not array)
  const participants = data.map((participant: any) => {
    let profile;
    
    // Check for profile field first (from explicit FK queries)
    if (participant.profile && typeof participant.profile === 'object') {
      profile = participant.profile;
      console.log(`Direct profile for ${participant.id}: found profile object`);
    }
    // Then check for profiles field (from basic queries)
    else if (Array.isArray(participant.profiles)) {
      profile = participant.profiles.length > 0 ? participant.profiles[0] : undefined;
      console.log(`Array profiles for ${participant.id}: found ${participant.profiles.length} profiles`);
    } else if (participant.profiles && typeof participant.profiles === 'object') {
      profile = participant.profiles;
      console.log(`Object profiles for ${participant.id}: found profile object`);
    } else {
      profile = undefined;
      console.log(`No profile for ${participant.id}: profile=${typeof participant.profile}, profiles=${typeof participant.profiles}`);
    }

    // Return clean participant object
    return {
      id: participant.id,
      event_id: participant.event_id,
      profile_id: participant.profile_id,
      role: participant.role,
      created_at: participant.created_at,
      updated_at: participant.updated_at,
      profile: profile || null
    };
  });

  console.log('=== FINAL MAPPED PARTICIPANTS ===');
  console.log(JSON.stringify(participants, null, 2));

  return participants;
}

export async function getEventWithParticipants(eventId: string): Promise<{ event: Event | null; participants: EventParticipant[] }> {
  const [event, participants] = await Promise.all([
    getEventById(eventId),
    getEventParticipants(eventId)
  ]);

  return { event, participants };
}