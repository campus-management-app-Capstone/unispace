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
        const { RegisteredCarID } = body;

        const missingFields: string[] = [];
        if (!RegisteredCarID) missingFields.push('car id');
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        const supabase = await createBrowserSupabaseClient();

        // prevent double park
        const { data: existingSession } = await supabase
            .from('ParkingSession')
            .select('ParkingSessionID')
            .eq('RegisteredCarID', RegisteredCarID)
            .is('End', null) // Look for an active session
            .maybeSingle();

        if (existingSession) {
            return NextResponse.json({ error: 'This car is already parked!' }, { status: 400 });
        }

        // check available slot
        // get curretn count
        const maxCarparkCapacity = 400;
        const { count } = await supabase
            .from('ParkingSession')
            .select('*', { count: 'exact', head: true })
            .is('End', null);

        if ((count || 0) >= maxCarparkCapacity) {
            return NextResponse.json({ error: 'The parking lot is completely full.' }, { status: 400 });
        }

        const { error } = await supabase
            .from("ParkingSession")
            .insert({
                RegisteredCarID: RegisteredCarID
            })
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // success
        return NextResponse.json(
            {
                success: true
            },
            { status: 201 }
        );



    } catch (error) {
        console.error('Save Car POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}