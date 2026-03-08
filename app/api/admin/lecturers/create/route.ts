import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function POST(req: NextRequest) {
  try {
    const { name, password, email, departmentId } = await req.json();

    if (!name?.trim() || !password?.trim() || !email?.trim() || !departmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createBrowserSupabaseClient();
    const clerk = await clerkClient();

    const clerkUser = await clerk.users.createUser({
      firstName: name,
      password,
      emailAddress: [email],
      publicMetadata: {
        role: "lecturer",
      },
    });

    const userId = clerkUser.id;

    try {
      const { error: userError } = await supabase.from("User").insert({
        UserID: userId,
      });

      if (userError) throw new Error(userError.message);

      const { data: lecturer, error: lecturerError } = await supabase
        .from("Lecturer")
        .insert({
          UserID: userId,
          DepartmentID: departmentId,
        })
        .select("LecturerID, LecturerCode, EmployedTime")
        .single();

      if (lecturerError) throw new Error(lecturerError.message);

      return NextResponse.json(
        {
          success: true,
          email,
          lecturerId: lecturer.LecturerID,
          lecturerCode: lecturer.LecturerCode,
          employedTime: lecturer.EmployedTime,
        },
        { status: 201 }
      );
    } catch (error) {
      await clerk.users.deleteUser(userId);
      throw error;
    }
  } catch (err) {
    console.error("Error in POST /api/admin/lecturers/create:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
