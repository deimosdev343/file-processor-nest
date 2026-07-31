import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import  type { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import { OPENAI_CLIENT } from 'src/open-ai/open-ai.constants';
import { CsvProfileService } from './csv-profiler.service';
import DatasetAnalysisConfig from './data-analysis.config';
import { DatasetProfile } from './interfaces/dataset.profile';
import { DatasetAnalysis, DatasetAnalysisSchema } from './schemas/dataset-analysis.schema';

const SYSTEM_PROMPT = `You are a dataset analyst, you are given a statistical profile of a tabular dataset, plus a few sample rows.

Your job SEMANTIC INTERPRETATION ONLY:
  - Identify what each column means and its role in an analytical model.
  - Enumerate the metrics that can legitimately be computed from these columns.

Rules:
  - Every column name you reference must appear verbatim in the profile. Never invent columns.
  - Do not restate counts, minimums, maximums, or other statistics — they are already computed and authoritative.
  - Only propose a metric if the required columns exist. Prefer fewer, well-grounded metrics over a long speculative list.
  - Set confidence to "low" when the column's meaning is ambiguous from its name and values
`
export interface DatasetAnalysisResult {
  profile: DatasetProfile;
  analysis: DatasetAnalysis;
}


@Injectable()
export class DatasetAnalysisService {
  private readonly logger = new Logger(DatasetAnalysisService.name);
  
  constructor(
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
    @Inject(DatasetAnalysisConfig.KEY) private readonly options: ConfigType<typeof DatasetAnalysisConfig>,
     private readonly profiler: CsvProfileService,
  ) {}
  async analyze(csvContent: string) : Promise<DatasetAnalysisResult> {
    const profile =  this.profiler.profile(csvContent);
    const analysis = await this.interpret(profile);
    return { profile, analysis };
  }

  private async interpret(profile: DatasetProfile) {
    try {
      const completion = await this.openai.chat.completions.parse({
      model: this.options.model,
      messages: [
        {role: 'system', content: SYSTEM_PROMPT},
        {role: 'user', content: JSON.stringify(profile)}
      ],
      response_format: zodResponseFormat(DatasetAnalysisSchema, 'dataset_analysis')
    });
    const message = completion.choices[0]?.message;

    if(message?.refusal) {
      throw new UnprocessableEntityException("Model declined to process this file");
    }
    if(!message?.parsed) {
      throw new ServiceUnavailableException("Model returned no parsable analysis");
    }
    return message.parsed;
    } catch (err) {
      if (err instanceof OpenAI.APIError) {
        this.logger.error(`OpenAI ${err.status}: ${err.message}`);
        throw new ServiceUnavailableException('Upstream analysis provider is unavailable.');
      }
      throw err;
    }
  }
}
