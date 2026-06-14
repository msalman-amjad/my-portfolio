// Supabase client — reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseClient() {
  // ── HARDCODE BYPASS TEST ──────────────────────────────────────────────────
  // env-var lines commented out to bypass Vite cache during 401 debugging.
  // const SUPABASE_URL =
  //   import.meta.env.VITE_SUPABASE_URL ||
  //   (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined);
  // const SUPABASE_KEY =
  //   import.meta.env.VITE_SUPABASE_ANON_KEY ||
  //   import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  //   (typeof process !== 'undefined'
  //     ? process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY
  //     : undefined);

  const SUPABASE_URL = "https://fpkwtudvgiwcojuykkmm.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwa3d0dWR2Z2l3Y29qdXlra21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDE0OTAsImV4cCI6MjA5NjkxNzQ5MH0.ApH9rsFAVh0V3o1Mw7y_aqVTGbmk5fbKfS6ZLw7NUs4";
  // ─────────────────────────────────────────────────────────────────────────


  try {
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: typeof window !== "undefined" ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return client;
  } catch (err) {
    console.error("[Supabase] createClient threw:", err);
    throw err;
  }
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
