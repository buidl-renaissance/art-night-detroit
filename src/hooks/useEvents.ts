import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Event, EventFormData } from '@/types/events';
import { 
  generateEventSlug, 
  validateEventFormData, 
  formatDateTimeForDatabase, 
  validateEventDates 
} from '@/lib/events';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  createEvent: (data: EventFormData) => Promise<Event | null>;
  updateEvent: (id: string, data: EventFormData) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  fetchEvents: () => Promise<void>;
  fetchEvent: (id: string) => Promise<Event | null>;
  fetchNextEvent: () => Promise<Event | null>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;
      
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchEvent = useCallback(async (id: string): Promise<Event | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
      return null;
    }
  }, [supabase]);

  const fetchNextEvent = useCallback(async (): Promise<Event | null> => {
    try {
      const now = new Date().toISOString();
      
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .gte('end_date', now)
        .order('end_date', { ascending: true })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch next event');
      return null;
    }
  }, [supabase]);

  const createEvent = async (data: EventFormData): Promise<Event | null> => {
    try {
      setError(null);
      
      // Validate form data
      const errors = validateEventFormData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Validate dates
      const dateErrors = validateEventDates(data.start_date, data.end_date);
      if (dateErrors.length > 0) {
        throw new Error(dateErrors.join(', '));
      }

      // Generate slug if not provided
      const eventData = {
        ...data,
        slug: data.name ? generateEventSlug(data.name) : undefined,
        start_date: formatDateTimeForDatabase(data.start_date),
        end_date: data.end_date ? formatDateTimeForDatabase(data.end_date) : null
      };

      const { data: newEvent, error: createError } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (createError) throw createError;
      
      // Refresh events list
      await fetchEvents();
      
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      return null;
    }
  };

  const updateEvent = async (id: string, data: EventFormData): Promise<boolean> => {
    try {
      setError(null);
      
      // Validate form data
      const errors = validateEventFormData(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Validate dates
      const dateErrors = validateEventDates(data.start_date, data.end_date);
      if (dateErrors.length > 0) {
        throw new Error(dateErrors.join(', '));
      }

      // Generate slug if name changed
      const eventData = {
        ...data,
        slug: data.name ? generateEventSlug(data.name) : undefined,
        start_date: formatDateTimeForDatabase(data.start_date),
        end_date: data.end_date ? formatDateTimeForDatabase(data.end_date) : null
      };

      const { error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Refresh events list
      await fetchEvents();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Refresh events list
      await fetchEvents();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    fetchEvent,
    fetchNextEvent
  };
} 