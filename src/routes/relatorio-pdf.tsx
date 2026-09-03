import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  actionStats,
  avcbDays,
  brigadeStats,
  compliance,
  daysUntil,
  docStats,
  extinguisherStats,
  inspectionStats,
  lightingStats,
  pumpStats,
  sdaiStats,
  trainingStats,
} from "@/lib/ugb/calc";
import { MONTHS, STATUS_LABEL, SYSTEMS, unitName } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";
import type { Photo, Report } from "@/lib/ugb/types";

export const Route = createFileRoute("/relatorio-pdf")({
  head: () => ({
    meta: [
      { title: "Relatório Técnico para Impressão — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Versão imprimível do relatório técnico mensal de segurança contra incêndio, pronta para exportação em PDF.",
      },
      { property: "og:title", content: "Relatório Técnico para Impressão — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Documento consolidado com sistemas, indicadores, plano de ação e evidências.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 border-b-2 border-primary pb-1 text-sm font-bold tracking-wide uppercase">
        {title}
      </h2>
      <div className="text-[11px] leading-relaxed">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0)
    return <p className="text-[11px] text-muted-foreground">Nenhum registro no período.</p>;
  return (
    <table className="w-full border-collapse text-[10px]">
      <thead>
        <tr className="bg-secondary">
          {head.map((h) => (
            <th key={h} className="border border-border px-1.5 py-1 text-left font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              <td key={j} className="border border-border px-1.5 py-1 align-top">
                {String(cell ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function collectPhotos(report: Report): Photo[] {
  const all = [
    ...report.photos,
    ...SYSTEMS.flatMap((s) => report.systems[s.key]?.photos ?? []),
  ];
  return all.filter((p) => p.inPdf);
}

function Page() {
  const { activeReport, settings, hydrated } = useUgb();

  useEffect(() => {
    if (hydrated && activeReport) {
      const t = window.setTimeout(() => window.print(), 900);
      return () => window.clearTimeout(t);
    }
    return;
  }, [hydrated, activeReport]);

  if (!hydrated) return <div className="p-10 text-sm">Carregando relatório…</div>;

  if (!activeReport)
    return (
      <div className="p-10 text-sm">
        Nenhum relatório ativo.{" "}
        <Link to="/relatorios" className="text-primary underline">
          Selecione um relatório
        </Link>
        .
      </div>
    );

  const r = activeReport;
  const c = compliance(r, settings.weights);
  const act = actionStats(r);
  const insp = inspectionStats(r);
  const tr = trainingStats(r);
  const br = brigadeStats(r);
  const pump = pumpStats(r);
  const ext = extinguisherStats(r);
  const sdai = sdaiStats(r);
  const light = lightingStats(r);
  const docs = docStats(r);
  const avcb = avcbDays(r);
  const photos = collectPhotos(r);

  return (
    <div className="print-doc mx-auto max-w-[880px] bg-white p-8 text-foreground">
      <div className="no-print mb-6 flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <ArrowLeft className="size-4" /> Voltar ao dashboard
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="size-4" /> Imprimir / salvar PDF
        </Button>
      </div>

      <header className="mb-6 border-b-4 border-primary pb-4">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
          UGB Bombeiros Civis — Complexo Beach Park
        </p>
        <h1 className="mt-1 text-2xl font-bold uppercase">Relatório Técnico Mensal</h1>
        <p className="mt-1 text-sm">
          Segurança Contra Incêndio e Pânico — {unitName(r.unitId)} —{" "}
          {MONTHS[r.month - 1]}/{r.year}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] sm:grid-cols-4">
          <span>
            <strong>Nº:</strong> {r.number || "—"}
          </span>
          <span>
            <strong>Emissão:</strong>{" "}
            {r.emissionDate ? new Date(r.emissionDate).toLocaleDateString("pt-BR") : "—"}
          </span>
          <span>
            <strong>Responsável:</strong> {r.responsible || settings.responsible || "—"}
          </span>
          <span>
            <strong>Função:</strong> {r.role || settings.role || "—"}
          </span>
        </div>
      </header>

      <Section title="1. Sumário executivo">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Índice de conformidade", `${c.index}%`],
            ["Sistemas conformes", `${c.counts.C}/${c.applicable}`],
            ["Não conformidades", c.counts.NC],
            ["Ações pendentes", act.open + act.progress],
            ["Ações em atraso", act.overdue],
            ["Inspeções realizadas", insp.total],
            ["Horas de treinamento", `${tr.hours}h`],
            ["AVCB (dias)", avcb === null ? "—" : avcb],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded border border-border p-2">
              <p className="text-[9px] tracking-wide uppercase opacity-70">{label}</p>
              <p className="text-base font-bold">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="2. Sistemas preventivos avaliados">
        <Table
          head={["Sistema", "Status", "Sub-status", "Situação encontrada", "Recomendação", "Prazo"]}
          rows={SYSTEMS.filter((s) => r.systems[s.key]).map((s) => {
            const e = r.systems[s.key]!;
            return [
              s.name,
              e.applicable === false ? "Não Aplicável" : STATUS_LABEL[e.status],
              e.subStatus,
              e.situation,
              e.recommendation,
              e.deadline,
            ];
          })}
        />
      </Section>

      <Section title="3. Inventário de equipamentos">
        <div className="mb-2 grid grid-cols-3 gap-3">
          <p>
            <strong>Extintores:</strong> {ext.total} ({ext.operationalPct}% operacionais)
          </p>
          <p>
            <strong>SDAI:</strong> {sdai.total} dispositivos ({sdai.availabilityPct}% operacionais)
          </p>
          <p>
            <strong>Iluminação:</strong> {light.total} luminárias ({light.operationalPct}%
            operacionais)
          </p>
        </div>
        <Table
          head={["Identificação", "Tipo", "Capacidade", "Local", "Recarga", "Hidrostático", "Status"]}
          rows={r.inventory.extinguishers.map((e) => [
            String(e["code"] ?? ""),
            String(e["type"] ?? ""),
            String(e["capacity"] ?? ""),
            String(e["local"] ?? ""),
            String(e["recharge"] ?? ""),
            String(e["hydrostatic"] ?? ""),
            String(e["status"] ?? ""),
          ])}
        />
      </Section>

      <Section title="4. Inspeções realizadas">
        <Table
          head={["Data", "Sistema", "Local", "Resultado", "Observação"]}
          rows={r.inspections.map((i) => [
            String(i["date"] ?? ""),
            String(i["system"] ?? ""),
            String(i["local"] ?? ""),
            String(i["result"] ?? ""),
            String(i["notes"] ?? ""),
          ])}
        />
      </Section>

      <Section title="5. Testes operacionais de bombas">
        <p className="mb-2">
          <strong>{pump.total}</strong> testes registrados — {pump.conformityPct}% conformes.
        </p>
        <Table
          head={["Data", "Bomba", "Acionamento", "Pressão", "Resultado", "Observação"]}
          rows={r.pumpTests.map((t) => [
            String(t["date"] ?? ""),
            String(t["pump"] ?? ""),
            String(t["mode"] ?? ""),
            String(t["pressure"] ?? ""),
            String(t["result"] ?? ""),
            String(t["notes"] ?? ""),
          ])}
        />
      </Section>

      <Section title="6. Plano de ação">
        <Table
          head={["Item", "Sistema", "Prioridade", "Responsável", "Prazo", "Status", "Dias"]}
          rows={r.actions.map((a) => {
            const d = daysUntil(a["deadline"]);
            return [
              String(a["description"] ?? ""),
              String(a["system"] ?? ""),
              String(a["priority"] ?? ""),
              String(a["responsible"] ?? ""),
              String(a["deadline"] ?? ""),
              String(a["status"] ?? ""),
              d === null ? "—" : d,
            ];
          })}
        />
      </Section>

      <Section title="7. Brigada, treinamentos e simulados">
        <p className="mb-2">
          <strong>{br.total}</strong> brigadistas cadastrados · {br.expiring} formações a vencer em 60
          dias · {tr.total} treinamentos ({tr.hours}h, {tr.participants} participações).
        </p>
        <Table
          head={["Data", "Tema", "Tipo", "Instrutor", "Participantes", "Horas"]}
          rows={r.trainings.map((t) => [
            String(t["date"] ?? ""),
            String(t["theme"] ?? ""),
            String(t["type"] ?? ""),
            String(t["instructor"] ?? ""),
            String(t["participants"] ?? ""),
            String(t["hours"] ?? ""),
          ])}
        />
      </Section>

      <Section title="8. Documentação legal">
        <Table
          head={["Categoria", "Documento", "Número", "Emissão", "Validade", "Dias"]}
          rows={docs.rows.map((d) => [
            String(d["category"] ?? ""),
            String(d["name"] ?? ""),
            String(d["number"] ?? ""),
            String(d["issueDate"] ?? ""),
            String(d["validity"] ?? ""),
            d.days === null ? "—" : d.days,
          ])}
        />
      </Section>

      <Section title="9. Ocorrências e atendimentos">
        <Table
          head={["Data", "Hora", "Local", "Pessoa", "Tipo", "Encaminhamento"]}
          rows={r.occurrences.map((o) => [
            String(o["date"] ?? ""),
            String(o["time"] ?? ""),
            String(o["local"] ?? ""),
            String(o["person"] ?? ""),
            String(o["type"] ?? ""),
            String(o["referral"] ?? ""),
          ])}
        />
      </Section>

      <Section title="10. Registro fotográfico">
        {photos.length === 0 ? (
          <p className="text-[11px]">Nenhuma foto marcada para o relatório.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p) => (
              <figure key={p.id} className="break-inside-avoid">
                <img src={p.src} alt={p.caption || "Evidência fotográfica"} className="w-full rounded border border-border" />
                <figcaption className="mt-1 text-[9px] leading-tight">
                  {p.caption || "Sem legenda"}
                  {p.local ? ` · ${p.local}` : ""}
                  {p.date ? ` · ${p.date}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>

      <Section title="11. Conclusão e parecer técnico">
        <p className="whitespace-pre-wrap">
          {r.conclusion ||
            `O índice de conformidade da unidade é de ${c.index}%, com ${c.counts.NC} não conformidade(s) e ${act.open + act.progress} ação(ões) pendente(s) no plano de ação.`}
        </p>
        <div className="mt-10 grid grid-cols-2 gap-10 text-center text-[11px]">
          <div className="border-t border-foreground pt-1">
            {r.responsible || settings.responsible || "Responsável técnico"}
            <br />
            {r.role || settings.role || "Bombeiro Civil"}
          </div>
          <div className="border-t border-foreground pt-1">Recebido pela unidade</div>
        </div>
      </Section>
    </div>
  );
}
