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
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    const supabase = createServerSupabaseClient();
    const clerk = await clerkClient();

    const { data: admin, error: adminError } = await supabase
      .from("Admin")
      .select("AdminID, AdminCode, UserID")
      .eq("AdminID", adminId)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const clerkUser = await clerk.users.getUser(admin.UserID);
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    return NextResponse.json(
      {
        admin: {
          AdminID: admin.AdminID,
          AdminCode: admin.AdminCode,
          UserID: admin.UserID,
          Name: name,
          Email: email,
          Role: String(clerkUser.publicMetadata?.role ?? "admin"),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to fetch admin details:", err);
    return NextResponse.json({ error: "Failed to fetch admin details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    const body = await req.json();

    const { name, email } = body as {
      name?: string;
      email?: string;
    };

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const clerk = await clerkClient();

    const { data: admin, error: adminError } = await supabase
      .from("Admin")
      .select("AdminID, UserID")
      .eq("AdminID", adminId)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const { firstName, lastName } = splitName(name);

    const currentClerkUser = await clerk.users.getUser(admin.UserID);

    await clerk.users.updateUser(admin.UserID, {
      firstName,
      lastName,
      publicMetadata: {
        ...currentClerkUser.publicMetadata,
        role: "admin",
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
        await clerk.users.updateUser(admin.UserID, {
          primaryEmailAddressID: existingEmail.id,
        });
      }
    } else if (currentClerkUser.primaryEmailAddress?.emailAddress.toLowerCase() !== requestedEmail) {
      const createdEmail = await clerk.emailAddresses.createEmailAddress({
        userId: admin.UserID,
        emailAddress: email.trim(),
        verified: true,
        primary: true,
      });

      await clerk.users.updateUser(admin.UserID, {
        primaryEmailAddressID: createdEmail.id,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to update admin:", err);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}
