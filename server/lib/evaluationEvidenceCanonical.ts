import { createHash } from "node:crypto";

export type EvaluationJsonValue =
  | null
  | boolean
  | number
  | string
  | EvaluationJsonValue[]
  | { [key: string]: EvaluationJsonValue };

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function assertString(
  value: unknown,
  name: string,
  options: { max?: number; pattern?: RegExp } = {},
): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > (options.max ?? 256)) {
    throw new TypeError(`${name} must be a non-empty string no longer than ${options.max ?? 256} characters`);
  }
  if (options.pattern && !options.pattern.test(value)) {
    throw new TypeError(`${name} has an invalid format`);
  }
}

export function assertIsoTimestamp(value: unknown, name: string): asserts value is string {
  assertString(value, name, { max: 40 });
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new TypeError(`${name} must be a canonical ISO-8601 timestamp`);
  }
}

export function canonicalJsonValue(value: unknown, path = "value"): EvaluationJsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${path} contains a non-finite number`);
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => canonicalJsonValue(item, `${path}[${index}]`));
  }
  if (typeof value !== "object") {
    throw new TypeError(`${path} must be JSON-safe and may not contain ${typeof value}`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${path} must contain plain JSON objects only`);
  }
  const output: Record<string, EvaluationJsonValue> = {};
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    output[key] = canonicalJsonValue((value as Record<string, unknown>)[key], `${path}.${key}`);
  }
  return output;
}

export function stableJson(value: unknown): string {
  return JSON.stringify(canonicalJsonValue(value));
}

export function cloneCanonical<T>(value: T): T {
  return JSON.parse(stableJson(value)) as T;
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
