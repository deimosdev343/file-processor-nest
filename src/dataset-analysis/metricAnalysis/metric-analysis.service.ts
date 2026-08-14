
import { Injectable, Logger } from '@nestjs/common';
import { DuckDBInstance } from '@duckdb/node-api';
import { randomUUID } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MetricResult, MetricBreakdown } from './metric-analysis.interfaces';
import { Metric } from '../schemas/dataset-analysis.schema';

const TBL = 'dataset';
const BREAKDOWN_LIMIT = 50;

@Injectable()
export class MetricAnalysisService {
  private readonly logger = new Logger(MetricAnalysisService.name);
  
  private async runMetric(conn: any, metric: Metric, known: Set<string>) {
    const base: MetricResult = {
      name: metric.name,
      expression: metric.expression,
      confidence: metric.confidence,
      overall: null,
      breakdowns: []
    };

    const missing = metric.requiredColumns.filter((c) => !known.has(c));
    if (missing.length) {
      return { ...base, skipped: `references unknown column(s): ${missing.join(', ')}` };
    }

    try {
      const rows = await this.select(conn, `SELECT (${metric.expression}) AS value FROM ${TBL}`);
      base.overall = this.toNum(rows[0]?.value);
    } catch (err) {
      return { ...base, error: this.msg(err) }; // whole metric failed; don't attempt breakdowns
    }
    for(const col of metric.suggestedBreakdowns) {
      
    }
  }

  private async select(conn: any, sql: string): Promise<Record<string, unknown>[]> {
    const reader = await conn.runAndReadAll(sql);
    return reader.getRowObjects();
  }

  private toNum(v: unknown): number | null {
    if (v == null) return null;
    if (typeof v === 'bigint') return Number(v); // COUNT etc. come back as BigInt
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private quote(id: string): string {
    return `"${id.replace(/"/g, '""')}"`;
  }

  private msg(err: unknown): string {
    return err instanceof Error ? err.message : 'unknown execution error';
  }
}