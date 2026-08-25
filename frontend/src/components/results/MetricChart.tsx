import {
  LineChart as RLineChart,
  Line,
  BarChart as RBarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import type { MetricBreakdownRow } from '../../types/api.types';

export type ChartVariant = 'line' | 'bar';

/**
 * Pick a chart type from a column's semantic role.
 *
 * Temporal / continuous keys read as a line (ordered x-axis); everything
 * categorical reads as a bar. This is the one place to tune the mapping.
 */
export function chartVariantForRole(role: string | undefined): ChartVariant {
  switch (role) {
    case 'timestamp':
    case 'measure':
      return 'line';
    default:
      return 'bar';
  }
}

function formatValue(v: number | null | undefined): string {
  if (v == null) return '—';
  return Number.isInteger(v)
    ? v.toLocaleString()
    : v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

const compact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const SKY = '#0ea5e9';
const ROSE = '#fb7185';

function truncate(s: string, n = 16): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/**
 * Order line points by key (numeric → date → lexical) so the x-axis is
 * meaningful. Bars keep their incoming value-DESC order instead.
 */
function sortByKey(rows: MetricBreakdownRow[]): MetricBreakdownRow[] {
  const parsed = rows.map((r) => ({
    r,
    n: r.key == null ? NaN : Number(r.key),
    t: r.key == null ? NaN : Date.parse(r.key),
  }));

  const allNums = parsed.every((p) => p.r.key == null || !Number.isNaN(p.n));
  const allDates = parsed.every((p) => p.r.key == null || !Number.isNaN(p.t));

  return [...parsed]
    .sort((a, b) => {
      if (allNums) return a.n - b.n;
      if (allDates) return a.t - b.t;
      return String(a.r.key).localeCompare(String(b.r.key));
    })
    .map((p) => p.r);
}

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
} as const;

const tickStyle = { fontSize: 11, fill: '#64748b' } as const;

export function MetricChart({
  rows,
  variant = 'bar',
}: {
  rows: MetricBreakdownRow[];
  variant?: ChartVariant;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">No values to plot.</p>;
  }

  if (variant === 'line') {
    const data = sortByKey(rows).map((r) => ({ key: r.key ?? '(null)', value: r.value }));
    return (
      <div className="h-60 w-full">
        <ResponsiveContainer>
          <RLineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="key"
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => compact.format(v as number)}
            />
            <Tooltip
              formatter={(v) => [formatValue(v as number), '']}
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#64748b' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={SKY}
              strokeWidth={2}
              dot={{ r: 2.5, fill: SKY }}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          </RLineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Bar: keep value-DESC order, horizontal layout so long/plentiful category
  // labels stay readable. Height grows with the row count.
  const data = rows.map((r) => ({ key: r.key ?? '(null)', value: r.value }));
  const height = Math.min(Math.max(data.length * 30, 160), 640);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <RBarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(v) => compact.format(v as number)}
          />
          <YAxis
            type="category"
            dataKey="key"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={110}
            tickFormatter={(v) => truncate(String(v))}
          />
          <Tooltip
            formatter={(v) => [formatValue(v as number), '']}
            contentStyle={tooltipStyle}
            labelStyle={{ color: '#64748b' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={(d.value ?? 0) < 0 ? ROSE : SKY} />
            ))}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}