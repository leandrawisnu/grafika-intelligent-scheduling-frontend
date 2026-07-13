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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const load = async () => {
    setLoading(true);
    const result = await fetchData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(getInitialData?.() ?? {});
    setDialogOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    setForm({ ...row });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onCreate(form);
    }
    setDialogOpen(false);
    load();
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

      <DataTable
        columns={columns}
        data={data}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Tambah"} {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map((field) => {
              if (field.type === "select") {
                return (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    >
                      <option value="">Pilih {field.label}</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
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
