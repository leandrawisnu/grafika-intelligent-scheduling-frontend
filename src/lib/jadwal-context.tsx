"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { konflikToListItem, normalisasiKonflik, type ConflictListItem } from "@/lib/conflict-display";
import { jadwalSemesterLabel } from "@/lib/jadwal-labels";
import { jadwalKonflikHref, ruteAplikasi } from "@/lib/navigation";
import type { JadwalKelas, JadwalSemester, Konflik, KonflikPerTipe, SlotJadwal } from "@/lib/types";
import type { WorkflowStep } from "@/lib/prototype-types";

const STORAGE_KEY = "gis.activeJadwalSemesterId";

function ruteButuhDetailJadwal(pathname: string) {
  return (
    pathname === "/beranda" ||
    pathname.startsWith("/jadwal") ||
    pathname.startsWith("/guru") ||
    pathname.startsWith("/siswa")
  );
}

function ruteButuhKonflik(pathname: string) {
  return pathname.includes("/konflik");
}

const RINGKASAN_KONFLIK_KOSONG = {
  terbuka: 0,
  kesalahan: 0,
  peringatan: 0,
  perTipe: [] as KonflikPerTipe[],
};

function slotsOfJk(jk: JadwalKelas): SlotJadwal[] {
  return jk.slot_jadwal ?? (jk as JadwalKelas & { SlotJadwal?: SlotJadwal[] }).SlotJadwal ?? [];
}

function flattenSlots(jadwalKelas: JadwalKelas[]): SlotJadwal[] {
  const out: SlotJadwal[] = [];
  for (const jk of jadwalKelas) {
    for (const s of slotsOfJk(jk)) out.push(s);
  }
  return out;
}

function pickJadwalId(list: JadwalSemester[], stored: string | null): string | null {
  if (list.length === 0) return null;
  if (stored && list.some((j) => j.id === stored && j.punya_kelas_aktif)) {
    return stored;
  }
  const denganKelas = list.find((j) => j.punya_kelas_aktif);
  if (denganKelas) return denganKelas.id;
  if (stored && list.some((j) => j.id === stored)) return stored;
  return list[0]?.id ?? null;
}

type JadwalStore = {
  loading: boolean;
  error: string | null;
  jadwalList: JadwalSemester[];
  activeJadwalId: string | null;
  jadwal: JadwalSemester | null;
  semesterLabel: string;
  slots: SlotJadwal[];
  jadwalKelasAktif: JadwalKelas[];
  konflik: Konflik[];
  konflikDimuat: boolean;
  jumlahKonflikTerbuka: number;
  konflikPerTipe: KonflikPerTipe[];
  conflictItems: ConflictListItem[];
  validated: boolean;
  mlPredicted: boolean;
  validating: boolean;
  predicting: boolean;
  gridKelasId: string;
  selectedConflictId: string | null;
  openKonflik: Konflik[];
  unplotted: SlotJadwal[];
  jumlahBelumDiplot: number;
  errorCount: number;
  warningCount: number;
  steps: WorkflowStep[];
  setActiveJadwalId: (id: string) => void;
  setGridKelasId: (id: string) => void;
  setSelectedConflictId: (id: string | null) => void;
  refreshList: () => Promise<JadwalSemester[]>;
  loadJadwal: (id: string, opsi?: { paksa?: boolean }) => Promise<void>;
  loadKonflikFor: (id: string) => Promise<void>;
  loadSlotsFor: (id: string) => Promise<void>;
  createJadwal: (semesterId: string) => Promise<JadwalSemester>;
  runValidasi: () => Promise<void>;
  runPrediksiMl: () => Promise<void>;
  assignGuru: (slotId: string, guruId: string) => Promise<void>;
  slotConflicts: (slotId: string) => Konflik[];
  teacherBusy: (guruId: string, hariId: string, jamId: string, exceptSlotId?: string) => boolean;
  teacherHoursOnDay: (guruId: string, hariId: string) => number;
};

const JadwalContext = createContext<JadwalStore | null>(null);

export function JadwalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const masukAplikasi = ruteAplikasi(pathname);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jadwalList, setJadwalList] = useState<JadwalSemester[]>([]);
  const [activeJadwalId, setActiveJadwalIdState] = useState<string | null>(null);
  const [jadwal, setJadwal] = useState<JadwalSemester | null>(null);
  const [slots, setSlots] = useState<SlotJadwal[]>([]);
  const [slotsLoadedForId, setSlotsLoadedForId] = useState<string | null>(null);
  const [jumlahTanpaGuru, setJumlahTanpaGuru] = useState(0);
  const [jadwalKelasAktif, setJadwalKelasAktif] = useState<JadwalKelas[]>([]);
  const [konflik, setKonflik] = useState<Konflik[]>([]);
  const [konflikDimuat, setKonflikDimuat] = useState(false);
  const [ringkasanKonflik, setRingkasanKonflik] = useState(RINGKASAN_KONFLIK_KOSONG);
  const [validated, setValidated] = useState(false);
  const [mlPredicted, setMlPredicted] = useState(false);
  const [validating, setValidating] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [gridKelasId, setGridKelasId] = useState("");
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const activeJadwalIdRef = useRef<string | null>(null);
  const jadwalListRef = useRef(jadwalList);
  jadwalListRef.current = jadwalList;
  const muatBerjalan = useRef(new Map<string, Promise<void>>());

  const setActiveJadwalId = useCallback((id: string) => {
    if (activeJadwalIdRef.current !== id) {
      setSlots([]);
      setSlotsLoadedForId(null);
      setJumlahTanpaGuru(0);
      setKonflik([]);
      setKonflikDimuat(false);
      setRingkasanKonflik(RINGKASAN_KONFLIK_KOSONG);
      setValidated(false);
      loadedIdRef.current = null;
      const ringkas = jadwalListRef.current.find((item) => item.id === id);
      if (ringkas) setJadwal((prev) => (prev?.id === id ? prev : ringkas));
    }
    activeJadwalIdRef.current = id;
    setActiveJadwalIdState(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const loadSlotsFor = useCallback(async (jsId: string) => {
    setError(null);
    try {
      const kelasAktif = await api.getJadwalKelasAktif(jsId);
      if (activeJadwalIdRef.current !== jsId) return;
      const list = Array.isArray(kelasAktif) ? kelasAktif : [];
      setJadwalKelasAktif(list);
      setSlots(flattenSlots(list));
      setSlotsLoadedForId(jsId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat slot jadwal");
    }
  }, []);

  const loadKonflikFor = useCallback(async (jsId: string) => {
    setError(null);
    try {
      const rows = await api.getKonflik(jsId);
      if (activeJadwalIdRef.current !== jsId) return;
      const list = Array.isArray(rows) ? rows.map((r) => normalisasiKonflik(r)) : [];
      setKonflik(list);
      setKonflikDimuat(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat konflik");
    }
  }, []);

  const loadJadwal = useCallback(
    async (id: string, opsi?: { paksa?: boolean }) => {
      if (!opsi?.paksa && loadedIdRef.current === id) return;
      if (!opsi?.paksa) {
        const berjalan = muatBerjalan.current.get(id);
        if (berjalan) return berjalan;
      }

      const tugas = (async () => {
        setLoading(true);
        setError(null);
        try {
          const [detail, kelasAktif, ringkasan] = await Promise.all([
            api.getJadwalSemesterById(id),
            api.getJadwalKelasAktif(id, { ringkas: true }),
            api.getRingkasanJadwal(id),
          ]);
          const list = Array.isArray(kelasAktif) ? kelasAktif : [];
          setJadwal(detail);
          setActiveJadwalId(id);
          setJadwalKelasAktif(list);
          setJumlahTanpaGuru(ringkasan.jumlah_tanpa_guru);
          setKonflik([]);
          setKonflikDimuat(false);
          setRingkasanKonflik({
            terbuka: ringkasan.jumlah_konflik_terbuka ?? 0,
            kesalahan: ringkasan.jumlah_kesalahan ?? 0,
            peringatan: ringkasan.jumlah_peringatan ?? 0,
            perTipe: ringkasan.konflik_per_tipe ?? [],
          });
          setValidated(detail.perlu_validasi === false || detail.bebas_konflik);
          loadedIdRef.current = id;
        } catch (e) {
          loadedIdRef.current = null;
          setError(e instanceof Error ? e.message : "Gagal memuat jadwal");
        } finally {
          setLoading(false);
        }
      })();

      muatBerjalan.current.set(id, tugas);
      try {
        await tugas;
      } finally {
        if (muatBerjalan.current.get(id) === tugas) muatBerjalan.current.delete(id);
      }
    },
    [setActiveJadwalId]
  );

  const refreshList = useCallback(async () => {
    try {
      const list = await api.getJadwalSemester();
      setJadwalList(list);
      return list;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat daftar jadwal");
      return [];
    }
  }, []);

  useEffect(() => {
    if (!masukAplikasi) return;
    let batal = false;
    void (async () => {
      setLoading(true);
      const list = await refreshList();
      if (batal) return;
      const stored =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const pick = pickJadwalId(list, stored);
      if (!pick) {
        setLoading(false);
        return;
      }
      setActiveJadwalId(pick);
      const ringkas = list.find((item) => item.id === pick) ?? null;
      setJadwal((prev) => prev ?? ringkas);
      if (ruteButuhDetailJadwal(pathnameRef.current)) {
        await loadJadwal(pick);
        return;
      }
      setLoading(false);
    })();
    return () => {
      batal = true;
    };
  }, [masukAplikasi, refreshList, setActiveJadwalId, loadJadwal]);

  useEffect(() => {
    if (!activeJadwalId || !ruteButuhDetailJadwal(pathname)) return;
    void loadJadwal(activeJadwalId);
  }, [pathname, activeJadwalId, loadJadwal]);

  useEffect(() => {
    if (!activeJadwalId || !ruteButuhKonflik(pathname) || konflikDimuat) return;
    void loadKonflikFor(activeJadwalId);
  }, [pathname, activeJadwalId, konflikDimuat, loadKonflikFor]);

  const semesterLabel = useMemo(() => jadwalSemesterLabel(jadwal), [jadwal]);

  const openKonflik = useMemo(
    () => (validated ? konflik.filter((k) => !k.terselesaikan) : []),
    [validated, konflik]
  );

  const conflictItems = useMemo(
    () => openKonflik.map(konflikToListItem),
    [openKonflik]
  );

  const unplotted = useMemo(() => slots.filter((s) => !s.guru_id), [slots]);
  const jumlahBelumDiplot =
    slotsLoadedForId === activeJadwalId ? unplotted.length : jumlahTanpaGuru;

  const jumlahKonflikTerbuka = konflikDimuat ? openKonflik.length : ringkasanKonflik.terbuka;
  const errorCount = konflikDimuat
    ? openKonflik.filter((k) => k.tingkat_keparahan === "kesalahan").length
    : ringkasanKonflik.kesalahan;
  const warningCount = konflikDimuat
    ? openKonflik.filter((k) => k.tingkat_keparahan === "peringatan").length
    : ringkasanKonflik.peringatan;
  const konflikPerTipe = konflikDimuat
    ? openKonflik.reduce<KonflikPerTipe[]>((acc, k) => {
        const row = acc.find((x) => x.tipe_konflik === k.tipe_konflik);
        if (row) row.jumlah += 1;
        else acc.push({ tipe_konflik: k.tipe_konflik, jumlah: 1 });
        return acc;
      }, []).sort((a, b) => b.jumlah - a.jumlah)
    : ringkasanKonflik.perTipe;

  const steps = useMemo<WorkflowStep[]>(() => {
    const jsId = activeJadwalId ?? "";
    const plotDone = jumlahBelumDiplot === 0;
    const resolveDone = validated && jumlahKonflikTerbuka === 0;
    const current = !plotDone ? "plot" : !validated ? "predict" : !resolveDone ? "resolve" : "";

    const status = (id: string, done: boolean): WorkflowStep["status"] => {
      if (done) return "done";
      if (id === current) return "current";
      return "todo";
    };

    const konflikHref = jadwalKonflikHref(jsId || null);

    return [
      { id: "master", label: "Data master", href: "/master", status: "done" },
      { id: "draft", label: "Draf jadwal", href: jsId ? `/jadwal/${jsId}` : "/jadwal", status: jsId ? "done" : "current" },
      { id: "plot", label: "Plotting guru", href: jsId ? `/jadwal/${jsId}?tab=plotting` : "/jadwal", status: status("plot", plotDone) },
      { id: "predict", label: "Cek konflik", href: konflikHref, status: status("predict", validated) },
      { id: "resolve", label: "Perbaiki konflik", href: konflikHref, status: status("resolve", resolveDone) },
    ];
  }, [activeJadwalId, jumlahBelumDiplot, validated, jumlahKonflikTerbuka]);

  const runValidasi = useCallback(async () => {
    if (!activeJadwalId) return;
    setValidating(true);
    setError(null);
    try {
      const result = await api.validasiJadwal(activeJadwalId);
      const rows = Array.isArray(result.konflik)
        ? result.konflik.map((r) => normalisasiKonflik(r))
        : [];
      setKonflik(rows);
      setKonflikDimuat(true);
      setRingkasanKonflik({
        terbuka: rows.length,
        kesalahan: rows.filter((k) => k.tingkat_keparahan === "kesalahan").length,
        peringatan: rows.filter((k) => k.tingkat_keparahan === "peringatan").length,
        perTipe: rows.reduce<KonflikPerTipe[]>((acc, k) => {
          const row = acc.find((x) => x.tipe_konflik === k.tipe_konflik);
          if (row) row.jumlah += 1;
          else acc.push({ tipe_konflik: k.tipe_konflik, jumlah: 1 });
          return acc;
        }, []),
      });
      setValidated(true);
      setSelectedConflictId((id) => id ?? rows.find((k) => !k.terselesaikan)?.id ?? null);
      const detail = await api.getJadwalSemesterById(activeJadwalId);
      setJadwal(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validasi gagal");
    } finally {
      setValidating(false);
    }
  }, [activeJadwalId]);

  const runPrediksiMl = useCallback(async () => {
    if (!activeJadwalId) return;
    setPredicting(true);
    try {
      await api.prediksiKonflik(activeJadwalId);
      setMlPredicted(true);
      await loadKonflikFor(activeJadwalId);
      setValidated(true);
    } catch {
      await runValidasi();
    } finally {
      setPredicting(false);
    }
  }, [activeJadwalId, loadKonflikFor, runValidasi]);

  const assignGuru = useCallback(
    async (slotId: string, guruId: string) => {
      await api.tugaskanGuru(slotId, guruId);
      if (activeJadwalId) await loadSlotsFor(activeJadwalId);
    },
    [activeJadwalId, loadSlotsFor]
  );

  const createJadwal = useCallback(
    async (semesterId: string) => {
      const created = await api.createJadwalSemester({ semester_id: semesterId });
      await refreshList();
      await loadJadwal(created.id);
      return created;
    },
    [refreshList, loadJadwal]
  );

  const slotConflicts = useCallback(
    (slotId: string) =>
      openKonflik.filter((k) => k.slot_a_id === slotId || k.slot_b_id === slotId),
    [openKonflik]
  );

  const teacherHoursOnDay = useCallback(
    (guruId: string, hariId: string) =>
      slots.filter((s) => s.guru_id === guruId && s.hari_id === hariId).length,
    [slots]
  );

  const teacherBusy = useCallback(
    (guruId: string, hariId: string, jamId: string, exceptSlotId?: string) =>
      slots.some(
        (s) =>
          s.guru_id === guruId &&
          s.hari_id === hariId &&
          s.jam_pelajaran_id === jamId &&
          s.id !== exceptSlotId
      ),
    [slots]
  );

  const value = useMemo<JadwalStore>(
    () => ({
      loading,
      error,
      jadwalList,
      activeJadwalId,
      jadwal,
      semesterLabel,
      slots,
      jadwalKelasAktif,
      konflik,
      konflikDimuat,
      jumlahKonflikTerbuka,
      konflikPerTipe,
      conflictItems,
      validated,
      mlPredicted,
      validating,
      predicting,
      gridKelasId,
      selectedConflictId,
      openKonflik,
      unplotted,
      jumlahBelumDiplot,
      errorCount,
      warningCount,
      steps,
      setActiveJadwalId,
      setGridKelasId,
      setSelectedConflictId,
      refreshList,
      loadJadwal,
      loadKonflikFor,
      loadSlotsFor,
      createJadwal,
      runValidasi,
      runPrediksiMl,
      assignGuru,
      slotConflicts,
      teacherBusy,
      teacherHoursOnDay,
    }),
    [
      loading,
      error,
      jadwalList,
      activeJadwalId,
      jadwal,
      semesterLabel,
      slots,
      jadwalKelasAktif,
      konflik,
      konflikDimuat,
      jumlahKonflikTerbuka,
      konflikPerTipe,
      conflictItems,
      validated,
      mlPredicted,
      validating,
      predicting,
      gridKelasId,
      selectedConflictId,
      openKonflik,
      unplotted,
      jumlahBelumDiplot,
      errorCount,
      warningCount,
      steps,
      setActiveJadwalId,
      refreshList,
      loadJadwal,
      loadKonflikFor,
      loadSlotsFor,
      createJadwal,
      runValidasi,
      runPrediksiMl,
      assignGuru,
      slotConflicts,
      teacherBusy,
      teacherHoursOnDay,
    ]
  );

  return <JadwalContext.Provider value={value}>{children}</JadwalContext.Provider>;
}

export function useJadwal() {
  const ctx = useContext(JadwalContext);
  if (!ctx) throw new Error("useJadwal must be used within JadwalProvider");
  return ctx;
}
