import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import AttendanceChart from "@/components/attendance/AttendanceChart";
import SpendingChart from "@/components/SpendingChart";
import fetch from "node-fetch"; // server-side fetch

export default async function LecturerAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  // Supabase Analytics
  const { data: lecturer } = await supabase
    .from("Lecturer")
    .select("LecturerID, LecturerCode")
    .eq("UserID", userId)
    .maybeSingle();

  if (!lecturer) redirect("/sign-in");
  const lecturerId = lecturer.LecturerID;
  const lecturerCode = lecturer.LecturerCode?.trim().toUpperCase();

  const { data: classes } = await supabase
    .from("Class")
    .select(`ClassID, Subject(Name)`)
    .eq("LecturerID", lecturerId);

  const classIds = (classes ?? []).map(c => c.ClassID);

  const { data: registrations } = await supabase
    .from("ClassRegistration")
    .select(`ClassID, Enrollment(StudentID)`)
    .in("ClassID", classIds);

  const studentCountMap: Record<string, number> = {};
  registrations?.forEach(r => {
    if (!r.ClassID) return;
    studentCountMap[r.ClassID] = (studentCountMap[r.ClassID] || 0) + 1;
  });

  const { data: attendance } = await supabase
    .from("AttendanceRecord")
    .select(`Status, Attendance(ClassID)`);

  const attendanceMap: Record<string, { total: number; present: number }> = {};
  attendance?.forEach(a => {
    const classId = a.Attendance?.ClassID;
    if (!classId) return;
    if (!classIds.includes(classId)) return;

    if (!attendanceMap[classId]) {
      attendanceMap[classId] = { total: 0, present: 0 };
    }

    attendanceMap[classId].total += 1;
    if (a.Status === "Present") attendanceMap[classId].present += 1;
  });

  const analyticsData = (classes ?? []).map(cls => {
    const stats = attendanceMap[cls.ClassID] || { total: 0, present: 0 };
    const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

    return {
      classId: cls.ClassID,
      className: cls.Subject?.Name ?? "Unknown",
      attendanceRate: Number(percentage.toFixed(2)),
      studentCount: studentCountMap[cls.ClassID] || 0,
    };
  });

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
      ?.filter(tx => {
        const d = new Date(tx.Time);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, tx) => sum + tx.Amount, 0) ?? 0;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const last4MonthsData = Array.from({ length: 4 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (3 - i));
    const month = date.getMonth();
    const year = date.getFullYear();

    const total =
      transactions
        ?.filter(tx => {
          const d = new Date(tx.Time);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, tx) => sum + tx.Amount, 0) ?? 0;

    return { month: monthNames[month], total };
  });

  // Server-side Google Form Fetch (Lecturer Evaluation)
  const evalCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQyKrLdYiuUvheIeHC9xBzs0UgAkO_KnIs8cH6Yg9zJmONc-ASlD3E1hJtHU1_QR_NG0gy7nL7X2P_/pub?output=csv";
  let evalResponses: any[] = [];
  const evalAverages: Record<string, number> = {};

  const likertColumns = [
    "Lecturer demonstrates good knowledge of the subject.",
    "2. Lecturer is well prepared for each lecture or tutorial(lab) sessions.",
    "3. Lecturer is approachable when students need assistance.",
    "4. Lecturer explains the course material clearly.",
    "5. Lecturer uses real-life examples to help students understand the subject better."
  ];

  const commentsColumn = "What additional support would you like the lecturer to provide? Why?";

  try {
    const csvRes = await fetch(evalCsvUrl);
    const text = await csvRes.text();

    // Parse CSV into objects
    const rows = text.split("\n").filter(l => l.trim() !== "").map((line, index) => {
      if (index === 0) return null;
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g,""));
      return values;
    }).filter(Boolean) as string[][];

    // Extract header
    const headers = text.split("\n")[0].split(",").map(h => h.trim());

    // Build objects
    const data = rows.map(r => Object.fromEntries(r.map((val,i) => [headers[i], val])));

    // Filter responses for logged-in lecturer
    evalResponses = data.filter(r => (r["Lecturer code"]?.trim().toUpperCase() || "") === lecturerCode);

    // Compute averages
    likertColumns.forEach((col, i) => {
      const total = evalResponses.reduce((sum, r) => sum + parseFloat(r[col] || "0"), 0);
      evalAverages[`Q${i+1}`] = evalResponses.length > 0 ? +(total / evalResponses.length).toFixed(2) : 0;
    });

    // Debug logs (optional)
    console.log("Lecturer code:", lecturerCode);
    console.log("Number of responses found:", evalResponses.length);

  } catch (err) {
    console.error("Error fetching lecturer evaluations:", err);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lecturer Analytics</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Class Summary */}
        <div className="rounded-2xl border p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Classes</h2>
          <div className="space-y-2">
            {analyticsData.map(cls => (
              <div key={cls.classId}>
                <p className="font-medium">{cls.className}</p>
                <p className="text-sm text-gray-600">Students: {cls.studentCount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet */}
        <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Wallet Balance</h2>
          <p className="text-4xl font-bold text-blue-600">
            RM {walletData?.Balance?.toFixed(2) ?? "0.00"}
          </p>
        </div>

        {/* Monthly Spending */}
        <div className="rounded-2xl border p-6 text-center shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Spending This Month</h2>
          <p className="text-4xl font-bold text-red-600">RM {monthlySpending.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="rounded-2xl border p-6 shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Spending Trend (Last 4 Months)</h2>
          <SpendingChart data={last4MonthsData} />
        </div>

        {/* Attendance Chart */}
        <div className="rounded-2xl border p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Attendance Rate by Class</h2>
          <AttendanceChart data={analyticsData} />
        </div>
      </div>

      {/* Lecturer Evaluation Section */}
      <div className="rounded-2xl border p-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Lecturer Evaluation Responses</h2>

        {evalResponses.length === 0 ? (
          <p className="text-gray-500">No responses yet.</p>
        ) : (
          <table className="w-full text-left border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Class ID</th>
                {likertColumns.map((q, i) => (
                  <th key={i} className="border p-2">{q}</th>
                ))}
                <th className="border p-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {evalResponses.map((r, i) => (
                <tr key={i}>
                  <td className="border p-2">{r["Class ID:"]}</td>
                  {likertColumns.map((col, j) => (
                    <td key={j} className="border p-2">{r[col]}</td>
                  ))}
                  <td className="border p-2">{r[commentsColumn]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Average Scores:</h3>
          <ul className="list-disc list-inside">
            {likertColumns.map((q, i) => (
              <li key={i}>
                {q}: {evalAverages[`Q${i+1}`]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
