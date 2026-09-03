import { createFileRoute } from "@tanstack/react-router";

import { Bars } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Chip } from "@/components/ugb/RecordManager";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { actionStats, daysUntil } from "@/lib/ugb/calc";
import { ACTION_STATUS, PRIORITIES, SYSTEMS } from "@/lib/ugb/constants";

export const Route = createFileRoute("/plano-acao")({
  head: () => ({
    meta: [
      { title: "Plano de Ação e Pendências — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Gestão das pendências de segurança contra incêndio: prioridade, prazo, responsável, tratativa e taxa de resolução.",
      },
      { property: "og:title", content: "Plano de Ação e Pendências — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Acompanhamento das tratativas e pendências críticas do Complexo Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Plano de Ação"
      subtitle="Pendências, tratativas e prazos"
      listKey="actions"
      addLabel="Nova pendência"
      fields={[
        { key: "openDate", label: "Data de abertura", type: "date" },
        { key: "system", label: "Sistema relacionado", type: "select", options: SYSTEMS.map((s) => s.name) },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "risk", label: "Risco", type: "textarea" },
        { key: "recommendation", label: "Recomendação", type: "textarea" },
        { key: "action", label: "Ação necessária", type: "textarea" },
        { key: "priority", label: "Prioridade", type: "select", options: PRIORITIES },
        { key: "responsible", label: "Responsável", type: "text" },
        { key: "company", label: "Empresa terceira", type: "text" },
        { key: "helpdesk", label: "Número Helpdesk", type: "text" },
        { key: "deadline", label: "Data limite", type: "date" },
        { key: "status", label: "Status", type: "select", options: ACTION_STATUS },
        { key: "timeline", label: "Timeline da tratativa", type: "textarea" },
        { key: "photos", label: "Evidências / anexos", type: "photos" },
      ]}
      renderSummary={(a) => {
        const d = daysUntil(a["deadline"]);
        const overdue = d !== null && d < 0 && a["status"] !== "Concluído";
        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Chip>{String(a["priority"] || "prioridade n/i")}</Chip>
              <Chip>{String(a["status"] || "Aberto")}</Chip>
              {a["deadline"] ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{
                    backgroundColor: overdue ? "var(--status-critical)" : "var(--status-progress)",
                  }}
                >
                  {overdue ? `vencida há ${Math.abs(d!)}d` : `prazo em ${d}d`}
                </span>
              ) : null}
            </div>
            <p className="font-medium">{String(a["description"] || "Sem descrição")}</p>
            <p className="text-xs text-muted-foreground">
              {String(a["system"] || "sistema n/i")} · {String(a["responsible"] || "responsável n/i")}
              {a["helpdesk"] ? ` · HD ${String(a["helpdesk"])}` : ""}
            </p>
          </div>
        );
      }}
      stats={(report) => {
        const s = actionStats(report);
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total pendências" value={s.total} />
            <StatCard label="Abertas" value={s.open} tone="warn" />
            <StatCard label="Em andamento" value={s.progress} tone="info" />
            <StatCard label="Vencidas" value={s.overdue} tone="bad" />
            <StatCard label="Críticas" value={s.critical} tone="bad" />
            <StatCard label="Taxa de resolução" value={`${s.resolutionRate}%`} tone="good" />
          </div>
        );
      }}
      charts={(report) => {
        const s = actionStats(report);
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Pendências por prioridade">
              <Bars data={s.byPriority} />
            </Panel>
            <Panel title="Pendências por sistema">
              <Bars data={s.bySystem} color="var(--chart-3)" />
            </Panel>
          </div>
        );
      }}
    />
  );
}
