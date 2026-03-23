import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getLecturerByUserId,
  getAttendanceById,
  getClassWithStudents,
  getAttendanceRecordsWithStudents,
} from "@/lib/database";

/**
 * GET: Session details and student list with status for the attendance code page.
 * Returns classId, date, startTime, code, subjectName, durationHours, classGroup,
 * and students array with studentId, studentName, studentCode, status (Present | Absent).
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
    const clerk = await clerkClient();
    const lecturer = await getLecturerByUserId(userId);
    if (!lecturer) {
      return NextResponse.json(
        { error: "Lecturer not found" },
        { status: 403 }
      );
    }

    const attendance = await getAttendanceById(attendanceId);
    const classData = await getClassWithStudents(attendance.ClassID);
    const classTyped = classData as {
      ClassID: string;
      Group?: string | null;
      Subject?: { Name?: string | null; Duration?: number | null } | null;
      ClassRegistration?: Array<{
        Enrollment?: {
          Student?: {
            StudentID?: string | null;
            StudentCode?: string | null;
            UserID?: string | null;
          } | null;
        } | null;
      }>;
    } | null;

    const lecturerId = (classData as { LecturerID?: string })?.LecturerID;
    if (lecturerId !== lecturer.LecturerID) {
      return NextResponse.json(
        { error: "You do not own this attendance session" },
        { status: 403 }
      );
    }

    const records = await getAttendanceRecordsWithStudents(attendanceId);
    const statusByStudentId = new Map(
      records.map((r) => [r.StudentID, r.Status as "Present" | "Absent"])
    );
    const codeByStudentId = new Map(
      records.map((r) => [r.StudentID, r.Student?.StudentCode ?? r.StudentID])
    );

    const studentsFromClass =
      classTyped?.ClassRegistration?.map((reg) => reg.Enrollment?.Student).filter(Boolean) ?? [];
    const rosterMap = new Map<
      string,
      { StudentID: string; StudentCode: string | null; UserID: string | null }
    >();
    studentsFromClass.forEach((s) => {
      const t = s as {
        StudentID: string;
        StudentCode: string | null;
        UserID: string | null;
      };
      if (t?.StudentID) rosterMap.set(t.StudentID, t);
    });
    records.forEach((r) => {
      if (!rosterMap.has(r.StudentID))
        rosterMap.set(r.StudentID, {
          StudentID: r.StudentID,
          StudentCode: r.Student?.StudentCode ?? null,
          UserID: null,
        });
    });

    const uniqueUserIds = Array.from(
      new Set(
        Array.from(rosterMap.values())
          .map((student) => student.UserID)
          .filter((userId): userId is string => Boolean(userId))
      )
    );

    const studentNameEntries = await Promise.all(
      uniqueUserIds.map(async (studentUserId) => {
        try {
          const clerkUser = await clerk.users.getUser(studentUserId);
          const studentName =
            `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
            clerkUser.username ||
            clerkUser.primaryEmailAddress?.emailAddress ||
            null;

          return [studentUserId, studentName] as const;
        } catch (error) {
          console.error("Failed to resolve student name for attendance roster:", error);
          return [studentUserId, null] as const;
        }
      })
    );

    const studentNameByUserId = new Map(studentNameEntries);

    const students = Array.from(rosterMap.entries())
      .map(([id, s]) => ({
        studentId: id,
        studentName:
          (s.UserID ? studentNameByUserId.get(s.UserID) : null) ??
          s.StudentCode ??
          id,
        studentCode: s.StudentCode ?? codeByStudentId.get(id) ?? id,
        status: (statusByStudentId.get(id) ?? "Absent") as "Present" | "Absent",
      }))
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    const subject = classTyped?.Subject;
    const durationHours = subject?.Duration ?? null;

    return NextResponse.json(
      {
        session: {
          attendanceId: attendance.AttendanceID,
          classId: attendance.ClassID,
          date: attendance.Date,
          startTime: attendance.StartTime,
          code: attendance.Code,
          subjectName: subject?.Name ?? null,
          durationHours,
          classGroup: classTyped?.Group ?? null,
        },
        students,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to fetch attendance session:", err);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
