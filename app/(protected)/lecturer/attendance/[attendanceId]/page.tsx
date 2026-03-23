"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getAttendanceSocket,
  joinAttendanceRoom,
  leaveAttendanceRoom,
} from "@/lib/attendance-socket";
import { AttendanceCodeDisplay } from "@/components/attendance/AttendanceCodeDisplay";
import { CountdownProgressBar } from "@/components/attendance/CountdownProgressBar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const ROTATE_INTERVAL_MS = 60_000;
const POLL_INTERVAL_MS = 5000;

interface SessionData {
  attendanceId: string;
  classId: string;
  date: string;
  startTime: string;
  code: string;
  subjectName: string | null;
  durationHours: number | null;
  classGroup: string | null;
}

interface StudentRow {
  studentId: string;
  studentName: string;
  studentCode: string;
  status: "Present" | "Absent";
}

/**
 * Attendance code page (2/2): shows class id, duration, code with countdown,
 * pie chart (present/absent), student list, and Close session.
 */
export default function LecturerAttendanceCodePage() {
  const params = useParams();
  const attendanceId = typeof params?.attendanceId === "string" ? params.attendanceId : null;

  const [session, setSession] = useState<SessionData | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [code, setCode] = useState<string>("000000");
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socket = getAttendanceSocket();

  const fetchSession = useCallback(async () => {
    if (!attendanceId) return;
    try {
      const res = await fetch(`/api/attendance/session/${attendanceId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load session");
      }
      const data = await res.json();
      setSession(data.session ?? null);
      setStudents(data.students ?? []);
      if (data.session?.code) setCode(String(data.session.code).padStart(6, "0").slice(-6));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [attendanceId]);

  useEffect(() => {
    fetchSession();
    const id = setInterval(fetchSession, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchSession]);

  useEffect(() => {
    if (!attendanceId || !session?.classId) return;
    joinAttendanceRoom(socket, session.classId);
    return () => leaveAttendanceRoom(socket, session.classId);
  }, [attendanceId, session?.classId, socket]);

  useEffect(() => {
    if (!socket || !session?.classId) return;
    const onCodeUpdate = (payload: { code?: string; startTime?: string }) => {
      if (payload.code != null) setCode(String(payload.code).padStart(6, "0").slice(-6));
      if (payload.startTime != null && session) setSession((s) => (s ? { ...s, startTime: payload.startTime! } : null));
    };
    const onRecordAdded = () => fetchSession();
    socket.on("code-update", onCodeUpdate);
    socket.on("record-added", onRecordAdded);
    return () => {
      socket.off("code-update", onCodeUpdate);
      socket.off("record-added", onRecordAdded);
    };
  }, [socket, session?.classId, fetchSession]);

  useEffect(() => {
    if (!attendanceId) return;
    const interval = setInterval(async () => {
      try {
        await fetch("/api/attendance/rotate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendanceId }),
        });
      } catch {
        // ignore
      }
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [attendanceId]);

  const handleClose = async () => {
    if (!attendanceId) return;
    setClosing(true);
    try {
      const res = await fetch("/api/attendance/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to close");
      }
      window.location.href = "/lecturer/attendance";
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setClosing(false);
    }
  };

  const presentCount = students.filter((s) => s.status === "Present").length;
  const absentCount = students.filter((s) => s.status === "Absent").length;
  const total = students.length;
  const presentPct = total ? Math.round((presentCount / total) * 100) : 0;
  const absentPct = total ? Math.round((absentCount / total) * 100) : 0;

  const pieData = [
    { name: "Present", value: presentCount, color: "hsl(142 76% 36%)" },
    { name: "Absent", value: absentCount, color: "hsl(0 84% 60%)" },
  ].filter((d) => d.value > 0);
  if (pieData.length === 0) pieData.push({ name: "No data", value: 1, color: "hsl(0 0% 90%)" });

  if (loading && !session) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-500">Loading session…</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-red-600">{error ?? "Session not found."}</p>
        <Link
          href="/lecturer/attendance"
          className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to attendance
        </Link>
      </div>
    );
  }

  const durationLabel =
    session.durationHours != null
      ? `${session.durationHours} hr${session.durationHours !== 1 ? "s" : ""}`
      : "—";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance code</h1>
          <p className="text-sm text-gray-600">
            Share the code with students. Code refreshes every 60s.
          </p>
        </div>
        <Link
          href="/lecturer/attendance"
          className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to overview
        </Link>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <header className="mb-4 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-3">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Current class id</p>
            <p className="font-semibold text-gray-900">{session.classId}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Time duration</p>
            <p className="font-semibold text-gray-900">{durationLabel}</p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <AttendanceCodeDisplay code={code} className="my-4" />
            <CountdownProgressBar
              date={session.date}
              startTime={session.startTime}
              size={100}
            />
            <p className="text-center text-xs text-gray-500">Code refresh in 60s</p>
            <button
              type="button"
              onClick={handleClose}
              disabled={closing}
              className="w-full rounded-lg border border-red-200 bg-red-50 py-2 font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {closing ? "Closing…" : "Close session"}
            </button>
          </div>

          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm font-medium text-gray-700">Attendance summary</p>
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={64}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-green-700">{presentPct}% present</span>
              {" · "}
              <span className="font-medium text-red-600">{absentPct}% absent</span>
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Students</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-500">
                    No students in this class.
                  </td>
                </tr>
              ) : (
                students.map((s, i) => (
                  <tr key={s.studentId} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {i + 1}. {s.studentName}
                    </td>
                    <td className="py-2">
                      <span
                        className={
                          s.status === "Present"
                            ? "text-green-700"
                            : "text-red-600"
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
