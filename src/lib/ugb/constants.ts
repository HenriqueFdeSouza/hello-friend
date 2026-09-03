import type { ComplianceStatus, ReportStatus } from "./types";

export interface UnitDef {
  id: string;
  name: string;
  short: string;
  accent: string;
}

export const UNITS: UnitDef[] = [
  { id: "acqua", name: "Acqua Resort", short: "Acqua", accent: "#0E7490" },
  { id: "wellness", name: "Wellness Resort", short: "Wellness", accent: "#4D7C0F" },
  { id: "suites", name: "Suítes Resort", short: "Suítes", accent: "#7C3AED" },
  { id: "oceani", name: "Oceani Resort", short: "Oceani", accent: "#1D4ED8" },
  { id: "parque", name: "Parque Aquático Beach Park", short: "Parque Aquático", accent: "#0891B2" },
  { id: "arvorar", name: "Parque Arvorar", short: "Arvorar", accent: "#15803D" },
];

export const unitName = (id: string) => UNITS.find((u) => u.id === id)?.name ?? id;
export const unitShort = (id: string) => UNITS.find((u) => u.id === id)?.short ?? id;
export const unitAccent = (id: string) => UNITS.find((u) => u.id === id)?.accent ?? "#667085";

export interface SystemDef {
  key: string;
  name: string;
  icon: string;
  norm: string;
}

export const SYSTEMS: SystemDef[] = [
  { key: "acesso_viaturas", name: "Acesso de Viaturas à Edificação", icon: "Truck", norm: "NT 04 / IT CBMCE" },
  { key: "sdai", name: "Sistema de Detecção e Alarme de Incêndio — SDAI", icon: "BellRing", norm: "NBR 17240" },
  { key: "brigada", name: "Brigada de Incêndio / Emergência", icon: "Users", norm: "NBR 14276" },
  { key: "extintores", name: "Extintores Portáteis", icon: "FireExtinguisher", norm: "NBR 12693 / NBR 12962" },
  { key: "iluminacao", name: "Iluminação de Emergência", icon: "Lightbulb", norm: "NBR 10898" },
  { key: "projeto", name: "Projeto de Segurança Contra Incêndio e Pânico", icon: "FileStack", norm: "PPCIP / AVCB" },
  { key: "saidas", name: "Saídas de Emergência / Rotas de Fuga", icon: "DoorOpen", norm: "NBR 9077" },
  { key: "sinalizacao", name: "Sinalização de Emergência", icon: "SignpostBig", norm: "NBR 13434" },
  { key: "gerador", name: "Grupo Moto-Gerador / Gerador de Emergência", icon: "Zap", norm: "NBR 14664" },
  { key: "spda", name: "Sistema de Proteção Contra Descargas Atmosféricas — SPDA", icon: "CloudLightning", norm: "NBR 5419" },
  { key: "glp", name: "Central de GLP", icon: "Flame", norm: "NBR 13523" },
  { key: "hidrantes", name: "Canalização Preventiva / Hidrantes / Bombas", icon: "Waves", norm: "NBR 13714" },
  { key: "hidrante_urbano", name: "Hidrante Urbano", icon: "Droplets", norm: "NBR 13714" },
];

export const systemName = (key: string) => SYSTEMS.find((s) => s.key === key)?.name ?? key;

export const SUB_STATUS = [
  "Sem alteração",
  "Em manutenção",
  "Em corretiva",
  "Em instalação",
  "Em atualização",
  "Em avaliação",
  "Aguardando orçamento",
  "Aguardando empresa",
  "Aguardando material",
  "Concluído",
];

export const STATUS_LABEL: Record<ComplianceStatus, string> = {
  C: "Conforme",
  PC: "Parcialmente Conforme",
  NC: "Não Conforme",
  NA: "Não Aplicável",
};

export const STATUS_COLOR: Record<ComplianceStatus, string> = {
  C: "var(--status-c)",
  PC: "var(--status-pc)",
  NC: "var(--status-nc)",
  NA: "var(--status-na)",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  rascunho: "Rascunho",
  revisao: "Em revisão",
  finalizado: "Finalizado",
};

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const PRIORITIES = ["Baixa", "Média", "Alta", "Crítica"];
export const ACTION_STATUS = [
  "Aberto",
  "Em andamento",
  "Aguardando material",
  "Aguardando orçamento",
  "Aguardando terceiro",
  "Concluído",
];
export const INSPECTION_SYSTEMS = [
  "Extintores",
  "Hidrantes",
  "SDAI",
  "Iluminação",
  "Sinalização",
  "GLP",
  "SPDA",
  "Outro",
];
export const EXTINGUISHER_TYPES = ["ABC", "BC", "CO2", "AP", "Classe K", "Carreta", "Outro"];
export const BRIGADE_TEAMS = [
  "Comunicação",
  "Evacuação",
  "Combate a incêndio",
  "Primeiros socorros",
  "Outro",
];
export const TRAINING_TYPES = [
  "DGS",
  "Treinamento de Brigada",
  "Simulado",
  "Integração",
  "Reciclagem",
];
export const DOC_CATEGORIES = [
  "AVCB",
  "PPCIP",
  "PAE",
  "Planta de Risco",
  "SPDA",
  "Laudo GLP",
  "Teste de estanqueidade",
  "Mangueiras de incêndio",
  "Gerador",
  "Projetos",
  "Certificados",
  "Outros",
];
export const ACTIVITY_CATEGORIES = [
  "Inspeção",
  "Manutenção",
  "Treinamento",
  "Teste",
  "Acompanhamento",
  "Helpdesk",
  "Simulado",
  "Reunião",
  "Outro",
];
export const PERSON_TYPES = ["Hóspede", "Visitante", "Colaborador", "Terceiro"];
export const PUMP_TYPES = ["Jockey", "Principal", "Reserva"];
export const PUMP_MODES = ["Automático", "Manual"];
export const RESULTS = ["Conforme", "Parcialmente Conforme", "Não Conforme"];
