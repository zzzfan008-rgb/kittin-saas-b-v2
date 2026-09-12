> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 配置文件方式

> 通过编辑 openclaw.json 配置文件，手动配置 API易 服务和多模型支持

## 配置文件位置

OpenClaw 使用 JSON 配置文件，位于 `~/.openclaw/openclaw.json`。

## 基础配置

创建或编辑配置文件 `~/.openclaw/openclaw.json`：

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
        "apiKey": "sk-你的API易密钥",
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

## 配置字段说明

| 字段                              | 说明                                                                        |
| ------------------------------- | ------------------------------------------------------------------------- |
| `agents.defaults.model.primary` | 默认模型，格式为 `provider名/模型名`                                                  |
| `models.providers`              | 自定义模型提供商配置                                                                |
| `baseUrl`                       | API 地址，使用 `https://api.apiyi.com/v1`                                      |
| `apiKey`                        | 你的 API易 密钥                                                                |
| `api`                           | API 类型：OpenAI 兼容用 `openai-completions`，Anthropic 兼容用 `anthropic-messages` |

## 多模型配置

可以配置多个模型，在聊天中用 `/model <id>` 切换：

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com/v1",
        "apiKey": "sk-你的密钥",
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
        "apiKey": "sk-你的API易密钥",
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
  配置文件修改后，需要重启 Gateway 服务才能生效：

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
