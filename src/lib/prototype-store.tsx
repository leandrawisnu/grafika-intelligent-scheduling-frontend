"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GURU,
  GURU_BY_ID,
  HARI,
  HARI_BY_ID,
  INITIAL_CONFLICTS,
  INITIAL_SLOTS,
  JAM,
  JAM_BY_ID,
  JURUSAN_BY_ID,
  KELAS,
  KELAS_BY_ID,
  MAPEL_BY_ID,
  RUANGAN_BY_ID,
} from "@/lib/mock";
import type {
  PrototypeConflict,
  ResolveAlternative,
  Role,
  SlotJadwal,
  WorkflowStep,
} from "@/lib/prototype-types";
import { JADWAL_ID } from "@/lib/prototype-types";

function cloneSlots(): SlotJadwal[] {
  return INITIAL_SLOTS.map((s) => ({ ...s }));
}

function cloneConflicts(): PrototypeConflict[] {
  return INITIAL_CONFLICTS.map((c) => ({
    ...c,
    slotIds: [...c.slotIds],
    teacherIds: [...c.teacherIds],
    roomIds: [...c.roomIds],
    alternatives: c.alternatives.map((a) => ({
      ...a,
      changes: a.changes.map((ch) => ({ ...ch })),
      reasoningSteps: [...a.reasoningSteps],
    })),
  }));
}

function occupancyKey(slot: SlotJadwal) {
  return `${slot.kelas_id}|${slot.hari_id}|${slot.jam_pelajaran_id}`;
}

function applyAlternativeToSlots(slots: SlotJadwal[], alt: ResolveAlternative): SlotJadwal[] {
  const edited = new Set(alt.changes.map((c) => c.slotId));
  const next = slots.map((slot) => {
    const related = alt.changes.filter((c) => c.slotId === slot.id);
    if (related.length === 0) return slot;
    const copy = { ...slot };
    for (const change of related) {
      if (change.field === "guru_id" || change.field === "ruangan_id") {
        copy[change.field] = change.to;
      } else if (change.to) {
        copy[change.field] = change.to;
      }
    }
    return copy;
  });

  const byKey = new Map<string, SlotJadwal>();
  for (const slot of next) {
    const key = occupancyKey(slot);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, slot);
      continue;
    }
    if (edited.has(slot.id) && !edited.has(existing.id)) {
      byKey.set(key, slot);
    }
  }
  return [...byKey.values()];
}

type PrototypeState = {
  role: Role;
  viewGuruId: string;
  viewKelasId: string;
  slots: SlotJadwal[];
  conflicts: PrototypeConflict[];
  predicted: boolean;
  predicting: boolean;
  published: boolean;
  selectedConflictId: string | null;
  appliedAltByConflict: Record<string, string>;
  gridKelasId: string;
};

type PrototypeStore = PrototypeState & {
  jadwalId: string;
  openConflicts: PrototypeConflict[];
  resolvedConflicts: PrototypeConflict[];
  unplotted: SlotJadwal[];
  errorCount: number;
  warningCount: number;
  steps: WorkflowStep[];
  setRole: (role: Role) => void;
  setViewGuruId: (id: string) => void;
  setViewKelasId: (id: string) => void;
  setGridKelasId: (id: string) => void;
  setSelectedConflictId: (id: string | null) => void;
  runPrediction: () => Promise<void>;
  ensurePredicted: () => void;
  assignGuru: (slotId: string, guruId: string) => void;
  applyAlternative: (conflictId: string, alternativeId: string) => void;
  publish: () => { ok: boolean; reason?: string };
  resetDemo: () => void;
  slotConflicts: (slotId: string) => PrototypeConflict[];
  teacherHoursOnDay: (guruId: string, hariId: string) => number;
  teacherBusy: (guruId: string, hariId: string, jamId: string, exceptSlotId?: string) => boolean;
};

const PrototypeContext = createContext<PrototypeStore | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("kurikulum");
  const [viewGuruId, setViewGuruId] = useState("g-ahmad");
  const [viewKelasId, setViewKelasId] = useState("k-xidkv1");
  const [gridKelasId, setGridKelasId] = useState("k-xidkv1");
  const [slots, setSlots] = useState<SlotJadwal[]>(cloneSlots);
  const [conflicts, setConflicts] = useState<PrototypeConflict[]>(cloneConflicts);
  const [predicted, setPredicted] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [published, setPublished] = useState(false);
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [appliedAltByConflict, setAppliedAltByConflict] = useState<Record<string, string>>({});

  const unplotted = useMemo(() => slots.filter((s) => !s.guru_id), [slots]);
  const openConflicts = useMemo(
    () => (predicted ? conflicts.filter((c) => !c.resolved) : []),
    [predicted, conflicts]
  );
  const resolvedConflicts = useMemo(
    () => conflicts.filter((c) => c.resolved),
    [conflicts]
  );
  const errorCount = openConflicts.filter((c) => c.severity === "kesalahan").length;
  const warningCount = openConflicts.filter((c) => c.severity === "peringatan").length;

  const steps = useMemo<WorkflowStep[]>(() => {
    const plotDone = unplotted.length === 0;
    const resolveDone = predicted && openConflicts.length === 0;
    const current = !plotDone
      ? "plot"
      : !predicted
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

    return [
      { id: "master", label: "Data Master", href: "/master/guru", status: "done" },
      { id: "draft", label: "Draf Jadwal", href: `/jadwal/${JADWAL_ID}`, status: "done" },
      { id: "plot", label: "Plotting Guru", href: `/jadwal/${JADWAL_ID}?tab=plotting`, status: status("plot", plotDone) },
      { id: "predict", label: "Prediksi AI", href: "/ai/konflik", status: status("predict", predicted) },
      { id: "resolve", label: "Selesaikan AI", href: "/ai/selesaikan", status: status("resolve", resolveDone) },
      { id: "publish", label: "Publikasi", href: `/jadwal/${JADWAL_ID}?tab=publikasi`, status: status("publish", published) },
    ];
  }, [unplotted.length, predicted, openConflicts.length, published]);

  const ensurePredicted = useCallback(() => {
    setPredicted(true);
    setPredicting(false);
    setSelectedConflictId((id) => id ?? cloneConflicts().find((c) => !c.resolved)?.id ?? null);
  }, []);

  const runPrediction = useCallback(async () => {
    setPredicting(true);
    await new Promise((r) => setTimeout(r, 900));
    ensurePredicted();
  }, [ensurePredicted]);

  const assignGuru = useCallback((slotId: string, guruId: string) => {
    if (published) return;
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, guru_id: guruId } : s)));
  }, [published]);

  const applyAlternative = useCallback((conflictId: string, alternativeId: string) => {
    if (published) return;
    const conflict = conflicts.find((c) => c.id === conflictId);
    const alt = conflict?.alternatives.find((a) => a.id === alternativeId);
    if (!conflict || !alt) return;
    setSlots((prev) => applyAlternativeToSlots(prev, alt));
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, resolved: true } : c))
    );
    setAppliedAltByConflict((prev) => ({ ...prev, [conflictId]: alternativeId }));
  }, [conflicts, published]);

  const publish = useCallback(() => {
    if (unplotted.length > 0) {
      return { ok: false, reason: `Masih ada ${unplotted.length} slot belum diplot guru.` };
    }
    if (!predicted) {
      return { ok: false, reason: "Jalankan AI Conflict Predictor sebelum publikasi." };
    }
    if (openConflicts.length > 0) {
      return {
        ok: false,
        reason: `Masih ada ${openConflicts.length} konflik. Selesaikan lewat AI Resolve dulu.`,
      };
    }
    setPublished(true);
    return { ok: true };
  }, [unplotted.length, predicted, openConflicts.length]);

  const resetDemo = useCallback(() => {
    setSlots(cloneSlots());
    setConflicts(cloneConflicts());
    setPredicted(false);
    setPredicting(false);
    setPublished(false);
    setSelectedConflictId(null);
    setAppliedAltByConflict({});
    setRole("kurikulum");
    setGridKelasId("k-xidkv1");
  }, []);

  const slotConflicts = useCallback(
    (slotId: string) => openConflicts.filter((c) => c.slotIds.includes(slotId)),
    [openConflicts]
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

  const value = useMemo<PrototypeStore>(
    () => ({
      role,
      viewGuruId,
      viewKelasId,
      slots,
      conflicts,
      predicted,
      predicting,
      published,
      selectedConflictId,
      appliedAltByConflict,
      gridKelasId,
      jadwalId: JADWAL_ID,
      openConflicts,
      resolvedConflicts,
      unplotted,
      errorCount,
      warningCount,
      steps,
      setRole,
      setViewGuruId,
      setViewKelasId,
      setGridKelasId,
      setSelectedConflictId,
      runPrediction,
      ensurePredicted,
      assignGuru,
      applyAlternative,
      publish,
      resetDemo,
      slotConflicts,
      teacherHoursOnDay,
      teacherBusy,
    }),
    [
      role,
      viewGuruId,
      viewKelasId,
      slots,
      conflicts,
      predicted,
      predicting,
      published,
      selectedConflictId,
      appliedAltByConflict,
      gridKelasId,
      openConflicts,
      resolvedConflicts,
      unplotted,
      errorCount,
      warningCount,
      steps,
      runPrediction,
      ensurePredicted,
      assignGuru,
      applyAlternative,
      publish,
      resetDemo,
      slotConflicts,
      teacherHoursOnDay,
      teacherBusy,
    ]
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}

export function guruName(id: string | null) {
  if (!id) return null;
  return GURU_BY_ID[id]?.nama ?? id;
}

export function mapelName(id: string) {
  return MAPEL_BY_ID[id]?.nama ?? id;
}

export function kelasName(id: string) {
  return KELAS_BY_ID[id]?.nama ?? id;
}

export function ruanganName(id: string | null) {
  if (!id) return null;
  return RUANGAN_BY_ID[id]?.nama ?? id;
}

export function hariName(id: string) {
  return HARI_BY_ID[id]?.nama ?? id;
}

export function jamLabel(id: string) {
  const jam = JAM_BY_ID[id];
  if (!jam) return id;
  return `${jam.jam_ke} · ${jam.waktu_mulai}`;
}

export { GURU, HARI, JAM, KELAS, JURUSAN_BY_ID };
