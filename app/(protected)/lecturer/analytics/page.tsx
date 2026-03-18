import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import AttendanceChart from "@/components/attendance/AttendanceChart";

export default async function LecturerAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  // Get LecturerID
  const { data: lecturer } = await supabase
    .from("Lecturer")
    .select("LecturerID")
    .eq("UserID", userId)
    .maybeSingle();

  if (!lecturer) redirect("/sign-in");
  const lecturerId = lecturer.LecturerID;

  // Get classes taught by lecturer
  const { data: classes } = await supabase
    .from("Class")
    .select(`
      ClassID,
      Subject(Name)
    `)
    .eq("LecturerID", lecturerId);

  const classIds = (classes ?? []).map(c => c.ClassID);

  // Get student count per class
  const { data: registrations } = await supabase
  .from("ClassRegistration")
  .select(`
    ClassID,
    Enrollment(
      StudentID
    )
  `)
  .in("ClassID", classIds);

  const studentCountMap: Record<string, number> = {};

  registrations?.forEach(r => {
    if (!r.ClassID) return;
    studentCountMap[r.ClassID] = (studentCountMap[r.ClassID] || 0) + 1;
  });

  // Attendance using your schema (AttendanceRecord → Attendance → Class)
  const { data: attendance } = await supabase
    .from("AttendanceRecord")
    .select(`
      Status,
      Attendance(
        ClassID
      )
    `);

  const attendanceMap: Record<string, { total: number; present: number }> = {};

  attendance?.forEach(a => {
    const classId = a.Attendance?.ClassID;
    if (!classId) return;
    if (!classIds.includes(classId)) return; // only this lecturer's classes

    if (!attendanceMap[classId]) {
      attendanceMap[classId] = { total: 0, present: 0 };
    }

    attendanceMap[classId].total += 1;

    if (a.Status === "Present") {
      attendanceMap[classId].present += 1;
    }
  });

  // Prepare final analytics data
  const analyticsData = (classes ?? []).map(cls => {
    const stats = attendanceMap[cls.ClassID] || { total: 0, present: 0 };

    const percentage =
      stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

    return {
      classId: cls.ClassID,
      className: cls.Subject?.Name ?? "Unknown",
      attendanceRate: Number(percentage.toFixed(2)),
      studentCount: studentCountMap[cls.ClassID] || 0,
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lecturer Analytics</h1>

      {/* Class Summary Boxes */}
      <div className="grid md:grid-cols-3 gap-4">
        {analyticsData.map((cls) => (
          <div
            key={cls.classId}
            className="rounded-xl border p-4 bg-white shadow-sm"
          >
            <p className="font-semibold text-lg">{cls.className}</p>
            <p className="text-gray-600">
              Students: {cls.studentCount}
            </p>
          </div>
        ))}
      </div>

      {/* Attendance Bar Chart */}
      <div className="rounded-2xl border p-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          Attendance Rate by Class
        </h2>
        <AttendanceChart data={analyticsData} />
      </div>
    </div>
  );
}