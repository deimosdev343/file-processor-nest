import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import DatasetAnalysisConfig from '../dataset-analysis/data-analysis.config';
import { Metric } from './schemas/dataset-analysis.schema';
import { MetricResult, MetricRunner } from './metricAnalysis/metric-analysis.interfaces';


@Injectable()
export class PythonMetricAnalysisService implements MetricRunner {
  private readonly logger = new Logger(PythonMetricAnalysisService.name);
 
  constructor(
    @Inject(DatasetAnalysisConfig.KEY)
    private readonly options: ConfigType<typeof DatasetAnalysisConfig>,
  ) {}
  async run(
    csvContent: string,
    delimiter: string,
    columnNames: string[],
    hasHeader: boolean,
    metrics: Metric[],
    cardinality: Map<string, number>,
  ): Promise<MetricResult[]> {
    if (metrics.length === 0) return [];
    const spec = JSON.stringify({
      delimiter,
      hasHeader,
      columnNames,
      metrics,
      cardinality: Object.fromEntries(cardinality),
    });
 
    const form = new FormData();
    // Don't set Content-Type: fetch has to generate the multipart boundary.
    form.append('file', new Blob([csvContent], { type: 'text/csv' }), 'dataset.csv');
    form.append('spec', spec);
    const url = `${this.options.pythonServiceUrl.replace(/\/+$/, '')}/metrics`;
  }

}
 
