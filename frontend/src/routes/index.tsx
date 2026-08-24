import { createFileRoute } from "@tanstack/react-router";
import AnaylzeForm from "#/components/AnaylzeForm";
import { useAnalyzeDataset } from "#/hooks/UseAnalyzeDataset";

export const Route = createFileRoute('/')({
  component: AnalyzePage
})

function AnalyzePage() {
  const analysis = useAnalyzeDataset()
  return <div className="grid gap-8">
    <p className="text-sm text-slate-800">
      Upload dataset to run analysis
    </p>
    <AnaylzeForm
      onSubmit={(params) => analysis.mutate(params)}
      isPending={analysis.isPending}
      error={analysis.error}
    />
  </div>
}