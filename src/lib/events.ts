import { Event, EventFormData } from '@/types/events';

export function generateEventSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

export function formatEventDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatEventTime(timeString?: string): string {
  if (!timeString) return '';
  return timeString;
}

export function isEventActive(event: Event): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  
  return event.status === 'active' && 
         startDate <= now && 
         (!endDate || endDate >= now);
}

export function isEventUpcoming(event: Event): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);
  
  return event.status === 'scheduled' && startDate > now;
}

export function validateEventFormData(data: EventFormData): string[] {
  const errors: string[] = [];
  
  if (!data.name.trim()) {
    errors.push('Event name is required');
  }
  
  if (!data.start_date) {
    errors.push('Start date is required');
  }
  
  if (data.end_date && new Date(data.end_date) <= new Date(data.start_date)) {
    errors.push('End date must be after start date');
  }
  
  if (data.status && !['draft', 'scheduled', 'active', 'ended'].includes(data.status)) {
    errors.push('Invalid status');
  }
  
  return errors;
}

export function getEventDataValue(event: Event, key: string): unknown {
  return event.data?.[key];
}

export function setEventDataValue(event: Event, key: string, value: unknown): Event {
  return {
    ...event,
    data: {
      ...event.data,
      [key]: value
    }
  };
}

export function removeEventDataValue(event: Event, key: string): Event {
  if (!event.data) return event;
  
  const newData = { ...event.data };
  delete newData[key];
  
  return {
    ...event,
    data: Object.keys(newData).length > 0 ? newData : undefined
  };
}

export function hasEventDataValue(event: Event, key: string): boolean {
  return Boolean(event.data && key in event.data);
}

export function getEventDataKeys(event: Event): string[] {
  return event.data ? Object.keys(event.data) : [];
}

// Timezone-aware datetime utilities
export function getLocalDateTimeString(date: Date): string {
  // Convert to local timezone and format for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function parseLocalDateTimeString(dateTimeString: string): Date {
  // Parse datetime-local input (which is in local timezone) and return a Date object
  return new Date(dateTimeString);
}

export function formatDateTimeForDatabase(dateTimeString: string): string {
  // Convert local datetime string to ISO string for database storage
  const localDate = parseLocalDateTimeString(dateTimeString);
  return localDate.toISOString();
}

export function formatDateTimeForInput(isoString: string): string {
  // Convert ISO string from database to local datetime string for input fields
  const date = new Date(isoString);
  return getLocalDateTimeString(date);
}

export function getCurrentLocalDateTimeString(): string {
  // Get current date and time in local timezone for datetime-local input
  return getLocalDateTimeString(new Date());
}

export function validateEventDates(startDate: string, endDate?: string): string[] {
  const errors: string[] = [];
  
  if (!startDate) {
    errors.push('Start date is required');
    return errors;
  }

  const start = parseLocalDateTimeString(startDate);
  // const now = new Date();
  
  // // Allow events to be created up to 1 hour in the past (for editing purposes)
  // const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  // if (start < oneHourAgo) {
  //   errors.push('Start date cannot be more than 1 hour in the past');
  // }

  if (endDate) {
    const end = parseLocalDateTimeString(endDate);
    
    if (end <= start) {
      errors.push('End date must be after start date');
    }
  }
  
  return errors;
} 