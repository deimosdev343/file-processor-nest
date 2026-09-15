import { Module } from '@nestjs/common';
import { DatasetAnalysisService } from './dataset-analysis.service';
import { DatasetAnalysisController } from './dataset-analysis.controller';
import { ConfigModule, ConfigType } from '@nestjs/config';
import dataAnalysisConfig from './data-analysis.config';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { CsvProfileService } from './profiler/csv-profiler.service';
import { MetricAnalysisService } from './metricAnalysis/metric-analysis.service';
import { PythonMetricAnalysisService } from './python-metric-analysis.service';
import { METRIC_RUNNER } from './metricAnalysis/metric-analysis.interfaces';

@Module({
  imports:[ConfigModule.forFeature(dataAnalysisConfig), OpenAiModule],
  controllers: [DatasetAnalysisController],
  providers: [
    CsvProfileService,
    DatasetAnalysisService,
    MetricAnalysisService,
    PythonMetricAnalysisService,
    {
      provide: METRIC_RUNNER,
      inject:[dataAnalysisConfig.KEY, MetricAnalysisService, PythonMetricAnalysisService],
      useFactory: (
        cfg: ConfigType<typeof dataAnalysisConfig>,
        node: MetricAnalysisService,
        python: PythonMetricAnalysisService
      ) => (cfg.metricRunner == 'python' ? python : node)
    }
  ],
  exports:[DatasetAnalysisService, CsvProfileService, METRIC_RUNNER]
})
export class DatasetAnalysisModule {}
