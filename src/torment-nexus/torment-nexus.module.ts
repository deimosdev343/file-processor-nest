import { Module } from '@nestjs/common';
import { TormentNexusService } from './torment-nexus.service';
import { TormentNexusController } from './torment-nexus.controller';

@Module({
  controllers: [TormentNexusController],
  providers: [TormentNexusService],
})
export class TormentNexusModule {}
