
export type InferredType = 'string' | 'integer' | 'float' | 'boolean' | 'date';
 
export interface NumericSummary {
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
  stddev: number;
  outlierCount: number;
}
 
export interface TopValue {
  value: string;
  count: number;
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
  topValues?: TopValue[];
}
export type SemanticRole = string; 
export interface OutputProfile extends ColumnProfile {
  semanticRole: SemanticRole;
  description: string;
  unit: string | null;
  qualityIssues: string[];
  isPii: boolean;
}
 
export type Confidence = 'low' | 'medium' | 'high';
export type Aggregation = string;
 
export interface Metric {
  name: string;
  expression: string;
  confidence: Confidence;
  aggregation: Aggregation;
  description: string;
  requiredColumns: string[];
  suggestedBreakdowns: string[];
}
 
export interface MetricBreakdownRow {
  key: string | null;
  value: number | null;
}
 
export interface MetricBreakdown {
  column: string;
  rows: MetricBreakdownRow[];
}
 
export interface MetricResult {
  name: string;
  expression: string;
  confidence: Confidence;
  description: string;
  aggregation: Aggregation;
  overall: number | null;
  breakdowns: MetricBreakdown[];
  skipped?: string;
  error?: string;
}
 
export interface AnalyzeResponse {
  analyzedProfile: OutputProfile[];
  metrics: Metric[];
  caveats: string[];
  metricResults: MetricResult[];
}
 
