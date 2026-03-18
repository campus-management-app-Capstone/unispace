import React, { Key, ReactNode } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getStudentAttendanceOverview } from "@/lib/database";

interface StudentTimetableSlot {
  id: string;
  classId: string | null;
  subjectName: string | null;
  time: string;
  venue: string | null;
  lecturer: string | null;
  day: string | null;
  start: string | null;
  end: string | null;
}

function mapToStudentSlots(rows: unknown[]): StudentTimetableSlot[] {
  return (rows || []).map((r) => {
    const row = r as any;
    const cls = row.Class ?? null;
    const start = row.Start ?? "";
    const end = row.End ?? "";
    return {
      id: row.TimetableSlotID,
      classId: cls?.ClassID ?? null,
      subjectName: cls?.Subject?.Name ?? null,
      time: start && end ? `${start} – ${end}` : start || end || "—",
      venue: row.Facility?.Name ?? null,
      lecturer: cls?.Lecturer?.LecturerCode ?? null,
      day: row.Day,
      start: row.Start,
      end: row.End,
    };
  });
}

export default async function StudentDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  // Fetch student record
  const { data: student } = await supabase
    .from("Student")
    .select("StudentID")
    .eq("UserID", userId)
    .maybeSingle();

  if (!student) redirect("/sign-in");
  const studentId = student.StudentID;

  // Attendance overview
  const attendanceOverview = await getStudentAttendanceOverview(studentId);

  // Wallet & monthly spending
  const { data: walletData } = await supabase
    .from("Wallet")
    .select("*")
    .eq("UserID", userId)
    .maybeSingle();

  const { data: transactions } = await supabase
    .from("Transaction")
    .select("*")
    .eq("WalletID", walletData?.WalletID);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlySpending =
    transactions
      ?.filter((tx) => {
        const d = new Date(tx.Time);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, tx) => sum + tx.Amount, 0) ?? 0;

  // Facility bookings
  const { data: bookingsData } = await supabase
    .from("Booking")
    .select("StartTime, EndTime, Facility(Name)")
    .eq("UserID", userId);
  const totalBookings = bookingsData?.length ?? 0;

  // Current semester subjects (no duplicates)
  const { data: enrollments } = await supabase
    .from("Enrollment")
    .select("EnrollmentID")
    .eq("StudentID", studentId);

  const enrollmentIds = (enrollments ?? []).map((e) => e.EnrollmentID);
  let currentSemesterSubjects: string[] = [];

  if (enrollmentIds.length > 0) {
    const { data: classRegs } = await supabase
      .from("ClassRegistration")
      .select("ClassID")
      .in("EnrollmentID", enrollmentIds);

    const classIds = (classRegs ?? []).map((c) => c.ClassID).filter(Boolean);

    if (classIds.length > 0) {
      const { data: classes } = await supabase
        .from("Class")
        .select("Subject(Name)")
        .in("ClassID", classIds);

      currentSemesterSubjects = Array.from(
        new Set((classes ?? []).map((c) => c.Subject?.Name).filter(Boolean))
      );
    }
  }

  //Upcoming classes (today only)
let upcomingSlots: StudentTimetableSlot & {
  id: Key | null | undefined;
  subjectName: ReactNode;
  venue: string;
  time: ReactNode; dayName: string 
}[] = [];

if (enrollmentIds.length > 0) {
  const { data: classRegs } = await supabase
    .from("ClassRegistration")
    .select("ClassID")
    .in("EnrollmentID", enrollmentIds);

  const classIds = Array.from(
    new Set((classRegs ?? []).map((r) => r.ClassID).filter(Boolean))
  ) as string[];

  if (classIds.length > 0) {
    const { data: slotRows } = await supabase
      .from("TimetableSlot")
      .select(`
        TimetableSlotID,
        Day,
        Start,
        End,
        Facility(Name),
        Class(
          ClassID,
          Subject(Name),
          Lecturer(LecturerCode)
        )
      `)
      .in("ClassID", classIds)
      .order("Day", { ascending: true })
      .order("Start", { ascending: true });

    const allSlots = mapToStudentSlots(slotRows ?? []);
    const nowTime = new Date();
    const todayStr = nowTime.toLocaleDateString("en-CA"); // yyyy-mm-dd

    // Day mapping
    const fullDayMap: Record<string, string> = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    };

      upcomingSlots = allSlots
    .filter(slot => {
      if (!slot.start || !slot.day) return false;

      const [hours, minutes] = slot.start.split(":").map(Number);
      const slotDate = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), hours, minutes, 0, 0);

      // Only today & after now
      return slotDate >= nowTime;
    })
    .map(slot => ({
      ...slot,
      dayName: slot.day ? fullDayMap[slot.day.slice(0, 3)] ?? slot.day : "—"
    }));
  }
}

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-4 gap-6">
      {/* Attendance */}
      <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Overall Attendance</h2>
        <p className="text-4xl font-bold text-green-600">{attendanceOverview?.overallIntakeAttendance ?? 0}%</p>
      </div>

      {/* Wallet */}
      <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Wallet Balance</h2>
        <p className="text-4xl font-bold text-blue-600">RM {walletData?.Balance?.toFixed(2) ?? "0.00"}</p>
      </div>

      {/* Monthly Spending */}
      <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Spending This Month</h2>
        <p className="text-4xl font-bold text-red-600">RM {monthlySpending.toFixed(2)}</p>
      </div>

      {/* Facility Bookings */}
      <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Facility Bookings</h2>
        <p className="text-4xl font-bold text-purple-600">{totalBookings}</p>
      </div>

      {/* Current Semester Subjects */}
      <div className="rounded-2xl border p-6 shadow-sm bg-white md:col-span-2">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Current Semester Subjects</h2>
        {currentSemesterSubjects.length === 0 ? (
          <p className="text-gray-500">No subjects found for the current semester.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {currentSemesterSubjects.map((subj) => (
              <li key={subj} className="text-gray-800">{subj}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Upcoming Classes */}
      <div className="rounded-2xl border p-6 shadow-sm bg-white md:col-span-2">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Upcoming Classes (Today)
        </h2>
        {upcomingSlots.length === 0 ? (
          <p className="text-gray-500">No more classes scheduled for today.</p>
        ) : (
          upcomingSlots.map(slot => (
            <div key={slot.id} className="border rounded-lg p-3 mb-2">
              <p className="font-semibold">{slot.subjectName}</p>
              <p className="text-sm text-gray-600">
                {slot.dayName} — {slot.time} @ {slot.venue ?? "—"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}