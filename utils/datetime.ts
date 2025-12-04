// utils/datetime.ts

/** Format ke WIB (Asia/Jakarta), aman untuk tampilan UI */
export function formatWIB(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", { hour12: false, timeZone: "Asia/Jakarta" });
  } catch {
    return dateStr ?? "—";
  }
}

/** Format ke "YYYY-MM-DD HH:mm:ss" untuk CSV */
export function formatWIBForCsv(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${dd} ${hh}:${mm}:${ss}`;
}
