> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Luna

> GPT-5.6 Luna 模型详情：输入 $0.2 / 输出 $1.2 每 1M tokens，1,000,000 上下文，3 个分组可用。

GPT-5.6 系列轻量档，高并发与成本敏感场景首选；256K 以上超长上下文表现较弱，建议分块处理。

## 规格

| 属性        | 值                |
| --------- | ---------------- |
| **模型 ID** | `gpt-5.6-luna`   |
| **厂商**    | OpenAI           |
| **上线日期**  | 2026-07-10       |
| **知识截止**  | 未公开              |
| **输入模态**  | 文本、图像            |
| **输出模态**  | 文本               |
| **上下文窗口** | 1,000,000 tokens |
| **计费方式**  | 按量               |

## 定价

单位为美元每 100 万 tokens（\$/1M）。

| 输入    | 缓存读    | 输出    |
| ----- | ------ | ----- |
| \$0.2 | \$0.02 | \$1.2 |

<Info>表中为**默认标价**。充值活动与分组优惠**可叠加**，实际扣费以控制台实时显示为准。详见[价格说明](/pricing)与[充值活动](/faq/recharge-promotions)。</Info>

## 阶梯计价

本模型按单次请求的 token 规模分档计价（输出价 = 对应档输入价 × 输出倍率）：

* 0 – 272,000 tokens 输入 \$0.2/1M
* 超过 272,000 tokens 输入 \$0.4/1M

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

| 分组               | 倍率 | 说明  |
| ---------------- | -- | --- |
| `CodexResponses` | 1× | 标准价 |
| `Default`        | 1× | 标准价 |
| `SVIP`           | 1× | 标准价 |

部分分组有折扣，且可与充值优惠叠加。分组的完整说明见[令牌与分组](/faq/token-and-groups)。

## 支持的特性

| 特性    | 支持   |
| ----- | ---- |
| 流式输出  | ✅    |
| 工具调用  | ✅    |
| 结构化输出 | ✅    |
| 视觉理解  | ✅    |
| 提示词缓存 | ✅    |
| 深度思考  | 可选开启 |

## 调用示例

以下示例通过 OpenAI Chat Completions（`/v1/chat/completions`）调用 `gpt-5.6-luna`。base\_url 换成 `https://api.apiyi.com/v1` 即可，其余用法与官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-luna",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 从环境变量读取，不要写死在代码里。生产环境建议为不同用途分别建令牌，便于单独停用与用量归因。</Tip>

## 相关文档

<CardGroup cols={2}>
  <Card title="上线公告" icon="megaphone" href="/news/gpt-5-6-launch">
    GPT-5.6 Luna 的发布背景、实测表现与迁移建议
  </Card>

  <Card title="兼容模式调用" icon="book-open" href="/api-capabilities/openai/compatible">
    参数、调用方式与最佳实践
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/models/gpt-5-6-sol">
    同系列模型详情
  </Card>

  <Card title="GPT-5.6 Terra" icon="git-compare" href="/models/gpt-5-6-terra">
    同系列模型详情
  </Card>

  <Card title="模型价格总表" icon="table" href="/models">
    全量 283 个模型的实时价格、端点与分组
  </Card>
</CardGroup>

<Note>本页规格数据人工维护于 `models/data/model-details.json`，价格与端点取自系统实时定价接口，数据更新于 2026-08-31 11:46 (UTC+8)，规格最后核对于 2026-07-31。</Note>
