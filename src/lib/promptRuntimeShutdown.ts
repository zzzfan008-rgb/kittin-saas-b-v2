import type { EvaluationShutdownRule } from "../types/promptEvaluation";

/**
 * Reviewed runtime kill-switch manifest. It is intentionally empty at first
 * release; changes are code-reviewed and affect both browser feedback and the
 * authoritative server admission gate on the next deployment.
 */
export const PROMPT_RUNTIME_SHUTDOWN_RULES: readonly EvaluationShutdownRule[] = [];
