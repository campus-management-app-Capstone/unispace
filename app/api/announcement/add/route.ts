import { NextResponse, NextRequest } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function POST(request: NextRequest) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const role = (user.publicMetadata?.role as string) ?? undefined;
    if (role !== "admin") {
        redirect("/home");
    }

    const userId = user?.id;

    try {
        const body = await request.json();

        // checking
        const {title, content, target} = body;

        const missingFields: string[] = [];
        if (!title) missingFields.push('title');
        if (!content) missingFields.push('content');
        if (!target) missingFields.push('target');

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // inserting
        const supabase = await createBrowserSupabaseClient();
        const {data, error} = await supabase
        .from("Announcement")
        .insert([
            {
                UserID: userId,
                Title: title,
                Content: content,
                Target: target,
                CreatedAt: new Date()
            }
        ])
        .select()
        .single();

        if (error) {
            return NextResponse.json(
                { error: 'Failed to add vehicle: ' + error.message },
                { status: 500 }
            );
        }



        // success
        return NextResponse.json(
            {
                success: true,
                data: data.AnnouncementID
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Add Car POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}