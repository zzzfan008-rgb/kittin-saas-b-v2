> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API 调用基础说明

> API易 提供纯正官转的 AWS Claude + Claude Official API 双通道接入，约 85 折，稳定可靠、按量计费。

通道与计费亮点：

* **默认通道：AWS Claude**（AWS Bedrock 官方接入）——稳定性高、缓存命中好。
* **替补通道：Claude Official**（Anthropic 官网官 Key 直连）——AWS 通道异常时自动兜底。
* **两条通道都是纯官转**，按量计费、不限速，综合成本约官网价 **85 折**（含充值加赠后区间为 79–86 折）。

<Info>
  低价逆向的我们不做，**只做可靠稳定的质量和服务**。

  市场上 Claude 的接入渠道有点混乱，价格越低往往越不透明：那些低价通道你用了，根本不知道对方在里面掺了什么——可能是逆向破解、共享账号、降智或被替换的模型；更要紧的是，你的对话数据被转卖了你也无从察觉。API易 只做纯正官转（AWS Bedrock + Anthropic 官方 Key），通道可溯源、不留存数据，宁可贵一点也要稳、要干净。
</Info>

## 获取 API Key

在后台创建 / 查看令牌：

`https://api.apiyi.com/token`

* 使用**默认令牌**即可直接调用。
* 若新建令牌时选择 **ClaudeCode 分组**，可享 **95 折**（5% off）。
* 该分组折扣可与**充值活动 10%–20% 加赠**叠加，综合下来实际成本约为官网价的 **79 折–86 折**（即标题所说的"约 85 折"区间）。
* 不限速，比官网价格更低，使用方便。

<Info>
  API 按量计费（非包月套餐），余额从充值账户实时扣费。
</Info>

## 接入信息

| 项目                 | 值                                           |
| ------------------ | ------------------------------------------- |
| **Base URL**       | `https://api.apiyi.com`                     |
| **Anthropic 原生端点** | `https://api.apiyi.com/v1/messages`         |
| **OpenAI 兼容端点**    | `https://api.apiyi.com/v1/chat/completions` |

## 可用模型

以下 3 个为各系列最新版本，推荐直接使用：

| 系列         | 模型名                         | 适用场景      |
| ---------- | --------------------------- | --------- |
| **Opus**   | `claude-opus-4-8`           | 复杂编程、深度推理 |
| **Sonnet** | `claude-sonnet-4-6`         | 通用智能、日常代码 |
| **Haiku**  | `claude-haiku-4-5-20251001` | 快速响应、高并发  |

## 调用方式：原生 vs OpenAI 兼容

我们**同时支持** Anthropic 原生格式和 OpenAI 兼容格式，但请按场景选择：

<CardGroup cols={2}>
  <Card title="✅ 强烈推荐：Anthropic 原生格式" icon="star">
    端点：`/v1/messages`

    **凡是用 Claude Code、Cline、Cursor 等深度依赖 Claude 的客户端，请务必使用原生格式。**

    只有原生格式才能正确触发 **Prompt Cache（缓存计费）**，长上下文/重复 system prompt 场景下账单可大幅降低。
  </Card>

  <Card title="⚙️ 通用支持：OpenAI 兼容格式" icon="plug">
    端点：`/v1/chat/completions`

    若你的项目原本就是 OpenAI SDK 写的、**且不在意缓存计费**，可以直接切到 Claude 模型，迁移成本几乎为零。

    适合一次性脚本、轻量调用、SDK 已固化的存量项目。
  </Card>
</CardGroup>

<Warning>
  **缓存计费只在 Anthropic 原生格式下生效。** 在 Claude Code 等高频、长上下文场景中，使用 OpenAI 兼容格式可能让账单显著偏高——这不是 API 易的问题，是上游协议本身的限制。
</Warning>

## 调用示例

### Anthropic 原生格式（推荐）

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "x-api-key: your-apiyi-key" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "你好，介绍一下你自己。"}
    ]
  }'
```

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "写一个 Python 快速排序示例。"}
    ]
)

print(message.content[0].text)
```

### OpenAI 兼容格式（通用迁移用）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "你好，介绍一下你自己。"}
    ]
)

print(response.choices[0].message.content)
```

## 关于 Opus 价格的提示

<Warning>
  **Opus 价格相对较高**。日常对话消耗一般，但在编程场景里，由于大量 Tokens 输入和输出，账单不低。建议先用 **\$10 小额度**测试实际消耗，再决定是否长期使用。
</Warning>

日常使用建议：

* **大多数场景**：优先 `claude-sonnet-4-6`，性价比最高。
* **简单/高频任务**：用 `claude-haiku-4-5-20251001`，速度快、成本低。
* **复杂编程/推理**：再切到 `claude-opus-4-8`。

## 常见问题

<AccordionGroup>
  <Accordion title="为什么 API易 不做更便宜的「低价逆向」通道？">
    因为低价的代价你看不见。逆向破解、共享账号、降智或被悄悄替换的模型，都能把价格压下来，但用的时候你完全不知道对方在通道里掺了什么——输出质量时好时坏、随时可能断供，甚至你的对话数据被转卖你也察觉不到。

    我们只做**纯正官转**：默认走 AWS Bedrock 官方接入，替补走 Anthropic 官方 Key 直连，两条通道都可溯源、按量计费、不留存你的数据。综合成本约官网价 **85 折**，我们认为这是「稳定可靠」与「价格合理」之间最该守住的那条线——宁可贵一点，也不碰来路不明的便宜货。
  </Accordion>

  <Accordion title="报错 「thinking.type.enabled is not supported for this model」 怎么办？">
    这是经 AWS（Bedrock）通道调用 Opus 4.7 / 4.8 时最常见的 400 报错，完整信息形如：

    ```
    ValidationException: "thinking.type.enabled" is not supported for this model.
    Use "thinking.type.adaptive" and "output_config.effort" to control thinking behavior.
    ```

    **原因**：请求体里传了旧版固定预算思考写法 `thinking: { "type": "enabled", "budget_tokens": N }`。Opus 4.7 / 4.8 已移除这种写法，只支持自适应思考。

    **解决**：删掉 `type: "enabled"` 和 `budget_tokens`，改用 `thinking: { "type": "adaptive" }` + `output_config.effort` 控制思考深度。同理 `temperature` / `top_p` / `top_k` 在这些模型上也已移除，传了会 400。详见 [Claude Effort 思考指南](/api-capabilities/claude-effort-thinking)。
  </Accordion>
</AccordionGroup>

## 相关链接

* 获取 / 管理令牌：`https://api.apiyi.com/token`
* 充值与活动：`https://api.apiyi.com`
