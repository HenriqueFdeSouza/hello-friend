import { createFileRoute } from "@tanstack/react-router";
import { Download, HardDrive, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/ugb/AppShell";
import { PageHeader, Panel, ProgressLine, StatCard } from "@/components/ugb/ui-bits";
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
import { UNITS } from "@/lib/ugb/constants";
import { StorageService } from "@/lib/ugb/storage";
import { useUgb } from "@/lib/ugb/store";
import type { DB } from "@/lib/ugb/types";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações e Backup — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Responsável técnico, pesos de conformidade, uso de armazenamento local e backup dos relatórios em JSON.",
      },
      { property: "og:title", content: "Configurações e Backup — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Ajustes do sistema e exportação/importação dos dados locais.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { settings, updateSettings, db, importDB, usageBytes, reports } = useUgb();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");

  const usageMb = usageBytes / (1024 * 1024);
  const usagePct = Math.min(Math.round((usageMb / 5) * 100), 100);

  function exportJson() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ugb-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado com sucesso.");
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as DB;
      if (!Array.isArray(parsed.reports)) throw new Error("formato inválido");
      importDB(parsed, mode);
      toast.success(`Backup importado (${parsed.reports.length} relatórios).`);
    } catch {
      toast.error("Arquivo inválido. Selecione um backup JSON gerado por este sistema.");
    }
  }

  return (
    <AppShell>
      <PageHeader title="Configurações" subtitle="Preferências, armazenamento local e backup" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Relatórios armazenados" value={reports.length} tone="info" />
        <StatCard label="Uso estimado" value={`${usageMb.toFixed(2)} MB`} tone="gold" />
        <StatCard label="Fotos totais" value={reports.reduce((a, r) => a + r.photos.length, 0)} />
        <StatCard label="Modo de dados" value="Local (offline)" tone="good" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Responsável técnico" description="Aplicado como padrão em novos relatórios.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={settings.responsible}
                onChange={(e) => updateSettings({ responsible: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo / função</Label>
              <Input value={settings.role} onChange={(e) => updateSettings({ role: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Unidade padrão</Label>
              <Select
                value={settings.defaultUnit}
                onValueChange={(v) => updateSettings({ defaultUnit: v })}
              >
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
          </div>
        </Panel>

        <Panel
          title="Pesos do índice de conformidade"
          description="Define o peso de cada status no cálculo do índice geral (0 a 1)."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {(["C", "PC", "NC"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label className="text-xs">
                  {k === "C" ? "Conforme" : k === "PC" ? "Parcialmente" : "Não conforme"}
                </Label>
                <Input
                  type="number"
                  step="0.05"
                  min={0}
                  max={1}
                  value={settings.weights[k]}
                  onChange={(e) =>
                    updateSettings({
                      weights: { ...settings.weights, [k]: Number(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Armazenamento local"
          description="Os dados ficam apenas neste navegador. Exporte backups com frequência."
        >
          <ProgressLine value={usagePct} label={`${usageMb.toFixed(2)} MB de ~5 MB disponíveis`} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportJson}>
              <Download className="size-4" /> Exportar backup JSON
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Apagar TODOS os dados locais? Exporte um backup antes de continuar.",
                  )
                ) {
                  StorageService.clearAll();
                  window.location.reload();
                }
              }}
            >
              <Trash2 className="size-4" /> Limpar dados locais
            </Button>
          </div>
        </Panel>

        <Panel title="Importar backup" description="Restaure relatórios de um arquivo JSON.">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Modo de importação</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "merge" | "replace")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Mesclar com dados atuais</SelectItem>
                  <SelectItem value="replace">Substituir tudo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => void importJson(e.target.files?.[0])}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Selecionar arquivo
            </Button>
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="size-3.5" /> Nenhum dado sai deste dispositivo.
            </p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
