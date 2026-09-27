import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  Check,
  ChevronDown,
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
import { LandingHero } from "@/components/landing/hero";
import SimpleMarquee from "@/components/fancy/blocks/simple-marquee";
import Typewriter from "@/components/fancy/text/typewriter";

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

const SOLUSI_AI: { icon: LucideIcon; tag: string; judul: string; isi: string; bukti: string }[] = [
  {
    icon: ShieldCheck,
    tag: "Rule engine",
    judul: "Deteksi yang pasti",
    isi: "Bentrok guru, ruangan, kelas, kelebihan jam, dan hari libur diperiksa tuntas.",
    bukti: "Tanpa false negative",
  },
  {
    icon: ListChecks,
    tag: "CSP + heuristik",
    judul: "Resolusi berperingkat",
    isi: "Setiap konflik mendapat hingga 3 alternatif solusi beserta skor keyakinan.",
    bukti: "Alternatif ≤ 15 detik",
  },
  {
    icon: MessagesSquare,
    tag: "LLM",
    judul: "Penjelasan transparan",
    isi: "Setiap solusi disertai alasan berbahasa Indonesia yang bisa diverifikasi satu per satu.",
    bukti: "Minimal 3 alasan per solusi",
  },
  {
    icon: Search,
    tag: "LLM + function calling",
    judul: "Tanya jadwal",
    isi: "Cari info jadwal dengan bahasa sehari-hari, misalnya “guru siapa yang bentrok hari Senin?”.",
    bukti: "Jawaban ≤ 5 detik",
  },
];

const ALUR: { judul: string; isi: string }[] = [
  { judul: "Data master", isi: "Guru, mapel, jurusan, kelas, ruangan, jam disiapkan." },
  { judul: "Draft jurusan", isi: "Admin jurusan menyusun slot mapel per kelas." },
  { judul: "Plotting guru", isi: "Koordinator menempatkan guru ke tiap slot." },
  { judul: "Prediksi AI", isi: "Bentrok terdeteksi real-time saat plotting." },
  { judul: "Resolusi", isi: "Pilih solusi AI atau perbaiki manual." },
  { judul: "Publikasi", isi: "Terbit ke guru dan siswa bila sudah bersih." },
];

const PERAN: { icon: LucideIcon; judul: string; lingkup: string; isi: string }[] = [
  { icon: UserCog, judul: "Super Admin", lingkup: "Seluruh sekolah", isi: "Mengelola data master, akun, dan konfigurasi." },
  { icon: Database, judul: "Admin Jurusan", lingkup: "1 jurusan", isi: "Menyusun draft dan mempublikasikan jadwal jurusannya." },
  { icon: PenLine, judul: "Koordinator Mapel", lingkup: "1 mapel", isi: "Plotting guru dan menyelesaikan konflik mapelnya." },
  { icon: Users, judul: "Guru", lingkup: "Jadwal sendiri", isi: "Melihat jadwal mengajar dan mengatur preferensi." },
  { icon: GraduationCap, judul: "Siswa", lingkup: "Kelas sendiri", isi: "Melihat jadwal pelajaran kelasnya sendiri." },
];

const FAQ: { tanya: string; jawab: string }[] = [
  {
    tanya: "Apakah jadwal bisa terbit saat masih ada konflik?",
    jawab:
      "Tidak. Publikasi terkunci sampai semua konflik terselesaikan — jadwal yang terbit selalu bersih.",
  },
  {
    tanya: "Siapa yang memutuskan solusi dari AI?",
    jawab:
      "Kurikulum. AI hanya memberi alternatif berperingkat beserta alasannya; penerapan selalu butuh persetujuan manusia.",
  },
  {
    tanya: "Konflik apa saja yang terdeteksi otomatis?",
    jawab:
      "Guru mengajar dua kelas bersamaan, ruangan dipakai dua kelas, dua mapel dalam satu kelas, guru melebihi batas jam, dan guru dijadwalkan di hari liburnya.",
  },
  {
    tanya: "Bagaimana jika solusi AI menimbulkan konflik baru?",
    jawab:
      "Setiap solusi yang diterapkan langsung diperiksa ulang. Konflik baru — jika ada — muncul seketika untuk diselesaikan.",
  },
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold tracking-wide text-primary/80">{children}</p>;
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
      <div className="overflow-x-auto rounded-[var(--radius-link)] border border-border">
        <table className="w-full min-w-[540px] border-collapse text-xs">
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
        Ilustrasi tampilan grid jadwal.
      </figcaption>
    </figure>
  );
}

function KartuResolusi() {
  const solusi = [
    {
      label: "Solusi A",
      keyakinan: 97,
      judul: "Pindahkan Ahmad di XII TKJ 2 ke Senin JP 5–6",
      alasan: ["Guru tersedia di slot tersebut", "Tidak menimbulkan konflik baru", "Ruangan tersedia"],
      utama: true,
    },
    {
      label: "Solusi B",
      keyakinan: 91,
      judul: "Ganti dengan Guru Budi di slot yang sama",
      alasan: ["Kompetensi sesuai", "Budi sudah 4 jam hari itu"],
      utama: false,
    },
  ];
  return (
    <figure className="rounded-[var(--radius-card)] border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">
        Bentrok: Guru Ahmad di XI RPL 1 & XII TKJ 2 — Senin, JP 3–4
      </p>
      <div className="mt-3 space-y-3">
        {solusi.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-[var(--radius-card)] border p-3",
              s.utama ? "border-primary/40 bg-ai-muted" : "border-border"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{s.label}</p>
              <p className="text-xs font-semibold tabular-nums text-primary">{s.keyakinan}%</p>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`Keyakinan ${s.keyakinan} persen`}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${s.keyakinan}%` }} />
            </div>
            <p className="mt-2 text-xs font-medium leading-relaxed">{s.judul}</p>
            <ul className="mt-1.5 space-y-1">
              {s.alasan.map((a) => (
                <li key={a} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Contoh keluaran AI Resolve.
      </figcaption>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="h-full scroll-smooth overflow-y-auto bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold tracking-tight">GIS</span>
              <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                Grafika Intelligent Scheduling
              </span>
            </span>
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 text-sm font-medium text-muted-foreground lg:flex">
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
            <a href="#faq" className="rounded-full px-3 py-1.5 hover:bg-muted/50 hover:text-foreground">
              FAQ
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

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <LandingHero>
          <IlustrasiGrid />
          <KartuResolusi />
        </LandingHero>

        <div className="overflow-hidden border-y border-border py-4" aria-hidden="true">
          <SimpleMarquee baseVelocity={4} repeat={4} slowdownOnHover direction="left">
            {[
              "Deteksi bentrok guru",
              "Plotting guru",
              "Resolusi berperingkat",
              "Penjelasan transparan",
              "Tanya jadwal",
              "Publikasi terkunci",
            ].map((t) => (
              <span
                key={t}
                className="mx-4 flex items-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground"
              >
                <Sparkles className="size-4 shrink-0 text-primary" />
                {t}
              </span>
            ))}
          </SimpleMarquee>
        </div>

        <section id="masalah" className="scroll-mt-20 py-14">
          <div className="max-w-2xl">
            <Eyebrow>Masalah</Eyebrow>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Sinkronisasi manual memakan waktu berhari-hari
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Alur hari ini: tiap jurusan membuat draft, kurikulum memplot guru, lalu sinkronisasi —
              dan bentrok baru ketahuan di akhir.
            </p>
          </div>
          <ol className="mt-8 divide-y divide-border border-y border-border">
            {MASALAH.map((m, i) => (
              <li key={m.judul} className="flex items-start gap-4 py-6 sm:gap-5">
                <span
                  aria-hidden
                  className="w-10 shrink-0 text-4xl font-semibold tabular-nums tracking-tight text-primary/15 sm:w-12 sm:text-5xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-destructive/10 sm:size-11">
                  <m.icon className="size-5 text-destructive" />
                </span>
                <span className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight">{m.judul}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{m.isi}</p>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="solusi" className="scroll-mt-20 py-14">
          <div className="max-w-2xl">
            <Eyebrow>Solusi AI</Eyebrow>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              AI sebagai pendukung keputusan, bukan pengganti
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Deteksi yang pasti memakai rule engine. AI memberi alternatif berperingkat, penjelasan,
              dan pencarian jadwal berbahasa alami.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SOLUSI_AI.map((s) => (
              <div
                key={s.judul}
                className="flex flex-col rounded-[var(--radius-card)] border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex size-11 items-center justify-center rounded-[var(--radius-card)] bg-ai-muted">
                    <s.icon className="size-5 text-primary" />
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                    {s.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{s.judul}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{s.isi}</p>
                <p className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-primary">
                  <Check className="size-3.5" />
                  {s.bukti}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-[var(--radius-card)] border border-border bg-card p-4 sm:p-5">
            <p className="text-xs font-semibold tracking-wide text-primary/80">Coba tanya</p>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-border px-4 py-2.5">
              <Search className="size-4 shrink-0 text-primary" />
              <Typewriter
                text={[
                  "Guru siapa yang bentrok hari Senin?",
                  "Cari slot kosong Pak Ahmad",
                  "Mengapa XI RPL 1 belum dipublikasikan?",
                ]}
                speed={55}
                waitTime={2200}
                className="min-w-0 flex-1 truncate text-sm"
                cursorClassName="ml-0.5 text-primary"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Dijawab dari data jadwal aktual — ilustrasi.
            </p>
          </div>
        </section>

        <section id="alur" className="scroll-mt-20 py-14">
          <div className="flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Alur kerja</Eyebrow>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Dari data master sampai publikasi
            </h2>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">Geser untuk melihat semua tahap →</p>
          </div>
          <ol className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:gap-0 lg:overflow-visible lg:rounded-[var(--radius-card)] lg:border lg:border-border lg:bg-card lg:pb-0 lg:divide-x lg:divide-border">
            {ALUR.map((a, i) => (
              <li key={a.judul} className="min-w-[220px] snap-start rounded-[var(--radius-card)] border border-border bg-card p-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-5">
                <p className="font-mono text-xs font-semibold tabular-nums text-primary">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-sm font-semibold tracking-tight">{a.judul}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.isi}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="peran" className="scroll-mt-20 py-14">
          <div className="max-w-2xl">
            <Eyebrow>Peran</Eyebrow>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Setiap peran punya ruang kerjanya sendiri
            </h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PERAN.map((p) => (
              <div
                key={p.judul}
                className="rounded-[var(--radius-card)] border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex size-11 items-center justify-center rounded-full bg-ai-muted">
                    <p.icon className="size-5 text-primary" />
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {p.lingkup}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{p.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.isi}</p>
              </div>
            ))}
            <div className="rounded-[var(--radius-card)] border border-primary/15 bg-ai-muted p-5">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary">
                <CalendarCheck className="size-5 text-primary-foreground" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">Publikasi terkunci sampai bersih</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Jadwal hanya bisa dipublikasikan jika tidak ada konflik yang tersisa.
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 py-14">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Tanya jawab</Eyebrow>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Yang sering ditanyakan
            </h2>
            <div className="mt-8 divide-y divide-border rounded-[var(--radius-card)] border border-border bg-card px-5">
              {FAQ.map((f) => (
                <details key={f.tanya} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    {f.tanya}
                    <ChevronDown className="size-4 shrink-0 text-primary transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{f.jawab}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="py-14">
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
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:px-6">
          <div>
            <p className="flex items-center gap-2">
              <Logo className="size-6" />
              <span className="font-bold tracking-tight">GIS</span>
            </p>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Grafika Intelligent Scheduling — platform manajemen jadwal SMK. Pilot project SMKN 4
              Malang.
            </p>
          </div>
          <nav aria-label="Produk">
            <p className="text-xs font-semibold">Produk</p>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li><a href="#solusi" className="hover:text-foreground">Solusi AI</a></li>
              <li><a href="#alur" className="hover:text-foreground">Alur kerja</a></li>
              <li><a href="#peran" className="hover:text-foreground">Peran</a></li>
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </nav>
          <nav aria-label="Akses">
            <p className="text-xs font-semibold">Akses</p>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Masuk</Link></li>
              <li><Link href="/beranda" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/ai/tanya" className="hover:text-foreground">Bantuan AI</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© 2026 Grafika Intelligent Scheduling</p>
            <p>Dibangun untuk JHIC 2026 — Web Development</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
