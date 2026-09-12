> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 生图 API 错误处理指南

> gemini-3-pro-image-preview（Nano Banana Pro）出图失败的三大判断指标、谷歌内容审核政策与 C 端友好提示方案，帮助开发者把技术错误转化为可操作的用户提示。

## 概述

`gemini-3-pro-image-preview`（即 Nano Banana Pro）对内容安全有严格控制，会在多个层级拒绝不合规的请求。简单的「生成失败」提示无法帮助用户理解问题，一套好的错误处理需要做到：

* **精准识别拒绝原因** —— 区分内容违规、知识库限制、技术错误
* **友好的用户提示** —— 把技术错误转化为可理解的说明
* **可操作的建议** —— 告诉用户怎么改才能成功
* **完整的技术信息** —— 供开发者调试排查

<Info>
  当请求返回 **HTTP 200 但没有图片** 时，这通常是谷歌侧的安全判定。API易 透明代理只是如实转发结果——我们同样希望客户成功出图。判断与文案处理需要在你的应用侧完成。
</Info>

## 谷歌内容审核政策（2026 更新）

谷歌的图片生成采用**两层安全机制**：

1. **可调节过滤器**：覆盖骚扰、仇恨言论、露骨色情、危险内容等四类，可通过 `safetySettings` 调整
2. **内置保护**：针对核心危害（如儿童安全）始终生效，**无法通过参数关闭**

明确禁止的内容包括：儿童性虐待与剥削（CSAE）、暴力极端主义/恐怖主义、未经同意的私密影像（NCII）、自残、露骨色情、仇恨言论、骚扰与霸凌。

<Warning>
  **2026 年 2 月，Nano Banana 2 上线后谷歌显著收紧了人物与版权相关策略**，新增/强化了以下高频拒绝场景（数据截至 2026 年 5 月 (UTC+8)）：

  * **公众人物 / 名人**：照片级、可识别的真实人物
  * **换脸（faceswap）**
  * **真人换装 / 改脸**
  * **金融、订单信息篡改**
  * **知名 IP**（如迪士尼，2026 年 1 月 23 日起）
  * **去水印**、**未成年人**相关内容

  仍然可以生成：虚构角色、风格化肖像、插画类人物。
</Warning>

谷歌官方政策原文（请自行复制访问）：

* 生成式 AI 禁止使用政策：`policies.google.com/terms/generative-ai/use-policy`
* 生成式内容常见错误说明：`ai.google.dev/api/generate-content`

## 三个核心判断指标

按**优先级从高到低**依次检查：

### 1. candidatesTokenCount（最高优先级）⭐

* **位置**：`response.usageMetadata.candidatesTokenCount`
* **含义**：API 生成的候选内容 token 数
* **规则**：等于 `0` 表示在**内容审核阶段就被直接拒绝**，连候选内容都没生成，这是最严格的拒绝

```json theme={null}
{
  "candidates": null,
  "usageMetadata": {
    "promptTokenCount": 271,
    "candidatesTokenCount": 0,
    "totalTokenCount": 271
  }
}
```

### 2. finishReason（次优先级）

* **位置**：`response.candidates[0].finishReason`
* **规则**：不等于 `STOP` 即为非正常结束，需要特殊处理

最新的图片相关 `finishReason` 取值（注意 Nano Banana 系列新增了 `IMAGE_` 前缀的图片专用值）：

| finishReason                                      | 含义        | 用户友好文案           |
| ------------------------------------------------- | --------- | ---------------- |
| `STOP`                                            | 正常结束      | -                |
| `IMAGE_SAFETY`                                    | 输出侧图片安全过滤 | 内容触发了图片安全策略      |
| `PROHIBITED_CONTENT` / `IMAGE_PROHIBITED_CONTENT` | 违禁内容      | 内容违反安全策略，已被拒绝    |
| `SAFETY`                                          | 安全过滤      | 内容触发了安全过滤器       |
| `RECITATION` / `IMAGE_RECITATION`                 | 引用/版权限制   | 内容可能涉及版权问题       |
| `IMAGE_OTHER` / `NO_IMAGE`                        | 未出图/其他    | 未能生成图片，请调整提示词后重试 |
| `MAX_TOKENS`                                      | 长度超限      | 内容长度超出限制         |

### 3. 文本拒绝说明（重要）

* **位置**：`response.candidates[0].content.parts[].text`
* **规则**：`finishReason` 为 `STOP`，但 `parts` 里只有 `text`、没有图片数据时，说明 API 返回的是**拒绝说明**而非图片。文案可能是中文或英文，例如：

```text theme={null}
我不能为你创建带有色情、不雅或冒犯性内容的图像。这违反了我们的安全政策。
I can't generate images that are sexually explicit.
```

## 错误场景速查

| 场景     | 检测条件                                    | 典型原因               |
| ------ | --------------------------------------- | ------------------ |
| 内容审核拒绝 | `candidatesTokenCount === 0`            | 提示词/参考图含敏感内容，最早期拒绝 |
| 生成过程拒绝 | `finishReason !== 'STOP'` 且 `parts` 为空  | 违禁内容、安全过滤          |
| 文本拒绝说明 | `finishReason === 'STOP'`，有 text 无图片    | 露骨色情、违规请求          |
| 知识库限制  | text 提到未来年份（2026+）或未发布产品                | 知识库更新至 2025 年 1 月  |
| 禁止功能   | text 含 `watermark`、`faceswap`、换装、名人等关键词 | 去水印/换脸/换装/名人等被禁功能  |

## 处理流程（决策顺序）

```text theme={null}
收到 API 响应
  ├─ ① candidatesTokenCount === 0 ─→ 内容审核拒绝
  ├─ ② candidates 为空 ───────────→ API 格式错误（系统问题）
  ├─ ③ finishReason !== 'STOP' ───→ 生成过程拒绝（查映射表）
  ├─ ④ content.parts 为空 ────────→ 内容为空（同 finishReason 处理）
  ├─ ⑤ 遍历 parts 收集 text 与图片
  ├─ ⑥ 有图片 ────────────────────→ ✅ 成功返回
  └─ ⑦ 无图片但有 text ──────────→ 展示拒绝说明（可选关键词识别）
        └─ 无 text ──────────────→ 通用错误 + 保留完整响应
```

## 代码实现（核心）

将上面的判断顺序整合为一个解析函数：

```javascript theme={null}
async function processGeminiResponse(data) {
  // ① 最高优先级：内容审核阶段直接拒绝
  if (data.usageMetadata?.candidatesTokenCount === 0) {
    return {
      success: false,
      errorType: 'ZERO_CANDIDATES_TOKEN',
      userMessage: '您的请求在内容审核阶段被拒绝，请修改后重试',
      devMessage: 'candidatesTokenCount: 0 - 谷歌内容审核拒绝',
      rawResponse: data,
    };
  }

  // ② candidates 为空 —— 通常是系统/格式问题
  if (!data.candidates || !data.candidates.length) {
    return {
      success: false,
      errorType: 'NO_CANDIDATES',
      userMessage: '系统出错，请稍后重试',
      devMessage: 'candidates 为 null 或空数组',
      rawResponse: data,
    };
  }

  const candidate = data.candidates[0];

  // ③ finishReason 非 STOP —— 生成过程被拒
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    const reasonMessages = {
      PROHIBITED_CONTENT: '内容违反安全策略，已被拒绝处理',
      IMAGE_PROHIBITED_CONTENT: '内容违反安全策略，已被拒绝处理',
      SAFETY: '内容触发了安全过滤器',
      IMAGE_SAFETY: '内容触发了图片安全策略',
      RECITATION: '内容可能涉及版权问题',
      IMAGE_RECITATION: '内容可能涉及版权问题',
      NO_IMAGE: '未能生成图片，请调整提示词后重试',
      IMAGE_OTHER: '未能生成图片，请调整提示词后重试',
      MAX_TOKENS: '内容长度超出限制',
    };
    return {
      success: false,
      errorType: 'FINISH_REASON',
      finishReason: candidate.finishReason,
      userMessage: reasonMessages[candidate.finishReason] || `请求被拒绝：${candidate.finishReason}`,
      devMessage: `finishReason: ${candidate.finishReason}`,
      rawResponse: data,
    };
  }

  // ④ content.parts 为空
  if (!candidate.content?.parts) {
    return {
      success: false,
      errorType: 'NO_PARTS',
      userMessage: '生成失败，请重试',
      devMessage: 'candidate.content.parts 为空',
      rawResponse: data,
    };
  }

  // ⑤ 遍历 parts：⚠️ 务必先收集 text，再判断 thoughtSignature
  const images = [];
  const texts = [];
  for (const part of candidate.content.parts) {
    if (part.text && !part.text.startsWith('data:image/')) {
      texts.push(part.text);
    }
    if (part.inlineData?.data) {
      images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
    }
  }

  // ⑥ 有图片即成功
  if (images.length > 0) {
    return { success: true, images, texts };
  }

  // ⑦ 无图片但有文本 —— 展示拒绝说明
  if (texts.length > 0) {
    const textContent = texts.join('\n');
    return {
      success: false,
      errorType: 'TEXT_RESPONSE',
      userMessage: textContent,          // 直接使用 API 返回的文本
      detectedType: detectContentType(textContent),
      apiText: textContent,
      rawResponse: data,
    };
  }

  // ⑧ 兜底：永远不要只说「未知错误」
  return {
    success: false,
    errorType: 'UNKNOWN',
    userMessage: '生成失败，请检查提示词后重试',
    devMessage: '未找到图片数据或文本响应',
    rawResponse: data,
  };
}
```

关键词智能识别（可选，用于给出更具体的提示）：

```javascript theme={null}
function detectContentType(text) {
  const t = text.toLowerCase();
  const isRejection =
    t.includes("i can't generate") || t.includes('i cannot create') ||
    t.includes("i'm just a language model") || t.includes('我不能') || t.includes('无法生成');
  if (!isRejection) return null;

  if (t.includes('watermark')) return 'watermark_removal';
  if (t.includes('faceswap') || t.includes('face swap')) return 'faceswap';
  if (t.includes('sexually') || t.includes('explicit') || t.includes('色情') || t.includes('不雅')) return 'nsfw';
  return 'general_rejection';
}
```

<Warning>
  **最易踩的坑**：带 `thoughtSignature` 的 part 仍可能包含重要的 `text`。一定要**先收集 text，再决定是否跳过**——否则拒绝说明会丢失，用户只能看到「生成失败」。
</Warning>

## C 端友好提示文案

设计原则：**简洁明了、正面引导、可操作、避免指责**。推荐模板：

```text theme={null}
❌ 内容不符合要求
您的请求包含不适当内容，无法生成图片。
💡 建议：使用健康、正面的描述；避免敏感话题；重新调整提示词后再试。

❌ 功能暂不支持
该功能（如去水印/换脸）暂不支持，请尝试其他编辑方式。

❌ 内容超出范围
您提到的内容可能超出了 AI 的知识范围（更新至 2025 年 1 月）。
💡 建议：使用常见物品/概念，避免引用未来的产品。
```

展示分层建议：

* **C 端用户**：默认只显示友好说明 + 修改建议
* **B 端 / 工具服务商**：默认展开技术详情（`finishReason`、`candidatesTokenCount` 等）
* **开发者**：提供「展开/收起」查看完整 JSON 响应

## 最佳实践

1. **严格按优先级检测**：`candidatesTokenCount` → `finishReason` → `parts` → 提取数据 → 关键词识别
2. **先收集 text 再判断 thoughtSignature**，避免拒绝说明丢失
3. **保留完整响应**：开发/测试工具务必保存原始 JSON，便于排查
4. **支持中英文拒绝文案**：谷歌可能返回中文或英文，关键词匹配两者都要覆盖
5. **友好降级**：能智能识别就给具体提示，否则直接展示 API 文本，再否则用 `finishReason` 友好名称，最后才是通用提示
6. **永不显示「未知错误」**：始终带上可操作建议或完整响应

## 常见问题 FAQ

<AccordionGroup>
  <Accordion title="为什么同一个提示词有时能生成有时不能？">
    谷歌的安全过滤存在随机性和上下文相关性：参考图内容、提示词组合方式都会影响判断。建议调整描述方式、使用更委婉的表达。
  </Accordion>

  <Accordion title="如何区分是内容问题还是技术问题？">
    `candidatesTokenCount: 0` 或 `finishReason: PROHIBITED_CONTENT` → 内容问题；`Failed to fetch` 或 HTTP 错误 → 技术问题；有 API 文本说明 → 通常是内容问题。
  </Accordion>

  <Accordion title="C 端用户应该看到多少技术信息？">
    分层展示：默认显示友好说明 + 修改建议；可选展开技术详情；开发模式下显示完整 JSON 响应。
  </Accordion>

  <Accordion title="是否需要为每个 finishReason 单独写处理？">
    不需要。用映射表 + 通用兜底即可：`reasonMessages[finishReason] || ` + 显示原始值。
  </Accordion>
</AccordionGroup>

## 相关阅读

* [Nano Banana 系列价格总览](/api-capabilities/nano-banana-pricing)
* [Nano Banana Pro 出图失败包补计划](/api-capabilities/nano-banana-pro-guarantee)
* [Nano Banana OSS 分组](/api-capabilities/nano-banana-oss-group)
