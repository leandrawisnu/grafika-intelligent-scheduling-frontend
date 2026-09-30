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
import { api } from "@/lib/api";
import { konflikToListItem, type ConflictListItem } from "@/lib/conflict-display";
import { jadwalSemesterLabel } from "@/lib/jadwal-labels";
import { jadwalKonflikHref } from "@/lib/navigation";
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
  const rows = await api.getJadwalKelasAktif(id, { ringkas: true });
  return rows.length > 0;
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
  const [validated, setValidated] = useState(false);
  const [mlPredicted, setMlPredicted] = useState(false);
  const [validating, setValidating] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [gridKelasId, setGridKelasId] = useState("");
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const activeJadwalIdRef = useRef<string | null>(null);
  const muatBerjalan = useRef(new Map<string, Promise<void>>());

  const setActiveJadwalId = useCallback((id: string) => {
    if (activeJadwalIdRef.current !== id) {
      setSlots([]);
      setSlotsLoadedForId(null);
      setJumlahTanpaGuru(0);
    }
    activeJadwalIdRef.current = id;
    setActiveJadwalIdState(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const loadSlotsFor = useCallback(async (jsId: string) => {
    const kelasAktif = await api.getJadwalKelasAktif(jsId);
    if (activeJadwalIdRef.current !== jsId) return;
    const list = Array.isArray(kelasAktif) ? kelasAktif : [];
    setJadwalKelasAktif(list);
    setSlots(flattenSlots(list));
    setSlotsLoadedForId(jsId);
  }, []);

  const loadKonflikFor = useCallback(async (jsId: string) => {
    const rows = await api.getKonflik(jsId);
    setKonflik(Array.isArray(rows) ? rows : []);
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
          const [detail, kelasAktif, rows, ringkasan] = await Promise.all([
            api.getJadwalSemesterById(id),
            api.getJadwalKelasAktif(id, { ringkas: true }),
            api.getKonflik(id),
            api.getRingkasanJadwal(id),
          ]);
          const list = Array.isArray(kelasAktif) ? kelasAktif : [];
          const k = Array.isArray(rows) ? rows : [];
          setJadwal(detail);
          setActiveJadwalId(id);
          setJadwalKelasAktif(list);
          setJumlahTanpaGuru(ringkasan.jumlah_tanpa_guru);
          setKonflik(k);
          setValidated(k.length > 0 || detail.bebas_konflik);
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
  const jumlahBelumDiplot =
    slotsLoadedForId === activeJadwalId ? unplotted.length : jumlahTanpaGuru;

  const errorCount = openKonflik.filter((k) => k.tingkat_keparahan === "kesalahan").length;
  const warningCount = openKonflik.filter((k) => k.tingkat_keparahan === "peringatan").length;

  const steps = useMemo<WorkflowStep[]>(() => {
    const jsId = activeJadwalId ?? "";
    const plotDone = jumlahBelumDiplot === 0;
    const resolveDone = validated && openKonflik.length === 0;
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
  }, [activeJadwalId, jumlahBelumDiplot, validated, openKonflik.length]);

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
