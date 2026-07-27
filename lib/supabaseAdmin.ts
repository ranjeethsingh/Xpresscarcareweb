import { createClient } from "@supabase/supabase-js";

// This client uses the SERVICE ROLE key — full access, bypasses RLS.
// NEVER import this file in a client component or anything with "use client".
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // your existing project URL, safe to reuse
  process.env.SUPABASE_SERVICE_ROLE_KEY! // the new secret key, server-only
);