"use client";

import { useBrand } from "@/app/providers/BrandProvider";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RatingChart from "@/components/RatingChart";
import OutletPieChart from "@/components/OutletPieChart";
import SummaryCards from "@/components/SummaryCards";
import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function Dashboard() {
  const { activeBrand, getAuthHeaders } = useBrand();

  // ✅ kontrol drawer sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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
            signal: ac.signal,     // ← penting
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err: any) {
        // abaikan abort
        if (err?.name !== "AbortError") {
          console.error("load dashboard failed:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();  // aman, error diabaikan
    };
  }, [activeBrand?.id, getAuthHeaders]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Sidebar: drawer di mobile, fixed di desktop */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((v) => !v)}   // ⬅️ toggle
      />
      {/* ✅ Sisakan ruang sidebar saat desktop */}
      <div className="lg:pl-72">
        {/* ✅ Topbar diberi handler untuk membuka drawer */}
        <Topbar onOpenSidebar={() => setSidebarOpen((v) => !v)} />

        <main className="p-6 space-y-8">
          <SummaryCards data={data} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RatingChart data={data?.ratingHistory ?? []} loading={loading} />
            </div>
            <div>
              <OutletPieChart data={data?.outletStatus ?? []} loading={loading} />
            </div>
          </div>

          <div className="rounded-2xl bg-white/95 p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Daftar Outlet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-green-600">Outlet Buka</h3>
                <ul className="mt-2 text-sm list-disc list-inside">
                  {(data?.openOutlets ?? []).map((o: any) => (
                    <li key={o.id}>{o.name}</li>
                  ))}
                  {loading && <li className="text-gray-400">Memuat…</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-600">Outlet Tutup</h3>
                <ul className="mt-2 text-sm list-disc list-inside">
                  {(data?.closedOutlets ?? []).map((o: any) => (
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
