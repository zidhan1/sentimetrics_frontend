"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import SuperadminGate from "@/components/SuperadminGate";

type Company = { id: string; name: string };
type Brand = { id: string; name: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function AddUserPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // modal state
  const [openCompanyModal, setOpenCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [openBrandModal, setOpenBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const loadCompanies = async () => {
    const res = await fetch(`${API_BASE}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal memuat companies");
    const rows = await res.json();
    setCompanies(rows);
  };

  const loadBrands = async (cid: string) => {
    if (!cid) return setBrands([]);
    const res = await fetch(`${API_BASE}/companies/${cid}/brands`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setBrands(await res.json());
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadCompanies();
      } catch (e: any) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (companyId) loadBrands(companyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCompanyName }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Gagal membuat company");

      setNewCompanyName("");
      setOpenCompanyModal(false);
      await loadCompanies();
      setCompanyId(j.company.id);
      await loadBrands(j.company.id);
    } catch (e: any) {
      setErr(e.message || "Error");
    }
  };

  const createBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/companies/${companyId}/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newBrandName }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Gagal membuat brand");

      setNewBrandName("");
      setOpenBrandModal(false);
      await loadBrands(companyId);
    } catch (e: any) {
      setErr(e.message || "Error");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/superadmin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          password,
          role,
          company_id: companyId || null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Gagal membuat user");

      setMsg("User berhasil dibuat ✅");
      setUsername("");
      setPassword("");
      setRole("user");
      // keep company selection as-is
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SuperadminGate>
      <div className="min-h-screen bg-gray-200/40">
        {/* Sidebar: drawer on mobile, fixed on desktop */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Konten: sisakan ruang untuk sidebar saat desktop */}
        <div className="lg:pl-72">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="p-6">
            <div className="rounded-2xl bg-white/95 p-6 shadow-md max-w-3xl">
              <h1 className="text-2xl font-bold mb-4">Tambahkan User</h1>

              {loading ? (
                <div className="text-sm text-gray-600">Memuat data…</div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Username
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Role
                      </label>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium mb-1">
                          Company
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setOpenCompanyModal(true)}
                            className="text-xs rounded-md border px-2 py-1 hover:bg-green-50"
                          >
                            + Tambah Company
                          </button>
                          <button
                            type="button"
                            disabled={!companyId}
                            onClick={() => setOpenBrandModal(true)}
                            className="text-xs rounded-md border px-2 py-1 hover:bg-green-50 disabled:opacity-40"
                          >
                            + Tambah Brand
                          </button>
                        </div>
                      </div>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600"
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                      >
                        <option value="">— Tidak ditautkan —</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {companyId && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Brand pada Company ini
                      </label>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                        {brands.length === 0
                          ? "Belum ada brand."
                          : brands.map((b) => b.name).join(", ")}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        *Saat ini backend menautkan user ke <b>company</b>.
                        Akses brand mengikuti company tersebut.
                      </p>
                    </div>
                  )}

                  {err && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {err}
                    </div>
                  )}
                  {msg && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      {msg}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                    >
                      {submitting ? "Menyimpan..." : "Simpan User"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal Tambah Company */}
      {openCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={createCompany}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-3">Tambah Company</h3>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600"
              placeholder="Nama company"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              required
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenCompanyModal(false)}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-md bg-green-600 text-white px-3 py-1.5 text-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tambah Brand */}
      {openBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={createBrand}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-1">Tambah Brand</h3>
            <p className="text-xs text-gray-500 mb-3">
              Company: {companies.find((c) => c.id === companyId)?.name}
            </p>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600"
              placeholder="Nama brand"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              required
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenBrandModal(false)}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-md bg-green-600 text-white px-3 py-1.5 text-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </SuperadminGate>
  );
}
