> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 配置檔案方式

> 通過編輯 openclaw.json 配置檔案，手動配置 API易 服務和多模型支援

## 配置檔案位置

OpenClaw 使用 JSON 配置檔案，位於 `~/.openclaw/openclaw.json`。

## 基礎配置

建立或編輯配置檔案 `~/.openclaw/openclaw.json`：

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/gpt-5.4" }
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
          { "id": "claude-sonnet-4-6", "name": "Claude Sonnet 4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" },
          { "id": "gemini-3.1-pro-preview", "name": "Gemini 3.1 Pro" }
        ]
      }
    }
  }
}
```

## 配置欄位說明

| 欄位                              | 說明                                                                        |
| ------------------------------- | ------------------------------------------------------------------------- |
| `agents.defaults.model.primary` | 預設模型，格式為 `provider名/模型名`                                                  |
| `models.providers`              | 自定義模型提供商配置                                                                |
| `baseUrl`                       | API 地址，使用 `https://api.apiyi.com/v1`                                      |
| `apiKey`                        | 你的 API易 金鑰                                                                |
| `api`                           | API 型別：OpenAI 相容用 `openai-completions`，Anthropic 相容用 `anthropic-messages` |

## 多模型配置

可以配置多個模型，在聊天中用 `/model <id>` 切換：

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-你的金鑰",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "claude-sonnet-4-6", "name": "Claude Sonnet 4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      }
    }
  }
}
```

## 完整配置示例

包含模型配置和 Telegram 渠道的完整示例：

```json theme={null}
{
  "agents": {
    "defaults": {
      "model": { "primary": "apiyi/gpt-5.4" }
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
          { "id": "claude-sonnet-4-6", "name": "Claude Sonnet 4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "accounts": {
        "default": {
          "token": "你的Telegram Bot Token"
        }
      }
    }
  }
}
```

<Tip>
  配置檔案修改後，需要重啟 Gateway 服務才能生效：

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
