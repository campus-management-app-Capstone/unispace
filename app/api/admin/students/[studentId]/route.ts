import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const supabase = createServerSupabaseClient();
    const clerk = await clerkClient();

    const { data: student, error: studentError } = await supabase
      .from("Student")
      .select("StudentID, StudentCode, UserID")
      .eq("StudentID", studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { data: enrollment } = await supabase
      .from("Enrollment")
      .select("EnrollmentID, CourseID, Intake")
      .eq("StudentID", studentId)
      .maybeSingle();

    const { data: courses, error: courseError } = await supabase
      .from("Course")
      .select("CourseID, Name, Level")
      .order("CourseID", { ascending: true });

    if (courseError) {
      throw new Error(courseError.message);
    }

    const { data: enrollmentRows } = await supabase
      .from("Enrollment")
      .select("Intake")
      .order("Intake", { ascending: false });

    const intakes = Array.from(new Set((enrollmentRows ?? []).map((e) => e.Intake))).sort().reverse();

    const clerkUser = await clerk.users.getUser(student.UserID);
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    return NextResponse.json(
      {
        student: {
          StudentID: student.StudentID,
          StudentCode: student.StudentCode,
          UserID: student.UserID,
          Name: name,
          Email: email,
          CourseID: enrollment?.CourseID ?? "",
          Intake: enrollment?.Intake ?? "",
        },
        courses: courses ?? [],
        intakes,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to fetch student details:", err);
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await req.json();
    const { name, email, courseId, intake } = body as {
      name?: string;
      email?: string;
      courseId?: string;
      intake?: string;
    };

    if (!name?.trim() || !email?.trim() || !courseId || !intake) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const clerk = await clerkClient();

    const { data: student, error: studentError } = await supabase
      .from("Student")
      .select("StudentID, UserID")
      .eq("StudentID", studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { firstName, lastName } = splitName(name);

    const currentClerkUser = await clerk.users.getUser(student.UserID);

    await clerk.users.updateUser(student.UserID, {
      firstName,
      lastName,
    });

    const requestedEmail = email.trim().toLowerCase();
    const existingEmail = currentClerkUser.emailAddresses.find(
      (address) => address.emailAddress.toLowerCase() === requestedEmail
    );

    if (existingEmail) {
      if (!existingEmail.verification?.status || existingEmail.verification.status !== "verified") {
        await clerk.emailAddresses.updateEmailAddress(existingEmail.id, {
          verified: true,
        });
      }

      if (currentClerkUser.primaryEmailAddressId !== existingEmail.id) {
        await clerk.users.updateUser(student.UserID, {
          primaryEmailAddressID: existingEmail.id,
        });
      }
    } else if (
      currentClerkUser.primaryEmailAddress?.emailAddress.toLowerCase() !== requestedEmail
    ) {
      const createdEmail = await clerk.emailAddresses.createEmailAddress({
        userId: student.UserID,
        emailAddress: email.trim(),
        verified: true,
        primary: true,
      });

      await clerk.users.updateUser(student.UserID, {
        primaryEmailAddressID: createdEmail.id,
      });
    }

    const { data: existingEnrollment } = await supabase
      .from("Enrollment")
      .select("EnrollmentID")
      .eq("StudentID", studentId)
      .maybeSingle();

    if (existingEnrollment?.EnrollmentID) {
      const { error: updateEnrollmentError } = await supabase
        .from("Enrollment")
        .update({
          CourseID: courseId,
          Intake: intake,
        })
        .eq("EnrollmentID", existingEnrollment.EnrollmentID);

      if (updateEnrollmentError) {
        throw new Error(updateEnrollmentError.message);
      }
    } else {
      const { error: createEnrollmentError } = await supabase.from("Enrollment").insert({
        StudentID: studentId,
        CourseID: courseId,
        Intake: intake,
      });

      if (createEnrollmentError) {
        throw new Error(createEnrollmentError.message);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to update student:", err);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}