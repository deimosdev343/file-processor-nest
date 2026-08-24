import { createServerFn } from "@tanstack/react-start";
import type { AnalyzeResponse } from "#/types/api.types";
import { URLSearchParams } from "url";

export const DELIMITER_ALIASES = ['comma', 'tab', 'semicolon', 'pipe', 'space'] as const;

export type DelimiterAlias = (typeof DELIMITER_ALIASES)[number];

export interface AnalyzeParams {
  file: File;
  delimiter: string;
  headerRow?: number;
}

export const analyzeServerFn = createServerFn({method:"POST"}) 
  .validator((data: unknown) : FormData => {
    if(!(data instanceof FormData)) throw new Error("Expected multipart formdata");
    return data;
  })
  .handler(async ({data}) => {
    const apiUrl = process.env.API_URL ?? 'http://localhost:8000';
    const file = data.get('file');
    if(!(file instanceof File)) throw Error("Not a file");

    const params = new URLSearchParams();
    const delimiter = data.get('delimiter');
    const row = data.get('row');
    if (typeof delimiter === 'string' && delimiter) params.set('delimiter', delimiter);
    if (typeof row === 'string' && row) params.set('row', row);
    
    const upstream = new FormData();
    upstream.append('file', file);

    const res = await fetch(`${apiUrl}/dataset-analysis/analyze?${params}`, {
      method: 'POST',
      body: upstream,
    });
    if (!res.ok) throw new Error(await extractNestError(res));
    return res.json() as Promise<AnalyzeResponse>;
  });


async function extractNestError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
    }   
  } catch (error) {}
  return `Analysis failed (${res.status} ${res.statusText})`;
}


export function analyzeDataset({ file, delimiter, headerRow }: AnalyzeParams): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append('file', file);
  if (delimiter) form.append('delimiter', delimiter);
  if (Number(headerRow) > 0) form.append('row', String(headerRow));
  return analyzeServerFn({ data: form });
}
 
