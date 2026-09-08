> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5

> Claude Opus 5 模型详情：输入 $5 / 输出 $25 每 1M tokens，1,000,000 上下文、128,000 最大输出，4 个分组可用。

Anthropic 旗舰模型，以 Opus 4.8 的价格提供逼近 Fable 5 的智能，1M 上下文、思考默认开启。

## 规格

| 属性        | 值                                          |
| --------- | ------------------------------------------ |
| **模型 ID** | `claude-opus-5` · `claude-opus-5-thinking` |
| **厂商**    | Anthropic                                  |
| **厂商发布日** | 2026-07-24                                 |
| **上线日期**  | 2026-07-25                                 |
| **知识截止**  | 未公开                                        |
| **输入模态**  | 文本、图像                                      |
| **输出模态**  | 文本                                         |
| **上下文窗口** | 1,000,000 tokens                           |
| **最大输出**  | 128,000 tokens                             |
| **计费方式**  | 按量                                         |

## 定价

单位为美元每 100 万 tokens（\$/1M）。

| 输入  | 缓存读   | 输出   |
| --- | ----- | ---- |
| \$5 | \$0.5 | \$25 |

<Info>表中为**默认标价**。充值活动与分组优惠**可叠加**，实际扣费以控制台实时显示为准。详见[价格说明](/pricing)与[充值活动](/faq/recharge-promotions)。</Info>

## 端点支持

| 端点                        | 路径                                            | 支持 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 可用分组

| 分组                  | 倍率    | 说明       |
| ------------------- | ----- | -------- |
| `ClaudeCode`        | 0.95× | 相当于 95 折 |
| `ClaudeCodeReverse` | 0.5×  | 相当于 50 折 |
| `Default`           | 1×    | 标准价      |
| `SVIP`              | 1×    | 标准价      |

部分分组有折扣，且可与充值优惠叠加。分组的完整说明见[令牌与分组](/faq/token-and-groups)。

## 支持的特性

| 特性    | 支持   |
| ----- | ---- |
| 流式输出  | ✅    |
| 工具调用  | ✅    |
| 结构化输出 | ✅    |
| 视觉理解  | ✅    |
| 提示词缓存 | ✅    |
| 深度思考  | 默认开启 |
| 联网搜索  | ✅    |

## 模型变体

| 模型 ID                    | 说明                          |
| ------------------------ | --------------------------- |
| `claude-opus-5`          | 标准调用。省略 thinking 参数即运行自适应思考 |
| `claude-opus-5-thinking` | 强制思考变体，价格与端点与标准版完全相同        |

## 调用示例

以下示例通过 OpenAI Chat Completions（`/v1/chat/completions`）调用 `claude-opus-5`。base\_url 换成 `https://api.apiyi.com/v1` 即可，其余用法与官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 从环境变量读取，不要写死在代码里。生产环境建议为不同用途分别建令牌，便于单独停用与用量归因。</Tip>

## 相关文档

<CardGroup cols={2}>
  <Card title="上线公告" icon="megaphone" href="/news/claude-opus-5-launch">
    Claude Opus 5 的发布背景、实测表现与迁移建议
  </Card>

  <Card title="Claude API 基础说明" icon="book-open" href="/api-capabilities/claude">
    参数、调用方式与最佳实践
  </Card>

  <Card title="Claude Effort 思考指南" icon="book-open" href="/api-capabilities/claude-effort-thinking">
    参数、调用方式与最佳实践
  </Card>

  <Card title="Claude 缓存计费" icon="book-open" href="/api-capabilities/claude-prompt-caching">
    参数、调用方式与最佳实践
  </Card>

  <Card title="Claude Sonnet 5" icon="git-compare" href="/models/claude-sonnet-5">
    同系列模型详情
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/models/claude-fable-5">
    同系列模型详情
  </Card>

  <Card title="Claude Opus 4.8" icon="git-compare" href="/models/claude-opus-4-8">
    同系列模型详情
  </Card>

  <Card title="模型价格总表" icon="table" href="/models">
    全量 283 个模型的实时价格、端点与分组
  </Card>
</CardGroup>

<Note>本页规格数据人工维护于 `models/data/model-details.json`，价格与端点取自系统实时定价接口，数据更新于 2026-08-31 11:46 (UTC+8)，规格最后核对于 2026-07-31。</Note>
