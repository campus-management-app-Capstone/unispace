import { createServerSupabaseClient } from "@/lib/supabase";
import StudentChart from "@/components/admin/StudentChart";
import AttendanceChart from "@/components/attendance/AttendanceChart";
import FacilityMetrics from "@/components/admin/facility/FacilityUsage";
import FacilityChart from "@/components/admin/facility/FacilityChart";

import ParkingUsage from "@/components/admin/parking/ParkingUsage";
import ParkingDistributionChart from "@/components/admin/parking/ParkingDistributionChart";
import ParkingSessionChart from "@/components/admin/parking/ParkingSessionChart";

export default async function AdminAnalytics() {
  const supabase = createServerSupabaseClient();

  // Student & Lecturer Metrics
  const [studentsRes, lecturersRes] = await Promise.all([
    supabase.from("Student").select("*", { count: "exact", head: true }),
    supabase.from("Lecturer").select("*", { count: "exact", head: true }),
  ]);
  const studentCount = studentsRes.count ?? 0;
  const lecturerCount = lecturersRes.count ?? 0;

  // Student Chart Data
  const { data: classes } = await supabase.from("Class").select(`ClassID, Subject(Name)`);
  const classIds = (classes ?? []).map(c => c.ClassID);

  const { data: registrations } = await supabase
    .from("ClassRegistration")
    .select(`ClassID, Enrollment(StudentID)`)
    .in("ClassID", classIds);

  const studentCountMap: Record<string, number> = {};
  registrations?.forEach(r => {
    if (!r.ClassID || !r.Enrollment?.StudentID) return;
    studentCountMap[r.ClassID] = (studentCountMap[r.ClassID] || 0) + 1;
  });

  const subjectMap: Record<string, number> = {};
  (classes ?? []).forEach(cls => {
    const subjectName = cls.Subject?.Name ?? "Unknown";
    const count = studentCountMap[cls.ClassID] || 0;
    subjectMap[subjectName] = (subjectMap[subjectName] || 0) + count;
  });

  const studentChartData = Object.entries(subjectMap).map(([subject, students]) => ({
    subject,
    students,
  }));

  // Attendance Chart Data
  const { data: attendance } = await supabase
    .from("AttendanceRecord")
    .select(`Status, Attendance(ClassID)`);

  const attendanceMap: Record<string, { total: number; present: number }> = {};
  attendance?.forEach(a => {
    const classId = a.Attendance?.ClassID;
    if (!classId || !classIds.includes(classId)) return;
    if (!attendanceMap[classId]) attendanceMap[classId] = { total: 0, present: 0 };
    attendanceMap[classId].total += 1;
    if (a.Status === "Present") attendanceMap[classId].present += 1;
  });

  const subjectAttendanceMap: Record<string, { total: number; present: number }> = {};
  (classes ?? []).forEach(cls => {
    const subjectName = cls.Subject?.Name ?? "Unknown";
    const stats = attendanceMap[cls.ClassID] || { total: 0, present: 0 };
    if (!subjectAttendanceMap[subjectName])
      subjectAttendanceMap[subjectName] = { total: 0, present: 0 };
    subjectAttendanceMap[subjectName].total += stats.total;
    subjectAttendanceMap[subjectName].present += stats.present;
  });

  const attendanceChartData = Object.entries(subjectAttendanceMap).map(([subject, stats]) => {
    const rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    return {
      className: subject,
      attendanceRate: Number(rate.toFixed(2)),
      tooltipLabel: `${rate.toFixed(2)}%`, // Used to show % if your chart supports it
    };
  });

  // Facility Usage Analytics
  const { data: facilities } = await supabase.from("Facility").select(`FacilityID, Name`);
  const { data: bookings } = await supabase.from("Booking").select(`BookingID, FacilityID`);

  const bookingCountMap: Record<string, number> = {};
  bookings?.forEach(b => {
    if (!b.FacilityID) return;
    bookingCountMap[b.FacilityID] = (bookingCountMap[b.FacilityID] || 0) + 1;
  });

  const facilityChartData = (facilities ?? [])
    .map(f => ({ facility: f.Name, bookings: bookingCountMap[f.FacilityID] || 0 }))
    .sort((a, b) => b.bookings - a.bookings);

  const mostBookedFacility = facilityChartData[0]?.facility ?? "N/A";
  const totalBookings = bookings?.length ?? 0;

  // Parking Analytics (with 3 timeslot pie chart)
  const { data: cars } = await supabase.from("RegisteredCar").select(`RegisteredCarID`);
  const { data: sessions } = await supabase.from("ParkingSession").select(`ParkingSessionID, RegisteredCarID, Start, End`);

  const totalCars = cars?.length ?? 0;
  let totalDuration = 0;
  const sessionsPerHourMap: Record<number, number> = {};
  const sessionsPerDayMap: Record<string, number> = {};
  const timeslotMap: Record<string, number> = { "8AM-12PM": 0, "12PM-4PM": 0, "4PM-8PM": 0 };

  sessions?.forEach(s => {
    if (!s.Start || !s.End) return;
    const start = new Date(s.Start);
    const end = new Date(s.End);

    totalDuration += (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Sessions per day
    const date = start.toISOString().split("T")[0];
    sessionsPerDayMap[date] = (sessionsPerDayMap[date] || 0) + 1;

    // Sessions per hour
    const hour = start.getHours();
    sessionsPerHourMap[hour] = (sessionsPerHourMap[hour] || 0) + 1;

    // Timeslot distribution
    if (hour >= 8 && hour < 12) timeslotMap["8AM-12PM"] += 1;
    else if (hour >= 12 && hour < 16) timeslotMap["12PM-4PM"] += 1;
    else if (hour >= 16 && hour < 20) timeslotMap["4PM-8PM"] += 1;
  });

  const averageDuration = sessions?.length ? totalDuration / sessions.length : 0;
  const peakHour = Object.entries(sessionsPerHourMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

  const lineChartData = Object.entries(sessionsPerDayMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, sessions]) => ({ date, sessions }));

  const pieChartData = Object.entries(timeslotMap).map(([slot, value]) => ({
    name: slot,
    value,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Analytics</h1>

      {/* Student / Lecturer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-5 border">
          <p className="text-sm text-gray-500">Total Students</p>
          <h2 className="text-3xl font-bold mt-2">{studentCount}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border">
          <p className="text-sm text-gray-500">Total Lecturers</p>
          <h2 className="text-3xl font-bold mt-2">{lecturerCount}</h2>
        </div>
      </div>

      {/* Student Chart */}
      <div className="rounded-2xl border p-6 bg-white shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Students per Subject</h2>
        <StudentChart data={studentChartData} />
      </div>

      {/* Attendance Chart */}
      <div className="rounded-2xl border p-6 bg-white shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Attendance Rate per Subject</h2>
        <AttendanceChart data={attendanceChartData} />
      </div>

      {/* Facility Analytics */}
      <FacilityMetrics mostBooked={mostBookedFacility} totalBookings={totalBookings} />
      <FacilityChart data={facilityChartData} />

      {/* Parking Analytics */}
      <div className="p-6 mt-6 bg-white rounded-2xl shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6">Parking Analytics</h2>

        <ParkingUsage
          totalCars={totalCars}
          averageDuration={averageDuration}
          peakHour={`${peakHour}:00`}
        />

        <ParkingSessionChart data={lineChartData} />
        <ParkingDistributionChart data={pieChartData} />
      </div>
    </div>
  );
}