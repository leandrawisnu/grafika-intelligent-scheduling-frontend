"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { clockForApi, normalizeClock, TimePicker } from "@/components/ui/time-picker";
import type { TableQuery } from "@/lib/api";
import { formatDateId, normalizeApiDateField } from "@/lib/dates";
import { resolveFkLabel } from "@/lib/display-labels";
import {
  buildTableFilters,
  TABLE_SEARCH_PLACEHOLDER,
  buildTableSortOptions,
  columnSortType,
  rowSearchText,
} from "@/lib/table-controls";
import { cn } from "@/lib/utils";
import { DataTable } from "./data-table";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "time";
  /** Batas bawah input angka. Default 1. `jam_ke` memakai 0. */
  min?: number;
  /** Batas atas input angka. `jam_ke` memakai 12. */
  max?: number;
  /** Untuk select: dropdown (default) atau segmented (pill dua pilihan). */
  selectVariant?: "dropdown" | "segmented";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  emptyOptionsHint?: string;
  emptyOptionsHref?: string;
  /** false = tanpa dropdown filter di toolbar tabel */
  tableFilter?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface CRUDPageProps {
  title: string;
  description?: string;
  dialogHint?: string;
  /** Judul modal tambah; edit memakai `Edit {title}` huruf kecil kecuali `editDialogTitle` diisi. */
  dialogTitle?: string;
  editDialogTitle?: string;
  onDialogOpen?: () => void;
  fields: Field[];
  fetchData: (query: TableQuery) => Promise<{ data: any[]; total: number; page: number; per_page: number }>;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  getInitialData?: () => any;
}

const CRUD_FORM_ID = "crud-dialog-form";

function numberBounds(field: Field): { min: number; max?: number } {
  return {
    min: field.min ?? 1,
    max: field.max ?? (field.key === "semester_ke" ? 2 : undefined),
  };
}

function selectOptionsKey(fields: Field[]) {
  return fields
    .filter((f) => f.type === "select")
    .map((f) => `${f.key}:${f.options?.map((o) => o.value).join(",") ?? ""}`)
    .join("|");
}

function selectOptionLabel(
  options: { value: string; label: string }[] | undefined,
  value: string,
  placeholder: string,
): string {
  if (!value.trim()) return placeholder;
  const opt = options?.find((o) => o.value === value || String(o.value) === String(value));
  return opt?.label ?? placeholder;
}

function foreignKeyFromRow(row: Record<string, unknown>, fieldKey: string): string | undefined {
  const direct = row[fieldKey];
  if (direct != null && direct !== "") return String(direct);

  const nestedKey = fieldKey.replace(/_id$/, "");
  if (nestedKey === fieldKey) return undefined;

  const nested = row[nestedKey];
  if (nested && typeof nested === "object" && "id" in nested) {
    return String((nested as { id: unknown }).id);
  }

  const pascal =
    nestedKey.charAt(0).toUpperCase() + nestedKey.slice(1).replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const alt = row[pascal];
  if (alt && typeof alt === "object" && "id" in alt) {
    return String((alt as { id: unknown }).id);
  }

  return undefined;
}

export function CRUDPage({
  title,
  description,
  dialogHint,
  dialogTitle,
  editDialogTitle,
  onDialogOpen,
  fields,
  fetchData,
  onCreate,
  onUpdate,
  onDelete,
  getInitialData,
}: CRUDPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [optionsKey, setOptionsKey] = useState("");

  const filterKey = JSON.stringify(activeFilters);
  const sawData = useRef(false);

  const load = async () => {
    if (!sawData.current) setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchData({ page, per_page: perPage, q: search, sort, filters: activeFilters });
      const ukuran = result.per_page || perPage;
      const lastPage = Math.max(1, Math.ceil((result.total || 0) / ukuran));
      if (page > lastPage) {
        setPage(lastPage);
        return;
      }
      setData(Array.isArray(result.data) ? result.data : []);
      setTotal(result.total || 0);
    } catch (err) {
      setData([]);
      setTotal(0);
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      sawData.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // fetchData is stable enough for master pages; query state drives reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, search, sort, filterKey]);

  const formFromRow = (row: Record<string, unknown>) => {
    const next: Record<string, unknown> = {};
    for (const field of fields) {
      let raw = row[field.key];
      if (field.type === "select") {
        const fk = foreignKeyFromRow(row, field.key);
        if (fk) raw = fk;
      }
      if (raw === undefined || raw === null) continue;
      if (field.type === "date") {
        next[field.key] = normalizeApiDateField(raw);
      } else if (field.type === "time") {
        next[field.key] = normalizeClock(raw);
      } else if (field.type === "select") {
        next[field.key] = String(raw);
      } else {
        next[field.key] = raw;
      }
    }
    return next;
  };

  const payloadFromForm = () => {
    const next = formFromRow(form);
    for (const field of fields) {
      if (field.type === "number" && next[field.key] !== undefined && next[field.key] !== "") {
        next[field.key] = Number(next[field.key]);
      }
      if (field.type === "time" && next[field.key] !== undefined && next[field.key] !== "") {
        next[field.key] = clockForApi(next[field.key]);
      }
    }
    return next;
  };

  const syncSelectDefaults = (
    base: Record<string, unknown>,
    opts?: { keepMissing?: boolean },
  ) => {
    const next = { ...base };
    for (const field of fields) {
      if (field.type !== "select" || !field.options?.length) continue;
      const current = String(next[field.key] ?? "");
      const valid = field.options.some((o) => o.value === current || String(o.value) === current);
      if (!valid) {
        if (opts?.keepMissing && current) continue;
        next[field.key] = field.options[0].value;
      }
    }
    return next;
  };

  const openAdd = () => {
    setEditingId(null);
    setSaveError(null);
    onDialogOpen?.();
    const initial = syncSelectDefaults(getInitialData?.() ?? {});
    setForm(initial);
    setDialogOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    setSaveError(null);
    onDialogOpen?.();
    setForm(syncSelectDefaults(formFromRow(row), { keepMissing: true }));
    setDialogOpen(true);
  };

  useEffect(() => {
    const key = selectOptionsKey(fields);
    if (!dialogOpen || key === optionsKey) return;
    setOptionsKey(key);
    setForm((prev: Record<string, unknown>) =>
      syncSelectDefaults(prev, editingId ? { keepMissing: true } : undefined),
    );
  }, [dialogOpen, editingId, fields, optionsKey]);

  const validateForm = (): string | null => {
    for (const field of fields) {
      const required = field.required ?? field.type === "select";
      if (!required) continue;
      const raw = form[field.key];
      if (raw === undefined || raw === null || String(raw).trim() === "") {
        return `${field.label} wajib diisi`;
      }
      if (field.type === "select") {
        const opts = field.options ?? [];
        if (opts.length === 0) {
          return field.emptyOptionsHint ?? `Pilihan ${field.label} belum tersedia`;
        }
        if (!opts.some((o) => o.value === String(raw))) {
          return `Pilih ${field.label} yang valid`;
        }
      }
    }
    for (const field of fields) {
      if (field.type !== "number") continue;
      const raw = form[field.key];
      if (raw === undefined || raw === null || String(raw).trim() === "") continue;
      const n = Number(raw);
      const { min, max } = numberBounds(field);
      if (!Number.isInteger(n) || n < min || (max !== undefined && n > max)) {
        return max !== undefined
          ? `${field.label} harus ${min} sampai ${max}`
          : `${field.label} minimal ${min}`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = payloadFromForm();
      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (confirm(`Hapus data ini?`)) {
      await onDelete(row.id);
      await load();
    }
  };

  const columns = fields.map((f) => ({
    key: f.key,
    label: f.label,
    sortType: columnSortType(f),
    render:
      f.render ??
      (f.type === "date"
        ? (value: unknown) => formatDateId(value == null ? "" : String(value))
        : f.type === "time"
          ? (value: unknown) => normalizeClock(value) || "—"
          : f.type === "select" && f.key.endsWith("_id")
          ? (_: unknown, row: Record<string, unknown>) =>
              resolveFkLabel(row, f.key, undefined, f.options)
          : undefined),
  }));

  const tableSortOptions = useMemo(() => buildTableSortOptions(fields), [fields]);
  const tableFilters = useMemo(() => buildTableFilters(fields), [fields]);

  const canSubmit = !validateForm();

  const modalTitle = editingId
    ? (editDialogTitle ?? `Edit ${title.toLowerCase()}`)
    : (dialogTitle ?? `Tambah ${title}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="gis-page-title">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={openAdd}>
          <Plus className="size-4 shrink-0" aria-hidden />
          Tambah
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : loadError ? (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Tidak bisa memuat dari API</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Pastikan backend jalan.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          sortOptions={tableSortOptions}
          filters={tableFilters}
          searchPlaceholder={TABLE_SEARCH_PLACEHOLDER}
          getSearchText={(row) => rowSearchText(row, fields)}
          columns={columns}
          data={data}
          onEdit={openEdit}
          onDelete={handleDelete}
          serverPaging={{
            page,
            pageSize: perPage,
            total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPerPage(size);
              setPage(1);
            },
            onSearchChange: (q) => {
              setPage(1);
              setSearch(q);
            },
            onSortChange: (next) => {
              setPage(1);
              setSort(next);
            },
            onFilterChange: (next) => {
              setPage(1);
              setActiveFilters(next);
            },
          }}
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSaveError(null);
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,36rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12">
            <DialogTitle>{modalTitle}</DialogTitle>
            {dialogHint ? (
              <DialogDescription className="text-pretty leading-snug">{dialogHint}</DialogDescription>
            ) : null}
          </DialogHeader>

          <form
            id={CRUD_FORM_ID}
            className="grid min-h-0 flex-1 grid-cols-1 gap-x-4 gap-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            {saveError ? (
              <p
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2"
                role="alert"
              >
                {saveError}
              </p>
            ) : null}

            {fields.map((field) => {
              const required = field.required ?? field.type === "select";
              const fieldWrapClass = cn(
                "space-y-2",
                field.type !== "date" && "sm:col-span-2",
              );
              if (field.type === "select") {
                const value = String(form[field.key] ?? "");
                const hasOptions = (field.options?.length ?? 0) > 0;
                const placeholder = `Pilih ${field.label.toLowerCase()}`;
                const displayLabel = selectOptionLabel(field.options, value, placeholder);
                const useSegmented =
                  field.selectVariant === "segmented" &&
                  hasOptions &&
                  (field.options?.length ?? 0) <= 4;

                return (
                  <div key={field.key} className={fieldWrapClass}>
                    <Label>
                      {field.label}
                      {required ? <span className="text-destructive"> *</span> : null}
                    </Label>
                    {!hasOptions ? (
                      <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                        <p>{field.emptyOptionsHint ?? "Belum ada data pilihan."}</p>
                        {field.emptyOptionsHref ? (
                          <Link
                            href={field.emptyOptionsHref}
                            className="mt-1 inline-block font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {field.emptyOptionsHref.includes("tahun-ajaran")
                              ? "Buka tahun ajaran"
                              : "Buka halaman terkait"}
                          </Link>
                        ) : null}
                      </div>
                    ) : useSegmented ? (
                      <div
                        className="flex gap-1.5 rounded-lg border border-border bg-muted/35 p-1.5"
                        role="group"
                        aria-label={field.label}
                      >
                        {field.options?.map((o) => {
                          const optValue = String(o.value);
                          const active = value === optValue;
                          return (
                            <Button
                              key={optValue}
                              type="button"
                              variant={active ? "default" : "ghost"}
                              className={cn(
                                "h-10 min-w-0 flex-1 rounded-md px-4 text-sm font-medium",
                                !active && "text-muted-foreground hover:text-foreground",
                              )}
                              aria-pressed={active}
                              onClick={() => setForm({ ...form, [field.key]: optValue })}
                            >
                              {o.label}
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <Select
                        value={value || null}
                        onValueChange={(next) => setForm({ ...form, [field.key]: next ?? "" })}
                      >
                        <SelectTrigger className="w-full min-w-0 gap-2 px-3">
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-left text-sm",
                              displayLabel === placeholder && "text-muted-foreground",
                            )}
                          >
                            {displayLabel}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((o) => (
                            <SelectItem key={o.value} value={String(o.value)}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.hint ? <p className="text-xs text-muted-foreground">{field.hint}</p> : null}
                  </div>
                );
              }

              if (field.type === "date") {
                return (
                  <div key={field.key} className={fieldWrapClass}>
                    <Label htmlFor={`crud-${field.key}`}>
                      {field.label}
                      {required ? <span className="text-destructive"> *</span> : null}
                    </Label>
                    <DatePicker
                      id={`crud-${field.key}`}
                      value={String(form[field.key] ?? "")}
                      onChange={(next) => setForm({ ...form, [field.key]: next })}
                      placeholder={field.placeholder ?? "Pilih tanggal"}
                      min={
                        field.key === "tanggal_selesai"
                          ? String(form.tanggal_mulai ?? "")
                          : undefined
                      }
                      aria-label={field.label}
                    />
                    {field.hint ? <p className="text-xs text-muted-foreground">{field.hint}</p> : null}
                  </div>
                );
              }

              if (field.type === "time") {
                return (
                  <div key={field.key} className={fieldWrapClass}>
                    <Label htmlFor={`crud-${field.key}`}>
                      {field.label}
                      {required ? <span className="text-destructive"> *</span> : null}
                    </Label>
                    <TimePicker
                      id={`crud-${field.key}`}
                      value={String(form[field.key] ?? "")}
                      onChange={(next) => setForm({ ...form, [field.key]: next })}
                      placeholder={field.placeholder ?? "Pilih waktu"}
                      aria-label={field.label}
                    />
                    {field.hint ? <p className="text-xs text-muted-foreground">{field.hint}</p> : null}
                  </div>
                );
              }

              const inputType = field.type === "number" ? "number" : "text";
              const { min: numberMin, max: numberMax } = numberBounds(field);

              return (
                <div key={field.key} className={fieldWrapClass}>
                  <Label htmlFor={`crud-${field.key}`}>
                    {field.label}
                    {required ? <span className="text-destructive"> *</span> : null}
                  </Label>
                  <Input
                    id={`crud-${field.key}`}
                    type={inputType}
                    placeholder={field.placeholder}
                    value={form[field.key] ?? ""}
                    onChange={(e) => {
                      if (field.type !== "number") {
                        setForm({ ...form, [field.key]: e.target.value });
                        return;
                      }
                      const raw = e.target.value;
                      if (raw === "") {
                        setForm({ ...form, [field.key]: "" });
                        return;
                      }
                      const n = Number(raw);
                      if (!Number.isFinite(n)) return;
                      const capped = numberMax === undefined ? n : Math.min(numberMax, n);
                      setForm({ ...form, [field.key]: Math.max(numberMin, Math.trunc(capped)) });
                    }}
                    min={field.type === "number" ? numberMin : undefined}
                    max={field.type === "number" ? numberMax : undefined}
                  />
                  {field.hint ? <p className="text-xs text-muted-foreground">{field.hint}</p> : null}
                </div>
              );
            })}

          </form>

          <DialogFooter className="mx-0 mb-0 flex shrink-0 flex-row justify-end gap-2 rounded-b-xl border-t bg-muted/40 px-4 py-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="min-w-[5.5rem]" onClick={() => setDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button
              type="submit"
              form={CRUD_FORM_ID}
              disabled={saving}
              aria-disabled={!canSubmit || saving}
              className={cn("min-w-[5.5rem]", !canSubmit && !saving && "opacity-50")}
            >
              {saving ? (
                "Menyimpan…"
              ) : editingId ? (
                "Simpan"
              ) : (
                <>
                  <Plus className="size-4 shrink-0" aria-hidden />
                  Tambah
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
