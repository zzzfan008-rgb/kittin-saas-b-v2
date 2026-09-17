import type { RequestHandler } from "express";

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  now?: () => number;
  /** 清扫过期桶的间隔（毫秒）；默认等于 windowMs。 */
  sweepIntervalMs?: number;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

/**
 * 创建进程内的轻量限流器。它只保护昂贵的 AI 路由；服务重启后计数重置。
 * 过期桶由定时器定期清扫，避免长期运行下 Map 按客户端 IP 无限增长。
 */
export function createRateLimitMiddleware(options: RateLimitOptions = {}): RequestHandler {
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 100;
  const now = options.now ?? Date.now;
  const sweepIntervalMs = options.sweepIntervalMs ?? windowMs;
  const buckets = new Map<string, RateBucket>();

  const sweeper = setInterval(() => {
    const currentTime = now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= currentTime) buckets.delete(key);
    }
  }, sweepIntervalMs);
  sweeper.unref();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const currentTime = now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= currentTime) {
      bucket = { count: 0, resetAt: currentTime + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > maxRequests) {
      res.status(429).json({
        error: "Too many requests, please slow down",
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1_000)),
      });
      return;
    }
    next();
  };
}
