"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./data-table";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  render?: (value: any, row: any) => React.ReactNode;
}

interface CRUDPageProps {
  title: string;
  description?: string;
  fields: Field[];
  fetchData: () => Promise<any[]>;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  getInitialData?: () => any;
}

export function CRUDPage({ title, description, fields, fetchData, onCreate, onUpdate, onDelete, getInitialData }: CRUDPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchData();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setData([]);
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(getInitialData?.() ?? {});
    setDialogOpen(true);
  };

  const formFromRow = (row: Record<string, unknown>) => {
    const next: Record<string, unknown> = {};
    for (const field of fields) {
      if (row[field.key] !== undefined && row[field.key] !== null) {
        next[field.key] = row[field.key];
      }
    }
    return next;
  };

  const payloadFromForm = () => {
    const next = formFromRow(form);
    for (const field of fields) {
      if (field.type === "number" && next[field.key] !== undefined) {
        next[field.key] = Number(next[field.key]);
      }
    }
    return next;
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    setForm(formFromRow(row));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = payloadFromForm();
      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const handleDelete = async (row: any) => {
    if (confirm(`Hapus data ini?`)) {
      await onDelete(row.id);
      load();
    }
  };

  const columns = fields.map((f) => ({
    key: f.key,
    label: f.label,
    render: f.render,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={openAdd}>Tambah</Button>
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
              Pastikan backend jalan ({process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}).
            </p>
            <Button type="button" variant="outline" size="sm" onClick={load}>
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Tambah"} {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map((field) => {
              if (field.type === "select") {
                const value = String(form[field.key] ?? "");
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Select
                      value={value || null}
                      onValueChange={(next) => setForm({ ...form, [field.key]: next ?? "" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Pilih ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }
              return (
                <div key={field.key}>
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                </div>
              );
            })}
            <Button onClick={handleSave} className="w-full">
              {editingId ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
