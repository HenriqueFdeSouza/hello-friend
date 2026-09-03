import { createFileRoute } from "@tanstack/react-router";

import { Bars } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Chip } from "@/components/ugb/RecordManager";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { ACTIVITY_CATEGORIES, SYSTEMS } from "@/lib/ugb/constants";

export const Route = createFileRoute("/atividades")({
  head: () => ({
    meta: [
      { title: "Atividades Mensais — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Registro das atividades mensais dos Bombeiros Civis: inspeções, manutenções, acompanhamentos e helpdesk.",
      },
      { property: "og:title", content: "Atividades Mensais — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Todas as atividades operacionais executadas no período pela UGB Bombeiros Civis.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Atividades"
      subtitle="Atividades operacionais realizadas no mês"
      listKey="activities"
      addLabel="Nova atividade"
      fields={[
        { key: "date", label: "Data", type: "date" },
        { key: "category", label: "Categoria", type: "select", options: ACTIVITY_CATEGORIES },
        { key: "local", label: "Local", type: "text" },
        { key: "system", label: "Sistema relacionado", type: "select", options: SYSTEMS.map((s) => s.name) },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "team", label: "Equipe envolvida", type: "text" },
        { key: "result", label: "Resultado", type: "textarea" },
        { key: "notes", label: "Observações", type: "textarea" },
        { key: "photos", label: "Fotos e documentos", type: "photos" },
      ]}
      renderSummary={(a) => (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>{String(a["date"] || "sem data")}</Chip>
            <Chip>{String(a["category"] || "categoria n/i")}</Chip>
          </div>
          <p className="font-medium">{String(a["description"] || "Sem descrição")}</p>
          <p className="text-xs text-muted-foreground">
            {String(a["local"] || "local n/i")} · {String(a["team"] || "equipe n/i")}
          </p>
        </div>
      )}
      stats={(report) => (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Atividades no mês" value={report.activities.length} tone="info" />
          <StatCard
            label="Manutenções"
            value={report.activities.filter((a) => a["category"] === "Manutenção").length}
            tone="warn"
          />
          <StatCard
            label="Acompanhamentos"
            value={report.activities.filter((a) => a["category"] === "Acompanhamento").length}
          />
          <StatCard
            label="Helpdesk"
            value={report.activities.filter((a) => a["category"] === "Helpdesk").length}
            tone="gold"
          />
        </div>
      )}
      charts={(report) => {
        const map = new Map<string, number>();
        for (const a of report.activities) {
          const k = String(a["category"] ?? "Outro");
          map.set(k, (map.get(k) ?? 0) + 1);
        }
        return (
          <Panel title="Atividades por categoria">
            <Bars data={[...map.entries()].map(([name, value]) => ({ name, value }))} />
          </Panel>
        );
      }}
    />
  );
}
