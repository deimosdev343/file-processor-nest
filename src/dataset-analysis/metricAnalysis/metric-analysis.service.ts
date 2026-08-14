
import { Injectable, Logger } from '@nestjs/common';
import { DuckDBInstance } from '@duckdb/node-api';
import { randomUUID } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MetricResult, MetricBreakdown } from './metric-analysis.interfaces';

const TBL = 'dataset';
const BREAKDOWN_LIMIT = 50;

@Injectable()
export class MetricExecutorService {
  private readonly logger = new Logger(MetricExecutorService.name);
  
}