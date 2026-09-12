> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# JSON-конфигурация

> Настройте сервис APIYI и поддержку нескольких моделей, отредактировав файл конфигурации `openclaw.json`

## Расположение файла конфигурации

OpenClaw использует JSON-файл конфигурации, расположенный по адресу `~/.openclaw/openclaw.json`.

## Базовая конфигурация

Создайте или отредактируйте файл конфигурации `~/.openclaw/openclaw.json`:

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

## Справочник по конфигурации

| Поле                            | Описание                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `agents.defaults.model.primary` | Модель по умолчанию, формат: `provider/model-name`                                                           |
| `models.providers`              | Настройка пользовательского провайдера моделей                                                               |
| `baseUrl`                       | API-эндпоинт, используйте `https://api.apiyi.com/v1`                                                         |
| `apiKey`                        | Ваш ключ APIYI                                                                                               |
| `api`                           | Тип API: `openai-completions` для совместимости с OpenAI, `anthropic-messages` для совместимости с Anthropic |

## Конфигурация нескольких моделей

Настройте несколько моделей и переключайтесь между ними с помощью `/model <id>` в чате:

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

## Полный пример конфигурации

Полный пример с конфигурацией модели и каналом Telegram:

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
  После изменения файла конфигурации перезапустите сервис шлюза, чтобы изменения вступили в силу:

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
