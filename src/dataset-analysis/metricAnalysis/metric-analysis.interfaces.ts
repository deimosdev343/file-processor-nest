import { Metric } from "../schemas/dataset-analysis.schema";

export interface MetricBreakdown {
  column: string;
  rows: { key: string | null; value: number | null }[];
}
export interface MetricResult {
  name: string;
  expression: string;
  confidence: Metric['confidence'];
  overall: number | null;
  breakdowns: MetricBreakdown[];
  skipped?: string; 
  error?: string;
}