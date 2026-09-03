import { createFileRoute } from "@tanstack/react-router";

import { AppShell, NoReportNotice } from "@/components/ugb/AppShell";
import { Bars, Donut } from "@/components/ugb/charts";
import { RecordManager } from "@/components/ugb/RecordManager";
import { Chip } from "@/components/ugb/RecordManager";
import { PageHeader, Panel, ProgressLine, StatCard } from "@/components/ugb/ui-bits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extinguisherStats, lightingStats, sdaiStats } from "@/lib/ugb/calc";
import { EXTINGUISHER_TYPES, STATUS_COLOR } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";

export const Route = createFileRoute("/inventario")({
  head: () => ({
    meta: [
      { title: "Inventário de Equipamentos — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Inventário de extintores, dispositivos do SDAI e luminárias de emergência com status operacional e validades.",
      },
      { property: "og:title", content: "Inventário de Equipamentos — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Controle quantitativo dos equipamentos de combate a incêndio das unidades Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { activeReport, updateReport } = useUgb();

  if (!activeReport)
    return (
      <AppShell>
        <NoReportNotice />
      </AppShell>
    );

  const ext = extinguisherStats(activeReport);
  const sdai = sdaiStats(activeReport);
  const light = lightingStats(activeReport);
  const inv = activeReport.inventory;

  const numberField = (
    group: "sdai" | "lighting",
    field: string,
    label: string,
    value: number,
  ) => (
    <div className="space-y-1.5" key={`${group}-${field}`}>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) =>
          updateReport((draft) => {
            const target = draft.inventory[group] as unknown as Record<string, number>;
            target[field] = Number(e.target.value) || 0;
          })
        }
      />
    </div>
  );

  return (
    <AppShell>
      <PageHeader
        title="Inventário"
        subtitle="Extintores, SDAI e iluminação de emergência da unidade"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Extintores cadastrados" value={ext.total} tone="info" />
        <StatCard
          label="Extintores operacionais"
          value={`${ext.operational} (${ext.operationalPct}%)`}
          tone="good"
        />
        <StatCard
          label="Dispositivos SDAI"
          value={sdai.totalDevices}
          hint={`${sdai.operationalPct}% operacionais`}
          tone="gold"
        />
        <StatCard
          label="Iluminação operacional"
          value={`${light.operationalPct}%`}
          hint={`${light.instalada} luminárias instaladas`}
          tone={light.operationalPct >= 90 ? "good" : "warn"}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Extintores por tipo">
          <Donut data={ext.byType} />
        </Panel>
        <Panel title="Extintores por status">
          <Donut
            data={[
              { name: "Operacional", value: ext.operational, color: STATUS_COLOR.C },
              { name: "Vencido", value: ext.expired, color: STATUS_COLOR.NC },
              { name: "Em manutenção", value: ext.maintenance, color: STATUS_COLOR.PC },
            ]}
          />
        </Panel>
        <Panel title="Extintores por local">
          <Bars data={ext.byLocal.slice(0, 8)} />
        </Panel>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel title="SDAI — quantitativo" description="Dispositivos do sistema de detecção e alarme.">
          <div className="grid gap-3 sm:grid-cols-3">
            {numberField("sdai", "centrais", "Centrais", inv.sdai.centrais)}
            {numberField("sdai", "lacos", "Laços", inv.sdai.lacos)}
            {numberField("sdai", "detectores", "Detectores", inv.sdai.detectores)}
            {numberField("sdai", "acionadores", "Acionadores manuais", inv.sdai.acionadores)}
            {numberField("sdai", "sirenes", "Sirenes", inv.sdai.sirenes)}
            {numberField("sdai", "audiovisuais", "Audiovisuais", inv.sdai.audiovisuais)}
            {numberField("sdai", "operacionais", "Operacionais", inv.sdai.operacionais)}
            {numberField("sdai", "avariados", "Avariados", inv.sdai.avariados)}
            {numberField("sdai", "manutencao", "Em manutenção", inv.sdai.manutencao)}
          </div>
          <div className="mt-4">
            <ProgressLine value={sdai.operationalPct} label="Dispositivos operacionais" />
          </div>
        </Panel>

        <Panel title="Iluminação de emergência" description="Quantitativo de luminárias por situação.">
          <div className="grid gap-3 sm:grid-cols-3">
            {numberField("lighting", "instalada", "Instaladas", inv.lighting.instalada)}
            {numberField("lighting", "operacionais", "Operacionais", inv.lighting.operacionais)}
            {numberField("lighting", "falha", "Com falha", inv.lighting.falha)}
            {numberField("lighting", "queimadas", "Queimadas", inv.lighting.queimadas)}
            {numberField("lighting", "manutencao", "Em manutenção", inv.lighting.manutencao)}
          </div>
          <div className="mt-4">
            <ProgressLine value={light.operationalPct} label="Luminárias operacionais" />
          </div>
        </Panel>
      </div>

      <RecordManager
        title="Extintores"
        addLabel="Novo extintor"
        items={inv.extinguishers}
        onChange={(records) =>
          updateReport((draft) => {
            draft.inventory.extinguishers = records;
          })
        }
        fields={[
          { key: "code", label: "Identificação / nº", type: "text" },
          { key: "type", label: "Tipo", type: "select", options: EXTINGUISHER_TYPES },
          { key: "capacity", label: "Capacidade", type: "text" },
          { key: "local", label: "Local", type: "text" },
          { key: "recharge", label: "Validade da recarga", type: "date" },
          { key: "hydrostatic", label: "Teste hidrostático", type: "date" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ["Operacional", "Vencido", "Em manutenção"],
          },
          { key: "signage", label: "Sinalização e desobstrução", type: "select", options: ["Adequada", "Inadequada"] },
          { key: "notes", label: "Observação", type: "textarea" },
        ]}
        renderSummary={(r) => (
          <div className="space-y-1.5">
            <p className="font-medium">
              {String(r["code"] || "sem código")} · {String(r["type"] || "tipo n/i")}{" "}
              {String(r["capacity"] || "")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Chip>{String(r["local"] || "local n/i")}</Chip>
              <Chip>{String(r["status"] || "status n/i")}</Chip>
              <Chip>recarga {String(r["recharge"] || "—")}</Chip>
            </div>
          </div>
        )}
      />
    </AppShell>
  );
}
