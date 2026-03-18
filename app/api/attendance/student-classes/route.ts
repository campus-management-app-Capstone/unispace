import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStudentByUserId, getClassesForStudent } from "@/lib/database";

/**
 * GET: List classes the current student is registered in (for attendance class selector).
 */
export async function GET() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await getStudentByUserId(userId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const classes = await getClassesForStudent(student.StudentID);
    return NextResponse.json({ classes }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch student classes:", err);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
