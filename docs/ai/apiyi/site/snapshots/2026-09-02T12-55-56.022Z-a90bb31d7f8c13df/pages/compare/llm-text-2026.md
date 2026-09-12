> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 2026 主流大语言模型横评

> 基于模型信息总览的真实数据，对比 Claude、GPT、Gemini、DeepSeek、Qwen、GLM、Kimi、Grok、MiniMax 等主流文本大模型在编程、推理、长文本、价格、上下文窗口等维度的差异，帮你快速锁定最合适的模型。

<Note>
  **信息时效**：截至 2026-07，所有模型推荐与跑分数据均来源于 [模型信息总览（API易官方）](/api-capabilities/model-info)。
  该文档**随厂商发模型持续更新**，最新模型列表与实时价格以 [API易控制台定价页](https://www.apiyi.com/account/pricing) 为准。
</Note>

<Info>
  **怎么看本文档**：

  * 本文聚焦 **8 个任务场景**（编程开发、文本创作、快速响应、长文本、推理、Agent、联网搜索、成本控制），给出 model-info 推荐组合
</Info>

## 📌 8 大场景推荐组合（直接抄作业）

> 直接源自 [模型信息总览 → 使用建议](/api-capabilities/model-info#使用建议)

### 场景 1：编程开发

| 档次          | 推荐模型                                                       | 来源说明（model-info 原文）                                                                            |
| ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 🏆 **顶级性能** | Claude Opus 4.7 · GPT-5.5 · Claude Sonnet 4.6              | "编程基准较 4.6 +13%（Opus）、SWE-bench 88.7%（GPT-5.5）、媲美 Opus 4.5（Sonnet 4.6）"                        |
| 💰 **高性价比** | Gemini 3.5 Flash · GLM-5.1 · Kimi K2.6 · DeepSeek V4 Flash | "Gemini 3.5 Flash 全面反超 3.1 Pro / GLM-5.1 SWE-Bench Pro 58.4 / Kimi K2.6 反超 GPT-5.4 与 Opus 4.6" |
| 🧰 **备选**   | DeepSeek V4 Pro · Qwen3.7-Max · MiniMax M2.7 · o4-mini     | —                                                                                              |

### 场景 2：文本创作

| 档次        | 推荐模型                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| ⭐ **首选**  | GPT-5.5 · GPT-5.4 · Gemini 3.1 Pro Preview · Claude Opus 4.7 · Claude Sonnet 4.6 |
| 🔁 **备选** | chat-latest · Claude Sonnet 4.5 · GPT-4.1 · GPT-4o · Claude Haiku 4.5 · GLM-4.6  |

### 场景 3：快速响应

| 档次        | 推荐模型                                                                  | 来源说明          |
| --------- | --------------------------------------------------------------------- | ------------- |
| ⭐ **首选**  | Gemini 3.5 Flash（约 4 倍速度）· Claude Haiku 4.5（速度快 2 倍）· GPT-4o Mini     | model-info 标注 |
| 🔁 **备选** | Gemini 3.1 Flash Lite · Gemini 2.5 Flash · Grok 4 Fast · GPT-4.1 Mini | —             |

### 场景 4：长文本处理

| 类别            | 推荐模型                                            | 上下文（model-info 数据）   |
| ------------- | ----------------------------------------------- | -------------------- |
| 🌍 **超长上下文**  | Gemini 2.5 Pro · Grok 4 Fast · Grok Code Fast 1 | **2M / 200K / 256K** |
| 💻 **编程长上下文** | GLM-4.6 · Claude 4 系列 · Kimi K2                 | 200K                 |

<Warning>
  **长上下文注意**：以上数字为 model-info 中标注的 **上下文窗口**。实际"有效窗口"（检索仍准确的最大长度）通常低于标称值，金融 / 医疗等高准确率场景建议结合 RAG 切片。
</Warning>

### 场景 5：复杂推理

| 模型                           | 跑分（model-info 明示）                           | 备注                                      |
| ---------------------------- | ------------------------------------------- | --------------------------------------- |
| **GPT-5.5 Pro**              | Terminal-Bench 2.0 **82.7%**                | **仅 `/v1/responses` 端点 + SVIP 分组**，价格高昂 |
| **Claude Opus 4.7 Thinking** | 自适应思维链，深度推理增强                               | 1M (Beta)                               |
| **GPT-5.5**                  | SWE-bench Verified 88.7%，新增 **`xhigh` 推理档** | 性价比首选                                   |
| **o3**                       | 推理模型，已大幅降价                                  | 200K 上下文，平衡性能与成本                        |
| **o4-mini**                  | 轻量级推理模型                                     | 200K                                    |

<Tip>
  **推理档怎么开**：

  * GPT-5.5 / GPT-5.5 Pro 默认 `medium` 档，要用 `xhigh` 档需在请求中传 `reasoning_effort: xhigh`
  * GPT-5.5 Pro 仅走 `/v1/responses`，不要走 `/v1/chat/completions`
  * 不要在日常任务上用 GPT Pro 系列，单次调用可能消耗数美金
</Tip>

### 场景 6：Agent / 智能体

| 模型                  | 关键能力（model-info 原文）                                    |
| ------------------- | ------------------------------------------------------ |
| **Kimi K2.5**       | 原生多模态，**Agent Swarm 100 智能体协作**                        |
| **Qwen3.7-Max**     | **agent 长程 35 小时自主任务**，AA Intelligence Index 56.6 全球前五 |
| **Claude Opus 4.7** | 生产任务 3 倍，工具错误降至 1/3                                    |
| **GPT-5.3 Codex**   | SWE-Bench Pro SOTA，复杂编程与智能体任务                          |
| **GPT-5.4**         | 原生计算机操控，GDPval 83%                                     |
| **MiniMax M2.7**    | 具备自进化能力，10B 参数最小 Tier-1，开源                             |

### 场景 7：联网搜索

| 模型                              | 说明                                  |
| ------------------------------- | ----------------------------------- |
| **Grok 4 All** · **Grok 3 All** | **原生联网**（无需工具调用）；适合实时信息、新闻资讯、市场动态分析 |

### 场景 8：成本控制

| 模型                         | 价格数据（model-info 明示）                               |
| -------------------------- | ------------------------------------------------- |
| **MiniMax M2.7 标准版**       | **\$0.3 / 百万输入 tokens**                           |
| **MiniMax M2.7 highspeed** | **\$0.6 / 百万输入 tokens**（`MiniMax-M2.7-highspeed`） |

<Info>
  **其他模型的价格**：model-info 未在文档中明示具体输入/输出价。所有价格以 [API易控制台定价页](https://www.apiyi.com/account/pricing) 为准。
  本站"源头转发 + 1:7 固定汇率 + 充值赠送叠加"后，实际到手价通常低于官方直连，具体以控制台显示为准。
</Info>

## 🧮 编程能力跑分对照表

> 仅展示 model-info 中**明确给出具体数字**的模型。带问号或未标注的可去 model-info 看完整描述。

| 模型                  | 跑分                                            | 上下文       | 类别   |
| ------------------- | --------------------------------------------- | --------- | ---- |
| **GPT-5.5 Pro**     | Terminal-Bench 2.0 **82.7%**                  | 1M        | 推理   |
| **GPT-5.5**         | SWE-bench Verified **88.7%**                  | 1M        | 编程   |
| **GPT-5.5**         | 幻觉率较 5.4 **降 60%**                            | 1M        | 质量   |
| **GPT-5.4**         | GDPval **83%**                                | 1M        | 智能体  |
| **GPT-5.3 Codex**   | SWE-Bench Pro **SOTA**                        | 128K      | 编程   |
| **GPT-5.2**         | GDPval **70.9%**（超越专业人士）                      | 400K      | 编程规划 |
| **GPT-5.1**         | SWE-bench **76.3%**                           | 128K      | 编程   |
| **Claude Opus 4.7** | 编程基准较 4.6 **+13%**                            | 1M (Beta) | 编程   |
| **Claude Opus 4.7** | 生产任务 **3 倍**，工具错误降至 1/3                       | 1M (Beta) | 智能体  |
| **Kimi K2.6**       | SWE-Bench Pro **58.6**（反超 GPT-5.4 与 Opus 4.6） | 256K      | 编程   |
| **GLM-5.1**         | SWE-Bench Pro **58.4**                        | —         | 编程   |
| **MiniMax M2.7**    | SWE-bench Pro **56.22%**（10B 参数最小 Tier-1）     | 标准        | 编程   |
| **MiniMax M2.5**    | SWE-bench **80.2%**                           | 标准        | 编程   |
| **Qwen3.7-Max**     | AA Intelligence Index **56.6**（全球前五、国产第一）     | 1M        | 智能体  |

## 📚 上下文窗口对照表

| 模型                                                                                                                                                                   | 上下文窗口       | 来源            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------- |
| **Gemini 2.5 Pro**                                                                                                                                                   | **2M**      | 长文本推荐         |
| **GPT-5.5 Pro** · **GPT-5.5** · **GPT-5.4** · **Claude Opus 4.7** · **Claude Opus 4.7 Thinking** · **Qwen3.7-Max**                                                   | **1M**      | model-info 明示 |
| **GPT-5.2** · **chat-latest**                                                                                                                                        | 400K        | model-info 明示 |
| **Kimi K2.6**                                                                                                                                                        | 256K        | model-info 明示 |
| **GPT-5.1** · **GPT-5.3 Codex** · **GPT-5** · **GPT-5 Mini** · **GPT-5 Nano** · **GPT-4.1** · **GPT-4.1 Mini** · **GPT-4o** · **GPT-4o Mini** · **o3** · **o4-mini** | 128K / 200K | model-info 明示 |
| **Grok 4 Fast / Grok Code Fast 1**                                                                                                                                   | 200K / 256K | 长文本推荐         |
| **GLM-4.6 / Claude 4 系列 / Kimi K2**                                                                                                                                  | 200K        | 编程长上下文        |
| **Qwen Max / Qwen Plus / Qwen Turbo**                                                                                                                                | 32K         | model-info 明示 |

<Note>
  **再次提醒**：上下文窗口数字 = **厂商标称上限**。
  "大海捞针"等真实检索准确率会随超长文本显著下降，长上下文 ≠ 替代 RAG。
</Note>

## 💡 model-info 已给的 4 条成本优化建议（原文 1:1）

1. **分级使用**：简单任务用便宜模型，复杂任务用高级模型
2. **测试优化**：先用小模型测试，确定需求后再用大模型
3. **批量处理**：大量相似任务可以选择 Nano 或 Mini 版本
4. **缓存复用**：对重复查询结果进行缓存

## ❓ model-info 已给的 3 条 GPT-5 系列注意事项（原文 1:1）

<Warning>
  **GPT-5 系列使用注意事项**：

  1. 温度参数 `temperature` 必须设置为 1（只支持 1）
  2. 使用 `max_completion_tokens` 替代 `max_tokens`
  3. 不要传递 `top_p` 参数
</Warning>

## 🔗 相关资源

* [模型信息总览（model-info）](/api-capabilities/model-info) —— 所有数据的唯一来源
* [API易控制台定价页](https://www.apiyi.com/account/pricing) —— 实时价格查询
* [图像与视频生成模型](/api-capabilities/image-video-models) —— 多模态模型对照
* [API 文档](/api-manual) · [快速开始](/getting-started) · [OpenAI 兼容调用](/api-capabilities/openai/compatible)

<Tip>
  **仍在犹豫选哪个？** [联系 API易 客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)，告诉我们：

  * 应用场景（对话 / RAG / Agent / 写作 / ...）
  * 日均调用量级
  * 性能要求（首 token 时延、生成质量）
  * 预算范围

  按你给这 4 个信息给出**专属推荐组合**。
</Tip>

<Note>
  **声明**：
  本文档所有数据均来源于 docs/api-capabilities/model-info.mdx（截至 2026-07 读取）。
  model-info 会随厂商发模型持续更新；最新模型推荐请直接查阅 model-info 或 [API易控制台定价页](https://www.apiyi.com/account/pricing)。
</Note>
