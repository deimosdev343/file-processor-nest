import { Inject, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { parse } from 'csv-parse/sync';

import { ColumnProfile, DatasetProfile, InferredType } from './interfaces/dataset.profile';
import dataAnalysisConfig from './data-analysis.config';

//regex for checking whether field is a date
const DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/;

//set for checking if field is boolean
const BOOL_SET = new Set(['true', 'false', 'yes', 'no', '0', '1', 't', 'f']);
const TYPE_SAMPLE_LIMIT = 5_000;

@Injectable()
export class CsvProfileService {
  private readonly logger = new Logger(CsvProfileService.name);

  constructor(
    @Inject(dataAnalysisConfig.KEY) private readonly options: ConfigType<typeof dataAnalysisConfig>
  ) {}

  profile(csvContent: string) {}

  private parseOrThrow(csvContent: string): Record<string, string>[] {
    try {
      return parse<Record<string, string>>(csvContent, {
        columns: true,
        skipEmptyLines: true,
        trim: true,
        bom: true
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown parse faliure";
      throw new UnprocessableEntityException(`Could not parse CSV :${message}`);
    }
  }

  private inferType(values: string[]): InferredType {
    if (values.length === 0) return 'string';
    const every = (fn: (v: string) => boolean) => values.every((v) => fn(v.trim()));
 
    if (every((v) => /^-?\d+$/.test(v))) return 'integer';
    if (every((v) => v !== '' && Number.isFinite(Number(v)))) return 'float';
    if (every((v) => BOOL_SET.has(v.toLowerCase()))) return 'boolean';
    if (every((v) => DATE_RE.test(v) && !Number.isNaN(Date.parse(v)))) return 'date';
    return 'string';
  }

  private quantile(sorted: number[], q: number) {
    const pos = (sorted.length -1) *q;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  private round(n: number): number {
    return Number(n.toFixed(4));
  }

}
