> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max 文本生成

> 阿里通义千问旗舰 Qwen3.8-Max：2.4T 参数稀疏 MoE、1M 上下文、131K 输出，原生图片与视频输入。API易挂牌 $1.65/$4.95 每 1M tokens，比官网低 17.5%。含 586 次实测得出的能力矩阵与避坑指南。

Qwen3.8-Max（`qwen3.8-max`）是阿里通义千问 2026 年 8 月 3 日发布的新一代旗舰，稀疏 MoE 架构、2.4 万亿总参数，支持 **1M 上下文**、131K 最大输出，原生接受文本、图片、视频三种输入。API易在发布当天上架，并完成了 **586 次实测调用**——本页的能力矩阵、参数行为与计费提醒全部来自实测，不是转述官方文档。

<Info>
  **API易已接入 Qwen3.8-Max**：模型名 `qwen3.8-max`。**默认开启深度思考**（默认 `xhigh` 档，思考 tokens 计入输出计费），日常对话建议显式设 `reasoning_effort="none"`，实测输出可从约 158 tokens 降到 5 tokens。上一代见 [Qwen3.6 系列（历史版本）](/api-capabilities/qwen-3-6/overview)。
</Info>

## 核心优势

<CardGroup cols={2}>
  <Card title="比官网便宜 17.5％" icon="tag">
    输入 \$1.65、输出 \$4.95 每 1M tokens，阿里云官网为 \$2/\$6。可叠加[充值活动](/faq/recharge-promotions)继续下探。
  </Card>

  <Card title="1M 上下文实测可用" icon="scroll">
    8K / 32K / 128K 三档正文，中部与尾部各埋一枚标识，两个端点 **6/6 全部精确召回**。128K 单次约 80 秒。
  </Card>

  <Card title="一个模型三种模态" icon="eye">
    文本、图片、视频输入全部实测通过，无需在「长文模型」和「视觉模型」之间切换。
  </Card>

  <Card title="Agent 能力大幅提升" icon="wrench">
    FrontierSWE 由上代 40.7 升至 **73.5**，DeepSWE 21.6 → 56.6。工具调用链路完整，两轮 round-trip 实测通过。
  </Card>
</CardGroup>

## 端点支持

| 端点                     | 状态        | 说明                                                                           |
| ---------------------- | --------- | ---------------------------------------------------------------------------- |
| `/v1/chat/completions` | ✅ 完整可用    | **推荐主用**。工具调用、结构化输出、多模态、流式全部实测通过                                             |
| `/v1/messages`         | ⚠️ 代码集成可用 | 回传历史消息前需剥掉 `thinking` 块，否则第二轮 400。Claude Code 等现成客户端暂不可用，见下方「Anthropic 端点用法」 |
| `/v1/responses`        | ❌ 暂不支持    | 30 次测试全部失败，已反馈渠道方                                                            |

## 模型定价

每 1M tokens，折扣前挂牌价：

| 项目      | API易          | 阿里云官网  | 差价      |
| ------- | ------------- | ------ | ------- |
| 输入      | **\$1.65**    | \$2.00 | 低 17.5％ |
| 输出（含思考） | **\$4.95**    | \$6.00 | 低 17.5％ |
| 缓存读     | **\$0.20625** | \$0.25 | 低 17.5％ |
| 缓存写     | **\$2.0625**  | —      | —       |

可叠加[充值活动](/faq/recharge-promotions)，实际成本更低。

## 技术规格

| 项目     | 参数                                     |
| ------ | -------------------------------------- |
| 模型名    | `qwen3.8-max`                          |
| 架构     | 稀疏 MoE，2.4 万亿总参数                       |
| 上下文窗口  | 1M tokens（非思考模式输入上限 991K，思考模式 983K）    |
| 最大输出   | 131,072 tokens（越界报错明确给出 `[1, 131072]`） |
| 最大思考预算 | 262K tokens                            |
| 思考模式   | 默认开启，默认档位 `xhigh`                      |
| 输入模态   | 文本、图片、视频                               |
| 输出速率   | 约 19–22 tokens/s（实测）                   |
| 首字延迟   | 流式 TTFT 约 1.85 秒（实测 P50）               |

官方基准：GPQA Diamond 92.6、PaperBench 93.0、OmniDocBench 1.5 92.1、Terminal-Bench 2.1 86.6、OSWorld-Verified 86.1、IFBench 82.8、FrontierSWE 73.5、SWE-bench Pro 67.7。

## 思考控制（最重要的一节）

Qwen3.8-Max **默认就在思考**，档位为 `xhigh`。思考 tokens 计入输出计费，且占比常达 90％ 以上。

### `reasoning_effort` 七个值，四个真实档位

参数接受 7 个值，但实测只对应 **4 个真实档位**：

| 传入值                      | 实际档位      | 实测思考量            |
| ------------------------ | --------- | ---------------- |
| `none`                   | 关闭思考      | 0 tokens         |
| `minimal` / `low`        | 低档        | 约 100 tokens     |
| `medium`                 | 中档        | 约 150 tokens     |
| `high` / `xhigh` / `max` | 默认档（三者等价） | 约 150–175 tokens |

传 `max` 不会比 `xhigh` 想得更多。传其他值会返回 400 并列出合法值。

### 关闭思考的写法

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "你好"}],
    reasoning_effort="none",
    max_tokens=500,
)
```

`extra_body` 里的 `enable_thinking: false` 与 `chat_template_kwargs: {"enable_thinking": false}` 同样生效，效果等价。

<Warning>
  **`max_tokens` 不约束思考 tokens。** 实测设 `max_tokens=1`，仍被计 **1054** 个输出 token，其中 1045 个是思考。

  `max_tokens` 只截断可见回答。**想控制成本请用 `reasoning_effort`，不要指望 `max_tokens`。**
</Warning>

### `thinking_budget` 不生效

传 128 / 512 / 4096 任何数值，实测行为都等同于 `low` 档，数值不起作用。**请改用 `reasoning_effort`。**

## 调用示例

### Python（OpenAI SDK 兼容）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# 日常对话：关思考，快且省
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "用一句话解释什么是负载均衡"}],
    reasoning_effort="none",
    max_tokens=500,
)
print(resp.choices[0].message.content)

# 复杂推理：保持默认思考档位
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "证明：任意 5 个整数中必存在 3 个数之和被 3 整除"}],
    max_tokens=4000,
)
print(resp.choices[0].message.reasoning_content)  # 思考过程
print(resp.choices[0].message.content)            # 最终答案
```

### 图片输入

```python theme={null}
import base64

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "这张图上写的是什么数字？"},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
    ]}],
    max_tokens=500,
)
```

远程图片 URL 在本端点同样可用，直接把 `url` 填成 `https://...` 即可。

### 视频输入

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "这段视频里有什么？"},
        {"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{b64_video}"}},
    ]}],
    max_tokens=1000,
)
```

<Tip>
  视频理解单次耗时实测 **144–285 秒**，请把客户端超时设到 300 秒以上，并优先用流式或异步任务队列承接。
</Tip>

另有帧序列写法 `{"type": "video", "video": [帧1, 帧2, ...]}`，要求 **4–8000 帧**，少于 4 帧会返回 400。

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.8-max",
    "messages": [{"role": "user", "content": "你好"}],
    "reasoning_effort": "none"
  }'
```

## 工具调用

Chat Completions 端点的工具调用**完整可用**：单工具、并行多工具、两轮 round-trip、20 个工具中选 1、流式增量拼接、`parallel_tool_calls: false` 全部实测通过。

<Warning>
  **强制工具调用需同时关闭思考。** `tool_choice` 设为 `"required"` 或指定具体函数时，必须同时设 `reasoning_effort="none"`，否则返回 400（`tool_choice does not support being set to required or object in thinking mode`）或静默不调用。

  `tool_choice` 用 `"auto"` / `"none"` 不受此限制。同理，`n > 1` 也需要关闭思考。
</Warning>

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "查一下北京天气"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
    reasoning_effort="none",   # 必须
)
```

## 结构化输出

`response_format` 的 `json_schema` 实测**严格守约**：嵌套对象、枚举、数组、`additionalProperties: false` 全部生效，无多余字段、无 Markdown 代码块包裹。

<Tip>
  **结构化场景请显式关思考。** 同一个 schema 实测对比：

  | 配置                                        | 输出 tokens | 其中思考  | 耗时    |
  | ----------------------------------------- | --------- | ----- | ----- |
  | `json_schema` + 默认思考                      | 4,066     | 3,971 | 100 秒 |
  | `json_schema` + `reasoning_effort="none"` | 154       | 0     | 4.7 秒 |

  两者守约程度完全一致，成本和延迟差一个数量级。
</Tip>

## 上下文缓存

* **命中门槛约 1024 tokens**：818 tokens 的前缀不命中，1070 tokens 起命中
* **真实多轮对话吃得到缓存**：逐轮追加消息的场景每轮都命中
* **长文收益显著**：128K 上下文实测缓存命中 98.6％，32K 命中 99.3％

<Warning>
  **不要拿接口回显的缓存字段判断有没有命中。** 实测部分线路的 `cache_read_input_tokens` 恒为 0，部分线路的响应里干脆没有缓存字段——但同一批请求在控制台账单里能看到实实在在的缓存读取。

  **以控制台的「缓存计费详情」为准**，那里会分别列出缓存创建（1.25x）与缓存读取（0.125x）的 token 数和金额。
</Warning>

<Tip>
  **缓存计费口径不是按端点固定的，会随线路变。** 实测同一条线路、同一形态的请求，在不同日期分别被判为两种口径：

  | 口径           | 结算方式                                |
  | ------------ | ----------------------------------- |
  | OpenAI 缓存    | 包含在 prompt tokens 中，命中部分按 0.125x    |
  | Anthropic 缓存 | 独立于基础 token 单独结算，创建 1.25x、读取 0.125x |

  控制台日志里点开单条请求，「缓存计费详情」会标明本次用的是哪一种，并列出完整算式。**要判断某次调用到底怎么计费的，只能看那里。**
</Tip>

<Tip>
  Anthropic 端点上**不加 `cache_control` 也可能命中隐式缓存**。是否手动标记 `cache_control` 请以控制台实际扣费为准做一次对比，不要默认加上就一定更省。
</Tip>

## Anthropic 端点用法

`/v1/messages` 可用于代码集成，但**回传历史消息前需要剥掉 `thinking` 块**，否则返回 400（`if content is list. item must be dict and key[type] should in dict`）。

```python theme={null}
def strip_thinking(blocks):
    return [b for b in blocks if b.get("type") != "thinking"]

messages.append({"role": "assistant", "content": strip_thinking(resp["content"])})
```

实测这样处理后，3 轮跨轮记忆、工具调用两轮 round-trip、工具结果进入后续记忆全部正常。

### 2026-08-08 追加复测：多轮工具调用本身没问题

一轮 300 次调用的专项复测，结论是**多轮 `tool_use` / `tool_result` 链路本身是好的**，卡点只在 `thinking` 块：

* **`tool_result` 没有任何额外格式限制**：`content` 为字符串或 block 数组、`is_error` 真假、空结果、50KB 大结果、乱序回传、只回传部分、伪造 `tool_use_id`——15 种形态全部通过。控制字符、emoji、20 万字符单行也都能过。
* **`thinking` 块的 `signature` 取什么值都救不了**：空串、`null`、整个 key 缺失、伪造值，四种全部返回同一个 400。**只能删掉整个块。**
* **剥掉 `thinking` 后压力测试通过**：24K token 系统提示词 + 8 个工具的自主 agent 循环，12 轮 × 2 组，上下文涨到 28.7K，**24/24 全部成功**。
* **SSE 事件完整**：`message_start` / `content_block_start` / `content_block_delta` / `content_block_stop` / `message_delta` / `message_stop` 齐全，另有 `ping`；`text_delta` / `thinking_delta` / `signature_delta` / `input_json_delta` 都正常。
* **没有速率或并发限制**：同一请求顺序重复 40 次全部成功，并发 1 / 4 / 8 / 16 / 32 各档全部成功，未出现 429。

<Warning>
  **Claude Code 等现成客户端暂不可用。** 这类客户端默认原样回显历史 content blocks，无法改变其行为，所以**第一轮能正常返回 `tool_use`，工具执行完回传 `tool_result` 后第二轮就会 400**——这是该端点上最常见的故障表现。

  较新版本的 Claude Code 还会发送 `thinking: {"type": "adaptive"}`，部分线路只接受 `enabled` / `disabled` / `auto`，会在**第一轮**就返回 400。

  请改用 `/v1/chat/completions`。
</Warning>

### 想在 Claude Code 里用怎么办

这类「特定客户端里跑不起来」的问题，**未必是我们这边的适配问题，也可能是模型侧本来就不支持**。建议先去阿里云百炼官方平台用同样的用法验证一次（控制台：`bailian.console.aliyun.com`）：

* 如果官方平台同样不支持，那就是模型侧的限制，我们这边也绕不过去；
* 如果官方平台可以、我们这边不行，请把请求体发给我们，我们跟渠道方对齐。

如果你的目标就是**在 Claude Code 这类客户端里干活**，直接用本站的 **Claude 系列**或 **OpenAI 系列**更省事——默认分组就是官转，不需要任何额外适配。

### 其他差异与实测注意

* `response_format` 被静默忽略（结构化输出请改用工具强制）
* `tool_choice` 只接受 OpenAI 格式；**强制工具调用（`required` 或指定函数）在思考模式下两个端点都不支持**
* 图片只支持 base64，远程 URL 返回 400
* `reasoning_effort` 不生效，关思考请用 `thinking: {"type": "disabled"}`
* `stop_sequences` **截断本身生效**，但 `stop_reason` 会误报成 `end_turn`、`stop_sequence` 字段返回 `null`，不要依赖它判断停止原因
* 流式 usage 因线路而异：部分线路 `message_start` 里的 `input_tokens` 不可信，部分线路流式最终 `output_tokens` 恒为 0。**需要精确核算时请以非流式返回的 usage 或账单为准**
* 输入长度上限实测 983,616 tokens，超出返回 `Range of input length should be [1, 983616]`

<Tip>
  **超时请设宽一些。** 实测首个 SSE 字节要 6–17 秒才到，期间连接完全静默；请求体越大越慢，256KB 约 44 秒、1MB 约 160 秒。跑在 Docker、跳板机或公司网关后面时，中间任何一层的空闲超时都会表现成「长时间无响应后异常退出」。建议客户端超时设到 300 秒以上。
</Tip>

## 参数兼容性

| 参数                                                 | 状态 | 说明                                                         |
| -------------------------------------------------- | -- | ---------------------------------------------------------- |
| `temperature`                                      | ✅  | 有效范围 `[0.0, 2.0)`，传 2 即报 400                               |
| `top_p`                                            | ✅  | 有效范围 `(0.0, 1.0]`                                          |
| `top_k` / `presence_penalty` / `frequency_penalty` | ✅  |                                                            |
| `stop` / `stop_sequences`                          | ⚠️ | 截断生效，但 Anthropic 端点的 `stop_reason` 会误报成 `end_turn`         |
| `logprobs` / `top_logprobs`                        | ✅  |                                                            |
| `stream` + `stream_options`                        | ⚠️ | 长流式完整终止无尾部扣留；但流式 usage 因线路而异，精确核算请用非流式或账单                  |
| `partial: true`                                    | ✅  | 前缀续写，续写时不思考                                                |
| `n > 1`                                            | ⚠️ | 需同时设 `reasoning_effort="none"`                             |
| `seed`                                             | ❌  | 同 seed 两次输出不同，不保证确定性                                       |
| `prefix: true`                                     | ❌  | 无效，请用 `partial: true`                                      |
| `thinking_budget`                                  | ❌  | 数值不生效                                                      |
| 内置联网搜索                                             | ❌  | `enable_search` 与 `tools: [{"type": "web_search"}]` 均被静默丢弃 |

## 最佳实践

<CardGroup cols={2}>
  <Card title="日常对话与高频调用" icon="zap">
    显式设 `reasoning_effort="none"`。实测耗时从约 5 秒降到 2 秒、输出 tokens 降到 1/30。
  </Card>

  <Card title="长文档与代码库分析" icon="scroll">
    128K 召回实测精确，长文缓存命中率高。把大文档放在消息前部，追问放在尾部。
  </Card>

  <Card title="数据抽取" icon="braces">
    用 `json_schema` 约束结构，同时关思考。守约程度不受影响。
  </Card>

  <Card title="Agent 与工具编排" icon="wrench">
    走 `/v1/chat/completions`。需要强制调用时记得关思考。
  </Card>
</CardGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么我设了 max_tokens 还是被扣了很多 token？">
    `max_tokens` 只约束可见回答，不约束思考部分。实测 `max_tokens=1` 仍被计 1054 个输出 token。控制成本请用 `reasoning_effort="none"`。
  </Accordion>

  <Accordion title="为什么 tool_choice 指定了函数却报 400？">
    思考模式下不支持 `tool_choice` 强制调用。请同时传 `reasoning_effort="none"`。
  </Accordion>

  <Accordion title="为什么 /v1/responses 调不通？">
    该端点对本模型暂未接入，30 次测试全部失败（错误码在 404 与 400 之间跳变）。已反馈渠道方，接通后会在[实时动态](/live)公告。请改用 `/v1/chat/completions`。
  </Accordion>

  <Accordion title="Claude Code 能用这个模型吗？">
    暂时不能。`/v1/messages` 端点拒绝含 `thinking` 块的历史消息，而 Claude Code 默认原样回显，所以第一轮能出 `tool_use`、回传 `tool_result` 后第二轮就 400。自己写代码调用时剥掉该块即可正常使用。

    需要在 Claude Code 里干活的话，建议直接用本站的 Claude 系列或 OpenAI 系列，默认分组就是官转，不需要额外适配。也可以先去阿里云百炼官方平台（`bailian.console.aliyun.com`）验证同样的用法是否支持——如果官方平台同样不支持，那是模型侧的限制。
  </Accordion>

  <Accordion title="为什么第一轮好好的，回传工具结果后就卡住/报错？">
    这是 `/v1/messages` 端点上最典型的表现。原因是回传的历史 assistant 消息里带了 `thinking` 块，该端点不接受，返回 400。`signature` 改成空串、`null` 或删掉这个字段都没用，**必须删掉整个 `thinking` 块**。

    实测剥掉之后，24K 上下文的 12 轮工具循环可以稳定跑完。多轮 `tool_use` / `tool_result` 链路本身没有问题。
  </Accordion>

  <Accordion title="usage 里为什么有时没有 reasoning_tokens / 缓存字段？">
    该模型背后有多条上游线路，各线路回显的 usage 字段不一致：有的不回 `reasoning_tokens` 与 `cached_tokens`，有的 `cache_read_input_tokens` 恒为 0，有的流式最终 `output_tokens` 恒为 0。已反馈渠道方统一口径。

    **接口回显不代表实际计费。** 需要精确核算时，请以控制台日志里单条请求的计费详情为准，那里会列出基础费用与缓存费用的完整计算过程。
  </Accordion>

  <Accordion title="视频调用为什么很慢？">
    视频理解单次实测 144–285 秒，属于模型本身的处理耗时。请把超时设到 300 秒以上，并考虑用异步队列承接。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Qwen3.8-Max 在线调试](/api-capabilities/qwen-3-8/chat-completions) — Playground 直接发请求
* [Qwen3.6 系列（历史版本）](/api-capabilities/qwen-3-6/overview) — 上一代五款模型
* [Qwen3.8-Max 上线说明](/news/qwen-3-8-max-launch) — 基准数据与完整解读
* [模型价格](/models) — 全站模型单价、缓存价格与可用端点
* [充值优惠活动](/faq/recharge-promotions) — 叠加折扣

<Info>
  本页实测数据来自 2026-08-03 的 586 次调用（12:50–14:35 UTC+8），以及 2026-08-08 针对 Anthropic 端点多轮工具调用的 300 次专项复测（22:10–2026-08-09 00:40 UTC+8）。

  接口返回的 usage 字段在不同上游线路间口径不一致，**计费请以控制台日志的计费详情为准**。模型与网关行为可能随渠道调整而变化，以实际调用为准。
</Info>
