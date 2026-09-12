import { Agent, type Dispatcher } from "undici";
import { config } from "../config";
import { ProviderError } from "./base";

export const APIYI_UNDICI_PROFILE = Object.freeze({
  connectTimeoutMs: 30_000,
  headersTimeoutMs: 600_000,
  bodyTimeoutMs: 300_000,
  keepAliveTimeoutMs: 60_000,
  keepAliveMaxTimeoutMs: 60_000,
});

export const APIYI_TAIL_STALL_DEFAULTS = Object.freeze({
  graceMs: 5_000,
  minBytes: 1_024,
});

let sharedDispatcher: Agent | undefined;

/** API易专属连接池；不修改 Node 全局 dispatcher。 */
export function getApiyiDispatcher(): Dispatcher {
  sharedDispatcher ??= new Agent({
    connect: { timeout: APIYI_UNDICI_PROFILE.connectTimeoutMs },
    headersTimeout: APIYI_UNDICI_PROFILE.headersTimeoutMs,
    bodyTimeout: APIYI_UNDICI_PROFILE.bodyTimeoutMs,
    keepAliveTimeout: APIYI_UNDICI_PROFILE.keepAliveTimeoutMs,
    keepAliveMaxTimeout: APIYI_UNDICI_PROFILE.keepAliveMaxTimeoutMs,
  });
  return sharedDispatcher;
}

/** 只供测试或完整进程停机流程释放模块级连接池。 */
export async function closeApiyiDispatcher(): Promise<void> {
  const dispatcher = sharedDispatcher;
  sharedDispatcher = undefined;
  if (dispatcher) await dispatcher.close();
}

export interface ApiyiTailRecoveryEvent {
  event: "apiyi_tail_stall_salvaged";
  providerId: string;
  bytes: number;
  graceMs: number;
}

export interface ReadApiyiJsonOptions {
  maxBytes: number;
  salvageEnabled?: boolean;
  graceMs?: number;
  minBytes?: number;
  onSalvaged?: (event: ApiyiTailRecoveryEvent) => void;
}

type PendingReadResult =
  | { kind: "read"; result: ReadableStreamReadResult<Uint8Array> }
  | { kind: "grace" };

function waitForPendingRead(
  pendingRead: Promise<ReadableStreamReadResult<Uint8Array>>,
  graceMs: number,
): Promise<PendingReadResult> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ kind: "grace" });
    }, graceMs);
    pendingRead.then(
      (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ kind: "read", result });
      },
      (error: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function lastNonWhitespaceByte(chunks: Uint8Array[]): number | undefined {
  for (let chunkIndex = chunks.length - 1; chunkIndex >= 0; chunkIndex -= 1) {
    const chunk = chunks[chunkIndex];
    for (let byteIndex = chunk.byteLength - 1; byteIndex >= 0; byteIndex -= 1) {
      const byte = chunk[byteIndex];
      if (byte !== 0x20 && byte !== 0x09 && byte !== 0x0a && byte !== 0x0d) return byte;
    }
  }
  return undefined;
}

function joinedBytes(chunks: Uint8Array[], totalBytes: number): Uint8Array {
  const joined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

function parseJson(chunks: Uint8Array[], totalBytes: number): unknown {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(joinedBytes(chunks, totalBytes));
  return JSON.parse(text) as unknown;
}

function tryParseCompleteObject(chunks: Uint8Array[], totalBytes: number): Record<string, unknown> | undefined {
  if (lastNonWhitespaceByte(chunks) !== 0x7d) return undefined;
  try {
    const parsed = parseJson(chunks, totalBytes);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : undefined;
  } catch {
    return undefined;
  }
}

function cancelReader(reader: ReadableStreamDefaultReader<Uint8Array>, reason: string): void {
  void reader.cancel(reason).catch(() => undefined);
}

/**
 * 有界读取 API易 2xx JSON。尾部恢复只处理“完整对象已到齐但无终止信号”；
 * 截断、读流错误、Content-Length 响应和非法 UTF-8 均不得被误判为成功。
 */
export async function readApiyiJsonResponse(
  response: Response,
  providerId: string,
  options: ReadApiyiJsonOptions,
): Promise<unknown> {
  const maxBytes = options.maxBytes;
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new Error("readApiyiJsonResponse maxBytes must be a positive safe integer");
  }

  const contentLengthHeader = response.headers.get("content-length");
  if (contentLengthHeader !== null && /^\d+$/.test(contentLengthHeader)) {
    const advertisedBytes = Number(contentLengthHeader);
    if (!Number.isSafeInteger(advertisedBytes) || advertisedBytes > maxBytes) {
      if (response.body) cancelReader(response.body.getReader(), "response-too-large");
      throw new ProviderError(
        "AI 响应超过本次请求允许的大小，结果可能已经生成；系统不会自动重试",
        502,
        providerId,
        "outcome_unknown",
        `content-length ${contentLengthHeader} exceeds ${maxBytes}`,
      );
    }
  }

  const salvageEnabled = options.salvageEnabled ?? config.apiyiTailStallSalvageEnabled();
  if (!response.body) throw new Error("API易响应缺少 body");

  const graceMs = options.graceMs ?? config.apiyiTailStallGraceMs();
  const minBytes = options.minBytes ?? APIYI_TAIL_STALL_DEFAULTS.minBytes;
  // 开关只控制尾部提前收尾；无论是否开启，都必须保留流式大小上限。
  const canSalvageTail = salvageEnabled && contentLengthHeader === null;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let pendingRead: Promise<ReadableStreamReadResult<Uint8Array>> | undefined;
  let lastAttemptedByteCount = -1;

  for (;;) {
    pendingRead ??= reader.read();
    const shouldArmGrace = canSalvageTail && totalBytes >= minBytes;
    const next = shouldArmGrace
      ? await waitForPendingRead(pendingRead, graceMs)
      : { kind: "read" as const, result: await pendingRead };

    if (next.kind === "grace") {
      if (totalBytes !== lastAttemptedByteCount) {
        lastAttemptedByteCount = totalBytes;
        const parsed = tryParseCompleteObject(chunks, totalBytes);
        if (parsed) {
          cancelReader(reader, "complete-json-tail-stall");
          const event: ApiyiTailRecoveryEvent = {
            event: "apiyi_tail_stall_salvaged",
            providerId,
            bytes: totalBytes,
            graceMs,
          };
          if (options.onSalvaged) options.onSalvaged(event);
          else console.warn("[garment-canvas] API易响应尾部已安全收尾", event);
          return parsed;
        }
      }
      // timer 赢时继续等待同一个 pending read；禁止发起并发 reader.read()。
      continue;
    }

    pendingRead = undefined;
    if (next.result.done) return parseJson(chunks, totalBytes);
    const chunk = next.result.value;
    if (!chunk?.byteLength) continue;
    totalBytes += chunk.byteLength;
    if (totalBytes > maxBytes) {
      cancelReader(reader, "response-too-large");
      throw new ProviderError(
        "AI 响应超过本次请求允许的大小，结果可能已经生成；系统不会自动重试",
        502,
        providerId,
        "outcome_unknown",
        `streamed ${totalBytes} bytes exceeds ${maxBytes}`,
      );
    }
    chunks.push(chunk);
  }
}
