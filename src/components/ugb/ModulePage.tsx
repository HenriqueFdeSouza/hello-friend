import type { ReactNode } from "react";

import { AppShell, NoReportNotice } from "@/components/ugb/AppShell";
import { RecordManager, type FieldDef } from "@/components/ugb/RecordManager";
import { PageHeader, Panel } from "@/components/ugb/ui-bits";
import { MONTHS, unitName } from "@/lib/ugb/constants";
import { useUgb } from "@/lib/ugb/store";
import type { Rec, Report } from "@/lib/ugb/types";

type ListKey = {
  [K in keyof Report]: Report[K] extends Rec[] ? K : never;
}[keyof Report];

export function ModulePage({
  title,
  subtitle,
  listKey,
  fields,
  renderSummary,
  addLabel,
  stats,
  charts,
}: {
  title: string;
  subtitle: string;
  listKey: ListKey;
  fields: FieldDef[];
  renderSummary: (item: Rec) => ReactNode;
  addLabel?: string;
  stats?: (report: Report) => ReactNode;
  charts?: (report: Report) => ReactNode;
}) {
  const { activeReport, updateReport } = useUgb();

  return (
    <AppShell>
      {!activeReport ? (
        <NoReportNotice />
      ) : (
        <>
          <PageHeader
            title={title}
            subtitle={`${subtitle} — ${unitName(activeReport.unitId)} · ${MONTHS[activeReport.month - 1]}/${activeReport.year}`}
          />
          {stats ? <div className="mb-6">{stats(activeReport)}</div> : null}
          {charts ? <div className="mb-6">{charts(activeReport)}</div> : null}
          <Panel title="Registros do período" description="Salvamento automático no armazenamento local.">
            <RecordManager
              title={title}
              fields={fields}
              items={activeReport[listKey]}
              onChange={(items) =>
                updateReport((draft) => {
                  (draft[listKey] as Rec[]) = items;
                })
              }
              renderSummary={renderSummary}
              {...(addLabel ? { addLabel } : {})}
            />
          </Panel>
        </>
      )}
    </AppShell>
  );
}
