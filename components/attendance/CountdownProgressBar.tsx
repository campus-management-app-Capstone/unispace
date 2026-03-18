"use client";

import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

/**
 * Circular countdown progress for the 60s attendance code window.
 * Progress goes 0 -> 100% over 60 seconds from startTime (using date + startTime as window start).
 * Re-renders every second so the bar and "Next code in Xs" stay accurate.
 */
interface CountdownProgressBarProps {
  date: string;
  startTime: string;
  size?: number;
  className?: string;
}

function getProgressAndSeconds(
  date: string,
  startTime: string
): { progress: number; secondsRemaining: number } {
  const start = new Date(`${date}T${startTime}Z`);
  const elapsed = (Date.now() - start.getTime()) / 1000;
  const inWindow = ((elapsed % 60) + 60) % 60;
  const progress = (inWindow / 60) * 100;
  const secondsRemaining = Math.ceil(60 - inWindow);
  return { progress, secondsRemaining };
}

export function CountdownProgressBar({
  date,
  startTime,
  size = 120,
  className = "",
}: CountdownProgressBarProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { progress, secondsRemaining } = getProgressAndSeconds(date, startTime);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size }}>
        <CircularProgressbar
          value={progress}
          maxValue={100}
          strokeWidth={8}
          counterClockwise
          styles={buildStyles({
            pathColor: "hsl(220 70% 50%)",
            trailColor: "hsl(220 20% 94%)",
            textColor: "hsl(220 10% 30%)",
          })}
        />
      </div>
      <span className="text-sm font-medium text-gray-600">
        Next code in {secondsRemaining}s
      </span>
    </div>
  );
}
