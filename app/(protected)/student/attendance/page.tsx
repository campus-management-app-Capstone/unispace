import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getStudentAttendanceOverview } from "@/lib/database";
import {
  SemesterCardWithSelector,
  OverallCard,
} from "@/components/attendance/StudentAttendanceOverviewClient";

/**
 * Student attendance overview page (server component).
 * Fetches from Supabase: semester-wise subject attendance and overall intake percentage.
 * Left: current (or selected) semester with subject names and classes attended/total.
 * Right: student name, intake, overall intake attendance %, and Sign in Attendance button.
 */
export default async function StudentAttendanceOverviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();

  const supabase = createServerSupabaseClient();
  const { data: student, error: studentError } = await supabase
    .from("Student")
    .select("StudentID")
    .eq("UserID", userId)
    .maybeSingle();

  if (studentError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-red-600">
        Unable to load student record. Please try again.
      </div>
    );
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-gray-600">
        Your student record was not found. Please contact support.
      </div>
    );
  }

  const overview = await getStudentAttendanceOverview(student.StudentID);
  const studentName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    student.StudentID;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row">
      {overview.semesters.length > 0 ? (
        <SemesterCardWithSelector semesters={overview.semesters} />
      ) : (
        <section className="flex-1 rounded-2xl border border-gray-300 bg-white shadow-sm">
          <header className="border-b border-gray-300 px-5 py-3">
            <h1 className="text-sm font-medium text-gray-800">
              Semester – Overall Attendance
            </h1>
          </header>
          <div className="px-5 py-6 text-center text-sm text-gray-500">
            No enrollment or attendance data yet. Your subject list will appear
            here once you are enrolled and attendance is recorded.
          </div>
        </section>
      )}

      <OverallCard
        studentName={studentName}
        primaryIntake={overview.primaryIntake}
        overallIntakeAttendance={overview.overallIntakeAttendance}
      />
    </div>
  );
}
