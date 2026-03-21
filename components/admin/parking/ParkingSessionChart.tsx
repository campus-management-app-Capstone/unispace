"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  data: { date: string; sessions: number }[];
};

export default function ParkingSessionChart({ data }: Props) {
  return (
    <div className="rounded-2xl border p-6 bg-white shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">Parking Sessions per Day</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" hide/>
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number) => [`${value} sessions`, "Sessions"]} />
            <Line type="monotone" dataKey="sessions" stroke="#F59E0B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}