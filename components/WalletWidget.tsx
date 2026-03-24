"use client"
import { Wallet, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function WalletWidget() {
  const [wallet, setWallet] = useState<{ Balance: number } | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch('/api/wallet');
        const result = await response.json();

        if (response.ok && result.success) {
          setWallet(result.data);
        } else {
          toast.error(result.error || "Failed to load wallet");
        }
      } catch (err) {
        console.error("Fetch crashed:", err);
        toast.error("Network error occurred.");
      }
    };

    fetchWalletData();
  }, []);

  return (
    <Link href="/wallet" className="block col-span-1 hover:opacity-95 transition-opacity">
      <div className="bg-[#00478d] text-white rounded-xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm h-full">
        <div className="flex flex-col">
          <Wallet className="size-6 text-white/70 mb-3" />
          <h3 className="font-bold text-sm">Wallet</h3>
        </div>
        <div>
          <div className="text-3xl font-bold">
            RM {wallet ? wallet.Balance.toFixed(2) : "0.00"}
          </div>
          <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-1">Available</p>
        </div>
      </div>
    </Link>
  );
}