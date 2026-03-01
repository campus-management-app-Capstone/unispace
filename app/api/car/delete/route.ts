import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function POST(request: NextRequest) {
    const { sessionClaims } = await auth();
    const UserID = sessionClaims?.sub;
    if (!UserID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // checking
        const {RegisteredCarID} = body;

        const missingFields: string[] = [];
        if (!RegisteredCarID) missingFields.push('car id');

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // deleting
        const supabase = await createBrowserSupabaseClient();
        const {error} = await supabase
        .from("RegisteredCar")
        .delete()
        .eq("RegisteredCarID", RegisteredCarID)
        .eq("UserID", UserID);
        
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
            { status: 201 }
        );

    } catch (error) {
        console.error('Delete Car POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}