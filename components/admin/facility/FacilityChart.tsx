"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  data: { facility: string; bookings: number }[];
};

export default function FacilityChart({ data }: Props) {
  return (
    <div className="rounded-2xl border p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Bookings per Facility</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="facility" hide/>
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number) => [`${value} bookings`, "Bookings"]} />
            <Bar dataKey="bookings" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}