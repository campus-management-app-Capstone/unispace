import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { facilityId } = await params;
    const supabase = createServerSupabaseClient();

    const [{ data: facility, error: facilityError }, { data: facilities, error: typeError }] =
      await Promise.all([
        supabase
          .from("Facility")
          .select("FacilityID, Name, Type, Capacity")
          .eq("FacilityID", facilityId)
          .single(),
        supabase.from("Facility").select("Type"),
      ]);

    if (facilityError || !facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    if (typeError) {
      throw typeError;
    }

    const types = Array.from(
      new Set((facilities ?? []).map((facilityRow) => facilityRow.Type).filter(Boolean))
    ).sort();

    return NextResponse.json({ facility, types }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch facility details:", err);
    return NextResponse.json({ error: "Failed to fetch facility details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { facilityId } = await params;
    const { name, type, capacity } = await req.json();

    if (!name?.trim() || !type?.trim()) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const normalizedCapacity =
      capacity === "" || capacity === null || typeof capacity === "undefined"
        ? null
        : Number(capacity);

    if (normalizedCapacity !== null && (!Number.isFinite(normalizedCapacity) || normalizedCapacity < 0)) {
      return NextResponse.json({ error: "Capacity must be a non-negative number" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("Facility")
      .update({
        Name: String(name).trim(),
        Type: String(type).trim(),
        Capacity: normalizedCapacity,
      })
      .eq("FacilityID", facilityId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to update facility:", err);
    return NextResponse.json({ error: "Failed to update facility" }, { status: 500 });
  }
}
