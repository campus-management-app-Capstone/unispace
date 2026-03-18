import { NextResponse, NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function POST(req: NextRequest) {
  try {

    const { name, password, email, courseId, intake } = await req.json();


    // Create Supabase Client
    const supabase = await createBrowserSupabaseClient();


    // Clerk Client
    const clerk = await clerkClient();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !password?.trim() || !normalizedEmail || !courseId || !intake) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUsers = await clerk.users.getUserList({
      emailAddress: [normalizedEmail],
      limit: 1,
    });

    if (existingUsers.data.length > 0) {
      return NextResponse.json(
        { error: "Email already exists. Please use a different email." },
        { status: 409 }
      );
    }

    // Create Clerk User
    try {
      const clerkUser = await clerk.users.createUser({
        firstName: name,
        password: password,
        emailAddress: [normalizedEmail],
        publicMetadata: {
          role: "student",
        },
    });

    const userId = clerkUser.id;

      // Insert Student in Supabase

      try {
        const { error: userError } = await supabase
          .from("User")
          .insert({
            UserID: userId,
          });
        if (userError) throw new Error(userError.message);

        const { data: student, error: studentError } = await supabase
          .from("Student")
          .insert({
            UserID: userId
          })
          .select()
          .single();

        if (studentError) throw new Error(studentError.message);

        const studentId = student.StudentID;
        const studentCode = student.StudentCode;

        // Create Wallet
        
        const { error: walletError } = await supabase
          .from("Wallet")
          .insert({
            UserID: userId,
            Balance: 0,
          });

        if (walletError) throw new Error(walletError.message);

        // Create Enrollment

        const { data: enrollment, error: enrollError } = await supabase
          .from("Enrollment")
          .insert({
            StudentID: studentId,
            CourseID: courseId,
            Intake: intake,
          })
          .select()
          .single();

        if (enrollError) throw new Error(enrollError.message);

        return NextResponse.json(
          {
            success: true,
            email,
            studentCode,
            enrollmentId: enrollment.EnrollmentID,
          },
          { status: 201 }
        );
      } catch (error) {
        // Rollback Clerk User if Supabase operations fail
        await clerk.users.deleteUser(userId);
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      const errorCode = error?.errors?.[0]?.code;
      if (errorCode === "form_identifier_exists" || errorCode === "form_identifier_not_unique") {
        return NextResponse.json(
          { error: "Email already exists. Please use a different email." },
          { status: 409 }
        );
      }

      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user: " + error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/admin/students/create:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
