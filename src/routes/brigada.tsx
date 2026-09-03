import { createFileRoute } from "@tanstack/react-router";

import { Donut } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Chip } from "@/components/ugb/RecordManager";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { brigadeStats, daysUntil } from "@/lib/ugb/calc";
import { BRIGADE_TEAMS } from "@/lib/ugb/constants";

export const Route = createFileRoute("/brigada")({
  head: () => ({
    meta: [
      { title: "Brigada de Emergência — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Cadastro da brigada de incêndio: guarnições, funções, certificações e distribuição por equipe.",
      },
      { property: "og:title", content: "Brigada de Emergência — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Estrutura e certificações da brigada de emergência do Complexo Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Brigada"
      subtitle="Brigadistas, guarnições e certificações"
      listKey="brigade"
      addLabel="Novo brigadista"
      fields={[
        { key: "name", label: "Nome", type: "text" },
        { key: "sector", label: "Setor", type: "text" },
        { key: "role", label: "Função", type: "text" },
        { key: "team", label: "Guarnição", type: "select", options: BRIGADE_TEAMS },
        { key: "certification", label: "Certificação", type: "text" },
        { key: "validity", label: "Validade", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Ativo", "Afastado", "Inativo"] },
      ]}
      renderSummary={(b) => {
        const d = daysUntil(b["validity"]);
        return (
          <div className="space-y-1.5">
            <p className="font-medium">{String(b["name"] || "Sem nome")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Chip>{String(b["team"] || "guarnição n/i")}</Chip>
              <Chip>{String(b["role"] || "função n/i")}</Chip>
              {b["status"] ? <Chip>{String(b["status"])}</Chip> : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {String(b["certification"] || "certificação n/i")}
              {d !== null ? ` · ${d < 0 ? `vencida há ${Math.abs(d)}d` : `válida por ${d}d`}` : ""}
            </p>
          </div>
        );
      }}
      stats={(report) => {
        const s = brigadeStats(report);
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total de brigadistas" value={s.total} tone="info" />
            <StatCard label="Guarnições ativas" value={s.distribution.length} />
            <StatCard label="Certificações a vencer (60d)" value={s.expiring} tone="warn" />
            <StatCard
              label="Combate a incêndio"
              value={s.distribution.find((d) => d.name === "Combate a incêndio")?.value ?? 0}
              tone="bad"
            />
          </div>
        );
      }}
      charts={(report) => {
        const s = brigadeStats(report);
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Distribuição por guarnição">
              <Donut data={s.distribution} />
            </Panel>
            <Panel title="Percentuais por grupo">
              <div className="space-y-3">
                {s.distribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Cadastre brigadistas para ver a distribuição.</p>
                ) : (
                  s.distribution.map((d) => (
                    <div key={d.name}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{d.name}</span>
                        <span className="font-semibold">
                          {d.value} · {d.pct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        );
      }}
    />
  );
}
