"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Input payload sent to the VoltAgent tool endpoint for timetable scheduling.
 */
interface AssignTimetableSlotsInput {
  rescheduleAll: boolean;
  dryRun: boolean;
  days: string[];
  dayStartTime: string;
  dayEndTime: string;
  timeStepMinutes: number;
  defaultDurationMinutes: number;
  minimumGapMinutes: number;
  maximumGapMinutes: number;
  maxClassesPerDayPerStudent: number;
  maxClassesPerDayPerLecturer: number;
  maxClassesPerDayPerCohort: number;
}

/**
 * Minimal tool execution response shape from the VoltAgent server.
 */
interface ToolExecuteResponse {
  success: boolean;
  data?: { result?: unknown };
  error?: string;
}

/**
 * Trigger the VoltAgent scheduling workflow and return the tool result.
 */
async function triggerScheduling(baseUrl: string, input: AssignTimetableSlotsInput) {
  const response = await fetch(`${baseUrl}/tools/assign_timetable_slots/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input }),
  });

  const json = (await response.json()) as ToolExecuteResponse;
  if (!json.success) throw new Error(json.error ?? "Scheduling failed");
  return json.data?.result;
}

/**
 * Button to run VoltAgent scheduling from the admin timetable page.
 * - Calls the external VoltAgent tool HTTP endpoint directly from the browser.
 * - Refreshes the current route after success so server-rendered Supabase data updates.
 */
export function ScheduleTimetableButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSucceeded, setHasSucceeded] = useState(false);

  const baseUrl = useMemo(() => {
    const envUrl = process.env.NEXT_PUBLIC_VOLTAGENT_URL?.trim();
    return envUrl && envUrl.length > 0 ? envUrl : "http://localhost:3141";
  }, []);

  const input = useMemo<AssignTimetableSlotsInput>(
    () => ({
      // Only schedule unassigned classes (per your requirement).
      rescheduleAll: false,
      dryRun: false,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      dayStartTime: "08:00",
      dayEndTime: "18:00",
      timeStepMinutes: 15,
      defaultDurationMinutes: 60,
      minimumGapMinutes: 15,
      maximumGapMinutes: 180,
      maxClassesPerDayPerStudent: 4,
      maxClassesPerDayPerLecturer: 4,
      maxClassesPerDayPerCohort: 4,
    }),
    []
  );

  function handleClick() {
    setErrorMessage(null);
    setHasSucceeded(false);

    startTransition(async () => {
      try {
        await triggerScheduling(baseUrl, input);
        setHasSucceeded(true);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Scheduling failed";
        setErrorMessage(message);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-disabled={isPending}
        className="inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Scheduling..." : "Schedule"}
      </button>

      {errorMessage ? (
        <p className="max-w-md text-right text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {hasSucceeded ? (
        <p className="text-right text-xs text-emerald-700" role="status">
          Scheduling completed. Refreshing timetable...
        </p>
      ) : null}
    </div>
  );
}

