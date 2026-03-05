import { NextResponse, NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { e } from "@/data/map";
import { en } from "zod/v4/locales";

export async function POST(req: NextRequest) {
  try {

    const { name, password, email, courseId, intake } = await req.json();

    /**
     * Create Supabase Client
     */
    const supabase = await createBrowserSupabaseClient();

    /**
     * Clerk Client
     */
    const clerk = await clerkClient();

    /**
     * 1️⃣ Create Clerk User
     */
    try {
      const clerkUser = await clerk.users.createUser({
        firstName: name,
        password: password,
        emailAddress: [email],
        publicMetadata: {
          role: "student",
        },
    });

    const userId = clerkUser.id;

    /**
     * 2️⃣ Insert Student in Supabase
     */
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

        /**
         * 3️⃣ Create Wallet
         */
        const { error: walletError } = await supabase
          .from("Wallet")
          .insert({
            UserID: userId,
            Balance: 0,
          });

        if (walletError) throw new Error(walletError.message);

        /**
         * 4️⃣ Create Enrollment
         */
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