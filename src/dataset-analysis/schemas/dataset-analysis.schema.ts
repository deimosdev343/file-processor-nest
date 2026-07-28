import {z} from 'zod';

export const semanticRole = z.enum([
  'identifier',
  'dimension',
  'measure',
  'timestamp',
  'geo',
  'free_text',
  'boolean_flag',
]);
