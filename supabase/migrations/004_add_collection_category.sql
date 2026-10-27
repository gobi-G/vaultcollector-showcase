-- Add category to collections
-- Run this in Supabase SQL Editor AFTER 003_add_locations.sql

alter table public.collections
  add column category text not null default 'tcg'
  check (category in ('tcg', 'lego', 'watch'));
