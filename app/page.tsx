import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Landing from "./landing";

export default async function LandingPage() {
  const user = await currentUser();

  // Already logged in: route by role (admin to AdminPanel, others to home)
  if (user) {
    const role = (user.publicMetadata?.role as string) ?? undefined;
    if (role === "admin") {
      redirect("/admin/home");
    }
    redirect("/home");
  }

  return (
    <div className="w-full">
      {/* <Link href="/sign-in">
        <Button>Sign In</Button>
      </Link> */}
      <Landing />
    </div>
  );
}