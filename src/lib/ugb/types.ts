export type ComplianceStatus = "C" | "PC" | "NC" | "NA";
export type ReportStatus = "rascunho" | "revisao" | "finalizado";

export interface Photo {
  id: string;
  src: string;
  caption: string;
  date: string;
  system: string;
  local: string;
  phase: "antes" | "depois" | "unica";
  inPdf: boolean;
}

export interface SystemEntry {
  key: string;
  status: ComplianceStatus;
  subStatus: string;
  applicable: boolean;
  situation: string;
  description: string;
  norm: string;
  changes: string;
  risks: string;
  recommendation: string;
  action: string;
  responsible: string;
  company: string;
  deadline: string;
  treatment: string;
  notes: string;
  links: string;
  helpdesk: string;
  docs: string;
  photos: Photo[];
  updatedAt?: string;
}

/** Registro genérico usado pelos módulos de lista (inspeções, testes, etc.). */
export interface Rec {
  id: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  value: string;
}

export interface ExtraSection {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  risk: string;
  recommendation: string;
  photos: Photo[];
}

export interface Inventory {
  extinguishers: Rec[];
  sdai: {
    centrais: number;
    lacos: number;
    detectores: number;
    acionadores: number;
    sirenes: number;
    audiovisuais: number;
    operacionais: number;
    avariados: number;
    manutencao: number;
  };
  lighting: {
    instalada: number;
    operacionais: number;
    falha: number;
    queimadas: number;
    manutencao: number;
  };
}

export interface Report {
  id: string;
  unitId: string;
  year: number;
  month: number;
  emissionDate: string;
  responsible: string;
  role: string;
  number: string;
  status: ReportStatus;
  conclusion: string;
  systems: Record<string, SystemEntry>;
  inventory: Inventory;
  inspections: Rec[];
  pumpTests: Rec[];
  actions: Rec[];
  brigade: Rec[];
  trainings: Rec[];
  drills: Rec[];
  occurrences: Rec[];
  documents: Rec[];
  activities: Rec[];
  photos: Photo[];
  extraSections: ExtraSection[];
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  responsible: string;
  role: string;
  defaultUnit: string;
  weights: { C: number; PC: number; NC: number };
}

export interface DB {
  version: number;
  reports: Report[];
  settings: Settings;
}
