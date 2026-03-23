"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: {
    subject: string;
    students: number;
  }[];
};

export default function StudentChart({ data }: Props) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" hide/>
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(value: number) => [`${value} students`, "Students"]}
          />
          <Bar dataKey="students" fill="#3B82F6" /> {/* Blue */}/
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}