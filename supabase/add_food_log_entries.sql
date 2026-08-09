CREATE TABLE food_log_entries (
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

CREATE INDEX food_log_entries_user_date_idx ON food_log_entries(user_id, date);

-- Index for fast dedup lookups: "which of this user's hashes already exist?"
CREATE INDEX food_log_entries_user_hash_idx ON food_log_entries(user_id, row_hash);

ALTER TABLE food_log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own entries" ON food_log_entries
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users insert own entries" ON food_log_entries
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users delete own entries" ON food_log_entries
  FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
