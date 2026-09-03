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

import { cloneFromPrevious, createReport, reportId } from "./factory";
import { StorageService, defaultSettings, emptyDB } from "./storage";
import type { DB, Report, Settings } from "./types";

interface Ctx {
  hydrated: boolean;
  db: DB;
  settings: Settings;
  reports: Report[];
  activeReport: Report | undefined;
  activeUnit: string;
  savedAt: number | null;
  setActiveReportId: (id: string) => void;
  setActiveUnit: (unitId: string) => void;
  updateReport: (mutate: (draft: Report) => void) => void;
  newReport: (unitId: string, year: number, month: number, fromPrevious?: boolean) => Report | null;
  previousReport: (unitId: string, year: number, month: number) => Report | undefined;
  saveReport: (report: Report) => void;
  deleteReport: (id: string) => void;
  duplicateReport: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  importDB: (db: DB, mode: "replace" | "merge") => void;
  usageBytes: number;
}

const UgbContext = createContext<Ctx | null>(null);

export function UgbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(emptyDB);
  const [hydrated, setHydrated] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [activeUnit, setActiveUnit] = useState<string>(defaultSettings.defaultUnit);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    const loaded = StorageService.load();
    setDb(loaded);
    setActiveUnit(loaded.settings.defaultUnit);
    const sorted = [...loaded.reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (sorted[0]) {
      setActiveReportId(sorted[0].id);
      setActiveUnit(sorted[0].unitId);
    }
    setHydrated(true);
  }, []);

  // Autosave: qualquer alteração no estado é persistida na camada de storage.
  useEffect(() => {
    if (!hydrated || !dirty.current) return;
    const t = window.setTimeout(() => {
      StorageService.save(db);
      setSavedAt(Date.now());
      dirty.current = false;
    }, 350);
    return () => window.clearTimeout(t);
  }, [db, hydrated]);

  const commit = useCallback((next: DB) => {
    dirty.current = true;
    setDb(next);
  }, []);

  const activeReport = useMemo(
    () => db.reports.find((r) => r.id === activeReportId),
    [db.reports, activeReportId],
  );

  const updateReport = useCallback<Ctx["updateReport"]>(
    (mutate) => {
      if (!activeReportId) return;
      setDb((prev) => {
        const idx = prev.reports.findIndex((r) => r.id === activeReportId);
        if (idx < 0) return prev;
        const draft: Report = JSON.parse(JSON.stringify(prev.reports[idx]));
        mutate(draft);
        draft.updatedAt = new Date().toISOString();
        const reports = [...prev.reports];
        reports[idx] = draft;
        dirty.current = true;
        return { ...prev, reports };
      });
    },
    [activeReportId],
  );

  const previousReport = useCallback<Ctx["previousReport"]>(
    (unitId, year, month) => {
      const pm = month === 1 ? 12 : month - 1;
      const py = month === 1 ? year - 1 : year;
      return db.reports.find((r) => r.id === reportId(unitId, py, pm));
    },
    [db.reports],
  );

  const newReport = useCallback<Ctx["newReport"]>(
    (unitId, year, month, fromPrevious) => {
      const id = reportId(unitId, year, month);
      if (db.reports.some((r) => r.id === id)) {
        setActiveReportId(id);
        setActiveUnit(unitId);
        return db.reports.find((r) => r.id === id) ?? null;
      }
      const base = previousReport(unitId, year, month);
      const report =
        fromPrevious && base
          ? cloneFromPrevious(base, unitId, year, month, db.settings)
          : createReport(unitId, year, month, db.settings);
      commit({ ...db, reports: [...db.reports, report] });
      setActiveReportId(report.id);
      setActiveUnit(unitId);
      return report;
    },
    [commit, db, previousReport],
  );

  const saveReport = useCallback<Ctx["saveReport"]>(
    (report) => {
      const idx = db.reports.findIndex((r) => r.id === report.id);
      const reports = [...db.reports];
      if (idx >= 0) reports[idx] = report;
      else reports.push(report);
      commit({ ...db, reports });
    },
    [commit, db],
  );

  const deleteReport = useCallback<Ctx["deleteReport"]>(
    (id) => {
      commit({ ...db, reports: db.reports.filter((r) => r.id !== id) });
      if (activeReportId === id) setActiveReportId(null);
    },
    [activeReportId, commit, db],
  );

  const duplicateReport = useCallback<Ctx["duplicateReport"]>(
    (id) => {
      const src = db.reports.find((r) => r.id === id);
      if (!src) return;
      const copy: Report = {
        ...JSON.parse(JSON.stringify(src)),
        id: `${src.id}_copia_${Date.now().toString(36)}`,
        status: "rascunho",
        updatedAt: new Date().toISOString(),
      };
      commit({ ...db, reports: [...db.reports, copy] });
    },
    [commit, db],
  );

  const updateSettings = useCallback<Ctx["updateSettings"]>(
    (patch) => commit({ ...db, settings: { ...db.settings, ...patch } }),
    [commit, db],
  );

  const importDB = useCallback<Ctx["importDB"]>(
    (incoming, mode) => {
      if (mode === "replace") {
        commit({ ...emptyDB, ...incoming });
        return;
      }
      const map = new Map(db.reports.map((r) => [r.id, r]));
      for (const r of incoming.reports ?? []) map.set(r.id, r);
      commit({ ...db, reports: [...map.values()] });
    },
    [commit, db],
  );

  const value = useMemo<Ctx>(
    () => ({
      hydrated,
      db,
      settings: db.settings,
      reports: db.reports,
      activeReport,
      activeUnit,
      savedAt,
      setActiveReportId: (id) => {
        setActiveReportId(id);
        const r = db.reports.find((x) => x.id === id);
        if (r) setActiveUnit(r.unitId);
      },
      setActiveUnit: (unitId) => {
        setActiveUnit(unitId);
        const candidates = db.reports
          .filter((r) => r.unitId === unitId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setActiveReportId(candidates[0]?.id ?? null);
      },
      updateReport,
      newReport,
      previousReport,
      saveReport,
      deleteReport,
      duplicateReport,
      updateSettings,
      importDB,
      usageBytes: JSON.stringify(db).length * 2,
    }),
    [
      activeReport,
      activeUnit,
      db,
      deleteReport,
      duplicateReport,
      hydrated,
      importDB,
      newReport,
      previousReport,
      saveReport,
      savedAt,
      updateReport,
      updateSettings,
    ],
  );

  return <UgbContext.Provider value={value}>{children}</UgbContext.Provider>;
}

export function useUgb() {
  const ctx = useContext(UgbContext);
  if (!ctx) throw new Error("useUgb precisa estar dentro de UgbProvider");
  return ctx;
}
