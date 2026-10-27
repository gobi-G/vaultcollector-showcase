-- Add hierarchical locations (Vault) system
-- Run this in Supabase SQL Editor AFTER 002_add_category_metadata.sql

-- ============================================
-- LOCATIONS (Vault — hierarchical, cross-category)
-- ============================================
create table public.locations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  parent_id uuid references public.locations(id) on delete cascade,
  icon text not null default 'box',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_locations_user_id on public.locations(user_id);
create index idx_locations_parent_id on public.locations(parent_id);

-- RLS: users can only CRUD their own locations
alter table public.locations enable row level security;

create policy "Users can view own locations"
  on public.locations for select
  using (auth.uid() = user_id);

create policy "Users can create own locations"
  on public.locations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own locations"
  on public.locations for update
  using (auth.uid() = user_id);

create policy "Users can delete own locations"
  on public.locations for delete
  using (auth.uid() = user_id);

-- Updated_at trigger
create trigger set_updated_at before update on public.locations
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- MIGRATE items.location (text) → items.location_id (FK)
-- ============================================
alter table public.items
  add column location_id uuid references public.locations(id) on delete set null;

create index idx_items_location_id on public.items(location_id);

-- Drop old text column
alter table public.items drop column if exists location;
