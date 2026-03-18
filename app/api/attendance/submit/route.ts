import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getStudentByUserId,
  getActiveAttendanceByClassId,
  hasAttendanceRecord,
  createAttendanceRecord,
} from "@/lib/database";
import { ensureCampusIp } from "@/lib/ip-range";

/**
 * POST: Student submits attendance with the displayed code.
 * Body: { classId: string, code: string }
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

  let body: { classId?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const classId =
    typeof body?.classId === "string" ? body.classId.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!classId || !code) {
    return NextResponse.json(
      { error: "classId and code are required" },
      { status: 400 }
    );
  }

  try {
    const student = await getStudentByUserId(userId);
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 403 }
      );
    }

    const attendance = await getActiveAttendanceByClassId(classId);
    if (!attendance) {
      return NextResponse.json(
        { error: "No active attendance for this class" },
        { status: 404 }
      );
    }

    if (attendance.Code !== code) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      );
    }

    const alreadyRecorded = await hasAttendanceRecord(
      attendance.AttendanceID,
      student.StudentID
    );
    if (alreadyRecorded) {
      return NextResponse.json(
        { error: "You have already submitted attendance for this session" },
        { status: 400 }
      );
    }

    await createAttendanceRecord(attendance.AttendanceID, student.StudentID);

    const broadcastUrl =
      (process.env.SOCKET_SERVER_BROADCAST_URL ||
        process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
        "http://localhost:3001"
      ).replace(/\/$/, "") + "/broadcast-record";
    try {
      await fetch(broadcastUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentId: student.StudentID,
          status: "Present",
        }),
      });
    } catch {
      // ignore
    }

    return NextResponse.json(
      { ok: true, message: "Attendance recorded" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to submit attendance:", err);
    return NextResponse.json(
      { error: "Failed to submit attendance" },
      { status: 500 }
    );
  }
}
