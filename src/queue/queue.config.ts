import { registerAs } from '@nestjs/config';

export interface QueueConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  prefix: string;
  stagingDir: string;
  concurrency: number;
  attempts: number;
  backoffMs: number;
  jobTimeoutMs: number;
  resultTtlHours: number;
}

export const  QUEUE_CONFIG = 'queue';

export default registerAs(
  QUEUE_CONFIG,
  (): QueueConfig => ({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB ?? 0),
    prefix: process.env.REDIS_PREFIX ?? 'dsa',
    stagingDir: process.env.QUEUE_STAGING_DIR ?? '/tmp/dataset-analysis',
    concurrency: Number(process.env.QUEUE_CONCURRENCY ?? 2),
    attempts: Number(process.env.QUEUE_ATTEMPTS ?? 3),
    backoffMs: Number(process.env.QUEUE_BACKOFF_MS ?? 5_000),
    jobTimeoutMs: Number(process.env.QUEUE_JOB_TIMEOUT_MS ?? 180_000),
    resultTtlHours: Number(process.env.QUEUE_RESULT_TTL_HOURS ?? 24),
  }),
);
