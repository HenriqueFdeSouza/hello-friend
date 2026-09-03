import { createFileRoute } from "@tanstack/react-router";

import { AppShell, NoReportNotice } from "@/components/ugb/AppShell";
import { Bars, Donut, Trend } from "@/components/ugb/charts";
import { PageHeader, Panel, ProgressLine, StatCard } from "@/components/ugb/ui-bits";
import {
  actionStats,
  brigadeStats,
  compliance,
  extinguisherStats,
  inspectionStats,
  lightingStats,
  pct,
  photoCount,
  pumpStats,
  sdaiStats,
  trainingStats,
} from "@/lib/ugb/calc";
import { MONTHS, STATUS_COLOR, UNITS, unitAccent, unitShort } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";

export const Route = createFileRoute("/indicadores")({
  head: () => ({
    meta: [
      { title: "Indicadores e Análises — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Painel analítico com evolução da conformidade, comparativo entre unidades e indicadores operacionais consolidados.",
      },
      { property: "og:title", content: "Indicadores e Análises — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "KPIs de segurança contra incêndio do Complexo Beach Park mês a mês.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { activeReport, reports, settings } = useUgb();

  if (!activeReport)
    return (
      <AppShell>
        <NoReportNotice />
      </AppShell>
    );

  const c = compliance(activeReport, settings.weights);
  const act = actionStats(activeReport);
  const insp = inspectionStats(activeReport);
  const tr = trainingStats(activeReport);
  const br = brigadeStats(activeReport);
  const pump = pumpStats(activeReport);
  const ext = extinguisherStats(activeReport);
  const sdai = sdaiStats(activeReport);
  const light = lightingStats(activeReport);
  const photos = photoCount(activeReport);

  const history = reports
    .filter((r) => r.unitId === activeReport.unitId)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) => ({
      name: `${MONTHS[r.month - 1]?.slice(0, 3)}/${String(r.year).slice(2)}`,
      value: compliance(r, settings.weights).index,
    }));

  const byUnit = UNITS.map((u) => {
    const list = reports.filter((r) => r.unitId === u.id);
    const latest = [...list].sort((a, b) => b.id.localeCompare(a.id))[0];
    return {
      name: unitShort(u.id),
      value: latest ? compliance(latest, settings.weights).index : 0,
      color: unitAccent(u.id),
    };
  });

  return (
    <AppShell>
      <PageHeader
        title="Indicadores"
        subtitle="Painel analítico consolidado do período e evolução histórica"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Conformidade" value={`${c.index}%`} tone="gold" />
        <StatCard label="Ações concluídas" value={`${act.resolutionRate}%`} tone="good" />
        <StatCard label="Ações em atraso" value={act.overdue} tone="bad" />
        <StatCard label="Inspeções" value={insp.total} tone="info" />
        <StatCard label="Horas de treinamento" value={tr.hours} />
        <StatCard label="Evidências fotográficas" value={photos.total} hint={`${photos.inPdf} no PDF`} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Evolução da conformidade" description="Histórico da unidade ativa." className="lg:col-span-2">
          <Trend data={history} />
        </Panel>
        <Panel title="Status dos sistemas">
          <Donut
            data={[
              { name: "Conforme", value: c.counts.C, color: STATUS_COLOR.C },
              { name: "Parcialmente", value: c.counts.PC, color: STATUS_COLOR.PC },
              { name: "Não conforme", value: c.counts.NC, color: STATUS_COLOR.NC },
              { name: "Não aplicável", value: c.counts.NA, color: STATUS_COLOR.NA },
            ]}
          />
        </Panel>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Comparativo entre unidades" description="Conformidade do último relatório de cada unidade.">
          <Bars data={byUnit} />
        </Panel>
        <Panel title="Plano de ação por prioridade">
          <Bars data={act.byPriority} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Disponibilidade dos equipamentos">
          <div className="space-y-4">
            <ProgressLine value={ext.operationalPct} label={`Extintores operacionais (${ext.total})`} />
            <ProgressLine value={sdai.availabilityPct} label="Dispositivos SDAI operacionais" />
            <ProgressLine value={light.operationalPct} label={`Iluminação de emergência (${light.total})`} />
            <ProgressLine value={pump.conformityPct} label={`Testes de bomba aprovados (${pump.total})`} />
          </div>
        </Panel>
        <Panel title="Capacitação e brigada">
          <div className="space-y-4">
            <ProgressLine value={pct(br.total - br.expiring, br.total)} label={`Brigadistas com formação válida (${br.total})`} />
            <ProgressLine
              value={Math.min(tr.hours, 100)}
              label={`Horas de treinamento no mês (${tr.hours}h)`}
            />
            <ProgressLine
              value={Math.min(tr.participants, 100)}
              label={`Participações registradas (${tr.participants})`}
            />
            <ProgressLine value={act.resolutionRate} label="Execução do plano de ação" />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
