"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

/**
 * Lecturer attendance page (1/2): assign attendance by selecting subject, class, date and duration,
 * then redirect to the attendance code page.
 */
interface LecturerClass {
  ClassID: string;
  Group: string;
  SubjectID: string;
  Type: string | null;
  Subject: { SubjectID: string; Name: string; Duration?: number | null } | null;
}

export default function LecturerAttendancePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<LecturerClass[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const subjects = useMemo(() => {
    const byId = new Map<string, string>();
    classes.forEach((c) => {
      if (c.Subject?.SubjectID) byId.set(c.Subject.SubjectID, c.Subject.Name ?? c.Subject.SubjectID);
    });
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [classes]);

  const classesForSubject = useMemo(() => {
    if (!selectedSubjectId) return classes;
    return classes.filter((c) => c.Subject?.SubjectID === selectedSubjectId);
  }, [classes, selectedSubjectId]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.ClassID === selectedClassId),
    [classes, selectedClassId]
  );
  const durationHours = selectedClass?.Subject?.Duration ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/attendance/lecturer-classes");
        if (!res.ok) return;
        const data = await res.json();
        const list = data.classes ?? [];
        if (!cancelled) {
          setClasses(list);
          if (list.length) {
            const first = list[0];
            if (!selectedClassId) setSelectedClassId(first.ClassID);
            if (first?.Subject?.SubjectID)
              setSelectedSubjectId(first.Subject.SubjectID);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount to set initial class/subject only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSubjectId && subjects.length) setSelectedSubjectId(subjects[0]?.id ?? "");
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (classesForSubject.length && !classesForSubject.some((c) => c.ClassID === selectedClassId))
      setSelectedClassId(classesForSubject[0].ClassID);
    else if (classesForSubject.length && !selectedClassId)
      setSelectedClassId(classesForSubject[0].ClassID);
  }, [classesForSubject, selectedClassId]);

  const handleAssign = async () => {
    if (!selectedClassId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign attendance");
      const attendanceId = data.attendanceId;
      if (attendanceId) router.push(`/lecturer/attendance/${attendanceId}`);
      else throw new Error("No attendance session id returned");
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Failed to assign attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Take Attendance</h1>
      <p className="text-sm text-gray-600">
        Select subject, class, date and duration, then assign attendance to open the code page.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Select Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">Select Class</option>
            {classesForSubject.map((c) => (
              <option key={c.ClassID} value={c.ClassID}>
                {c.ClassID} – {c.Group} {c.Type ?? ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Duration
          </label>
          <input
            type="text"
            readOnly
            value={durationHours != null ? `${durationHours} hr${durationHours !== 1 ? "s" : ""}` : "—"}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleAssign}
          disabled={!selectedClassId || submitting}
          className="rounded-lg border border-gray-900 bg-gray-900 px-6 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Assigning…" : "Assign attendance"}
        </button>
      </div>
    </div>
  );
}
