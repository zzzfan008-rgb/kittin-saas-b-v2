> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# JSON 設定

> openclaw.json 設定ファイルを編集して、APIYI サービスとマルチモデルサポートを設定します

## 設定ファイルの場所

OpenClaw は `~/.openclaw/openclaw.json` にある JSON 設定ファイルを使用します。

## 基本設定

設定ファイル `~/.openclaw/openclaw.json` を作成または編集します:

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
        "apiKey": "sk-your-apiyi-key",
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

## 設定リファレンス

| 項目                              | 説明                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `agents.defaults.model.primary` | デフォルトモデル、形式: `provider/model-name`                                                |
| `models.providers`              | カスタムモデルプロバイダー設定                                                                   |
| `baseUrl`                       | API エンドポイント、`https://api.apiyi.com/v1` を使用                                        |
| `apiKey`                        | APIYI キー                                                                          |
| `api`                           | API タイプ: OpenAI 互換の場合は `openai-completions`、Anthropic 互換の場合は `anthropic-messages` |

## マルチモデル設定

チャットで `/model <id>` を使って複数のモデルを設定し、切り替えます:

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-your-key",
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

## 完全な設定例

モデル設定と Telegram チャンネルを含む完全な例:

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
        "apiKey": "sk-your-apiyi-key",
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
          "token": "your-telegram-bot-token"
        }
      }
    }
  }
}
```

<Tip>
  設定ファイルを変更した後、変更を有効にするにはゲートウェイサービスを再起動してください:

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
