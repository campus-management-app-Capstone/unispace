import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

async function resolveFacilityId(req: NextRequest, paramsFacilityId?: string) {
  if (paramsFacilityId) {
    return paramsFacilityId;
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    return body?.facilityId as string | undefined;
  }

  return undefined;
}

async function deleteFacilityById(facilityId: string) {
  const supabase = createServerSupabaseClient();

  const { data: bookingRows, error: bookingError } = await supabase
    .from("Booking")
    .select("BookingID")
    .eq("FacilityID", facilityId)
    .limit(1);

  if (bookingError) {
    throw new Error(`Failed to check bookings: ${bookingError.message}`);
  }

  if ((bookingRows ?? []).length > 0) {
    return NextResponse.json(
      { error: "Cannot delete facility with booking records." },
      { status: 409 }
    );
  }

  const { data: timetableRows, error: timetableError } = await supabase
    .from("TimetableSlot")
    .select("TimetableSlotID")
    .eq("FacilityID", facilityId)
    .limit(1);

  if (timetableError) {
    throw new Error(`Failed to check timetable slots: ${timetableError.message}`);
  }

  if ((timetableRows ?? []).length > 0) {
    return NextResponse.json(
      { error: "Cannot delete facility linked to timetable slots." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("Facility").delete().eq("FacilityID", facilityId);

  if (error) {
    throw new Error(`Failed to delete facility: ${error.message}`);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { facilityId: paramsFacilityId } = await params;
    const facilityId = await resolveFacilityId(req, paramsFacilityId);

    if (!facilityId) {
      return NextResponse.json({ error: "Missing facilityId" }, { status: 400 });
    }

    return await deleteFacilityById(facilityId);
  } catch (err) {
    console.error("Delete Facility error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { facilityId: paramsFacilityId } = await params;
    const facilityId = await resolveFacilityId(req, paramsFacilityId);

    if (!facilityId) {
      return NextResponse.json({ error: "Missing facilityId" }, { status: 400 });
    }

    return await deleteFacilityById(facilityId);
  } catch (err) {
    console.error("Delete Facility error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
