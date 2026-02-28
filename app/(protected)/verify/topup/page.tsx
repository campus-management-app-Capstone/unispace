"use client"

import { Spinner } from '@/components/ui/spinner';
import { getCheckoutSession } from '@/lib/wallet/wallet-actions';
import { Info, XIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [verifying, setVerifying] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [transactionID, setTransactionID] = useState();
    const [topupAmount, setTopupAmount] = useState();
    const [type, setType] = useState();
    const [newBalance, setNewBalance] = useState();

    // to get the success and orderId in the url
    const verifyPayment = async () => {
        const success = searchParams.get("success");
        if (success === "true") {

            const sessionId = searchParams.get("session_id");
            if (sessionId) {
                // get info from stripe
                const session = await getCheckoutSession(sessionId);

                // call insert api
                const response = await fetch('/api/wallet', {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: session.amount,
                        type: 'Top up',
                        for: 'Top up',
                        stripeSessionID: sessionId
                    })
                });

                const result = await response.json();
                // transaction: transactionData (TransactionID, Amount, Type, For)
                // newBalance
                if (response.ok && result.success) {
                    setTransactionID(result.transaction.TransactionID);
                    setTopupAmount(result.transaction.Amount);
                    setType(result.transaction.Type);
                    setNewBalance(result.newBalance);
                    setIsSuccess(true);
                    setVerifying(false);
                } else {
                    setIsSuccess(false);
                    setVerifying(false);
                }
            } else {
                setIsSuccess(false);
                setVerifying(false);
            }
        } else {
            setIsSuccess(false);
            setVerifying(false);
        }
    }

    useEffect(() => {
        verifyPayment();
    }, [])

    return (
        <div className='verify'>
            {
                verifying ?
                    <main className="min-h-screen flex items-center justify-center p-4">
                        <div className="max-w-md w-full flex flex-col items-center justify-center">
                            {/* <!-- Progress Visualizer --> */}
                            <div className="relative flex items-center justify-center mb-12">
                                {/* <!-- Glowing effect background --> */}
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
                                {/* <!-- Large Spinner --> */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                                    <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                </div>
                            </div>
                            {/* <!-- Status Text --> */}
                            <div className="text-center space-y-3 mb-10">
                                <h1 className="text-2xl font-bold">Verifying your transaction...</h1>
                                <p className="text-slate-500 dark:text-slate-400">We are securely processing your payment. This usually takes a few seconds.</p>
                            </div>

                            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-12">Please do not refresh or close this page</p>

                        </div>
                    </main>

                    : isSuccess ?

                        // success ui
                        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
                            <div className="max-w-[560px] w-full flex flex-col items-center text-center">
                                {/* <!-- Success Icon --> */}
                                <div className="mb-8 relative">
                                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150"></div>
                                    <div className="relative flex items-center justify-center w-24 h-24 bg-green-500 rounded-full text-white shadow-lg shadow-green-500/30">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 -960 960 960"
                                            fill="currentColor"
                                            className="w-16 h-16"
                                        >
                                            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                                        </svg>
                                    </div>
                                </div>
                                <h1 className="text-slate-900 dark:text-white tracking-tight text-4xl font-extrabold leading-tight mb-2">Top up complete</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg mb-10">Your digital wallet has been successfully funded.</p>
                                {/* <!-- Transaction Summary Card --> */}
                                <div className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm mb-10">
                                    <div className="p-6">
                                        <div className="flex flex-col gap-6">
                                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">Amount</span>
                                                <span className="text-2xl font-bold text-slate-900 dark:text-white">RM{topupAmount}</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Transaction ID</p>
                                                    <p className="text-slate-900 dark:text-slate-200 font-semibold">{transactionID}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Type</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary text-sm">{type}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">New Balance</p>
                                                    <div className="flex items-center gap-1.5 text-green-500">
                                                        <span className="size-2 bg-green-500 rounded-full"></span>
                                                        <p className="font-semibold">{newBalance}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex items-center gap-3">
                                        <Info />
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-left">Funds are now available for immediate use in your balance.</p>
                                    </div>
                                </div>
                                {/* <!-- Action Buttons --> */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <button
                                        className="flex-1 flex items-center justify-center rounded-lg h-14 bg-primary text-white text-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                                        onClick={() => router.push("/wallet")}
                                    >
                                        Back to Wallet Page
                                    </button>
                                </div>
                            </div>
                        </main>
                        :
                        // failed ui
                        <main className="flex flex-1 items-center justify-center p-6">
                            <div className="layout-content-container flex flex-col max-w-[480px] w-full bg-white dark:bg-slate-900/50 rounded-xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
                                {/* failure icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="size-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400">
                                        <XIcon />
                                    </div>
                                </div>
                                <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl md:text-3xl font-bold leading-tight text-center mb-4">
                                    Top up failed
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed text-center mb-10">
                                    Something went wrong with your transaction. Your bank might have declined the request. Please check your payment method or try again.
                                </p>
                                {/* <!-- Action Buttons --> */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        className="flex items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal transition-colors w-full shadow-lg shadow-primary/20 gap-2 cursor-pointer"
                                        onClick={() => router.push("/wallet")}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 810" width="24" height="24" fill="#FFFFFF" className="opacity:1;"><path d="M403 3q67 0 127 24t106 68t74 102t31 126q3 72-22 136t-71 112t-108 76t-135 28q-58 0-110-19t-95-51q-4-3-4-9t3-9l50-49q7-7 15-2q30 22 66 34t75 12q54 0 101-22t81-59t50-86t10-104q-5-41-23-78t-46-65t-64-47t-78-24q-54-6-102 9t-86 48t-60 76t-25 97h69L116 466L0 327h70q2-67 29-126t72-103t105-70T403 3" /></svg>
                                        <span>Try Again</span>
                                    </button>
                                </div>
                            </div>
                        </main>

            }
        </div>
    )
}

export default page
