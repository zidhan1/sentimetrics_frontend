"use client";

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export type Point = { name: string; gofood: number; grab: number; shopee: number };

type Props = {
  data?: Point[];          // optional biar aman
  loading?: boolean;       // optional skeleton
  className?: string;
};

export default function RatingChart({ data = [], loading = false, className = "" }: Props) {
  const fallback: Point[] = [
    { name: "Jun", gofood: 4.80, grab: 4.70, shopee: 4.58 },
    { name: "Jul", gofood: 4.81, grab: 4.71, shopee: 4.60 },
    { name: "Aug", gofood: 4.83, grab: 4.72, shopee: 4.62 },
    { name: "Sep", gofood: 4.84, grab: 4.73, shopee: 4.635 },
  ];

  const series: Point[] = data.length ? data : fallback;

  if (loading) {
    return (
      <div className={`rounded-2xl bg-white/95 p-4 lg:p-6 shadow-md ${className}`}>
        <div className="font-semibold mb-2">Perkembangan Rating</div>
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white/95 p-4 lg:p-6 shadow-md ${className}`}>
      <div className="font-semibold mb-2">Perkembangan Rating</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis domain={[4.58, 4.86]} tickCount={6} fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="gofood" dot={false} stroke="#ef4444" strokeWidth={2} name="GoFood" />
            <Line type="monotone" dataKey="grab"   dot={false} stroke="#22c55e" strokeWidth={2} name="GrabFood" />
            <Line type="monotone" dataKey="shopee" dot={false} stroke="#f59e0b" strokeWidth={2} name="ShopeeFood" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
