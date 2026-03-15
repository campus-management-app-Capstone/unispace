import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getLecturerByUserId,
  getAttendanceById,
  getClassWithStudents,
  rotateAttendanceCode,
} from "@/lib/database";

const SOCKET_BROADCAST_URL =
  process.env.SOCKET_SERVER_BROADCAST_URL ||
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
  "http://localhost:3001";

/**
 * POST: Rotate the attendance code (60s tick). Lecturer-only.
 * Updates DB and notifies socket server to emit code-update to the class room.
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

    const updated = await rotateAttendanceCode(attendanceId);

    try {
      const broadcastUrl =
        SOCKET_BROADCAST_URL.replace(/\/$/, "") + "/broadcast";
      await fetch(broadcastUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: attendance.ClassID,
          code: updated.Code,
          startTime: updated.StartTime,
        }),
      });
    } catch (broadcastErr) {
      console.warn("Socket broadcast failed (server may be down):", broadcastErr);
    }

    return NextResponse.json(
      {
        code: updated.Code,
        startTime: updated.StartTime,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to rotate attendance code:", err);
    return NextResponse.json(
      { error: "Failed to rotate code" },
      { status: 500 }
    );
  }
}
