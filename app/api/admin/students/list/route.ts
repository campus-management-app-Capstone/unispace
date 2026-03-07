import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function GET() {
  const { sessionClaims } = await auth();
  const UserID = sessionClaims?.sub;

  if (!UserID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createBrowserSupabaseClient();
    const clerk = await clerkClient();


    // Fetch students
    const { data: students, error: studentError } = await supabase
      .from("Student")
      .select("StudentID, StudentCode, UserID");

    if (studentError) throw studentError;


    // Fetch enrollments
    const { data: enrollments } = await supabase
      .from("Enrollment")
      .select("StudentID, CourseID, Intake");

    // Fetch courses
    const { data: courses } = await supabase
      .from("Course")
      .select("CourseID, Name, Level");

    const courseMap = new Map(
        courses?.map((c) => [
            c.CourseID,
            {
            name: c.Name,
            level: c.Level,
            },
        ])
        );

    const enrollmentMap = new Map(
      enrollments?.map((e) => [
        e.StudentID,
        { courseId: e.CourseID, intake: e.Intake },
      ])
    );

    // Fetch Clerk users
    const users = await clerk.users.getUserList({
      limit: 500,
    });

    const userMap = new Map(
      users.data.map((u) => [
        u.id,
        {
          name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
          email: u.emailAddresses[0]?.emailAddress,
        },
      ])
    );

    // Merge data
    const result = students?.map((s) => {
        const enroll = enrollmentMap.get(s.StudentID);
        const user = userMap.get(s.UserID);
        const course = enroll ? courseMap.get(enroll.courseId) : null;

        return {
            StudentID: s.StudentID,
            StudentCode: s.StudentCode,
            Name: user?.name ?? "Unknown",
            Email: user?.email ?? "Unknown",

            CourseID: enroll?.courseId ?? null,
            CourseName: course?.name ?? null,
            Level: course?.level ?? null,

            Intake: enroll?.intake ?? null,
        };
        });

    // Sort by StudentCode ascending
    result.sort((a, b) =>
      a.StudentCode.localeCompare(b.StudentCode)
    );

    const intakes = Array.from(
        new Set(enrollments?.map((e) => e.Intake) || [])
    ).sort().reverse();

    return NextResponse.json({
        students: result ?? [],
        courses: courses ?? [],
        intakes: intakes ?? [],
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}