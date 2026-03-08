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
  { params }: { params: Promise<{ lecturerId: string }> }
) {
  try {
    const { lecturerId } = await params;
    const supabase = createServerSupabaseClient();
    const clerk = await clerkClient();

    const { data: lecturer, error: lecturerError } = await supabase
      .from("Lecturer")
      .select("LecturerID, LecturerCode, UserID, DepartmentID, EmployedTime")
      .eq("LecturerID", lecturerId)
      .single();

    if (lecturerError || !lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    const { data: departments, error: departmentError } = await supabase
      .from("Department")
      .select("DepartmentID, Name")
      .order("Name", { ascending: true });

    if (departmentError) {
      throw new Error(departmentError.message);
    }

    const clerkUser = await clerk.users.getUser(lecturer.UserID);

    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    return NextResponse.json(
      {
        lecturer: {
          LecturerID: lecturer.LecturerID,
          LecturerCode: lecturer.LecturerCode,
          UserID: lecturer.UserID,
          DepartmentID: lecturer.DepartmentID,
          EmployedTime: lecturer.EmployedTime,
          Role: String(clerkUser.publicMetadata?.role ?? "lecturer"),
          Name: name,
          Email: email,
        },
        departments: departments ?? [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to fetch lecturer details:", err);
    return NextResponse.json({ error: "Failed to fetch lecturer details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ lecturerId: string }> }
) {
  try {
    const { lecturerId } = await params;
    const body = await req.json();

    const { name, email, departmentId } = body as {
      name?: string;
      email?: string;
      departmentId?: string;
    };

    if (!name?.trim() || !email?.trim() || !departmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const clerk = await clerkClient();

    const { data: lecturer, error: lecturerError } = await supabase
      .from("Lecturer")
      .select("LecturerID, UserID")
      .eq("LecturerID", lecturerId)
      .single();

    if (lecturerError || !lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    const { firstName, lastName } = splitName(name);

    const currentClerkUser = await clerk.users.getUser(lecturer.UserID);

    await clerk.users.updateUser(lecturer.UserID, {
      firstName,
      lastName,
      publicMetadata: {
        ...currentClerkUser.publicMetadata,
        role: "lecturer",
      },
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
        await clerk.users.updateUser(lecturer.UserID, {
          primaryEmailAddressID: existingEmail.id,
        });
      }
    } else if (currentClerkUser.primaryEmailAddress?.emailAddress.toLowerCase() !== requestedEmail) {
      const createdEmail = await clerk.emailAddresses.createEmailAddress({
        userId: lecturer.UserID,
        emailAddress: email.trim(),
        verified: true,
        primary: true,
      });

      await clerk.users.updateUser(lecturer.UserID, {
        primaryEmailAddressID: createdEmail.id,
      });
    }

    const { error: updateError } = await supabase
      .from("Lecturer")
      .update({
        DepartmentID: departmentId,
      })
      .eq("LecturerID", lecturerId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to update lecturer:", err);
    return NextResponse.json({ error: "Failed to update lecturer" }, { status: 500 });
  }
}
