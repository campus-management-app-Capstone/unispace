import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function POST(req: NextRequest) {
    const { sessionClaims } = await auth();
    const UserID = sessionClaims?.sub;
    if (!UserID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { booking } = await req.json();

        const missingFields: string[] = [];
        if (!booking) missingFields.push('booking');

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        const supabase = await createBrowserSupabaseClient();

        // prevent double booking
        const requestedStartTimes = booking.map(b => b.StartTime);
        const requestedFacilityID = booking[0].FacilityID;
        const { data: existingBookings, error: checkError } = await supabase
            .from('Booking')
            .select('BookingID, StartTime')
            .eq('FacilityID', requestedFacilityID)
            .in('StartTime', requestedStartTimes);

        if (checkError) {
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        if (existingBookings && existingBookings.length > 0) {
            // at least one of the slots is already taken
            return NextResponse.json(
                {
                    success: false,
                    error: "Someone just booked one of these slots! Please refresh and try again."
                },
                { status: 409 });
        }

        // can book it
        // insert user id
        booking.forEach(book => {
            book.UserID = UserID
        });

        const { data, error: insertError } = await supabase
            .from('Booking')
            .insert(booking);

        if (insertError) {
            console.error("Supabase Query Error:", insertError);
            return NextResponse.json({ error: 'Failed to book.' }, { status: 403 });
        }

        // success
        return NextResponse.json(
            {
                success: true,
            },
            { status: 200 }
        );


    } catch (error) {
        console.error('Fetch Facility Availability POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
