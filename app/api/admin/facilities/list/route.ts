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
      .select("FacilityID, Name, Type, Capacity")
      .order("Name", { ascending: true });

    if (error) {
      throw error;
    }

    const types = Array.from(
      new Set((facilities ?? []).map((facility) => facility.Type).filter(Boolean))
    ).sort();

    return NextResponse.json({
      facilities: facilities ?? [],
      types,
    });
  } catch (err) {
    console.error("Failed to fetch facilities:", err);
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
  }
}
