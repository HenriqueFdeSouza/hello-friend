import { createFileRoute } from "@tanstack/react-router";

import { Bars } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Chip } from "@/components/ugb/RecordManager";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { pumpStats } from "@/lib/ugb/calc";
import { PUMP_MODES, PUMP_TYPES, RESULTS } from "@/lib/ugb/constants";

export const Route = createFileRoute("/testes")({
  head: () => ({
    meta: [
      { title: "Teste Operacional das Bombas — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Registro dos testes operacionais das bombas do sistema de incêndio com pressões, modo de operação e conformidade.",
      },
      { property: "og:title", content: "Teste Operacional das Bombas — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Controle mensal dos testes de bombas de incêndio do Complexo Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Testes de Bombas"
      subtitle="Teste operacional das bombas do sistema de incêndio"
      listKey="pumpTests"
      addLabel="Novo teste"
      fields={[
        { key: "date", label: "Data", type: "date" },
        { key: "time", label: "Horário", type: "time" },
        { key: "local", label: "Local", type: "text" },
        { key: "block", label: "Bloco", type: "text" },
        { key: "system", label: "Sistema", type: "text" },
        { key: "pump", label: "Bomba", type: "text" },
        { key: "pumpType", label: "Tipo da bomba", type: "select", options: PUMP_TYPES },
        { key: "power", label: "Potência (CV)", type: "number" },
        { key: "mode", label: "Modo", type: "select", options: PUMP_MODES },
        { key: "pInitial", label: "Pressão inicial (mca/bar)", type: "text" },
        { key: "pStart", label: "Pressão de acionamento", type: "text" },
        { key: "pWork", label: "Pressão de trabalho", type: "text" },
        { key: "pStop", label: "Pressão de desligamento", type: "text" },
        { key: "pRelief", label: "Pressão da válvula de alívio", type: "text" },
        { key: "duration", label: "Tempo de teste (min)", type: "number" },
        { key: "result", label: "Resultado", type: "select", options: RESULTS },
        { key: "anomaly", label: "Anomalia encontrada", type: "textarea" },
        { key: "action", label: "Ação realizada", type: "textarea" },
        { key: "notes", label: "Observação", type: "textarea" },
        { key: "photos", label: "Registro fotográfico", type: "photos" },
      ]}
      renderSummary={(t) => (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>{String(t["date"] || "sem data")}</Chip>
            <Chip>{String(t["pumpType"] || "tipo n/i")}</Chip>
            <Chip>{String(t["mode"] || "modo n/i")}</Chip>
            {t["result"] ? <Chip>{String(t["result"])}</Chip> : null}
          </div>
          <p className="font-medium">
            {String(t["pump"] || "Bomba")} · {String(t["local"] || "local n/i")}
          </p>
          <p className="text-xs text-muted-foreground">
            Trabalho: {String(t["pWork"] || "—")} · Acionamento: {String(t["pStart"] || "—")} ·
            Desligamento: {String(t["pStop"] || "—")}
          </p>
        </div>
      )}
      stats={(report) => {
        const s = pumpStats(report);
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <StatCard label="Bombas testadas" value={s.total} tone="info" />
            <StatCard label="Conformes" value={s.conform} tone="good" />
            <StatCard label="Parcialmente" value={s.partial} tone="warn" />
            <StatCard label="Com falha" value={s.failed} tone="bad" />
            <StatCard label="Em automático" value={s.auto} />
            <StatCard label="Conformidade" value={`${s.conformityPct}%`} tone="gold" />
          </div>
        );
      }}
      charts={(report) => {
        const s = pumpStats(report);
        return (
          <Panel title="Resultados dos testes">
            <Bars
              data={[
                { name: "Conformes", value: s.conform, color: "var(--status-c)" },
                { name: "Parciais", value: s.partial, color: "var(--status-pc)" },
                { name: "Não conformes", value: s.failed, color: "var(--status-nc)" },
                { name: "Automático", value: s.auto, color: "var(--status-progress)" },
                { name: "Manual", value: s.manual, color: "var(--graphite)" },
              ]}
            />
          </Panel>
        );
      }}
    />
  );
}
