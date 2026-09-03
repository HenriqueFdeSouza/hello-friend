import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ugb/ui-bits";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--status-pc)",
  "var(--status-progress)",
];

export interface Datum {
  name: string;
  value: number;
  color?: string;
}

const hasData = (data: Datum[]) => data.some((d) => d.value > 0);

export function Donut({
  data,
  onSliceClick,
  height = 240,
}: {
  data: Datum[];
  onSliceClick?: (name: string) => void;
  height?: number;
}) {
  if (!hasData(data)) return <EmptyState text="Sem dados cadastrados para gerar este gráfico." />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data.filter((d) => d.value > 0)}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={2}
          onClick={(e: { name?: string }) => e?.name && onSliceClick?.(e.name)}
        >
          {data
            .filter((d) => d.value > 0)
            .map((d, i) => (
              <Cell key={d.name} fill={d.color ?? PALETTE[i % PALETTE.length]} cursor="pointer" />
            ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function Bars({
  data,
  height = 240,
  color = "var(--chart-1)",
}: {
  data: Datum[];
  height?: number;
  color?: string;
}) {
  if (!hasData(data)) return <EmptyState text="Sem dados cadastrados para gerar este gráfico." />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.color ?? color ?? PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Trend({
  data,
  height = 240,
}: {
  data: { name: string; value: number | null }[];
  height?: number;
}) {
  if (!data.some((d) => d.value !== null))
    return <EmptyState text="O histórico será exibido conforme relatórios forem salvos." />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--primary)"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
