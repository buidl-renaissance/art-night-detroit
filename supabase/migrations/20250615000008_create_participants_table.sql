-- Create participants table for QR code ticket claiming
create table participants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text not null,
  instagram text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create ticket_claims table to link participants to tickets
create table ticket_claims (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references participants(id) not null,
  ticket_id uuid references tickets(id) not null,
  claimed_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(ticket_id) -- Each ticket can only be claimed once
);

-- Create qr_code_sessions table for admin-generated QR codes
create table qr_code_sessions (
  id uuid default gen_random_uuid() primary key,
  raffle_id uuid references raffles(id) not null,
  admin_id uuid references auth.users(id) not null,
  ticket_count integer not null,
  session_code text not null unique,
  is_active boolean default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table participants enable row level security;
alter table ticket_claims enable row level security;
alter table qr_code_sessions enable row level security;

-- Create triggers to automatically update updated_at
create trigger handle_updated_at before update on participants
  for each row execute function moddatetime();

create trigger handle_updated_at before update on ticket_claims
  for each row execute function moddatetime();

create trigger handle_updated_at before update on qr_code_sessions
  for each row execute function moddatetime();

-- RLS Policies for participants (allow public read/write for claiming)
create policy "Allow public insert on participants" on participants
  for insert with check (true);

create policy "Allow public select on participants" on participants
  for select using (true);

-- RLS Policies for ticket_claims (allow public read/write for claiming)
create policy "Allow public insert on ticket_claims" on ticket_claims
  for insert with check (true);

create policy "Allow public select on ticket_claims" on ticket_claims
  for select using (true);

-- RLS Policies for qr_code_sessions (admin only)
create policy "Allow admin insert on qr_code_sessions" on qr_code_sessions
  for insert with check (auth.uid() in (
    select id from profiles where is_admin = true
  ));

create policy "Allow admin select on qr_code_sessions" on qr_code_sessions
  for select using (auth.uid() in (
    select id from profiles where is_admin = true
  ));

create policy "Allow public select on qr_code_sessions" on qr_code_sessions
  for select using (true); 