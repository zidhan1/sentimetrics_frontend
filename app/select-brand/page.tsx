"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

type Brand = { id: string; name: string };

export default function SelectBrandPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [active, setActive] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    (async () => {
      try {
        if (!token) return router.replace("/auth/login");

        // brand aktif (buat info)
        const a = await fetch(`${API_BASE}/brands/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (a.ok) {
          const j = await a.json();
          setActive(j?.active ?? null);
        }

        // daftar brand
        const r = await fetch(`${API_BASE}/brands`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Gagal memuat brands");
        setBrands(await r.json());
      } catch (e: any) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, token]);

  const choose = async (brandId: string) => {
    try {
      setSubmitting(brandId);
      const res = await fetch(`${API_BASE}/brands/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ brandId }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pilihan brand");
      const data = await res.json();
      localStorage.setItem("activeBrand", JSON.stringify(data.selected));

      // gunakan PUSH supaya tombol back dari dashboard kembali ke /select-brand
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Error");
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-white/90 text-lg">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background & overlay -> sama dengan login */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/50" aria-hidden />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center">Pilih Brand</h1>
          <p className="mt-1 mb-6 text-center text-sm text-gray-600">
            {active ? (
              <>
                Brand aktif saat ini: <b>{active.name}</b>
              </>
            ) : (
              "Belum ada brand aktif"
            )}
          </p>

          {err && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="space-y-3">
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => choose(b.id)}
                disabled={!!submitting}
                className={`w-full py-3 rounded-lg border text-center text-base font-semibold transition ${
                  submitting === b.id
                    ? "bg-green-600 text-white"
                    : "bg-white hover:bg-green-50 border-gray-300"
                }`}
              >
                {submitting === b.id ? "Menyimpan..." : b.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => router.replace("/auth/login")}
            className="mt-6 w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Ganti Akun
          </button>
        </div>
      </div>
    </div>
  );
}
