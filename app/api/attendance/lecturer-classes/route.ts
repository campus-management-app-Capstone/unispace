import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getLecturerByUserId, getClassesByLecturerId } from "@/lib/database";

/**
 * GET: List classes taught by the current lecturer (for attendance class selector).
 */
export async function GET() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lecturer = await getLecturerByUserId(userId);
    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }
    const classes = await getClassesByLecturerId(lecturer.LecturerID);
    return NextResponse.json({ classes }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch lecturer classes:", err);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
