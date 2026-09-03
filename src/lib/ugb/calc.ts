import { SYSTEMS } from "./constants";
import type { ComplianceStatus, Rec, Report, Settings, SystemEntry } from "./types";

export const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

export function systemList(report: Report): SystemEntry[] {
  return SYSTEMS.map((s) => report.systems[s.key]).filter(
    (s): s is SystemEntry => Boolean(s),
  );
}

export interface ComplianceResult {
  index: number;
  counts: Record<ComplianceStatus, number>;
  applicable: number;
  total: number;
}

export function compliance(report: Report, weights: Settings["weights"]): ComplianceResult {
  const counts: Record<ComplianceStatus, number> = { C: 0, PC: 0, NC: 0, NA: 0 };
  let points = 0;
  let applicable = 0;
  const list = systemList(report);
  for (const s of list) {
    const status: ComplianceStatus = s.applicable === false ? "NA" : s.status;
    counts[status] += 1;
    if (status === "NA") continue;
    applicable += 1;
    points += weights[status];
  }
  return {
    index: applicable > 0 ? Math.round(points / applicable) : 0,
    counts,
    applicable,
    total: list.length,
  };
}

export function daysUntil(dateStr?: unknown) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const target = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function docStatusColor(days: number | null) {
  if (days === null) return "var(--status-na)";
  if (days < 0) return "var(--status-critical)";
  if (days <= 30) return "var(--status-nc)";
  if (days <= 90) return "var(--status-pc)";
  return "var(--status-c)";
}

export function avcbDays(report: Report) {
  const avcb = report.documents.filter((d) => d["category"] === "AVCB");
  const values = avcb.map((d) => daysUntil(d["validity"])).filter((v): v is number => v !== null);
  return values.length ? Math.min(...values) : null;
}

export interface ActionStats {
  total: number;
  open: number;
  progress: number;
  done: number;
  overdue: number;
  critical: number;
  resolutionRate: number;
  byPriority: { name: string; value: number }[];
  bySystem: { name: string; value: number }[];
}

export function actionStats(report: Report): ActionStats {
  const items = report.actions;
  const done = items.filter((a) => a["status"] === "Concluído");
  const open = items.filter((a) => a["status"] === "Aberto");
  const progress = items.filter(
    (a) => a["status"] !== "Aberto" && a["status"] !== "Concluído",
  );
  const overdue = items.filter((a) => {
    const d = daysUntil(a["deadline"]);
    return a["status"] !== "Concluído" && d !== null && d < 0;
  });
  const critical = items.filter((a) => a["priority"] === "Crítica" && a["status"] !== "Concluído");
  const group = (key: string) => {
    const map = new Map<string, number>();
    for (const a of items) {
      const k = String(a[key] ?? "Não informado");
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  };
  return {
    total: items.length,
    open: open.length,
    progress: progress.length,
    done: done.length,
    overdue: overdue.length,
    critical: critical.length,
    resolutionRate: pct(done.length, items.length),
    byPriority: group("priority"),
    bySystem: group("system"),
  };
}

export function extinguisherStats(report: Report) {
  const rows = report.inventory.extinguishers;
  const total = rows.length;
  const byStatus = (label: string) => rows.filter((r) => r["status"] === label).length;
  const operational = byStatus("Operacional");
  const group = (key: string) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = String(r[key] ?? "Não informado");
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  };
  return {
    total,
    operational,
    expired: byStatus("Vencido"),
    maintenance: byStatus("Em manutenção"),
    operationalPct: pct(operational, total),
    byType: group("type"),
    byLocal: group("local"),
  };
}

export function sdaiStats(report: Report) {
  const s = report.inventory.sdai;
  const total = s.operacionais + s.avariados + s.manutencao;
  return {
    ...s,
    total,
    totalDevices:
      s.detectores + s.acionadores + s.sirenes + s.audiovisuais ||
      total,
    availabilityPct: pct(s.operacionais, total),
    operationalPct: pct(s.operacionais, total),
  };
}

export function lightingStats(report: Report) {
  const l = report.inventory.lighting;
  const total = l.instalada || l.operacionais + l.falha + l.queimadas + l.manutencao;
  return { ...l, total, operationalPct: pct(l.operacionais, total) };
}

export function brigadeStats(report: Report) {
  const total = report.brigade.length;
  const map = new Map<string, number>();
  for (const b of report.brigade) {
    const k = String(b["team"] ?? "Outro");
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  const distribution = [...map.entries()].map(([name, value]) => ({
    name,
    value,
    pct: pct(value, total),
  }));
  const expiring = report.brigade.filter((b) => {
    const d = daysUntil(b["validity"]);
    return d !== null && d <= 60;
  }).length;
  return { total, distribution, expiring };
}

export function pumpStats(report: Report) {
  const rows = report.pumpTests;
  const conform = rows.filter((r) => r["result"] === "Conforme").length;
  return {
    total: rows.length,
    conform,
    partial: rows.filter((r) => r["result"] === "Parcialmente Conforme").length,
    failed: rows.filter((r) => r["result"] === "Não Conforme").length,
    auto: rows.filter((r) => r["mode"] === "Automático").length,
    manual: rows.filter((r) => r["mode"] === "Manual").length,
    conformityPct: pct(conform, rows.length),
  };
}

export function inspectionStats(report: Report) {
  const map = new Map<string, number>();
  for (const i of report.inspections) {
    const k = String(i["system"] ?? "Outro");
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return {
    total: report.inspections.length,
    bySystem: [...map.entries()].map(([name, value]) => ({ name, value })),
  };
}

export function trainingStats(report: Report) {
  const rows = report.trainings;
  const hours = rows.reduce((a, r) => a + num(r["hours"]), 0);
  const participants = rows.reduce((a, r) => a + num(r["participants"]), 0);
  return {
    total: rows.length,
    hours,
    participants,
    avgParticipants: rows.length ? Math.round(participants / rows.length) : 0,
    dgs: rows.filter((r) => r["type"] === "DGS").length,
  };
}

export function drillStats(report: Report) {
  const rows = report.drills;
  const times = rows.map((r) => num(r["responseTime"])).filter((n) => n > 0);
  return {
    total: rows.length,
    avgResponse: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
  };
}

export function occurrenceStats(report: Report) {
  const rows = report.occurrences;
  const group = (key: string) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = String(r[key] ?? "Não informado");
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  };
  return {
    total: rows.length,
    byType: group("type"),
    byLocal: group("local"),
    byPerson: group("person"),
    byDay: group("date").sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function docStats(report: Report) {
  const rows: (Rec & { days: number | null })[] = report.documents.map((d) => ({
    ...d,
    days: daysUntil(d["validity"]),
  }));
  return {
    total: rows.length,
    expiring: rows.filter((d) => d.days !== null && d.days >= 0 && d.days <= 90),
    expired: rows.filter((d) => d.days !== null && d.days < 0),
    rows,
  };
}

export function photoCount(report: Report) {
  const all = [...report.photos, ...systemList(report).flatMap((s) => s.photos ?? [])];
  return { total: all.length, inPdf: all.filter((p) => p.inPdf).length };
}


/** Percentual de preenchimento do relatório (progresso). */
export function completion(report: Report) {
  const checks: boolean[] = [
    !!report.responsible,
    !!report.number,
    !!report.emissionDate,
    systemList(report).some((s) => s.situation || s.description),
    systemList(report).every((s) => s.status !== "NA" || s.applicable === false)
      ? systemList(report).some((s) => s.status !== "NA")
      : true,
    report.inspections.length > 0,
    report.pumpTests.length > 0,
    report.actions.length > 0 || report.conclusion.length > 0,
    report.brigade.length > 0,
    report.trainings.length > 0,
    report.documents.length > 0,
    report.inventory.extinguishers.length > 0,
    photoCount(report).total > 0,
    !!report.conclusion,
  ];
  return pct(checks.filter(Boolean).length, checks.length);
}

export function listRecords(report: Report, key: keyof Report): Rec[] {
  const value = report[key];
  return Array.isArray(value) ? (value as Rec[]) : [];
}
