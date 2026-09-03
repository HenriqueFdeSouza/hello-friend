import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/ugb/AppShell";
import { Bars, Donut, Trend } from "@/components/ugb/charts";
import {
  AlertLine,
  EmptyState,
  PageHeader,
  Panel,
  ProgressLine,
  StatCard,
  StatusBadge,
} from "@/components/ugb/ui-bits";
import { Button } from "@/components/ui/button";
import {
  actionStats,
  avcbDays,
  brigadeStats,
  completion,
  compliance,
  daysUntil,
  docStats,
  docStatusColor,
  extinguisherStats,
  inspectionStats,
  lightingStats,
  photoCount,
  trainingStats,
} from "@/lib/ugb/calc";
import { MONTHS, STATUS_COLOR, SYSTEMS, UNITS, unitAccent, unitName, unitShort } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Relatório Técnico Mensal — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Dashboard executivo de segurança contra incêndio do Complexo Beach Park: conformidade dos sistemas preventivos, plano de ação e indicadores mensais.",
      },
      { property: "og:title", content: "Relatório Técnico Mensal — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content:
          "Painel em tempo real da conformidade, pendências e evidências das unidades do Complexo Beach Park.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { activeReport, reports, settings, hydrated, newReport } = useUgb();

  if (!hydrated)
    return (
      <AppShell>
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </AppShell>
    );

  if (!activeReport)
    return (
      <AppShell>
        <PageHeader
          title="UGB Bombeiros Civis"
          subtitle="Relatório Técnico Mensal — Complexo Beach Park"
        />
        <Panel
          title="Comece criando o primeiro relatório"
          description="Escolha uma unidade para iniciar o relatório técnico do mês atual."
        >
          <div className="flex flex-wrap gap-2">
            {UNITS.map((u) => (
              <Button
                key={u.id}
                variant="outline"
                onClick={() =>
                  newReport(u.id, new Date().getFullYear(), new Date().getMonth() + 1, false)
                }
              >
                {u.name}
              </Button>
            ))}
          </div>
        </Panel>
      </AppShell>
    );

  const c = compliance(activeReport, settings.weights);
  const act = actionStats(activeReport);
  const insp = inspectionStats(activeReport);
  const tr = trainingStats(activeReport);
  const br = brigadeStats(activeReport);
  const ext = extinguisherStats(activeReport);
  const light = lightingStats(activeReport);
  const docs = docStats(activeReport);
  const photos = photoCount(activeReport);
  const avcb = avcbDays(activeReport);
  const done = completion(activeReport);

  const history = reports
    .filter((r) => r.unitId === activeReport.unitId)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) => ({
      name: `${MONTHS[r.month - 1]?.slice(0, 3)}/${String(r.year).slice(2)}`,
      value: compliance(r, settings.weights).index,
    }));

  const byUnit = UNITS.map((u) => {
    const latest = reports
      .filter((r) => r.unitId === u.id)
      .sort((a, b) => b.id.localeCompare(a.id))[0];
    return {
      name: unitShort(u.id),
      value: latest ? compliance(latest, settings.weights).index : 0,
      color: unitAccent(u.id),
    };
  });

  const criticalSystems = SYSTEMS.map((def) => ({ def, entry: activeReport.systems[def.key] }))
    .filter(
      (s) =>
        s.entry &&
        s.entry.applicable !== false &&
        (s.entry.status === "PC" || s.entry.status === "NC"),
    )
    .slice(0, 6);

  return (
    <AppShell>
      <PageHeader
        title={`${unitName(activeReport.unitId)} — ${MONTHS[activeReport.month - 1]}/${activeReport.year}`}
        subtitle={`Relatório nº ${activeReport.number || "—"} · responsável ${activeReport.responsible || settings.responsible || "não informado"}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/relatorios">
                <FileText className="size-4" /> Relatórios
              </Link>
            </Button>
            <Button onClick={() => window.print()}>
              <FileText className="size-4" /> Gerar PDF
            </Button>
          </div>
        }
      />

      {avcb !== null && avcb < 90 ? (
        <div className="mb-4">
          <AlertLine
            text={
              avcb < 0
                ? `AVCB vencido há ${Math.abs(avcb)} dias — regularização imediata necessária.`
                : `AVCB vence em ${avcb} dias — providenciar renovação.`
            }
          />
        </div>
      ) : null}
      {act.overdue > 0 ? (
        <div className="mb-4">
          <AlertLine text={`${act.overdue} ação(ões) do plano de ação em atraso.`} />
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Índice de conformidade"
          value={`${c.index}%`}
          tone="gold"
          icon={<ShieldCheck className="size-4" />}
        />
        <StatCard label="Sistemas conformes" value={`${c.counts.C}/${c.applicable}`} tone="good" />
        <StatCard label="Não conformidades" value={c.counts.NC} tone="bad" icon={<AlertTriangle className="size-4" />} />
        <StatCard label="Ações abertas" value={act.open + act.progress} tone="warn" />
        <StatCard label="Inspeções no mês" value={insp.total} tone="info" />
        <StatCard
          label="AVCB"
          value={avcb === null ? "—" : `${avcb} dias`}
          hint="dias para vencimento"
          icon={<CalendarClock className="size-4" />}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Conformidade dos sistemas preventivos">
          <Donut
            data={[
              { name: "Conforme", value: c.counts.C, color: STATUS_COLOR.C },
              { name: "Parcialmente", value: c.counts.PC, color: STATUS_COLOR.PC },
              { name: "Não conforme", value: c.counts.NC, color: STATUS_COLOR.NC },
              { name: "Não aplicável", value: c.counts.NA, color: STATUS_COLOR.NA },
            ]}
          />
        </Panel>
        <Panel title="Evolução da conformidade" description="Histórico mensal da unidade ativa.">
          <Trend data={history} />
        </Panel>
        <Panel title="Comparativo entre unidades">
          <Bars data={byUnit} />
        </Panel>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Sistemas que exigem atenção"
          description="Sistemas parcialmente conformes ou não conformes no período."
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/sistemas">
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          {criticalSystems.length === 0 ? (
            <EmptyState text="Nenhum sistema com pendência de conformidade registrada." />
          ) : (
            <ul className="divide-y divide-border">
              {criticalSystems.map(({ def, entry }) => (
                <li key={def.key} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{def.name}</p>
                    <p className="text-xs text-muted-foreground">{entry?.subStatus}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry ? <StatusBadge status={entry.status} /> : null}
                    <Button asChild size="sm" variant="outline">
                      <Link to="/sistemas/$key" params={{ key: def.key }}>
                        Abrir
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Progresso e disponibilidade">
          <div className="space-y-4">
            <ProgressLine value={done} label="Preenchimento do relatório" />
            <ProgressLine value={act.resolutionRate} label="Execução do plano de ação" />
            <ProgressLine value={ext.operationalPct} label={`Extintores operacionais (${ext.total})`} />
            <ProgressLine value={light.operationalPct} label="Iluminação de emergência" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Plano de ação" description="Distribuição por prioridade.">
          <Bars data={act.byPriority} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Abertas: {act.open}</span>
            <span>Em andamento: {act.progress}</span>
            <span>Concluídas: {act.done}</span>
            <span>Críticas: {act.critical}</span>
          </div>
        </Panel>

        <Panel title="Documentação" description="Vencimentos nos próximos 90 dias.">
          {docs.expiring.length + docs.expired.length === 0 ? (
            <EmptyState text="Nenhum documento vencido ou próximo do vencimento." />
          ) : (
            <ul className="space-y-2">
              {[...docs.expired, ...docs.expiring].slice(0, 6).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{String(d["name"] || d["category"] || "Documento")}</span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                    style={{ backgroundColor: docStatusColor(d.days) }}
                  >
                    {d.days === null
                      ? "—"
                      : d.days < 0
                        ? `vencido ${Math.abs(d.days)}d`
                        : `${d.days}d`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Equipe e capacitação">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brigadistas cadastrados</span>
              <span className="font-semibold">{br.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Formações a vencer (60d)</span>
              <span className="font-semibold">{br.expiring}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Treinamentos no mês</span>
              <span className="font-semibold">{tr.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horas de treinamento</span>
              <span className="font-semibold">{tr.hours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Evidências fotográficas</span>
              <span className="font-semibold">
                {photos.total} ({photos.inPdf} no PDF)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Documentos {docs.total ? "cadastrados" : ""}
              </span>
              <span className="font-semibold">{docs.total}</span>
            </div>
            <div className="pt-1">
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/indicadores">
                  Ver painel analítico <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Dias restantes calculados a partir de {new Date().toLocaleDateString("pt-BR")} ·{" "}
        {daysUntil(activeReport.emissionDate) !== null
          ? `emissão em ${new Date(activeReport.emissionDate).toLocaleDateString("pt-BR")}`
          : "emissão não informada"}
      </p>
    </AppShell>
  );
}
