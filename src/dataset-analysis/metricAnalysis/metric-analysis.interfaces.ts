import { Metric } from "../schemas/dataset-analysis.schema";
export const METRIC_RUNNER = Symbol('METRIC_RUNNER');

export interface MetricRunner {
  run(
    csvContent: string,
    delimiter: string,
    columnNames: string[],
    hasHeader: boolean,
    metrics: Metric[],
    cardinality: Map<string, number>,
  ): Promise<MetricResult[]>;
}

export interface MetricBreakdown {
  column: string;
  rows: { key: string | null; value: number | null }[];
}
export interface MetricResult {
  name: string;
  expression: string;
  confidence: Metric['confidence'];
  description: string;
  aggregation: Metric['aggregation'];
  overall: number | null;
  breakdowns: MetricBreakdown[];
  skipped?: string; 
  error?: string;
}