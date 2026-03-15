import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getLecturerByUserId,
  getAttendanceById,
  getClassWithStudents,
  getAttendanceRecords,
} from "@/lib/database";

/**
 * GET: List attendance records (Present/Absent) for an attendance session. Lecturer-only.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attendanceId: string }> }
) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attendanceId } = await params;
  if (!attendanceId) {
    return NextResponse.json(
      { error: "attendanceId is required" },
      { status: 400 }
    );
  }

  try {
    const lecturer = await getLecturerByUserId(userId);
    if (!lecturer) {
      return NextResponse.json(
        { error: "Lecturer not found" },
        { status: 403 }
      );
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

    const records = await getAttendanceRecords(attendanceId);
    return NextResponse.json({ records }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch attendance records:", err);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
