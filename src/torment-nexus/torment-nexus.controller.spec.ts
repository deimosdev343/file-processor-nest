import { Test, TestingModule } from '@nestjs/testing';
import { TormentNexusController } from './torment-nexus.controller';
import { TormentNexusService } from './torment-nexus.service';

describe('TormentNexusController', () => {
  let controller: TormentNexusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TormentNexusController],
      providers: [TormentNexusService],
    }).compile();

    controller = module.get<TormentNexusController>(TormentNexusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
