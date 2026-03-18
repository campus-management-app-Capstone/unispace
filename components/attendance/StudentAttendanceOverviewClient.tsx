"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { SemesterAttendanceSummary, SubjectAttendanceRow } from "@/lib/database";

/**
 * Renders one subject row: name and Classes: X/Y (Z%).
 */
function SubjectRow({ subject }: { subject: SubjectAttendanceRow }) {
  const percentage =
    subject.total > 0
      ? Math.round((subject.attended / subject.total) * 100)
      : 100;

  return (
    <div className="px-5 py-4">
      <p className="text-sm font-medium text-gray-900">{subject.subjectName}</p>
      <p className="mt-1 text-xs text-gray-600">
        Classes: {subject.attended}/{subject.total} ({percentage}%)
      </p>
    </div>
  );
}

/**
 * Left card: semester selector (when multiple intakes) and selected semester's subject list.
 * All data is from Supabase (passed as props from server).
 */
export function SemesterCardWithSelector({
  semesters,
}: {
  semesters: SemesterAttendanceSummary[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const semester = semesters[selectedIndex]!;

  return (
    <section className="flex-1 rounded-2xl border border-gray-300 bg-white shadow-sm">
      <header className="border-b border-gray-300 px-5 py-3">
        {semesters.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="semester-select" className="text-sm font-medium text-gray-800">
              Semester:
            </label>
            <select
              id="semester-select"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
              aria-label="Select semester"
            >
              {semesters.map((s, i) => (
                <option key={s.intake} value={i}>
                  Intake {s.intake} ({s.overallPercentage}%)
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <h1 className="mt-1 text-sm font-medium text-gray-800">
          Intake {semester.intake} – Overall Attendance ({semester.overallPercentage}%)
        </h1>
      </header>

      <div className="divide-y divide-gray-200">
        {semester.subjects.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-gray-500">
            No subject attendance data for this intake yet.
          </div>
        ) : (
          semester.subjects.map((subject) => (
            <SubjectRow key={subject.subjectId} subject={subject} />
          ))
        )}
      </div>
    </section>
  );
}

/**
 * Right card: StudentID, Intake, overall intake attendance %, Sign in Attendance button.
 */
export function OverallCard({
  studentId,
  primaryIntake,
  overallIntakeAttendance,
}: {
  studentId: string;
  primaryIntake: string;
  overallIntakeAttendance: number;
}) {
  return (
    <aside className="w-full max-w-sm rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between text-sm text-gray-700">
        <span>{studentId}</span>
        <span>{primaryIntake || "—"}</span>
      </div>

      <div className="mb-6 text-center">
        <p className="text-xs font-medium text-gray-500">
          Overall Intake Attendance
        </p>
        <p className="mt-3 text-4xl font-semibold text-gray-900">
          {overallIntakeAttendance.toFixed(1)}%
        </p>
      </div>

      <Link
        href="/student/attendance/sign-in"
        className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-gray-700 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-900 hover:text-white"
      >
        Sign in Attendance
      </Link>
    </aside>
  );
}
