-- MacroFactor Explorer — user preferences
-- Run this in your Supabase SQL editor after rebuild.sql (or add_chat_messages.sql)
--
-- Stores per-user theme preference (light/dark/system) so it syncs across devices.
-- RLS policies are kept as defense-in-depth, but the app's API routes use the
-- service role key (bypasses RLS); user_id comes from Clerk's auth() server-side.
-- Follows the same idempotent pattern as rebuild.sql: drop policy before create.

create table if not exists user_preferences (
  user_id    text primary key,                       -- Clerk user ID
  theme      text not null default 'system' check (theme in ('light', 'dark', 'system')),
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

drop policy if exists "Users see own preferences" on user_preferences;
create policy "Users see own preferences" on user_preferences
  for select using (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users upsert own preferences" on user_preferences;
create policy "Users upsert own preferences" on user_preferences
  for insert with check (auth.jwt() ->> 'sub' = user_id);

drop policy if exists "Users update own preferences" on user_preferences;
create policy "Users update own preferences" on user_preferences
  for update using (auth.jwt() ->> 'sub' = user_id);
