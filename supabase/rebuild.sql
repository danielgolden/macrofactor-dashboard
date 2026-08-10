-- MacroFactor Explorer — consolidated rebuild
-- Run this ONCE in the Supabase SQL Editor against a fresh (empty) project.
-- Rebuilds the full schema after the previous project was deleted.
--
-- Tables: foods, food_log_entries (with row_hash), chat_messages
-- Idempotent: safe to re-run. No data is dropped.
-- No pgcrypto needed: row_hash is computed in the app (src/lib/transformFoodLog.ts),
-- not in SQL, so no backfill / extension is required for a clean project.
-- RLS policies are kept as defense-in-depth, but the app's API routes use the
-- service role key (bypasses RLS); user_id comes from Clerk's auth() server-side.

-- ─────────────────────────────────────────────────────────────────────────────
-- foods — aggregated per-user food view (derived from food_log_entries)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists foods (
  id          bigint generated always as identity primary key,
  user_id     text not null,                      -- Clerk user ID
  name        text not null,
  cal_density numeric(6,2) not null,
  times_eaten integer not null default 0,
  total_weight numeric(10,1) not null default 0,
  total_calories integer not null default 0,
  protein_per_100g numeric(6,1) not null default 0,
  fat_per_100g numeric(6,1) not null default 0,
  carb_per_100g numeric(6,1) not null default 0,
  protein_pct numeric(5,1) not null default 0,
  fat_pct numeric(5,1) not null default 0,
  carb_pct numeric(5,1) not null default 0,
  category text not null default 'mixed',
  zone text not null default 'medium',
  avg_portion numeric(8,1) not null default 0,
  impact_score numeric(10,0) not null default 0,
  imported_at timestamptz not null default now()
);

-- Each user can only have one entry per food name
create unique index if not exists foods_user_name_idx on foods (user_id, name);

alter table foods enable row level security;

drop policy if exists "Users see own foods" on foods;
create policy "Users see own foods" on foods
  for select using (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users insert own foods" on foods;
create policy "Users insert own foods" on foods
  for insert with check (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users delete own foods" on foods;
create policy "Users delete own foods" on foods
  for delete using (auth.jwt() ->> 'sub' = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- food_log_entries — raw imported log rows (source of truth)
-- row_hash included by default (PR #30): SHA-256 of (date|food_name|weight_g|
-- calories|fat_g|carbs_g|protein_g), used to dedup merges across re-imports.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists food_log_entries (
  id bigserial primary key,
  user_id text not null,
  date date not null,
  food_name text not null,
  weight_g numeric not null,
  calories numeric not null,
  fat_g numeric not null,
  carbs_g numeric not null,
  protein_g numeric not null,
  -- SHA-256 hash of row content (date|food_name|weight_g|calories|fat_g|carbs_g|protein_g).
  -- Used for deduplication when merging imports: re-importing the same file
  -- (or an overlapping all-time export) produces identical hashes, so only
  -- genuinely new entries are inserted.
  row_hash text
);

create index if not exists food_log_entries_user_date_idx on food_log_entries(user_id, date);

-- Index for fast dedup lookups: "which of this user's hashes already exist?"
create index if not exists food_log_entries_user_hash_idx on food_log_entries(user_id, row_hash);

alter table food_log_entries enable row level security;

drop policy if exists "Users see own entries" on food_log_entries;
create policy "Users see own entries" on food_log_entries
  for select using (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users insert own entries" on food_log_entries;
create policy "Users insert own entries" on food_log_entries
  for insert with check (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users delete own entries" on food_log_entries;
create policy "Users delete own entries" on food_log_entries
  for delete using (auth.jwt() ->> 'sub' = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- chat_messages — per-user LLM chat history
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists chat_messages (
  id          bigint generated always as identity primary key,
  user_id     text not null,                      -- Clerk user ID
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx on chat_messages (user_id, created_at);

alter table chat_messages enable row level security;

drop policy if exists "Users see own chat messages" on chat_messages;
create policy "Users see own chat messages" on chat_messages
  for select using (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users insert own chat messages" on chat_messages;
create policy "Users insert own chat messages" on chat_messages
  for insert with check (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users delete own chat messages" on chat_messages;
create policy "Users delete own chat messages" on chat_messages
  for delete using (auth.jwt() ->> 'sub' = user_id);
