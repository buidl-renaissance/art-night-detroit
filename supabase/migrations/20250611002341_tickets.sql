create table tickets (
  id uuid default gen_random_uuid() primary key,
  raffle_id uuid references raffles(id),
  user_id uuid references auth.users(id),
  ticket_number integer not null,
  purchased_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table tickets enable row level security;

-- Create trigger to automatically update updated_at
create trigger handle_updated_at before update on tickets
  for each row execute function moddatetime();
