/**
 * 持久化生成队列：facade 模块。
 *
 * 实现已拆分到 ./runQueue/ 子目录（types/events/evaluation/promptAdmission/
 * persist/claim/lifecycle/worker/queries），本文件保留 ./runQueue 路径作为
 * 稳定入口；外部 importer 不需要改路径。
 *
 * 同时保留 runQueueContracts 的错误类型 re-export 身份，供
 * module-facade-contract.test.ts 的引用相等断言。
 */
export * from "./runQueue/index";
export {
  ActiveRunLimitError,
  CancelledBeforeProviderCall,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
} from "./runQueueContracts";
export type { DurableRunStatus } from "./runQueueContracts";
export { ACTIVE_RUN_LIMIT } from "../lib/generationLimits";
