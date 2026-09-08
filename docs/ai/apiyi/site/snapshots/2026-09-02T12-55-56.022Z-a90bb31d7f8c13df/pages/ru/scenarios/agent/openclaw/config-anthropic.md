> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Нативная конфигурация Anthropic

> Настройте OpenClaw с типом API anthropic-messages для стабильного вызова tools и эксклюзивных возможностей Claude

## Почему стоит выбрать нативный режим Anthropic

OpenClaw поддерживает два способа вызова моделей Claude. Если вам нужны **tool calling (tool\_use)** и другие расширенные возможности, настоятельно рекомендуется нативный режим Anthropic (`anthropic-messages`):

| Сценарий                                | OpenAI Compatible Mode | Anthropic Native Mode  |
| --------------------------------------- | ---------------------- | ---------------------- |
| Базовый чат                             | ✅ Работает             | ✅ Работает             |
| Tool Calling (tool loop)                | ❌ Может вернуть 400    | ✅ Стабильно            |
| Prompt Caching                          | ❌ Не поддерживается    | ✅ Поддерживается       |
| Переключение между несколькими моделями | ✅ 400+ моделей         | ⚠️ Только серия Claude |

<Info>
  При использовании `openai-completions` базовый чат работает нормально, но многоходовой tool calling (tool\_calls → tool\_result → tool loop) может быть отклонён с ошибкой 400. Переход на `anthropic-messages` позволяет формату `tool_use` + `tool_result` работать корректно.
</Info>

## Рекомендуемая конфигурация

Отредактируйте `~/.openclaw/openclaw.json` и добавьте следующую конфигурацию провайдера:

```json theme={null}
{
  "models": {
    "providers": {
      "apiyi": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
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

### Важные примечания по конфигурации

<Warning>
  Следующие три пункта **обязательно** должны быть настроены правильно, иначе вы столкнётесь с ошибками 400:

  1. **`baseUrl` без `/v1`**: должно быть `https://api.apiyi.com` — добавление `/v1` приведёт к `.../v1/v1/messages`, что вызовет сбой запроса
  2. **`headers` должно включать `anthropic-version`**: установите значение `2023-06-01`
  3. **`anthropic-beta` установлено в пустую строку**: отключает заголовки бета-функций, чтобы избежать запуска неподдерживаемых функций
</Warning>

### Об `reasoning: false`

<Warning>
  Модели Claude на APIYI вернут ошибку 400, если запрос содержит поля, связанные с thinking (`thinking` / `output_config`).

  Установка `"reasoning": false` в записи модели не позволяет OpenClaw отправлять поля thinking, что устраняет эту проблему.
</Warning>

## Настройка списка разрешенных моделей

Добавьте модели в `agents.defaults.models`, иначе OpenClaw может сообщать, что модель «не зарегистрирована», и незаметно переключаться на другую модель:

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

## Сравнение с режимом совместимости с OpenAI

| Возможность                  | Режим совместимости с OpenAI                           | Нативный режим Anthropic                                  |
| ---------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| Тип API                      | `openai-completions`                                   | `anthropic-messages`                                      |
| baseUrl                      | `https://api.apiyi.com/v1`                             | `https://api.apiyi.com`                                   |
| Поддерживаемые модели        | Все 400+ моделей                                       | Только серия Claude                                       |
| Вызов инструментов           | Нестабильно (при нескольких ходах может вернуть 400)   | Стабильно                                                 |
| Кэширование промптов         | Не поддерживается                                      | Поддерживается                                            |
| Расширенное контекстное окно | Зависит от модели                                      | До 200K tokens                                            |
| Лучше всего подходит для     | Переключения между несколькими моделями, базового чата | Глубокого использования Claude, вызова инструментов Agent |

## Список идентификаторов моделей Claude

| Идентификатор модели        | Название         | Описание                                                                         |
| --------------------------- | ---------------- | -------------------------------------------------------------------------------- |
| `claude-sonnet-4-6`         | Claude Sonnet 4  | Сбалансированная производительность, рекомендуется для ежедневного использования |
| `claude-opus-4-6`           | Claude Opus 4    | Наивысшая способность к рассуждению                                              |
| `claude-haiku-4-5-20251001` | Claude Haiku 4.5 | Быстрый отклик, экономически выгодно                                             |

## Смешанная конфигурация (рекомендуется)

Настройте и совместимый с OpenAI, и нативный провайдер Anthropic, переключаясь по мере необходимости:

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
        "apiKey": "sk-your-apiyi-key",
        "api": "openai-completions",
        "models": [
          { "id": "gpt-5.4", "name": "GPT-5.4" },
          { "id": "deepseek-v3.2", "name": "DeepSeek V3.2" }
        ]
      },
      "apiyi-claude": {
        "baseUrl": "https://api.apiyi.com",
        "apiKey": "sk-your-apiyi-key",
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

Используйте `/model apiyi/gpt-5.4` или `/model apiyi-claude/claude-sonnet-4-6` в чате, чтобы переключать модели.

## Проверьте конфигурацию

После настройки проверьте, что конфигурация работает:

```bash theme={null}
{/* Check model status */}
openclaw models status

{/* Send a test message and check the returned provider/model */}
openclaw agent --message "just reply pong" --json
```

В возвращаемом JSON проверьте, что `meta.agentMeta.provider` и `meta.agentMeta.model` соответствуют вашей конфигурации.

## Устранение неполадок

<AccordionGroup>
  <Accordion title="400 ValidationException: Операция не разрешена">
    Обычно это вызвано полями, связанными с рассуждением, в запросе. Убедитесь, что:

    * В записях модели установлено `"reasoning": false`
    * В заголовках правильно настроено `"anthropic-beta": ""`
  </Accordion>

  <Accordion title="Изменение конфигурации не вступает в силу">
    Существующие сессии чата могли закэшировать старую конфигурацию модели. Есть два решения:

    Примените исправление к модели сессии:

    ```bash theme={null}
    openclaw gateway call sessions.patch \
      --params '{"key":"your-session-key","model":"apiyi-claude/claude-sonnet-4-6"}'
    ```

    Или сбросьте сессию:

    ```bash theme={null}
    openclaw gateway call sessions.reset \
      --params '{"key":"your-session-key","reason":"reset"}'
    ```
  </Accordion>

  <Accordion title="Модель незаметно переключается на другую модель">
    Проверьте, добавлена ли модель в allowlist `agents.defaults.models`. Незарегистрированные модели будут автоматически заменены OpenClaw.
  </Accordion>

  <Accordion title="Ошибка дублирования пути baseUrl">
    В нативном режиме Anthropic `baseUrl` **не должно** включать `/v1`. Использование `https://api.apiyi.com/v1` приведет к `.../v1/v1/messages`, что вызовет ошибку 404.
  </Accordion>
</AccordionGroup>
