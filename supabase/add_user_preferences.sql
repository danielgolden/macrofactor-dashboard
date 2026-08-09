-- MacroFactor Explorer — user preferences
-- Run this in your Supabase SQL editor after add_chat_messages.sql

create table if not exists user_preferences (
  user_id    text primary key,                       -- Clerk user ID
  theme      text not null default 'system' check (theme in ('light', 'dark', 'system')),
  updated_at timestamptz not null default now()
);

-- Row-Level Security: users only see their own preferences
alter table user_preferences enable row level security;

create policy "Users see own preferences" on user_preferences
  for select using (auth.jwt() ->> 'sub' = user_id);

create policy "Users upsert own preferences" on user_preferences
  for insert with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users update own preferences" on user_preferences
  for update using (auth.jwt() ->> 'sub' = user_id);
