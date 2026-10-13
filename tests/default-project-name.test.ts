// defaultProjectName 同日去重接线回归（reviewer gate P3）。
// 修前：newTab 唯一默认命名调用点不传 takenNames，同日建多个新 tab 全部重名。
// 修后：createBlankTab / replaceAbandonedInitialDraftWithFreshLocalTab 传入现有页签名。
// 纯 store 测试，不碰库（日期 mock 通过 defaultProjectName 的 now 参数）。
import assert from "node:assert/strict";
import { defaultProjectName, replaceAbandonedInitialDraftWithFreshLocalTab, useFlowStore } from "../src/store/flowStore";

console.log("defaultProjectName 同日去重接线测试");

// ---------- 纯函数面：defaultProjectName(takenNames, now) ----------

// 1. 无占用 → 基础名「未命名-YYYY-MM-DD」。
{
  const name = defaultProjectName([], new Date(2026, 9, 13)); // 2026-10-13（本地时区，月份 0 基）
  assert.equal(name, "未命名-2026-10-13");
}
console.log("  ✓ 无占用返回基础名");

// 2. 基础名已占用 → -2；基础名与 -2 都占用 → -3（同日多个递增）。
{
  const now = new Date(2026, 9, 13);
  assert.equal(defaultProjectName(["未命名-2026-10-13"], now), "未命名-2026-10-13-2");
  assert.equal(
    defaultProjectName(["未命名-2026-10-13", "未命名-2026-10-13-2"], now),
    "未命名-2026-10-13-3",
  );
}
console.log("  ✓ 占用递增 -2/-3");

// 3. 日期不同 → 不同基础名（mock now，互不影响）。
{
  const name = defaultProjectName(["未命名-2026-10-13"], new Date(2026, 9, 14));
  assert.equal(name, "未命名-2026-10-14", "次日基础名不受昨日占用影响");
}
console.log("  ✓ 跨日基础名独立");

// 4. 占用其他前缀名（如「未修改项目名称…」初始草稿名）不影响去重。
{
  const name = defaultProjectName(["未修改项目名称20261013000000"], new Date(2026, 9, 13));
  assert.equal(name, "未命名-2026-10-13");
}
console.log("  ✓ 非同前缀名不参与占用");

// ---------- store 接线面：createBlankTab ----------

// 5. 同日连续 createBlankTab 两次 → 第二个名字是「未命名-…-2」（P3 修复主场景）。
{
  const today = defaultProjectName([], new Date());
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().createBlankTab();
  const names = useFlowStore.getState().tabs.map((tab) => tab.projectName);
  assert.ok(names.includes(today), `首个空白页签应为 ${today}，实际：${names.join(" / ")}`);
  assert.ok(
    names.includes(`${today}-2`),
    `第二个同日空白页签应为 ${today}-2，实际：${names.join(" / ")}`,
  );
  assert.equal(new Set(names).size, names.length, "同日页签名必须互不相同");
}
console.log("  ✓ createBlankTab 同日连续两次 → -2 后缀去重");

// ---------- replaceAbandonedInitialDraftWithFreshLocalTab：被替换名不占位 ----------

// 6. 替换废弃初始草稿时，被替换页签自己的名不算占用；其余页签名参与去重。
{
  const state = useFlowStore.getState();
  const today = defaultProjectName([], new Date());
  // 已有：一个名为 today 的普通页签 + 一个 initial_draft 页签（草稿名不重要）。
  const existing = state.tabs[0];
  assert.ok(existing, "前置用例应已存在至少一个页签");
  // 把一个现有页签改名为 today（模拟同日已有一个默认名项目），再造一个 initial_draft 页签。
  const draftTab = {
    ...existing,
    id: "draft-tab-x",
    projectName: "未修改项目名称20261013000000",
    lifecycle: "initial_draft" as const,
  };
  useFlowStore.setState({
    tabs: [{ ...existing, projectName: today }, draftTab],
    activeTabId: draftTab.id,
  });
  const fresh = replaceAbandonedInitialDraftWithFreshLocalTab("draft-tab-x");
  assert.ok(fresh, "initial_draft 页签必须可被替换");
  assert.equal(
    fresh!.projectName,
    `${today}-2`,
    `替换时应避开其他页签的 ${today}，实际：${fresh!.projectName}`,
  );
}
console.log("  ✓ 替换初始草稿去重：排除被替换名，避让其他页签同名");

// ---------- newTab 未接线点保持原状（防御性回归护栏） ----------

// 7. openFlowTab 显式 projectName 不被 takenNames 影响（路径传了 projectName）。
{
  useFlowStore.getState().openFlowTab({
    projectId: "explicit-name-project",
    projectName: "我的项目",
    nodes: [],
    edges: [],
  });
  const tab = useFlowStore.getState().tabs.find((t) => t.projectId === "explicit-name-project");
  assert.equal(tab?.projectName, "我的项目", "显式 projectName 必须原样保留");
}
console.log("  ✓ 显式 projectName 路径不受影响");

console.log("\n通过 7 项");
