create table raffles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  slug text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  price_per_ticket numeric(10,2) not null,
  max_tickets integer not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  winner_id uuid references auth.users(id),
  status text not null check (status in ('active', 'completed', 'cancelled'))
);

-- Add RLS policies
alter table raffles enable row level security;

-- Create trigger to automatically update updated_at
create trigger handle_updated_at before update on raffles
  for each row execute procedure moddatetime (updated_at);
