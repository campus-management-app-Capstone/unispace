import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const insertPayload = {
      FacilityID: randomUUID(),
      Name: String(name).trim(),
      Type: String(type).trim(),
      ...(normalizedCapacity !== null ? { Capacity: normalizedCapacity } : {}),
    };

    const { data: facility, error } = await supabase
      .from("Facility")
      .insert(insertPayload)
      .select("FacilityID, Name, Type, Capacity")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, facility }, { status: 201 });
  } catch (err) {
    console.error("Failed to create facility:", err);
    return NextResponse.json({ error: "Failed to create facility" }, { status: 500 });
  }
}
