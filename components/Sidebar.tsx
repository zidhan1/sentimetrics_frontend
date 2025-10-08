"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/hooks/useUser";
import ConfirmDialog from "./ConfirmDialog";

type Props = {
  /** drawer state untuk mobile */
  open?: boolean;
  /** tutup drawer */
  onClose?: () => void;
  /** toggle drawer (dipakai oleh tombol ☰ agar bisa buka/tutup) */
  onToggle?: () => void;
  /** lebar sidebar di desktop (default w-72) */
  widthClass?: string;
};

export default function Sidebar({
  open = false,
  onClose,
  onToggle,
  widthClass = "w-72",
}: Props) {
  const router = useRouter();
  const user = useUser();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  // ESC = close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const doLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("activeBrand");
      document.cookie = "token=; Max-Age=0; path=/";
    } finally {
      router.replace("/login");
      setTimeout(() => window.location.replace("/login"), 0);
    }
  };

  const Item = ({
    children,
    active = false,
    onClick,
  }: {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium
        ${active ? "bg-green-600 text-white" : "text-gray-700 hover:bg-white/60"}`}
    >
      {children}
    </button>
  );

  const closeAnd = (fn?: () => void) => () => {
    fn?.();
    onClose?.();
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
        className={`
    fixed inset-y-0 left-0 z-40
    ${widthClass}
    transform transition-transform duration-300 ease-in-out
    bg-white/95 backdrop-blur shadow-xl
    ${open ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        {/* gunakan h-dvh agar pas di iOS */}
        <div className="h-dvh flex flex-col">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 shrink-0 border-b border-gray-100 flex items-center">
            <span className="text-2xl font-extrabold">
              <span className="text-gray-900">Senti</span>
              <span className="text-green-600">metrics</span>
            </span>
            <button
              type="button"
              aria-label="Tutup menu"
              className="ml-auto lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 hover:bg-green-50"
              onClick={onToggle ?? onClose}
            >
              ✕
            </button>
          </div>

          {/* Menu (scroll) */}
          <nav
            className="
              flex-1 overflow-y-auto p-4 space-y-1
              pb-24            /* beri ruang bawah agar tidak ketabrak footer */
              [-webkit-overflow-scrolling:touch]  /* iOS smooth scroll */
            "
          >
            <Item active onClick={closeAnd(() => router.push("/dashboard"))}>
              🏠 Beranda
            </Item>
            <Item onClick={closeAnd()} >⭐ Rating</Item>
            <Item onClick={closeAnd()} >📡 Live Report</Item>

            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">
                Laporan
              </div>
              <div className="ml-2 space-y-1">
                <Item onClick={closeAnd()} >Ringkasan</Item>
                <Item onClick={closeAnd()} >Per Outlet</Item>
              </div>
            </div>

            <Item onClick={closeAnd()} >📍 Outlet</Item>
            <Item onClick={closeAnd()} >🍗 Item</Item>
            <Item onClick={closeAnd()} >🕒 Aktivitas</Item>
            <Item onClick={closeAnd()} >
              🧬 Varian
              <span className="ml-auto rounded-full bg-red-500/10 text-red-600 text-[10px] px-2 py-0.5">
                Baru
              </span>
            </Item>
            <Item onClick={closeAnd()} >💬 Ulasan</Item>

            {user?.role === "superadmin" && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/60"
                >
                  ⚙️ Pengaturan
                  <span className="ml-auto text-xs">{settingsOpen ? "▴" : "▾"}</span>
                </button>

                {settingsOpen && (
                  <div className="ml-2 mt-1 space-y-1">
                    <Link href="/settings/add-user" className="block" onClick={onClose}>
                      <div className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium cursor-pointer text-gray-700 hover:bg-white/60">
                        ➕ Tambahkan User
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Footer (logout) */}
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={() => setOpenConfirm(true)}
              className="w-full text-left text-gray-700 hover:text-red-600 px-4 py-2 text-sm"
            >
              ⛔ Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Dialog konfirmasi logout */}
      <ConfirmDialog
        open={openConfirm}
        title="Keluar dari Sentimetrics?"
        description="Sesi Anda akan diakhiri dan Anda perlu login kembali."
        confirmText="Keluar"
        cancelText="Batal"
        onConfirm={doLogout}
        onClose={() => setOpenConfirm(false)}
      />
    </>
  );
}
