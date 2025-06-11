create table profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table profiles enable row level security;

-- Create trigger to automatically update updated_at
create trigger handle_updated_at before update on profiles
  for each row execute function moddatetime();

-- Add RLS policy for public read access
create policy "Users can view their own profile"
  on profiles
  for select
  using (auth.uid() = id);
