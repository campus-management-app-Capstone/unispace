"use client"
import { SquareParking } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ParkingWidget() {
  const MAX_CAPACITY = 400;
  const [availableSlots, setAvailableSlots] = useState<number | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch("/api/parking/get");
        const result = await response.json();

        if (response.ok && result.success) {
          // Assuming result.count is the number of currently parked cars
          setAvailableSlots(MAX_CAPACITY - result.count);
        } else {
          console.log("Failed to fetch car park availability");
        }
      } catch (error) {
        console.error("Fetch crashed:", error);
      }
    };

    fetchAvailability();
  }, []);

  const percentage = availableSlots !== null 
    ? Math.max(0, Math.min(100, (availableSlots / MAX_CAPACITY) * 100))
    : 0;

  // Change bar color if parking is getting full
  let barColor = "bg-emerald-400"; // Plenty of space
  if (percentage < 15) barColor = "bg-red-500"; // Almost full (less than 60 slots)
  else if (percentage < 40) barColor = "bg-amber-400"; // Filling up (less than 160 slots)

  return (
    <Link href="/parking" className="block col-span-1 hover:opacity-95 transition-opacity">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col justify-between min-h-[160px] h-full">
        <div className="flex flex-col">
          <SquareParking className="size-6 text-blue-600 mb-3" />
          <h3 className="font-bold text-sm text-slate-900">Parking</h3>
        </div>
        
        <div>
          <div className="text-3xl font-bold text-slate-900">
            {availableSlots !== null ? availableSlots : "--"}
            <span className="text-base font-normal text-slate-500">/{MAX_CAPACITY}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Slots Free</p>
          
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`${barColor} h-full rounded-full transition-all duration-1000 ease-out`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}