import { createFileRoute } from "@tanstack/react-router";

import { Bars } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Chip } from "@/components/ugb/RecordManager";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { inspectionStats } from "@/lib/ugb/calc";
import { INSPECTION_SYSTEMS, RESULTS } from "@/lib/ugb/constants";

export const Route = createFileRoute("/inspecoes")({
  head: () => ({
    meta: [
      { title: "Inspeções Preventivas — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Registro de inspeções preventivas por sistema, com não conformidades, evidências e estatísticas automáticas.",
      },
      { property: "og:title", content: "Inspeções Preventivas — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Inspeções mensais dos sistemas de segurança contra incêndio do Complexo Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Inspeções"
      subtitle="Inspeções preventivas realizadas no mês"
      listKey="inspections"
      addLabel="Nova inspeção"
      fields={[
        { key: "date", label: "Data", type: "date" },
        { key: "system", label: "Sistema", type: "select", options: INSPECTION_SYSTEMS },
        { key: "local", label: "Local", type: "text" },
        { key: "responsible", label: "Responsável", type: "text" },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "result", label: "Resultado", type: "select", options: RESULTS },
        { key: "nonConformities", label: "Não conformidades identificadas", type: "textarea" },
        { key: "actions", label: "Ações realizadas", type: "textarea" },
        { key: "notes", label: "Observações", type: "textarea" },
        { key: "photos", label: "Fotos", type: "photos" },
      ]}
      renderSummary={(i) => (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>{String(i["date"] || "sem data")}</Chip>
            <Chip>{String(i["system"] || "sistema não informado")}</Chip>
            {i["result"] ? <Chip>{String(i["result"])}</Chip> : null}
          </div>
          <p className="font-medium">{String(i["local"] || "Local não informado")}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{String(i["description"] ?? "")}</p>
        </div>
      )}
      stats={(report) => {
        const s = inspectionStats(report);
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Inspeções no mês" value={s.total} tone="info" />
            <StatCard label="Sistemas inspecionados" value={s.bySystem.length} />
            <StatCard
              label="Com não conformidade"
              value={report.inspections.filter((i) => i["result"] !== "Conforme" && i["result"]).length}
              tone="warn"
            />
            <StatCard
              label="Fotos anexadas"
              value={report.inspections.reduce(
                (a, i) => a + ((i["photos"] as unknown[])?.length ?? 0),
                0,
              )}
              tone="gold"
            />
          </div>
        );
      }}
      charts={(report) => (
        <Panel title="Inspeções por sistema">
          <Bars data={inspectionStats(report).bySystem} />
        </Panel>
      )}
    />
  );
}
