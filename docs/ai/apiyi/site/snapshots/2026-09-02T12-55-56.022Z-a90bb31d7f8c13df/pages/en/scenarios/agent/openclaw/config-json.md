> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# JSON Configuration

> Configure APIYI service and multi-model support by editing the openclaw.json config file

## Config File Location

OpenClaw uses a JSON configuration file located at `~/.openclaw/openclaw.json`.

## Basic Configuration

Create or edit the configuration file `~/.openclaw/openclaw.json`:

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

## Configuration Reference

| Field                           | Description                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `agents.defaults.model.primary` | Default model, format: `provider/model-name`                                                        |
| `models.providers`              | Custom model provider configuration                                                                 |
| `baseUrl`                       | API endpoint, use `https://api.apiyi.com/v1`                                                        |
| `apiKey`                        | Your APIYI key                                                                                      |
| `api`                           | API type: `openai-completions` for OpenAI compatible, `anthropic-messages` for Anthropic compatible |

## Multi-Model Configuration

Configure multiple models and switch between them using `/model <id>` in chat:

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

## Complete Configuration Example

Full example with model configuration and Telegram channel:

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
  After modifying the config file, restart the Gateway service for changes to take effect:

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
