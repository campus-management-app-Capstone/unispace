import { NextResponse } from 'next/server';
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
        .from('Wallet')
        .select(
            `
            WalletID,
            Balance,
            Transaction (
                TransactionID,
                Amount,
                Type,
                Time,
                "For"
            )
        `
        )
        .eq('UserID', userId)
        .order('Time', { foreignTable: 'Transaction', ascending: false})
        .single();
        

    if (error) {
        console.error('Supabase error fetching wallet:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}