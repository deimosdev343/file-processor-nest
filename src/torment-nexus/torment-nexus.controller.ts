import { Body, Controller, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { TormentNexusService } from './torment-nexus.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.auth.guard';
import { PromptDto } from './dto/promptDto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('torment-nexus')
export class TormentNexusController {
  constructor(private readonly tormentNexusService: TormentNexusService) {}

  @UseGuards(JwtAuthGuard)
  @Post('summarize')
  @UseInterceptors(FileInterceptor('file'))
  async summarize_document(@UploadedFile(
    new ParseFilePipe({
      validators:[
        new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024})
      ]
    })
  ) file: Express.Multer.File) {
    const csv = file.buffer.toString("utf-8");
    return {reply: await this.tormentNexusService.summarizeDocument(csv)}
  }
}
