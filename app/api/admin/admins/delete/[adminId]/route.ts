import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

async function resolveAdminId(req: NextRequest, paramsAdminId?: string) {
  if (paramsAdminId) {
    return paramsAdminId;
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    return body?.adminId as string | undefined;
  }

  return undefined;
}

async function deleteAdminById(adminId: string) {
  const { sessionClaims } = await auth();
  const currentUserId = sessionClaims?.sub;

  const supabase = createServerSupabaseClient();

  const { data: admin, error: adminError } = await supabase
    .from("Admin")
    .select("UserID")
    .eq("AdminID", adminId)
    .single();

  if (adminError || !admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  if (currentUserId && admin.UserID === currentUserId) {
    return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
  }

  const { error: adminDeleteError } = await supabase.from("Admin").delete().eq("AdminID", adminId);

  if (adminDeleteError) {
    throw new Error(`Failed to delete admin: ${adminDeleteError.message}`);
  }

  const { error: walletDeleteError } = await supabase.from("Wallet").delete().eq("UserID", admin.UserID);

  if (walletDeleteError) {
    throw new Error(`Failed to delete wallet: ${walletDeleteError.message}`);
  }

  const { error: userDeleteError } = await supabase.from("User").delete().eq("UserID", admin.UserID);

  if (userDeleteError) {
    throw new Error(`Failed to delete user: ${userDeleteError.message}`);
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(admin.UserID);
  } catch (err) {
    console.error("Failed to delete Clerk user:", err);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId: paramsAdminId } = await params;
    const adminId = await resolveAdminId(req, paramsAdminId);

    if (!adminId) {
      return NextResponse.json({ error: "Missing adminId" }, { status: 400 });
    }

    return await deleteAdminById(adminId);
  } catch (err) {
    console.error("Delete Admin error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId: paramsAdminId } = await params;
    const adminId = await resolveAdminId(req, paramsAdminId);

    if (!adminId) {
      return NextResponse.json({ error: "Missing adminId" }, { status: 400 });
    }

    return await deleteAdminById(adminId);
  } catch (err) {
    console.error("Delete Admin error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
