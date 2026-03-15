"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Student attendance sign-in page: 6-input code entry that validates the code
 * and records attendance via the /api/attendance/submit-code endpoint.
 */
export default function StudentAttendanceSignInPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function handleChange(index: number, value: string) {
    const sanitized = value.replace(/[^0-9A-Za-z]/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    setDigits(nextDigits);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (sanitized && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      const prevIndex = index - 1;
      const nextDigits = [...digits];
      nextDigits[prevIndex] = "";
      setDigits(nextDigits);
      inputRefs.current[prevIndex]?.focus();
      event.preventDefault();
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const code = digits.join("");

    if (code.length !== 6) {
      setErrorMessage("Please enter the full 6-character attendance code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/attendance/submit-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const msg = typeof payload?.error === "string" ? payload.error : "Unable to submit attendance.";
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage("Attendance recorded successfully.");
      setTimeout(() => {
        router.push("/student/attendance");
      }, 1200);
    } catch {
      setErrorMessage("Network error while submitting attendance.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-gray-500">Enter Attendance Code</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Sign In Attendance</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-14 w-12 rounded-md border-b-2 border-dashed border-gray-400 bg-transparent text-center text-2xl font-semibold tracking-[0.3em] text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-0"
                aria-label={`Attendance code digit ${index + 1}`}
              />
            ))}
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-green-600" role="status">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Attendance"}
          </button>
        </form>
      </div>
    </div>
  );
}

