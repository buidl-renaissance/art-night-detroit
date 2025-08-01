-- Create ticket_submissions table
create table ticket_submissions (
  id uuid default gen_random_uuid() primary key,
  raffle_artist_id uuid references raffle_artists(id) not null,
  ticket_id uuid references tickets(id) not null,
  submitted_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(ticket_id) -- Each ticket can only be submitted once
);

-- Add RLS policies
alter table ticket_submissions enable row level security;

-- Create trigger to automatically update updated_at
create trigger handle_updated_at before update on ticket_submissions
  for each row execute function moddatetime();

-- RLS Policies for ticket_submissions (allow public read/write for submissions)
create policy "Allow public insert on ticket_submissions" on ticket_submissions
  for insert with check (true);

create policy "Allow public select on ticket_submissions" on ticket_submissions
  for select using (true); 