// get all facility data only

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
        .from('Facility')
        .select(
            `
            FacilityID,
            Name,
            Type
            `
        )

    if (error) {
        console.error('Supabase error fetching facility:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }


    return NextResponse.json({ success: true, data });
}