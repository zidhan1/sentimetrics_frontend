// app/auth/login/page.tsx
"use client";

import { useBrand } from "@/app/providers/BrandProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Type definitions
interface Brand {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface LoginResponse {
  token: string;
  user?: unknown;
  brands?: Array<{ id: number | string; name: string; [key: string]: unknown }>;
  message?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const brandContext = useBrand();
  const seedBrands = brandContext?.seedBrands;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Jika sudah punya token, langsung alihkan ke /dashboard
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) router.replace("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Antisipasi response non-JSON
      let data: LoginResponse | Record<string, unknown> = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        const errorMessage =
          typeof data === "object" && data !== null && "message" in data
            ? String(data.message)
            : "Login gagal";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Response backend diasumsikan: { token, user, brands, message }
      const token =
        typeof data === "object" && data !== null && "token" in data
          ? String(data.token)
          : undefined;
      const user =
        typeof data === "object" && data !== null && "user" in data
          ? data.user
          : undefined;
      const rawBrands =
        typeof data === "object" &&
        data !== null &&
        "brands" in data &&
        Array.isArray(data.brands)
          ? (data.brands as Array<{
              id: number | string;
              name: string;
              [key: string]: unknown;
            }>)
          : [];

      // Convert brands to Brand type with string IDs
      const brands: Brand[] = rawBrands.map((b) => ({
        ...b,
        id: String(b.id),
      }));

      if (!token) {
        setError("Token tidak ditemukan dalam response");
        setLoading(false);
        return;
      }

      // Simpan kredensial
      document.cookie = `token=${token}; path=/; max-age=3600; samesite=lax`;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user ?? {}));

      // Seed BrandProvider agar Topbar langsung punya data brand
      // (aktifkan brand pertama sebagai default jika belum ada pilihan)
      const firstBrandId = brands.length ? brands[0].id : undefined;
      if (seedBrands) {
        seedBrands(brands, firstBrandId);
      }

      // (Opsional) Simpan activeBrand juga di localStorage (BrandProvider juga sudah melakukannya)
      if (firstBrandId) {
        const active = brands.find((b: Brand) => b.id === firstBrandId);
        if (active) localStorage.setItem("activeBrand", JSON.stringify(active));
      }

      // Alihkan ke dashboard
      router.replace("/dashboard");
    } catch {
      setError("Tidak bisa terhubung ke server");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Background pattern/overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-90"
        aria-hidden
      />
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"
        aria-hidden
      />

      {/* Card form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 border border-gray-700 shadow-2xl rounded-2xl bg-gray-800/80 backdrop-blur-xl md:p-10">
          {/* Logo */}
          <div className="mb-16 text-center">
            <Image
              src="/logo-sentimetrics-transparant.png"
              alt="Sentimetrics Logo"
              width={480} // resolusi besar agar tajam
              height={160}
              priority
              className="
          mx-auto h-auto 
          w-[240px]            // mobile
          sm:w-[280px]         // tablet kecil
          md:w-[340px]         // desktop
          lg:w-[380px] 
          mb-4 md:mb-5         // jarak ke form diperkecil
        "
            />
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-200">
                Username
              </label>
              {/* <p className="px-3 py-2 mb-3 text-xs border rounded-lg text-amber-400/80 bg-amber-400/10 border-amber-400/20">
                *Jika anda Area Manager, gunakan nomor HP anda untuk login.
              </p> */}
              <input
                type="text"
                placeholder="Masukkan username"
                className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3.5 text-white placeholder-gray-400 outline-none transition-all duration-200 focus:border-[#cbdb34] focus:bg-gray-700 focus:ring-2 focus:ring-green-500/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-200">
                Password
              </label>
              <input
                type="password"
                placeholder="Masukkan password brand"
                className="mb-4 w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 outline-none transition-all duration-200 focus:border-[#cbdb34] focus:bg-gray-700 focus:ring-2 focus:ring-green-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 text-sm text-red-200 border rounded-xl border-red-400/30 bg-red-500/10 backdrop-blur-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#cbdb34] py-3.5 text-sm font-semibold text-black 
             transition-all duration-200 hover:bg-[#e2f243] active:scale-[0.98] 
             disabled:cursor-not-allowed disabled:opacity-70 shadow-lg hover:shadow-[#cbdb34]/40"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2 -ml-1 text-black animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </div>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Sentimetrics. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
