> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash 文本生成

> 谷歌 Gemini 3.8 Flash 多模态文本模型：API易 双端点开通，输入 $0.75、输出 $3.75 每 1M tokens，是 3.6 Flash 的一半。含 150 例上线前实测数据与从 3.6 / 3.7 迁移的注意事项。

Gemini 3.8 Flash（`gemini-3.8-flash`）是谷歌 2026 年 9 月 2 日推出的多模态文本模型，支持文本 / 图像 / 视频 / 音频输入。API易 已开通 **Gemini 原生**与 **OpenAI 兼容**双端点，并在上线前完成 **150 例双协议成对实测**（以 `gemini-3.7-flash` 为参照）。

<Info>
  **API易 已接入 Gemini 3.8 Flash**：模型名 `gemini-3.8-flash`，`default` / `svip` 分组可用。**默认开启深度思考**（思考 tokens 计入输出计费），对延迟和成本敏感的场景请调低思考档位或关闭思考（详见下方「思考控制」）。
</Info>

<Warning>
  **官方规格尚未公布**：截至本页发布，谷歌的 Gemini API 模型列表与 DeepMind 模型卡都还没有收录 3.8 Flash，官方发布博客也未上线。因此**上下文窗口、最大输出、知识截止、官方基准分数本页一律标注"官方未公布"**，不做转述也不做推测。本页所有"实测"标记的内容均来自 API易 自己的测试，官方材料发布后会同步补齐。
</Warning>

## 核心优势

<CardGroup cols={2}>
  <Card title="比 3.6 Flash 便宜一半" icon="dollar-sign">
    输入 \$0.75 / 输出 \$3.75 每 1M tokens，是 3.6 Flash（\$1.50 / \$7.50）的一半；与 3.7 Flash 逐项同价，从 3.7 平迁零成本变化。
  </Card>

  <Card title="上线前 150 例实测" icon="clipboard-check">
    与 3.7 Flash 成对同时发起、双协议覆盖，核心能力、推理、并行工具调用、图片视频理解逐项对齐，未发现 3.8 独有回退。
  </Card>

  <Card title="双端点无缝接入" icon="git-fork">
    Gemini 原生格式（官方 SDK 直连，无需 Google API Key）与 OpenAI 兼容格式（改 base\_url 即用）同时开通。
  </Card>

  <Card title="迁移成本接近于零" icon="arrow-right-arrow-left">
    从 3.7 Flash 只改模型名：请求结构、参数、返回字段均不变，实测响应字段集差异仅 1 组且无字段类型变化。
  </Card>
</CardGroup>

## 模型信息

| 参数               | 值                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| **模型名称**         | `gemini-3.8-flash`                                                                                |
| **输入模态**         | 文本、图像、视频、音频（图像与视频已实测）                                                                             |
| **输出模态**         | 文本                                                                                                |
| **上下文窗口 / 最大输出** | 官方未公布                                                                                             |
| **知识截止**         | 官方未公布                                                                                             |
| **可用分组**         | `default`、`svip`                                                                                  |
| **端点**           | `POST /v1beta/models/gemini-3.8-flash:generateContent`（原生）、`POST /v1/chat/completions`（OpenAI 兼容） |
| **深度思考**         | 默认开启；`thinkingLevel` 三档（low / medium / high）；`thinkingBudget: 0` 可关                               |
| **流式输出**         | ✅ 两端点均支持                                                                                          |

## 实测能力矩阵

以下为 API易 2026 年 9 月 2 日的实测结果，共 150 份用例日志、198 次调用，每个用例与 `gemini-3.7-flash` **同时发起**以排除时段干扰：

| 能力                                     | Gemini 原生                              | OpenAI 兼容               | 与 3.7 Flash 对比        |
| -------------------------------------- | -------------------------------------- | ----------------------- | --------------------- |
| 基础对话（非流式 / 流式）                         | ✅ / ✅                                  | ✅ / ✅                   | 一致                    |
| 系统指令                                   | ✅                                      | ✅                       | 一致                    |
| 多轮对话                                   | ✅                                      | ✅                       | 一致                    |
| 长上下文定位（14.5K 字符前缀 + 128 输出上限）          | ✅                                      | ✅                       | 答案相同                  |
| 结构化输出                                  | ✅ responseSchema                       | ✅ json\_schema          | 返回 JSON 逐字节相同         |
| Function calling（单次 / 结果回传 / 顺序）       | ✅                                      | ✅                       | 一致                    |
| **并行 Function calling**                | ✅ 两轮均返回 2 个调用，参数与 ID 完整                | ✅                       | 一致                    |
| 图像理解                                   | ✅ 2/2                                  | ✅ 2/2                   | IMAGE 模态 token 计数逐位相同 |
| 视频理解                                   | ✅ 2/2                                  | ✅ 2/2                   | VIDEO 模态 token 计数逐位相同 |
| 代码执行（`codeExecution`）                  | ✅ 答案正确                                 | — 原生专属                  | 一致                    |
| URL context（`urlContext`）              | ✅ 回 `urlContextMetadata`，页面内容确实被抓取     | — 原生专属                  | 一致                    |
| 思考档位 low / medium / high               | ✅ 思考 token 单调递增                        | ✅ `reasoning_effort` 生效 | 一致                    |
| `stopSequences` / `stop`               | ✅ 严格执行                                 | ⚠️ 不生效                  | 一致                    |
| `temperature=0` + `topK=1` + `seed`    | ✅ 两发逐字一致                               | ⚠️ 两发不一致                | 一致                    |
| `safetySettings`                       | ✅ 被接受，回 `safetyRatings`                | — 原生专属                  | 一致                    |
| Google 搜索 grounding                    | ⚠️ 请求被接受但未回 `groundingMetadata`（见下方说明） | — 原生专属                  | 一致                    |
| 隐式缓存                                   | ⚠️ 8 轮连打未观察到命中                         | 同左                      | 一致                    |
| 显式缓存 `cachedContents` / `:countTokens` | ❌ 平台暂未开通                               | —                       | 一致                    |

<Warning>
  **搜索 grounding 待确认**：传入 `tools: [{"googleSearch": {}}]` 时请求返回 200 且答案正确，但响应中**没有 `groundingMetadata`**，说明该答案来自模型自身知识而非实时检索。`gemini-3.7-flash` 在同一轮测试中表现完全相同，因此这**更可能是链路层面的开通状态、而非模型能力差异**。依赖实时检索的场景请先小流量验证，不要按"已 grounding"设计。
</Warning>

## 定价

| 项目      | API易 价格             |
| ------- | ------------------- |
| 输入      | \$0.75 / 1M tokens  |
| 输出（含思考） | \$3.75 / 1M tokens  |
| 缓存读取    | \$0.075 / 1M tokens |

**与 `gemini-3.7-flash` 逐项一致**，从 3.7 平迁不涉及任何成本变化；相比 3.6 Flash（\$1.50 / \$7.50）则**直接减半**。

<Info>
  **价格说明**：思考 tokens 按输出计费——这是控制思考档位最直接的理由。谷歌尚未公布 3.8 Flash 的官方定价；作为参考，3.7 Flash 现行的 \$0.75 / \$3.75 是谷歌自己的限时优惠价，官方注明有效期至 2026 年 12 月 31 日。API易 的模型价格与原厂逐项对齐，折扣通过充值加赠体现，详见 [充值优惠](/faq/recharge-promotions)。
</Info>

## 思考控制

**默认开启深度思考**：一句 1+1 也会先产生上百思考 tokens。实测三档（同一道题、原生端点）：

| 配置                                      | 思考 tokens（实测）                | 适用场景         |
| --------------------------------------- | ---------------------------- | ------------ |
| `thinkingConfig: {"thinkingBudget": 0}` | 0（响应不回 `thoughtsTokenCount`） | 高频短问答、成本敏感场景 |
| `thinkingLevel: "low"`                  | 84                           | 常规推理任务       |
| `thinkingLevel: "medium"`               | 127                          | 中等复杂度分析      |
| `thinkingLevel: "high"`                 | 263                          | 复杂规划、数学、代码分析 |

<Warning>
  **`minimal` 档已被移除**（3.6 Flash 有、3.8 没有）：原生端点传 `thinkingLevel: "minimal"` 会直接返回 400 `Thinking level is unsupported: THINKING_LEVEL_MINIMAL`。要完全关闭思考请改用 `thinkingConfig: {"thinkingBudget": 0}`。

  **更需要注意 OpenAI 兼容端**：传 `reasoning_effort: "minimal"` **不会报错**，返回 200，但实测仍消耗了 76 个思考 token 并计入输出计费——即参数被静默忽略、思考照常发生。从 3.6 Flash 迁移过来的代码若还带着 `minimal`，在这一端不会有任何报错提示你改。
</Warning>

<Tip>
  需要查看思考过程时传 `thinkingConfig: {"includeThoughts": true}`，响应中会返回带 `thought: true` 标记的思考 part，用量看 `usageMetadata.thoughtsTokenCount`。OpenAI 兼容端用 `reasoning_effort`（low / medium / high）分档，消耗看 `usage.completion_tokens_details.reasoning_tokens`。
</Tip>

## 调用示例

### Gemini 原生格式（推荐，工具支持更全）

<CodeGroup>
  ```bash cURL（关闭思考的基础对话） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "用一句话介绍你自己"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingBudget": 0}}
    }'
  ```

  ```python Python（google-genai SDK） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="分析这段代码的时间复杂度并给出优化方案",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python（URL context：实测可用） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="总结 https://ai.google.dev/gemini-api/docs 这个页面讲了什么",
      config=types.GenerateContentConfig(
          tools=[types.Tool(url_context=types.UrlContext())]
      )
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI 兼容格式（存量代码零改造）

<CodeGroup>
  ```python Python（OpenAI SDK） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.8-flash",
      messages=[{"role": "user", "content": "分析这段代码的时间复杂度"}],
      reasoning_effort="high",
      max_tokens=4000
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js（流式） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.8-flash',
    messages: [{ role: 'user', content: '写一首关于秋天的短诗' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 迁移指南

<AccordionGroup>
  <Accordion title="从 gemini-3.7-flash 迁移">
    **只改模型名**。实测请求结构、参数与返回字段均无变化，响应字段集差异仅 1 组且无类型变化，客户端不需要适配。价格逐项相同，用量预算可直接沿用。
  </Accordion>

  <Accordion title="从 gemini-3.6-flash 迁移">
    价格**直接减半**（输入 \$1.50 → \$0.75、输出 \$7.50 → \$3.75），但有一处必改：**`thinkingLevel: "minimal"` 已不支持**，原生端点会返回 400，需改成 `thinkingConfig: {"thinkingBudget": 0}`。OpenAI 兼容端的 `reasoning_effort: "minimal"` 不报错但会被静默忽略、思考照常计费，务必一并改掉。
  </Accordion>

  <Accordion title="上下文上限是多少？">
    官方未公布，我们也不按 3.7 的数字推测。实测 14.5K 字符前缀的长上下文定位任务正常通过。**长上下文重度依赖的场景建议先小流量灰度**，确认边界后再全量切换；官方规格公布后本页会补齐。
  </Accordion>

  <Accordion title="原生端点需要 Google API Key 吗？">
    不需要。API易 令牌（`sk-` 开头）直接放在 `x-goog-api-key` 请求头即可，官方 google-genai SDK 只需把 `base_url` 改为 `https://api.apiyi.com`。
  </Accordion>

  <Accordion title="哪些能力只有原生端点有？">
    代码执行、URL context、`safetySettings`、`stopSequences` 与 `seed` 的严格执行都只在 Gemini 原生端点可用。OpenAI 兼容端覆盖常规能力（对话 / 流式 / Function Call / JSON Schema / 视觉），但 `stop` 与 `seed` 实测不生效。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Gemini 3.8 Flash 上线说明（含完整实测数据）](/news/gemini-3-8-flash-launch)
* [Gemini 3.6 Flash 概览](/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 3.5 Flash-Lite 概览](/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini 原生调用通用指南](/api-capabilities/gemini/native)
