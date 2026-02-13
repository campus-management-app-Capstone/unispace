import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Admin panel page. use currentUser() get user role
 * Navbar is rendered once by (protected)/layout.tsx.
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
