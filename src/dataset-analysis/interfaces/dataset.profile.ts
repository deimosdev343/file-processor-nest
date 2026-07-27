export type InferredType = 'integer' | 'float' | 'boolean' | 'date' | 'string';

export interface NumericSummary {
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
  stddev: number;
  outlierCount: number;
}

export interface ColumnProfile {
  name: string;
  inferredType: InferredType;
  nullCount: number;
  nullFraction: number;
  distinctCount: number;
  distinctFraction: number;
  sampleValues: string[];
  numeric?: NumericSummary;
  topValues?: Array<{value: string, count: number}>
}

export interface DatasetProfile {
  rowCount: number;
  columnCount: number;
  truncated: boolean;
  columns: ColumnProfile[];
  sampleRows: Record<string, string>[]
}
 
