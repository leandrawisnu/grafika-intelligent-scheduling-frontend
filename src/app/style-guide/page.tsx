"use client";

import { useLayoutEffect } from "react";
import { AlertTriangle, CheckCircle2, LayoutDashboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AiBadge } from "@/components/ai-badge";
import { AiInsightBar } from "@/components/ai-insight-bar";
import { ConflictList } from "@/components/conflict-list";
import { ResolvePanel } from "@/components/resolve-panel";
import { DataTable } from "@/components/data-table";
import { INITIAL_CONFLICTS } from "@/lib/mock";
import type { ConflictListItem } from "@/lib/conflict-display";
import { cn } from "@/lib/utils";
import {
  buildTableFilters,
  TABLE_SEARCH_PLACEHOLDER,
  buildTableSortOptions,
  columnSortType,
  rowSearchText,
} from "@/lib/table-controls";

const SWATCHES = [
  { name: "Cool Sheet", token: "--background", hex: "#F7FBFE", use: "Canvas halaman" },
  { name: "Surface", token: "--card", hex: "#FCFEFF", use: "Kartu, grid, popover" },
  { name: "Sidebar", token: "--sidebar", hex: "#ECF3FA", use: "Kolom navigasi" },
  { name: "Ink", token: "--foreground", hex: "#222F3B", use: "Teks utama" },
  { name: "Muted", token: "--muted", hex: "#EAF1F8", use: "Chip idle, sekunder" },
  { name: "Muted text", token: "--muted-foreground", hex: "#535F6B", use: "Meta, placeholder" },
  { name: "Border", token: "--border", hex: "#D9E1E9", use: "Garis 1px, input" },
  { name: "Press Blue", token: "--primary", hex: "#006CBC", use: "Aksi, seleksi, AI, fokus" },
  { name: "Press wash", token: "--ai-muted", hex: "#DEF3FF", use: "Insight, solusi rank-1" },
  { name: "Danger", token: "--destructive", hex: "#CC272E", use: "Konflik kesalahan" },
  { name: "Warning", token: "--warning", hex: "#E1AD57", use: "Belum diplot, piket" },
  { name: "Success", token: "--success", hex: "#187C49", use: "Bebas konflik, terbit" },
];

const sampleConflicts: ConflictListItem[] = INITIAL_CONFLICTS.filter((c) => !c.resolved)
  .slice(0, 3)
  .map((c) => ({
    id: c.id,
    type: c.type,
    severity: c.severity,
    description: c.description,
    confidence: c.confidence,
    slotIds: c.slotIds,
  }));
const sampleResolve = INITIAL_CONFLICTS[0];

const sampleTableRows = [
  { id: 1, nama: "XII RPL 1", kode: "RPL-12-1", jurusan: "RPL", siswa: 32, jam: 38 },
  { id: 2, nama: "XII RPL 2", kode: "RPL-12-2", jurusan: "RPL", siswa: 30, jam: 36 },
  { id: 3, nama: "XI TKJ A", kode: "TKJ-11-A", jurusan: "TKJ", siswa: 28, jam: 40 },
];

const sampleTableFields = [
  { key: "nama", label: "Nama kelas" },
  { key: "kode", label: "Kode" },
  {
    key: "jurusan",
    label: "Jurusan",
    type: "select" as const,
    options: [
      { value: "RPL", label: "RPL" },
      { value: "TKJ", label: "TKJ" },
    ],
  },
  { key: "siswa", label: "Siswa", type: "number" as const },
  { key: "jam", label: "Jam/minggu", type: "number" as const },
];

const sampleTableColumns = sampleTableFields.map((f) => ({
  key: f.key,
  label: f.label,
  sortType: columnSortType(f),
  align: f.type === "number" ? ("right" as const) : undefined,
  render:
    f.key === "kode"
      ? (value: unknown) => (
          <span className="font-semibold text-primary tabular-nums">{String(value ?? "—")}</span>
        )
      : undefined,
}));

function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-auto-layout="true" data-component={`GIS/Section/${title}`} className="space-y-5">
      <div>
        {kicker ? (
          <p className="mb-1 text-[11px] font-medium tracking-wider text-ai uppercase">{kicker}</p>
        ) : null}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SlotSample({
  name,
  mapel,
  guru,
  ruang,
  className,
}: {
  name: string;
  mapel: string;
  guru: string;
  ruang: string;
  className: string;
}) {
  return (
    <div data-component={`GIS/Slot/${name}`} data-auto-layout="true" className={cn("min-h-[4.5rem] w-44 rounded-lg px-2 py-1.5 text-left", className)}>
      <p className="text-xs font-medium leading-snug">{mapel}</p>
      <p className="text-[11px] text-foreground/70">{guru}</p>
      <p className="text-[11px] text-muted-foreground">{ruang}</p>
    </div>
  );
}

export default function StyleGuidePage() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
    };
    html.style.overflow = "auto";
    html.style.height = "auto";
    body.style.overflow = "auto";
    body.style.height = "auto";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
    };
  }, []);

  return (
    <main
      data-component="GIS/Style Guide"
      data-auto-layout="true"
      className="mx-auto min-h-svh max-w-[1200px] space-y-16 bg-background px-10 py-16"
    >
      <header data-auto-layout="true" data-component="GIS/Lockup" className="flex items-end justify-between gap-8">
        <div className="flex items-center gap-3">
          <img src="/Icons/GIS%20-%20Icon%20Light.svg" alt="" className="size-10" />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">GIS</p>
            <p className="text-xs text-muted-foreground">Grafika Intelligent Scheduling</p>
          </div>
        </div>
        <div className="max-w-xl text-right">
          <h1 className="gis-page-title">The Sync Board</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Press Blue tetap. Struktur OpenAI: pill, 6px card, hairline border, tanpa shadow.
          </p>
        </div>
      </header>

      <Section title="Warna" kicker="Hue 247">
        <div className="grid grid-cols-4 gap-3">
          {SWATCHES.map((item) => {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="64"><rect width="400" height="64" fill="${item.hex}"/></svg>`;
            return (
              <div
                key={item.token}
                data-component="GIS/Swatch"
                className="overflow-hidden rounded-[var(--radius-card)]"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9E1E9" }}
              >
                <img
                  alt=""
                  width={400}
                  height={64}
                  className="block h-16 w-full"
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
                />
                <div className="space-y-0.5 px-3 py-2.5">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{item.hex}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{item.token}</p>
                  <p className="text-xs text-muted-foreground">{item.use}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Huruf" kicker="Geist">
        <div data-component="GIS/Type" data-auto-layout="true" className="space-y-4 rounded-[var(--radius-card)] border border-border bg-card px-5 py-6">
          <div>
            <p className="text-sm text-muted-foreground">Page title · 28px · Medium · tracking-tight</p>
            <p className="gis-page-title">Sinkronisasi Ganjil 2026/2027</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Title · 18px · Semibold</p>
            <p className="text-lg font-semibold">AI Conflict Predictor</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Label · 14px · Medium</p>
            <p className="text-sm font-medium">Ahmad Fauzi · Senin jam ke-3</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Body · 14px · Regular · 65ch</p>
            <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
              Tiga jurusan sudah mengumpulkan draf. Tugas kurikulum: plotting guru, minta AI memprediksi konflik, pilih
              penyelesaian, lalu publikasi.
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Mono · tabular-nums</p>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">ke-3 · 08:30–09:15 · 97%</p>
          </div>
        </div>
      </Section>

      <Section title="Tombol" kicker="Primary jarang">
        <div className="flex flex-wrap items-center gap-2">
          <Button data-component="GIS/Button/Primary">
            <Sparkles className="size-4" />
            Jalankan Prediksi AI
          </Button>
          <Button variant="outline" data-component="GIS/Button/Outline">
            Buka grid
          </Button>
          <Button variant="secondary" data-component="GIS/Button/Secondary">
            Plotting guru
          </Button>
          <Button variant="ghost" data-component="GIS/Button/Ghost">
            Reset demo
          </Button>
          <Button variant="destructive" data-component="GIS/Button/Destructive">
            Hapus
          </Button>
          <Button disabled data-component="GIS/Button/Disabled">
            Publikasi
          </Button>
        </div>
      </Section>

      <Section title="Chip dan badge">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-component="GIS/Chip/Selected"
            className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
          >
            Kurikulum
          </button>
          <button
            type="button"
            data-component="GIS/Chip/Idle"
            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            Guru
          </button>
          <AiBadge />
          <AiBadge>AI Resolve</AiBadge>
          <Badge>Dipublikasikan</Badge>
          <Badge variant="secondary">Draf</Badge>
          <Badge variant="destructive">Ada konflik</Badge>
          <span
            data-component="GIS/Badge/Success"
            className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
          >
            Bebas konflik
          </span>
        </div>
      </Section>

      <Section title="Input dan nav">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium">Input</p>
            <Input data-component="GIS/Input" placeholder="Cari guru atau kelas" className="max-w-sm" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium">Nav item</p>
            <div className="w-56 space-y-1 rounded-[var(--radius-card)] border border-border bg-sidebar p-2">
              <div
                data-component="GIS/Nav/Active"
                className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-2 text-sm font-medium text-primary"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </div>
              <div
                data-component="GIS/Nav/Idle"
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50"
              >
                <LayoutDashboard className="size-4" />
                Jadwal
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Insight AI" kicker="Press wash">
        <AiInsightBar
          title="4 potensi konflik menunggu keputusan kurikulum"
          detail="Biru mencuci hasil mesin. Merah dan kuning tetap untuk keparahan, bukan untuk AI."
          meta="Prediksi terakhir pada sesi demo ini"
        >
          <Button size="sm" data-component="GIS/Button/Primary">
            Tinjau konflik
          </Button>
        </AiInsightBar>
      </Section>

      <Section title="Kartu konflik">
        <div className="max-w-sm">
          <ConflictList items={sampleConflicts} selectedId={sampleConflicts[0]?.id} />
        </div>
      </Section>

      <Section title="Sel jadwal">
        <div className="flex flex-wrap gap-3">
          <div
            data-component="GIS/Slot/Empty"
            className="min-h-[4.5rem] w-44 rounded-lg border border-dashed border-border bg-background/50"
          />
          <SlotSample
            name="Rest"
            mapel="Desain Grafis"
            guru="Ahmad Fauzi"
            ruang="Lab Komputer 1"
            className="bg-secondary/80"
          />
          <SlotSample
            name="Unplotted"
            mapel="Animasi 2D"
            guru="Belum diplot"
            ruang="Lab Multimedia"
            className="bg-warning/10 ring-1 ring-warning/30"
          />
          <div
            data-component="GIS/Slot/Error"
            data-auto-layout="true"
            className="min-h-[4.5rem] w-44 rounded-lg bg-destructive/8 px-2 py-1.5 ring-1 ring-destructive/25"
          >
            <div className="flex items-start justify-between gap-1">
              <p className="text-xs font-medium leading-snug">Desain Grafis</p>
              <span className="flex items-center gap-0.5">
                <AlertTriangle className="size-3.5 text-destructive" />
                <AiBadge className="h-4 px-1 text-[9px]" />
              </span>
            </div>
            <p className="text-[11px] text-foreground/70">Ahmad Fauzi</p>
            <p className="text-[11px] text-muted-foreground">Lab Komputer 1</p>
          </div>
        </div>
      </Section>

      <Section title="Kartu resolve" kicker="Rank 1 = Press wash">
        <ResolvePanel conflict={sampleResolve} />
      </Section>

      <Section title="Status kosong">
        <div
          data-component="GIS/Empty"
          data-auto-layout="true"
          className="flex max-w-sm flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-8 text-center text-sm text-muted-foreground"
        >
          <CheckCircle2 className="size-8 text-foreground/50" />
          <p>Tidak ada konflik terbuka.</p>
        </div>
      </Section>

      <Section title="Tabel data" kicker="Panel + toolbar">
        <DataTable
          sortOptions={buildTableSortOptions(sampleTableFields)}
          filters={buildTableFilters(sampleTableFields)}
          searchPlaceholder={TABLE_SEARCH_PLACEHOLDER}
          getSearchText={(row) => rowSearchText(row, sampleTableFields)}
          columns={sampleTableColumns}
          data={sampleTableRows}
          onEdit={() => undefined}
          onDelete={() => undefined}
        />
      </Section>

      <Section title="OpenAI hybrid" kicker="Struktur">
        <ul className="max-w-[65ch] list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
          <li>Interaktif: pill (button, input, select, badge, nav).</li>
          <li>Kartu & panel: 6px radius, <code className="font-mono text-xs">border-border</code>, tanpa shadow.</li>
          <li>Grid & tabel CRUD: tetap compact (<code className="font-mono text-xs">text-sm</code>, padding ketat).</li>
          <li>Warna: Press Blue hue 247 — tidak diganti hitam OpenAI.</li>
        </ul>
      </Section>

      <Section title="Aturan">
        <ul className="max-w-[65ch] list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
          <li>Canvas putih-abu, sidebar sedikit lebih abu, kartu hampir putih.</li>
          <li>Biru = primary, fokus, seleksi, badge AI. Satu hue (247), bukan ungu terpisah.</li>
          <li>Konflik kesalahan merah, peringatan kuning — jangan pakai biru untuk keparahan.</li>
          <li>Kedalaman: border hairline, bukan drop shadow.</li>
          <li>Satu keluarga huruf: Geist. Data memakai angka tabular.</li>
        </ul>
      </Section>
    </main>
  );
}
