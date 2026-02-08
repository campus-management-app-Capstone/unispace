// connect to Supabase with Clerk authentication
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const createClerkSupabaseClient = async () => {
    // get token from clerk customize for supabase
    const { getToken } = await auth();

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            // insert the Clerk token in each request to Supabase
            global: {
                // Get the Supabase token with a custom template
                fetch: async (url, options = {}) => {
                    const clerkToken = await getToken({ template: "supabase" });

                    // get header
                    const headers = new Headers(options?.headers);
                    // set authorization to clerk token
                    headers.set("Authorization", `Bearer ${clerkToken}`);

                    return fetch(url, {
                        ...options,
                        headers,
                    });
                },
            },
        }
    );
};

// use: 
// import { createClerkSupabaseClient } from "@/lib/supabase"; // 1. Import
// import { auth } from "@clerk/nextjs/server";

// export default async function WalletPage() {
//     // STEP 1: Initialize the "Special" Client
//     const supabase = await createClerkSupabaseClient();

//     // STEP 2: Get the current User ID
//     const { userId } = await auth();

//     if (!userId) return <div>Please sign in to view your wallet.</div>;

//     // STEP 3: Run the Query
//     // Because we used 'createClerkSupabaseClient', this request
//     // automatically includes the Authorization header.
//     const { data: wallet, error } = await supabase
//         .from("Wallet")       
//         .select("*")          
//         .eq("UserID", userId) // Filter: "Where UserID equals the logged-in user"
//         .single();            // We expect exactly 1 result

//     // STEP 4: Handle Errors
//     if (error) {
//         console.error("Error fetching wallet:", error);
//         return <div>Error loading wallet data.</div>;
//     }

//     // STEP 5: Render Data
//     return (
//         <div className="p-10 border rounded-lg shadow-md">
//             <h1 className="text-2xl font-bold mb-4">My Wallet</h1>
            
//             <div className="bg-blue-50 p-4 rounded text-blue-900">
//                 <p className="text-sm uppercase tracking-wide">Current Balance</p>
//                 {/* Ensure wallet is not null before accessing properties */}
//                 <p className="text-4xl font-bold">
//                     RM {wallet?.Balance?.toFixed(2) ?? "0.00"}
//                 </p>
//             </div>
//         </div>
//     );
// }
