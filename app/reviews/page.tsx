"use client";

import { useBrand } from "@/app/providers/BrandProvider";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ReviewsTable from "@/components/reviews/ReviewsTable";
import ReviewsFilters, { Filters } from "@/components/reviews/ReviewsFilters";
import { useEffect, useMemo, useState, useCallback } from "react";

// Type definitions
type ReviewRow = {
  id: number;
  outletId: number;
  channelId: number;
  rating: number;
  message: string;
  createdAt: string;
  orderedProduct?: string | null;
  customerName?: string | null;
  outlet?: { id: number; name: string } | null;
  channel?: { id: number; code: string; name: string } | null;
};

type SortDir = "asc" | "desc" | null;
type SortKey =
  | "createdAt"
  | "outletName"
  | "channelName"
  | "rating"
  | "message"
  | "orderedProduct"
  | "customerName";

type OutletOpt = { id: number | string; name: string };

interface Channel {
  id: number | string;
  code: string;
  name: string;
  [key: string]: unknown;
}

interface ApiError {
  message: string;
  [key: string]: unknown;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function ReviewsPage() {
  const brandContext = useBrand();
  const { activeBrand, getAuthHeaders } = brandContext || {
    activeBrand: null,
    getAuthHeaders: () => ({}),
  };
  const [channel, setChannel] = useState<Channel[]>([]);

  const [filters, setFilters] = useState<Filters>({
    channelId: "all",
    outletId: "all", // 👈 NEW
    rating: "all",
    q: "",
    dateFrom: "",
    dateTo: "",
  });

  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [outlets, setOutlets] = useState<OutletOpt[]>([]); // 👈 NEW
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "createdAt",
    dir: null,
  });

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      if (prev.dir === "desc") return { key, dir: null };
      return { key, dir: "asc" };
    });
  };

  // Fetch outlets by brand (sekali ketika brand berubah)
  useEffect(() => {
    if (!activeBrand) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/outlets?brandId=${activeBrand.id}`,
          { headers: getAuthHeaders() }
        );
        const json = await res.json();
        const data = Array.isArray(json) ? json : json.rows;
        if (!cancelled) {
          const opts = (data || []).map(
            (o: { id: number | string; name: string }) => ({
              id: o.id,
              name: o.name,
            })
          ) as OutletOpt[];
          setOutlets(opts);
        }
      } catch {
        if (!cancelled) setOutlets([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeBrand, getAuthHeaders]);

  // Fetch reviews
  useEffect(() => {
    if (!activeBrand) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams();
        params.set("brandId", String(activeBrand.id));
        if (filters.channelId !== "all")
          params.set("channelId", String(filters.channelId));
        if (filters.outletId !== "all")
          params.set("outletId", String(filters.outletId)); // 👈 NEW
        if (filters.rating !== "all")
          params.set("rating", String(filters.rating));
        if (filters.q) params.set("q", filters.q);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const res = await fetch(`${API_BASE}/reviews?${params.toString()}`, {
          headers: getAuthHeaders(),
        });
        const json = await res.json();
        if (!cancelled) {
          const data = Array.isArray(json) ? json : json.rows;
          setRows(data || []);
        }
      } catch (e: unknown) {
        const error = e as ApiError;
        if (!cancelled) setErr(error?.message || "Gagal memuat ulasan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    activeBrand,
    filters.channelId,
    filters.outletId, // 👈 NEW
    filters.rating,
    filters.q,
    filters.dateFrom,
    filters.dateTo,
    getAuthHeaders,
  ]);

  // Client-side filter tambahan (jaga-jaga)
  const filteredAndSorted = useMemo(() => {
    let arr = Array.isArray(rows) ? rows.slice() : [];

    if (filters.outletId !== "all") {
      arr = arr.filter((r) => String(r.outletId) === String(filters.outletId));
    }

    if (filters.q) {
      const q = filters.q.toLowerCase();
      arr = arr.filter(
        (r) =>
          (r.message || "").toLowerCase().includes(q) ||
          (r.orderedProduct || "").toLowerCase().includes(q) ||
          (r.customerName || "").toLowerCase().includes(q)
      );
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      arr = arr.filter((r) => new Date(r.createdAt) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      arr = arr.filter((r) => new Date(r.createdAt) <= to);
    }

    if (sort.dir) {
      const dir = sort.dir === "asc" ? 1 : -1;
      arr.sort((a, b) => {
        const outletA = a.outlet?.name || "";
        const outletB = b.outlet?.name || "";
        const chA = a.channel?.name || "";
        const chB = b.channel?.name || "";

        const map: Record<SortKey, [string | number, string | number]> = {
          createdAt: [
            new Date(a.createdAt).getTime(),
            new Date(b.createdAt).getTime(),
          ],
          outletName: [outletA, outletB],
          channelName: [chA, chB],
          rating: [a.rating, b.rating],
          message: [a.message || "", b.message || ""],
          orderedProduct: [a.orderedProduct || "", b.orderedProduct || ""],
          customerName: [a.customerName || "", b.customerName || ""],
        };

        const [va, vb] = map[sort.key];
        if (typeof va === "number" && typeof vb === "number")
          return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
    }

    return arr;
  }, [
    rows,
    filters.outletId,
    filters.q,
    filters.dateFrom,
    filters.dateTo,
    sort,
  ]);

  async function fetchChannel() {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/channels`, {
        headers: getAuthHeaders(),
      });
      const channels = await res.json();

      if (!channels) return setErr("Failed or not found channels");

      setChannel(channels.data || []);
    } catch (e: unknown) {
      const error = e as ApiError;
      setErr(error?.message || "Gagal memuat channel");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChannel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 lg:pl-72">
        <Topbar />

        <main className="p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="ml-2 text-2xl font-semibold text-gray-800">
              💬 Ulasan
            </h1>
          </div>

          <div className="p-4 bg-white shadow-sm rounded-xl">
            <ReviewsFilters
              value={filters}
              onChange={setFilters}
              channels={channel}
              outlets={outlets} // 👈 NEW
            />
          </div>

          {err && (
            <div className="px-4 py-3 text-red-700 border border-red-200 rounded-xl bg-red-50">
              {err}
            </div>
          )}

          <ReviewsTable
            rows={filteredAndSorted}
            loading={loading}
            sort={sort}
            onToggleSort={(k) => toggleSort(k)}
          />
        </main>
      </div>
    </div>
  );
}
