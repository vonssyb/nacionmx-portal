-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (Users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  roblox_id text,
  full_name text,
  role text check (role in ('owner', 'co_owner', 'admin', 'board', 'moderator', 'developer')),
  avatar_url text,
  status text check (status in ('online', 'idle', 'dnd', 'offline')) default 'offline',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Activity Logs Table
create table activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text check (type in ('ban', 'warn', 'kick', 'ticket', 'patrol')) not null,
  target_username text not null,
  target_roblox_id text,
  reason text not null,
  evidence_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create BOLO (Be On Look Out) Table
create table bolos (
  id uuid default uuid_generate_v4() primary key,
  target_name text not null,
  target_image text,
  crimes text[] not null,
  status text check (status in ('wanted', 'captured', 'deceased')) default 'wanted',
  bounty text,
  last_seen text,
  reported_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create Applications Table
create table applications (
  id uuid default uuid_generate_v4() primary key,
  applicant_username text not null,
  applicant_discord_id text,
  type text check (type in ('whitelist', 'police', 'ems', 'unban', 'staff')) not null,
  content jsonb not null, -- Stores application answers
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  reviewer_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  reviewed_at timestamp with time zone
);

-- 5. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table activity_logs enable row level security;
alter table bolos enable row level security;
alter table applications enable row level security;

-- 6. RLS Policies

-- PROFILES
-- Everyone can read profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- ACTIVITY LOGS
-- Authenticated staff can read all logs
create policy "Staff can view all logs"
  on activity_logs for select
  using ( auth.role() = 'authenticated' );

-- Authenticated staff can create logs
create policy "Staff can create logs"
  on activity_logs for insert
  with check ( auth.role() = 'authenticated' );

-- BOLOS
-- Authenticated staff can read BOLOs
create policy "Staff can view BOLOs"
  on bolos for select
  using ( auth.role() = 'authenticated' );

-- Admins and Moderators can manage BOLOs
create policy "Staff can manage BOLOs"
  on bolos for all
  using ( auth.role() = 'authenticated' );

-- APPLICATIONS
-- Authenticated staff can view applications
create policy "Staff can view applications"
  on applications for select
  using ( auth.role() = 'authenticated' );

-- High command (Owner, Admin, Board) can update applications
-- Note: Simplified for basic setup. Ideally needs custom claim or joined table check.
create policy "Staff can update applications"
  on applications for update
  using ( auth.role() = 'authenticated' );

-- 7. Functions & Triggers

-- Handle New User (Auto-profile creation on signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, username)
  values (new.id, new.email, 'moderator', new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
