> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Anthropic 原生配置

> 使用 anthropic-messages API 型別配置 OpenClaw，支援工具呼叫和 Claude 專屬特性

## 為什麼選擇 Anthropic 原生模式

OpenClaw 支援兩種方式呼叫 Claude 模型。如果你需要使用\*\*工具呼叫（tool\_use）\*\*等高階功能，強烈建議使用 `anthropic-messages` 原生模式：

| 場景              | OpenAI 相容模式 | Anthropic 原生模式 |
| --------------- | ----------- | -------------- |
| 純聊天             | ✅ 正常        | ✅ 正常           |
| 工具呼叫（tool loop） | ❌ 可能 400 報錯 | ✅ 穩定           |
| Prompt Caching  | ❌ 不支援       | ✅ 支援           |
| 多模型切換           | ✅ 400+ 模型   | ⚠️ 僅 Claude 系列 |

<Info>
  走 `openai-completions` 時，純聊天能通，但一旦進入工具多輪呼叫（tool\_calls → tool\_result → tool loop），可能被後端拒絕返回 400。改走 `anthropic-messages` 後，`tool_use` + `tool_result` 格式可正常工作。
</Info>

## 推薦配置

編輯 `~/.openclaw/openclaw.json`，新增以下 provider 配置：

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-你的API易金鑰",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

### 關鍵配置說明

<Warning>
  以下三點**必須**正確設定，否則會遇到 400 報錯：

  1. **`baseUrl` 不帶 `/v1`**：必須是 `https://api.apiyi.com`，否則會拼成 `.../v1/v1/messages` 導致請求失敗
  2. **`headers` 中必須包含 `anthropic-version`**：設為 `2023-06-01`
  3. **`anthropic-beta` 設為空字串**：停用 beta 功能頭，避免觸發不支援的特性
</Warning>

### 關於 `reasoning: false`

<Warning>
  Claude 模型在 API易 上，**請求中如果出現 thinking 相關欄位（`thinking` / `output_config`）會直接返回 400 錯誤**。

  將模型條目設定 `"reasoning": false`，可以讓 OpenClaw 不傳送 thinking 欄位，避免此問題。
</Warning>

## 模型白名單配置

將模型加入 `agents.defaults.models`，否則 OpenClaw 可能提示模型"未登記"，然後靜默回退到其他模型：

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/claude-sonnet-4-6" },
      "models": {
        "apiyi/claude-sonnet-4-6": { "streaming": false },
        "apiyi/claude-opus-4-6": { "streaming": false }
      }
    }
  }
}
```

## 與 OpenAI 相容模式的對比

| 特性             | OpenAI 相容模式                | Anthropic 原生模式          |
| -------------- | -------------------------- | ----------------------- |
| API 型別         | `openai-completions`       | `anthropic-messages`    |
| baseUrl        | `https://api.apiyi.com/v1` | `https://api.apiyi.com` |
| 支援模型           | 所有 400+ 模型                 | 僅 Claude 系列             |
| 工具呼叫           | 不穩定（多輪可能 400）              | 穩定                      |
| Prompt Caching | 不支援                        | 支援                      |
| 超長上下文          | 取決於模型                      | 最高 200K tokens          |
| 適用場景           | 多模型切換、純聊天                  | Claude 深度使用、Agent 工具呼叫  |

## Claude 模型 ID 列表

| 模型 ID                       | 名稱               | 說明          |
| --------------------------- | ---------------- | ----------- |
| `claude-sonnet-4-6`         | Claude Sonnet 4  | 均衡效能，推薦日常使用 |
| `claude-opus-4-6`           | Claude Opus 4    | 最強推理能力      |
| `claude-haiku-4-5-20251001` | Claude Haiku 4.5 | 快速響應，價效比高   |

## 混合配置（推薦）

同時配置 OpenAI 相容和 Anthropic 原生兩個提供商，按需切換：

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi-claude/claude-sonnet-4-6" },
      "models": {
        "apiyi-claude/claude-sonnet-4-6": { "streaming": false },
        "apiyi-claude/claude-opus-4-6": { "streaming": false }
      }
    }
  },
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-你的API易金鑰",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      },
      "apiyi-claude": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-你的API易金鑰",
        "api": "anthropic-messages",
        "headers": {
          "anthropic-version": "2023-06-01",
          "anthropic-beta": ""
        },
        "models": [
          {
            "id": "claude-sonnet-4-6",
            "name": "Claude Sonnet 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          },
          {
            "id": "claude-opus-4-6",
            "name": "Claude Opus 4",
            "reasoning": false,
            "contextWindow": 200000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}
```

在聊天中使用 `/model apiyi/gpt-5.4` 或 `/model apiyi-claude/claude-sonnet-4-6` 切換模型。

## 驗證配置

配置完成後，驗證是否生效：

```bash theme={null}
{/* 檢視模型狀態 */}
openclaw models status

{/* 傳送測試訊息，檢查返回的 provider/model 是否正確 */}
openclaw agent --message "只回 pong" --json
```

在返回的 JSON 中，檢查 `meta.agentMeta.provider` 和 `meta.agentMeta.model` 是否與配置一致。

## 常見問題

<AccordionGroup>
  <Accordion title="報錯 400 ValidationException: Operation not allowed">
    這通常是請求中出現了 thinking 相關欄位導致的。確保：

    * 模型條目設定了 `"reasoning": false`
    * headers 中 `"anthropic-beta": ""` 已正確配置
  </Accordion>

  <Accordion title="配置改了但沒生效">
    已有的聊天 session 可能快取了舊的模型配置。兩種解決方式：

    修改 session 的模型：

    ```bash theme={null}
    openclaw gateway call sessions.patch \
      --params '{"key":"你的session-key","model":"apiyi-claude/claude-sonnet-4-6"}'
    ```

    或重置 session：

    ```bash theme={null}
    openclaw gateway call sessions.reset \
      --params '{"key":"你的session-key","reason":"reset"}'
    ```
  </Accordion>

  <Accordion title="模型靜默回退到其他模型">
    檢查是否已將模型加入 `agents.defaults.models` 白名單。未登記的模型會被 OpenClaw 自動回退。
  </Accordion>

  <Accordion title="baseUrl 報錯路徑重複">
    Anthropic 原生模式的 `baseUrl` **不要**帶 `/v1`。如果寫成 `https://api.apiyi.com/v1`，實際請求會變成 `.../v1/v1/messages`，導致 404 錯誤。
  </Accordion>
</AccordionGroup>
