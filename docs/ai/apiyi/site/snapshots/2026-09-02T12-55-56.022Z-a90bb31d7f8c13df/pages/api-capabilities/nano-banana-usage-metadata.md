> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# usage 字段与输出解读

> 解读 gemini-3-pro-image 响应 JSON 的输出结构与 usageMetadata 各字段含义，解释三个看似异常、实际是模型固有行为的计数现象

本文面向通过 API易 调用 `gemini-3-pro-image`（Nano Banana Pro）的开发者，解释响应 JSON 的输出结构与 `usageMetadata` 各字段的实际含义，并说明几个**看起来像异常、实际是模型固有行为**的计数现象。全部结论来自对生产网关的实测（48 次文生图 + 18 次图片编辑），并与谷歌官方文档（`ai.google.dev/gemini-api/docs/image-generation`）交叉核对，非推测。

## 响应的整体结构

API易 的 nano banana 系列走 Google 原生格式，响应顶层固定四个字段：

```json theme={null}
{
  "candidates":    [ ... ],          // 生成结果（图片/文本 parts）
  "usageMetadata": { ... },          // token 用量
  "modelVersion":  "gemini-3-pro-image",
  "responseId":    "..."
}
```

### 成功出图时

```json theme={null}
"candidates": [{
  "content": {
    "role": "model",
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }
    ]
  },
  "finishReason": "STOP",
  "index": 0
}]
```

<Warning>
  **parts 里可能不止一张图**。当提示词是复杂任务型（如"人物四视图/角色设定图"这类多约束任务）时，模型可能一次返回多张图片 part（实测 2–10 张）——它们是模型"思考过程"生成的中间稿加最终稿，官方文档明确"思考中的最后一张图片也是最终渲染的图片"，**取最后一张即可**。纯文生图和简单编辑（加饰品/换背景/换风格）通常只返回 1 张。无论哪种情况，解析时都请遍历 parts，需要单图时取最后一个 `inlineData`。现象详解见 [开发指南 · 偶现多图输出是怎么回事](/api-capabilities/nano-banana-dev-guide#偶现多图输出是怎么回事)。
</Warning>

#### parts 里还可能混有文本段

上面示例里 `parts` 只有一个图片段，但这**不是固定结构**。`parts` 是异构数组，实测出现过三种排列：

| parts 结构              | 长度 | 图片下标    |
| --------------------- | -- | ------- |
| `inlineData`          | 1  | `0`     |
| `text` + `inlineData` | 2  | **`1`** |
| `inlineData` + `text` | 2  | **`0`** |

`responseModalities` 里含 `TEXT`、提示词要求模型给出文字说明，都会让响应里多出文本段；文本段排在图片前还是图片后也不固定。**因此图片落在哪个下标并非定值。**

<Warning>
  写死下标的两种写法是**互补**的：图片必落在 `[0]` 或 `[1]`，写死任一个都存在拿不到图的请求。正确做法见下文 [解析与对账最佳实践](#解析与对账最佳实践)；也可在 `generationConfig` 里显式声明 `responseModalities: ["IMAGE"]` 表明只要图片作为加固，但**不能替代**遍历筛选。
</Warning>

### 被安全策略拦截时

HTTP 状态码**仍是 200**，区别在 candidate 内部：

```json theme={null}
"candidates": [{
  "content": { "parts": null },        // ⚠️ parts 为 null，不是空数组
  "finishReason": "IMAGE_SAFETY",      // 或 NO_IMAGE / PROHIBITED_CONTENT
  "finishMessage": "Unable to show the generated image. ...",  // 仅部分场景携带
  "index": 0
}]
```

* `finishReason` 取值实测有三种：`IMAGE_SAFETY`（输出图违规）、`PROHIBITED_CONTENT`（触发禁用政策，附带 `finishMessage` 说明）、`NO_IMAGE`（未生成图片，通常秒回）。
* 拒绝说明放在 `finishMessage` 字段里，**不会**以文本 part 形式出现在 `parts` 中。
* 解析代码务必兼容 `parts` 为 `null` 的情况，否则拦截响应会导致报错。

<Tip>
  各类失败的判断指标、内容审核政策与友好提示方案，见 [Gemini 出图错误处理指南](/api-capabilities/gemini-image-error-handling)。
</Tip>

## usageMetadata 字段含义

成功出图时固定 6 个字段：

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 615,          // 输入总 tokens（文本 + 输入图片）
  "candidatesTokenCount": 2478,     // 输出总 tokens（含图片 + 内部生成 tokens）
  "thoughtsTokenCount": 208,        // 思考（推理）tokens
  "totalTokenCount": 3301,          // 本次请求计费总量
  "promptTokensDetails":     [ { "modality": "TEXT",  "tokenCount": 99 },
                               { "modality": "IMAGE", "tokenCount": 516 } ],
  "candidatesTokensDetails": [ { "modality": "IMAGE", "tokenCount": 2240 } ]
}
```

| 字段                        | 含义                    | 可靠性                              |
| ------------------------- | --------------------- | -------------------------------- |
| `promptTokenCount`        | 输入侧总量                 | ✅ 恒等于 `promptTokensDetails` 之和   |
| `candidatesTokenCount`    | 输出侧总量                 | ✅ 计费口径；**但大于 details 之和，见下文现象一** |
| `thoughtsTokenCount`      | 思考 tokens，实测通常 50–350 | ✅                                |
| `totalTokenCount`         | 总量                    | ✅ 出图时恒等于前三项之和；**拒绝时例外，见下文现象二**   |
| `promptTokensDetails`     | 输入按模态分解               | ✅ 完整分解                           |
| `candidatesTokensDetails` | 输出按模态分解               | ⚠️ **只是图片部分，不是完整分解**             |

**图片 tokens 由分辨率档决定，与宽高比无关**：1K 与 2K 档均为 **1120 tokens/张**，4K 档为 **2000 tokens/张**；宽高比只改变像素尺寸，不改变 token 数。一次返回 N 张图则 details 精确等于 N × 单张值。

下表为谷歌官方给出的 Pro Image 宽高比与图片大小对照（来源：`ai.google.dev/gemini-api/docs/image-generation`），与我们对 `gemini-3-pro-image` 的实测完全一致：

| 宽高比  | 1K 尺寸     | 1K tokens | 2K 尺寸     | 2K tokens | 4K 尺寸     | 4K tokens |
| ---- | --------- | --------- | --------- | --------- | --------- | --------- |
| 1:1  | 1024x1024 | 1120      | 2048x2048 | 1120      | 4096x4096 | 2000      |
| 2:3  | 848x1264  | 1120      | 1696x2528 | 1120      | 3392x5056 | 2000      |
| 3:2  | 1264x848  | 1120      | 2528x1696 | 1120      | 5056x3392 | 2000      |
| 3:4  | 896x1200  | 1120      | 1792x2400 | 1120      | 3584x4800 | 2000      |
| 4:3  | 1200x896  | 1120      | 2400x1792 | 1120      | 4800x3584 | 2000      |
| 4:5  | 928x1152  | 1120      | 1856x2304 | 1120      | 3712x4608 | 2000      |
| 5:4  | 1152x928  | 1120      | 2304x1856 | 1120      | 4608x3712 | 2000      |
| 9:16 | 768x1376  | 1120      | 1536x2752 | 1120      | 3072x5504 | 2000      |
| 16:9 | 1376x768  | 1120      | 2752x1536 | 1120      | 5504x3072 | 2000      |
| 21:9 | 1584x672  | 1120      | 3168x1344 | 1120      | 6336x2688 | 2000      |

<Note>
  官方**中文版**文档把英文表头 `1K tokens`（即"1K 档的 token 数"）直译成了「1,000 个 token」，容易被误读成"每张 1000 tokens"——实际按张计的 token 数以单元格数值为准：1K/2K 档每张 1120，4K 档每张 2000。另外 512px 档（747 tokens/张）仅 Flash 系列图片模型支持，`gemini-3-pro-image` 只有 1K/2K/4K 三档；Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）比较特殊，本身**只有 1K 一档**，不含 512px。
</Note>

## 三个"看起来像异常"的现象及解释

### 现象一：candidatesTokenCount ≠ candidatesTokensDetails 之和 —— 正常，必然如此

实测 **100%**（49/49 成功出图样本）满足：`candidatesTokenCount` 比 details 之和**大 88–630 tokens**（提示词越复杂、返回图片越多，差值越大）。

原因：`candidatesTokensDetails` 只统计**图片本体**（固定 1120/2000 每张）；而 `candidatesTokenCount` 还包含图像生成过程伴随的内部 tokens，这部分没有对应的 modality 条目。这是 Gemini 原生计数口径，API易 透传不做改写。

<Info>
  **结论：请勿把 details 当作 `candidatesTokenCount` 的完整分解来校验；对账、计费一律以 `candidatesTokenCount` / `totalTokenCount` 为准，details 仅用于估算图片部分的占比。**
</Info>

### 现象二：totalTokenCount ≠ prompt + candidates + thoughts —— 只发生在无图输出的响应上

* 正常出图时，等式**严格成立**（49/49）：`total = promptTokenCount + candidatesTokenCount + thoughtsTokenCount`。
* 被安全拦截（无图输出）时，等式**必然不成立**（6/6），且模式固定：

```text theme={null}
candidatesTokenCount == thoughtsTokenCount     // 思考 tokens 被同时写入两个字段
totalTokenCount == promptTokenCount + thoughtsTokenCount   // total 只计一次，是正确的
```

即拒绝响应中 `candidatesTokenCount` 是 `thoughtsTokenCount` 的镜像值，三项相加会把思考多算一份。这同样是上游固有行为。**`totalTokenCount` 本身是准的，直接用它即可**；如果你的日志里有约 10% 的响应"等式不平"，请核对这些响应是否 `parts` 为空——大概率正是安全拦截样本。

### 现象三：输出 tokens 偶尔高达 6000+ —— 来自思考过程返回的多张图片 part

谷歌官方文档说明，Gemini 3 图片模型是思考型模型：默认启用"思考"且无法在 API 中关闭，模型会生成临时图片来测试构图和逻辑，且"思考中的最后一张图片也是最终渲染的图片"（来源：`ai.google.dev/gemini-api/docs/image-generation` 思考过程章节）。

实测中，这些思考中间稿在原生 `generateContent` 响应里以**普通图片 part** 的形式返回：每个 part 都带 `thoughtSignature` 字段、但没有 `thought: true` 标记，并且**每张都按 1120 tokens 计入 `candidatesTokensDetails`**。官方称思考最多生成两张临时图片，但复杂任务型提示词下实测单次返回最多见 **10 张** part。usage 随图片数严格线性增长：

| 返回图片数     | candidatesTokensDetails | candidatesTokenCount | totalTokenCount |
| --------- | ----------------------- | -------------------- | --------------- |
| 1（文生图，1K） | 1120                    | \~1210–1275          | \~1350–1450     |
| 2         | 2240                    | \~2500               | \~3300          |
| 3         | 3360                    | \~3800               | \~4600          |
| 4         | 4480                    | \~5000               | \~5900          |
| 5         | 5600                    | \~6200               | \~7000          |
| 10        | 11200                   | \~12700              | \~13500         |

而 `thoughtsTokenCount` 字段只统计**文本思考**，实测从未超过 400——高输出 tokens 的来源是图片 part 的张数，不是这个字段。看到 6000+ 甚至上万的输出 tokens 时，请检查该响应的 parts 数量——几乎可以确定是多图响应，属于正常计费（对账仍以 `totalTokenCount` 为准）。

## 思考等级与两种 API 范式

### thinkingLevel 对 tokens 的影响

思考等级控制仅 **Gemini 3.1 Flash Image / Flash Lite Image** 支持（`generationConfig.thinkingConfig.thinkingLevel`，默认 `minimal`，可选 `high`）；`gemini-3-pro-image` 的思考恒开、无法调节。实测（同一提示词、1K 文生图，经 API易 网关）：

| 模型 / 设置                              | thoughtsTokenCount | 图片 tokens | totalTokenCount | 耗时       |
| ------------------------------------ | ------------------ | --------- | --------------- | -------- |
| gemini-3.1-flash-image · minimal（默认） | 无该字段               | 1120      | \~1534–1554     | \~12–13s |
| gemini-3.1-flash-image · high        | 700–792            | 1120      | \~2243–2375     | \~18–23s |
| gemini-3-pro-image · 传入 high         | 181–214（与默认区间无异）   | 1120      | \~1427–1471     | \~23s    |

* **high 只增加思考 tokens 与延迟，不改变图片 tokens**（仍为每张 1120）。
* 给 `gemini-3-pro-image` 传 `thinkingLevel` 不会报错，但实测无效果，思考 tokens 仍在默认区间。
* `includeThoughts: true` 实测不改变返回结构与计费；官方明确：无论是否查看思考过程，思考 tokens 都默认计费。
* 官方说明"最少思考并不意味着模型完全不进行思考"——minimal 下只是 usage 里不再单列 `thoughtsTokenCount` 字段。

<Info>
  Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）与 Nano Banana 2 同属 3.1 Flash 系列，同样支持 `thinkingLevel` 调节，机制与上表一致；但暂未单独实测收录进上表，具体价格明细见 [Nano Banana 系列价格总览](/api-capabilities/nano-banana-pricing)。
</Info>

### 图片模型与文本模型的思考 tokens 有何不同

* **文本思考模型**：思考产物是文本，`thoughtsTokenCount` 可达数千，按输出 token 价计费；官方定价按模型内部生成的**完整思考**计，即使 API 只返回思考摘要（来源：`ai.google.dev/gemini-api/docs/thinking` 价格章节）。
* **图片思考模型**：思考产物有两类——少量**文本思考**计入 `thoughtsTokenCount`（实测 Pro 不超过 400、Flash high 档约 800），以及**中间稿图片**，后者以普通图片 part 返回、按每张 1120/2000 tokens 计入 `candidatesTokenCount`。因此图片模型"思考的成本"主要体现在图片 part 的张数上，而不是 `thoughtsTokenCount` 字段（见上文现象三）。

### 两种 API 范式

谷歌的图片模型文档现有两个版本：经典的 **generateContent API**（无状态）与新推荐的 **Interactions API**（面向 Agent 与工具调用）。API易 网关走 **Google 原生 generateContent 格式，本文全部结构与字段均以此为准**。两者的思考相关差异：

|           | generateContent（本文）                                               | Interactions API                                      |
| --------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| 思考等级参数    | `generationConfig.thinkingConfig.thinkingLevel`                   | `generation_config.thinking_level`                    |
| 思考内容返回    | 有 `includeThoughts` 开关（实测对图片模型无可见效果，中间稿总是以普通图片 part 返回）           | 以 `steps`（`type: "thought"`）显式返回，无 includeThoughts 开关 |
| usage 字段名 | `thoughtsTokenCount` / `candidatesTokenCount` / `totalTokenCount` | `total_thought_tokens` / `total_output_tokens`        |

两种范式的完整对比（端点、状态管理、数据保留、API易 网关兼容性实测）见 [Interactions API 与 generateContent 对比](/api-capabilities/gemini/interactions-api)。

## 解析与对账最佳实践

```python theme={null}
data = resp.json()
cand = (data.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []   # 兼容 parts=null

# 按字段特征筛选，不要用 parts[0] / parts[1]——文本段可能排在图片前面
images = [p["inlineData"] for p in parts if "inlineData" in p]
if images:
    final_image = images[-1]["data"]          # 多图时最后一张为最终稿
    mime = images[-1]["mimeType"]             # 以响应为准，别写死 image/png
else:
    reason = cand.get("finishReason")         # IMAGE_SAFETY / NO_IMAGE / PROHIBITED_CONTENT
    message = cand.get("finishMessage", "")   # 可能为空
```

1. **计费对账用 `totalTokenCount`**（拒绝场景下它也是准的），不要自行用三项相加或 details 求和去校验。
2. **遍历 parts，不假设单图**；按张计数的业务以实际 `inlineData` part 数为准。
3. **兼容 `parts = null` + HTTP 200** 的拦截响应，按 `finishReason` 分流。
4. 简单编辑耗时 \~22–25s，复杂任务（多图响应）35–142s，张数越多越久；客户端超时建议设置 ≥ 5 分钟（含代理层）。

## 相关文档

<CardGroup cols={2}>
  <Card title="Nano Banana 开发指南" icon="book-open" href="/api-capabilities/nano-banana-dev-guide">
    接入方式、输入图片要求、计费基础、超时设置与偶现多图说明
  </Card>

  <Card title="错误处理指南" icon="triangle-alert" href="/api-capabilities/gemini-image-error-handling">
    出图失败的三大判断指标、内容审核政策与友好提示方案
  </Card>

  <Card title="出图失败保障计划" icon="shield-check" href="/api-capabilities/nano-banana-pro-guarantee">
    非主观原因导致的失败，按条数核算后补发额度
  </Card>

  <Card title="Nano Banana 价格" icon="badge-dollar-sign" href="/api-capabilities/nano-banana-pricing">
    各分辨率与各模型档位的出图价格
  </Card>
</CardGroup>
