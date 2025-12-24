// app/providers/BrandProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Brand = { id: string; name: string };

type Ctx = {
  brands: Brand[];
  activeBrand: Brand | null;
  loading: boolean;
  selectBrand: (id: string) => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
  refresh: () => Promise<void>;
  /** Opsional: agar kompatibel dengan halaman login lama, boleh dipakai atau diabaikan */
  seedBrands: (brands: Brand[], activeId?: string) => void;
};

const BrandCtx = createContext<Ctx>(null as any);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  // baca token setiap render (cukup aman, karena berubah saat login/logout)
  const token =
    (typeof window !== "undefined" && localStorage.getItem("token")) || "";

  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  /** ----------------------
   * 1) Hydration dari localStorage
   * ---------------------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("brands");
      const actStr = localStorage.getItem("activeBrand");
      if (stored) setBrands(JSON.parse(stored));
      if (actStr) setActiveBrand(JSON.parse(actStr));
    } catch {
      // ignore parse error
    } finally {
      // setelah coba hydrate, kita masih bisa refresh kalau perlu (lihat efek #2)
      setLoading(false);
    }
  }, []);

  /** ----------------------
   * 2) Auto-refresh ketika token tersedia & brands masih kosong
   * ---------------------- */
  const refresh = useCallback(async () => {
    if (!token) return; // tidak ada token => abaikan
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/brands`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Failed to fetch brands (${res.status})`);
      const b: Brand[] = await res.json();
      setBrands(b || []);
      localStorage.setItem("brands", JSON.stringify(b || []));
    } catch (e) {
      console.warn("refresh brands error:", e);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, token]);

  // panggil refresh otomatis saat:
  // - sudah punya token
  // - brands masih kosong (belum ada dari hydration)
  useEffect(() => {
    if (!token) return;

    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 3600000); // Setiap 1 jam refresh untuk melihat brands

    return () => clearInterval(interval);
  }, [token, refresh]);

  /** ----------------------
   * 3) Pastikan ada activeBrand jika brands sudah ada
   * ---------------------- */
  useEffect(() => {
    if (!activeBrand && brands.length > 0) {
      const first = brands[0];
      setActiveBrand(first);
      localStorage.setItem("activeBrand", JSON.stringify(first));
    }
  }, [brands, activeBrand]);

  /** ----------------------
   * 4) selectBrand: update state + simpan + (opsional) POST
   * ---------------------- */
  const selectBrand = useCallback(
    async (id: string) => {
      const next = (brands || []).find((b) => b.id === id) || null;

      setActiveBrand(next);
      if (next) {
        localStorage.setItem("activeBrand", JSON.stringify(next));
      } else {
        localStorage.removeItem("activeBrand");
      }

      // opsional sinkron ke server (tidak fatal kalau gagal)
      try {
        if (token) {
          await fetch(`${API_BASE}/brands/select`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ brandId: id }),
          });
        }
      } catch {
        // silent fail
      }
    },
    [brands, getAuthHeaders, token]
  );

  /** ----------------------
   * 5) seedBrands (opsional): kompatibel dengan login lama
   * ---------------------- */
  const seedBrands = useCallback(
    (b: Brand[], activeId?: string) => {
      setBrands(b || []);
      localStorage.setItem("brands", JSON.stringify(b || []));
      let act: Brand | null = null;
      if (activeId) {
        act = (b || []).find((x) => x.id === activeId) || null;
      }
      // jika tidak diberi activeId, biarkan efek #3 yang memilihkan default
      if (act) {
        setActiveBrand(act);
        localStorage.setItem("activeBrand", JSON.stringify(act));
      } else if (!activeBrand && (b || []).length > 0) {
        const first = b[0];
        setActiveBrand(first);
        localStorage.setItem("activeBrand", JSON.stringify(first));
      }
    },
    [activeBrand]
  );

  const value = useMemo<Ctx>(
    () => ({
      brands,
      activeBrand,
      loading,
      selectBrand,
      getAuthHeaders,
      refresh,
      seedBrands,
    }),
    [
      brands,
      activeBrand,
      loading,
      selectBrand,
      getAuthHeaders,
      refresh,
      seedBrands,
    ]
  );

  return <BrandCtx.Provider value={value}>{children}</BrandCtx.Provider>;
}

export const useBrand = () => useContext(BrandCtx);
