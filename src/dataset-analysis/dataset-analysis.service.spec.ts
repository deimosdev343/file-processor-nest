import { Test, TestingModule } from '@nestjs/testing';
import { DatasetAnalysisService } from './dataset-analysis.service';

describe('DatasetAnalysisService', () => {
  let service: DatasetAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatasetAnalysisService],
    }).compile();

    service = module.get<DatasetAnalysisService>(DatasetAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
