// app/items/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBrand } from "@/app/providers/BrandProvider";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { exportCsv, CsvColumn } from "@/utils/csv";
import { formatWIB, formatWIBForCsv } from "@/utils/datetime";

// ======= Types =======
type SortKey = "name" | "channel" | "outlet" | "price" | "status" | "updatedAt";
type ChannelObj = { id: number; name: string; code?: string };
type OutletObj = { id: number; name: string; status: number };
type ProductRow = {
  id: number;
  name: string;
  price?: number | string | null;
  status: number; // 1 aktif, 0 nonaktif
  brandId: number;
  outletId: number;
  outlet?: OutletObj | null;
  channel?: ChannelObj | null;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const API_PATH = "/products"; // backend kamu

// ======= UI helpers =======
function formatPrice(val: number | string | null | undefined) {
  if (val == null) return "—";
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);
  return n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

const TAG = ({
  text,
  tone = "green",
}: {
  text: string;
  tone?: "green" | "gray";
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold
    ${
      tone === "green"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {text}
  </span>
);

// ======= Page =======
export default function ItemsPage() {
  const brandContext = useBrand();
  const { activeBrand, getAuthHeaders } = brandContext || {
    activeBrand: null,
    getAuthHeaders: () => ({}),
  };

  // layout
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // filters (client-side)
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // data
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // fetch
  useEffect(() => {
    if (!activeBrand?.id) return;
    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;

    const params = new URLSearchParams({ brandId: String(activeBrand.id) });

    setLoading(true);
    setError(null);

    fetch(`${API_BASE}${API_PATH}?${params.toString()}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
      signal: ac.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${t || r.statusText}`);
        }
        return r.json() as Promise<ProductRow[]>;
      })
      .then((json) => setRows(Array.isArray(json) ? json : []))
      .catch((e: unknown) => {
        const error = e as Error;
        if (error?.name !== "AbortError")
          setError(error?.message || "Gagal memuat data");
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [activeBrand?.id, getAuthHeaders]);

  // filter
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      const byQ =
        !ql ||
        r.name?.toLowerCase().includes(ql) ||
        r.outlet?.name?.toLowerCase().includes(ql) ||
        r.channel?.name?.toLowerCase().includes(ql);
      const byStatus =
        status === "all" ||
        (status === "active" && r.status === 1) ||
        (status === "inactive" && r.status === 0);
      return byQ && byStatus;
    });
  }, [rows, q, status]);

  // sort
  const sorted = useMemo(() => {
    const clone = [...filtered];
    clone.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const get = (r: ProductRow) => {
        switch (sortKey) {
          case "name":
            return r.name || "";
          case "channel":
            return r.channel?.name || "";
          case "outlet":
            return r.outlet?.name || "";
          case "price":
            return Number(r.price) || 0;
          case "status":
            return r.status || 0;
          case "updatedAt":
            return r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
          default:
            return "";
        }
      };
      const va = get(a),
        vb = get(b);
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
    return clone;
  }, [filtered, sortKey, sortDir]);

  // KPI & charts data
  const kpi = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((r) => r.status === 1).length;
    const inactive = total - active;
    const channels = new Map<string, number>();
    const outletCount = new Map<string, number>();

    for (const r of filtered) {
      const ch = r.channel?.name || "Unknown";
      channels.set(ch, (channels.get(ch) || 0) + 1);

      const out = r.outlet?.name || "Unknown";
      outletCount.set(out, (outletCount.get(out) || 0) + 1);
    }

    const channelPie = Array.from(channels.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    const topOutlet = Array.from(outletCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return { total, active, inactive, channelPie, topOutlet };
  }, [filtered]);

  const COLORS = [
    "#22c55e",
    "#0ea5e9",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#a3e635",
    "#fb7185",
  ];

  const setSort = (key: SortKey) => {
    setSortKey((prev) => (prev === key ? prev : key));
    setSortDir((prev) =>
      sortKey === key ? (prev === "asc" ? "desc" : "asc") : "asc"
    );
  };

  // ===== Export CSV (pakai utils) =====
  const handleExportCsv = () => {
    const cols: CsvColumn<ProductRow>[] = [
      { header: "ID", value: (r) => r.id },
      { header: "Nama Item", value: (r) => r.name ?? "" },
      { header: "Channel", value: (r) => r.channel?.name ?? "" },
      { header: "Outlet", value: (r) => r.outlet?.name ?? "" },
      {
        header: "Harga (IDR)",
        value: (r) => (r.price == null ? "" : Number(r.price)),
      },
      {
        header: "Status",
        value: (r) => (r.status === 1 ? "Aktif" : "Tidak Aktif"),
      },
      {
        header: "Terakhir Sinkron (WIB)",
        value: (r) => formatWIBForCsv(r.updatedAt),
      },
    ];

    exportCsv(
      sorted,
      cols,
      `items_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.csv`,
      "," // ganti ke ";" kalau mau delimiter titik-koma
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <div className="lg:pl-72">
        <Topbar onOpenSidebar={() => setSidebarOpen((v) => !v)} />

        <main className="p-6 space-y-6">
          {/* Header + Filters */}
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Items</h1>
              <p className="text-sm text-gray-500">
                Data diambil dari database (hasil sinkron dari channel).
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama item / outlet / channel…"
                  className="px-3 py-2 text-sm bg-white border border-gray-200 outline-none w-72 rounded-xl focus:ring-2 focus:ring-green-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400">
                  ⌘K
                </span>
              </div>

              <button
                onClick={() =>
                  setStatus((s) =>
                    s === "all" ? "active" : s === "active" ? "inactive" : "all"
                  )
                }
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl"
                title="Filter status"
              >
                {status === "all"
                  ? "Semua Status"
                  : status === "active"
                  ? "Aktif"
                  : "Tidak Aktif"}
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                title="Ekspor data yang sedang tampil"
              >
                ⤓ Export CSV
              </button>
            </div>
          </header>

          {/* KPI Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <KpiCard label="Total Item" value={kpi.total} />
            <KpiCard label="Aktif" value={kpi.active} tone="green" />
            <KpiCard label="Tidak Aktif" value={kpi.inactive} tone="gray" />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="p-5 shadow-md rounded-2xl bg-white/95">
              <h3 className="mb-3 font-semibold">Distribusi Channel</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kpi.channelPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {kpi.channelPie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 shadow-md xl:col-span-2 rounded-2xl bg-white/95">
              <h3 className="mb-3 font-semibold">
                Top Outlet berdasarkan jumlah item
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kpi.topOutlet}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      height={60}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis />
                    <RTooltip />
                    <Bar dataKey="value">
                      {kpi.topOutlet.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Table */}
          <section className="p-4 shadow-md rounded-2xl bg-white/95 md:p-6">
            {error && (
              <div className="px-4 py-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white border-b">
                  <tr className="text-left text-gray-600">
                    <Th
                      label="Item"
                      sortKey="name"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={setSort}
                    />
                    <Th
                      label="Channel"
                      sortKey="channel"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={setSort}
                    />
                    <Th
                      label="Outlet"
                      sortKey="outlet"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={setSort}
                    />
                    <Th
                      label="Harga"
                      sortKey="price"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={setSort}
                    />
                    <Th
                      label="Status"
                      sortKey="status"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={setSort}
                    />
                    <Th
                      label="Terakhir Sinkron"
                      sortKey="updatedAt"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={setSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-8 text-center text-gray-500"
                      >
                        Memuat data…
                      </td>
                    </tr>
                  )}

                  {!loading && sorted.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center">
                        <div className="text-gray-500">Tidak ada item.</div>
                      </td>
                    </tr>
                  )}

                  {sorted.map((it) => (
                    <tr
                      key={it.id}
                      className="border-t border-gray-100 hover:bg-gray-50/60"
                    >
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {it.name}
                      </td>
                      <td className="px-3 py-2">{it.channel?.name ?? "—"}</td>
                      <td className="px-3 py-2">{it.outlet?.name ?? "—"}</td>
                      <td className="px-3 py-2">{formatPrice(it.price)}</td>
                      <td className="px-3 py-2">
                        {it.status === 1 ? (
                          <TAG text="Aktif" />
                        ) : (
                          <TAG text="Tidak Aktif" tone="gray" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {formatWIB(it.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ======= Small UI subcomponents =======
function KpiCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  tone?: "slate" | "green" | "gray";
}) {
  const toneCls =
    tone === "green"
      ? "bg-green-50 text-green-700 ring-1 ring-green-100"
      : tone === "gray"
      ? "bg-gray-50 text-gray-700 ring-1 ring-gray-100"
      : "bg-white text-slate-800 ring-1 ring-slate-100";
  return (
    <div className={`rounded-2xl p-5 shadow-md ${toneCls}`}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
function Th({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <th className="px-3 py-2 font-semibold select-none">
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:opacity-80 ${
          active ? "text-gray-900" : "text-gray-600"
        }`}
        title="Urutkan"
      >
        {label}
        <ArrowUpDown
          className={`h-4 w-4 ${active ? "opacity-90" : "opacity-40"}`}
        />
        {active && (
          <span className="text-[10px] opacity-60">
            {dir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </button>
    </th>
  );
}
