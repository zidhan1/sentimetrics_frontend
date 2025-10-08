"use client";

type Channel = {
  name: string;
  icon: string;
  total: number;
  open: number;
  close: number;
  itemActive: number;
  itemInactive: number;
};

export default function SummaryCards({ data, loading }: { data: any; loading: boolean }) {
  const channels: Channel[] =
    data?.channels?.length
      ? data.channels
      : [
          { name: "GrabFood", icon: "🛵", total: 105, open: 99, close: 6, itemActive: 6154, itemInactive: 1393 },
          { name: "GoFood", icon: "🍜", total: 105, open: 100, close: 5, itemActive: 6292, itemInactive: 1469 },
          { name: "ShopeeFood", icon: "🍱", total: 105, open: 100, close: 5, itemActive: 6362, itemInactive: 1821 },
          { name: "AirAsiaFood", icon: "✈️", total: 0, open: 0, close: 0, itemActive: 0, itemInactive: 0 },
        ];

  return (
    <div className="rounded-2xl bg-white/95 p-4 lg:p-6 shadow-md">
      <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <b>Fitur Baru!</b> Pilih brand dari Topbar, seluruh data akan mengikuti.
      </div>

      <h2 className="text-lg font-semibold mb-4">Laporan Terkini</h2>

      {loading ? (
        <div className="text-sm text-gray-600">Memuat data…</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Channel cards */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((ch) => (
              <div key={ch.name} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{ch.icon}</div>
                  <div>
                    <div className="font-semibold">{ch.name}</div>
                    <div className="text-xs text-gray-500">{ch.total} Total Outlet</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="text-green-600">{ch.open} Outlet Buka</div>
                  <div className="text-emerald-700 text-right">{ch.itemActive} Item Aktif</div>
                  <div className="text-red-500">{ch.close} Outlet Tutup</div>
                  <div className="text-rose-600 text-right">{ch.itemInactive} Item Tidak Aktif</div>
                </div>
              </div>
            ))}
          </div>

          {/* Placeholder slot untuk inject komponen lain (mis. RatingChart) di page.tsx */}
          <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 p-4 shadow-sm flex items-center justify-center text-sm text-gray-500">
            Tambahkan grafik di samping → (di page.tsx sudah diisi RatingChart)
          </div>
        </div>
      )}
    </div>
  );
}
