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
  backOfMs: number;
  jobTimeoutMs: number;
  resultTtlHours: number;
}

export const  QUEUE_CONFIG = 'queue';
