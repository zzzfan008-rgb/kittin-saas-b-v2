export interface OpenAiMaskTestDocument {
  prompt: string;
  source?: string;
  mask?: string;
  requestId?: string;
}

export interface OpenAiMaskTestRecord {
  id: string;
  status: "running" | "succeeded" | "failed" | "outcome_unknown";
  model: "gpt-image-2";
  prompt: string;
  source: string;
  mask: string;
  sourceSha256: string;
  maskSha256: string;
  createdAt: string;
  finishedAt?: string;
  image?: string;
  error?: string;
}
