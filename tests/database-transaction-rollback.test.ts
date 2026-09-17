import assert from "node:assert/strict";
import { rollbackPreservingError } from "../server/lib/databaseRuntime";

console.log("transaction() ROLLBACK 掩蔽回归测试");

// ROLLBACK 成功时：必须原样返回原始错误，且不得附加 cause。
{
  const original = new Error("business failure");
  const queries: string[] = [];
  const client = {
    query: async (text: string) => {
      queries.push(text);
      return { rows: [] };
    },
  };
  const returned = await rollbackPreservingError(client, original);
  assert.equal(returned, original, "ROLLBACK 成功时必须返回原始错误");
  assert.ok(!("cause" in original), "ROLLBACK 成功时不得给原始错误附加 cause");
  assert.deepEqual(queries, ["ROLLBACK"], "回滚必须发出 ROLLBACK 语句");
  console.log("  ✓ ROLLBACK 成功时原样返回原始错误且不附加 cause");
}

// ROLLBACK 失败时：必须仍返回原始错误（而非 ROLLBACK 错误），并把 ROLLBACK 失败作为 cause 保留。
{
  const original = new Error("business failure");
  const rollbackFailure = new Error("connection terminated");
  const client = {
    query: async (_text: string) => {
      throw rollbackFailure;
    },
  };
  const returned = await rollbackPreservingError(client, original);
  assert.equal(returned, original, "ROLLBACK 失败时仍必须返回原始错误，不得被 ROLLBACK 错误替换");
  assert.equal(original.cause, rollbackFailure, "ROLLBACK 失败必须作为原始错误的 cause 保留");
  console.log("  ✓ ROLLBACK 失败时返回原始错误且以 cause 保留 ROLLBACK 失败");
}
