import React from "react";
import Link from "next/link";

/**
 * Placeholder page for manual timetable creation.
 * Scheduling is now triggered from the timetable overview page.
 */
export default function TimetableAddPage() {
  return (
    <div className="mx-auto w-full space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Manual scheduling</h1>
      <p className="text-sm text-gray-600">
        Manual timetable creation is not implemented. Use the Schedule button on the timetable
        overview page to generate slots automatically.
      </p>
      <Link
        href="/admin/timetable"
        className="inline-flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Back to Timetable
      </Link>
    </div>
  );
}

