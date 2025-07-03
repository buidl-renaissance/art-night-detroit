import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Get event details including attendance limit
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, attendance_limit')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get RSVP counts by status
    const { data: rsvpStats, error: statsError } = await supabase
      .from('rsvps')
      .select('status, attended_at')
      .eq('event_id', eventId);

    if (statsError) {
      console.error('Error fetching RSVP stats:', statsError);
      return res.status(500).json({ error: 'Failed to fetch RSVP statistics' });
    }

    // Calculate counts by status
    const confirmedCount = rsvpStats?.filter(r => r.status === 'confirmed').length || 0;
    const waitlistedCount = rsvpStats?.filter(r => r.status === 'waitlisted').length || 0;
    const rejectedCount = rsvpStats?.filter(r => r.status === 'rejected').length || 0;
    const canceledCount = rsvpStats?.filter(r => r.status === 'canceled').length || 0;
    const totalCount = rsvpStats?.length || 0;

    // Calculate attendance counts
    const attendedCount = rsvpStats?.filter(r => r.attended_at).length || 0;
    const confirmedAttendedCount = rsvpStats?.filter(r => r.status === 'confirmed' && r.attended_at).length || 0;

    // Calculate remaining spots
    const remainingSpots = event.attendance_limit 
      ? Math.max(0, event.attendance_limit - confirmedCount)
      : null;

    return res.status(200).json({
      success: true,
      stats: {
        event: {
          id: event.id,
          name: event.name,
          attendance_limit: event.attendance_limit,
          remaining_spots: remainingSpots
        },
        counts: {
          confirmed: confirmedCount,
          waitlisted: waitlistedCount,
          rejected: rejectedCount,
          canceled: canceledCount,
          total: totalCount,
          attended: attendedCount,
          confirmed_attended: confirmedAttendedCount
        }
      }
    });

  } catch (error) {
    console.error('RSVP stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 