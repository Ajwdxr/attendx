-- ============================================================
-- AttendX — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles Table (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  avatar_url text,
  role text not null default 'employee' check (role in ('employee', 'admin')),
  face_descriptor jsonb, -- Array of 128 floats for face-api.js
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Use a security definer function to avoid recursion in RLS
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$ language sql security definer;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Locations Table
-- ============================================================
create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  radius double precision not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.locations enable row level security;

-- Locations policies
create policy "Anyone authenticated can view active locations"
  on public.locations for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage locations"
  on public.locations for all
  using (public.is_admin(auth.uid()));

-- ============================================================
-- Attendance Table
-- ============================================================
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null check (type in ('check_in', 'check_out')),
  method text not null check (method in ('face', 'location', 'manual', 'combined')),
  latitude double precision,
  longitude double precision,
  location_id uuid references public.locations,
  face_match_score double precision,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.attendance enable row level security;

-- Attendance policies
create policy "Users can view their own attendance"
  on public.attendance for select
  using (auth.uid() = user_id);

create policy "Users can insert their own attendance"
  on public.attendance for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all attendance"
  on public.attendance for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update attendance"
  on public.attendance for update
  using (public.is_admin(auth.uid()));

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_attendance_user_id on public.attendance(user_id);
create index if not exists idx_attendance_created_at on public.attendance(created_at desc);
create index if not exists idx_attendance_user_date on public.attendance(user_id, created_at desc);
create index if not exists idx_locations_active on public.locations(is_active);

-- ============================================================
-- Sample data (optional)
-- ============================================================
-- Insert a sample location
insert into public.locations (name, address, latitude, longitude, radius)
values 
  ('Main Office', '123 Business Avenue, KL', 3.1390, 101.6869, 100),
  ('Branch Office', '456 Tech Park, PJ', 3.1070, 101.6068, 150);
