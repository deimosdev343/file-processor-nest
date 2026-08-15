
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
  
  async run(
    csvContent: string,
    delimiter: string,
    columnNames: string[],
    hasHeader: boolean,
    metrics: Metric[],
  ): Promise<MetricResult[]> {
    const known = new Set(columnNames);
    const tmpPath = join(tmpdir(), `ds-${randomUUID()}.csv`);
    await writeFile(tmpPath, csvContent, 'utf-8');
    
    const instance = await DuckDBInstance.create(':memory:');
    const conn = await instance.connect()
    try {
      const path = tmpPath.replace(/'/g, "''");
      const delim = delimiter.replace(/'/g, "''");
      const names = columnNames.map((n) => `'${n.replace(/'/g, "''")}'`).join(', ');
      await conn.run(
        `CREATE TABLE ${TBL} AS SELECT * FROM read_csv('${path}',
           delim='${delim}', header=${hasHeader}, names=[${names}], ignore_errors=true)`,
      );
      await conn.run(`SET enable_external_access = false`);
      const results: MetricResult[] = [];
      for(const metric of metrics) {
        results.push(await this.runMetric(conn, metric, known));
      }
      return results;
    } finally {
      await conn.closeSync?.();
      await unlink(tmpPath).catch(() => {});
    }
  }

  private async runMetric(conn: any, metric: Metric, known: Set<string>) {
    const base: MetricResult = {
      name: metric.name,
      expression: metric.expression,
      confidence: metric.confidence,
      aggregation: metric.aggregation,
      description: metric.description,
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
      if(!known.has(col)) continue;
      const q = this.quote(col);
      try {
        const rows = await this.select(
          conn,
          `SELECT ${q} AS key, (${metric.expression}) AS value FROM ${TBL} GROUP BY ${q} ORDER BY value DESC NULLS LAST LIMIT ${BREAKDOWN_LIMIT}`,
        );
        base.breakdowns.push({
          column: col,
          rows: rows.map(r => ({
            key: r.key == null ? null : String(r.key),
            value: this.toNum(r.value)
          }))
        });

      } catch (err) {
         this.logger.warn(`Breakdown ${metric.name} by ${col} failed: ${this.msg(err)}`);
      }
    }
    return base;
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