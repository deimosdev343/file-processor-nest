import { Test, TestingModule } from '@nestjs/testing';
import { TormentNexusService } from './torment-nexus.service';

describe('TormentNexusService', () => {
  let service: TormentNexusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TormentNexusService],
    }).compile();

    service = module.get<TormentNexusService>(TormentNexusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
