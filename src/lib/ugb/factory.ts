import { SYSTEMS, unitShort } from "./constants";
import { uid } from "./photos";
import type { Report, Settings, SystemEntry } from "./types";

function blankSystem(key: string, norm: string): SystemEntry {
  return {
    key,
    status: "NA",
    subStatus: "Sem alteração",
    applicable: true,
    situation: "",
    description: "",
    norm,
    changes: "",
    risks: "",
    recommendation: "",
    action: "",
    responsible: "",
    company: "",
    deadline: "",
    treatment: "",
    notes: "",
    links: "",
    helpdesk: "",
    docs: "",
    photos: [],
  };
}

export function reportId(unitId: string, year: number, month: number) {
  return `report_${unitId}_${year}_${String(month).padStart(2, "0")}`;
}

export function createReport(
  unitId: string,
  year: number,
  month: number,
  settings: Settings,
): Report {
  const now = new Date().toISOString();
  const systems: Record<string, SystemEntry> = {};
  for (const s of SYSTEMS) systems[s.key] = blankSystem(s.key, s.norm);
  return {
    id: reportId(unitId, year, month),
    unitId,
    year,
    month,
    emissionDate: now.slice(0, 10),
    responsible: settings.responsible,
    role: settings.role,
    number: `${String(month).padStart(2, "0")}/${year} — ${unitShort(unitId).toUpperCase()}`,
    status: "rascunho",
    conclusion: "",
    systems,
    inventory: {
      extinguishers: [],
      sdai: {
        centrais: 0,
        lacos: 0,
        detectores: 0,
        acionadores: 0,
        sirenes: 0,
        audiovisuais: 0,
        operacionais: 0,
        avariados: 0,
        manutencao: 0,
      },
      lighting: { instalada: 0, operacionais: 0, falha: 0, queimadas: 0, manutencao: 0 },
    },
    inspections: [],
    pumpTests: [],
    actions: [],
    brigade: [],
    trainings: [],
    drills: [],
    occurrences: [],
    documents: [],
    activities: [],
    photos: [],
    extraSections: [],
    customFields: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Cria um relatório a partir do mês anterior:
 * mantém informações estruturais/permanentes e limpa dados do período.
 */
export function cloneFromPrevious(
  base: Report,
  unitId: string,
  year: number,
  month: number,
  settings: Settings,
): Report {
  const fresh = createReport(unitId, year, month, settings);
  const systems: Record<string, SystemEntry> = {};
  for (const [key, prev] of Object.entries(base.systems)) {
    systems[key] = {
      ...fresh.systems[key]!,
      status: prev.status,
      subStatus: prev.subStatus,
      applicable: prev.applicable,
      description: prev.description,
      norm: prev.norm,
      situation: prev.situation,
      risks: prev.risks,
      recommendation: prev.recommendation,
      responsible: prev.responsible,
      company: prev.company,
      changes: "",
      photos: [],
      notes: "",
    };
  }
  return {
    ...fresh,
    systems,
    inventory: JSON.parse(JSON.stringify(base.inventory)),
    brigade: base.brigade.map((b) => ({ ...b })),
    documents: base.documents.map((d) => ({ ...d })),
    actions: base.actions
      .filter((a) => a["status"] !== "Concluído")
      .map((a) => ({ ...a, id: uid("act") })),
    customFields: base.customFields.map((f) => ({ ...f })),
    extraSections: base.extraSections.map((s) => ({ ...s, photos: [] })),
  };
}
