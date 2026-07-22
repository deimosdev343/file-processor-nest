import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TormentNexusService } from './torment-nexus.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { PromptDto } from './dto/promptDto';

@Controller('torment-nexus')
export class TormentNexusController {
  constructor(private readonly tormentNexusService: TormentNexusService) {}

  @UseGuards(JwtAuthGuard)
  @Post('summarize')
  async summarize_document(@Body() dto: PromptDto) {
    return {reply: await this.tormentNexusService.summarizeDocument(dto.prompt)}
  }
}
