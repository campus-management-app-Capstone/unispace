import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function GET() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createBrowserSupabaseClient();
    const clerk = await clerkClient();

    const [{ data: lecturers, error: lecturerError }, { data: departments, error: departmentError }] =
      await Promise.all([
        supabase
          .from("Lecturer")
          .select("LecturerID, LecturerCode, UserID, DepartmentID, EmployedTime"),
        supabase.from("Department").select("DepartmentID, Name"),
      ]);

    if (lecturerError) throw lecturerError;
    if (departmentError) throw departmentError;

    const users = await clerk.users.getUserList({
      limit: 500,
    });

    const userMap = new Map(
      users.data.map((user) => [
        user.id,
        {
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          email: user.emailAddresses[0]?.emailAddress ?? "",
          role: String(user.publicMetadata?.role ?? ""),
        },
      ])
    );

    const departmentMap = new Map(
      (departments ?? []).map((department) => [department.DepartmentID, department.Name])
    );

    const result = (lecturers ?? [])
      .map((lecturer) => {
        const user = userMap.get(lecturer.UserID);

        return {
          LecturerID: lecturer.LecturerID,
          LecturerCode: lecturer.LecturerCode,
          UserID: lecturer.UserID,
          EmployedTime: lecturer.EmployedTime,
          Role: user?.role || "lecturer",
          Name: user?.name || "Unknown",
          Email: user?.email || "Unknown",
          DepartmentID: lecturer.DepartmentID,
          DepartmentName: departmentMap.get(lecturer.DepartmentID) || "Unknown",
        };
      })
      .sort((a, b) => a.LecturerCode.localeCompare(b.LecturerCode));

    return NextResponse.json({
      lecturers: result,
      departments: departments ?? [],
      roles: ["lecturer"],
    });
  } catch (err) {
    console.error("Failed to fetch lecturers:", err);
    return NextResponse.json({ error: "Failed to fetch lecturers" }, { status: 500 });
  }
}
