import type { ReactNode } from "react";
import { resolveFkLabel } from "@/lib/display-labels";

export type TableSortOption = {
  value: string;
  label: string;
};

export type TableFilterConfig = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel: string;
};

type FieldLike = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date";
  /** Tampilkan dropdown filter di toolbar tabel (default: true untuk select). */
  tableFilter?: boolean;
  options?: { value: string; label: string }[];
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
};

export function buildTableSortOptions(fields: FieldLike[]): TableSortOption[] {
  const options: TableSortOption[] = [{ value: "default", label: "Urutan default" }];

  for (const f of fields) {
    if (f.key === "semester_ke") {
      options.push(
        { value: "semester_ke:asc", label: "Ganjil → Genap" },
        { value: "semester_ke:desc", label: "Genap → Ganjil" },
      );
      continue;
    }

    if (f.type === "number") {
      options.push(
        { value: `${f.key}:asc`, label: `${f.label} terkecil` },
        { value: `${f.key}:desc`, label: `${f.label} terbesar` },
      );
      continue;
    }

    if (f.type === "date") {
      options.push(
        { value: `${f.key}:asc`, label: `${f.label} terlama` },
        { value: `${f.key}:desc`, label: `${f.label} terbaru` },
      );
      continue;
    }

    if (f.type === "select") {
      options.push(
        { value: `${f.key}:asc`, label: `${f.label} A–Z` },
        { value: `${f.key}:desc`, label: `${f.label} Z–A` },
      );
      continue;
    }

    options.push(
      { value: `${f.key}:asc`, label: `${f.label} A–Z` },
      { value: `${f.key}:desc`, label: `${f.label} Z–A` },
    );
  }

  return options;
}

export function buildTableFilters(fields: FieldLike[]): TableFilterConfig[] {
  return fields
    .filter(
      (f) =>
        f.type === "select" &&
        f.options &&
        f.options.length > 0 &&
        f.tableFilter !== false &&
        f.key !== "tahun_ajaran_id" &&
        f.key !== "semester_id",
    )
    .map((f) => ({
      key: f.key,
      label: f.label,
      options: f.options!.map((o) => ({ value: String(o.value), label: o.label })),
      allLabel:
        f.key === "semester_ke"
          ? "Semua semester"
          : f.key.endsWith("_id")
            ? `Semua ${f.label.toLowerCase()}`
            : `Semua ${f.label.toLowerCase()}`,
    }));
}

export const TABLE_SEARCH_PLACEHOLDER = "Search";

export function rowSearchText(row: Record<string, unknown>, fields: FieldLike[]): string {
  const parts: string[] = [];

  for (const f of fields) {
    if (f.render) {
      const rendered = f.render(row[f.key], row);
      if (typeof rendered === "string" || typeof rendered === "number") {
        parts.push(String(rendered));
      }
    }
    if (f.type === "select" && f.key.endsWith("_id")) {
      parts.push(resolveFkLabel(row, f.key, undefined, f.options));
    } else if (f.type === "select" && f.options) {
      const id = String(row[f.key] ?? "");
      const opt = f.options.find((o) => o.value === id);
      if (opt) parts.push(opt.label);
    }
    const raw = row[f.key];
    if (raw != null && typeof raw !== "object") parts.push(String(raw));
  }

  for (const value of Object.values(row)) {
    if (value == null || typeof value === "object") continue;
    parts.push(String(value));
  }

  return parts.join(" ").toLowerCase();
}

export type ColumnSortType = "text" | "number" | "date";

export function columnSortType(field: FieldLike): ColumnSortType {
  if (field.type === "number") return "number";
  if (field.type === "date") return "date";
  return "text";
}
