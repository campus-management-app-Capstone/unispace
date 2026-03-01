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
        const {Carplate, VehicleMade, VehicleModel} = body;

        const missingFields: string[] = [];
        if (!Carplate) missingFields.push('carplate');
        if (!VehicleMade) missingFields.push('vehicle made');
        if (!VehicleModel) missingFields.push('vehicle model');

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // inserting
        const supabase = await createBrowserSupabaseClient();
        const {data, error} = await supabase
        .from("RegisteredCar")
        .insert([
            {
                UserID,
                Carplate,
                VehicleMade,
                VehicleModel
            }
        ])
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
                success: true
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