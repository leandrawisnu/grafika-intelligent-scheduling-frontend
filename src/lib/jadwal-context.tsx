"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { konflikToListItem, type ConflictListItem } from "@/lib/conflict-display";
import { jadwalSemesterLabel } from "@/lib/jadwal-labels";
import type { JadwalKelas, JadwalSemester, Konflik, SlotJadwal } from "@/lib/types";
import type { WorkflowStep } from "@/lib/prototype-types";

const STORAGE_KEY = "gis.activeJadwalSemesterId";

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

async function jadwalHasKelasAktif(id: string): Promise<boolean> {
  const rows = await api.getJadwalKelasAktif(id);
  return Array.isArray(rows) && rows.length > 0;
}

async function pickJadwalId(list: JadwalSemester[], stored: string | null): Promise<string | null> {
  if (list.length === 0) return null;
  if (stored && list.some((j) => j.id === stored) && await jadwalHasKelasAktif(stored)) {
    return stored;
  }
  for (const j of list) {
    if (await jadwalHasKelasAktif(j.id)) return j.id;
  }
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
  conflictItems: ConflictListItem[];
  validated: boolean;
  mlPredicted: boolean;
  validating: boolean;
  predicting: boolean;
  published: boolean;
  gridKelasId: string;
  selectedConflictId: string | null;
  openKonflik: Konflik[];
  unplotted: SlotJadwal[];
  errorCount: number;
  warningCount: number;
  steps: WorkflowStep[];
  setActiveJadwalId: (id: string) => void;
  setGridKelasId: (id: string) => void;
  setSelectedConflictId: (id: string | null) => void;
  refreshList: () => Promise<JadwalSemester[]>;
  loadJadwal: (id: string) => Promise<void>;
  createJadwal: (semesterId: string) => Promise<JadwalSemester>;
  runValidasi: () => Promise<void>;
  runPrediksiMl: () => Promise<void>;
  assignGuru: (slotId: string, guruId: string) => Promise<void>;
  publish: () => Promise<{ ok: boolean; reason?: string }>;
  slotConflicts: (slotId: string) => Konflik[];
  teacherBusy: (guruId: string, hariId: string, jamId: string, exceptSlotId?: string) => boolean;
  teacherHoursOnDay: (guruId: string, hariId: string) => number;
  publishedSlots: () => SlotJadwal[];
};

const JadwalContext = createContext<JadwalStore | null>(null);

export function JadwalProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jadwalList, setJadwalList] = useState<JadwalSemester[]>([]);
  const [activeJadwalId, setActiveJadwalIdState] = useState<string | null>(null);
  const [jadwal, setJadwal] = useState<JadwalSemester | null>(null);
  const [slots, setSlots] = useState<SlotJadwal[]>([]);
  const [jadwalKelasAktif, setJadwalKelasAktif] = useState<JadwalKelas[]>([]);
  const [konflik, setKonflik] = useState<Konflik[]>([]);
  const [validated, setValidated] = useState(false);
  const [mlPredicted, setMlPredicted] = useState(false);
  const [validating, setValidating] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [gridKelasId, setGridKelasId] = useState("");
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);

  const published = jadwal?.status === "dipublikasikan";

  const setActiveJadwalId = useCallback((id: string) => {
    setActiveJadwalIdState(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const loadSlotsFor = useCallback(async (jsId: string) => {
    const kelasAktif = await api.getJadwalKelasAktif(jsId);
    const list = Array.isArray(kelasAktif) ? kelasAktif : [];
    setJadwalKelasAktif(list);
    setSlots(flattenSlots(list));
  }, []);

  const loadKonflikFor = useCallback(async (jsId: string) => {
    const rows = await api.getKonflik(jsId);
    setKonflik(Array.isArray(rows) ? rows : []);
  }, []);

  const loadJadwal = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const detail = await api.getJadwalSemesterById(id);
        setJadwal(detail);
        setActiveJadwalId(id);
        await loadSlotsFor(id);
        const rows = await api.getKonflik(id);
        const k = Array.isArray(rows) ? rows : [];
        setKonflik(k);
        setValidated(k.length > 0 || detail.bebas_konflik);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat jadwal");
      } finally {
        setLoading(false);
      }
    },
    [loadSlotsFor, setActiveJadwalId]
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
    void (async () => {
      setLoading(true);
      const list = await refreshList();
      const stored =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const pick = await pickJadwalId(list, stored);
      if (pick) await loadJadwal(pick);
      else setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once
  }, []);

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

  const errorCount = openKonflik.filter((k) => k.tingkat_keparahan === "kesalahan").length;
  const warningCount = openKonflik.filter((k) => k.tingkat_keparahan === "peringatan").length;

  const steps = useMemo<WorkflowStep[]>(() => {
    const jsId = activeJadwalId ?? "";
    const plotDone = unplotted.length === 0;
    const resolveDone = validated && openKonflik.length === 0;
    const current = !plotDone
      ? "plot"
      : !validated
        ? "predict"
        : !resolveDone
          ? "resolve"
          : !published
            ? "publish"
            : "publish";

    const status = (id: string, done: boolean): WorkflowStep["status"] => {
      if (done) return "done";
      if (id === current) return "current";
      return "todo";
    };

    const konflikHref = jsId ? `/jadwal/${jsId}?tab=konflik` : "/jadwal";

    return [
      { id: "master", label: "Data master", href: "/master", status: "done" },
      { id: "draft", label: "Draf jadwal", href: jsId ? `/jadwal/${jsId}` : "/jadwal", status: jsId ? "done" : "current" },
      { id: "plot", label: "Plotting guru", href: jsId ? `/jadwal/${jsId}?tab=plotting` : "/jadwal", status: status("plot", plotDone) },
      { id: "predict", label: "Cek konflik", href: konflikHref, status: status("predict", validated) },
      { id: "resolve", label: "Perbaiki konflik", href: konflikHref, status: status("resolve", resolveDone) },
      { id: "publish", label: "Publikasi", href: jsId ? `/jadwal/${jsId}?tab=publikasi` : "/jadwal", status: status("publish", published) },
    ];
  }, [activeJadwalId, unplotted.length, validated, openKonflik.length, published]);

  const runValidasi = useCallback(async () => {
    if (!activeJadwalId) return;
    setValidating(true);
    setError(null);
    try {
      const result = await api.validasiJadwal(activeJadwalId);
      const rows = result.konflik as Konflik[];
      setKonflik(Array.isArray(rows) ? rows : []);
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
      if (published) return;
      await api.tugaskanGuru(slotId, guruId);
      if (activeJadwalId) await loadSlotsFor(activeJadwalId);
    },
    [published, activeJadwalId, loadSlotsFor]
  );

  const publish = useCallback(async () => {
    if (!activeJadwalId) return { ok: false, reason: "Tidak ada jadwal aktif." };
    if (unplotted.length > 0) {
      return { ok: false, reason: `Masih ada ${unplotted.length} slot belum diplot guru.` };
    }
    if (!validated) {
      return { ok: false, reason: "Jalankan validasi konflik sebelum publikasi." };
    }
    if (openKonflik.length > 0) {
      return {
        ok: false,
        reason: `Masih ada ${openKonflik.length} konflik. Selesaikan dulu.`,
      };
    }
    try {
      const updated = await api.publikasi(activeJadwalId);
      setJadwal(updated);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message : "Publikasi gagal" };
    }
  }, [activeJadwalId, unplotted.length, validated, openKonflik.length]);

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

  const publishedSlots = useCallback(() => (published ? slots : []), [published, slots]);

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
      conflictItems,
      validated,
      mlPredicted,
      validating,
      predicting,
      published,
      gridKelasId,
      selectedConflictId,
      openKonflik,
      unplotted,
      errorCount,
      warningCount,
      steps,
      setActiveJadwalId,
      setGridKelasId,
      setSelectedConflictId,
      refreshList,
      loadJadwal,
      createJadwal,
      runValidasi,
      runPrediksiMl,
      assignGuru,
      publish,
      slotConflicts,
      teacherBusy,
      teacherHoursOnDay,
      publishedSlots,
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
      conflictItems,
      validated,
      mlPredicted,
      validating,
      predicting,
      published,
      gridKelasId,
      selectedConflictId,
      openKonflik,
      unplotted,
      errorCount,
      warningCount,
      steps,
      setActiveJadwalId,
      refreshList,
      loadJadwal,
      createJadwal,
      runValidasi,
      runPrediksiMl,
      assignGuru,
      publish,
      slotConflicts,
      teacherBusy,
      teacherHoursOnDay,
      publishedSlots,
    ]
  );

  return <JadwalContext.Provider value={value}>{children}</JadwalContext.Provider>;
}

export function useJadwal() {
  const ctx = useContext(JadwalContext);
  if (!ctx) throw new Error("useJadwal must be used within JadwalProvider");
  return ctx;
}
