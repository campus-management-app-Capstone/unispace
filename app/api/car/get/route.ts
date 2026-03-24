import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";


export async function GET() {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.sub;
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createBrowserSupabaseClient();
    const { data, error } = await supabase
        .from('RegisteredCar')
        .select(
            `
            RegisteredCarID,
            Carplate,
            VehicleMade,
            VehicleModel,
            ParkingSession (
                ParkingSessionID,
                Start,
                End
            )
        `
        )
        .eq('UserID', userId)
        .order('Start', { foreignTable: 'ParkingSession', ascending: false })
        .limit(1, { foreignTable: 'ParkingSession' }) // only get newest parking session
        .is('ParkingSession.End', null); // seek car that only still parking if have parking session, if have end, it will not get the session 

    if (error) {
        console.error('Supabase error fetching wallet:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // 
    // data look like
    // [
    //   {
    //     "RegisteredCarID": 1,
    //     "Carplate": "ABC 1234",
    //     "VehicleMade": "Toyota",
    //     "VehicleModel": "Camry",
    //     "ParkingSession": [
    //       { 
    //     "ParkingSessionID": 99, 
    //     "Start": "2026-03-01T08:00:00Z", 
    //     "End": null 
    //   }
    //     ]
    //   },
    //   {
    //     "RegisteredCarID": 2,
    //     "Carplate": "XYZ 9876",
    //     "VehicleMade": "Honda",
    //     "VehicleModel": "Civic",
    //     "ParkingSession": []
    //   }
    // ]

    return NextResponse.json({ success: true, data });
}