// utils/csv.ts

export type CsvCell = string | number | null | undefined;

export type CsvColumn<T> = {
  header: string;
  value: (row: T, index: number) => CsvCell;
};

export function toCsvRow(fields: CsvCell[], delim = ","): string {
  return fields
    .map((v) => {
      if (v == null) return "";
      const s = String(v);
      // quote kalau ada koma, kutip, newline
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(delim);
}

export function toCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  delim = ","
): string {
  const header = toCsvRow(columns.map((c) => c.header), delim);
  const body = rows.map((row, i) =>
    toCsvRow(columns.map((c) => c.value(row, i)), delim)
  );
  return [header, ...body].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // Tambah BOM agar Excel membaca UTF-8 dengan benar
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Helper utama: ekspor rows ke CSV dengan definisi kolom.
 * Contoh:
 *   exportCsv(items, [
 *     { header: "ID", value: r => r.id },
 *     { header: "Nama", value: r => r.name }
 *   ], "items.csv")
 */
export function exportCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string,
  delim = ","
): void {
  const csv = toCsv(rows, columns, delim);
  downloadCsv(filename, csv);
}
