import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import AttendanceChart from "@/components/attendance/AttendanceChart";
import SpendingChart from "@/components/SpendingChart";

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
  
    // Spending Chart Data (last 4 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const last4MonthsData = Array.from({ length: 4 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (3 - i));

      const month = date.getMonth();
      const year = date.getFullYear();

      const total =
        transactions
          ?.filter((tx) => {
            const d = new Date(tx.Time);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((sum, tx) => sum + tx.Amount, 0) ?? 0;

      return {
        month: monthNames[month],
        total,
      };
    });

    return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lecturer Analytics</h1>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Class Summary */}
        <div className="rounded-2xl border p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Classes</h2>
          <div className="space-y-2">
            {analyticsData.map((cls) => (
              <div key={cls.classId}>
                <p className="font-medium">{cls.className}</p>
                <p className="text-sm text-gray-600">
                  Students: {cls.studentCount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet */}
        <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Wallet Balance
          </h2>
          <p className="text-4xl font-bold text-blue-600">
            RM {walletData?.Balance?.toFixed(2) ?? "0.00"}
          </p>
        </div>

        {/* Monthly Spending */}
        <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Spending This Month
          </h2>
          <p className="text-4xl font-bold text-red-600">
            RM {monthlySpending.toFixed(2)}
          </p>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Spending Trend */}
        <div className="rounded-2xl border p-6 shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Spending Trend (Last 4 Months)
          </h2>
          <SpendingChart data={last4MonthsData} />
        </div>

        {/* Attendance Chart */}
        <div className="rounded-2xl border p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Attendance Rate by Class
          </h2>
          <AttendanceChart data={analyticsData} />
        </div>

      </div>
    </div>
  );
}