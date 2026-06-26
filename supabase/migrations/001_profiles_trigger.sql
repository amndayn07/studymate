-- ============================================================
-- 1. Create the public.profiles table
-- ============================================================
create table if not exists public.profiles (
  id          uuid        not null primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- ============================================================
-- 2. Trigger function: insert a profile row on new user signup
-- ============================================================
-- security definer: runs as the postgres role so it can write to public.profiles
-- set search_path = public: prevents search-path injection attacks
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  return new;
end;
$$;

-- ============================================================
-- 3. Trigger: fires AFTER INSERT on auth.users
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
