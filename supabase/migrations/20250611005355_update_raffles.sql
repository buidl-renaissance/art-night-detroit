-- Update raffles table to match new requirements
alter table raffles
  add column created_by uuid references auth.users(id);

alter table raffles
  drop constraint if exists raffles_status_check;

alter table raffles  
  add constraint raffles_status_check check (status in ('draft', 'active', 'ended'));

-- Add RLS policies for admin access
create policy "Admins can do everything"
  on raffles
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Add RLS policies for public read access
create policy "Anyone can view active raffles"
  on raffles
  for select
  using (status = 'active');

-- Add RLS policies for ticket holders
create policy "Users can view their own raffle tickets"
  on raffles
  for select
  using (
    exists (
      select 1 from tickets
      where tickets.raffle_id = raffles.id
      and tickets.user_id = auth.uid()
    )
  );