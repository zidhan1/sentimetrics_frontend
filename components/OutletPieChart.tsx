"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export type Slice = { name: string; value: number };

type Props = {
  data?: Slice[];
  loading?: boolean;
  className?: string;
};

export default function OutletPieChart({
  data = [],
  loading = false,
  className = "",
}: Props) {
  const fallback: Slice[] = [
    { name: "On Time", value: 48.9 },
    { name: "Terlambat", value: 23.5 },
    { name: "Lebih Awal", value: 27.6 },
  ];
  const dataset: Slice[] = data.length ? data : fallback;
  const colors = ["#16a34a", "#f59e0b", "#ef4444"];

  if (loading) {
    return (
      <div className={`rounded-2xl bg-white/95 p-4 lg:p-6 shadow-md ${className}`}>
        <div className="font-semibold mb-2">Laporan Outlet Opening</div>
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white/95 p-4 lg:p-6 shadow-md ${className}`}>
      <div className="font-semibold mb-2">Laporan Outlet Opening</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataset}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
            >
              {dataset.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
