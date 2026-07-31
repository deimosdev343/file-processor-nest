import {
  Controller,
  Inject,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import datasetAnalysisConfig from './data-analysis.config';
import { DatasetAnalysisService, DatasetAnalysisResult } from './dataset-analysis.service';


@Controller('dataset-analysis')
export class DatasetAnalysisController {
  constructor(
    private readonly datasetAnalysisService: DatasetAnalysisService,
    @Inject(datasetAnalysisConfig.KEY) private readonly options: ConfigType<typeof datasetAnalysisConfig>
  ) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyze(
        @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File
  ) {
      return this.datasetAnalysisService.analyze(file.buffer.toString('utf-8'));
  }
}
