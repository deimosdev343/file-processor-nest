import { Controller } from '@nestjs/common';
import { DatasetAnalysisService } from './dataset-analysis.service';

@Controller('dataset-analysis')
export class DatasetAnalysisController {
  constructor(private readonly datasetAnalysisService: DatasetAnalysisService) {}
}
