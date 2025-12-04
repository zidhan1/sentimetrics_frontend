"use client";

export type Filters = {
  channelId: number | "all" | string;
  outletId: number | "all" | string;   // 👈 NEW
  rating: number | "all" | string;
  q: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
};

type Option = { id: number | "all" | string; name: string };

type Props = {
  value: Filters;
  onChange: (v: Filters) => void;
  channels: Option[];
  outlets?: Option[]; // 👈 NEW (optional, tapi kalau ada akan ditampilkan)
};

function ymd(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function ReviewsFilters({ value, onChange, channels, outlets = [] }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  const setLastDays = (n: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (n - 1));
    set({ dateFrom: ymd(from), dateTo: ymd(to) });
  };

  const resetDates = () => set({ dateFrom: "", dateTo: "" });

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-6">
        {/* Pencarian */}
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600">Pencarian</label>
          <input
            value={value.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Cari pesan, produk dipesan, atau nama pelanggan…"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>

        {/* Channel */}
        <div>
          <label className="text-xs text-gray-600">Channel</label>
          <select
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={value.channelId}
            onChange={(e) => set({ channelId: e.target.value })}
          >
            {channels.map((c) => (
              <option key={String(c.id)} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Outlet (jika ada) */}
        <div>
          <label className="text-xs text-gray-600">Outlet</label>
          <select
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={value.outletId}
            onChange={(e) => set({ outletId: e.target.value })}
          >
            {([{ id: "all", name: "Semua Outlet" }, ...outlets] as Option[]).map((o) => (
              <option key={String(o.id)} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="text-xs text-gray-600">Rating</label>
          <select
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={value.rating}
            onChange={(e) => set({ rating: e.target.value })}
          >
            <option value="all">Semua</option>
            <option value="5">5★</option>
            <option value="4">4★</option>
            <option value="3">3★</option>
            <option value="2">2★</option>
            <option value="1">1★</option>
          </select>
        </div>

        {/* Dari */}
        <div>
          <label className="text-xs text-gray-600">Dari</label>
          <input
            type="date"
            value={value.dateFrom}
            onChange={(e) => set({ dateFrom: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        {/* Sampai */}
        <div>
          <label className="text-xs text-gray-600">Sampai</label>
          <input
            type="date"
            value={value.dateTo}
            onChange={(e) => set({ dateTo: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Preset tanggal */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLastDays(7)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
        >
          7 Hari
        </button>
        <button
          type="button"
          onClick={() => setLastDays(30)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
        >
          30 Hari
        </button>
        <button
          type="button"
          onClick={resetDates}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
        >
          Reset Tanggal
        </button>
      </div>
    </div>
  );
}
