/**
 * 把「本次生成运行」的异步任务存证回调透传到 Provider 提交成功的那一刻。
 *
 * 为什么用 AsyncLocalStorage：图片 Provider 的 generate/edit 契约是冻结的，
 * 且中间隔着 runner → exact → gateway → asyncImageTask 四层。给接口加参数会
 * 牵动全部 Provider 与测试；ALS 不动任何签名，并在同一进程多个并发 worker
 * 之间天然隔离，不会出现 A 运行的 task_id 写进 B 运行的步骤记录。
 *
 * 这条链路只做一件事：任务刚建立就把 task_id 落库。之后即便进程被杀、
 * 租约过期被标 outcome_unknown，「尝试找回图片」仍能按 task_id 幂等取回，
 * 不必重新生成、不重复计费。
 */
import { AsyncLocalStorage } from "node:async_hooks";

export interface AsyncImageTaskHook {
  /** 提交成功、拿到 task_id 后立即调用；实现方负责持久化。 */
  onSubmitted?: (taskId: string) => void | Promise<void>;
}

const storage = new AsyncLocalStorage<AsyncImageTaskHook>();

export function runWithAsyncImageTaskHook<T>(
  hook: AsyncImageTaskHook,
  run: () => Promise<T>,
): Promise<T> {
  return storage.run(hook, run);
}

/**
 * 尽力而为：任务已经在上游排队，存证失败绝不能中断后续轮询（否则会把一张
 * 本来能拿到的图丢掉）。因此这里只记录错误日志，不向调用方抛异常。
 */
export async function notifyAsyncImageTaskSubmitted(taskId: string): Promise<void> {
  const hook = storage.getStore();
  if (!hook?.onSubmitted) return;
  try {
    await hook.onSubmitted(taskId);
  } catch (error) {
    console.error("[gemini-async-task-evidence-failed]", JSON.stringify({
      taskId,
      error: error instanceof Error ? error.message : String(error),
    }));
  }
}
