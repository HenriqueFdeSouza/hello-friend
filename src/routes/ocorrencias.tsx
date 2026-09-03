import { createFileRoute } from "@tanstack/react-router";

import { Bars, Donut } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Chip } from "@/components/ugb/RecordManager";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { occurrenceStats } from "@/lib/ugb/calc";
import { PERSON_TYPES } from "@/lib/ugb/constants";

export const Route = createFileRoute("/ocorrencias")({
  head: () => ({
    meta: [
      { title: "Ocorrências e Atendimentos — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Registro de atendimentos e primeiros socorros com avaliação inicial, sinais vitais e encaminhamento.",
      },
      { property: "og:title", content: "Ocorrências e Atendimentos — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Atendimentos realizados pelos Bombeiros Civis no Complexo Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Ocorrências"
      subtitle="Atendimentos e primeiros socorros (módulo opcional)"
      listKey="occurrences"
      addLabel="Novo atendimento"
      fields={[
        { key: "date", label: "Data", type: "date" },
        { key: "time", label: "Hora", type: "time" },
        { key: "local", label: "Local", type: "text" },
        { key: "person", label: "Pessoa", type: "select", options: PERSON_TYPES },
        { key: "type", label: "Tipo da ocorrência", type: "text" },
        { key: "situation", label: "Descrição da situação encontrada", type: "textarea" },
        { key: "assessment", label: "Avaliação inicial", type: "textarea" },
        { key: "pa", label: "Pressão arterial", type: "text" },
        { key: "fc", label: "Frequência cardíaca", type: "text" },
        { key: "fr", label: "Frequência respiratória", type: "text" },
        { key: "spo2", label: "SpO2", type: "text" },
        { key: "glicemia", label: "Glicemia", type: "text" },
        { key: "temp", label: "Temperatura", type: "text" },
        { key: "actions", label: "Ações tomadas", type: "textarea" },
        { key: "equipment", label: "Equipamentos utilizados", type: "textarea" },
        { key: "referral", label: "Encaminhamento", type: "text" },
        { key: "result", label: "Resultado", type: "text" },
        { key: "notes", label: "Observações", type: "textarea" },
      ]}
      renderSummary={(o) => (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>{String(o["date"] || "sem data")}</Chip>
            {o["time"] ? <Chip>{String(o["time"])}</Chip> : null}
            <Chip>{String(o["person"] || "pessoa n/i")}</Chip>
          </div>
          <p className="font-medium">{String(o["type"] || "Tipo não informado")}</p>
          <p className="text-xs text-muted-foreground">
            {String(o["local"] || "local n/i")} · {String(o["referral"] || "sem encaminhamento")}
          </p>
        </div>
      )}
      stats={(report) => {
        const s = occurrenceStats(report);
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total de atendimentos" value={s.total} tone="info" />
            <StatCard label="Tipos distintos" value={s.byType.length} />
            <StatCard label="Locais atendidos" value={s.byLocal.length} />
            <StatCard
              label="Colaboradores"
              value={s.byPerson.find((p) => p.name === "Colaborador")?.value ?? 0}
              tone="gold"
            />
          </div>
        );
      }}
      charts={(report) => {
        const s = occurrenceStats(report);
        return (
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Atendimentos por tipo">
              <Donut data={s.byType} />
            </Panel>
            <Panel title="Por perfil de pessoa">
              <Donut data={s.byPerson} />
            </Panel>
            <Panel title="Atendimentos por dia">
              <Bars data={s.byDay} />
            </Panel>
          </div>
        );
      }}
    />
  );
}
