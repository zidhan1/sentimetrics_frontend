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

export default function SummaryCards({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  const channels: Channel[] = data?.channels?.length
    ? data.channels
    : [
        {
          name: "GrabFood",
          icon: "🛵",
          total: 105,
          open: 99,
          close: 6,
          itemActive: 6154,
          itemInactive: 1393,
        },
        {
          name: "GoFood",
          icon: "🍜",
          total: 105,
          open: 100,
          close: 5,
          itemActive: 6292,
          itemInactive: 1469,
        },
        {
          name: "ShopeeFood",
          icon: "🍱",
          total: 105,
          open: 100,
          close: 5,
          itemActive: 6362,
          itemInactive: 1821,
        },
        {
          name: "AirAsiaFood",
          icon: "✈️",
          total: 0,
          open: 0,
          close: 0,
          itemActive: 0,
          itemInactive: 0,
        },
      ];

  return (
    <div className="p-4 shadow-md rounded-2xl bg-white/95 lg:p-6">
      <div className="px-4 py-3 mb-4 text-sm border rounded-xl border-emerald-100 bg-emerald-50 text-emerald-800">
        <b>Fitur Baru!</b> Pilih brand dari Topbar, seluruh data akan mengikuti.
      </div>

      <h2 className="mb-4 text-lg font-semibold">Laporan Terkini</h2>

      {loading ? (
        <div className="text-sm text-gray-600">Memuat data…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Channel cards */}
          <div className="grid grid-cols-1 gap-4 xl:col-span-2 md:grid-cols-2">
            {channels.map((ch) => (
              <div
                key={ch.name}
                className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{ch.icon}</div>
                  <div>
                    <div className="font-semibold">{ch.name}</div>
                    <div className="text-xs text-gray-500">
                      {ch.total} Total Outlet
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="text-green-600">{ch.open} Outlet Buka</div>
                  <div className="text-right text-emerald-700">
                    {ch.itemActive} Item Aktif
                  </div>
                  <div className="text-red-500">{ch.close} Outlet Tutup</div>
                  <div className="text-right text-rose-600">
                    {ch.itemInactive} Item Tidak Aktif
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Placeholder slot untuk inject komponen lain (mis. RatingChart) di page.tsx */}
          <div className="flex items-center justify-center p-4 text-sm text-gray-500 border border-gray-200 border-dashed shadow-sm rounded-xl bg-white/60">
            Tambahkan grafik di samping → (di page.tsx sudah diisi RatingChart)
          </div>
        </div>
      )}
    </div>
  );
}
