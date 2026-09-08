> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash 双子星上线：旗舰与轻量一次到位

> 谷歌 Gemini 3.6 Flash 与 3.5 Flash-Lite 同步上线 API易：原生+OpenAI 双端点各 30+ 用例实测，搜索 grounding、代码执行等原生工具全放通，$1.50/$7.50 与 $0.30/$2.50 官方同价。

## 核心要点

* **两款同上**：谷歌 2026 年 7 月更新的 `gemini-3.6-flash`（多模态旗舰 Flash）与 `gemini-3.5-flash-lite`（高频轻量款）已在 API易开放，`default` / `svip` 分组可用
* **双端点全量实测**：Gemini 原生格式 + OpenAI 兼容格式各 30+ 用例逐项验证，非"挂名可用"——搜索 grounding、Maps grounding、URL context、代码执行、Computer Use（3.6）全部实测放通
* **官方同价**：3.6 Flash 输入 \$1.50 / 输出 \$7.50，3.5 Flash-Lite 输入 \$0.30 / 输出 \$2.50（每 1M tokens，输出含思考），折扣走充值加赠（最高 20%，≈83 折）
* **思考默认值相反**：3.6 默认开思考（四档可控 0–837 tokens），Lite 默认零思考约 2 秒极速响应——选型关键就看这一条
* **1M 上下文同规格**：两款均为 1,048,576 输入 / 65,536 输出，文本/图像/视频/音频/PDF 全模态输入

## 背景介绍

Gemini 3.6 Flash 与 Gemini 3.5 Flash-Lite 是谷歌 2026 年 7 月更新的两款 stable 文本模型：前者接棒 Flash 主力位，把 Computer Use（Preview）等原生工具带进 Flash 档；后者延续 Flash-Lite 的"快与省"路线，音频输入与文本同价。

API易在上线前完成**双端点全量实测**（每模型 26 条主用例 + 5 条补测），覆盖官方 Capabilities 表的全部可测项。本文所有数据均来自 2026 年 7 月 22 日的实测记录。

## 详细解析

### 实测能力矩阵

| 能力                           | 3.6 Flash                                             | 3.5 Flash-Lite                  |
| ---------------------------- | ----------------------------------------------------- | ------------------------------- |
| 基础对话 / 流式（双端点）               | ✅                                                     | ✅                               |
| 图像 / PDF / 音频理解              | ✅ 全部实测通过                                              | ✅ 全部实测通过                        |
| 深度思考                         | ✅ 默认开，minimal/low/medium/high 实测 0/403/487/837 tokens | ✅ 默认关，`high` 档实测触发约 1000 tokens |
| Function calling / 结构化输出     | ✅ / ✅                                                 | ✅ / ✅                           |
| Google 搜索 grounding          | ✅ 原生端点                                                | ✅ 原生端点                          |
| Maps grounding / URL context | ✅ / ✅                                                 | ✅ / ✅                           |
| 代码执行                         | ✅ 实测真实执行（结果字段暂不回显，见文档说明）                              | ✅ 同左                            |
| Computer Use（Preview）        | ✅ 返回操作指令                                              | — 官方不支持                         |
| 隐式缓存                         | ⚠️ 概率命中                                               | ⚠️ 实测未观测到命中                     |

高级工具（搜索/地图/URL/代码执行/Computer Use）为 **Gemini 原生格式专属**，OpenAI 兼容端覆盖对话、流式、FC、JSON Schema、视觉等常规能力。原生端点直接用 API易令牌（`x-goog-api-key: sk-...`），无需 Google API Key。

### 怎么选？

* **选 3.6 Flash**：需要深度推理、复杂规划、原生工具重度使用、Computer Use
* **选 3.5 Flash-Lite**：高频短问答、分类、抽取、翻译、客服等吞吐优先场景——快约一倍、便宜至 1/5

## 实际应用

<CodeGroup>
  ```bash 原生格式（3.6 Flash + 搜索 grounding） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "2026年7月 AI 领域最重要的发布是什么？"}]}],
      "tools": [{"google_search": {}}]
    }'
  ```

  ```python OpenAI 兼容（Lite 极速分类） theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content": "把这条评论分类为正面/负面/中性：物流很快但包装一般"}]
  )
  print(response.choices[0].message.content)
  ```
</CodeGroup>

## 价格与可用性

| 模型                      | 输入                 | 输出（含思考）            |
| ----------------------- | ------------------ | ------------------ |
| `gemini-3.6-flash`      | \$1.50 / 1M tokens | \$7.50 / 1M tokens |
| `gemini-3.5-flash-lite` | \$0.30 / 1M tokens | \$2.50 / 1M tokens |

与谷歌官网完全一致；充值加赠最高 20%（充 \$100 送 10%），综合约 **83 折**。Google 搜索 grounding 按 \$14 / 1K 次查询计。

## 总结与建议

两款模型填补了 API易 Gemini 文本线的最新版位：3.6 Flash 是"工具全家桶 + 思考可控"的主力选择，Lite 则是目前谷歌系性价比最高的高频引擎。接入零门槛——官方 google-genai SDK 或 OpenAI SDK 改个 base\_url 即用。

📖 详细实测与接入指南：[Gemini 3.6 Flash 概览](/api-capabilities/gemini-3-6-flash/overview) | [Gemini 3.5 Flash-Lite 概览](/api-capabilities/gemini-3-5-flash-lite/overview)
