import { AlertTriangle, Check, ImagePlus, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/ugb/constants";
import { fileToPhoto, isLargeFile } from "@/lib/ugb/photos";
import type { ComplianceStatus, Photo } from "@/lib/ugb/types";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="ugb-gold-rule mb-3 h-1 w-16 rounded-full" />
        <h1 className="font-display text-2xl uppercase tracking-wide text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string | undefined;
  tone?: "default" | "good" | "warn" | "bad" | "info" | "gold" | undefined;
  icon?: ReactNode | undefined;
}) {
  const toneColor: Record<string, string> = {
    default: "var(--graphite)",
    good: "var(--status-c)",
    warn: "var(--status-pc)",
    bad: "var(--status-nc)",
    info: "var(--status-progress)",
    gold: "var(--gold)",
  };
  return (
    <Card className="relative gap-0 overflow-hidden py-4">
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: toneColor[tone] }}
        aria-hidden
      />
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        </div>
        <p className="font-display mt-2 text-3xl leading-none" style={{ color: toneColor[tone] }}>
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: ComplianceStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: STATUS_COLOR[status] }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader className="gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-display text-base uppercase tracking-wide">{title}</CardTitle>
          {actions}
        </div>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function ProgressLine({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

export function AlertLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border-l-4 border-l-primary bg-primary/5 p-3 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
      <span>{text}</span>
    </div>
  );
}

export function PhotoManager({
  photos,
  onChange,
  compact,
}: {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  compact?: boolean | undefined;
}) {
  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const added: Photo[] = [];
    for (const file of Array.from(files)) {
      if (isLargeFile(file)) {
        toast.info("Esta imagem é muito grande e será otimizada antes de ser armazenada.");
      }
      try {
        added.push(await fileToPhoto(file));
      } catch {
        toast.error(`Não foi possível processar ${file.name}`);
      }
    }
    onChange([...photos, ...added]);
  }

  return (
    <div className="space-y-3">
      <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary/50 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
        <ImagePlus className="size-4" />
        Adicionar fotos
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </Label>
      {photos.length ? (
        <div
          className={cn(
            "grid gap-3",
            compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          )}
        >
          {photos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={p.src} alt={p.caption || "Registro fotográfico"} className="h-32 w-full object-cover" />
              <div className="space-y-2 p-2">
                <Input
                  value={p.caption}
                  placeholder="Legenda"
                  className="h-8 text-xs"
                  onChange={(e) =>
                    onChange(photos.map((x) => (x.id === p.id ? { ...x, caption: e.target.value } : x)))
                  }
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                    onClick={() =>
                      onChange(photos.map((x) => (x.id === p.id ? { ...x, inPdf: !x.inPdf } : x)))
                    }
                  >
                    {p.inPdf ? (
                      <Check className="size-3 text-[color:var(--status-c)]" />
                    ) : (
                      <X className="size-3" />
                    )}
                    no PDF
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive"
                    onClick={() => onChange(photos.filter((x) => x.id !== p.id))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Nenhuma foto adicionada.</p>
      )}
    </div>
  );
}

export function KeyValue({ label, value }: { label: string; value?: ReactNode }) {
  if (!value) return null;
  return (
    <div className="border-b border-border/60 py-2 last:border-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm whitespace-pre-line">{value}</p>
    </div>
  );
}

export function CountBadge({ n, label }: { n: number; label: string }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {n} {label}
    </Badge>
  );
}
