import { Module } from '@nestjs/common';
import { DatasetAnalysisService } from './dataset-analysis.service';
import { DatasetAnalysisController } from './dataset-analysis.controller';

@Module({
  controllers: [DatasetAnalysisController],
  providers: [DatasetAnalysisService],
})
export class DatasetAnalysisModule {}
