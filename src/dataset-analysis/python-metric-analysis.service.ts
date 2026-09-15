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

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(this.options.pythonTimeoutMs),
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown transport error';
      this.logger.error(`Metric service unreachable at ${url}: ${reason}`);
      throw new ServiceUnavailableException('Metric analysis service is unavailable.');
    }
    if (res.status === 422) {
      // The spec didn't validate against MetricsRequest — that's our bug, not theirs.
      this.logger.error(`Metric service rejected the spec: ${await this.body(res)}`);
      throw new UnprocessableEntityException('Metric spec rejected by the analysis service.');
    }
 
    if (!res.ok) {
      this.logger.error(`Metric service returned ${res.status}: ${await this.body(res)}`);
      throw new ServiceUnavailableException('Metric analysis service failed.');
    }
    return (await res.json()) as MetricResult[];
  }

  private async body(res: Response): Promise<string> {
    try {
      return (await res.text()).slice(0, 500);
    } catch {
      return '<unreadable body>';
    }
  }

}
 
