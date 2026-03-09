import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

async function resolveStudentId(req: NextRequest, paramsStudentId?: string) {
  if (paramsStudentId) {
    return paramsStudentId;
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    return body?.studentId as string | undefined;
  }

  return undefined;
}

  async function deleteStudentById(studentId: string) {
    const supabase = createServerSupabaseClient();

      const { data: studentData, error: fetchError } = await supabase
    .from("Student")
    .select("UserID")
    .eq("StudentID", studentId)
    .single();

  if (fetchError || !studentData) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const userId = studentData.UserID;

  const { data: enrollments, error: enrollmentFetchError } = await supabase
    .from("Enrollment")
    .select("EnrollmentID")
    .eq("StudentID", studentId);

  if (enrollmentFetchError) {
    throw new Error(`Failed to load enrollments: ${enrollmentFetchError.message}`);
  }

  const enrollmentIds = (enrollments ?? []).map((e) => e.EnrollmentID);

  if (enrollmentIds.length > 0) {
    const { error: classRegistrationError } = await supabase
      .from("ClassRegistration")
      .delete()
      .in("EnrollmentID", enrollmentIds);

    if (classRegistrationError) {
      throw new Error(`Failed to clear class registrations: ${classRegistrationError.message}`);
    }
  }

  const { error: enrollmentDeleteError } = await supabase
    .from("Enrollment")
    .delete()
    .eq("StudentID", studentId);

  if (enrollmentDeleteError) {
    throw new Error(`Failed to clear enrollments: ${enrollmentDeleteError.message}`);
  }

  const { error: walletDeleteError } = await supabase
    .from("Wallet")
    .delete()
    .eq("UserID", userId);

  if (walletDeleteError) {
    throw new Error(`Failed to clear wallet: ${walletDeleteError.message}`);
  }

  const { error: studentDeleteError } = await supabase
    .from("Student")
    .delete()
    .eq("StudentID", studentId);

    if (studentDeleteError) {
    throw new Error(`Failed to delete student: ${studentDeleteError.message}`);
  }

  const { error: userDeleteError } = await supabase
    .from("User")
    .delete()
    .eq("UserID", userId);

  if (userDeleteError) {
    throw new Error(`Failed to delete user: ${userDeleteError.message}`);
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);
  } catch (err) {
    console.error("Failed to delete Clerk user:", err);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId: paramsStudentId } = await params;
    const studentId = await resolveStudentId(req, paramsStudentId);

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    return await deleteStudentById(studentId);
  } catch (err) {
    console.error("Delete Student error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId: paramsStudentId } = await params;
    const studentId = await resolveStudentId(req, paramsStudentId);

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    return await deleteStudentById(studentId);
  } catch (err) {
    console.error("Delete Student error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}