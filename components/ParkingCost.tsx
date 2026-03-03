import { useState, useEffect } from 'react';
import { getParkingCost } from "@/lib/getParkingCost";

export default function ParkingCost({ startTime }: { startTime: string }) {
    const [cost, setCost] = useState(0);

    useEffect(() => {
        setCost(getParkingCost(startTime));

        //  update it every 5 second
        const timer = setInterval(() => {
            setCost(getParkingCost(startTime));
        }, 5000);

        // Cleanup the timer
        return () => clearInterval(timer);
    }, [startTime]);

    return (
        <span className="text-slate-900 dark:text-white font-mono font-bold">
            RM{cost}.00
        </span>
    );
}