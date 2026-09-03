import type { DB, Report, Settings } from "./types";

/**
 * Camada centralizada de persistência.
 * Hoje: LocalStorageRepository. Futuramente: ApiRepository / SupabaseRepository
 * (basta implementar a mesma interface DataRepository).
 */
export interface DataRepository {
  load(): DB;
  save(db: DB): void;
  getReports(): Report[];
  getReport(id: string): Report | undefined;
  saveReport(report: Report): void;
  deleteReport(id: string): void;
  getSettings(): Settings;
  saveSettings(settings: Settings): void;
  usageBytes(): number;
  clearAll(): void;
}

export const STORAGE_KEY = "ugb_bombeiros_db_v1";

export const defaultSettings: Settings = {
  responsible: "",
  role: "Bombeiro Civil",
  defaultUnit: "acqua",
  weights: { C: 100, PC: 50, NC: 0 },
};

export const emptyDB: DB = { version: 1, reports: [], settings: defaultSettings };

class LocalStorageRepository implements DataRepository {
  private read(): DB {
    if (typeof window === "undefined") return emptyDB;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyDB;
      const parsed = JSON.parse(raw) as DB;
      return {
        version: parsed.version ?? 1,
        reports: Array.isArray(parsed.reports) ? parsed.reports : [],
        settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      };
    } catch {
      return emptyDB;
    }
  }

  load() {
    return this.read();
  }

  save(db: DB) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  getReports() {
    return this.read().reports;
  }

  getReport(id: string) {
    return this.read().reports.find((r) => r.id === id);
  }

  saveReport(report: Report) {
    const db = this.read();
    const idx = db.reports.findIndex((r) => r.id === report.id);
    if (idx >= 0) db.reports[idx] = report;
    else db.reports.push(report);
    this.save(db);
  }

  deleteReport(id: string) {
    const db = this.read();
    db.reports = db.reports.filter((r) => r.id !== id);
    this.save(db);
  }

  getSettings() {
    return this.read().settings;
  }

  saveSettings(settings: Settings) {
    const db = this.read();
    db.settings = settings;
    this.save(db);
  }

  usageBytes() {
    if (typeof window === "undefined") return 0;
    return (window.localStorage.getItem(STORAGE_KEY) ?? "").length * 2;
  }

  clearAll() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const StorageService: DataRepository = new LocalStorageRepository();
