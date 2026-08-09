-- MacroFactor Explorer — chat message history
-- Run this in your Supabase SQL editor after add_food_log_entries.sql

create table if not exists chat_messages (
  id          bigint generated always as identity primary key,
  user_id     text not null,                      -- Clerk user ID
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx on chat_messages (user_id, created_at);

-- Row-Level Security: users only see their own chat history
alter table chat_messages enable row level security;

create policy "Users see own chat messages" on chat_messages
  for select using (auth.jwt() ->> 'sub' = user_id);

create policy "Users insert own chat messages" on chat_messages
  for insert with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users delete own chat messages" on chat_messages
  for delete using (auth.jwt() ->> 'sub' = user_id);