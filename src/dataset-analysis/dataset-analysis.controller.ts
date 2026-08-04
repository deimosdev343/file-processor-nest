import {
  Controller,
  Inject,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import datasetAnalysisConfig from './data-analysis.config';
import { DatasetAnalysisService, DatasetAnalysisResult } from './dataset-analysis.service';
import { ParseDelimiterPipe } from './profiler/csv-profiler-delimter.pipe';
import { IsString } from "class-validator";

export class CsvHeadersDto {
    @IsString()
    csvRow: string;
    @IsString()
    delimiter: string;    
}

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
    file: Express.Multer.File,
    @Query('delimter', ParseDelimiterPipe) delimiter: string
  ) {
      return this.datasetAnalysisService.analyze(file.buffer.toString('utf-8'), delimiter);
  }
  @Post("columns")
  async createHeaders(@Body() csvHeadersDto: CsvHeadersDto) {
    return this.datasetAnalysisService.createColumnHeader(csvHeadersDto.csvRow, csvHeadersDto.delimiter);   
  }
}
