> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 系列模型调用指南

> xAI Grok 4.x 系列（grok-4.6 / grok-4.5 / grok-4.3 / grok-4.20 / grok-build-0.1）API易 调用总览：OpenAI 兼容 + Responses API 双端点，联网搜索 / X 搜索 / 代码执行 / MCP 四大 server-side 工具实测可用，挂牌价与 xAI 官网一致，GrokOfficial 分组 0.8x。

Grok 是 xAI 推出的旗舰大模型家族。当前一代（Grok 4.x）覆盖旗舰通用、长上下文标准档、推理/非推理双变体、代码专用与多智能体协作五条产品线，全部已上架 API易。**xAI 官方 API 本身就是 OpenAI 兼容格式**（Chat Completions + Responses API），没有独立的私有协议——因此在 API易 上用 OpenAI SDK 即可调用全部能力，包括官方的 server-side 工具（联网搜索、X 搜索、代码执行、Remote MCP）。

本组文档基于 2026年7月13日 (UTC+8) 在 API易 网关上的全量实测（56 组请求/响应日志）编写，能力边界均有实测依据。

<Note>
  **🚀 核心亮点**：`grok-4.6` 是 xAI 于 2026年8月7日 发布的最新旗舰，沿用 grok-4.5 的 1.5T 参数 V9 基座、提升全部来自后训练，**挂牌价与 grok-4.5 完全相同**；grok-4.3 与 grok-4.20 系列提供 **100 万 tokens 上下文**；Responses API 的 **web\_search / x\_search / code\_interpreter / MCP 四大工具在 API易 实测真实可用**，其中 X 搜索是 Grok 独有的差异化能力；原生 responses 协议还意味着 Grok 可以[直接接入 OpenAI Codex](/scenarios/programming/codex-cli)。全系可走 **`GrokOfficial` 分组享 0.8x 倍率（8 折）**，详见下方「分组与折扣」。
</Note>

## 模型阵容

<CardGroup cols={3}>
  <Card title="grok-4.6" icon="trophy">
    **最新旗舰 · 代码与 Agent**

    2026/8/7 发布，500K 上下文。与 grok-4.5 同基座同价，长周期任务的自检与验证更强。
  </Card>

  <Card title="grok-4.5" icon="medal">
    **上一代旗舰 · 同价**

    500K 上下文，与 grok-4.6 挂牌同价，存量业务可继续使用。
  </Card>

  <Card title="grok-4.3" icon="scale">
    **标准主力**

    1M 上下文，价格是旗舰的六折出头，日常对话与中等推理的均衡之选。
  </Card>

  <Card title="grok-4.20 双变体" icon="split">
    **推理 / 非推理可选**

    `-reasoning` 与 `-non-reasoning` 同价同上下文（1M），按需选择是否输出思维链。
  </Card>

  <Card title="grok-build-0.1" icon="code">
    **代码专用**

    256K 上下文，全系最低单价，适合高频代码补全与轻量编程任务。
  </Card>

  <Card title="grok-4.20-multi-agent-beta-0309" icon="users">
    **多智能体协作**

    多个 agent 并行协作解题，适合复杂研究任务。计费特性特殊，详见 [Multi-Agent 模型](/api-capabilities/grok/multi-agent)。
  </Card>

  <Card title="更多能力页" icon="book-open">
    对话/推理/视觉见 [对话与推理](/api-capabilities/grok/chat)；联网见 [联网搜索与 X 搜索](/api-capabilities/grok/web-search)。
  </Card>
</CardGroup>

## 模型定价

挂牌价与 xAI 官网一致（已于 2026-07-13 经 API易 定价接口逐一核对，`grok-4.6` 于 2026-08-13 补核），API易 的折扣体现在 **`GrokOfficial` 分组 0.8x** 与 [充值加赠活动](/faq/recharge-promotions) 中，两者可叠加。

下表为 **0 – 200K 上下文档位**的挂牌价（Grok 全系按上下文长度阶梯计费，超过 200K 的档位见下方说明）：

| 模型 ID                             | 上下文  | 提示价格（输入）           | 补全价格（输出）           | 定位                   |
| --------------------------------- | ---- | ------------------ | ------------------ | -------------------- |
| `grok-4.6`                        | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | **最新旗舰**，代码/Agent/通用 |
| `grok-4.5`                        | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 上一代旗舰，与 4.6 同价       |
| `grok-4.3`                        | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 标准主力                 |
| `grok-4.20-0309-reasoning`        | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 推理变体                 |
| `grok-4.20-0309-non-reasoning`    | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 非推理变体（快答/低成本）        |
| `grok-4.20-multi-agent-beta-0309` | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 多智能体（注意计费放大）         |
| `grok-build-0.1`                  | 256K | \$1.00 / 1M tokens | \$2.00 / 1M tokens | 代码专用                 |

### 阶梯计费与缓存价

Grok 全系按**单次请求的上下文长度**分两档计费，分档点为 200K tokens（即 200Ki = 204,800）。超过该点的请求，输入与输出单价翻倍：

| 模型                          | 档位          | 输入     | 输出      | 缓存读取   |
| --------------------------- | ----------- | ------ | ------- | ------ |
| `grok-4.6`                  | 0 – 200K    | \$2.00 | \$6.00  | \$0.50 |
| `grok-4.6`                  | 200K – 512K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.5`                  | 0 – 200K    | \$2.00 | \$6.00  | \$0.30 |
| `grok-4.5`                  | 200K – 512K | \$4.00 | \$12.00 | \$0.60 |
| `grok-4.3` / `grok-4.20` 系列 | 0 – 200K    | \$1.25 | \$2.50  | \$0.20 |
| `grok-4.3` / `grok-4.20` 系列 | 200K – 1M   | \$2.50 | \$5.00  | \$0.40 |
| `grok-build-0.1`            | 0 – 200K    | \$1.00 | \$2.00  | \$0.20 |
| `grok-build-0.1`            | 200K – 256K | \$2.00 | \$4.00  | \$0.40 |

单位均为每 1M tokens。**`grok-4.6` 与 `grok-4.5` 唯一的价格差异在缓存读取**（\$0.50 vs \$0.30），输入输出完全相同。

其中 `grok-4.6` 两档的输入 / 输出 / 缓存读取价均已在 API易 控制台逐项核对；其余模型第二档的缓存读取价按官方「第二档单价翻倍」口径推算，以 [模型价格页](/api-capabilities/model-info) 的实时挂牌为准。

<Info>
  * 别名 `grok-code-fast` / `grok-code-fast-1` 亦可调用（实测连通），定价以 [模型价格页](/api-capabilities/model-info) 为准。
  * 缓存命中的输入 tokens 享受上表的缓存读取价，Grok 前缀缓存**自动生效、无需配置**，双端点与流式 / 非流式均已实测覆盖，详见 [Grok 缓存计费指南](/api-capabilities/grok/prompt-caching)。
  * 长上下文任务请留意分档点：一次 210K tokens 的请求，全部 tokens 都按第二档计价，而不是只有超出的 10K 按第二档。拆分请求可以避开这一跳变。
</Info>

## 分组与折扣

| 分组             | 倍率       | 说明                         |
| -------------- | -------- | -------------------------- |
| `Default`      | 1.0x     | 默认分组，挂牌价即官网同价              |
| `GrokOfficial` | **0.8x** | xAI 官方直转线路，**默认分组售价的 8 折** |

`GrokOfficial` 的**模型能力与调用方式和默认分组完全一致**，单独拆出这个分组只是为了做优惠、鼓励在 Grok 系列上多跑量。创建令牌时勾选该分组（或在已有 Grok 令牌上增加该分组）即可，**代码一行不用改**；`grok-4.6` 等模型在该分组下同样支持 Codex 场景使用。

折扣可与 [充值加赠](/faq/recharge-promotions)（10%–20%）叠加。以 `grok-4.6` 第一档为例：

| 口径                 | 输入 / 1M tokens | 输出 / 1M tokens |
| ------------------ | -------------- | -------------- |
| xAI 官网 = API易 挂牌   | \$2.00         | \$6.00         |
| `GrokOfficial` 8 折 | \$1.60         | \$4.80         |
| 8 折 + 充值加赠 10%     | \$1.45         | \$4.36         |
| 8 折 + 充值加赠 20%     | **\$1.33**     | **\$4.00**     |

## 实测能力矩阵

以下矩阵来自 2026-07-13 (UTC+8) 在 API易 网关的实测（✅ 实测通过；◐ 未实测、同架构预期一致；— 未覆盖，同架构预期一致）：

| 能力                             | grok-4.6 | grok-4.5 | grok-4.3 | 4.20-reasoning | 4.20-non-reasoning | grok-build-0.1 | multi-agent |
| ------------------------------ | :------: | :------: | :------: | :------------: | :----------------: | :------------: | :---------: |
| 基础对话                           |     ✅    |     ✅    |     ✅    |        ✅       |          ✅         |        ✅       |      ✅      |
| 流式输出（含 usage）                  |     ✅    |     ✅    |     ✅    |        ✅       |          ✅         |        ✅       |      ✅      |
| 思维链输出 `reasoning_content`      |  ◐ 默认开启  |  ✅ 默认开启  |  ✅ 默认开启  |        ✅       |       ❌ 按设计关闭      |     ✅ 默认开启     |   内部推理不外露   |
| `reasoning_effort` 参数          |     ◐    |     ✅    |     —    |     ❌ 明确拒绝     |          —         |        —       |      —      |
| 结构化输出（json\_schema）            |     ◐    |     ✅    |     ✅    |        ✅       |          —         |        ✅       |      ✅      |
| 函数调用 / Tool Use                |     ◐    |     ✅    |     ✅    |        —       |          —         |        ✅       |      —      |
| 视觉输入（图片理解）                     |     ◐    |     ✅    |     ✅    |        —       |          ✅         |        —       |      —      |
| Prompt Caching（自动）             |     ✅    |     ✅    |     ✅    |        ✅       |          ✅         |        ✅       |      ✅      |
| Responses API + server-side 工具 |     ◐    |     ✅    |     —    |        —       |          —         |        —       |      —      |

<Note>
  **`grok-4.6` 那一列为什么还有 ◐**：这套 56 组请求的实测跑于 2026-07-13，当时 4.6 尚未发布。2026-08-19 我们对 4.6 补测了**基础对话、流式输出（含 usage）与 Prompt Caching** 三项（覆盖 `/v1/chat/completions` 与 `/v1/responses` 双端点、流式与非流式，并逐条核对了账单），已改为实测结论。其余仍为 ◐ 的项目沿用同架构预期一致的判断：4.6 与 4.5 同为 1.5T 参数 V9 基座、同一套 API 协议与端点，上游也未公告任何参数层面的破坏性变更。生产接入前建议先在自己的用例上做一次小样验证。
</Note>

## 端点一览

| 端点                     | 方法     | 用途                                                       |
| ---------------------- | ------ | -------------------------------------------------------- |
| `/v1/chat/completions` | `POST` | 对话 / 推理 / 函数调用 / 结构化输出 / 视觉（全系共用，`model` 字段区分）           |
| `/v1/responses`        | `POST` | Responses API：联网搜索、X 搜索、代码执行、Remote MCP 等 server-side 工具 |

### 在 Codex 中直接使用

因为原生支持 `/v1/responses`，Grok 是少数能在 **OpenAI Codex**（桌面客户端 / IDE 插件 / CLI）里以 responses 原生协议直接使用的非 OpenAI 模型——`config.toml` 里 `model = "grok-4.6"`、`wire_api = "responses"` 即可，5 分钟接上，Codex 的工具调用、推理条目等 Agent 能力全走原生协议。对比之下，Claude / Gemini 在 API易 上只能走 OpenAI 兼容 chat 模式（`wire_api = "chat"` 兜底），在 Codex / Agent 场景存在协议不兼容。完整接入步骤见 [Codex 接入教程](/scenarios/programming/codex-cli)。

<Warning>
  **以下能力在 API易 上不支持**（实测确认，避免踩坑）：

  * **Legacy Completions（`/v1/completions`）**：上游拒绝——Grok 4.x 全系为推理架构，官方层面即不支持文本补全模式
  * **联网旧入口 `search_parameters`**：已被 xAI 下线（实测返回 410），联网一律走 Responses API 工具，见 [联网搜索](/api-capabilities/grok/web-search)
  * **Batch API / Files 文件能力**：网关不路由，号池模式不适用
  * **Deferred Completions（`deferred: true`）**：参数会被**静默忽略**，请求按同步执行并正常计费，请勿依赖
  * **Collections Search（RAG / file\_search）**：需在 xAI 控制台预建知识库，号池模式不适用
  * **Context Compaction（`/v1/responses/compact`）**、**Priority Processing（`service_tier: "priority"`，实测回落 default）**、**WebSocket 模式**、**mTLS 认证**：均不支持
</Warning>

## 快速开始

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "grok-4.6",
      "messages": [
        {"role": "user", "content": "用一句话介绍你自己"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-api-key",
      base_url="https://api.apiyi.com/v1"
  )

  resp = client.chat.completions.create(
      model="grok-4.6",
      messages=[{"role": "user", "content": "用一句话介绍你自己"}]
  )
  print(resp.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-api-key',
    baseURL: 'https://api.apiyi.com/v1',
  });

  const resp = await client.chat.completions.create({
    model: 'grok-4.6',
    messages: [{ role: 'user', content: '用一句话介绍你自己' }],
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

<Tip>
  **模型怎么选**：默认用 `grok-4.3`（1M 上下文、价格均衡）；代码 Agent / 复杂任务升级 `grok-4.6`（最新旗舰，与 `grok-4.5` 同价，存量 4.5 业务改个模型名即可）；追求快答低成本用 `grok-4.20-0309-non-reasoning`（无思维链、输出 tokens 最省）；高频代码补全用 `grok-build-0.1`；复杂研究类任务才考虑 multi-agent 模型（注意其计费放大特性）。想把成本压到最低，记得把令牌切到 `GrokOfficial` 分组（0.8x）并叠加充值加赠。
</Tip>

## 计费注意：思维链 tokens

`grok-4.6` / `grok-4.5` / `grok-4.3` / `grok-build-0.1` **默认带内部推理**：响应中返回 `reasoning_content`，且推理 tokens 计入输出计费。实测短问答中可见文本仅 30 tokens、实际计费输出 586 tokens（含 556 推理 tokens）。对成本敏感的短问答场景，建议改用 `grok-4.20-0309-non-reasoning`。详细说明见 [对话与推理](/api-capabilities/grok/chat)。

## 常见问题

<AccordionGroup>
  <Accordion title="Grok 有自己的原生 API 格式吗？">
    没有独立私有协议。xAI 官方 REST API 就是 OpenAI 兼容格式：`/v1/chat/completions`（对话）+ `/v1/responses`（Responses API 与 server-side 工具）。在 API易 上用 OpenAI SDK 把 `base_url` 指向 `https://api.apiyi.com/v1` 即为全功能调用，不存在"兼容模式阉割"。
  </Accordion>

  <Accordion title="联网搜索怎么开？">
    走 Responses API：`tools: [{"type": "web_search"}]`（或 `x_search`）。旧版 Chat Completions 的 `search_parameters` 参数已被 xAI 下线（实测 410），不要再使用。详见 [联网搜索与 X 搜索](/api-capabilities/grok/web-search)。
  </Accordion>

  <Accordion title="模型自我介绍说自己是 Grok 4，是不是模型不对？">
    正常现象。Grok 4.x 全系的自我认知均为「Grok 4」（multi-agent 模型自称 Oppie），不会精确报出 4.6 / 4.5 / 4.3 等版本号。验证模型身份请以请求的 `model` 字段和响应 `model` 字段为准，而非模型的自我介绍。
  </Accordion>

  <Accordion title="缓存需要配置吗？">
    不需要。Grok 前缀缓存自动生效，响应 `usage.prompt_tokens_details.cached_tokens` 可自查命中量（`/v1/responses` 端点看 `usage.input_tokens_details.cached_tokens`）。命中量按 128 token 取整，两轮实测都吻合：8802 token 的前缀命中 8704、2735 token 的前缀命中 2688。xAI 官方明确缓存条目可能被驱逐、不保证 100% 命中，**做成本测算请按无缓存价格打底**。完整口径见 [Grok 缓存计费指南](/api-capabilities/grok/prompt-caching)。
  </Accordion>

  <Accordion title="上下文超限会怎样？">
    返回 400 错误。注意各档上限不同：grok-4.6 与 grok-4.5 为 500K，grok-4.3 与 4.20 系列为 1M，grok-build-0.1 为 256K。超长内容建议先做摘要 / 分段 / RAG 检索。
  </Accordion>

  <Accordion title="失败的请求会扣费吗？">
    4xx 类客户端错误（参数错误 / 鉴权失败）不计费；已成功返回 tokens 的请求按实际消耗计费。注意 `deferred: true` 会被静默忽略——请求实际同步执行并正常计费。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="对话与推理" icon="message-square" href="/api-capabilities/grok/chat">
    流式、思维链、结构化输出、函数调用、视觉输入、缓存
  </Card>

  <Card title="缓存计费" icon="database" href="/api-capabilities/grok/prompt-caching">
    命中省 75%、128 token 块粒度、长对话该走哪个端点
  </Card>

  <Card title="联网搜索与 X 搜索" icon="globe" href="/api-capabilities/grok/web-search">
    Responses API 的 web\_search / x\_search 工具实战
  </Card>

  <Card title="代码执行与 MCP" icon="terminal" href="/api-capabilities/grok/code-execution-mcp">
    服务端 Python 沙箱与 Remote MCP 工具接入
  </Card>

  <Card title="Multi-Agent 模型" icon="users" href="/api-capabilities/grok/multi-agent">
    多智能体协作模型的能力与计费特性
  </Card>

  <Card title="在 Codex 中使用 Grok" icon="code" href="/scenarios/programming/codex-cli">
    原生 responses 协议直连 Codex，5 分钟接上
  </Card>

  <Card title="Grok 4.6 发布解读" icon="newspaper" href="/news/grok-4-6-launch">
    xAI 最新旗舰的基准、定价与迁移建议
  </Card>

  <Card title="Grok 4.5 发布解读" icon="newspaper" href="/news/grok-4-5-launch">
    上一代旗舰的深度解读
  </Card>

  <Card title="模型信息总览" icon="database" href="/api-capabilities/model-info">
    查看所有可用模型及分组
  </Card>
</CardGroup>
