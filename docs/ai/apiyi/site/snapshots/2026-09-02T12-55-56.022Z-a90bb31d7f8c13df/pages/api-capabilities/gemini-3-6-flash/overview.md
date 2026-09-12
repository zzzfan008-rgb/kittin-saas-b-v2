> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash 文本生成

> 谷歌 Gemini 3.6 Flash 多模态文本模型：1M 上下文、思考四档可控、原生工具全家桶。API易开通 Gemini 原生与 OpenAI 兼容双端点，输入 $1.50、输出 $7.50 每 1M tokens，与官网同价。

Gemini 3.6 Flash（`gemini-3.6-flash`）是谷歌 2026 年 7 月更新的多模态文本模型（stable 版），支持文本/图像/视频/音频/PDF 输入，1M 上下文、64K 输出。API易已完成**双端点全量实测**（26+5 用例），Gemini 原生格式与 OpenAI 兼容格式均可直接调用，搜索 grounding、代码执行、URL context 等原生工具实测可用。

<Info>
  **API易已接入 Gemini 3.6 Flash**：模型名 `gemini-3.6-flash`，`default` / `svip` 分组可用。**默认开启深度思考**（思考 tokens 计入输出计费），对延迟和成本敏感的场景请调低思考档位（详见下方「思考控制」）。轻量场景可考虑半价姊妹款 [Gemini 3.5 Flash-Lite](/api-capabilities/gemini-3-5-flash-lite/overview)。
</Info>

## 核心优势

<CardGroup cols={2}>
  <Card title="原生工具全家桶" icon="wrench">
    Google 搜索 grounding、Maps grounding、URL context、代码执行、Computer Use（Preview）在原生端点全部实测放通，无需 Google API Key。
  </Card>

  <Card title="全模态理解" icon="eye">
    图像、PDF、音频实测识别准确（视频同管线支持），1M 上下文可塞整本书或整个代码库。
  </Card>

  <Card title="思考四档可控" icon="brain">
    thinkingLevel minimal/low/medium/high 实测思考量 0/403/487/837 tokens 单调递增，按任务精确控制思考成本。
  </Card>

  <Card title="双端点无缝接入" icon="git-fork">
    Gemini 原生格式（官方 SDK 直连）与 OpenAI 兼容格式（改 base\_url 即用）同时开通，与官网同价。
  </Card>
</CardGroup>

## 模型信息

| 参数        | 值                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------- |
| **模型名称**  | `gemini-3.6-flash`（stable，无重定向别名）                                                                 |
| **输入模态**  | 文本、图像、视频、音频、PDF                                                                                   |
| **上下文窗口** | 1,048,576 输入 / 65,536 输出                                                                          |
| **可用分组**  | `default`、`svip`                                                                                  |
| **端点**    | `POST /v1beta/models/gemini-3.6-flash:generateContent`（原生）、`POST /v1/chat/completions`（OpenAI 兼容） |
| **深度思考**  | 默认开启；`thinkingLevel` 四档 / `thinkingBudget: 0` 可关                                                  |
| **流式输出**  | ✅ 两端点均支持                                                                                          |

## 实测能力矩阵

以下为 API易 2026 年 7 月 22 日的实测结果（官方能力声明 vs 实际表现）：

| 能力                                   | 官方声明     | Gemini 原生                                       | OpenAI 兼容                                          |
| ------------------------------------ | -------- | ----------------------------------------------- | -------------------------------------------------- |
| 基础对话（非流式/流式）                         | ✅        | ✅ / ✅                                           | ✅ / ✅                                              |
| 系统指令                                 | ✅        | ✅                                               | ✅                                                  |
| 深度思考（档位/关闭/思考回显）                     | ✅        | ✅ 四档实测 0–837 tokens，`includeThoughts` 可回显       | ✅ `reasoning_effort` 生效，usage 回显 reasoning\_tokens |
| 图像 / PDF / 音频理解                      | ✅        | ✅ 全部实测通过                                        | ✅ 图像（data URL）实测通过                                 |
| Function calling                     | ✅        | ✅                                               | ✅                                                  |
| 结构化输出                                | ✅        | ✅ responseSchema                                | ✅ json\_schema                                     |
| Google 搜索 grounding                  | ✅        | ✅ groundingMetadata 完整                          | — 原生专属                                             |
| Maps grounding / URL context         | ✅        | ✅ / ✅                                           | — 原生专属                                             |
| 代码执行                                 | ✅        | ⚠️ 实测真实执行、结果正确，但 `executableCode` 字段暂不回显（见下方说明） | — 原生专属                                             |
| Computer Use（Preview）                | ✅        | ✅ 返回操作指令 functionCall                           | — 原生专属                                             |
| 隐式缓存                                 | ✅        | ⚠️ 概率命中，不承诺命中率                                  | 同左                                                 |
| 显式缓存 API / countTokens / File search | ✅        | ❌ 平台暂未开通                                        | —                                                  |
| Batch / Live API / 音频生成 / 图像生成       | ❌ 或平台不适用 | —                                               | —                                                  |

<Warning>
  **代码执行说明**：实测代码在上游真实执行（不可心算的 sha256 题答案正确），但响应中 `executableCode` / `codeExecutionResult` 字段暂不回显，代码与运行结果会在正文文本中呈现。依赖这两个字段做界面分离展示的应用请注意。
</Warning>

## 定价

| 项目                  | API易价格（与官网一致）         |
| ------------------- | --------------------- |
| 输入                  | \$1.50 / 1M tokens    |
| 输出（含思考）             | \$7.50 / 1M tokens    |
| Google 搜索 grounding | \$14 / 1K 次查询（按工具调用计） |

<Info>
  **价格说明**：思考 tokens 按输出计费——这是控制思考档位最直接的理由。API易与官网同价，折扣体现在充值加赠：充 \$100 送 10%、最高送 20%（≈83 折），详见 [充值优惠](/faq/recharge-promotions)。
</Info>

## 思考控制

**默认开启深度思考**：一句 1+1 也会先产生约 200 思考 tokens。实测四档：

| 配置                                               | 思考 tokens（实测） | 适用场景         |
| ------------------------------------------------ | ------------- | ------------ |
| `thinkingLevel: "minimal"` 或 `thinkingBudget: 0` | 0             | 高频短问答、成本敏感场景 |
| `thinkingLevel: "low"`                           | 403           | 常规推理任务       |
| `thinkingLevel: "medium"`                        | 487           | 中等复杂度分析      |
| `thinkingLevel: "high"`                          | 837+          | 复杂规划、数学、代码分析 |

<Tip>
  需要查看思考过程时传 `thinkingConfig: {"includeThoughts": true}`，响应中会返回带 `thought: true` 标记的思考 part，用量看 `usageMetadata.thoughtsTokenCount`。OpenAI 兼容端用 `reasoning_effort`（low/medium/high）分档，消耗看 `usage.completion_tokens_details.reasoning_tokens`。
</Tip>

## 调用示例

### Gemini 原生格式（推荐，工具全支持）

<CodeGroup>
  ```bash cURL（基础对话） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "用一句话介绍你自己"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingLevel": "minimal"}}
    }'
  ```

  ```python Python（google-genai SDK + 搜索 grounding） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents="2026年7月 AI 领域最重要的发布是什么？",
      config=types.GenerateContentConfig(
          tools=[types.Tool(google_search=types.GoogleSearch())]
      )
  )
  print(response.text)
  ```

  ```python Python（多模态：PDF 理解） theme={null}
  import base64
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  pdf = base64.standard_b64encode(open("report.pdf", "rb").read()).decode()
  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents=[
          types.Part.from_bytes(data=base64.b64decode(pdf), mime_type="application/pdf"),
          "总结这份文档的核心结论"
      ]
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
      model="gemini-3.6-flash",
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
    model: 'gemini-3.6-flash',
    messages: [{ role: 'user', content: '写一首关于夏天的短诗' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="原生端点需要 Google API Key 吗？">
    不需要。API易令牌（`sk-` 开头）直接放在 `x-goog-api-key` 请求头即可，官方 google-genai SDK 只需把 `base_url` 改为 `https://api.apiyi.com`。
  </Accordion>

  <Accordion title="搜索 grounding / 代码执行在 OpenAI 兼容端能用吗？">
    不能。google\_search、url\_context、codeExecution、Maps grounding、Computer Use 等原生工具仅 Gemini 原生格式支持，OpenAI 兼容端覆盖常规能力（对话/流式/FC/JSON Schema/视觉）。
  </Accordion>

  <Accordion title="隐式缓存能省多少？">
    相同长前缀第二次请求可能命中（实测 15.9K tokens 前缀命中 8,176 tokens），但命中为概率行为，请勿按稳定命中做成本测算。显式缓存 API（cachedContents）平台暂未开通。
  </Accordion>

  <Accordion title="和 Gemini 3.5 Flash-Lite 怎么选？">
    要工具、要深度思考、要更强推理选 3.6 Flash；高频、低延迟、成本敏感选 [3.5 Flash-Lite](/api-capabilities/gemini-3-5-flash-lite/overview)（输入 \$0.30/输出 \$2.50，默认不思考、响应约快一倍）。
  </Accordion>
</AccordionGroup>

## 相关文档

* [原生 generateContent 在线调试](/api-capabilities/gemini-3-6-flash/generate-content)
* [Chat Completions 在线调试](/api-capabilities/gemini-3-6-flash/chat-completions)
* [Gemini 3.5 Flash-Lite 概览](/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini 原生调用通用指南](/api-capabilities/gemini/native)
