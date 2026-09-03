import { Link, createFileRoute } from "@tanstack/react-router";
import { Copy, FilePlus2, FileText, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/ugb/AppShell";
import { EmptyState, PageHeader, Panel, ProgressLine, StatCard } from "@/components/ugb/ui-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { completion, compliance } from "@/lib/ugb/calc";
import { MONTHS, REPORT_STATUS_LABEL, UNITS, unitName } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";
import type { ReportStatus } from "@/lib/ugb/types";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios Mensais — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Crie, gerencie e imprima os relatórios técnicos mensais por unidade do Complexo Beach Park.",
      },
      { property: "og:title", content: "Relatórios Mensais — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Histórico de relatórios técnicos mensais com progresso e conformidade.",
      },
    ],
  }),
  component: Page,
});

const now = new Date();

function Page() {
  const {
    reports,
    settings,
    activeReport,
    newReport,
    deleteReport,
    duplicateReport,
    setActiveReportId,
    updateReport,
  } = useUgb();

  const [unit, setUnit] = useState(settings.defaultUnit);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [fromPrevious, setFromPrevious] = useState(true);

  const sorted = [...reports].sort((a, b) => b.id.localeCompare(a.id));
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <AppShell>
      <PageHeader
        title="Relatórios"
        subtitle="Gestão dos relatórios técnicos mensais por unidade"
        actions={
          activeReport ? (
            <Button variant="outline" asChild>
              <Link to="/relatorio-pdf">
                <FileText className="size-4" /> Gerar PDF do relatório ativo
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Relatórios salvos" value={reports.length} tone="info" />
        <StatCard
          label="Finalizados"
          value={reports.filter((r) => r.status === "finalizado").length}
          tone="good"
        />
        <StatCard
          label="Em rascunho"
          value={reports.filter((r) => r.status === "rascunho").length}
          tone="warn"
        />
        <StatCard label="Unidades cobertas" value={new Set(reports.map((r) => r.unitId)).size} tone="gold" />
      </div>

      <Panel
        title="Novo relatório"
        description="Crie um novo período. Ao clonar, os dados cadastrais do mês anterior são reaproveitados."
        className="mb-6"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Unidade</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mês</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ano</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={fromPrevious} onCheckedChange={setFromPrevious} id="clone" />
              <Label htmlFor="clone" className="text-xs">
                Clonar do mês anterior
              </Label>
            </div>
            <Button onClick={() => newReport(unit, year, month, fromPrevious)}>
              <FilePlus2 className="size-4" /> Criar relatório
            </Button>
          </div>
        </div>
      </Panel>

      {sorted.length === 0 ? (
        <EmptyState text="Nenhum relatório criado ainda. Use o formulário acima para começar." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {sorted.map((r) => {
            const c = compliance(r, settings.weights);
            const done = completion(r);
            const isActive = activeReport?.id === r.id;
            return (
              <div
                key={r.id}
                className={`rounded-lg border bg-card p-4 ${isActive ? "border-primary ring-1 ring-primary/30" : "border-border"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {unitName(r.unitId)} — {MONTHS[r.month - 1]}/{r.year}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nº {r.number || "—"} · atualizado{" "}
                      {new Date(r.updatedAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Select
                    value={r.status}
                    onValueChange={(v) => {
                      setActiveReportId(r.id);
                      updateReport((draft) => void (draft.status = v as ReportStatus));
                    }}
                  >
                    <SelectTrigger className="h-8 w-[150px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(REPORT_STATUS_LABEL) as ReportStatus[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {REPORT_STATUS_LABEL[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3 space-y-2">
                  <ProgressLine value={done} label="Preenchimento" />
                  <ProgressLine value={c.index} label="Conformidade" />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setActiveReportId(r.id)}
                  >
                    {isActive ? "Relatório ativo" : "Abrir"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicateReport(r.id)}>
                    <Copy className="size-3.5" /> Duplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (window.confirm("Excluir este relatório? A ação não pode ser desfeita."))
                        deleteReport(r.id);
                    }}
                  >
                    <Trash2 className="size-3.5" /> Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
