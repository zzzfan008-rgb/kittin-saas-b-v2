> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.1 Flash-Lite

> Gemini 3.1 Flash-Lite 模型详情：输入 $0.25 / 输出 $1.5 每 1M tokens，1,048,576 上下文、65,536 最大输出，3 个分组可用。

低成本高吞吐款，思考档位可调，适合高并发与批量处理。

## 规格

| 属性        | 值                                                         |
| --------- | --------------------------------------------------------- |
| **模型 ID** | `gemini-3.1-flash-lite` · `gemini-3.1-flash-lite-preview` |
| **厂商**    | Google                                                    |
| **上线日期**  | 2026-05-09                                                |
| **知识截止**  | 2025-01                                                   |
| **输入模态**  | 文本、图像、视频、音频、PDF                                           |
| **输出模态**  | 文本                                                        |
| **上下文窗口** | 1,048,576 tokens                                          |
| **最大输出**  | 65,536 tokens                                             |
| **计费方式**  | 按量                                                        |

## 定价

单位为美元每 100 万 tokens（\$/1M）。

| 输入     | 缓存读     | 输出    |
| ------ | ------- | ----- |
| \$0.25 | \$0.025 | \$1.5 |

<Info>表中为**默认标价**。充值活动与分组优惠**可叠加**，实际扣费以控制台实时显示为准。详见[价格说明](/pricing)与[充值活动](/faq/recharge-promotions)。</Info>

## 端点支持

| 端点                        | 路径                                            | 支持 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 可用分组

| 分组               | 倍率   | 说明       |
| ---------------- | ---- | -------- |
| `Gemini_Reverse` | 0.5× | 相当于 50 折 |
| `Default`        | 1×   | 标准价      |
| `SVIP`           | 1×   | 标准价      |

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

## 模型变体

| 模型 ID                           | 说明              |
| ------------------------------- | --------------- |
| `gemini-3.1-flash-lite`         | 正式版模型名          |
| `gemini-3.1-flash-lite-preview` | 预览期名称，与正式版同价同端点 |

## 调用示例

以下示例通过 OpenAI Chat Completions（`/v1/chat/completions`）调用 `gemini-3.1-flash-lite`。base\_url 换成 `https://api.apiyi.com/v1` 即可，其余用法与官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.1-flash-lite",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 从环境变量读取，不要写死在代码里。生产环境建议为不同用途分别建令牌，便于单独停用与用量归因。</Tip>

## 相关文档

<CardGroup cols={2}>
  <Card title="上线公告" icon="megaphone" href="/news/gemini-3-1-flash-lite-launch">
    Gemini 3.1 Flash-Lite 的发布背景、实测表现与迁移建议
  </Card>

  <Card title="原生调用" icon="book-open" href="/api-capabilities/gemini/native">
    参数、调用方式与最佳实践
  </Card>

  <Card title="Gemini 3.5 Flash-Lite" icon="git-compare" href="/models/gemini-3-5-flash-lite">
    同系列模型详情
  </Card>

  <Card title="模型价格总表" icon="table" href="/models">
    全部模型的实时价格、端点与分组
  </Card>
</CardGroup>

<Note>本页规格数据人工维护于 `models/data/model-details.json`，价格与端点取自系统实时定价接口，随每次刷新同步。</Note>
