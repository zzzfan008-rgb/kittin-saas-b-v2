# 包体预算豁免落地指引（PR #63 / Excalidraw）

**裁定人**：architect　**日期**：2026-09-23　**执行人**：frontend
**用户拍板**：a+b 组合 = per-path 豁免登记 **+** stub 掉 mermaid 子依赖

---

## 1. 背景与责任归属

`scripts/verify-bundle-budget.mjs`（main 既有，83 行）强制单 JS chunk ≤ 500,000 bytes raw
（`DEFAULT_SINGLE_CHUNK_BUDGET`，:8），超限即 `assert.equal(oversizedChunks.length, 0, ...)`
失败（:63-67）。PR #63 引入 Excalidraw 0.18 后实测：

| chunk | raw | gzip |
|---|---|---|
| `assets/excalidraw-*.js` | 4,792,464 | 1,596,700 |
| `assets/cynefin-*.js` | 690,861 | — |

**「excalidraw chunk gzip ≤500KB」这个验收数值是 architect 从
`docs/design/2026-09-19-workbench-entry-wiring/plan.md` 的旧预估抄来的，实际超 3 倍，
属规格错误，责任在 architect，不是 frontend 实现问题。**

首屏预算（`DEFAULT_INITIAL_GZIP_BUDGET = 210_000`，:7）**不在本次豁免范围**——
Excalidraw 是 lazy chunk，不进 `initialChunkFiles()`（:16-27 只沿 entry 的 `imports` 遍历），
首屏预算维持不动，这是本方案成立的前提。

---

## 2. 豁免机制设计（照 depcruise `no-circular-baseline` 的形态）

`.dependency-cruiser.cjs` 的既有模式：**一条规则逐路径列出既存违规（baseline，允许级），
另一条同级规则对清单外的新违规保持 error**。移植到包体预算：

### 2.1 豁免清单：新建 `scripts/bundle-budget-exemptions.json`

单独文件而非内联进 `.mjs`，理由：可审计、可 diff、评审时一眼看到「谁被豁免、为什么、上限多少」。

```json
{
  "schemaVersion": 1,
  "defaultSingleChunkBytes": 500000,
  "exemptions": [
    {
      "chunkPrefix": "assets/excalidraw-",
      "maxBytes": 5242880,
      "reason": "Excalidraw 0.18 上游单包产物，无 tree-shaking 切分点；lazy chunk 不进首屏（首屏 210KB gzip 预算不受影响）。用户拍板 a+b 方案（2026-09-23）。",
      "authorizedBy": "user 2026-09-23 (a+b)",
      "reviewBy": "2026-12-31",
      "trackingIssue": 60
    },
    {
      "chunkPrefix": "assets/cynefin-",
      "maxBytes": 1048576,
      "reason": "cytoscape 布局引擎 chunk，由 Excalidraw 图形依赖引入；lazy。若 §3 的 mermaid stub 生效，此 chunk 应消失——届时删除本条目。",
      "authorizedBy": "user 2026-09-23 (a+b)",
      "reviewBy": "2026-12-31",
      "trackingIssue": 60
    }
  ]
}
```

**字段约束（全部机检）**：
- `chunkPrefix` **必须是前缀模式，不能写完整文件名**——Vite 产出带 content hash
  （`excalidraw-Bc3Dxyz.js`），写死 hash 下次构建即失效，豁免会静默变成「全部拒绝」。
- `maxBytes` 必填且 > `defaultSingleChunkBytes`：豁免是**提高上限，不是取消上限**。
  超限仍然 fail，防止 chunk 无界增长。
- `reason` / `authorizedBy` / `reviewBy` 必填非空：书面理由落在清单里，跟着代码走，
  不散落在 PR 描述或聊天记录。
- `reviewBy` 到期后由 reviewer/architect 在门禁评审时追问（与 depcruise baseline 同理）。

### 2.2 改 `verify-bundle-budget.mjs`（最小补丁）

`verifyBundleBudget()` 增加可选参数 `exemptions`（默认从 `bundle-budget-exemptions.json` 读），
只改 :48 那一处过滤逻辑：

```js
// 现状（:48）
const oversizedChunks = allChunks.filter((chunk) => chunk.bytes > singleChunkBudget);

// 改为
const limitFor = (file) => {
  const hit = exemptions.find((e) => file.startsWith(e.chunkPrefix));
  return hit ? hit.maxBytes : singleChunkBudget;
};
const oversizedChunks = allChunks.filter((chunk) => chunk.bytes > limitFor(chunk.file));
const exemptedChunks = allChunks.filter((chunk) => limitFor(chunk.file) !== singleChunkBudget);
```

配套三件事，缺一不可：

1. **清单自身校验**（fail-closed）：读到 `exemptions` 后立刻断言每条含
   `chunkPrefix`(string, 非空) / `maxBytes`(number, > defaultSingleChunkBytes) /
   `reason`(非空) / `authorizedBy`(非空) / `reviewBy`(可解析日期)；
   `chunkPrefix` 重复 → 拒绝。清单损坏即门禁失败，不静默降级为「无豁免」。
2. **报告里显式列出豁免项**：`report.exemptedChunks = exemptedChunks`（含 file/bytes/limit/prefix），
   写进 `dist/bundle-budget.json`（:61）。豁免必须可见，不能藏在通过里。
3. **未命中任何 chunk 的豁免条目 → 失败**：如果 `assets/cynefin-` 在 §3 stub 后消失了，
   清单里那条就成了死条目，必须报错逼着删掉（防止豁免清单腐烂、越攒越多）。
   断言：`exemptions.every(e => allChunks.some(c => c.file.startsWith(e.chunkPrefix)))`。

**不要动的**：`DEFAULT_INITIAL_GZIP_BUDGET`、`initialChunkFiles()`、gzip 预算断言（:68-71）。
豁免只作用于 lazy chunk 的 raw 单包上限。

---

## 3. b 部分：stub 掉 `@excalidraw/mermaid-to-excalidraw`

**为什么能 stub**：实查 `package-lock.json`，`mermaid ^11.12.1` 是
`@excalidraw/mermaid-to-excalidraw` 的依赖，而后者只服务 Excalidraw 的
「Mermaid 图 → 画布元素」导入对话框。cytoscape / cytoscape-fcose / cose-base /
layout-base / katex 全部由 mermaid 传递引入——stub 掉这一层，`cynefin` chunk 应整体消失。

**做法**：`vite.config.ts` 的 `resolve.alias` 指向一个项目内 stub 模块
（如 `src/lib/vendor/mermaid-to-excalidraw-stub.ts`），导出与真实包**同名同形**的接口，
但实现为「抛出一个可被 UI 捕获的 not-available 错误」或返回空结果。

**必须验证的降级行为（这是 b 部分的真实风险，不能跳过）**：
- Excalidraw 内部若**硬 import** 该包并在初始化期调用，stub 形状不对会导致画板白屏——
  那比 chunk 超限严重得多。frontend 实现后必须实测：
  1. AI 画板正常打开、可绘制、可导出 PNG → image 节点（#60 的原验收不变）；
  2. 打开 Mermaid 导入对话框 → **给出可读的「此功能不可用」提示，不白屏、不抛未捕获异常**；
  3. 控制台无新增未处理 promise rejection。
- 若 (1) 失败，说明 stub 不可行 → **回退到纯 (a) 方案**，保留 cynefin 豁免条目，
  并把这个结论报回 architect；不要为了让 CI 变绿而削弱画板功能（AGENTS.md §3）。
- 若 (1)(2) 通过且 cynefin chunk 消失 → 按 §2.2 第 3 条**删掉 cynefin 豁免条目**（死条目会报错）。

---

## 4. 验收（机检，全绿才算完成）

| # | 检查 | 期望 |
|---|---|---|
| 1 | `npm run build && npx tsx scripts/verify-bundle-budget.mjs` | 通过；`dist/bundle-budget.json` 含 `exemptedChunks` 且列出 excalidraw |
| 2 | 初始 gzip 预算 | ≤ 210,000 bytes，**未因豁免而放宽** |
| 3 | 清单外 chunk | 全部 ≤ 500,000 bytes（豁免不得外溢） |
| 4 | 故意把 `maxBytes` 改成 1000 | 门禁**失败**（证明豁免是有上限的豁免，不是放行） |
| 5 | 故意删掉 `reason` 字段 | 门禁**失败**（证明清单校验 fail-closed） |
| 6 | 画板功能实测 | §3 三条降级验证全过 |
| 7 | 五检查 CI | static / unit / e2e / production-smoke / code-intelligence 在精确 head 全绿 |

第 4、5 条是「豁免机制本身可被绕过吗」的反向验证——豁免登记如果不带这两条负向测试，
就等于给门禁开了个无法审计的口子。请把它们写成单测（`tests/` 下），不要只在本地手测。

---

## 5. 边界

- 本指引只授权 **excalidraw / cynefin 两个 lazy chunk** 的豁免，不构成「包体预算可以谈」的先例。
  后续任何新豁免都要走用户授权 + 书面理由 + reviewBy。
- 不改 AGENTS.md、不改 depcruise 规则、不改首屏预算、不动 Results 相关能力（§3）。
- 豁免清单是**交付契约的一部分**，评审时 reviewer 应逐条核对 reason 与 authorizedBy。
