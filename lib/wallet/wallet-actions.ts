"use server"
// client helper - avoids importing server packages into a browser bundle
// pages -> lib file -> api (usually for thrid party call)
// can also pages -> lib file for all back end

// stripe top up flow: 
// user from frontend click Confirm Top up (wallet page) 
// fucntion in frontend send request and wait for response to get the payment page url, by importing the fucntion created in wallet-actions ( components/TopUpModal.ts)
// lib/wallet/wallet-actions handle request and create top up session, return {success:true, session_url: session.url} or (error) {success: false, message: "Error when paying"} in try catch
// TopupModal.ts get the payment page and redirect:   
    //    if (response.data.success) {
    //   if response is {} format, then need to use {} 
    //   const { session_url } = response.data;
    //   window.location.replace(session_url);
    // }
    // else {
    //   toast.error("Error when paying");
    // }
// after payment success or fail stripe will redirect to success_url / cancel_url set when create session
    // to get the success and orderId in the url
    // const [searchParams, setSearchParams] = useSearchParams();
    // const success = searchParams.get("success");
    // const orderId = searchParams.get("orderId");
// is success_url: insert to database (/api/wallet/route.ts)

import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// visa test card
// 4242424242424242

export async function createTopUpSession({ amount }) {
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // validate amount to prevent NaN or too-small values
    amount = Number(amount);
    if (isNaN(amount) || amount < 5) {
        throw new Error("Invalid top-up amount");
    }

    // create stripe session
    const session = await stripe.checkout.sessions.create({
        // payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'myr',
                    product_data: {
                        name: 'Wallet Top-Up',
                    },
                    unit_amount: Math.round(amount) * 100, // Stripe use cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        // after success or failed url
        success_url: `${frontendUrl}/verify/topup?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/verify/topup?success=false`,

        metadata: {
            userId: userId,
            type: 'top_up'
        }
    });
    return session.url;
}

export async function getCheckoutSession(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
        amount: session.amount_total! / 100, // Convert back to RM
        currency: session.currency,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        metadata: session.metadata
    };
}