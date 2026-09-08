> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Effort 努力档位与思考指南

> Anthropic 原生格式下 output_config.effort 努力档位与 adaptive thinking 自适应思考的正确用法，附完整可运行示例。

本文说明如何用 **Anthropic 原生 Messages API** 调用 Claude（经 API易 网关转 AWS Bedrock），以及 `output_config.effort`（努力档位）和 `thinking`（自适应思考）的正确用法。

基础的通道、计费与接入信息请先看 [Claude API 基础说明](/api-capabilities/claude)。

<Info>
  适用模型：Claude Opus 4.8 / 4.7 / 4.6、Sonnet 4.6 等。本文以 **Opus 4.8** 为例。
</Info>

## 在线测试工具

不想写代码？可以先用 API易 在线推理测试工具体验：选择模型与 effort 档位、设置 Max Tokens、勾选「请求返回思考摘要」，即可直接对比不同档位的推理效果。

<Card title="推理测试 · API易 在线工具" icon="flask-conical" href="https://imagen.apiyi.com/#reasoning">
  网页端直接调用 Claude（也支持 GPT / Gemini）推理测试，无需写代码，填入 API易 令牌即可使用。
</Card>

<img src="https://mintcdn.com/apiyillc/243pgGcIcpapNSDI/images/claude-effort-reasoning-tool.png?fit=max&auto=format&n=243pgGcIcpapNSDI&q=85&s=5207a7ea87e733a018c55c9480d2bc64" alt="API易 在线推理测试工具：选择 claude-opus-4-8 模型与 effort 档位" width="1400" height="856" data-path="images/claude-effort-reasoning-tool.png" />

## 请求的基本结构

### Endpoint 与请求头

```
POST https://api.apiyi.com/v1/messages
```

| Header              | 值                  | 说明                 |
| ------------------- | ------------------ | ------------------ |
| `content-type`      | `application/json` | 固定                 |
| `anthropic-version` | `2023-06-01`       | Anthropic 原生版本头，必填 |
| `x-api-key`         | `your-apiyi-key`   | Anthropic 原生鉴权方式   |

<Info>
  经 API易 转 Bedrock 时，**客户端仍用 Anthropic 原生格式**（`x-api-key` + `/v1/messages`），网关内部负责翻译成 Bedrock 的 `bedrock-2023-05-31`。你不需要写 `anthropic_version: bedrock-2023-05-31`。
</Info>

### 最小请求体

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "messages": [
    { "role": "user", "content": "你的问题" }
  ]
}
```

## effort 努力档位

`effort` 控制 Claude 愿意花多少 token 来产出结果，在「彻底程度」和「速度/成本」之间权衡。它影响**全部** token 消耗：正文、工具调用、以及扩展思考。

<Warning>
  **关键规则**

  1. `effort` 必须放在顶层独立的 `output_config` 对象里，**不能**放进 `thinking` 里 —— 放错会直接 `ValidationException` / 400。
  2. **无需 beta 头**。effort 现已对所有支持的模型开放，不再需要 `anthropic-beta: effort-2025-11-24`。
  3. 默认值是 `high`；设成 `"high"` 与完全不传 `effort` 行为一致。
</Warning>

### 带 effort 的请求体

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "output_config": {
    "effort": "medium"
  },
  "messages": [
    { "role": "user", "content": "分析微服务与单体架构的取舍" }
  ]
}
```

### 档位一览

| 档位       | 说明                       | 典型场景                       |
| -------- | ------------------------ | -------------------------- |
| `low`    | 最省。显著节省 token，能力略降。      | 简单任务、高并发、子 agent           |
| `medium` | 平衡。中等 token 节省。          | 多数 agentic 工作流的折中默认        |
| `high`   | 默认值。高能力。                 | 复杂推理、难编码、对质量敏感的任务          |
| `xhigh`  | 长程扩展能力，介于 high 和 max 之间。 | 长时编码 / agentic 任务（超 30 分钟） |
| `max`    | 无约束的最强能力。                | 真正前沿的难题，最深推理               |

<Tip>
  **Opus 4.8 推荐**：编码 / agentic 用 `xhigh` 起步，其它智力敏感任务用 `high`，只有在 eval 验证过质量不掉的前提下才下调到 `medium` / `low`。

  跑 `xhigh` / `max` 时把 `max_tokens` 设大（64k 起步），给模型留足思考 + 输出空间。
</Tip>

### 各模型支持的档位

不是所有模型都支持全部档位。`xhigh` 是 Opus 4.7 才新增的，`max` 不支持 Sonnet：

| 档位                        | Opus 4.6 | Opus 4.7 / 4.8 | Sonnet 4.6 |
| ------------------------- | :------: | :------------: | :--------: |
| `low` / `medium` / `high` |     ✅    |        ✅       |      ✅     |
| `xhigh`                   |     ❌    |        ✅       |      ❌     |
| `max`                     |     ✅    |        ✅       |      ❌     |

<Warning>
  常见误用：`claude-opus-4-6` 配 `effort: "xhigh"`。4.6 没有 `xhigh` 档 —— 请改用 `high` / `max`，或把模型换成 `claude-opus-4-8` 再用 `xhigh`。
</Warning>

## thinking 自适应思考

Opus 4.7 / 4.8 用**自适应思考**：由模型自己决定何时思考、思考多少，配合 effort 控制深度。

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": {
    "type": "adaptive",
    "display": "summarized"
  },
  "output_config": {
    "effort": "xhigh"
  },
  "messages": [
    { "role": "user", "content": "一步步定位这个生产环境 Bug 的根因" }
  ]
}
```

* `thinking.type: "adaptive"` —— 开启自适应思考（不传则不思考）。
* `thinking.display: "summarized"` —— 让响应里返回**思考摘要**块；不需要展示可删掉。
* effort 与思考的关系：`high` / `xhigh` / `max` 几乎总会深度思考；`low` / `medium` 在简单题上可能跳过思考。
* `display` 默认值随模型不同：**Opus 4.6 默认 `summarized`**，Opus 4.7 / 4.8 默认 `omitted`（思考块仍在，但 `thinking` 文本为空，前端表现为「正文前一段停顿」）。想稳定拿到摘要就显式写 `display: "summarized"`。
* 没有 `-thinking` 后缀的原生模型。是否思考由 `thinking` **参数**决定，不是靠模型名后缀；`xxx-thinking` 都是第三方别名，直接用基础模型 ID + `thinking` 参数即可。

<Warning>
  Opus 4.7 / 4.8 **不支持** `thinking.type: "enabled"` + `budget_tokens`（会 400）。请改用 adaptive + effort。
</Warning>

### thinking 摘要的本质（重要）

* 摘要由 **Anthropic 官方（模型/服务层）生成**，不是网关或第三方模型二次加工；原始思维链（raw CoT）永不原文返回，你拿到的就是官方摘要。
* **不能用 system prompt 定制 thinking 摘要的语气/格式**。`system` 影响的是模型「怎么思考」和「最终回答」的风格，摘要只是内部推理的可读呈现。语气、排版、风格等要求请放进对**最终回答**的约束，让它体现在 `text` 块里。
* 不要在 prompt 里要求模型把内部推理「原文」输出到回答中 —— 可能触发拒答（`stop_reason: "refusal"`，`stop_details.category` 可能为 `reasoning_extraction`）。需要看推理就读 `display: "summarized"` 的摘要。

<Info>
  多轮对话在**同一模型**上继续时，要把上一轮收到的 thinking 块原样回传（含签名、含空文本块）—— API 拒绝被**修改过**的 thinking 块。展示摘要没问题，但不要编辑后再回传。
</Info>

## 解析响应

响应的 `content` 是一个块数组，按 `type` 区分：

```python theme={null}
for block in data["content"]:
    if block["type"] == "thinking":
        print("[思考摘要]", block["thinking"])
    elif block["type"] == "text":
        print("[回答]", block["text"])
```

token 用量在 `usage` 字段：

```json theme={null}
{
  "usage": {
    "input_tokens": 164,
    "output_tokens": 11056,
    "service_tier": "standard"
  }
}
```

<Info>
  若 `stop_reason` 为 `max_tokens`，说明输出被 `max_tokens` 截断（高 effort 下思考容易吃满），此时正文可能为空 —— 把 `max_tokens` 调大即可。
</Info>

## 流式（stream）下的 thinking 字段

`stream: true` 时，思考内容**不走** `delta.text`，而是专门的事件序列：

| 事件                    | 字段                                                 | 说明                        |
| --------------------- | -------------------------------------------------- | ------------------------- |
| `content_block_start` | `content_block.type = "thinking"`                  | 思考块开始                     |
| `content_block_delta` | `delta.type = "thinking_delta"` → `delta.thinking` | 思考摘要增量文本（不是 `delta.text`） |
| `content_block_delta` | `delta.type = "signature_delta"`                   | 思考块签名，多轮回传时需原样保留          |
| `content_block_stop`  | —                                                  | 思考块结束，之后才是正文 `text` 块     |

正文文本仍走 `delta.type = "text_delta"` → `delta.text`。若 `display: "omitted"`，思考块照常出现但 `delta.thinking` 为空字符串。

## 完整可运行示例

```python theme={null}
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("APIYI_API_KEY")
BASE_URL = "https://api.apiyi.com"

resp = requests.post(
    f"{BASE_URL}/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": API_KEY,
    },
    json={
        "model": "claude-opus-4-8",
        "max_tokens": 16000,
        "thinking": {"type": "adaptive", "display": "summarized"},
        "output_config": {"effort": "xhigh"},
        "messages": [
            {"role": "user", "content": "分析微服务与单体架构的取舍"}
        ],
    },
    timeout=300,
)

data = resp.json()
print("status:", resp.status_code, "| usage:", data.get("usage"))
for block in data.get("content", []):
    if block.get("type") == "thinking":
        print("\n[思考摘要]\n", block.get("thinking", ""))
    elif block.get("type") == "text":
        print("\n[回答]\n", block.get("text", ""))
```

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: your-apiyi-key" \
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 16000,
    "thinking": { "type": "adaptive" },
    "output_config": { "effort": "xhigh" },
    "messages": [{ "role": "user", "content": "分析微服务与单体架构的取舍" }]
  }'
```

## 经 Bedrock 时的注意事项

| 项                       | 说明                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `output_config`         | **必须放行**。网关若有 `delete output_config` 覆盖规则，effort 会被静默吞掉（返回 200 但无效）。                   |
| `effort` 位置             | 顶层 `output_config` 内，不能放进 `thinking`。                                                  |
| beta 头                  | effort 不需要；adaptive thinking 也不需要。                                                     |
| `temperature` / `top_p` | Opus 4.7 / 4.8 配自适应思考时应使用默认采样；网关通常会为这两个模型剥离这两个参数，属正常，客户端不必设置。                          |
| 非法 effort 值             | Bedrock 对未知值**宽容降级**（返回 200），不报 400。所以不能用「invalid 是否报错」判断是否透传 —— 要看不同档位的 token 是否拉开差距。 |

## 常见报错排查

### `"thinking.type.enabled" is not supported for this model`

经 AWS（Bedrock）通道调用 Opus 4.7 / 4.8 时，最常见的一个 400 报错：

```
status_code=400, InvokeModelWithResponseStream: ... Bedrock Runtime,
StatusCode: 400, ValidationException: "thinking.type.enabled" is not supported
for this model. Use "thinking.type.adaptive" and "output_config.effort" to
control thinking behavior.
```

**原因**：请求体里传了旧版的固定预算思考写法 `thinking: { "type": "enabled", "budget_tokens": N }`。Opus 4.7 / 4.8（以及更新的模型）已**移除**这种写法，只支持自适应思考；AWS 上游会直接返回 `ValidationException` 400。这与 [thinking 自适应思考](#thinking-自适应思考) 章节的提示一致。

<Warning>
  报错里的 `thinking.type.enabled` 就是你请求体里的 `thinking.type` 字段值为 `"enabled"`。同理，`budget_tokens` 也已不被支持；`temperature` / `top_p` / `top_k` 在这些模型上一并被移除，传了也会 400。
</Warning>

**解决**：删掉 `type: "enabled"` 和 `budget_tokens`，改用 `adaptive` + `output_config.effort` 控制思考深度。

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": { "type": "adaptive", "display": "summarized" },
  "output_config": { "effort": "xhigh" },
  "messages": [
    { "role": "user", "content": "你的问题" }
  ]
}
```

| 旧写法（会 400）                                                 | 新写法                                        |
| ---------------------------------------------------------- | ------------------------------------------ |
| `"thinking": { "type": "enabled", "budget_tokens": 8000 }` | `"thinking": { "type": "adaptive" }`       |
| 用 `budget_tokens` 控制思考量                                    | 用 `output_config.effort`（`low` \~ `max`）控制 |
| `temperature` / `top_p` / `top_k`                          | 删除即可，用 prompt 引导，无需采样参数                    |

<Info>
  不想思考时：Opus 4.7 / 4.8 可传 `thinking: { "type": "disabled" }`，或干脆不传 `thinking` 字段（不传即不思考）。
</Info>

## 参考

* Anthropic — Effort 文档：`platform.claude.com/docs/en/build-with-claude/effort`
* AWS Bedrock — Adaptive thinking：`docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html`
* AWS Bedrock — Claude Opus 4.8：`docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-8.html`
