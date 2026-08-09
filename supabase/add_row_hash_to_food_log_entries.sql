-- Migration: add row_hash column to food_log_entries
-- Date: 2026-08-09
-- Issue: #14 — persist and merge imported data across multiple imports
--
-- The import route now merges new entries with existing data instead of
-- replacing them. To deduplicate re-imports, each row carries a SHA-256 hash
-- of its content (date|food_name|weight_g|calories|fat_g|carbs_g|protein_g).
-- Before inserting, existing hashes for the user are queried and only
-- entries whose hash is not already present are inserted.
--
-- Run this against an existing Supabase project that already has the
-- food_log_entries table (created by add_food_log_entries.sql). New projects
-- get the column directly from the updated add_food_log_entries.sql.

ALTER TABLE food_log_entries ADD COLUMN IF NOT EXISTS row_hash text;

-- Index for fast dedup lookups: "which of this user's hashes already exist?"
CREATE INDEX IF NOT EXISTS food_log_entries_user_hash_idx
  ON food_log_entries(user_id, row_hash);

-- Backfill row_hash for any pre-existing rows that don't have one yet,
-- using the SAME SHA-256 algorithm the application uses (crypto.createHash
-- in src/lib/transformFoodLog.ts) so legacy rows dedup correctly against
-- re-imports. Requires the pgcrypto extension.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE food_log_entries
SET row_hash = encode(
  digest(
    date::text || '|' ||
    food_name || '|' ||
    weight_g::text || '|' ||
    calories::text || '|' ||
    fat_g::text || '|' ||
    carbs_g::text || '|' ||
    protein_g::text,
    'sha256'
  ),
  'hex'
)
WHERE row_hash IS NULL;
