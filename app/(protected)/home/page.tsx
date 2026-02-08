import { createClerkSupabaseClient } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

//Way 2 : another way to get user role from jwt session claims
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
    const supabase = await createClerkSupabaseClient();
    const user = await currentUser();

    // Way 2
    const { sessionClaims } = await auth();
    const userRole = sessionClaims?.metadata.role;
    const userId = sessionClaims?.sub;

    // Example of using supabase see /lib/supabase.ts

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Welcome, {user?.firstName || "User"}!</h1>
            <div className="bg-white p-6 rounded-lg shadow space-y-2 border">
                <p className="text-gray-600">
                    <strong>User ID:</strong> {user?.id}
                </p>
                <p className="text-gray-600">
                    <strong>Way 2 User ID:</strong> {userId}
                </p>
                <p className="text-gray-600">
                    <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-gray-600">
                    <strong>Role:</strong> {(user?.publicMetadata?.role as string) || "Not Set"}
                </p>
                <p className="text-gray-600">
                    <strong>Way 2 Role:</strong> {userRole || "Not Set"}
                </p>
            </div>
        </div>
    );
}
