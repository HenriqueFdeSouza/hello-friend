import { createFileRoute } from "@tanstack/react-router";

import { Bars } from "@/components/ugb/charts";
import { ModulePage } from "@/components/ugb/ModulePage";
import { Panel, StatCard } from "@/components/ugb/ui-bits";
import { daysUntil, docStatusColor, docStats } from "@/lib/ugb/calc";
import { DOC_CATEGORIES } from "@/lib/ugb/constants";

export const Route = createFileRoute("/documentacao")({
  head: () => ({
    meta: [
      { title: "Central de Documentos — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Controle de AVCB, PPCIP, PAE, laudos e certificados com cálculo automático de dias para vencimento.",
      },
      { property: "og:title", content: "Central de Documentos — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Validade da documentação legal de segurança contra incêndio do Complexo Beach Park.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePage
      title="Documentação"
      subtitle="Central de documentos e validades"
      listKey="documents"
      addLabel="Novo documento"
      fields={[
        { key: "category", label: "Categoria", type: "select", options: DOC_CATEGORIES },
        { key: "name", label: "Documento", type: "text" },
        { key: "number", label: "Número", type: "text" },
        { key: "issueDate", label: "Data de emissão", type: "date" },
        { key: "validity", label: "Validade", type: "date" },
        { key: "responsible", label: "Responsável", type: "text" },
        { key: "reference", label: "Arquivo / referência local", type: "text" },
        { key: "link", label: "Link", type: "text" },
        { key: "notes", label: "Observação", type: "textarea" },
      ]}
      renderSummary={(d) => {
        const days = daysUntil(d["validity"]);
        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase">
                {String(d["category"] || "categoria")}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                style={{ backgroundColor: docStatusColor(days) }}
              >
                {days === null
                  ? "sem validade"
                  : days < 0
                    ? `vencido há ${Math.abs(days)} dias`
                    : `${days} dias restantes`}
              </span>
            </div>
            <p className="font-medium">{String(d["name"] || "Documento sem nome")}</p>
            <p className="text-xs text-muted-foreground">
              Nº {String(d["number"] || "—")} · emissão {String(d["issueDate"] || "—")} · validade{" "}
              {String(d["validity"] || "—")}
            </p>
          </div>
        );
      }}
      stats={(report) => {
        const s = docStats(report);
        const avcb = s.rows.filter((r) => r["category"] === "AVCB");
        const avcbDays = avcb.map((a) => a.days).filter((v): v is number => v !== null);
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Documentos cadastrados" value={s.total} />
            <StatCard
              label="AVCB — dias restantes"
              value={avcbDays.length ? Math.min(...avcbDays) : "—"}
              tone={avcbDays.length && Math.min(...avcbDays) < 60 ? "bad" : "good"}
            />
            <StatCard label="Vencendo em 90 dias" value={s.expiring.length} tone="warn" />
            <StatCard label="Vencidos" value={s.expired.length} tone="bad" />
          </div>
        );
      }}
      charts={(report) => {
        const s = docStats(report);
        return (
          <Panel title="Documentos próximos do vencimento" description="Ordenados por dias restantes.">
            {s.expiring.length + s.expired.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum documento vencido ou a vencer nos próximos 90 dias.
              </p>
            ) : (
              <Bars
                data={[...s.expired, ...s.expiring]
                  .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
                  .map((d) => ({
                    name: String(d["name"] || d["category"] || "documento"),
                    value: Math.max(d.days ?? 0, 0),
                    color: docStatusColor(d.days),
                  }))}
              />
            )}
          </Panel>
        );
      }}
    />
  );
}
