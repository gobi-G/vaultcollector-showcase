-- VaultCollector Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'premium', 'pro')),
  language text not null default 'en' check (language in ('en', 'de', 'fr', 'es')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- COLLECTIONS
-- ============================================
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_collections_user_id on public.collections(user_id);

-- ============================================
-- ITEMS
-- ============================================
create table public.items (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references public.collections(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  card_api_id text,
  name text not null,
  set_name text,
  condition text not null default 'near_mint' check (condition in ('mint', 'near_mint', 'played', 'damaged')),
  location text,
  purchase_price decimal(10, 2),
  current_market_price decimal(10, 2),
  image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_items_collection_id on public.items(collection_id);
create index idx_items_user_id on public.items(user_id);
create index idx_items_card_api_id on public.items(card_api_id);

-- ============================================
-- PRICE HISTORY
-- ============================================
create table public.price_history (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references public.items(id) on delete cascade not null,
  price decimal(10, 2) not null,
  source text not null check (source in ('tcgplayer', 'cardmarket', 'ebay')),
  recorded_at timestamptz not null default now()
);

create index idx_price_history_item_id on public.price_history(item_id);
create index idx_price_history_recorded_at on public.price_history(recorded_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles: users can only read/update their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Collections: users can only CRUD their own collections
alter table public.collections enable row level security;

create policy "Users can view own collections"
  on public.collections for select
  using (auth.uid() = user_id);

create policy "Users can create own collections"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own collections"
  on public.collections for update
  using (auth.uid() = user_id);

create policy "Users can delete own collections"
  on public.collections for delete
  using (auth.uid() = user_id);

-- Items: users can only CRUD their own items
alter table public.items enable row level security;

create policy "Users can view own items"
  on public.items for select
  using (auth.uid() = user_id);

create policy "Users can create own items"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on public.items for update
  using (auth.uid() = user_id);

create policy "Users can delete own items"
  on public.items for delete
  using (auth.uid() = user_id);

-- Price History: users can view price history for their items
alter table public.price_history enable row level security;

create policy "Users can view price history for own items"
  on public.price_history for select
  using (
    exists (
      select 1 from public.items
      where items.id = price_history.item_id
      and items.user_id = auth.uid()
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.collections
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.items
  for each row execute procedure public.handle_updated_at();
