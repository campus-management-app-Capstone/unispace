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
        const {annID} = body;

        const missingFields: string[] = [];
        if (!annID) missingFields.push('annID');

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        //deleting
        const supabase = await createBrowserSupabaseClient();
        const {data, error} = await supabase
        .from("Announcement")
        .delete()
        .eq("AnnouncementID", annID)

        if (error) {
            return NextResponse.json(
                { error: 'Failed to add vehicle: ' + error.message },
                { status: 500 }
            );
        }

        // success
        return NextResponse.json(
            {
                success: true
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Add Car POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}