import { Module } from '@nestjs/common';
import { DatasetAnalysisService } from './dataset-analysis.service';
import { DatasetAnalysisController } from './dataset-analysis.controller';
import { ConfigModule } from '@nestjs/config';
import dataAnalysisConfig from './data-analysis.config';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { CsvProfileService } from './profiler/csv-profiler.service';
import { MetricAnalysisService } from './metricAnalysis/metric-analysis.service';

@Module({
  imports:[ConfigModule.forFeature(dataAnalysisConfig), OpenAiModule],
  controllers: [DatasetAnalysisController],
  providers: [
    CsvProfileService,
    DatasetAnalysisService,
    MetricAnalysisService
  ],
  exports:[DatasetAnalysisService, CsvProfileService, MetricAnalysisService]
})
export class DatasetAnalysisModule {}
