-- Add category and metadata support to items
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql

-- ============================================
-- ADD CATEGORY + METADATA TO ITEMS
-- ============================================

-- Add category column (discriminator for collection types)
alter table public.items
  add column category text not null default 'tcg'
  check (category in ('tcg', 'lego', 'watch'));

-- Add metadata column (category-specific fields as JSONB)
alter table public.items
  add column metadata jsonb not null default '{}';

-- Remove TCG-specific columns (now in metadata)
alter table public.items drop column if exists card_api_id;
alter table public.items drop column if exists set_name;

-- Index for category filtering
create index idx_items_category on public.items(category);

-- GIN index for metadata queries (e.g. search by set_name, rarity)
create index idx_items_metadata on public.items using gin(metadata);
