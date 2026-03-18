import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import AdminNavbar from "@/components/AdminNavbar";
import StudentNavbar from "@/components/StudentNavbar";
import LecturerNavbar from "@/components/LecturerNavbar";

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

    let user;
    try {
        user = await currentUser();
    } catch (err) {
        // if Clerk API responds with an error (e.g. bad gateway or no session),
        // treat as unauthenticated and redirect to sign-in page
        console.error('Failed to fetch current user', err);
        redirect('/sign-in');
    }
    const role = (user?.publicMetadata?.role as string) ?? undefined;
    const isAdmin = role === "admin";
    const isStudent = role === "student";
    const isLecturer = role === "lecturer";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* {isAdmin ? <AdminNavbar /> : isStudent ? <StudentNavbar /> : isLecturer ? <LecturerNavbar /> : <Navbar />} */}
            {isAdmin ? <AdminNavbar /> : <StudentNavbar /> }
            <main className="flex-1 container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
