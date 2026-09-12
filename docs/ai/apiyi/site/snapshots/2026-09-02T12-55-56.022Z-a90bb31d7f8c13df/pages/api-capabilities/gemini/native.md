> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 原生格式调用指南

> 通过 API易 调用 Gemini 官方 generateContent 格式：google-genai SDK 配置、流式输出、thinking_level 思考控制、思维签名。

API易 完整支持 **Gemini 官方原生格式**（`/v1beta` generateContent 端点）：把 base\_url 指向 `https://api.apiyi.com`，现有 Gemini 代码和官方 SDK 即可无缝迁移，无需任何格式转换。

本页基于 Google 官方文档整理（`ai.google.dev/gemini-api/docs`，2026年6月数据），示例均可直接复制运行。

## 为什么用原生格式

OpenAI 兼容格式也能调 Gemini，但以下能力**只有原生格式有**：

* **完整思考控制**：`thinking_level`（Gemini 3 系列）/ `thinking_budget`（2.5 系列）、思考摘要、思维签名
* **原生多模态 Part**：图片 / 音频 / 视频直接内联传入，支持 `media_resolution` 控费 —— 见 [多模态与代码执行](/api-capabilities/gemini/multimodal)
* **代码执行工具**：`code_execution` 沙箱跑 Python
* **精细的用量字段**：`thoughts_token_count`、`cached_content_token_count` 等

简单文本对话、或要和其它厂商模型共用一套代码 → 用 [OpenAI 兼容模式调用](/api-capabilities/openai/compatible) 即可。

## 快速开始

推荐使用 Google 官方统一 SDK `google-genai`（旧版 `google-generative-ai` 已于 2025年11月30日 停止支持）：

```bash theme={null}
pip install google-genai
```

<CodeGroup>
  ```python Python theme={null}
  from google import genai

  client = genai.Client(
      api_key="YOUR_API_KEY",  # 你的 API易 密钥
      http_options={"base_url": "https://api.apiyi.com"}
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash",
      contents="用一句话介绍你自己"
  )
  print(response.text)
  ```

  ```javascript Node.js theme={null}
  import { GoogleGenAI } from '@google/genai';

  const ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY',
    httpOptions: { baseUrl: 'https://api.apiyi.com' }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: '用一句话介绍你自己'
  });
  console.log(response.text);
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{
      "contents": [{
        "parts": [{"text": "用一句话介绍你自己"}]
      }]
    }'
  ```
</CodeGroup>

<Warning>
  注意 base\_url 是 `https://api.apiyi.com`（**不带** `/v1`），与 OpenAI 兼容格式的 `https://api.apiyi.com/v1` 不同。请使用 **API易 密钥**，不是 Google AI Studio 的密钥。
</Warning>

## 流式输出

```python theme={null}
stream = client.models.generate_content_stream(
    model="gemini-3.5-flash",
    contents="写一篇关于量子计算的短文"
)

for chunk in stream:
    print(chunk.text, end="", flush=True)
```

## 思考控制

Gemini 是思考型模型，**两代参数不一样，混用会直接报错**：

| 模型系列                 | 参数                | 取值                                       |
| -------------------- | ----------------- | ---------------------------------------- |
| Gemini 3 / 3.1 / 3.5 | `thinking_level`  | `minimal`（仅 Flash 系）/ `low` / `high`（默认） |
| Gemini 2.5           | `thinking_budget` | token 数上限（如 0–8192），不设则模型自动控制            |

<Warning>
  对 Gemini 3 系列模型**同时传 `thinking_level` 和 `thinking_budget` 会返回错误**，只能二选一（Gemini 3 系列请用 `thinking_level`）。
</Warning>

```python theme={null}
from google.genai import types

# Gemini 3 系列：按档位控制
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="证明根号2是无理数",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high")
    )
)

# Gemini 2.5 系列：按 token 预算控制
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="简单问题，要快",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)  # 关闭思考
    )
)
```

档位选型：`minimal` 适合低延迟简单任务（分类、抽取）；`low` 适合常规对话；`high` 适合复杂推理和代码 —— 思考 token 按**输出价**计费，档位越高账单越贵。

### 思考摘要与思维签名

* **思考摘要**：`include_thoughts=True` 可在响应中返回思考过程摘要（`part.thought` 为 `True` 的 part）
* **思维签名（thought signatures）**：Gemini 3 引入的加密推理状态。多轮对话（尤其函数调用）时要把响应里的 `thought_signature` 原样回传，模型才能延续推理链。**官方 SDK 自动处理**，手写 REST 请求时注意不要丢弃该字段 —— 详见 [FC函数调用](/api-capabilities/gemini/function-calling)

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="分析这段代码的时间复杂度：def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high", include_thoughts=True)
    )
)

for part in response.candidates[0].content.parts:
    if getattr(part, "thought", False):
        print(f"[思考摘要] {part.text}")
    else:
        print(f"[最终答案] {part.text}")
```

## 常用配置参数

通过 `config`（`GenerateContentConfig`）传入：

| 参数                   | 说明                                                       |
| -------------------- | -------------------------------------------------------- |
| `system_instruction` | 系统指令                                                     |
| `temperature`        | 0–2。**Gemini 3 系列官方建议保持默认 1.0**，调低反而可能损伤推理质量             |
| `max_output_tokens`  | 最大输出（含思考 token）                                          |
| `thinking_config`    | 思考控制，见上文                                                 |
| `response_mime_type` | 设为 `application/json` 强制 JSON 输出                         |
| `response_schema`    | 配合 JSON 输出的结构约束（结构化输出）                                   |
| `tools`              | 函数声明 / `code_execution` 等工具                              |
| `media_resolution`   | 多模态输入分辨率控费，见 [多模态页](/api-capabilities/gemini/multimodal) |

## 用量字段（usage\_metadata）

```python theme={null}
usage = response.usage_metadata
print(f"输入: {usage.prompt_token_count}")
print(f"输出: {usage.candidates_token_count}")
print(f"思考: {usage.thoughts_token_count}")
print(f"缓存命中: {usage.cached_content_token_count}")
```

| 字段                           | 说明          | 计费                                                      |
| ---------------------------- | ----------- | ------------------------------------------------------- |
| `prompt_token_count`         | 输入 tokens   | 按输入价                                                    |
| `candidates_token_count`     | 输出 tokens   | 按输出价                                                    |
| `thoughts_token_count`       | 思考 tokens   | **按输出价**，控档位可省                                          |
| `cached_content_token_count` | 缓存命中 tokens | 按官方折扣，见 [缓存计费](/api-capabilities/gemini/prompt-caching) |
| `total_token_count`          | 总量          | —                                                       |

## 支持的模型与价格

| 模型                       | 输入（每 1M tokens） | 输出（每 1M tokens） | 说明                         |
| ------------------------ | --------------- | --------------- | -------------------------- |
| `gemini-3.5-flash`       | \$1.50          | \$9.00          | 当前主力，多项指标反超 3.1 Pro，1M 上下文 |
| `gemini-3.1-pro-preview` | \$1.80          | \$10.80         | Pro 旗舰                     |
| `gemini-3-pro-preview`   | \$1.80          | \$10.80         | 上代 Pro                     |
| `gemini-3-flash-preview` | \$0.44          | \$2.64          | 轻量快速                       |
| `gemini-3.1-flash-lite`  | \$0.25          | \$1.50          | 超低价                        |
| `gemini-2.5-pro`         | \$1.25          | \$10.00         | 2.5 系 Pro                  |
| `gemini-2.5-flash`       | \$0.30          | \$2.40          | 2.5 系主力                    |
| `gemini-2.5-flash-lite`  | \$0.10          | \$0.40          | 最便宜                        |

<Tip>
  部分模型提供 `-thinking` / `-nothinking` 后缀别名（如 `gemini-3-flash-preview-nothinking`），固定开启/关闭思考，适合不方便改请求参数的客户端。完整列表见 [模型与价格总览](/api-capabilities/model-info)。
</Tip>

## 与 OpenAI 兼容格式对比

| 特性          | Gemini 原生格式                          | OpenAI 兼容格式                |
| ----------- | ------------------------------------ | -------------------------- |
| base\_url   | `https://api.apiyi.com`              | `https://api.apiyi.com/v1` |
| SDK         | `google-genai`                       | `openai`                   |
| 思考控制        | `thinking_level` / `thinking_budget` | `reasoning_effort`         |
| 思考摘要 / 思维签名 | ✅                                    | ❌                          |
| 代码执行工具      | ✅                                    | ❌                          |
| 媒体输入        | 原生 Part 内联（PIL / bytes）              | Base64 image\_url          |
| 缓存命中字段      | `cached_content_token_count`         | `cached_tokens`            |

## 注意事项

* **不支持 Files API**（`client.files.upload()`），媒体一律内联传入且**单文件不超过 20MB** —— 详见 [多模态与代码执行](/api-capabilities/gemini/multimodal)
* 媒体、长上下文的缓存折扣与命中率说明见 [缓存计费](/api-capabilities/gemini/prompt-caching)

## 相关链接

* 同组页面：[多模态与代码执行](/api-capabilities/gemini/multimodal) · [缓存计费](/api-capabilities/gemini/prompt-caching) · [FC函数调用](/api-capabilities/gemini/function-calling)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
* Google 官方文档：`ai.google.dev/gemini-api/docs`
