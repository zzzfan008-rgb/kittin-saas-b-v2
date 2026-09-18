> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max 上线：2.4T 参数、1M 上下文，比官网便宜 17.5%

> 阿里通义千问旗舰 Qwen3.8-Max 发布当天上架 API易：2.4T 参数 MoE、1M 上下文、131K 最大输出，GPQA Diamond 92.6、PaperBench 93.0。挂牌 $1.65/$4.95 每 1M tokens，比官网 $2/$6 低 17.5%，可叠加充值活动。实测 586 次调用的能力边界与避坑指南一并附上。

## 核心要点

* **发布当天上架**：阿里通义千问 2026 年 8 月 3 日发布 Qwen3.8-Max，API易同日挂牌
* **2.4T 参数稀疏 MoE**：1M 上下文窗口、131K 最大输出、262K 最大思考预算
* **基准表现**：GPQA Diamond 92.6、PaperBench 93.0、Terminal-Bench 2.1 86.6、SWE-bench Pro 67.7；FrontierSWE 从上代 40.7 跃升至 73.5
* **价格比官网低 17.5%**：挂牌 \$1.65/\$4.95 每 1M tokens，官网为 \$2.00/\$6.00，且可叠加充值活动继续下探
* **原生多模态**：实测图片与视频输入均可用，不只是文本模型
* **我们跑了 586 次调用**：能力边界、计费陷阱、参数坑位全部实测过一遍，结论写在下文

<Info>
  数据来源：阿里通义官方发布（`qwen.ai/blog?id=qwen3.8`）、QwenCloud 模型卡（`qwencloud.com/models/qwen3.8-max`），基准数据为官方 2026-08-03 公布口径。API易侧结论来自 2026-08-03 12:50–14:35 (UTC+8) 的 586 次实测调用。
</Info>

## 背景介绍

Qwen3.8-Max 是通义千问 Max 系列的新一代旗舰，架构上延续稀疏 MoE 路线，总参数量 2.4 万亿。

与上一代 Qwen3.7-Max 相比，官方把改进重点放在了 **Agent 能力和多模态**上，而不是纯推理分数的堆高。最能说明问题的是 FrontierSWE 从 40.7 直接拉到 73.5，DeepSWE 从 21.6 到 56.6 —— 这类基准考的是模型能不能在真实代码库里连续干活，而不是做单点难题。

对国内开发者更实际的一点是：这一代把 1M 上下文和多模态输入都做进了同一个模型，不需要在"长文模型"和"视觉模型"之间来回切换。

## 详细解析

### 官方基准

| 基准                   | Qwen3.8-Max | 说明                                   |
| -------------------- | ----------- | ------------------------------------ |
| PaperBench           | 93.0        | 该模型最强项                               |
| GPQA Diamond         | 92.6        | 研究生级科学推理                             |
| OmniDocBench 1.5     | 92.1        | 文档理解                                 |
| Terminal-Bench 2.1   | 86.6        | 终端 Agent 任务，GPT-5.6 Sol 为 88.8       |
| OSWorld-Verified     | 86.1        | 计算机操作类任务                             |
| IFBench              | 82.8        | 指令遵循，高于 GPT-5.6 Sol（72.7）            |
| FrontierSWE          | 73.5        | 上代为 40.7                             |
| SWE-bench Pro        | 67.7        | 真实软件工程任务                             |
| Humanity's Last Exam | 43.6        | 落后于 Fable 5（53.3）与 GPT-5.6 Sol（47.2） |

### 技术规格

| 项目     | 参数                                  |
| ------ | ----------------------------------- |
| 架构     | 稀疏 MoE                              |
| 总参数量   | 2.4 万亿                              |
| 上下文窗口  | 1M tokens（非思考模式输入上限 991K，思考模式 983K） |
| 最大输出   | 131,072 tokens                      |
| 最大思考预算 | 262K tokens                         |
| 思考模式   | 默认开启，默认档位 `xhigh`                   |
| 输入模态   | 文本、图片、视频                            |

### API易实测：端点支持情况

我们对三个端点各自跑了完整用例，结论如下：

<CardGroup cols={3}>
  <Card title="Chat Completions" icon="check">
    `/v1/chat/completions`

    **完整可用，推荐主用**。工具调用、结构化输出、多模态、流式全部正常。
  </Card>

  <Card title="Anthropic Messages" icon="triangle-alert">
    `/v1/messages`

    **代码集成可用**，需在回传历史时剥掉 `thinking` 块。Claude Code 等现成客户端暂不可用。
  </Card>

  <Card title="Responses" icon="ban">
    `/v1/responses`

    **暂不支持**。30 次测试全部失败，已反馈渠道方。
  </Card>
</CardGroup>

### 实测通过的能力

* **128K 长上下文召回**：在 8K / 32K / 128K 三档正文的中部与尾部各埋一枚唯一标识，两个端点 6/6 全部精确召回。128K 单次约 80 秒
* **结构化输出严格守约**：`json_schema` 在嵌套对象、枚举、数组、`additionalProperties: false` 全部生效，无多余字段、无 Markdown 代码块包裹
* **图片输入**：形状识别、颜色识别、点阵图 OCR、多图区分全部正确
* **视频输入**：能准确描述视频内容（实测一段 3D 动画场景被完整还原），单次耗时 144–285 秒
* **工具调用**：单工具、并行多工具、两轮完整 round-trip、20 个工具中选 1、流式增量拼接全部正常
* **稳定性**：12 并发 12/12 成功；长流式完整终止，无尾部扣留；输出速率约 19–22 tokens/s，Chat 非流式 P50 约 3.4 秒

## 实际应用

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "用一句话解释什么是负载均衡"}],
    max_tokens=500,
)
print(response.choices[0].message.content)
```

### 关键提醒 1：思考默认开启，控成本要用 `reasoning_effort`

Qwen3.8-Max 的思考模式**默认就是开的**，默认档位 `xhigh`。日常对话场景想省钱省时间，显式关掉即可：

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "你好"}],
    reasoning_effort="none",   # 关闭思考
    max_tokens=500,
)
```

实测同一道题，`reasoning_effort` 从默认降到 `none`，输出从约 158 tokens 降到 5 tokens，耗时从约 5 秒降到 2 秒。

`reasoning_effort` 一共接受 7 个值，但实测只对应 **4 个真实档位**：

| 传入值                      | 实际档位                               |
| ------------------------ | ---------------------------------- |
| `none`                   | 关闭思考                               |
| `minimal` / `low`        | 低档                                 |
| `medium`                 | 中档                                 |
| `high` / `xhigh` / `max` | 默认档（三者等价，传 `max` 不会比 `xhigh` 想得更多） |

### 关键提醒 2：`max_tokens` 管不住思考 token

<Warning>
  **这是最容易踩的坑。** `max_tokens` 只截断可见回答，不约束思考部分。

  实测设 `max_tokens=1`，实际仍被计 **1054** 个输出 token，其中 1045 个是思考 token。

  **想控制成本，请用 `reasoning_effort="none"`，不要指望 `max_tokens`。**
</Warning>

### 关键提醒 3：强制工具调用需同时关思考

需要 `tool_choice` 强制调用（`"required"` 或指定具体函数），或需要 `n > 1` 时，**必须同时设 `reasoning_effort="none"`**，否则会返回 400 或静默不调用：

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "查一下北京天气"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
    reasoning_effort="none",   # 必须，否则 400
)
```

`tool_choice` 用 `"auto"` 或 `"none"` 则不受此限制。

### 关键提醒 4：结构化输出建议显式关思考

结构化输出会让思考量大幅上涨。实测同一个 schema：

| 配置                                        | 输出 tokens | 其中思考  | 耗时    |
| ----------------------------------------- | --------- | ----- | ----- |
| `json_schema` + 默认思考                      | 4,066     | 3,971 | 100 秒 |
| `json_schema` + `reasoning_effort="none"` | 154       | 0     | 4.7 秒 |

两者的 JSON 结构守约程度完全一致。**结构化场景请显式关思考**，成本和延迟都能降一个数量级。

### 关键提醒 5：Anthropic 端点的使用方式

用 `/v1/messages` 做代码集成时，回传历史消息前需要剥掉 `thinking` 块：

```python theme={null}
def strip_thinking(blocks):
    return [b for b in blocks if b.get("type") != "thinking"]

# 把模型返回的 content 加入历史时先过一遍
messages.append({"role": "assistant", "content": strip_thinking(resp["content"])})
```

实测这样处理后，3 轮跨轮记忆、工具调用两轮 round-trip、工具结果进入后续记忆全部正常。Claude Code 等现成客户端因为无法改变其回显行为，暂时请改用 `/v1/chat/completions`。

### 上下文缓存

实测缓存命中门槛约为 **1024 tokens**，真实多轮追加对话吃得到缓存，128K 长文场景命中率可达 98.6%。

<Warning>
  缓存命中在我们的测试中**不够稳定**，同样的前缀在不同轮次时有时无。建议把缓存收益当作"有则赚到"，**不要拿它做成本预算**。
</Warning>

### 目前不支持的能力

* `/v1/responses` 端点
* 内置联网搜索（两种调用写法均无效）
* `thinking_budget` 参数（传任何数值都等价于 `low` 档）
* Anthropic 端点的远程图片 URL（请改用 base64）
* Anthropic 端点的 `response_format`（结构化输出请改用工具强制）

## 价格与可用性

### 定价（每 1M tokens）

| 项目  | API易挂牌价       | 阿里云官网  | 差价          |
| --- | ------------- | ------ | ----------- |
| 输入  | **\$1.65**    | \$2.00 | **低 17.5%** |
| 输出  | **\$4.95**    | \$6.00 | **低 17.5%** |
| 缓存读 | **\$0.20625** | \$0.25 | 低 17.5%     |
| 缓存写 | **\$2.0625**  | —      | —           |

以上为**折扣前**挂牌价。

### 叠加网站充值活动

充值活动可在挂牌价基础上继续下探，详见[充值优惠活动](/faq/recharge-promotions)。

### 调用方式

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

## 总结与建议

**适合用 Qwen3.8-Max 的场景**

* 长文档分析、代码库理解 —— 128K 实测召回精确，长文缓存命中率高
* 需要严格 JSON 结构的数据抽取 —— `json_schema` 守约程度好，记得关思考
* 图文/视频混合理解 —— 一个模型覆盖三种模态，省去切换成本
* Agent 与工具编排 —— 工具调用链路完整，FrontierSWE 和 Terminal-Bench 的提升在这类任务上能体现出来

**接入前请记住三件事**

1. 思考默认开着，日常对话加 `reasoning_effort="none"`
2. `max_tokens` 不是成本护栏，`reasoning_effort` 才是
3. 主用 `/v1/chat/completions`；`/v1/responses` 暂不支持

<Info>
  本文的 API易侧数据来自 2026-08-03 的 586 次实测调用（12:50–14:35 UTC+8）。计费相关结论基于接口返回的 usage 字段，未与账单逐笔交叉验证。模型与网关行为可能随渠道调整而变化，以实际调用为准。
</Info>
