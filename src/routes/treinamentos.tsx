import { createFileRoute } from "@tanstack/react-router";

import { Bars } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Chip } from "@/components/ugb/RecordManager";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { drillStats, trainingStats } from "@/lib/ugb/calc";
import { TRAINING_TYPES } from "@/lib/ugb/constants";

export const Route = createFileRoute("/treinamentos")({
  head: () => ({
    meta: [
      { title: "Treinamentos e Simulados — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Registro de treinamentos, DGS, simulados e reciclagens com carga horária, participações e evolução.",
      },
      { property: "og:title", content: "Treinamentos e Simulados — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Capacitação da brigada e simulados de emergência do Complexo Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Treinamentos"
      subtitle="Treinamentos, DGS e simulados do período"
      listKey="trainings"
      addLabel="Novo treinamento"
      fields={[
        { key: "date", label: "Data", type: "date" },
        { key: "theme", label: "Tema", type: "text" },
        { key: "type", label: "Tipo", type: "select", options: TRAINING_TYPES },
        { key: "instructor", label: "Instrutor", type: "text" },
        { key: "participants", label: "Participantes", type: "number" },
        { key: "hours", label: "Carga horária (h)", type: "number" },
        { key: "description", label: "Descrição", type: "textarea" },
        { key: "result", label: "Resultado", type: "textarea" },
        { key: "attendance", label: "Lista de presença (nomes)", type: "textarea" },
        { key: "responseTime", label: "Tempo de resposta (min) — simulados", type: "number" },
        { key: "evacuationTime", label: "Tempo de evacuação (min) — simulados", type: "number" },
        { key: "photos", label: "Fotos e documentos", type: "photos" },
      ]}
      renderSummary={(t) => (
        <div className="space-y-1.5">
          <p className="font-medium">{String(t["theme"] || "Sem tema")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Chip>{String(t["date"] || "sem data")}</Chip>
            <Chip>{String(t["type"] || "tipo n/i")}</Chip>
            <Chip>{String(t["participants"] || 0)} participantes</Chip>
            <Chip>{String(t["hours"] || 0)}h</Chip>
          </div>
          <p className="text-xs text-muted-foreground">
            Instrutor: {String(t["instructor"] || "não informado")}
          </p>
        </div>
      )}
      stats={(report) => {
        const s = trainingStats(report);
        const d = drillStats(report);
        const simulados = report.trainings.filter((t) => t["type"] === "Simulado").length;
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Treinamentos" value={s.total} tone="info" />
            <StatCard label="Horas de treinamento" value={s.hours} tone="gold" />
            <StatCard label="Participações" value={s.participants} />
            <StatCard label="Média de participantes" value={s.avgParticipants} />
            <StatCard label="DGS realizados" value={s.dgs} tone="good" />
            <StatCard
              label="Simulados"
              value={simulados + d.total}
              hint={d.avgResponse ? `tempo médio ${d.avgResponse} min` : undefined}
              tone="warn"
            />
          </div>
        );
      }}
      charts={(report) => {
        const map = new Map<string, number>();
        for (const t of report.trainings) {
          const k = String(t["type"] ?? "Outro");
          map.set(k, (map.get(k) ?? 0) + 1);
        }
        return (
          <Panel title="Treinamentos por tipo">
            <Bars data={[...map.entries()].map(([name, value]) => ({ name, value }))} />
          </Panel>
        );
      }}
    />
  );
}
