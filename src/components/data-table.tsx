"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, Pencil, Search, Trash2 } from "lucide-react";
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

const PAGE_SIZES = [10, 50, 100] as const;

interface ServerPaging {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onFilterChange: (filters: Record<string, string>) => void;
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
  extraActions?: (row: Record<string, unknown>) => React.ReactNode;
  serverPaging?: ServerPaging;
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
  extraActions,
  serverPaging,
}: DataTableProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [sort, setSort] = useState(sortOptions[0]?.value ?? "default");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const sentSearch = useRef("");

  useEffect(() => {
    if (!serverPaging) return;
    if (debouncedQuery === sentSearch.current) return;
    sentSearch.current = debouncedQuery;
    serverPaging.onSearchChange(debouncedQuery);
  }, [debouncedQuery, serverPaging]);

  const rows = useMemo(() => {
    if (serverPaging) return data;
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
  }, [columns, data, debouncedQuery, filterValues, filters, getSearchText, serverPaging, sort]);

  const total = serverPaging ? serverPaging.total : rows.length;
  const size = serverPaging ? serverPaging.pageSize : pageSize;
  const currentPage = serverPaging ? serverPaging.page : page;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, currentPage), pageCount);
  const visibleRows = serverPaging
    ? rows
    : rows.slice((safePage - 1) * size, safePage * size);

  useEffect(() => {
    if (serverPaging) return;
    setPage(1);
  }, [debouncedQuery, filterValues, serverPaging, sort]);

  const goToPage = (next: number) => {
    const bounded = Math.min(Math.max(1, next), pageCount);
    if (serverPaging) serverPaging.onPageChange(bounded);
    else setPage(bounded);
  };

  const changePageSize = (next: number) => {
    if (!PAGE_SIZES.includes(next as (typeof PAGE_SIZES)[number])) return;
    if (serverPaging) serverPaging.onPageSizeChange(next);
    else {
      setPageSize(next);
      setPage(1);
    }
  };

  const kolomAksi = Boolean(onEdit || onDelete || extraActions);
  const colSpan = columns.length + (kolomAksi ? 1 : 0);
  const hasActiveSearch = debouncedQuery.trim().length > 0;
  const hasActiveFilter = Object.values(filterValues).some(Boolean);

  return (
    <div className="gis-panel overflow-hidden">
      <div className="border-b border-border/80 bg-card px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={sort}
            onValueChange={(v) => {
              if (!v) return;
              setSort(v);
              serverPaging?.onSortChange(v);
            }}
          >
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
                const next = {
                  ...filterValues,
                  [filter.key]: value === ALL_FILTER ? "" : value,
                };
                setFilterValues(next);
                serverPaging?.onFilterChange(next);
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
              {kolomAksi && (
                <TableHead className="h-11 w-[108px] px-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Aksi
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length === 0 ? (
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
              visibleRows.map((row, i) => (
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
                  {kolomAksi && (
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
                        {extraActions && extraActions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {(safePage - 1) * size + 1}–{Math.min(safePage * size, total)} dari {total}
            </p>
            <Select
              value={String(size)}
              onValueChange={(value) => {
                if (!value) return;
                changePageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="h-8 w-[4.5rem] px-2" aria-label="Jumlah data per halaman">
                <span className="text-sm tabular-nums">{size}</span>
              </SelectTrigger>
              <SelectContent align="start">
                {PAGE_SIZES.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Sebelumnya"
              disabled={safePage <= 1}
              onClick={() => goToPage(safePage - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-10 text-center text-xs tabular-nums text-muted-foreground">
              {safePage} / {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Berikutnya"
              disabled={safePage >= pageCount}
              onClick={() => goToPage(safePage + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
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
