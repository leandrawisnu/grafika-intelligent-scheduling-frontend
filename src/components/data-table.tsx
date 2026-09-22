"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Filter, Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TABLE_SEARCH_PLACEHOLDER,
  type ColumnSortType,
  type TableFilterConfig,
  type TableSortOption,
} from "@/lib/table-controls";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  sortType?: ColumnSortType;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  sortOptions: TableSortOption[];
  filters?: TableFilterConfig[];
  searchPlaceholder?: string;
  getSearchText?: (row: Record<string, unknown>) => string;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
}

function cellText(value: unknown, row: Record<string, unknown>, col: Column): string {
  if (col.render) {
    const rendered = col.render(row[col.key], row);
    if (typeof rendered === "string" || typeof rendered === "number") return String(rendered);
  }
  const raw = row[col.key];
  if (raw == null) return "";
  if (typeof raw === "object") return "";
  return String(raw);
}

function compareRows(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  sortValue: string,
  columns: Column[],
): number {
  const [key, dir] = sortValue.split(":");
  const col = columns.find((c) => c.key === key) ?? columns[0];
  const sortType = col?.sortType ?? "text";

  if (sortType === "number") {
    const av = Number(a[key]);
    const bv = Number(b[key]);
    const cmp = (Number.isFinite(av) ? av : 0) - (Number.isFinite(bv) ? bv : 0);
    return dir === "asc" ? cmp : -cmp;
  }

  if (sortType === "date") {
    const av = String(a[key] ?? "");
    const bv = String(b[key] ?? "");
    const cmp = av.localeCompare(bv);
    return dir === "asc" ? cmp : -cmp;
  }

  const av = cellText(a[key], a, col).toLowerCase();
  const bv = cellText(b[key], b, col).toLowerCase();
  const cmp = av.localeCompare(bv, "id");
  return dir === "asc" ? cmp : -cmp;
}

const ALL_FILTER = "__all__";

const toolbarSelectTriggerClass =
  "h-8 w-full min-w-[220px] gap-2 px-3 text-sm sm:w-[260px] [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate";

function sortOptionLabel(options: TableSortOption[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? "Urutkan";
}

function filterOptionLabel(filter: TableFilterConfig, selected: string): string {
  if (!selected) return filter.allLabel;
  const opt = filter.options.find(
    (o) => o.value === selected || String(o.value) === String(selected),
  );
  return opt?.label ?? filter.allLabel;
}

function rowMatchesFilter(row: Record<string, unknown>, key: string, selected: string): boolean {
  return String(row[key] ?? "") === String(selected);
}

export function DataTable({
  columns,
  data,
  sortOptions,
  filters = [],
  searchPlaceholder = TABLE_SEARCH_PLACEHOLDER,
  getSearchText,
  onEdit,
  onDelete,
}: DataTableProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [sort, setSort] = useState(sortOptions[0]?.value ?? "default");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let next = [...data];

    for (const filter of filters) {
      const selected = filterValues[filter.key];
      if (!selected) continue;
      next = next.filter((row) => rowMatchesFilter(row, filter.key, selected));
    }

    if (q) {
      next = next.filter((row) => {
        const blob = getSearchText ? getSearchText(row) : rowSearchFallback(row, columns);
        return blob.includes(q);
      });
    }

    if (sort !== "default") {
      next = [...next].sort((a, b) => compareRows(a, b, sort, columns));
    }

    return next;
  }, [columns, data, debouncedQuery, filterValues, filters, getSearchText, sort]);

  const colSpan = columns.length + (onEdit || onDelete ? 1 : 0);
  const hasActiveSearch = debouncedQuery.trim().length > 0;
  const hasActiveFilter = Object.values(filterValues).some(Boolean);

  return (
    <div className="gis-panel overflow-hidden">
      <div className="border-b border-border/80 bg-card px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={sort} onValueChange={(v) => v && setSort(v)}>
            <SelectTrigger
              size="sm"
              className={cn(
                "bg-background",
                toolbarSelectTriggerClass,
              )}
            >
              <ArrowUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-left text-sm">
                {sortOptionLabel(sortOptions, sort)}
              </span>
            </SelectTrigger>
            <SelectContent align="start">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filters.map((filter) => {
            const selected = filterValues[filter.key] ?? "";
            const selectValue = selected || ALL_FILTER;
            const triggerLabel = filterOptionLabel(filter, selected);

            return (
            <Select
              key={filter.key}
              value={selectValue}
              onValueChange={(value) => {
                if (!value) return;
                setFilterValues((prev) => ({
                  ...prev,
                  [filter.key]: value === ALL_FILTER ? "" : value,
                }));
              }}
            >
              <SelectTrigger
                size="sm"
                className={cn(
                  "bg-background",
                  toolbarSelectTriggerClass,
                )}
              >
                <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-left text-sm">
                  {triggerLabel}
                </span>
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value={ALL_FILTER}>{filter.allLabel}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            );
          })}

          <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              data-density="compact"
              className="h-8 bg-background pl-10 pr-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/80 bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-11 px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="h-11 w-[108px] px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Aksi
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {hasActiveSearch || hasActiveFilter
                      ? "Tidak ada data yang cocok"
                      : "Belum ada data"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {hasActiveSearch || hasActiveFilter
                      ? "Coba kata kunci lain atau reset filter."
                      : "Gunakan tombol Tambah untuk menambah entri baru."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow
                  key={String(row.id ?? i)}
                  className={cn(
                    "border-border/60 transition-colors",
                    i % 2 === 1 && "bg-muted/25",
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-4 py-2.5 text-sm",
                        col.align === "right" && "text-right tabular-nums",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] != null && typeof row[col.key] === "object"
                          ? "—"
                          : String(row[col.key] ?? "—")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="px-4 py-2.5">
                      <div className="flex gap-0.5">
                        {onEdit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit"
                            onClick={() => onEdit(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Hapus"
                            onClick={() => onDelete(row)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function rowSearchFallback(row: Record<string, unknown>, columns: Column[]): string {
  const parts = columns.map((col) => cellText(row[col.key], row, col));
  for (const value of Object.values(row)) {
    if (value == null || typeof value === "object") continue;
    parts.push(String(value));
  }
  return parts.join(" ").toLowerCase();
}
