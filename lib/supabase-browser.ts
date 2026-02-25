import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Browser-side Supabase client using the public anon key
 * Safe for use in "use client" components — kept separate from
 * lib/supabase.ts to avoid pulling in server-only Clerk imports.
 */
export const createBrowserSupabaseClient = () =>
    createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    );
