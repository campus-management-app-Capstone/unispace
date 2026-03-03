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
    const { count, error } = await supabase
        .from('ParkingSession')
        .select('*', { count: 'exact', head: true })
        .is('End', null); // to get the current car parking on campus to calculate the availability
    if (error) {
        console.error('Supabase error fetching parking sessions:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count });
}


