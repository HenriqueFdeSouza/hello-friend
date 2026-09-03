import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell, NoReportNotice } from "@/components/ugb/AppShell";
import { PageHeader, Panel, PhotoManager, StatusBadge } from "@/components/ugb/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_LABEL, SUB_STATUS, SYSTEMS } from "@/lib/ugb/constants";
import type { ComplianceStatus, SystemEntry } from "@/lib/ugb/types";
import { useUgb } from "@/lib/ugb/store";

export const Route = createFileRoute("/sistemas/$key")({
  head: () => ({
    meta: [
      { title: "Detalhe do Sistema Preventivo — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Situação encontrada, riscos, recomendações técnicas, tratativas e evidências fotográficas do sistema preventivo.",
      },
      { property: "og:title", content: "Detalhe do Sistema Preventivo — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Registro técnico detalhado do sistema preventivo avaliado no período.",
      },
    ],
  }),
  component: Page,
});

const TEXT_FIELDS: { key: keyof SystemEntry; label: string; rows?: number }[] = [
  { key: "situation", label: "Situação encontrada", rows: 4 },
  { key: "description", label: "Descrição técnica / características", rows: 4 },
  { key: "changes", label: "Alterações no período", rows: 3 },
  { key: "risks", label: "Riscos identificados", rows: 3 },
  { key: "recommendation", label: "Recomendação técnica", rows: 3 },
  { key: "action", label: "Ação necessária", rows: 3 },
  { key: "treatment", label: "Tratativa / andamento", rows: 3 },
  { key: "helpdesk", label: "Helpdesk / chamados abertos", rows: 2 },
  { key: "docs", label: "Documentos relacionados", rows: 2 },
  { key: "notes", label: "Observações", rows: 3 },
];

function Page() {
  const { key } = Route.useParams();
  const { activeReport, updateReport } = useUgb();
  const def = SYSTEMS.find((s) => s.key === key);

  if (!activeReport)
    return (
      <AppShell>
        <NoReportNotice />
      </AppShell>
    );

  const entry = activeReport.systems[key];

  if (!def || !entry)
    return (
      <AppShell>
        <Panel title="Sistema não encontrado">
          <Button asChild variant="outline" size="sm">
            <Link to="/sistemas">Voltar aos sistemas</Link>
          </Button>
        </Panel>
      </AppShell>
    );

  function patch(fn: (s: SystemEntry) => void) {
    updateReport((draft) => {
      const s = draft.systems[key];
      if (!s) return;
      fn(s);
      s.updatedAt = new Date().toISOString();
    });
  }

  return (
    <AppShell>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/sistemas">
            <ArrowLeft className="size-4" /> Sistemas preventivos
          </Link>
        </Button>
      </div>

      <PageHeader
        title={def.name}
        subtitle={`Referência normativa: ${def.norm}`}
        actions={<StatusBadge status={entry.applicable === false ? "NA" : entry.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Classificação" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status de conformidade</Label>
              <Select
                value={entry.status}
                onValueChange={(v) => patch((s) => void (s.status = v as ComplianceStatus))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as ComplianceStatus[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {STATUS_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Sub-status</Label>
              <Select value={entry.subStatus} onValueChange={(v) => patch((s) => void (s.subStatus = v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUB_STATUS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <Input
                  value={entry.responsible}
                  onChange={(e) => patch((s) => void (s.responsible = e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Empresa</Label>
                <Input
                  value={entry.company}
                  onChange={(e) => patch((s) => void (s.company = e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prazo</Label>
                <Input
                  type="date"
                  value={entry.deadline}
                  onChange={(e) => patch((s) => void (s.deadline = e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Norma aplicável</Label>
                <Input
                  value={entry.norm}
                  placeholder={def.norm}
                  onChange={(e) => patch((s) => void (s.norm = e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Links / referências</Label>
              <Input value={entry.links} onChange={(e) => patch((s) => void (s.links = e.target.value))} />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => patch((s) => void (s.applicable = !s.applicable))}
            >
              {entry.applicable ? "Marcar como não aplicável" : "Reativar sistema"}
            </Button>
          </div>
        </Panel>

        <div className="space-y-4 lg:col-span-2">
          <Panel title="Registro técnico">
            <div className="grid gap-4 sm:grid-cols-2">
              {TEXT_FIELDS.map((f) => (
                <div key={String(f.key)} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  <Textarea
                    rows={f.rows ?? 3}
                    value={String(entry[f.key] ?? "")}
                    onChange={(e) =>
                      patch((s) => {
                        (s as unknown as Record<string, unknown>)[String(f.key)] = e.target.value;
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Evidências fotográficas"
            description="As fotos marcadas para o PDF entram no relatório final."
          >
            <PhotoManager
              photos={entry.photos}
              onChange={(photos) => patch((s) => void (s.photos = photos))}
            />
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
