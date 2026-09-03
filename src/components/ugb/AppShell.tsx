import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpenCheck,
  Boxes,
  Camera,
  ClipboardCheck,
  FileText,
  Flame,
  Gauge,
  GraduationCap,
  HeartPulse,
  Images,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings,
  ShieldCheck,
  Siren,
  Waves,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS, REPORT_STATUS_LABEL, UNITS, unitAccent, unitName } from "@/lib/ugb/constants";
import { actionStats, docStats } from "@/lib/ugb/calc";
import { useUgb } from "@/lib/ugb/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/sistemas", label: "Sistemas Preventivos", icon: ShieldCheck },
  { to: "/inventario", label: "Inventário", icon: Boxes },
  { to: "/inspecoes", label: "Inspeções", icon: ClipboardCheck },
  { to: "/testes", label: "Testes de Bombas", icon: Waves },
  { to: "/plano-acao", label: "Plano de Ação", icon: ListChecks },
  { to: "/brigada", label: "Brigada", icon: Flame },
  { to: "/treinamentos", label: "Treinamentos", icon: GraduationCap },
  { to: "/ocorrencias", label: "Ocorrências", icon: HeartPulse },
  { to: "/atividades", label: "Atividades", icon: BookOpenCheck },
  { to: "/documentacao", label: "Documentação", icon: Camera },
  { to: "/fotos", label: "Registro Fotográfico", icon: Images },
  { to: "/indicadores", label: "Indicadores UGB", icon: Gauge },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[color:var(--gold)]/60 bg-primary text-primary-foreground">
        <Siren className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-sm uppercase tracking-widest text-[color:var(--gold)]">
          UGB Bombeiros Civis
        </p>
        <p className="text-[11px] uppercase tracking-wider text-white/70">Complexo Beach Park</p>
      </div>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1 px-3 pb-8">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { activeReport, activeUnit, setActiveUnit, reports, setActiveReportId, savedAt, hydrated } =
    useUgb();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unitReports = reports
    .filter((r) => r.unitId === activeUnit)
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const alerts = activeReport
    ? actionStats(activeReport).critical +
      actionStats(activeReport).overdue +
      docStats(activeReport).expiring.length +
      docStats(activeReport).expired.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar lg:flex">
        <div className="border-b border-sidebar-border px-4 py-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto pt-4">
          <SidebarNav />
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-sidebar pb-6">
            <div className="border-b border-sidebar-border px-4 py-4">
              <Brand />
            </div>
            <div className="pt-4">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="ugb-topbar sticky top-0 z-30 border-b-2 border-b-[color:var(--gold)] print:hidden">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="mr-auto flex items-center gap-3">
              <div className="hidden text-white sm:block">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">
                  Relatório Técnico Mensal
                </p>
                <p className="text-sm font-semibold">Segurança Contra Incêndio e Pânico</p>
              </div>
            </div>

            <Select value={activeUnit} onValueChange={setActiveUnit}>
              <SelectTrigger className="h-9 w-[190px] border-white/20 bg-white/10 text-white">
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

            <Select
              value={activeReport?.id ?? ""}
              onValueChange={setActiveReportId}
              disabled={!unitReports.length}
            >
              <SelectTrigger className="h-9 w-[170px] border-white/20 bg-white/10 text-white">
                <SelectValue placeholder="Sem relatório" />
              </SelectTrigger>
              <SelectContent>
                {unitReports.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {MONTHS[r.month - 1]}/{r.year} — {REPORT_STATUS_LABEL[r.status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Bell className="size-5 text-white/80" />
              {alerts > 0 ? (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-[color:var(--gold)] text-[10px] font-bold text-black">
                  {alerts}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 px-4 py-1.5 text-[11px] text-white/70">
            <span
              className="inline-flex items-center gap-1.5 font-semibold text-white"
              style={{ color: unitAccent(activeUnit) }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: unitAccent(activeUnit) }}
              />
              {unitName(activeUnit)}
            </span>
            {activeReport ? (
              <>
                <span>
                  Período: {MONTHS[activeReport.month - 1]}/{activeReport.year}
                </span>
                <span>Responsável: {activeReport.responsible || "não informado"}</span>
                <Badge className="h-5 bg-white/15 text-[10px] text-white">
                  {REPORT_STATUS_LABEL[activeReport.status]}
                </Badge>
              </>
            ) : (
              <span>Nenhum relatório selecionado</span>
            )}
            {hydrated ? (
              <span className="ml-auto text-[color:var(--gold)]">
                {savedAt ? "Alterações salvas localmente" : "Armazenamento local ativo"}
              </span>
            ) : null}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function NoReportNotice() {
  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-8 text-center">
      <h2 className="font-display text-lg uppercase">Nenhum relatório ativo</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Crie um relatório mensal para esta unidade para começar a registrar dados. Todos os
        indicadores são calculados a partir do que você preencher.
      </p>
      <Button asChild className="mt-4">
        <Link to="/relatorios">Ir para Relatórios</Link>
      </Button>
    </div>
  );
}
