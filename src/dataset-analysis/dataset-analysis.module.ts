import { Module } from '@nestjs/common';
import { DatasetAnalysisService } from './dataset-analysis.service';
import { DatasetAnalysisController } from './dataset-analysis.controller';
import { ConfigModule, ConfigType } from '@nestjs/config';
import dataAnalysisConfig from './data-analysis.config';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { CsvProfileService } from './profiler/csv-profiler.service';
import { PythonMetricAnalysisService } from './python-metric-analysis.service';

@Module({
  imports:[ConfigModule.forFeature(dataAnalysisConfig), OpenAiModule],
  controllers: [DatasetAnalysisController],
  providers: [
    CsvProfileService,
    DatasetAnalysisService,
    PythonMetricAnalysisService
  ],
  exports:[DatasetAnalysisService, CsvProfileService, PythonMetricAnalysisService]
})
export class DatasetAnalysisModule {}
