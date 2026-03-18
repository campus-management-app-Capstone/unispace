import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getLecturerByUserId,
  getClassesByLecturerId,
  createAttendance,
  getActiveAttendanceByClassId,
} from "@/lib/database";

/**
 * POST: Open an attendance session for a class. Lecturer-only.
 * Body: { classId: string }
 */
export async function POST(request: Request) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lecturer = await getLecturerByUserId(userId);
    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 403 });
    }

    const body = await request.json();
    const classId = typeof body?.classId === "string" ? body.classId.trim() : "";

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      );
    }

    const lecturerClasses = await getClassesByLecturerId(lecturer.LecturerID);
    const canTeach = lecturerClasses.some((c) => c.ClassID === classId);
    if (!canTeach) {
      return NextResponse.json(
        { error: "You do not teach this class" },
        { status: 403 }
      );
    }

    const existing = await getActiveAttendanceByClassId(classId);
    if (existing) {
      return NextResponse.json(
        {
          attendanceId: existing.AttendanceID,
          code: existing.Code,
          startTime: existing.StartTime,
          date: existing.Date,
          classId: existing.ClassID,
        },
        { status: 200 }
      );
    }

    const attendance = await createAttendance(classId);
    return NextResponse.json(
      {
        attendanceId: attendance.AttendanceID,
        code: attendance.Code,
        startTime: attendance.StartTime,
        date: attendance.Date,
        classId: attendance.ClassID,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to open attendance:", err);
    return NextResponse.json(
      { error: "Failed to open attendance" },
      { status: 500 }
    );
  }
}
