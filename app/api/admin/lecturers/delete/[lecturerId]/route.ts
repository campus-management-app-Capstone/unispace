import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

async function resolveLecturerId(req: NextRequest, paramsLecturerId?: string) {
  if (paramsLecturerId) {
    return paramsLecturerId;
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    return body?.lecturerId as string | undefined;
  }

  return undefined;
}

async function deleteLecturerById(lecturerId: string) {
  const supabase = createServerSupabaseClient();

  const { data: lecturer, error: lecturerError } = await supabase
    .from("Lecturer")
    .select("UserID")
    .eq("LecturerID", lecturerId)
    .single();

  if (lecturerError || !lecturer) {
    return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
  }

  const { data: classRows, error: classError } = await supabase
    .from("Class")
    .select("ClassID")
    .eq("LecturerID", lecturerId)
    .limit(1);

  if (classError) {
    throw new Error(`Failed to check class assignments: ${classError.message}`);
  }

  if ((classRows ?? []).length > 0) {
    return NextResponse.json(
      { error: "Cannot delete lecturer with assigned classes. Reassign classes first." },
      { status: 409 }
    );
  }

  const { error: lecturerTeachError } = await supabase
    .from("LecturerTeach")
    .delete()
    .eq("LecturerID", lecturerId);

  if (lecturerTeachError) {
    throw new Error(`Failed to clear lecturer teaching assignments: ${lecturerTeachError.message}`);
  }

  const { error: lecturerDeleteError } = await supabase
    .from("Lecturer")
    .delete()
    .eq("LecturerID", lecturerId);

  if (lecturerDeleteError) {
    throw new Error(`Failed to delete lecturer: ${lecturerDeleteError.message}`);
  }

  const { error: userDeleteError } = await supabase
    .from("User")
    .delete()
    .eq("UserID", lecturer.UserID);

  if (userDeleteError) {
    throw new Error(`Failed to delete user: ${userDeleteError.message}`);
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(lecturer.UserID);
  } catch (err) {
    console.error("Failed to delete Clerk user:", err);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lecturerId: string }> }
) {
  try {
    const { lecturerId: paramsLecturerId } = await params;
    const lecturerId = await resolveLecturerId(req, paramsLecturerId);

    if (!lecturerId) {
      return NextResponse.json({ error: "Missing lecturerId" }, { status: 400 });
    }

    return await deleteLecturerById(lecturerId);
  } catch (err) {
    console.error("Delete Lecturer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lecturerId: string }> }
) {
  try {
    const { lecturerId: paramsLecturerId } = await params;
    const lecturerId = await resolveLecturerId(req, paramsLecturerId);

    if (!lecturerId) {
      return NextResponse.json({ error: "Missing lecturerId" }, { status: 400 });
    }

    return await deleteLecturerById(lecturerId);
  } catch (err) {
    console.error("Delete Lecturer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
