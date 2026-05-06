CREATE TABLE food_log_entries (
  id bigserial primary key,
  user_id text not null,
  date date not null,
  food_name text not null,
  weight_g numeric not null,
  calories numeric not null,
  fat_g numeric not null,
  carbs_g numeric not null,
  protein_g numeric not null
);

CREATE INDEX food_log_entries_user_date_idx ON food_log_entries(user_id, date);

ALTER TABLE food_log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own entries" ON food_log_entries
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users insert own entries" ON food_log_entries
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users delete own entries" ON food_log_entries
  FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
