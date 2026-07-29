import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
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
  
}
