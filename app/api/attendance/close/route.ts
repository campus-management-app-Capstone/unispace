import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getLecturerByUserId,
  getAttendanceById,
  getClassWithStudents,
  closeAttendance,
} from "@/lib/database";

/**
 * POST: Close an attendance session. Lecturer-only. Marks absent students.
 * Body: { attendanceId: string }
 */
export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { attendanceId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const attendanceId =
    typeof body?.attendanceId === "string" ? body.attendanceId.trim() : "";
  if (!attendanceId) {
    return NextResponse.json(
      { error: "attendanceId is required" },
      { status: 400 }
    );
  }

  try {
    const lecturer = await getLecturerByUserId(userId);
    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 403 });
    }

    const attendance = await getAttendanceById(attendanceId);
    const classRow = await getClassWithStudents(attendance.ClassID);
    const classLecturerId = (classRow as { LecturerID: string })?.LecturerID;
    if (classLecturerId !== lecturer.LecturerID) {
      return NextResponse.json(
        { error: "You do not own this attendance session" },
        { status: 403 }
      );
    }

    await closeAttendance(attendanceId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to close attendance:", err);
    return NextResponse.json(
      { error: "Failed to close attendance" },
      { status: 500 }
    );
  }
}
