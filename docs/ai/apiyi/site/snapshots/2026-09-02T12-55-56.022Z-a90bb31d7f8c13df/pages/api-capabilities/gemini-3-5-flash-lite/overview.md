> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite 文本生成

> 谷歌 Gemini 3.5 Flash-Lite 高性价比多模态模型：1M 上下文、默认不思考、响应极快。API易开通 Gemini 原生与 OpenAI 兼容双端点，输入 $0.30、输出 $2.50 每 1M tokens，与官网同价。

Gemini 3.5 Flash-Lite（`gemini-3.5-flash-lite`）是谷歌 2026 年 7 月更新的轻量多模态模型（stable 版），主打高频、低延迟、低成本，支持文本/图像/视频/音频/PDF 输入，1M 上下文、64K 输出。API易已完成**双端点全量实测**（25+5 用例），Gemini 原生格式与 OpenAI 兼容格式均可直接调用，搜索 grounding、URL context 等原生工具实测可用。

<Info>
  **API易已接入 Gemini 3.5 Flash-Lite**：模型名 `gemini-3.5-flash-lite`，`default` / `svip` 分组可用。与 3.6 Flash 相反——**默认不输出思考**，简单请求实测约 2 秒返回；需要深度推理时传 `thinkingLevel: "high"` 显式开启。
</Info>

## 核心优势

<CardGroup cols={2}>
  <Card title="极致性价比" icon="circle-dollar-sign">
    输入 \$0.30、输出 \$2.50 每 1M tokens（音频输入同价），仅为 3.6 Flash 的 1/5–1/3，适合高频调用与批量处理。
  </Card>

  <Card title="默认零思考低延迟" icon="zap">
    默认不产生思考 tokens，简单请求实测约 2 秒返回（3.6 Flash 约 4.5 秒），客服、分类、抽取等场景开箱即用。
  </Card>

  <Card title="全模态理解" icon="eye">
    图像、PDF、音频实测识别准确（视频同管线支持），1M 上下文与旗舰同规格。
  </Card>

  <Card title="原生工具可用" icon="wrench">
    Google 搜索 grounding、Maps grounding、URL context、代码执行在原生端点实测放通，无需 Google API Key。
  </Card>
</CardGroup>

## 模型信息

| 参数        | 值                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------ |
| **模型名称**  | `gemini-3.5-flash-lite`（stable，无重定向别名）                                                                 |
| **输入模态**  | 文本、图像、视频、音频、PDF                                                                                        |
| **上下文窗口** | 1,048,576 输入 / 65,536 输出                                                                               |
| **可用分组**  | `default`、`svip`                                                                                       |
| **端点**    | `POST /v1beta/models/gemini-3.5-flash-lite:generateContent`（原生）、`POST /v1/chat/completions`（OpenAI 兼容） |
| **深度思考**  | **默认关闭**；`thinkingLevel: "high"` 显式开启                                                                  |
| **流式输出**  | ✅ 两端点均支持                                                                                               |

## 实测能力矩阵

以下为 API易 2026 年 7 月 22 日的实测结果（官方能力声明 vs 实际表现）：

| 能力                                   | 官方声明     | Gemini 原生                                                           | OpenAI 兼容                                             |
| ------------------------------------ | -------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| 基础对话（非流式/流式）                         | ✅        | ✅ / ✅                                                               | ✅ / ✅                                                 |
| 系统指令                                 | ✅        | ✅                                                                   | ✅                                                     |
| 深度思考                                 | ✅        | ✅ `thinkingLevel: "high"` 实测触发（约 1000 tokens），`includeThoughts` 可回显 | ⚠️ `reasoning_effort` 接受但 usage 不回显 reasoning\_tokens |
| 图像 / PDF / 音频理解                      | ✅        | ✅ 全部实测通过                                                            | ✅ 图像（data URL）实测通过                                    |
| Function calling                     | ✅        | ✅                                                                   | ✅                                                     |
| 结构化输出                                | ✅        | ✅ responseSchema                                                    | ✅ json\_schema                                        |
| Google 搜索 grounding                  | ✅        | ✅ groundingMetadata 完整                                              | — 原生专属                                                |
| Maps grounding / URL context         | ✅        | ✅ / ✅                                                               | — 原生专属                                                |
| 代码执行                                 | ✅        | ⚠️ 实测真实执行、结果正确，但 `executableCode` 字段暂不回显                            | — 原生专属                                                |
| Computer Use                         | ❌ 官方不支持  | —                                                                   | —                                                     |
| 隐式缓存                                 | ✅        | ⚠️ 实测未观测到命中，勿按命中做成本测算                                               | 同左                                                    |
| 显式缓存 API / countTokens / File search | 部分支持     | ❌ 平台暂未开通                                                            | —                                                     |
| Batch / Live API / 音频生成 / 图像生成       | ❌ 或平台不适用 | —                                                                   | —                                                     |

## 定价

| 项目                  | API易价格（与官网一致）         |
| ------------------- | --------------------- |
| 输入（文本/图像/视频/音频）     | \$0.30 / 1M tokens    |
| 输出（含思考）             | \$2.50 / 1M tokens    |
| Google 搜索 grounding | \$14 / 1K 次查询（按工具调用计） |

<Info>
  **价格说明**：API易与官网同价，折扣体现在充值加赠：充 \$100 送 10%、最高送 20%（≈83 折），详见 [充值优惠](/faq/recharge-promotions)。
</Info>

## 思考控制

**与 3.6 Flash 相反，本模型默认不思考**——这正是它快和便宜的原因。实测：

| 配置                                   | 思考 tokens（实测） | 说明           |
| ------------------------------------ | ------------- | ------------ |
| 不传（默认）/ `minimal` / `low` / `medium` | 0             | 简单问题各档均未触发思考 |
| `thinkingLevel: "high"`              | 约 1000        | 稳定触发深度思考     |

<Tip>
  实用建议：**要思考就直接上 `high`**，中间档位对简单问题不产生思考；配合 `includeThoughts: true` 可回显思考过程。若任务长期需要深度推理，直接选 [Gemini 3.6 Flash](/api-capabilities/gemini-3-6-flash/overview) 更合适。
</Tip>

## 调用示例

### Gemini 原生格式（推荐，工具全支持）

<CodeGroup>
  ```bash cURL（基础对话，默认零思考） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.5-flash-lite:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "把这句话翻译成英文：今天天气不错"}]}]
    }'
  ```

  ```python Python（google-genai SDK，按需开思考） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents="一个水池两根进水管，甲单独8小时注满，乙单独12小时注满，同时打开需要几小时？",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python（图像理解） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents=[
          types.Part.from_bytes(data=open("photo.png", "rb").read(), mime_type="image/png"),
          "描述这张图片"
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
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content": "把下面的评论分类为正面/负面/中性：物流很快但包装一般"}]
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
    model: 'gemini-3.5-flash-lite',
    messages: [{ role: 'user', content: '用三句话总结 RAG 的原理' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="什么场景选 Flash-Lite 而不是 3.6 Flash？">
    高频短问答、分类、抽取、翻译、客服等吞吐优先的场景选 Flash-Lite（快约一倍、便宜至 1/5）；需要深度推理、复杂规划或 Computer Use 时选 [3.6 Flash](/api-capabilities/gemini-3-6-flash/overview)。
  </Accordion>

  <Accordion title="原生端点需要 Google API Key 吗？">
    不需要。API易令牌（`sk-` 开头）直接放在 `x-goog-api-key` 请求头即可，官方 google-genai SDK 只需把 `base_url` 改为 `https://api.apiyi.com`。
  </Accordion>

  <Accordion title="怎么观测思考消耗？">
    原生端点看 `usageMetadata.thoughtsTokenCount`。注意 OpenAI 兼容端本模型不回显 `reasoning_tokens`，需要精确观测思考消耗请用原生端点。
  </Accordion>

  <Accordion title="隐式缓存能命中吗？">
    实测 15.9K tokens 相同前缀连打 3 次未观测到命中（同条件 3.6 Flash 命中 1 次），请勿按缓存命中做成本测算。显式缓存 API 平台暂未开通。
  </Accordion>
</AccordionGroup>

## 相关文档

* [原生 generateContent 在线调试](/api-capabilities/gemini-3-5-flash-lite/generate-content)
* [Chat Completions 在线调试](/api-capabilities/gemini-3-5-flash-lite/chat-completions)
* [Gemini 3.6 Flash 概览](/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 原生调用通用指南](/api-capabilities/gemini/native)
