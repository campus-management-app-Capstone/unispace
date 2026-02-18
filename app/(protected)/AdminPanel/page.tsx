import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Admin panel page = restricted to admin role.
 * Navbar is fiter by (protected)/layout.tsx from user role (AdminNavbar for admin).
 */
export default async function AdminPanel() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = (user.publicMetadata?.role as string) ?? undefined;
    if (role !== "admin") {
        redirect("/home");
    }

    return (
        <div className="flex h-screen w-full items-center justify-center">
        </div>
    );
}
