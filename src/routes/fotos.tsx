import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell, NoReportNotice } from "@/components/ugb/AppShell";
import { EmptyState, PageHeader, Panel, PhotoManager, StatCard } from "@/components/ugb/ui-bits";
import { Button } from "@/components/ui/button";
import { photoCount } from "@/lib/ugb/calc";
import { SYSTEMS, systemName } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";
import type { Photo } from "@/lib/ugb/types";

export const Route = createFileRoute("/fotos")({
  head: () => ({
    meta: [
      { title: "Galeria de Evidências — UGB Bombeiros Civis" },
      {
        name: "description",
        content:
          "Galeria consolidada das evidências fotográficas do relatório técnico mensal, com filtro por sistema e seleção para o PDF.",
      },
      { property: "og:title", content: "Galeria de Evidências — UGB Bombeiros Civis" },
      {
        property: "og:description",
        content: "Todas as fotos de inspeção do período, organizadas por sistema preventivo.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { activeReport, updateReport } = useUgb();
  const [filter, setFilter] = useState<string>("all");

  if (!activeReport)
    return (
      <AppShell>
        <NoReportNotice />
      </AppShell>
    );

  const counts = photoCount(activeReport);

  const systemPhotos: { key: string; name: string; photos: Photo[] }[] = SYSTEMS.map((s) => ({
    key: s.key,
    name: s.name,
    photos: activeReport.systems[s.key]?.photos ?? [],
  })).filter((s) => s.photos.length > 0);

  const visible = filter === "all" ? systemPhotos : systemPhotos.filter((s) => s.key === filter);

  return (
    <AppShell>
      <PageHeader
        title="Galeria de Evidências"
        subtitle="Fotos anexadas aos sistemas preventivos e ao relatório geral"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total de fotos" value={counts.total} tone="info" />
        <StatCard label="Selecionadas para o PDF" value={counts.inPdf} tone="gold" />
        <StatCard label="Sistemas com evidência" value={systemPhotos.length} tone="good" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todos os sistemas
        </Button>
        {systemPhotos.map((s) => (
          <Button
            key={s.key}
            size="sm"
            variant={filter === s.key ? "default" : "outline"}
            onClick={() => setFilter(s.key)}
          >
            {s.name} ({s.photos.length})
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <Panel
          title="Fotos gerais do relatório"
          description="Evidências não vinculadas a um sistema específico."
        >
          <PhotoManager
            photos={activeReport.photos}
            onChange={(photos) =>
              updateReport((draft) => {
                draft.photos = photos;
              })
            }
          />
        </Panel>

        {visible.length === 0 ? (
          <EmptyState text="Nenhuma foto vinculada aos sistemas preventivos ainda." />
        ) : (
          visible.map((s) => (
            <Panel key={s.key} title={systemName(s.key)} description={`${s.photos.length} evidências`}>
              <PhotoManager
                photos={s.photos}
                onChange={(photos) =>
                  updateReport((draft) => {
                    const entry = draft.systems[s.key];
                    if (entry) entry.photos = photos;
                  })
                }
              />
            </Panel>
          ))
        )}
      </div>
    </AppShell>
  );
}
