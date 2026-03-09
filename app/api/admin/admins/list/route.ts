import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function GET() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createBrowserSupabaseClient();
    const clerk = await clerkClient();

    const { data: admins, error: adminError } = await supabase
      .from("Admin")
      .select("AdminID, AdminCode, UserID");

    if (adminError) throw adminError;

    const users = await clerk.users.getUserList({
      limit: 500,
    });

    const userMap = new Map(
      users.data.map((user) => [
        user.id,
        {
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          email: user.emailAddresses[0]?.emailAddress ?? "",
          role: String(user.publicMetadata?.role ?? ""),
        },
      ])
    );

    const result = (admins ?? [])
      .map((admin) => {
        const user = userMap.get(admin.UserID);

        return {
          AdminID: admin.AdminID,
          AdminCode: admin.AdminCode,
          UserID: admin.UserID,
          Name: user?.name || "Unknown",
          Email: user?.email || "Unknown",
          Role: user?.role || "admin",
        };
      })
      .sort((a, b) => a.AdminCode.localeCompare(b.AdminCode));

    return NextResponse.json({ admins: result });
  } catch (err) {
    console.error("Failed to fetch admins:", err);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}
