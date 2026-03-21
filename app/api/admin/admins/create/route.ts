import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { getClerkPasswordErrorMessage } from "@/lib/clerk-errors";

export async function POST(req: NextRequest) {
  try {
    const { name, password, email } = await req.json();

    if (!name?.trim() || !password?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createBrowserSupabaseClient();
    const clerk = await clerkClient();
    const normalizedEmail = email.trim().toLowerCase();

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

    let clerkUser;
    try {
      clerkUser = await clerk.users.createUser({
        firstName: name,
        password,
        emailAddress: [normalizedEmail],
        publicMetadata: {
          role: "admin",
        },
      });
    } catch (error: any) {
      const passwordError = getClerkPasswordErrorMessage(error);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 422 });
      }

      const errorCode = error?.errors?.[0]?.code;
      if (errorCode === "form_identifier_exists" || errorCode === "form_identifier_not_unique") {
        return NextResponse.json(
          { error: "Email already exists. Please use a different email." },
          { status: 409 }
        );
      }
      throw error;
    }

    const userId = clerkUser.id;

    try {
      const { error: userError } = await supabase.from("User").insert({
        UserID: userId,
      });

      if (userError) throw new Error(userError.message);

      const { error: walletError } = await supabase.from("Wallet").insert({
        UserID: userId,
        Balance: 0,
      });

      if (walletError) throw new Error(walletError.message);

      const { data: admin, error: adminError } = await supabase
        .from("Admin")
        .insert({
          UserID: userId,
        })
        .select("AdminID, AdminCode")
        .single();

      if (adminError) throw new Error(adminError.message);

      return NextResponse.json(
        {
          success: true,
          email,
          adminId: admin.AdminID,
          adminCode: admin.AdminCode,
        },
        { status: 201 }
      );
    } catch (error) {
      await supabase.from("Admin").delete().eq("UserID", userId);
      await supabase.from("Wallet").delete().eq("UserID", userId);
      await supabase.from("User").delete().eq("UserID", userId);
      await clerk.users.deleteUser(userId);
      throw error;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    if (
      !(
        typeof message === "string" &&
        message.toLowerCase().includes("email already exists")
      )
    ) {
      console.error("Error in POST /api/admin/admins/create:", err);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
