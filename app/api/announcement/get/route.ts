import { NextResponse, NextRequest } from 'next/server';
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = (user.publicMetadata?.role as string) ?? undefined;
    if (role !== "admin") {
        redirect("/home");
    }

    const supabase = await createBrowserSupabaseClient();
    const { data, error } = await supabase
        .from('Announcement')
        .select(
            `
            AnnouncementID,
            Title,
            CreatedAt,
            Target
        `
        )
        .order('CreatedAt', { ascending: false })

    if (error) {
        console.error('Supabase error fetching wallet:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}