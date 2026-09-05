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
  

}
 
