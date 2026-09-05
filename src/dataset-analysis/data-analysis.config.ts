import { registerAs } from "@nestjs/config";
import { MetricRunner } from "./metricAnalysis/metric-analysis.interfaces";

export interface DatasetAnalysis {
  model: string;
  maxRowsProfiled: number;
  sampleRows: number;
  topK: number;
  maxUploadBytes: number;
  pythonServiceUrl: string;
  pythonTimeoutMs: number;
  metricRunner: string;
}

export const DATASET_ANALYSIS_CONFIG = 'datasetAnalysis';

export default registerAs(
  DATASET_ANALYSIS_CONFIG,
  (): DatasetAnalysis => ({
    model: process.env.DATASET_ANALYSIS_MODEL ?? 'gpt-5.6-luna',
    maxRowsProfiled: Number(process.env.DATASET_MAX_ROWS_PROFILED ?? 200_000),
    sampleRows: Number(process.env.DATASET_SAMPLE_ROWS ?? 5),
    topK: Number(process.env.DATASET_TOP_K ?? 8),
    maxUploadBytes: Number(process.env.DATASET_MAX_UPLOAD_BYTES ?? 50 * 1024 * 1024),
    pythonServiceUrl: process.env.PYTHON_ANALYSIS_URL ?? 'http://localhost:8100',
    pythonTimeoutMs: Number(process.env.PYTHON_ANALYSIS_TIMEOUT_MS ?? 30_000),
    metricRunner: process.env.METRIC_RUNNER ?? 'node', 
  })
)