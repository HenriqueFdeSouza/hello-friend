import { Link, createFileRoute } from "@tanstack/react-router";
import { Camera, ChevronRight, ClipboardList } from "lucide-react";

import { AppShell, NoReportNotice } from "@/components/ugb/AppShell";
import { Donut } from "@/components/ugb/charts";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/ugb/ui-bits";
import { Button } from "@/components/ui/button";
import { compliance } from "@/lib/ugb/calc";
import { STATUS_COLOR, SYSTEMS } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";

export const Route = createFileRoute("/sistemas/")({
  head: () => ({
    meta: [
      { title: "Sistemas Preventivos — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Avaliação de conformidade dos 13 sistemas preventivos de segurança contra incêndio das unidades Beach Park.",
      },
      { property: "og:title", content: "Sistemas Preventivos — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Status, riscos e tratativas de cada sistema preventivo por unidade.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { activeReport, settings, updateReport } = useUgb();

  if (!activeReport)
    return (
      <AppShell>
        <NoReportNotice />
      </AppShell>
    );

  const c = compliance(activeReport, settings.weights);

  return (
    <AppShell>
      <PageHeader
        title="Sistemas Preventivos"
        subtitle="Avaliação de conformidade — clique em um sistema para detalhar situação, riscos e tratativas."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Índice de conformidade" value={`${c.index}%`} tone="gold" />
        <StatCard label="Conformes" value={c.counts.C} tone="good" />
        <StatCard label="Parcialmente" value={c.counts.PC} tone="warn" />
        <StatCard label="Não conformes" value={c.counts.NC} tone="bad" />
        <StatCard label="Não aplicáveis" value={c.counts.NA} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Conformidade dos sistemas" className="lg:col-span-1">
          <Donut
            data={[
              { name: "Conforme", value: c.counts.C, color: STATUS_COLOR.C },
              { name: "Parcialmente", value: c.counts.PC, color: STATUS_COLOR.PC },
              { name: "Não conforme", value: c.counts.NC, color: STATUS_COLOR.NC },
              { name: "Não aplicável", value: c.counts.NA, color: STATUS_COLOR.NA },
            ]}
          />
        </Panel>

        <div className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {SYSTEMS.map((def) => {
              const entry = activeReport.systems[def.key];
              if (!entry) return null;
              const status = entry.applicable === false ? "NA" : entry.status;
              const pendencias = activeReport.actions.filter(
                (a) => a["system"] === def.name && a["status"] !== "Concluído",
              ).length;
              return (
                <div
                  key={def.key}
                  className="relative overflow-hidden rounded-lg border border-border bg-card p-4"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: STATUS_COLOR[status] }}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm leading-snug font-semibold">{def.name}</h3>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-[11px] text-muted-foreground">{entry.subStatus}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ClipboardList className="size-3.5" /> {pendencias} pendências
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Camera className="size-3.5" /> {entry.photos.length} fotos
                    </span>
                    {entry.responsible ? <span>{entry.responsible}</span> : null}
                    {entry.updatedAt ? (
                      <span>atual. {new Date(entry.updatedAt).toLocaleDateString("pt-BR")}</span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/sistemas/$key" params={{ key: def.key }}>
                        Detalhar <ChevronRight className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() =>
                        updateReport((draft) => {
                          const s = draft.systems[def.key];
                          if (!s) return;
                          s.applicable = !s.applicable;
                          s.updatedAt = new Date().toISOString();
                        })
                      }
                    >
                      {entry.applicable ? "Marcar: não se aplica" : "Reativar sistema"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
