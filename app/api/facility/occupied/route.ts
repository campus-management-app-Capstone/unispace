import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export async function POST(req: NextRequest) {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.sub;
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { facilityID, type, selectedDate } = await req.json();

        const missingFields: string[] = [];
        if (!facilityID) missingFields.push('facilityID');
        if (!type) missingFields.push('facilityType');
        // if (!selectedDate) missingFields.push('selectedDate');

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        const supabase = await createBrowserSupabaseClient();

        // for facility
        if (type === "Facility") {

            const { data, error } = await supabase
                .from('Booking')
                .select(`
                    StartTime,
                    EndTime    
                `)
                .eq("FacilityID", facilityID)
                .gte("StartTime", `${selectedDate}T00:00:00`)
                .lte("StartTime", `${selectedDate}T23:59:59`);

            if (error) {
                console.error("Supabase Query Error:", error);
                return NextResponse.json({ error: 'Failed to fetch availability.' }, { status: 403 });
            }

            // empty data
            if (!data || data.length === 0) {
                return NextResponse.json({ success: true, data: [] }, { status: 200 })
            }

            // success
            return NextResponse.json(
                {
                    success: true,
                    data
                },
                { status: 200 }
            );
        }
        // for classroom, labs
        else {
            const { data, error } = await supabase
                .from('TimetableSlot')
                .select(`
                    Day,
                    Start,
                    End    
                `)
                .eq("FacilityID", facilityID)

            if (error) {
                console.error("Supabase Query Error:", error);
                return NextResponse.json({ error: 'Failed to fetch availability.' }, { status: 403 });
            }

            // empty data
            if (!data || data.length === 0) {
                return NextResponse.json({ success: true, data: [] }, { status: 200 })
            }

            // success
            return NextResponse.json(
                {
                    success: true,
                    data
                },
                { status: 200 }
            );
        }


    } catch (error) {
        console.error('Fetch Facility Availability POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
