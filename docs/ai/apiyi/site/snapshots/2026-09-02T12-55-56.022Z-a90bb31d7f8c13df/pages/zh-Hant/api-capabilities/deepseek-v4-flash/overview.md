> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash 文本生成

> DeepSeek V4 Flash 正式版：1M 上下文、284B 總參 / 13B 啟用 MoE、雙端點可用。API易 輸入 $0.44、輸出 $1.32 每 1M tokens，官方峰谷計費本站固定按峰值檔，實測 32 萬 tokens 上下文 15 秒返回。

DeepSeek V4 Flash 正式版（`deepseek-v4-flash-ga-260731`）對應 DeepSeek 於 2026 年 7 月 31 日
轉正式版的開源檢查點 `DeepSeek-V4-Flash-0731`。架構與 4 月預覽版一致（284B 總參 / 13B 啟用 MoE、
1M 上下文），官方明確只重做了後訓練階段，但 agent 類基準大幅提升。API易 已完成
**21 個用例實測 + 雙端點專項複測**，Chat Completions 與 Responses 均可直接呼叫。

<Info>
  **API易已接入 DeepSeek V4 Flash 正式版**：模型名 `deepseek-v4-flash-ga-260731`，
  `default` / `svip` 分組可用。注意該模型**預設思考量偏大**，簡單任務請顯式傳
  `thinking: {"type": "disabled"}`（詳見下方「思考控制」）。
</Info>

## 核心優勢

<CardGroup cols={2}>
  <Card title="1M 上下文實測紮實" icon="scroll-text">
    輸入硬上限 1,048,570 tokens。32.2 萬 tokens 大海撈針 14.77 秒返回並準確命中，最大輸出 393,216 tokens。
  </Card>

  <Card title="雙層快取降本" icon="database-zap">
    隱式快取免配置、第 2 輪命中 99.9%；Responses 端顯式快取鏈式呼叫可整輪命中上一輪全部上下文。
  </Card>

  <Card title="高併發無限流" icon="gauge">
    20 路併發全部 200，牆鍾僅比單發慢 1.3 秒，適合高併發 agent 與批次文本任務。
  </Card>

  <Card title="定價" icon="circle-dollar-sign">
    輸入 \$0.44、輸出 \$1.32 每 1M tokens，快取命中低至 \$0.0136。官方自 2026 年 8 月 17 日起改為峰谷兩檔計費，本站固定按峰值檔。
  </Card>
</CardGroup>

## 模型資訊

| 引數                             | 值                                                |
| ------------------------------ | ------------------------------------------------ |
| **模型名稱**                       | `deepseek-v4-flash-ga-260731`                    |
| **釋出時間**                       | 2026 年 7 月 31 日（預覽版轉正式版）                         |
| **架構**                         | 284B 總參 / 13B 啟用，MoE                             |
| **上下文視窗**                      | 1M（硬上限實測 1,048,570 tokens）                       |
| **最大輸出**                       | 384K（硬上限實測 393,216 tokens）                       |
| **可用分組**                       | `default`、`svip`                                 |
| **端點**                         | `POST /v1/chat/completions`、`POST /v1/responses` |
| **深度思考**                       | 預設開啟且思考量偏大；`thinking.type` 可關                    |
| **流式輸出**                       | ✅ 兩端點均支援                                         |
| **函式呼叫 / 工具使用**                | ✅ 兩端點均支援                                         |
| **圖片輸入**                       | ❌ 純文本模型                                          |
| **Anthropic 端點 / Claude Code** | ❌ 未開通，需要請用 `deepseek-v4-flash`                   |

## 實測能力矩陣

以下為 API易 2026 年 8 月 5 日的實測結果（官方能力宣告 vs 實際表現）：

| 能力                     | 官方宣告         | Chat Completions                | Responses                     |
| ---------------------- | ------------ | ------------------------------- | ----------------------------- |
| 基礎對話（非流式 / 流式）         | ✅            | ✅ / ✅（TTFB 1.43s）               | ✅ / ✅（TTFB 2.31s）             |
| Function Call（兩輪閉環）    | ✅            | ✅                               | ✅                             |
| 深度思考開關 `thinking.type` | ✅            | ✅ disabled / enabled / auto 均生效 | ✅ 輸出 reasoning item           |
| 思考分檔                   | ✅            | ⚠️ 僅 `minimal` 確定生效             | ⚠️ 同左                         |
| 隱式快取                   | ✅            | ✅ 第 2 輪命中 99.9%                 | ✅ 命中 99.9%                    |
| 顯式快取                   | ✅（Responses） | —                               | ✅ 需 `previous_response_id` 鏈式 |
| 結構化輸出                  | ❌            | ❌ 收參但不約束                        | ❌ 收參但不約束                      |
| 聯網搜尋                   | ✅（Responses） | —                               | ⚠️ 工具接通但後端 6/6 報錯             |
| MCP                    | ✅（Responses） | —                               | ❌ `AccessDenied` 賬號級權限        |
| 圖片輸入                   | —            | ❌                               | ❌ 明確報錯                        |

<Warning>
  **三項與官方能力表不符，接入前請注意**：結構化輸出雙端點均靜默失效（返回 200 但完全無視 schema，
  需要強約束請用 Function Call）；聯網搜尋工具已接通但搜尋後端持續報錯、不返回 `results`；
  MCP 返回 `AccessDenied`（賬號級內建工具權限，非模型限制）。
</Warning>

## 思考控制

該模型**預設思考量偏大**——實測「9.11 和 9.9 哪個大」這類一句話問題也會花掉 263 個思考 token
（同族 `deepseek-v4-flash` 只花 44 個）。簡單任務務必顯式關閉：

```python theme={null}
extra_body={"thinking": {"type": "disabled"}}   # 可靠關閉
# 或
extra_body={"reasoning_effort": "minimal"}      # 實測 10/10 次思考 token 為 0
```

<Warning>
  **`reasoning_effort` 不是單調檔位**。兩道題 × 五檔 × 5 次取樣結果：

  | 檔位        | river 題中位數 | prob 題中位數 |
  | --------- | ---------- | --------- |
  | `minimal` | **0**      | **0**     |
  | `low`     | 956        | 367       |
  | `medium`  | 506        | 193       |
  | `high`    | **97**     | **153**   |
  | `max`     | 577        | 173       |

  `high` 在兩道題上的思考量都比 `low` 少，檔內方差（`low` 從 150 到 1993）遠大於檔間差異。
  **只有 `minimal` 可靠**，不要把 low → max 當作成本旋鈕。
</Warning>

## 快取用法

### 隱式快取（兩端點自動生效）

同一段長字首第 2 次請求即命中，實測 15,634 tokens 字首命中 15,616（99.9%），
命中部分按 \$0.028 / 百萬 tokens 計費。

<Tip>
  吃滿隱式快取的前提是**字首逐位元組一致**。把變動內容（時間戳、隨機 ID、使用者名稱）
  放到 prompt 末尾，不要混進字首裡。
</Tip>

### 顯式快取（Responses 端，需鏈式呼叫）

**常見誤用**：把同一段長字首重複發兩次並帶上 `caching`，`cached_tokens` 會一直是 0。
正確姿勢是首輪寫入、後續輪用 `previous_response_id` 鏈下去：

| 輪次    | 呼叫方式                     | input\_tokens | cached\_tokens |
| ----- | ------------------------ | ------------- | -------------- |
| 1（寫入） | `caching: enabled`       | 15,629        | 0              |
| 2     | + `previous_response_id` | 15,664        | **15,629**     |
| 3     | + `previous_response_id` | 15,701        | **15,664**     |
| 4     | + `previous_response_id` | 15,738        | **15,701**     |

## 快速開始

<CodeGroup>
  ```python Python theme={null}
  import os
  from openai import OpenAI

  client = OpenAI(
      api_key=os.environ["APIYI_API_KEY"],
      base_url="https://api.apiyi.com/v1",
  )

  resp = client.chat.completions.create(
      model="deepseek-v4-flash-ga-260731",
      messages=[{"role": "user", "content": "用一句話介紹 MoE 架構"}],
      extra_body={"thinking": {"type": "disabled"}},
  )
  print(resp.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "deepseek-v4-flash-ga-260731",
      "messages": [{"role": "user", "content": "用一句話介紹 MoE 架構"}],
      "thinking": {"type": "disabled"}
    }'
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.APIYI_API_KEY,
    baseURL: "https://api.apiyi.com/v1",
  });

  const resp = await client.chat.completions.create({
    model: "deepseek-v4-flash-ga-260731",
    messages: [{ role: "user", content: "用一句話介紹 MoE 架構" }],
    thinking: { type: "disabled" },
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

### 需要結構化輸出時用 Function Call

`response_format` 在這個模型上不生效且不報錯，是最容易踩的坑。工具引數才是真正被約束的：

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "submit_result",
        "description": "提交抽取結果",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temp_c": {"type": "number"},
            },
            "required": ["city", "temp_c"],
        },
    },
}]

resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "北京今天 25 度"}],
    tools=tools,
)

import json
print(json.loads(resp.choices[0].message.tool_calls[0].function.arguments))
```

## 定價

| 專案   | 單價                   |
| ---- | -------------------- |
| 輸入   | \$0.44 / 百萬 tokens   |
| 輸出   | \$1.32 / 百萬 tokens   |
| 快取命中 | \$0.0136 / 百萬 tokens |

官方自 2026 年 8 月 17 日 00:00 (UTC+8) 起改為峰/谷兩檔計費，谷時為峰時半價；
本站**固定按峰值檔**，不隨時段浮動，詳見 [DeepSeek 調價說明](/news/deepseek-price-increase-2026-08)。
可疊加 [充值活動](/zh-Hant/faq/recharge-promotions) 進一步降低成本。

<Info>
  **關於「不到旗艦十分之一」**：廠商宣傳語對標的是 V4-Pro 預覽期的 \$1.74 / \$3.48。
  按當前 V4-Pro 定價（\$1.32 / \$3.96）折算，本模型是**約 1/3**，不是 1/10。
</Info>

## 相關頁面

<CardGroup cols={2}>
  <Card title="Chat Completions" icon="message-square" href="/zh-Hant/api-capabilities/deepseek-v4-flash/chat-completions">
    OpenAI 相容對話補全端點，線上除錯
  </Card>

  <Card title="Responses" icon="git-fork" href="/zh-Hant/api-capabilities/deepseek-v4-flash/responses">
    Responses 端點，支援顯式快取鏈式呼叫
  </Card>

  <Card title="上線說明與完整實測" icon="newspaper" href="/news/deepseek-v4-flash-ga-launch">
    基準資料、三方速度對照與踩坑記錄
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全部模型的單價、端點與分組
  </Card>
</CardGroup>
