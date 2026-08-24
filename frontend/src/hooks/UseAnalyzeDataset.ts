import { useMutation } from "@tanstack/react-query";
import { analyzeDataset, type AnalyzeParams } from "#/lib/api";
import type { AnalyzeResponse } from "#/types/api.types";

export function useAnalyzeDataset() {
  return useMutation<AnalyzeResponse, Error,AnalyzeParams>({
    mutationFn: analyzeDataset
  });
}