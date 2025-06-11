create or replace function moddatetime()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;