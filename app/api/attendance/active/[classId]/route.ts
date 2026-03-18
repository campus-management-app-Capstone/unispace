import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getActiveAttendanceByClassId } from "@/lib/database";

/**
 * GET: Get the active (Open) attendance for a class, if any.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { sessionClaims } = await auth();
  if (!sessionClaims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;
  if (!classId) {
    return NextResponse.json(
      { error: "classId is required" },
      { status: 400 }
    );
  }

  try {
    const attendance = await getActiveAttendanceByClassId(classId);
    if (!attendance) {
      return NextResponse.json({ attendance: null }, { status: 200 });
    }
    return NextResponse.json(
      {
        attendance: {
          attendanceId: attendance.AttendanceID,
          classId: attendance.ClassID,
          code: attendance.Code,
          startTime: attendance.StartTime,
          date: attendance.Date,
          status: attendance.Status,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to get active attendance:", err);
    return NextResponse.json(
      { error: "Failed to get active attendance" },
      { status: 500 }
    );
  }
}
