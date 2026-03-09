import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function GET() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createBrowserSupabaseClient();

    const { data: departments, error } = await supabase
      .from("Department")
      .select("DepartmentID, Name")
      .order("Name", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ departments: departments ?? [] }, { status: 200 });
  } catch (err) {
    console.error("Failed to load lecturer form data:", err);
    return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 });
  }
}
