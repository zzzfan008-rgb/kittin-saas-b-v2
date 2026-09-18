> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Astra 文本生成

> OpenAI GPT-6 Astra 旗舰模型：API易 Responses 与 Chat Completions 双端点开通，输入 $10、输出 $50 每 1M tokens，Codex_Reverse 分组半价。含官转与逆向三条线路 220 余项实测、四档推理数据与逐项差异归属。

GPT-6 Astra（`gpt-6-astra`）是 OpenAI 2026 年 9 月 3 日发布的新一代旗舰，官方定位是电脑操作、软件工程、科研与长程 Agent 任务，1,050,000 上下文、128,000 最大输出、推理力度可调。API易 已开通 **Responses** 与 **Chat Completions** 双端点，上线当天在官转（OpenAI 直连、Azure）与 `Codex_Reverse` 三条线路各跑了一遍 74 项能力矩阵。

<Info>
  **API易 已接入 GPT-6 Astra**：模型名 `gpt-6-astra`。`default` / `svip` 官转分组与官网逐项同价，由 OpenAI 直连与 Azure 两条官方线路承载；`Codex_Reverse` 分组（Codex 逆向资源）按官网价 **0.5 折扣**计费。**函数调用与 Agent 工具链只在 Responses 端点上**，新项目请直接用 Responses。
</Info>

<Warning>
  **Chat Completions 端点不支持函数工具。** 带 `tools` 的请求在官转线路会被上游直接拒绝（400，提示改用 Responses），与是否传 `reasoning_effort`、`tool_choice` 无关。这是模型侧限制，不是平台问题。存量 Chat 代码如果用到函数调用，迁移到 Astra 时必须同时迁到 Responses。
</Warning>

## 核心优势

<CardGroup cols={2}>
  <Card title="为「把任务做完」而生" icon="monitor">
    Terminal-Bench 4.0 由 37.3% 提到 57.9%、ScreenSpot-Pro 由 76.9% 提到 92.7%、OSWorld 2.0 72.6%。提升最大的全是 Agent 类任务，官方称复杂任务平均完成时间从约 75 分钟压到 40 分钟。
  </Card>

  <Card title="1.05M 上下文实测可用" icon="file-text">
    30.8 万字符（210,657 tokens）大海捞针 10.3 秒答对。官方称同等任务 token 消耗比 GPT-5.6 Sol 低约 70%，单价高 2.5 倍，实际任务成本差距小于价差。
  </Card>

  <Card title="Responses 工具链完整" icon="bot">
    函数调用单次 / 并行 / 回传 / 流式全通，web\_search 与 code\_interpreter 托管工具可用，加密推理块可无状态回放。JSON Schema 严格模式字段集完全匹配。
  </Card>

  <Card title="三线路实测、差异逐项归属" icon="git-fork">
    同一矩阵在 OpenAI 直连、Azure、Codex\_Reverse 各跑一遍，模型能力三线一致；差异全在链路层，本页按「上游限制 / 分组特有 / 线路特有」逐项标注。
  </Card>
</CardGroup>

## 模型信息

| 参数               | 值                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **模型名称**         | `gpt-6-astra`                                                                                  |
| **发布日期**         | 2026 年 9 月 3 日（OpenAI）；2026 年 9 月 5 日上架 API易                                                   |
| **输入模态**         | 文本、图像（暂不支持音频、视频）                                                                               |
| **输出模态**         | 文本                                                                                             |
| **上下文窗口 / 最大输出** | 1,050,000 / 128,000 tokens                                                                     |
| **知识截止**         | 2026 年 4 月 30 日                                                                                |
| **推理力度**         | `low` / `medium` / `high` / `xhigh`，缺省 `medium`；`max` 会按 `xhigh` 回显                            |
| **可用分组**         | `default`、`svip`（官转）、`Codex_Reverse`（逆向，0.5 折扣）                                                |
| **端点**           | `POST /v1/responses`（主端点，函数调用在此）、`POST /v1/chat/completions`（兼容平迁，无函数工具）                       |
| **流式输出**         | ✅ 两端点均支持，Chat 末块带 usage                                                                        |
| **网络安全等级**       | Preparedness Framework「Critical」，公开版拒绝漏洞挖掘类任务；OpenAI 直连线路回显 `access_programs.cyber = standard` |

## 实测能力矩阵

2026 年 9 月 5 日，三条线路各跑 74 项（官转线路的长上下文用 7 万 token 缩量版控成本）：

| 能力                                            | Responses                                                                   | Chat Completions                                  | 三线结论                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| 基础对话（非流式 / 流式）                                | ✅ / ✅                                                                       | ✅ / ✅                                             | 一致；最小提示 input\_tokens = 7，无隐藏注入                             |
| 推理档位 low / medium / high / xhigh              | ✅ 四档全部答对                                                                    | ✅                                                 | 一致，reasoning\_tokens 单调递增                                   |
| 推理档位 `max`                                    | ⚠️ 三线都回显 `xhigh`                                                            | ⚠️                                                | 官转线路 max 的推理 token 高于 xhigh，可能已生效只是回显归一化                    |
| 系统提示                                          | ✅ `instructions` / `system` 均生效                                             | ✅ 官转；⚠️ Codex\_Reverse 丢弃 `system`，`developer` 正常 | 分组特有                                                        |
| **函数调用**（单次 / 回传 / 并行 / 流式）                   | ✅ / ✅ / ✅ 2 个 / ✅                                                           | ❌ 官转线路 400                                        | **上游限制**：Chat 端点不支持函数工具                                     |
| 结构化输出 `json_schema`（strict）                   | ✅                                                                           | ✅                                                 | 一致，字段集完全匹配                                                  |
| `json_object`                                 | ✅                                                                           | ✅                                                 | 一致                                                          |
| 图片输入（base64）                                  | ✅                                                                           | ✅                                                 | 一致，三色块数量、颜色全对                                               |
| 图片输入（URL）                                     | ✅ 可下载主机                                                                     | ✅ 官转；⚠️ Codex\_Reverse 静默丢弃                       | 链接须能被服务端下载，Wikimedia 这类反爬站点三线都失败                            |
| 提示缓存                                          | ✅ 8.7K 前缀二发命中                                                               | ✅                                                 | 三线均命中，跨端点共享。API 回显的 `cached_tokens` 偶有滞后，实际命中以控制台「缓存计费详情」为准 |
| 长上下文                                          | ✅ 210K tokens 10.3 s；70K tokens 6.3 s                                       | —                                                 | 一致                                                          |
| `web_search` / `web_search_preview`           | ✅ OpenAI 直连、Codex\_Reverse                                                  | —                                                 | **Azure 线路临时停用**（平台通知：Bing 计费排查中）                           |
| `code_interpreter`                            | ✅ 官转；❌ Codex\_Reverse 400                                                   | —                                                 | 分组特有                                                        |
| `computer_use_preview`                        | ❌ 400「not supported with gpt-6-astra」                                       | —                                                 | 上游不支持                                                       |
| 加密推理块（`include: reasoning.encrypted_content`） | ✅ 回放 200，答案连贯                                                               | —                                                 | 一致                                                          |
| `previous_response_id`                        | ✅ 官转；⚠️ Codex\_Reverse 静默失效                                                 | —                                                 | 分组特有；`GET /v1/responses/{id}` 三线均 503                       |
| 输出上限                                          | ✅ 官转 `max_output_tokens` / `max_completion_tokens` 生效；⚠️ Codex\_Reverse 不生效 | 同左                                                | 分组特有；旧参数 `max_tokens` 官转 400                                |
| `temperature`                                 | ❌ 官转 400；Codex\_Reverse 接受但不生效                                              | 同左                                                | 上游限制，推理模型常态                                                 |
| `text.verbosity` low / high                   | ✅ 约 550 vs 1350 字符                                                          | —                                                 | 一致                                                          |
| `service_tier` flex / priority                | ⚠️ 接受但回显 default                                                            | —                                                 | 三线均按标准档计                                                    |
| 8 并发                                          | ✅ 8/8                                                                       | —                                                 | 中位延迟 OpenAI 直连 2.4 s、Azure 2.7 s、Codex\_Reverse 3.6 s       |

## 推理档位

同一道过河题，Responses 端点，三条线路的 reasoning\_tokens：

| `reasoning.effort` | OpenAI 直连 | Azure | Codex\_Reverse | 结果 |
| ------------------ | --------- | ----- | -------------- | -- |
| `low`              | 12        | 28    | 22             | ✅  |
| `medium`（缺省）       | 33        | 43    | 62             | ✅  |
| `high`             | 146       | 169   | 99             | ✅  |
| `xhigh`            | 246       | 320   | 199            | ✅  |
| `max`（回显 `xhigh`）  | 278       | 516   | 207            | ✅  |

<Warning>
  **不要传 `none` 或 `minimal`**。`minimal` 三线都不被接受（官转 400，Codex\_Reverse 改成 `low`）；`none` 三线三样：OpenAI 直连 400、Azure 接受、Codex\_Reverse 改成 `medium` 并让 input\_tokens 从 14 涨到 4394（上游注入约 4.2K token 隐藏指令）。对外可用的就是 `low` / `medium` / `high` / `xhigh` 四档。
</Warning>

<Tip>
  推理 tokens 按输出价 \$50 / 1M 计费。确定性强的步骤用 `low` / `medium`，规划与调试环节再上 `xhigh`。消耗看 `usage.output_tokens_details.reasoning_tokens`（Responses）或 `usage.completion_tokens_details.reasoning_tokens`（Chat，官转线路有此字段）。
</Tip>

## 定价

### 官转分组（`default` / `svip`）

按单次请求的输入 tokens 分两档，超过 272K 后**整单**按第二档计，与官网一致：

| 输入 tokens        | 输入      | 输出（含推理） | 缓存读取   | 缓存创建（5 分钟） |
| ---------------- | ------- | ------- | ------ | ---------- |
| 0 - 272K         | \$10.00 | \$50.00 | \$1.00 | \$12.50    |
| 272,001 - 1,050K | \$20.00 | \$75.00 | \$2.00 | \$25.00    |

### Codex\_Reverse 分组

按官网价 0.5 折扣计费：第一档输入 \$5.00 / 输出 \$25.00 / 缓存读取 \$0.50 / 缓存创建 \$6.25。

<Info>
  API易 的模型价格与原厂逐项对齐，折扣通过分组与充值加赠体现，详见 [充值优惠](/faq/recharge-promotions)。分组差异见 [Codex、ClaudeCode 和 Default 分组有什么区别](/faq/codex-claudecode-default-groups)。实时价格以 [模型价格页](/models/index) 为准。
</Info>

## 分组怎么选

| 分组                 | 价格     | 适合                                                    | 注意                          |
| ------------------ | ------ | ----------------------------------------------------- | --------------------------- |
| `default` / `svip` | 官网同价   | 生产环境、稳定性要求高、需要输出上限保护与 `previous_response_id`          | 由 OpenAI 直连与 Azure 两条官方线路承载 |
| `Codex_Reverse`    | 0.5 折扣 | Codex CLI 编程、Cherry Studio 等客户端聊天、OpenClaw 等 Agent 场景 | 有 5 项分组特有差异，见下方             |

## 调用示例

### Responses 端点（推荐）

<CodeGroup>
  ```python Python（基础 + 推理档位） theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh
      instructions="你是一名资深后端工程师，回答简洁。",
      input="把这个仓库从 Python 3.9 迁移到 3.13，列出需要修改的文件与原因",
      max_output_tokens=4000,
  )
  print(response.output_text)
  print(response.usage.output_tokens_details.reasoning_tokens)
  ```

  ```python Python（函数调用 + 网页搜索） theme={null}
  from openai import OpenAI
  import json

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  tools = [
      {"type": "web_search"},
      {"type": "function", "name": "get_weather", "description": "查询城市当前天气",
       "parameters": {"type": "object", "properties": {"city": {"type": "string"}},
                      "required": ["city"], "additionalProperties": False}, "strict": True},
  ]
  r = client.responses.create(model="gpt-6-astra", tools=tools, reasoning={"effort": "low"},
                              input="分别查一下北京和上海现在的天气。")
  for item in r.output:
      if item.type == "function_call":
          print(item.name, json.loads(item.arguments))
  ```

  ```python Python（无状态多轮：加密推理块回放） theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  history = [{"role": "user", "content": "把 17 和 23 相乘，只回答数字。"}]

  r1 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  # 把上一轮的完整 output（含加密推理块）原样带回，三条线路均可用，不依赖服务端存储
  history += [item.model_dump(exclude_none=True) for item in r1.output]
  history.append({"role": "user", "content": "再把结果加 1，只回答数字。"})

  r2 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  print(r2.output_text)   # 392
  ```

  ```bash cURL（图片输入，base64） theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "low"},
      "input": [{"role": "user", "content": [
        {"type": "input_text", "text": "图里有几个彩色方块？"},
        {"type": "input_image", "image_url": "data:image/png;base64,iVBORw0KGgo..."}
      ]}]
    }'
  ```
</CodeGroup>

### Chat Completions 端点（存量代码平迁，无函数工具）

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",
      max_completion_tokens=4000,      # 不要用旧参数 max_tokens（400）
      messages=[
          # 官转线路 system 正常；Codex_Reverse 分组会丢弃 system，用 developer 两边都通
          {"role": "developer", "content": "你是一名资深后端工程师，回答简洁。"},
          {"role": "user", "content": "解释一下 Python 3.13 的自由线程模式"},
      ],
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js（流式） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });

  const stream = await client.chat.completions.create({
    model: 'gpt-6-astra',
    reasoning_effort: 'low',
    messages: [{ role: 'user', content: '用三句话介绍长城' }],
    stream: true,
    stream_options: { include_usage: true },
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 差异归属

三条线路跑同一矩阵后，差异可以清楚地分成三类。

### 上游限制（三线一致）

<AccordionGroup>
  <Accordion title="Chat Completions 不支持函数工具">
    官转两线带 `tools` 的 Chat 请求一律 400，上游原文要求改用 Responses；不带 `reasoning_effort`、加 `tool_choice: required` 都一样。`Codex_Reverse` 分组能过是因为链路内部转成了 Responses，不要把它当能力依据。需要函数调用请直接用 Responses。
  </Accordion>

  <Accordion title="reasoning.effort: max 回显为 xhigh">
    三条线路 3/3 次请求 `max` 都回显 `xhigh`。官转线路 max 的推理 token 明显高于 xhigh（OpenAI 直连 278 至 379 对 246，Azure 342 至 516 对 320），可能是档位已生效只是回显被归一化；Codex\_Reverse 上两者无差别。对外只承诺四档。
  </Accordion>

  <Accordion title="Chat 端点参数：max_tokens 与 temperature 会 400">
    官转线路对旧参数 `max_tokens` 返回 400 并要求改用 `max_completion_tokens`；`temperature` 返回 400 unsupported（推理模型常态）。Codex\_Reverse 分组接受这两个参数但不生效。存量代码迁移时把这两处一并清掉。
  </Accordion>

  <Accordion title="computer_use_preview 工具不可用">
    三条线路都返回 400「Tool 'computer\_use\_preview' is not supported with gpt-6-astra」。官方发布材料中的电脑操作能力目前不通过这个工具类型对 API 开放。
  </Accordion>
</AccordionGroup>

### Codex\_Reverse 分组特有（5 项）

<AccordionGroup>
  <Accordion title="1. Chat 端点的 system 消息被整段丢弃">
    指令型与信息型 system 各 0/3 命中，同样内容改成 `developer` 角色 3/3 命中；官转两线 `system` 3/3 正常。**Chat 调用统一用 developer**，三条线路都通。
  </Accordion>

  <Accordion title="2. 三种输出上限参数都不生效">
    `max_output_tokens: 20`、`max_tokens: 20`、`max_completion_tokens: 20` 下输出均为 403 tokens，Responses 回显 `max_output_tokens: null`。官转两线 20 → `incomplete` / `length` 正常截断。依赖上限控费的场景请用官转分组。
  </Accordion>

  <Accordion title="3. previous_response_id 静默失效">
    `store: true` 仍回显 `false`，第二轮返回 200 但不记得上一轮；官转两线正常回忆。多轮在该分组请客户端自带历史，配合 `include: ["reasoning.encrypted_content"]` 无状态回放（三线均已验证）。`GET /v1/responses/{id}` 三线都是 503。
  </Accordion>

  <Accordion title="4. Chat 端点的图片 URL 静默丢弃">
    Chat 传 http(s) 图片链接时 prompt\_tokens 只有 15，模型回答「没有看到图片」；官转两线同一链接正常识图。base64 三线两端点都正常。**该分组 Chat 传图请用 base64。**
  </Accordion>

  <Accordion title="5. effort none 注入约 4.2K token 隐藏指令">
    `none` 被改成 `medium`，input\_tokens 从 14 涨到 4394（4224 落在 `usage.attribution.request_fields.instructions`，按缓存价计）；`minimal` 被改成 `low`。另外该分组不支持 `code_interpreter` 托管工具（400）。
  </Accordion>
</AccordionGroup>

### Azure 线路特有（1 项）

<AccordionGroup>
  <Accordion title="web_search 临时停用">
    Azure 线路上带 `web_search` / `web_search_preview` 的请求返回 400，网关提示「web\_search 已临时停用（Azure Bing 计费排查中），其他工具调用不受影响」。OpenAI 直连线路与 Codex\_Reverse 分组正常。恢复后本页会更新。
  </Accordion>
</AccordionGroup>

## 迁移指南

<AccordionGroup>
  <Accordion title="从 gpt-5.6-sol 迁移">
    Responses 端点只改 `model` 字段。Chat 端点若用到 `tools`，必须迁到 Responses；同时清掉 `max_tokens` 与 `temperature`。价格是 Sol 现行优惠价的 2.5 倍（\$4 / \$20 → \$10 / \$50），先在 Agent、自动化、复杂工程任务上做一轮对照，日常对话与分类抽取类负载留在 Terra / Luna。
  </Accordion>

  <Accordion title="从 Chat Completions 迁到 Responses">
    `messages` → `input`，`reasoning_effort` → `reasoning: {"effort": ...}`，`response_format` → `text: {"format": ...}`，`system` → `instructions`，`max_completion_tokens` → `max_output_tokens`。工具定义从 `{"type": "function", "function": {...}}` 扁平化为 `{"type": "function", "name": ..., "parameters": ...}`。完整对照见 [Responses 迁移指南](/api-capabilities/openai/responses-migration)。
  </Accordion>

  <Accordion title="长上下文怎么控成本">
    输入超过 272K tokens 时整单按第二档计（输入翻倍、输出 1.5 倍）。除非确实需要一次装下整个仓库，日常把上下文压在 272K 以内；稳定前缀放在消息开头以命中缓存（缓存读取是标准输入价的十分之一）。
  </Accordion>

  <Accordion title="网络安全类任务会被拒吗">
    Astra 是首个被划入 Preparedness Framework 网络安全「Critical」级的模型，公开版拒绝漏洞挖掘、漏洞利用代码编写等进攻性任务。防御性用途不受影响：三条线路上「Web 应用防 SQL 注入的工程做法」都正常给出参数化查询、最小权限等完整答案。
  </Accordion>
</AccordionGroup>

## 相关文档

* [GPT-6 Astra 上线说明（基准数据与选型建议）](/news/gpt-6-astra-launch)
* [Codex\_Reverse 半价分组上线 gpt-6-astra](/live/2026-09/codex-reverse-gpt-6-astra)
* [OpenAI 推理模型使用指南](/api-capabilities/openai/reasoning-models)
* [OpenAI 提示缓存](/api-capabilities/openai/prompt-caching)
* [OpenAI 函数调用](/api-capabilities/openai/function-calling)
