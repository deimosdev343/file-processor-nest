import { Controller } from '@nestjs/common';
import { TormentNexusService } from './torment-nexus.service';

@Controller('torment-nexus')
export class TormentNexusController {
  constructor(private readonly tormentNexusService: TormentNexusService) {}
}
