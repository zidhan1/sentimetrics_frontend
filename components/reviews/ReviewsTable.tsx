"use client";

type ReviewRow = {
  id: number;
  rating: number;
  message: string;
  createdAt: string;
  orderedProduct?: string | null;
  customerName?: string | null;
  outlet?: { id: number; name: string } | null;
  channel?: { name: string } | null;
};

type SortDir = "asc" | "desc" | null;
type SortKey =
  | "createdAt"
  | "outletName"
  | "channelName"
  | "rating"
  | "message"
  | "orderedProduct"
  | "customerName";

type Props = {
  rows: ReviewRow[];
  loading?: boolean;
  sort: { key: SortKey; dir: SortDir };
  onToggleSort: (key: SortKey) => void;
};

export default function ReviewsTable({ rows, loading, sort, onToggleSort }: Props) {
  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        <span className="animate-pulse">Memuat ulasan...</span>
      </div>
    );

  if (!rows?.length)
    return (
      <div className="p-8 text-center text-gray-500">
        Tidak ada ulasan ditemukan.
      </div>
    );

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return "bg-green-100 text-green-700";
    if (rating === 4) return "bg-lime-100 text-lime-700";
    if (rating === 3) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const icon = (key: SortKey) =>
    sort.key !== key || !sort.dir ? "↕" : sort.dir === "asc" ? "▲" : "▼";

  const Th = ({
    children,
    colKey,
    className = "",
    center = false,
  }: {
    children: React.ReactNode;
    colKey: SortKey;
    className?: string;
    center?: boolean;
  }) => (
    <th className={`px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onToggleSort(colKey)}
        className={`inline-flex items-center gap-1 font-semibold text-xs uppercase text-gray-700 hover:text-green-700 ${
          center ? "justify-center w-full" : ""
        }`}
        title="Klik untuk urut"
      >
        <span>{children}</span>
        <span className="text-[10px]">{icon(colKey)}</span>
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <Th colKey="createdAt">Tanggal</Th>
            <Th colKey="outletName">Outlet</Th>
            <Th colKey="channelName">Channel</Th>
            <Th colKey="rating" center className="text-center">Rating</Th>
            <Th colKey="message" className="w-[30%]">Pesan</Th>
            <Th colKey="orderedProduct">Produk Dipesan</Th>
            <Th colKey="customerName">Pelanggan</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id}
              className={`border-t border-gray-100 hover:bg-green-50/30 transition ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
              }`}
            >
              <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                {new Date(r.createdAt).toLocaleDateString("id-ID")}
              </td>
              <td className="px-4 py-3 text-gray-700">{r.outlet?.name || "-"}</td>
              <td className="px-4 py-3">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md">
                  {r.channel?.name || "-"}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-1 text-xs rounded-md font-medium ${getRatingColor(
                    r.rating
                  )}`}
                >
                  {r.rating}★
                </span>
              </td>
              <td className="px-4 py-3 text-gray-800 truncate max-w-xs" title={r.message}>
                {r.message}
              </td>
              <td className="px-4 py-3 text-gray-700">{r.orderedProduct || "-"}</td>
              <td className="px-4 py-3 text-gray-700">{r.customerName || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
