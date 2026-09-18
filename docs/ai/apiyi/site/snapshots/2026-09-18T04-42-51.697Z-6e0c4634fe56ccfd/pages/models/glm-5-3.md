> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.3

> GLM-5.3 模型详情：输入 $1.4 / 输出 $4.396 每 1M tokens，1,000,000 上下文、128,000 最大输出，2 个分组可用。

沿用 5.2 的 753B MoE 基座、只扩后训练，Z.ai Code Bench 比 5.2 提升 50%，网络安全基准翻倍；思考不可关闭，适合编程 Agent 与安全审计。

## 规格

| 属性        | 值                |
| --------- | ---------------- |
| **模型 ID** | `glm-5.3`        |
| **厂商**    | 智谱               |
| **厂商发布日** | 2026-08-14       |
| **上线日期**  | 2026-09-08       |
| **知识截止**  | 未公开              |
| **输入模态**  | 文本               |
| **输出模态**  | 文本               |
| **上下文窗口** | 1,000,000 tokens |
| **最大输出**  | 128,000 tokens   |
| **计费方式**  | 按量               |

## 定价

单位为美元每 100 万 tokens（\$/1M）。

| 输入    | 缓存读     | 输出      |
| ----- | ------- | ------- |
| \$1.4 | \$0.259 | \$4.396 |

<Info>表中为**默认标价**。充值活动与分组优惠**可叠加**，实际扣费以控制台实时显示为准。详见[价格说明](/pricing)与[充值活动](/faq/recharge-promotions)。</Info>

## 端点支持

| 端点                        | 路径                                            | 支持 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
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

| 特性    | 支持   |
| ----- | ---- |
| 流式输出  | ✅    |
| 工具调用  | ✅    |
| 结构化输出 | ✅    |
| 提示词缓存 | ✅    |
| 深度思考  | 默认开启 |

## 调用示例

以下示例通过 OpenAI Chat Completions（`/v1/chat/completions`）调用 `glm-5.3`。base\_url 换成 `https://api.apiyi.com/v1` 即可，其余用法与官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 从环境变量读取，不要写死在代码里。生产环境建议为不同用途分别建令牌，便于单独停用与用量归因。</Tip>

## 相关文档

<CardGroup cols={2}>
  <Card title="上线公告" icon="megaphone" href="/news/glm-5-3-launch">
    GLM-5.3 的发布背景、实测表现与迁移建议
  </Card>

  <Card title="GLM-5.3-Flash" icon="git-compare" href="/models/glm-5-3-flash">
    同系列模型详情
  </Card>

  <Card title="GLM-5.2" icon="git-compare" href="/models/glm-5-2">
    同系列模型详情
  </Card>

  <Card title="模型价格总表" icon="table" href="/models">
    全部模型的实时价格、端点与分组
  </Card>
</CardGroup>

<Note>本页规格数据人工维护于 `models/data/model-details.json`，价格与端点取自系统实时定价接口，随每次刷新同步。</Note>
