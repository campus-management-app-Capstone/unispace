"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AttendanceChart({
  data,
}: {
  data: {
    className: string;
    attendanceRate: number;
  }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="className" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="attendanceRate" fill="#3B82F6" /> {/* Blue */}
      </BarChart>
    </ResponsiveContainer>
  );
}