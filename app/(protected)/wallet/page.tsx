import React from 'react';
import { Button } from "@/components/ui/button";

type Transaction = {
    id: string;
    amount: number;
    time: string;
    type: "Top up" | "Payment";
    for: "Booking" | "Parking" | "Top up";
};

// mock data
const transactions: Transaction[] = [
    { id: "t1", amount: 50.00, time: "Today, 10:30 AM", type: "Top up", for: "Top up" },
    { id: "t2", amount: 15.00, time: "Yesterday, 2:15 PM", type: "Payment", for: "Parking" },
    { id: "t3", amount: 12.50, time: "Oct 24, 1:00 PM", type: "Payment", for: "Parking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
    { id: "t4", amount: 5.00, time: "Oct 22, 9:00 AM", type: "Payment", for: "Booking" },
];

const page = () => {
    return (
        <div className="relative h-screen overflow-hidden">

            {/* small background design */}
            <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/30 blur-[80px] mix-blend-multiply animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-400/30 blur-[100px] mix-blend-multiply z-[-10]"></div>
                <div className="absolute bottom-1 right-0 w-[400px] h-[400px] rounded-full bg-pink-300/30 blur-[80px] mix-blend-multiply opacity-70"></div>
            </div>

            {/* Main */}
            <div className="relative z-10 max-w-3xl mx-auto p-6 space-y-8 h-full flex flex-col">

                {/* balance */}
                <div className="shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-blue-100 font-medium mb-1">Available Balance</h1>
                            <p className="text-5xl font-bold tracking-tight">$100.00</p>
                        </div>

                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 rounded-full"
                        >
                            Top up
                        </Button>
                    </div>
                </div>

                {/* transantions */}
                <div className="flex-1 min-h-0 flex flex-col space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-y-auto flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        {transactions.map((tx) => {
                            const isTopUp = tx.type === "Top up";

                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Left: Icon Details */}
                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isTopUp ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {isTopUp ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-800">{tx.for}</p>
                                            <p className="text-sm text-gray-500">{tx.time}</p>
                                        </div>
                                    </div>

                                    {/* Right: Amount */}
                                    <div className="text-right">
                                        <p className={`font-bold ${isTopUp ? 'text-green-600' : 'text-gray-800'}`}>
                                            {isTopUp ? '+' : '-'}{tx.amount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default page;