"use client";

import { useBrand } from "@/app/providers/BrandProvider";
import { useUser } from "@/app/hooks/useUser";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  onOpenSidebar?: () => void;
};

export default function Topbar({ onOpenSidebar }: Props) {
  const brandContext = useBrand();
  const {
    brands = [],
    activeBrand = null,
    selectBrand = () => {},
    loading = false,
  } = brandContext || {};
  const user = useUser(); // ✅ ambil data user login
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        popRef.current &&
        !popRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 shadow-md bg-white/95 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3 lg:px-6">
        {/* ☰ Hamburger */}
        <button
          type="button"
          aria-label="Buka menu"
          className="inline-flex items-center justify-center border border-gray-200 rounded-md lg:hidden h-9 w-9 hover:bg-green-50"
          onClick={() => onOpenSidebar?.()}
        >
          ☰
        </button>

        {/* 👤 Greeting yang menampilkan username */}
        <div className="text-sm text-gray-600 truncate max-w-[45vw] sm:max-w-none">
          Selamat datang di <b>Sentimetrics</b>,{" "}
          <span className="font-semibold text-green-600">
            {user?.username || "Pengguna"}
          </span>
        </div>

        {/* Dropdown Brand */}
        <div className="relative ml-auto">
          <button
            ref={btnRef}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-green-50 min-w-[150px] sm:min-w-[180px] flex items-center justify-between gap-2"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span>
              {activeBrand
                ? activeBrand.name
                : loading
                ? "Memuat…"
                : brands.length
                ? "Pilih Brand"
                : "Tidak ada brand"}
            </span>
            <span aria-hidden>▾</span>
          </button>

          {open && (
            <div
              ref={popRef}
              className="fixed left-2 right-2 top-[64px] md:absolute md:right-0 md:top-auto md:mt-2 md:w-64 rounded-xl border border-gray-200 bg-white shadow-xl z-[60] overflow-hidden"
              role="listbox"
              tabIndex={-1}
            >
              <div className="max-h-[70vh] md:max-h-72 overflow-auto">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    role="option"
                    aria-selected={activeBrand?.id === b.id}
                    onClick={async () => {
                      setOpen(false);
                      await selectBrand(b.id);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 ${
                      activeBrand?.id === b.id
                        ? "bg-green-50 font-semibold"
                        : ""
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
                {(!brands || brands.length === 0) && !loading && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Belum ada brand yang bisa dipilih
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
