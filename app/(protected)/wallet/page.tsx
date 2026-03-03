"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TopupButton } from "@/components/TopUpModal";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

// format date time
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-MY', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);
};

const monthList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
const yearList: number[] = [];

const generateYearList = () => {
    const firstYear = 2020;
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= firstYear; year--) {
        yearList.push(year);
    }
};

generateYearList();

const Page = () => {
    const [wallet, setWallet] = useState<any>(null);
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [filterYear, setFilterYear] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     console.log("Month: " + filterMonth);
    //     console.log("Year: " + filterYear);
    // },
    // [filterMonth, filterYear]);

    useEffect(() => {
        const id = toast.loading("Loading…");
        const fetchWalletData = async () => {
            try {
                const response = await fetch('/api/wallet');
                const result = await response.json();

                if (response.ok && result.success) {
                    // Save the data object into your state
                    setWallet(result.data);

                    toast.update(id, {                
                        render: "Loading completed",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000,
                    });
                } else {
                    toast.error(result.error || "Failed to load wallet");
                }
            } catch (err) {
                console.error("Fetch crashed:", err);
                toast.error("Network error occurred.");
            }
            setIsLoading(false);
        };

        fetchWalletData();
    }, []);

    let filteredTransactions = wallet?.Transaction?.filter((tx: any) => {
        const d = new Date(tx.Time);
        if (filterMonth && monthList[d.getMonth()] !== filterMonth) {
            return false;
        }
        if (filterYear && d.getFullYear().toString() !== filterYear) {
            return false;
        }
        return true;
    });

    if (isLoading) {
        return
    }

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
                            <p className="text-5xl font-bold tracking-tight">RM {wallet?.Balance?.toFixed(2) ?? "0.00"}</p>
                        </div>

                        <TopupButton currentBalance={wallet?.Balance?.toFixed(2) ?? "0.00"} />
                    </div>
                </div>

                {/* transantions */}
                <div className="flex-1 min-h-0 flex flex-col space-y-4">
                    <div className="flex justify-between items-center pb-2">
                        <h2 className="text-xl font-bold text-gray-800">Transactions</h2>

                        <div className="flex items-center gap-2">
                            {/* month filter */}
                            <Select onValueChange={(month) => setFilterMonth(month)}>
                                <SelectTrigger className="w-[80px] bg-white border border-gray-300 shadow-sm text-gray-900 font-medium hover:bg-gray-50 hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Month</SelectLabel>
                                        {monthList.map((month) => (
                                            <SelectItem key={month} value={month}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {/* year filter */}
                            <Select onValueChange={(year) => setFilterYear(year)}>
                                <SelectTrigger className="w-[80px] bg-white border border-gray-300 shadow-sm text-gray-900 font-medium hover:bg-gray-50 hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Year</SelectLabel>
                                        {yearList.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        {/* check if no transaction */}
                        {(!filteredTransactions || filteredTransactions.length === 0) ? (
                            // no transactions
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center h-full">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-900 font-medium text-lg">No transactions yet</h3>
                                <p className="text-gray-500 mt-1 max-w-sm text-sm">
                                    When you top up your wallet or pay for campus facilities, your history will appear here.
                                </p>
                            </div>
                        ) : (
                            // transaction list
                            filteredTransactions.map((tx: any) => {
                                const isTopUp = tx.Type === "Top up";

                                return (
                                    <div
                                        key={tx.TransactionID}
                                        className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* left: icon details */}
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full ${isTopUp ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
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
                                                <p className="font-semibold text-gray-800">{tx.For}</p>
                                                <p className="text-sm text-gray-500">{formatDateTime(tx.Time)}</p>
                                            </div>
                                        </div>

                                        {/* right: amount */}
                                        <div className="text-right shrink-0">
                                            <p className={`font-bold ${isTopUp ? 'text-green-600' : 'text-gray-800'}`}>
                                                {isTopUp ? '+' : '-'}{tx.Amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;