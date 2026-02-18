import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import AdminNavbar from "@/components/AdminNavbar";

// use currentUser() to get user role, if admin, use AdminNavbar.tsx as the navbar in admin page, other wise use navbar.tsx
export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) ?? undefined;
    const isAdmin = role === "admin";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {isAdmin ? <AdminNavbar /> : <Navbar />}
            <main className="flex-1 container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
