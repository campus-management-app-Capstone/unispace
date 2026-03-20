import { Button } from "@base-ui/react";
import { useEffect, useState } from "react";
import { X, Wallet, Zap, Lock, Wallet2 } from "lucide-react";
import { toast } from "react-toastify";
import { redirect } from "next/dist/server/api-utils";
import { createTopUpSession } from "@/lib/wallet/wallet-actions"; 
import { createPortal } from "react-dom";

// top up pop up when user click top up button
export const TopupButton = ({ currentBalance }) => {

    const [showModal, setShowModal] = useState(false);
    const [inputAmount, setInputAmount] = useState(0.00);
    const [isLoading, setIsLoading] = useState(false);

    // // useEffect(()=>{
    // //     console.log("Input Amount: " + inputAmount);
    // // }
    // // ,[inputAmount]);

    // top up handler
    const handleTopUp = async () => {
        // min 5
        if (!inputAmount || inputAmount < 5) {
            toast.error("Minimum Top Up Amount is RM 5.00");
            return;
        }

        setIsLoading(true);
        try {
            // pass object ({amount}) per helper signature
            const checkoutUrl = await createTopUpSession({ amount: inputAmount });

            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            }
        } catch (error) {
            console.log("Top Up Failed: " + error);
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Button
                variant="secondary"
                className="flex items-center justify-center gap-8 w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-2 rounded-full cursor-pointer transition-colors"
                onClick={() => setShowModal(true)}
            >
                Top up
            </Button>

            {showModal ? createPortal(
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

                    <div className="relative w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">

                        {/* --- Header --- */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Top Up Balance</h1>

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setInputAmount(0.00);
                                }}
                                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* --- Content --- */}
                        <div className="p-4">

                            {/* Current Balance */}
                            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Current Balance</p>
                                    {/* Note: Drop your safeBalance variable here! */}
                                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">RM {currentBalance}</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Wallet />
                                </div>
                            </div>

                            {/* Select Options */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Select Amount</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        className="flex flex-col items-center justify-center py-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                        onClick={() => setInputAmount(10.00)}
                                    >
                                        <span className="text-xs font-medium opacity-70">RM</span>
                                        <span className="text-lg">10</span>
                                    </button>
                                    <button
                                        className="flex flex-col items-center justify-center py-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                        onClick={() => setInputAmount(20.00)}>
                                        <span className="text-xs font-medium opacity-70">RM</span>
                                        <span className="text-lg">20</span>
                                    </button>
                                    <button
                                        className="flex flex-col items-center justify-center py-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                        onClick={() => setInputAmount(50.00)}>
                                        <span className="text-xs font-medium opacity-70">RM</span>
                                        <span className="text-lg">50</span>
                                    </button>
                                </div>
                            </div>

                            {/* Custom Input */}
                            <div className="mb-8">
                                {/* htmlfor will jump to input which match the id */}
                                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2" htmlFor="amount">Other Amount</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-bold">RM</span>
                                    </div>
                                    <input className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-lg placeholder:font-normal placeholder:text-slate-400 transition-all"
                                        id="amount"
                                        name="amount"
                                        placeholder="0"
                                        type="number"
                                        value={inputAmount}
                                        onChange={(e) => { setInputAmount(Math.round(e.target.value)) }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">Minimum top-up amount is RM 5.00</p>
                            </div>

                            {/* --- Actions --- */}
                            <div className="space-y-3">
                                <button
                                    className="w-full flex items-center justify-center gap-2 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-base transition-all shadow-lg shadow-blue-600/20"
                                    onClick={handleTopUp}
                                    disabled={isLoading}
                                >
                                    <Zap />
                                    {isLoading? "Redirecting to Payment..." : "Confirm Top Up"}
                                </button>

                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setInputAmount(0.00);
                                    }}
                                    className="w-full h-12 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-semibold text-sm transition-all"
                                >
                                    Cancel and Return
                                </button>
                            </div>
                        </div>

                        {/* --- Footer --- */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secure by Stripe</span>
                        </div>

                    </div>
                </div>, document.body
            ) : null}
        </div>
    );

};

