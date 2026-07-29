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


export const MetricSchema = z.object({
  name: z.string(),
  description: z.string(),
  aggregation: z.enum([
    'sum',
    'avg',
    'count',
    'count_distinct',
    'min',
    'max',
    'median',
    'ratio',
    'derived',
  ]),
  expression: z
    .string()
    .describe('SQL-like expression over the column names, e.g. SUM(revenue) / COUNT(DISTINCT order_id)'),
  requiredColumns: z.array(z.string()),
  suggestedBreakdowns: z.array(z.string()).describe('Column names this metric is worth sliced by.'),
  confidence: z.enum(['high', 'medium', 'low']),
});

