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

    return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.sub;
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        // for is reserved argument
        const { amount, type, for: forField, stripeSessionID } = body;

        if (!amount || !type || !forField || !stripeSessionID) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, type, for' },
                { status: 400 }
            );
        }

        const supabase = await createBrowserSupabaseClient();

        // get user's wallet
        const { data: walletData, error: walletError } = await supabase
            .from('Wallet')
            .select('WalletID, Balance')
            .eq('UserID', userId)
            .single();

        if (walletError || !walletData) {
            return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        // calculate new balance
        const { WalletID, Balance } = walletData;
        const newBalance = type === 'Top up' 
            ? Balance + amount 
            : Balance - amount;

        // prevent negative balance for non-topup transactions
        if (newBalance < 0 && type !== 'Top up') {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            );
        }

        // insert transaction
        const { data: transactionData, error: transactionError } = await supabase
            .from('Transaction')
            .insert([
                {
                    WalletID,
                    Amount: amount,
                    Type: type,
                    For: forField,
                    StripeSessionID: stripeSessionID
                },
            ])
            .select()
            .single();

        if (transactionError) {
            return NextResponse.json(
                { error: 'Failed to create transaction: ' + transactionError.message },
                { status: 500 }
            );
        }

        // update wallet balance
        const { error: updateError } = await supabase
            .from('Wallet')
            .update({ Balance: newBalance })
            .eq('WalletID', WalletID);

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to update balance: ' + updateError.message },
                { status: 500 }
            );
        }

        // success
        return NextResponse.json(
            {
                success: true,
                transaction: transactionData,
                newBalance,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Wallet POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// // Top up
// const response = await fetch('/api/wallet', {
//     method: 'POST',
//     body: JSON.stringify({
//         amount: 50,
//         type: 'Top up',
//         for: 'Top up'
//     })
// });

// // Payment/Booking
// const response = await fetch('/api/wallet', {
//     method: 'POST',
//     body: JSON.stringify({
//         amount: 25,
//         type: 'Payment',
//         for: 'Booking'
//     })
// });