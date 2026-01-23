export interface TextGenerationResult {
  text: string;
  timeTakenMs: number;
  modelUsed: string;
}

export interface ModelInfo {
  name: string;
  displayName: string;
  description?: string;
  contextWindowSize: number;
  maxOutputTokens: number;
  pricing: {
    inputPerMillion: string;
    cachedInputPerMillion: string;
    outputPerMillion: string;
  };
}