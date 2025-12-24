"use client";

import { useBrand } from "@/app/providers/BrandProvider";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RatingChart from "@/components/RatingChart";
import OutletPieChart from "@/components/OutletPieChart";
import SummaryCards from "@/components/SummaryCards";
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

// Type definitions
import type { Point } from "@/components/RatingChart";
import type { Slice } from "@/components/OutletPieChart";

interface Outlet {
  id: string;
  name: string;
}

interface DashboardData {
  ratingHistory: Point[];
  outletStatus: Slice[];
  openOutlets: Outlet[];
  closedOutlets: Outlet[];
}

interface SummaryData {
  [key: string]: unknown;
}

interface ApiError {
  response?: {
    status: number;
    data: unknown;
  };
  message: string;
  name: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function Dashboard() {
  const brandContext = useBrand();
  const { activeBrand, getAuthHeaders } = brandContext || {
    activeBrand: null,
    getAuthHeaders: () => ({}),
  };
  const [summary, setSummary] = useState<SummaryData | undefined>();

  // ✅ kontrol drawer sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const apiClient = useMemo(() => {
    // pakai token dari getAuthHeaders biar konsisten
    return axios.create({
      baseURL: API_BASE, // pastikan ini "http://localhost:5000" misalnya
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(), // biasanya mengandung Authorization: Bearer ...
      },
    });
  }, [getAuthHeaders]);

  const getSummaryOutlets = useCallback(async () => {
    try {
      setLoading(true);

      // pastikan route-nya bener:
      const res = await apiClient.get("/dashboard");
      // kalau yang ada /dashboard/summary, ganti ke itu

      setSummary(res.data);
    } catch (err: unknown) {
      const error = err as ApiError;
      // ini penting biar kamu tau penyebab real-nya
      console.error(
        "getSummaryOutlets failed:",
        error?.response?.status,
        error?.response?.data,
        error?.message
      );
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    getSummaryOutlets();
  }, [getSummaryOutlets]);

  useEffect(() => {
    if (!activeBrand?.id) return;

    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/dashboard/summary?brandId=${activeBrand.id}`,
          {
            headers: getAuthHeaders(),
            signal: ac.signal, // ← penting
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!cancelled) setData(json as DashboardData);
      } catch (err: unknown) {
        const error = err as ApiError;
        // abaikan abort
        if (error?.name !== "AbortError") {
          console.error("load dashboard failed:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort(); // aman, error diabaikan
    };
  }, [activeBrand?.id, getAuthHeaders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Sidebar: drawer di mobile, fixed di desktop */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((v) => !v)} // ⬅️ toggle
      />
      {/* ✅ Sisakan ruang sidebar saat desktop */}
      <div className="lg:pl-72">
        {/* ✅ Topbar diberi handler untuk membuka drawer */}
        <Topbar onOpenSidebar={() => setSidebarOpen((v) => !v)} />

        <main className="p-6 space-y-8">
          <SummaryCards data={summary} loading={loading} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RatingChart data={data?.ratingHistory ?? []} loading={loading} />
            </div>
            <div>
              <OutletPieChart
                data={data?.outletStatus ?? []}
                loading={loading}
              />
            </div>
          </div>

          <div className="p-6 shadow-md rounded-2xl bg-white/95">
            <h2 className="mb-4 text-lg font-semibold">Daftar Outlet</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-green-600">Outlet Buka</h3>
                <ul className="mt-2 text-sm list-disc list-inside">
                  {(data?.openOutlets ?? []).map((o: Outlet) => (
                    <li key={o.id}>{o.name}</li>
                  ))}
                  {loading && <li className="text-gray-400">Memuat…</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-600">Outlet Tutup</h3>
                <ul className="mt-2 text-sm list-disc list-inside">
                  {(data?.closedOutlets ?? []).map((o: Outlet) => (
                    <li key={o.id}>{o.name}</li>
                  ))}
                  {loading && <li className="text-gray-400">Memuat…</li>}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
