import { useState, useEffect } from 'react';
import { getElapsedTime } from "@/lib/getElapsedTime";

export default function ParkingTimer({ startTime }: { startTime: string }) {
    const [elapsed, setElapsed] = useState("00:00:00");

    useEffect(() => {
        setElapsed(getElapsedTime(startTime));

        //  update it every 1 second
        const timer = setInterval(() => {
            setElapsed(getElapsedTime(startTime));
        }, 1000);

        // Cleanup the timer
        return () => clearInterval(timer);
    }, [startTime]);

    return (
        <span className="text-slate-900 dark:text-white font-mono font-bold">
            {elapsed}
        </span>
    );
}