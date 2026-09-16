import type { WishlistItem } from "@/lib/items";

const CSV_COLUMNS = ["title", "url", "image_url", "category", "notes", "price"] as const;

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function itemsToCsv(items: WishlistItem[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = items.map((item) =>
    CSV_COLUMNS.map((col) =>
      escapeCsvField(item[col] == null ? "" : String(item[col])),
    ).join(","),
  );
  return [header, ...rows].join("\r\n");
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += char;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text.trim());
  if (rows.length === 0) return [];

  const [header, ...dataRows] = rows;
  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    header.forEach((key, idx) => {
      record[key.trim()] = row[idx] ?? "";
    });
    return record;
  });
}
