-- MacroFactor Explorer — initial schema
-- Run this in your Supabase SQL editor after provisioning

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

-- Each user can only have one entry per food name (per import)
create unique index if not exists foods_user_name_idx on foods (user_id, name);

-- Row-Level Security: users only see their own foods
alter table foods enable row level security;

create policy "Users see own foods" on foods
  for select using (auth.jwt() ->> 'sub' = user_id);

create policy "Users insert own foods" on foods
  for insert with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users delete own foods" on foods
  for delete using (auth.jwt() ->> 'sub' = user_id);
