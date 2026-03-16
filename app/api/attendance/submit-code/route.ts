import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getStudentByUserId,
  getClassesForStudent,
  getActiveAttendanceByCode,
  hasAttendanceRecord,
  createAttendanceRecord,
} from "@/lib/database";
import { ensureCampusIp } from "@/lib/ip-range";

/**
 * POST: Student submits attendance using a 6-character code only.
 * Body: { code: string }
 *
 * Validation rules:
 * - Identify the active attendance session by code.
 * - Ensure the authenticated student is registered in that class.
 * - Prevent duplicate submissions for the same attendance.
 * - Create a Present attendance record on success.
 */
export async function POST(request: Request) {
  const campusResult = ensureCampusIp(request);
  if (!campusResult.ok) {
    return NextResponse.json({ error: campusResult.reason }, { status: 403 });
  }

  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const rawCode = typeof body?.code === "string" ? body.code.trim() : "";
  const code = rawCode.replace(/\s+/g, "");

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { error: "Attendance code must be 6 characters." },
      { status: 400 }
    );
  }

  try {
    const student = await getStudentByUserId(userId);
    if (!student) {
      return NextResponse.json(
        { error: "Student record not found." },
        { status: 403 }
      );
    }

    const attendance = await getActiveAttendanceByCode(code);
    if (!attendance) {
      return NextResponse.json(
        { error: "No active attendance session found for this code." },
        { status: 404 }
      );
    }

    const classes = await getClassesForStudent(student.StudentID);
    const isInClass = classes.some((cls) => cls.ClassID === attendance.ClassID);

    if (!isInClass) {
      return NextResponse.json(
        { error: "You are not registered for this class." },
        { status: 403 }
      );
    }

    const alreadyRecorded = await hasAttendanceRecord(
      attendance.AttendanceID,
      student.StudentID
    );
    if (alreadyRecorded) {
      return NextResponse.json(
        { error: "You have already submitted attendance for this session." },
        { status: 400 }
      );
    }

    await createAttendanceRecord(attendance.AttendanceID, student.StudentID);

    return NextResponse.json(
      { ok: true, message: "Attendance recorded." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to submit code attendance:", err);
    return NextResponse.json(
      { error: "Failed to submit attendance." },
      { status: 500 }
    );
  }
}

