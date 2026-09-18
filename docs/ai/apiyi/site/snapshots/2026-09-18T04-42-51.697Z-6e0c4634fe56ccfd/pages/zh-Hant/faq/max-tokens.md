> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# max_tokens 是什麼？不設定會怎樣？

> 瞭解 max_tokens 引數的作用、OpenAI 引數名稱演變、不設定時的預設行為，以及各大模型的最大輸出 tokens 參考值。

## 簡短回答

`max_tokens` 控制模型單次回覆最多生成多少個 token。**API易 不對 max\_tokens 做額外限制**，該引數會直接透傳給上游模型。你可以自行設定，不設定則使用模型的預設值。

<Info>
  **API易 的立場**：我們不強制限制 `max_tokens`，完全由你自行控制。不設定時，模型會使用各自的預設值輸出。
</Info>

## max\_tokens 的作用

`max_tokens`（最大輸出 token 數）是呼叫大模型 API 時最常見的引數之一，它告訴模型：**這次回覆最多生成多少個 token**。

* 設定得**太小**：模型可能在回答到一半時被截斷（返回 `finish_reason: "length"`）
* 設定得**太大**：不會強制模型生成那麼多內容，但可能消耗更多費用（部分模型按輸出 token 計費）
* **不設定**：使用模型的預設值（各廠商不同，見下方表格）

<Tip>
  **Token ≠ 字元**。中文大約 1 個漢字 ≈ 1-2 個 token，英文大約 1 個單詞 ≈ 1-1.5 個 token。4,096 tokens 大約相當於 3,000 箇中文漢字或 3,000 個英文單詞。
</Tip>

## OpenAI 引數名稱演變

OpenAI 在不同時期和不同 API 中使用了不同的引數名稱，容易造成混淆：

| API 型別               | 引數名稱                    | 適用模型                   | 引入時間              |
| -------------------- | ----------------------- | ---------------------- | ----------------- |
| Chat Completions API | `max_tokens`            | GPT-3.5、GPT-4、GPT-4o 等 | 最初版本              |
| Chat Completions API | `max_completion_tokens` | o1、o3、o4-mini 等推理模型    | 2024 年 9 月（o1 釋出） |
| Responses API        | `max_output_tokens`     | GPT-4o、GPT-5.4、o3 等全系列 | 2025 年            |

### 為什麼要改名？

2024 年 9 月 OpenAI 釋出 o1 推理模型時，引入了「隱藏推理 token」的概念——模型內部會生成大量推理 token（reasoning tokens），但這些 token **不會出現在你的回覆中**。

原來的 `max_tokens` 既表示「生成的 token 數」又表示「你收到的 token 數」，但在推理模型中這兩者不再相等。因此 OpenAI 改用 `max_completion_tokens` 來明確表示「**你收到的回覆 token 上限**」。

後來 Responses API 統一使用了 `max_output_tokens` 這個更直觀的名稱。

<Warning>
  **注意**：如果你使用 OpenAI 的 o 系列推理模型（如 o3、o4-mini），在 Chat Completions API 中**必須使用 `max_completion_tokens`** 而非 `max_tokens`，否則會報錯。
</Warning>

## 不設定 max\_tokens 會怎樣？

不同廠商的處理方式不同：

| 廠商                     | 不設定時的預設行為         | 說明                               |
| ---------------------- | ----------------- | -------------------------------- |
| **OpenAI**             | 無上限（輸出到上下文視窗用完）   | 模型自行決定輸出長度，不會被人為截斷               |
| **Anthropic Claude**   | ❌ **必填引數，不設定會報錯** | Claude API 要求必須顯式指定 `max_tokens` |
| **Google Gemini**      | 預設 8,192 tokens   | 即使模型支援更大輸出，不設定也只返回 8,192 tokens  |
| **DeepSeek（chat）**     | 預設 4,000 tokens   | 可手動提高到 8,000                     |
| **DeepSeek（reasoner）** | 預設 32,000 tokens  | 包含思維鏈輸出，最大 64,000                |

<Warning>
  **特別注意**：Anthropic Claude API 的 `max_tokens` 是**必填引數**。如果不傳這個引數，API 會直接返回錯誤。使用 Claude 模型時請務必設定。
</Warning>

## 各模型最大輸出 tokens 參考

以下為主流模型的最大輸出 token 數參考值。**實際數值請以各廠商官方文件為準**，因為模型更新頻繁。

| 模型                | 模型標識                 | 最大輸出 tokens | 上下文視窗     |
| ----------------- | -------------------- | ----------- | --------- |
| GPT-5.4           | `gpt-5.4-2026-03-05` | 128,000     | 1,047,576 |
| GPT-4o            | `gpt-4o`             | 16,384      | 128,000   |
| o3                | `o3`                 | 100,000     | 200,000   |
| Claude Opus 4.6   | `claude-opus-4-6`    | 128,000     | 1,000,000 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`  | 64,000      | 1,000,000 |
| Gemini 3.1 Pro    | `gemini-3.1-pro`     | 65,536      | 2,000,000 |
| DeepSeek V3       | `deepseek-chat`      | 8,000       | 64,000    |
| DeepSeek R1       | `deepseek-reasoner`  | 64,000      | 64,000    |

<Info>
  **官方文件參考**（獲取最新數值）：

  * OpenAI：`platform.openai.com/docs/models`
  * Anthropic Claude：`docs.anthropic.com/en/docs/about-claude/models`
  * Google Gemini：`ai.google.dev/gemini-api/docs/models`
  * DeepSeek：`api-docs.deepseek.com/api/create-chat-completion`
</Info>

## 使用建議

<Tip>
  **最佳實踐**：建議在每次 API 呼叫中**顯式設定 `max_tokens`**，原因如下：

  * 避免不同模型/廠商的預設值差異導致意外截斷
  * 控制輸出長度，防止不必要的 token 消耗
  * Claude API 強制要求，養成統一習慣可減少出錯
  * 典型設定：普通對話 `2048-4096`，長文生成 `8192-16384`，程式碼生成 `4096-8192`
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="API易 有沒有對 max_tokens 做限制？">
    **沒有**。API易 完全透傳 `max_tokens` 引數給上游模型，不做任何額外限制。你設定多少，上游模型就按多少處理。唯一的限制來自模型本身的最大輸出 token 上限。
  </Accordion>

  <Accordion title="max_tokens 設定得比模型最大值還大會怎樣？">
    不會報錯，模型會自動按自身的最大輸出上限生成。例如 GPT-4o 最大輸出 16,384 tokens，即使你設定 `max_tokens: 100000`，它最多也只會輸出 16,384 tokens。
  </Accordion>

  <Accordion title="max_tokens 和 max_completion_tokens 有什麼區別？">
    功能相同，都是限制輸出 token 數。區別在於：

    * `max_tokens`：OpenAI 早期引數名，適用於 GPT 系列非推理模型
    * `max_completion_tokens`：2024 年 9 月起，OpenAI o 系列推理模型使用的引數名
    * `max_output_tokens`：OpenAI Responses API 統一使用的引數名

    通過 API易 呼叫時，按照你使用的模型和 API 格式選擇對應引數名即可。
  </Accordion>

  <Accordion title="輸出被截斷了（finish_reason 為 length），怎麼辦？">
    這說明模型生成的內容達到了 `max_tokens` 上限。解決方法：

    1. 增大 `max_tokens` 值
    2. 最佳化 prompt，讓模型生成更簡潔的回覆
    3. 檢查是否使用了正確的引數名（o 系列模型需用 `max_completion_tokens`）
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="如何選擇合適的 AI 模型？" icon="compass" href="/zh-Hant/faq/model-selection-guide">
    根據應用場景選擇最適合的模型
  </Card>

  <Card title="API 可以開多少併發？" icon="gauge" href="/zh-Hant/faq/api-concurrency">
    瞭解不同模型的併發限制
  </Card>

  <Card title="Base URL 配置指南" icon="settings" href="/zh-Hant/faq/base-url-config">
    各類工具中配置 API易 Base URL 的方法
  </Card>

  <Card title="API易-令牌管理" icon="key" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量和餘額
  </Card>
</CardGroup>
