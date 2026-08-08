import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client — uses anon key, respects RLS
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client — uses service role key, bypasses RLS (API routes only)
// Singleton: reuses connection pool across requests
let _serverClient: SupabaseClient | null = null;

export function createServerClient() {
  if (!_serverClient) {
    _serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _serverClient;
}
