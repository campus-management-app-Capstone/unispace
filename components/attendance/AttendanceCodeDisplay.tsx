"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Displays a 6-digit code with animated digit transitions (framer-motion).
 */
interface AttendanceCodeDisplayProps {
  code: string;
  className?: string;
}

export function AttendanceCodeDisplay({ code, className = "" }: AttendanceCodeDisplayProps) {
  const digits = (code || "000000").padStart(6, "0").slice(-6).split("");

  return (
    <div
      className={`flex justify-center gap-1 sm:gap-2 ${className}`}
      aria-label={`Attendance code: ${digits.join("")}`}
    >
      {digits.map((digit, index) => (
        <div
          key={`${index}-${digit}`}
          className="flex h-14 w-10 items-center justify-center rounded-lg bg-gray-900 text-2xl font-mono font-bold text-white shadow-md sm:h-16 sm:w-12 sm:text-3xl"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={digit}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
