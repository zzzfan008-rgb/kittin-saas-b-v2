> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Responses API 參考

> DeepSeek V4 Flash 正式版（deepseek-v4-flash-ga-260731）Responses API 參考與線上除錯：支援顯式快取鏈式呼叫，實測每輪整體命中上一輪全部上下文。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`。
  預設示例已帶 `caching: {"type": "enabled"}` 與 `store: true`，是顯式快取鏈式呼叫的首輪寫入形態。
</Info>

<Tip>
  Responses 端相比 Chat Completions 多一層**顯式快取**。模型能力、定價、思考控制詳見
  [DeepSeek V4 Flash 概覽](/zh-Hant/api-capabilities/deepseek-v4-flash/overview)。
</Tip>

<Warning>
  * **`text.format` 的 json\_schema 不生效**：返回 200 但完全無視 schema，3/3 次被程式碼圍欄包裹導致解析失敗
  * **`web_search` 後端不可用**：工具已接通（能看到 `web_search_call`、`status: completed`），但 6/6 次搜尋報錯、不返回 `results`
  * **`mcp` 返回 `AccessDenied`**：賬號 / 渠道級內建工具權限問題，換合法 server 地址結果相同
  * 純文本模型，傳圖片會報 `Model do not support image input`
</Warning>

## 引數說明速查

| 引數                     | 型別             | 必填 | 預設      | 說明                                         |
| ---------------------- | -------------- | -- | ------- | ------------------------------------------ |
| `model`                | string         | ✓  | —       | 固定 `deepseek-v4-flash-ga-260731`           |
| `input`                | string / array | ✓  | —       | 字串或標準 Responses 訊息陣列，純文本                   |
| `max_output_tokens`    | int            |    | —       | 硬上限 393,216，思考內容計入                         |
| `store`                | bool           |    | `true`  | 鏈式呼叫必須為 `true`                             |
| `previous_response_id` | string         |    | —       | 上一輪響應 `id`，配合 `caching` 命中顯式快取             |
| `caching.type`         | string         |    | —       | `enabled` 寫入顯式快取；響應會回顯該欄位                  |
| `reasoning.effort`     | string         |    | —       | `minimal` 實測思考 tokens 恆為 0；其餘檔位非單調         |
| `stream`               | bool           |    | `false` | SSE 流式，實測 TTFB 約 2.31 秒                    |
| `tools`                | array          |    | —       | `function` 型別可用；`web_search` / `mcp` 見上方警告 |

## 顯式快取：必須走鏈式呼叫

<Warning>
  **常見誤用**：把同一段長字首重複發兩次並帶上 `caching`，`cached_tokens` 會一直是 0。
  顯式快取**不是**按字首匹配的，必須用 `previous_response_id` 把會話鏈起來。
</Warning>

正確姿勢：首輪傳完整長文寫入快取，後續輪只傳新問題並鏈上一輪的 `id`。

| 輪次    | 呼叫方式                               | input\_tokens | cached\_tokens | 耗時    |
| ----- | ---------------------------------- | ------------- | -------------- | ----- |
| 1（寫入） | `caching: enabled` + `store: true` | 15,629        | 0              | 4.10s |
| 2     | + `previous_response_id`           | 15,664        | **15,629**     | 5.18s |
| 3     | + `previous_response_id`           | 15,701        | **15,664**     | 4.57s |
| 4     | + `previous_response_id`           | 15,738        | **15,701**     | 4.54s |

每一輪把上一輪的全部上下文整體命中。做長文件連續追問時，這個模式比每輪重發全文省得多。

### 鏈式呼叫示例

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

long_doc = open("report.md").read()

# 第 1 輪：寫入快取
first = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input=long_doc + "\n\n請總結這份報告的核心結論。",
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(first.output_text)

# 第 2 輪起：只傳新問題，鏈上一輪 id
second = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input="其中第三節提到的風險有哪些？",
    previous_response_id=first.id,
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(second.output_text)
print("快取命中：", second.usage.input_tokens_details.cached_tokens)
```

## 隱式快取

不傳 `caching` 時隱式快取同樣生效，相同長字首重複請求命中 99.9%（15,633 → 15,616）。
兩種快取可按場景選擇：**同一份字首被很多獨立請求複用**走隱式快取，
**同一個會話連續多輪追問**走顯式快取鏈式呼叫。

## 輸出項型別

響應的 `output` 是陣列，可能包含以下 item：

| type              | 說明                                       |
| ----------------- | ---------------------------------------- |
| `reasoning`       | 思考內容（`reasoning.effort` 非 `minimal` 時出現） |
| `message`         | 最終回答，文本在 `content[].text`                |
| `function_call`   | 工具呼叫，帶 `call_id` 與 `arguments`           |
| `web_search_call` | 搜尋呼叫記錄，**當前不含 `results` 欄位**             |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-responses-openapi.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Responses API
  description: >
    DeepSeek V4 Flash 正式版（`deepseek-v4-flash-ga-260731`）—— OpenAI 兼容 Responses
    端点。


    相比 Chat Completions，Responses 端多一层**显式缓存**：


    - 首轮带 `caching: {"type": "enabled"}` 写入缓存

    - 后续轮用 `previous_response_id` 链式调用，实测每轮整体命中上一轮全部上下文

    - 注意：把同一段长前缀重复发两次**不会**命中显式缓存，必须走链式


    已知不可用项：`text.format` 的 json_schema 收参但不约束 schema；

    `web_search` 工具已接通但搜索后端持续报错；`mcp` 工具返回 `AccessDenied`。


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 API易控制台 `api.apiyi.com/token` 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /v1/responses:
    post:
      tags:
        - 文本生成
      summary: Responses：DeepSeek V4 Flash 文本生成（支持显式缓存链式调用）
      description: |
        使用 `deepseek-v4-flash-ga-260731` 调用 Responses 端点。

        典型的多轮长上下文用法：

        1. 首轮传完整长文 + `caching: {"type": "enabled"}` + `store: true`
        2. 记下响应里的 `id`
        3. 后续轮只传新问题 + `previous_response_id`，上一轮上下文整体命中缓存
      operationId: createDeepSeekV4FlashResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashResponsesRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              input: 用一句话说明什么是 MoE 架构。
              max_output_tokens: 500
              store: true
              caching:
                type: enabled
      responses:
        '200':
          description: 生成成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashResponsesResponse'
        '400':
          description: >-
            参数非法。常见：输入超过 1,048,570 tokens、传入图片内容（返回 Model do not support image
            input）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 无内置工具权限（使用 mcp 等内置工具时返回 AccessDenied）
        '429':
          description: 请求频率超限或余额不足
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，固定 deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        input:
          description: 输入内容。可为字符串，或 OpenAI Responses 标准的消息数组。纯文本，不支持图片
          oneOf:
            - type: string
            - type: array
              items:
                type: object
        max_output_tokens:
          type: integer
          description: 最大输出 tokens，硬上限 393,216。思考内容也计入
          default: 500
          maximum: 393216
        store:
          type: boolean
          description: 是否存储本轮响应。使用 previous_response_id 链式调用时需要为 true
          default: true
        previous_response_id:
          type: string
          description: 上一轮响应的 id。配合 caching 使用可整轮命中显式缓存
        caching:
          type: object
          description: '显式缓存开关。首轮传 {"type": "enabled"} 写入，后续轮配合 previous_response_id 命中'
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: enabled
        reasoning:
          type: object
          description: 思考控制。实测 effort=minimal 时 reasoning_tokens 恒为 0；其余档位不构成单调阶梯
          properties:
            effort:
              type: string
              enum:
                - minimal
                - low
                - medium
                - high
                - max
        stream:
          type: boolean
          description: 是否流式输出（SSE）。实测 TTFB 约 2.3 秒
          default: false
        tools:
          type: array
          description: 工具列表。function 类型实测可用；web_search 已接通但后端报错，mcp 返回 AccessDenied
          items:
            type: object
    DeepSeekV4FlashResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: 响应 ID，用作下一轮的 previous_response_id
        model:
          type: string
        output:
          type: array
          description: 输出项数组。可能包含 reasoning / message / function_call / web_search_call 等类型
          items:
            type: object
        caching:
          type: object
          description: 显式缓存状态回显
        usage:
          type: object
          description: >-
            用量。input_tokens_details.cached_tokens
            为缓存命中量；output_tokens_details.reasoning_tokens 为思考消耗
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````