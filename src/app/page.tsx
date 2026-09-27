import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Database,
  GraduationCap,
  Hourglass,
  ListChecks,
  LogIn,
  Megaphone,
  MessagesSquare,
  PenLine,
  Repeat2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "GIS — Grafika Intelligent Scheduling",
  description:
    "Platform penyusunan, sinkronisasi, dan publikasi jadwal pelajaran SMK. Deteksi bentrok guru dan ruangan sebelum jadwal terbit.",
};

const MASALAH: { icon: LucideIcon; judul: string; isi: string }[] = [
  {
    icon: TriangleAlert,
    judul: "Bentrok ketahuan terlambat",
    isi: "Tidak ada cara mendeteksi potensi bentrok sebelum sinkronisasi. Konflik baru muncul setelah semua jurusan selesai.",
  },
  {
    icon: Hourglass,
    judul: "Revisi manual berhari-hari",
    isi: "Penyelesaian konflik dikerjakan satu per satu secara manual oleh kurikulum.",
  },
  {
    icon: Repeat2,
    judul: "Revisi yang berulang",
    isi: "Mengubah satu slot bisa memunculkan konflik baru di guru, kelas, atau ruangan lain.",
  },
  {
    icon: ShieldAlert,
    judul: "Rawan human error",
    isi: "Jadwal yang dipublikasikan masih bisa menyimpan konflik yang lolos dari pemeriksaan.",
  },
];

const SOLUSI_AI: { icon: LucideIcon; judul: string; isi: string }[] = [
  {
    icon: ShieldCheck,
    judul: "Deteksi rule-based",
    isi: "Bentrok guru, ruangan, kelas, kelebihan jam, dan hari libur diperiksa pasti — tanpa false negative.",
  },
  {
    icon: ListChecks,
    judul: "Resolusi berperingkat",
    isi: "Setiap konflik mendapat hingga 3 alternatif solusi beserta skor keyakinan. Kurikulum yang memutuskan.",
  },
  {
    icon: MessagesSquare,
    judul: "Penjelasan berbahasa Indonesia",
    isi: "Setiap solusi disertai alasan yang bisa diverifikasi: ketersediaan guru, beban jam, dan ruangan.",
  },
  {
    icon: Search,
    judul: "Tanya jadwal",
    isi: "Cari info jadwal dengan bahasa sehari-hari, misalnya “guru siapa yang bentrok hari Senin?”.",
  },
];

const ALUR: { judul: string; isi: string }[] = [
  { judul: "Data master", isi: "Guru, mapel, jurusan, kelas, ruangan, dan jam pelajaran disiapkan." },
  { judul: "Draft jurusan", isi: "Admin jurusan menyusun slot mata pelajaran per kelas." },
  { judul: "Plotting guru", isi: "Koordinator mapel menempatkan guru ke tiap slot." },
  { judul: "Prediksi AI", isi: "Potensi bentrok terdeteksi real-time saat plotting." },
  { judul: "Resolusi", isi: "Pilih solusi AI berperingkat atau perbaiki manual." },
  { judul: "Publikasi", isi: "Jadwal terbit ke guru dan siswa setelah bersih konflik." },
];

const PERAN: { icon: LucideIcon; judul: string; isi: string }[] = [
  { icon: UserCog, judul: "Super Admin", isi: "Mengelola data master, akun, dan konfigurasi sekolah." },
  { icon: Database, judul: "Admin Jurusan", isi: "Menyusun draft dan mempublikasikan jadwal jurusannya." },
  { icon: PenLine, judul: "Koordinator Mapel", isi: "Plotting guru dan menyelesaikan konflik mapelnya." },
  { icon: Users, judul: "Guru", isi: "Melihat jadwal mengajar dan mengatur preferensi." },
  { icon: GraduationCap, judul: "Siswa", isi: "Melihat jadwal pelajaran kelasnya sendiri." },
];

function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/Icons/GIS%20-%20Icon%20Light.svg"
      alt="Logo GIS"
      className={cn("size-8", className)}
    />
  );
}

function LencanaAI({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
      <Sparkles className="size-3" />
      {children}
    </span>
  );
}

function IlustrasiGrid() {
  const hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const baris: { jam: string; sel: ({ mapel: string; bentrok?: boolean } | null)[] }[] = [
    {
      jam: "1",
      sel: [{ mapel: "MTK" }, { mapel: "B. Indo" }, { mapel: "PPL" }, null, { mapel: "PKK" }],
    },
    {
      jam: "2",
      sel: [{ mapel: "PPL" }, { mapel: "MTK", bentrok: true }, { mapel: "B. Inggris" }, { mapel: "PPL" }, null],
    },
    {
      jam: "3",
      sel: [null, { mapel: "PPL" }, { mapel: "MTK" }, { mapel: "PKK" }, { mapel: "B. Indo" }],
    },
  ];
  return (
    <figure className="rounded-[var(--radius-card)] border border-border bg-card p-4">
      <div className="overflow-hidden rounded-[var(--radius-link)] border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-muted/60">
              <th className="w-10 border-b border-r border-border px-2 py-1.5 text-left font-medium text-muted-foreground">
                Jam
              </th>
              {hari.map((h) => (
                <th
                  key={h}
                  className="border-b border-r border-border px-2 py-1.5 text-left font-medium text-muted-foreground last:border-r-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {baris.map((b) => (
              <tr key={b.jam}>
                <td className="border-r border-border px-2 py-2 font-medium tabular-nums text-muted-foreground">
                  {b.jam}
                </td>
                {b.sel.map((s, i) =>
                  s === null ? (
                    <td key={i} className="border-r border-border px-1 py-1 last:border-r-0">
                      <span className="block rounded-[var(--radius-link)] border border-dashed border-border px-2 py-2" />
                    </td>
                  ) : (
                    <td key={i} className="border-r border-border px-1 py-1 last:border-r-0">
                      <span
                        className={cn(
                          "flex items-center justify-between gap-1 rounded-[var(--radius-link)] px-2 py-2 font-medium",
                          s.bentrok ? "bg-destructive/10 text-destructive" : "bg-muted/70 text-foreground"
                        )}
                      >
                        {s.mapel}
                        {s.bentrok ? <TriangleAlert className="size-3.5 shrink-0" /> : null}
                      </span>
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <LencanaAI>AI Conflict Predictor</LencanaAI>
        Ilustrasi tampilan grid jadwal — bukan data sekolah.
      </figcaption>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold tracking-tight">GIS</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Grafika Intelligent Scheduling
              </span>
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#masalah" className="rounded-full px-3 py-1.5 hover:bg-muted/50 hover:text-foreground">
              Masalah
            </a>
            <a href="#solusi" className="rounded-full px-3 py-1.5 hover:bg-muted/50 hover:text-foreground">
              Solusi AI
            </a>
            <a href="#alur" className="rounded-full px-3 py-1.5 hover:bg-muted/50 hover:text-foreground">
              Alur
            </a>
            <a href="#peran" className="rounded-full px-3 py-1.5 hover:bg-muted/50 hover:text-foreground">
              Peran
            </a>
          </nav>
          <div className="ml-auto">
            <Link href="/login" className={buttonVariants()}>
              <LogIn className="mr-1.5 size-4" />
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-24 px-6 py-14">
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <LencanaAI>AI Conflict Predictor</LencanaAI>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Sinkronisasi jadwal antar jurusan, tanpa bentrok.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              GIS membantu kurikulum menyusun, memplot guru, dan mempublikasikan jadwal pelajaran.
              Potensi bentrok terdeteksi sejak plotting — lengkap dengan alternatif solusi yang bisa
              dijelaskan.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/login" className={buttonVariants({ size: "lg" })}>
                Masuk ke dashboard
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
              <a href="#alur" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Lihat alur kerja
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Pilot project SMKN 4 Malang • Berbahasa Indonesia
            </p>
          </div>
          <IlustrasiGrid />
        </section>

        <section id="masalah" className="scroll-mt-20 space-y-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary/80">Masalah</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Sinkronisasi manual memakan waktu berhari-hari
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Alur hari ini: tiap jurusan membuat draft, kurikulum memplot guru, lalu sinkronisasi —
              dan bentrok baru ketahuan di akhir.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {MASALAH.map((m) => (
              <div key={m.judul} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                <m.icon className="size-5 text-destructive" />
                <h3 className="mt-2 text-sm font-semibold">{m.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.isi}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="solusi" className="scroll-mt-20 space-y-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary/80">Solusi AI</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              AI sebagai pendukung keputusan, bukan pengganti
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Deteksi yang pasti memakai rule engine. AI memberi alternatif berperingkat, penjelasan,
              dan pencarian jadwal berbahasa alami.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOLUSI_AI.map((s) => (
              <div key={s.judul} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                <s.icon className="size-5 text-primary" />
                <h3 className="mt-2 text-sm font-semibold">{s.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.isi}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="alur" className="scroll-mt-20 space-y-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary/80">Alur kerja</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Dari data master sampai publikasi
            </h2>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALUR.map((a, i) => (
              <li key={a.judul} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-sm font-semibold tabular-nums text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-sm font-semibold">{a.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.isi}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="peran" className="scroll-mt-20 space-y-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary/80">Peran</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Setiap peran punya ruang kerjanya sendiri
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PERAN.map((p) => (
              <div key={p.judul} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                <p.icon className="size-5 text-primary" />
                <h3 className="mt-2 text-sm font-semibold">{p.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.isi}</p>
              </div>
            ))}
            <div className="rounded-[var(--radius-card)] border border-primary/15 bg-ai-muted p-4">
              <CalendarCheck className="size-5 text-primary" />
              <h3 className="mt-2 text-sm font-semibold">Publikasi terkunci sampai bersih</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Jadwal hanya bisa dipublikasikan jika tidak ada konflik yang tersisa.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-primary/15 bg-ai-muted p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Siap merapikan sinkronisasi semester ini?
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Masuk untuk mengelola data master, memplot guru, dan menyelesaikan konflik bersama AI.
              </p>
            </div>
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "shrink-0")}>
              <Megaphone className="mr-1.5 size-4" />
              Mulai dari dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Logo className="size-5" />
            <span>
              <span className="font-semibold text-foreground">GIS</span> — Grafika Intelligent
              Scheduling • SMKN 4 Malang
            </span>
          </p>
          <p>Dibangun untuk JHIC 2026 — Web Development • © 2026</p>
        </div>
      </footer>
    </div>
  );
}
