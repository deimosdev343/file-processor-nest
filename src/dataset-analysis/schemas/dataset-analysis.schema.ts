import {z} from 'zod';

export const SemanticRole = z.enum([
  'identifier',
  'dimension',
  'measure',
  'timestamp',
  'geo',
  'free_text',
  'boolean_flag',
]);

export const ColumnAnalysisSchema = z.object({
  name: z.string(),
  semanticRole: SemanticRole,
  description: z.string().describe('What this column represents, in one sentence.'),
  unit: z.string().nullable().describe('e.g. USD, kg, seconds, percent. Null if unitless.'),
  isPii: z.boolean(),
  qualityIssues: z.array(z.string()).describe('Empty array if none observed.'),
});

