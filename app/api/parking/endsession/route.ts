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
        const { ParkingSessionID, RegisteredCarID } = body;

        const missingFields: string[] = [];
        if (!ParkingSessionID) missingFields.push('parking session');
        if (!RegisteredCarID) missingFields.push('registered car ID');
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        const supabase = await createBrowserSupabaseClient();

        // check car ownership
        const { data: carOwnerCheck, error: ownerError } = await supabase
            .from('RegisteredCar')
            .select('RegisteredCarID')
            .eq('RegisteredCarID', RegisteredCarID)
            .eq('UserID', UserID)
            .maybeSingle();

        if (!carOwnerCheck || ownerError) {
            return NextResponse.json({ error: 'Unauthorized: You do not own this vehicle.' }, { status: 403 });
        }

        // get current time
        const now = new Date().toISOString();
        const pgFormat = now.replace('T', ' ');
        const currentTime = pgFormat.replace('Z', '000+00');

        // update end time
        const { error } = await supabase
            .from("ParkingSession")
            .update({
                End: currentTime
            })
            .eq("ParkingSessionID", ParkingSessionID)
            .eq("RegisteredCarID", RegisteredCarID);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // success
        return NextResponse.json(
            {
                success: true
            },
            { status: 200 }
        );



    } catch (error) {
        console.error('Save Car POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}