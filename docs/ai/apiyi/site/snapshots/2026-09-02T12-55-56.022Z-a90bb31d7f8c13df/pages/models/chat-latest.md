> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# chat-latest

> chat-latest 模型详情：输入 $5 / 输出 $30 每 1M tokens，400,000 上下文、128,000 最大输出，2 个分组可用。

OpenAI 的滚动别名，始终指向 ChatGPT 当前使用的模型，当前指向 GPT-5.5 Instant。

## 规格

| 属性        | 值              |
| --------- | -------------- |
| **模型 ID** | `chat-latest`  |
| **厂商**    | OpenAI         |
| **上线日期**  | 2026-05-21     |
| **知识截止**  | 2025-08        |
| **输入模态**  | 文本、图像          |
| **输出模态**  | 文本             |
| **上下文窗口** | 400,000 tokens |
| **最大输出**  | 128,000 tokens |
| **计费方式**  | 按量             |

## 定价

单位为美元每 100 万 tokens（\$/1M）。

| 输入  | 缓存读   | 输出   |
| --- | ----- | ---- |
| \$5 | \$0.5 | \$30 |

<Info>表中为**默认标价**。充值活动与分组优惠**可叠加**，实际扣费以控制台实时显示为准。详见[价格说明](/pricing)与[充值活动](/faq/recharge-promotions)。</Info>

## 端点支持

| 端点                        | 路径                                            | 支持 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 可用分组

| 分组        | 倍率 | 说明  |
| --------- | -- | --- |
| `Default` | 1× | 标准价 |
| `SVIP`    | 1× | 标准价 |

部分分组有折扣，且可与充值优惠叠加。分组的完整说明见[令牌与分组](/faq/token-and-groups)。

## 支持的特性

| 特性    | 支持 |
| ----- | -- |
| 流式输出  | ✅  |
| 工具调用  | ✅  |
| 结构化输出 | ✅  |
| 视觉理解  | ✅  |
| 提示词缓存 | ✅  |
| 联网搜索  | ✅  |
| 代码执行  | ✅  |
| 微调    | —  |

## 调用示例

以下示例通过 OpenAI Chat Completions（`/v1/chat/completions`）调用 `chat-latest`。base\_url 换成 `https://api.apiyi.com/v1` 即可，其余用法与官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "chat-latest",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 从环境变量读取，不要写死在代码里。生产环境建议为不同用途分别建令牌，便于单独停用与用量归因。</Tip>

## 相关文档

<CardGroup cols={2}>
  <Card title="上线公告" icon="megaphone" href="/news/chat-latest-launch">
    chat-latest 的发布背景、实测表现与迁移建议
  </Card>

  <Card title="兼容模式调用" icon="book-open" href="/api-capabilities/openai/compatible">
    参数、调用方式与最佳实践
  </Card>

  <Card title="模型价格总表" icon="table" href="/models">
    全量 283 个模型的实时价格、端点与分组
  </Card>
</CardGroup>

<Note>本页规格数据人工维护于 `models/data/model-details.json`，价格与端点取自系统实时定价接口，数据更新于 2026-08-31 11:46 (UTC+8)，规格最后核对于 2026-07-31。</Note>
