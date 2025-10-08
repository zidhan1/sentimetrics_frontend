"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import SuperadminGate from "@/components/SuperadminGate";
import Link from "next/link";

export default function SettingsHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SuperadminGate>
      <div className="min-h-screen bg-gray-200/40">
        {/* Sidebar: drawer on mobile, fixed on desktop */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Konten: sisakan ruang untuk sidebar saat desktop */}
        <div className="lg:pl-72">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <div className="rounded-2xl bg-white/95 p-6 shadow-md">
              <h1 className="text-2xl font-bold mb-4">Pengaturan</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/settings/add-user"
                  className="rounded-xl border border-gray-200 bg-white p-4 hover:bg-green-50 transition"
                >
                  <div className="font-semibold">➕ Tambahkan User</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Buat user baru dan tautkan ke company/brand.
                  </p>
                </Link>

                {/* kartu pengaturan lain nanti di sini */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SuperadminGate>
  );
}
