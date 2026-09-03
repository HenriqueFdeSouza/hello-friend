import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { EmptyState, PhotoManager } from "@/components/ugb/ui-bits";
import { uid } from "@/lib/ugb/photos";
import type { Photo, Rec } from "@/lib/ugb/types";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "time" | "select" | "photos";
  options?: string[];
  span?: 1 | 2;
}

export function RecordManager({
  title,
  fields,
  items,
  onChange,
  renderSummary,
  addLabel = "Adicionar registro",
  emptyText = "Nenhum registro cadastrado. Os indicadores são calculados a partir dos dados inseridos aqui.",
}: {
  title: string;
  fields: FieldDef[];
  items: Rec[];
  onChange: (items: Rec[]) => void;
  renderSummary: (item: Rec) => ReactNode;
  addLabel?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Rec | null>(null);

  const startNew = () => {
    const base: Rec = { id: uid("rec"), createdAt: new Date().toISOString() };
    for (const f of fields) base[f.key] = f.type === "photos" ? [] : "";
    setDraft(base);
    setOpen(true);
  };

  const save = () => {
    if (!draft) return;
    const exists = items.some((i) => i.id === draft.id);
    onChange(exists ? items.map((i) => (i.id === draft.id ? draft : i)) : [...items, draft]);
    setOpen(false);
    setDraft(null);
  };

  return (
    <div className="space-y-4">
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setDraft(null);
        }}
      >
        <DialogTrigger asChild>
          <Button onClick={startNew}>
            <Plus className="size-4" /> {addLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">{title}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div
                  key={f.key}
                  className={f.span === 2 || f.type === "textarea" || f.type === "photos" ? "sm:col-span-2" : ""}
                >
                  <Label className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      rows={3}
                      value={String(draft[f.key] ?? "")}
                      onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    />
                  ) : f.type === "select" ? (
                    <Select
                      value={String(draft[f.key] ?? "")}
                      onValueChange={(v) => setDraft({ ...draft, [f.key]: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "photos" ? (
                    <PhotoManager
                      compact
                      photos={(draft[f.key] as Photo[]) ?? []}
                      onChange={(photos) => setDraft({ ...draft, [f.key]: photos })}
                    />
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "time" ? "time" : "text"}
                      value={String(draft[f.key] ?? "")}
                      onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Salvar registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {items.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 text-sm">{renderSummary(item)}</div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => {
                      setDraft(item);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive"
                    onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <Badge variant="outline" className="font-normal">
      {children}
    </Badge>
  );
}
