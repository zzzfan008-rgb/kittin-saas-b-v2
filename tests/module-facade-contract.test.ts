import assert from "node:assert/strict";
import {
  closeDatabaseForTests as closeDatabaseForTestsFacade,
  db as dbFacade,
  query as queryFacade,
  queryOne as queryOneFacade,
  transaction as transactionFacade,
} from "../server/lib/database";
import {
  closeDatabaseForTests,
  db,
  query,
  queryOne,
  transaction,
} from "../server/lib/databaseRuntime";
import {
  ActiveRunLimitError as ActiveRunLimitErrorFacade,
  EvaluationCaseConflictError as EvaluationCaseConflictErrorFacade,
  GenerationOwnerUnavailableError as GenerationOwnerUnavailableErrorFacade,
  GenerationRequestConflictError as GenerationRequestConflictErrorFacade,
} from "../server/engine/runQueue";
import {
  ActiveRunLimitError,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
} from "../server/engine/runQueueContracts";
import { postProcessGeneratedOutputImages as postProcessFacade } from "../server/engine/runner";
import { postProcessGeneratedOutputImages } from "../server/engine/runnerOutputProcessing";
import {
  applyRunEventToNode as applyRunEventToNodeFacade,
  normalizeRunEvent as normalizeRunEventFacade,
  requestedResultCount as requestedResultCountFacade,
} from "../src/store/flowStore";
import {
  applyRunEventToNode,
  normalizeRunEvent,
  requestedResultCount,
} from "../src/store/flowRunEvents";
import { apiErrorMessage } from "../src/lib/apiErrors";
import {
  IMAGE_OPERATION_MODE_VALUES as WORKFLOW_IMAGE_OPERATION_MODE_VALUES,
  type ImageOperationMode as WorkflowImageOperationMode,
} from "../src/types/workflow";
import {
  IMAGE_OPERATION_MODE_VALUES,
  type ImageOperationMode,
} from "../src/types/imageOperations";
import type { ModelParameterProfile } from "../src/types/modelParameterProfiles";

console.log("兼容门面导出契约测试");

assert.equal(dbFacade, db);
assert.equal(queryFacade, query);
assert.equal(queryOneFacade, queryOne);
assert.equal(transactionFacade, transaction);
assert.equal(closeDatabaseForTestsFacade, closeDatabaseForTests);
console.log("  ✓ 数据库旧入口保持运行时导出身份");

assert.equal(GenerationRequestConflictErrorFacade, GenerationRequestConflictError);
assert.equal(ActiveRunLimitErrorFacade, ActiveRunLimitError);
assert.equal(GenerationOwnerUnavailableErrorFacade, GenerationOwnerUnavailableError);
assert.equal(EvaluationCaseConflictErrorFacade, EvaluationCaseConflictError);
console.log("  ✓ 持久队列旧入口保持错误类型身份");

assert.equal(postProcessFacade, postProcessGeneratedOutputImages);
console.log("  ✓ Runner 旧入口保持输出后处理身份");

assert.equal(normalizeRunEventFacade, normalizeRunEvent);
assert.equal(applyRunEventToNodeFacade, applyRunEventToNode);
assert.equal(requestedResultCountFacade, requestedResultCount);
console.log("  ✓ Flow store 旧入口保持运行事件帮助函数身份");

assert.equal(WORKFLOW_IMAGE_OPERATION_MODE_VALUES, IMAGE_OPERATION_MODE_VALUES);
const workflowMode: WorkflowImageOperationMode = "edit";
const sharedMode: ImageOperationMode = workflowMode;
const profileMode: ModelParameterProfile["mode"] = sharedMode;
assert.equal(profileMode, "edit");
console.log("  ✓ 图片操作模式由单一契约定义且旧入口保持导出身份");

assert.equal(apiErrorMessage(400, { error: " invalid request " }), "invalid request");
assert.equal(apiErrorMessage(503, { error: "   " }), "HTTP 503");
assert.equal(apiErrorMessage(500, null, "上传失败 HTTP 500"), "上传失败 HTTP 500");
assert.equal(apiErrorMessage(401, { error: 123 }, "登录失败"), "登录失败");
assert.equal(apiErrorMessage(418, {}, "   "), "HTTP 418");
console.log("  ✓ 客户端 API 错误消息使用一致的服务端优先与本地回退语义");

await closeDatabaseForTests();
