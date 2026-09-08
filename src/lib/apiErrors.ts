export interface ApiErrorPayload {
  error?: unknown;
}

export function apiErrorMessage(
  status: number,
  body: unknown,
  fallback = `HTTP ${status}`,
): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const error = (body as ApiErrorPayload).error;
    if (typeof error === "string" && error.trim()) return error.trim();
  }
  return fallback.trim() || `HTTP ${status}`;
}
