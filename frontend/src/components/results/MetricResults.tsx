import type { Confidence, MetricResult } from '../../types/api.types';
import { MetricChart, chartVariantForRole } from './MetricChart';

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-sky-100 text-sky-700',
  high: 'bg-emerald-100 text-emerald-700',
};

function formatValue(v: number | null): string {
  if (v === null) return '—';
  return Number.isInteger(v)
    ? v.toLocaleString()
    : v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function MetricResults({
  results,
  rolesByColumn,
}: {
  results: MetricResult[];
  rolesByColumn: Map<string, string>;
}) {
  if (results.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        The model proposed no computable metrics for this dataset.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {results.map((m) => (
        <article key={m.name} className="rounded-xl border border-slate-200 bg-white p-5">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900">{m.name}</h3>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLES[m.confidence] ?? ''}`}
            >
              {m.confidence} confidence
            </span>
          </header>

          <p className="mt-1 text-sm text-slate-600">{m.description}</p>

          {m.skipped ? (
            <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Skipped — {m.skipped}
            </p>
          ) : m.error ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Failed — {m.error}
            </p>
          ) : (
            <>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
                {formatValue(m.overall)}
              </p>
              <code className="mt-1 block text-xs text-slate-400">{m.expression}</code>

              {m.breakdowns.map((b) => (
                <div key={b.column} className="mt-4">
                  <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                    by {b.column}
                  </p>
                  <MetricChart
                    rows={b.rows}
                    variant={chartVariantForRole(rolesByColumn.get(b.column))}
                  />
                </div>
              ))}
            </>
          )}
        </article>
      ))}
    </div>
  );
}