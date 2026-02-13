import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const user = await currentUser();

  // Already logged in: route by role (admin to AdminPanel, others to home)
  if (user) {
    const role = (user.publicMetadata?.role as string) ?? undefined;
    if (role === "admin") {
      redirect("/AdminPanel");
    }
    redirect("/home");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Link href="/sign-in">
        <Button>Sign In</Button>
      </Link>
    </div>
  );
}