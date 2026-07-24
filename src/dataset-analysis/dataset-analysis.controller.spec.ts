import { Test, TestingModule } from '@nestjs/testing';
import { DatasetAnalysisController } from './dataset-analysis.controller';
import { DatasetAnalysisService } from './dataset-analysis.service';

describe('DatasetAnalysisController', () => {
  let controller: DatasetAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetAnalysisController],
      providers: [DatasetAnalysisService],
    }).compile();

    controller = module.get<DatasetAnalysisController>(DatasetAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
