import { createClient } from '@supabase/supabase-js';
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/types/supabase";


export const createClerkSupabaseClient = async () => {
    const { getToken } = await auth();

    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            global: {
                fetch: async (url, options = {}) => {
                    const clerkToken = await getToken({ template: "supabase" });

                    const headers = new Headers(options?.headers);

                    if (clerkToken) {
                        headers.set("Authorization", `Bearer ${clerkToken}`);
                    }

                    return fetch(url, {
                        ...options,
                        headers,
                    });
                },
            },
        }
    );
};

/**
 * Server-side Supabase client using the anon key
 * Use for reading public / non-RLS-protected tables
 */
export const createServerSupabaseClient = () =>
    createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    );