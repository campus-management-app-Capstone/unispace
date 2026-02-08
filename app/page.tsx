import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const { userId } = await auth();

  //already logged in, skip the landing page
  if (userId) {
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