import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient();

    const { data: facilities, error } = await supabase
      .from("Facility")
      .select("Type")
      .order("Type", { ascending: true });

    if (error) {
      throw error;
    }

    const types = Array.from(
      new Set((facilities ?? []).map((facility) => facility.Type).filter(Boolean))
    ).sort();

    return NextResponse.json({ types });
  } catch (err) {
    console.error("Failed to fetch facility form data:", err);
    return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 });
  }
}
