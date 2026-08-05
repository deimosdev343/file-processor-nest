import { Inject, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { parse } from 'csv-parse';

import { ColumnProfile, DatasetProfile, InferredType } from '../interfaces/dataset.profile';
import dataAnalysisConfig from '../data-analysis.config';

//regex for checking whether field is a date
const DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/;

//set for checking if field is boolean
const BOOL_SET = new Set(['true', 'false', 'yes', 'no', '0', '1', 't', 'f']);
const TYPE_SAMPLE_LIMIT = 5_000;

@Injectable()
export class CsvProfileService {
  private readonly logger = new Logger(CsvProfileService.name);
  private static readonly MAX_SKIPPED_TRACKED = 100;

  constructor(
    @Inject(dataAnalysisConfig.KEY) private readonly options: ConfigType<typeof dataAnalysisConfig>
  ) {}

  createColumnHeaders(csvRow: string, delimter: string): string[] {
    return csvRow.split(delimter || ',').map((_, i) => `column${i}`);
  }
  takeLine(csvContent: string, row: number): string {
    return csvContent.split(`\n`)[row];
  }
  async profile(csvContent: string, delimiter: string, columns: string[]): Promise<DatasetProfile> {
    const { rows, validRowCount, skippedCount, skippedLines } = await this.collectRows(csvContent, delimiter, columns);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    if(headers.length == 0) {
      throw new UnprocessableEntityException("CSV contains no parseable data rows.");
    }
    const truncated = validRowCount > this.options.maxRowsProfiled;
    if(truncated) {
      this.logger.warn( `Profiling truncated at ${this.options.maxRowsProfiled} of ${validRowCount} rows.`);
    }
    if(skippedCount > 0) this.logger.warn(`Skipped ${skippedCount} malformed row(s)`);
    return {
      rowCount: validRowCount,
      columnCount: headers.length,
      truncated,
      skippedRowCount: skippedCount,
      columns: headers.map((name) => this.profileColumn(name, rows)),
      sampleRows: rows.slice(0, this.options.sampleRows),
    };
  }
  
  private async collectRows(csvContent:string, delimiter:string, columns: string[]) :Promise<{
    rows: Record<string, string>[],
    validRowCount:number,
    skippedCount:number,
    skippedLines: number[]
  }> {
    const parser = parse(csvContent, {
      columns: columns?.length > 1 ? columns : true,
      skipEmptyLines: true,
      trim: true,
      bom: true,
      delimiter,
      skip_records_with_error: true,
      relax_column_count: true, //dipshits adding extra commas 
      relax_quotes: true //  instead of using the actual character for he abreviation they use the ascII character because fuck you
        
    });

    const rows: Record<string, string>[] = [];
    const skippedLines: number[] = [];
    let validRowCount = 0;
    let skippedCount = 0;

    parser.on('skip', (err: { lines: number; code: string }) => {
      skippedCount++;
      if (skippedLines.length < CsvProfileService.MAX_SKIPPED_TRACKED) {
        skippedLines.push(err.lines);
      }
    });

    try {
      for await(const record of parser) {
        validRowCount++;
        if(rows.length < this.options.maxRowsProfiled) {
          rows.push(record as Record<string, string>);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown parse failure';
      throw new UnprocessableEntityException(`Could not parse CSV: ${message}`);
    }
    return { rows, validRowCount, skippedCount, skippedLines };
  }

  private profileColumn(name: string, rows: Record<string, string>[]): ColumnProfile {
    const raw = rows.map((r) => r[name] ?? '');
    const nonEmpty = raw.filter((v) => v !== '');
    const nullCount = raw.length - nonEmpty.length;

    const counts = new Map<string, number>();
    for(const value of nonEmpty) counts.set(value, (counts.get(value) ?? 0) + 1);

    const inferredType = this.inferType(nonEmpty.slice(0, TYPE_SAMPLE_LIMIT));
 
    const column: ColumnProfile = {
      name,
      inferredType,
      nullCount,
      nullFraction: raw.length ? this.round(nullCount / raw.length) : 0,
      distinctCount: counts.size,
      distinctFraction: nonEmpty.length ? this.round(counts.size / nonEmpty.length) : 0,
      sampleValues: [...counts.keys()].slice(0, 3),
    };

    if (inferredType === 'integer' || inferredType === 'float') {
      column.numeric = this.summarizeNumeric(nonEmpty);
    } else if(column.distinctCount <= 50) {
      column.topValues = [...counts.entries()]
        .sort((a,b) => b[1] - a[1])
        .slice(0, this.options.topK)
        .map(([value, count]) => ({ value, count }));
    }
    return column;
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

    private summarizeNumeric(values: string[]): ColumnProfile['numeric'] {
    const nums = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (nums.length === 0) return undefined;
 
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
    const stddev = Math.sqrt(variance);
 
    return {
      min: nums[0],
      max: nums[nums.length - 1],
      mean: this.round(mean),
      p50: this.quantile(nums, 0.5),
      p95: this.quantile(nums, 0.95),
      stddev: this.round(stddev),
      outlierCount:
        stddev > 0 ? nums.filter((n) => Math.abs((n - mean) / stddev) > 3).length : 0,
    };
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
