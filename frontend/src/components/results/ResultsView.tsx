import type { AnalyzeResponse } from '../../types/api.types';
import { ColumnsTable } from './ColumnsTable';
import { MetricResults } from './MetricResults';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{children}</h2>;
}

export function ResultsView({ data }: { data: AnalyzeResponse }) {
  const rolesByColumn = new Map(data.analyzedProfile.map((c) => [c.name, c.semanticRole]));

  return (
    <div className="grid gap-8">
      {data.caveats.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <SectionTitle>Caveats</SectionTitle>
          <ul className="list-disc pl-5 text-sm text-amber-900">
            {data.caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <SectionTitle>Metrics</SectionTitle>
        <MetricResults results={data.metricResults} rolesByColumn={rolesByColumn} />
      </section>
      <section>
        <SectionTitle>Columns {data.analyzedProfile.length}</SectionTitle>
        <ColumnsTable data={data.analyzedProfile} />
      </section>
    </div>
  );
}