> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по Effort и Thinking для Claude

> Как правильно использовать output_config.effort и adaptive thinking в нативном формате Anthropic, с полными рабочими примерами.

На этой странице описано, как вызывать Claude с помощью **Anthropic native Messages API** (маршрутизируемого через шлюз APIYI к AWS Bedrock), а также корректное использование `output_config.effort` (уровень усилий) и `thinking` (адаптивное рассуждение).

Сначала см. страницу [Claude API Basics](/ru/api-capabilities/claude) с информацией о каналах, тарификации и базовом подключении.

<Info>
  Поддерживаемые модели: Claude Opus 4.8 / 4.7 / 4.6, Sonnet 4.6 и т. д. На этой странице в качестве примера используется **Opus 4.8**.
</Info>

## Онлайн-инструмент для тестирования

Не хотите писать код? Попробуйте онлайн-тестер рассуждений APIYI: выберите модель и уровень effort, задайте Max Tokens, отметьте «return thinking summary» и сравните, как каждый уровень effort рассуждает — прямо в браузере.

<Card title="Тестер рассуждений · Онлайн-инструмент APIYI" icon="flask-conical" href="https://imagen.apiyi.com/#reasoning">
  Запускайте тесты рассуждений Claude (а также GPT / Gemini) прямо в браузере — код не требуется, достаточно вставить ваш ключ APIYI.
</Card>

<img src="https://mintcdn.com/apiyillc/243pgGcIcpapNSDI/images/claude-effort-reasoning-tool.png?fit=max&auto=format&n=243pgGcIcpapNSDI&q=85&s=5207a7ea87e733a018c55c9480d2bc64" alt="Онлайн-тестер рассуждений APIYI: claude-opus-4-8 с селектором уровня effort" width="1400" height="856" data-path="images/claude-effort-reasoning-tool.png" />

## Структура запроса

### Эндпоинт и заголовки

```
POST https://api.apiyi.com/v1/messages
```

| Заголовок           | Значение           | Примечание                                      |
| ------------------- | ------------------ | ----------------------------------------------- |
| `content-type`      | `application/json` | Фиксировано                                     |
| `anthropic-version` | `2023-06-01`       | Нативный заголовок версии Anthropic, обязателен |
| `x-api-key`         | `your-apiyi-key`   | Нативная аутентификация Anthropic               |

<Info>
  Когда APIYI направляет запросы в Bedrock, **клиент по-прежнему использует нативный формат Anthropic** (`x-api-key` + `/v1/messages`); шлюз внутренне выполняет преобразование в Bedrock `bedrock-2023-05-31`. Вам **не** нужно задавать `anthropic_version: bedrock-2023-05-31`.
</Info>

### Минимальное тело запроса

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

## уровни effort

`effort` управляет тем, сколько token Claude готов потратить на получение результата, балансируя между полнотой и скоростью/стоимостью. Это влияет на **все** расходы token: ответ, вызовы инструментов и расширенное мышление.

<Warning>
  **Ключевые правила**

  1. `effort` должно находиться в отдельном объекте верхнего уровня `output_config` — **не** внутри `thinking`. Неправильное размещение вызывает `ValidationException` / 400.
  2. **Бета-заголовок не нужен.** Effort теперь доступен для всех поддерживаемых моделей; `anthropic-beta: effort-2025-11-24` больше не требуется.
  3. По умолчанию используется `high`; установка `"high"` работает так же, как и полное опущение `effort`.
</Warning>

### Тело запроса с effort

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "output_config": {
    "effort": "medium"
  },
  "messages": [
    { "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }
  ]
}
```

### Обзор уровней

| Уровень  | Описание                                                                 | Типичное применение                                                        |
| -------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `low`    | Самый дешевый. Значительная экономия token, немного меньшие возможности. | Простые задачи, высокая параллельность, подагенты                          |
| `medium` | Сбалансированный. Умеренная экономия token.                              | Разумное значение по умолчанию для большинства агентных рабочих процессов  |
| `high`   | Значение по умолчанию. Высокие возможности.                              | Сложное рассуждение, сложная разработка, задачи, чувствительные к качеству |
| `xhigh`  | Долгосрочные расширенные возможности, между high и max.                  | Долгие coding / agentic задачи (свыше 30 минут)                            |
| `max`    | Неограниченные пиковые возможности.                                      | По-настоящему передовые проблемы, самое глубокое рассуждение               |

<Tip>
  **Рекомендация для Opus 4.8**: начинайте coding / agentic work с `xhigh`, используйте `high` для других задач, чувствительных к интеллекту, и опускайтесь до `medium` / `low` только после того, как ваши evals подтвердят сохранение качества.

  При работе с `xhigh` / `max` установите `max_tokens` на высокий уровень (64k как отправная точка), чтобы оставить модели пространство для мышления + вывода.
</Tip>

### Какие уровни поддерживает каждая модель

Не каждая модель поддерживает каждый уровень. `xhigh` был добавлен в Opus 4.7, а `max` не поддерживается в Sonnet:

| Уровень                   | Opus 4.6 | Opus 4.7 / 4.8 | Sonnet 4.6 |
| ------------------------- | :------: | :------------: | :--------: |
| `low` / `medium` / `high` |     ✅    |        ✅       |      ✅     |
| `xhigh`                   |     ❌    |        ✅       |      ❌     |
| `max`                     |     ✅    |        ✅       |      ❌     |

<Warning>
  Частая ошибка: `claude-opus-4-6` с `effort: "xhigh"`. В Opus 4.6 нет уровня `xhigh` — используйте вместо этого `high` / `max` или переключите модель на `claude-opus-4-8`, чтобы использовать `xhigh`.
</Warning>

## Адаптивное рассуждение

Opus 4.7 / 4.8 используют **адаптивное рассуждение**: модель сама решает, когда и сколько рассуждать, а effort управляет глубиной.

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": {
    "type": "adaptive",
    "display": "summarized"
  },
  "output_config": {
    "effort": "xhigh"
  },
  "messages": [
    { "role": "user", "content": "Walk through and pinpoint the root cause of this production bug" }
  ]
}
```

* `thinking.type: "adaptive"` — включает адаптивное рассуждение (уберите его, и модель не будет рассуждать).
* `thinking.display: "summarized"` — возвращает блоки **сводки рассуждений** в ответе; уберите его, если не нужно их показывать.
* Связь between effort and thinking: `high` / `xhigh` / `max` почти всегда глубоко рассуждают; `low` / `medium` могут пропускать рассуждение на простых задачах.
* Значение по умолчанию для `display` отличается в зависимости от модели: **для Opus 4.6 по умолчанию `summarized`**, а для Opus 4.7 / 4.8 по умолчанию `omitted` (блок рассуждений по-прежнему существует, но его текст `thinking` пустой, что выглядит как пауза перед ответом). Задайте `display: "summarized"` явно, чтобы надежно получать сводки.
* В native API нет модели с суффиксом `-thinking`. Будет ли модель рассуждать, определяется **параметром** `thinking`, а не суффиксом имени модели; любой `xxx-thinking` — это сторонний alias — просто используйте базовый ID модели вместе с параметром `thinking`.

<Warning>
  Opus 4.7 / 4.8 не поддерживают `thinking.type: "enabled"` + `budget_tokens` (возвращается 400). Вместо этого используйте adaptive + effort.
</Warning>

### Что такое сводка рассуждений на самом деле (важно)

* Сводка **генерируется Anthropic (моделью/слоем обслуживания)** — не шлюзом и не отдельной моделью. Сырой ход рассуждений никогда не возвращается дословно; вы получаете официальную сводку.
* Вы **не можете задавать стиль сводки рассуждений через system prompt**. `system` определяет, как модель *рассуждает*, и стиль *итогового ответа*; сводка — это просто читаемое представление внутреннего рассуждения. Переносите требования к тону, форматированию и стилю в ограничения для **итогового ответа**, чтобы они отображались в блоке `text`.
* Не просите модель выводить внутреннее рассуждение дословно в ответе — это может вызвать отказ (`stop_reason: "refusal"`, при этом `stop_details.category` может быть `reasoning_extraction`). Чтобы увидеть рассуждение, смотрите сводку `display: "summarized"`.

<Info>
  При продолжении многотурового разговора **на той же модели** передавайте thinking blocks из предыдущего хода обратно без изменений (включая signature и блоки с пустым текстом) — API отклоняет **измененные** thinking blocks. Показывать сводку можно; редактировать ее перед возвратом нельзя.
</Info>

## Разбор ответа

Ответ `content` представляет собой массив блоков, различающихся по `type`:

```python theme={null}
for block in data["content"]:
    if block["type"] == "thinking":
        print("[Thinking summary]", block["thinking"])
    elif block["type"] == "text":
        print("[Answer]", block["text"])
```

Использование token указано в поле `usage`:

```json theme={null}
{
  "usage": {
    "input_tokens": 164,
    "output_tokens": 11056,
    "service_tier": "standard"
  }
}
```

<Info>
  Если `stop_reason` равно `max_tokens`, вывод был усечен `max_tokens` (рассуждение может легко заполнить бюджет при высокой effort), и текст ответа может быть пустым — просто выбросьте `max_tokens`.
</Info>

## поля рассуждения при потоковой передаче (stream)

При `stream: true` содержимое рассуждения не передается через `delta.text` — для него предусмотрена отдельная последовательность событий:

| Событие               | Поле                                               | Примечания                                                                                                |
| --------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `content_block_start` | `content_block.type = "thinking"`                  | Блок рассуждения начинается                                                                               |
| `content_block_delta` | `delta.type = "thinking_delta"` → `delta.thinking` | Инкрементальный текст сводки (не `delta.text`)                                                            |
| `content_block_delta` | `delta.type = "signature_delta"`                   | Сигнатура блока рассуждения; сохраняйте без изменений при повторном воспроизведении многоходового диалога |
| `content_block_stop`  | —                                                  | Блок рассуждения заканчивается; далее следует блок `text`                                                 |

Текст ответа по-прежнему передается через `delta.type = "text_delta"` → `delta.text`. При `display: "omitted"` блок рассуждения по-прежнему отображается, но `delta.thinking` — пустая строка.

## Полный рабочий пример

```python theme={null}
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("APIYI_API_KEY")
BASE_URL = "https://api.apiyi.com"

resp = requests.post(
    f"{BASE_URL}/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": API_KEY,
    },
    json={
        "model": "claude-opus-4-8",
        "max_tokens": 16000,
        "thinking": {"type": "adaptive", "display": "summarized"},
        "output_config": {"effort": "xhigh"},
        "messages": [
            {"role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith"}
        ],
    },
    timeout=300,
)

data = resp.json()
print("status:", resp.status_code, "| usage:", data.get("usage"))
for block in data.get("content", []):
    if block.get("type") == "thinking":
        print("\n[Thinking summary]\n", block.get("thinking", ""))
    elif block.get("type") == "text":
        print("\n[Answer]\n", block.get("text", ""))
```

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: your-apiyi-key" \
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 16000,
    "thinking": { "type": "adaptive" },
    "output_config": { "effort": "xhigh" },
    "messages": [{ "role": "user", "content": "Analyze the tradeoffs of microservices vs. a monolith" }]
  }'
```

## Примечания к маршруту Bedrock

| Пункт                        | Примечания                                                                                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `output_config`              | **Должен передаваться без изменений.** Если у шлюза есть правило переопределения `delete output_config`, effort молча отбрасывается (возвращает 200, но не оказывает эффекта).                                                                                     |
| Позиция `effort`             | Внутри верхнеуровневого `output_config`, никогда внутри `thinking`.                                                                                                                                                                                                |
| Заголовок Beta               | Не нужен для effort; не нужен и для adaptive thinking.                                                                                                                                                                                                             |
| `temperature` / `top_p`      | Opus 4.7 / 4.8 с adaptive thinking должны использовать sampling по умолчанию; шлюз обычно удаляет эти два параметра для этих моделей — это ожидаемо, и клиенту не нужно задавать их.                                                                               |
| Недопустимые значения effort | Bedrock **корректно обрабатывает** неизвестные значения (возвращает 200), а не 400. Поэтому нельзя понять, проходит ли effort через шлюз, по тому, «вызывает ли неверное значение ошибку» — вместо этого проверьте, расходятся ли количества token между уровнями. |

## Устранение неполадок

### `"thinking.type.enabled" is not supported for this model`

Самая распространенная ошибка 400 при вызове Opus 4.7 / 4.8 через маршрут AWS (Bedrock):

```
status_code=400, InvokeModelWithResponseStream: ... Bedrock Runtime,
StatusCode: 400, ValidationException: "thinking.type.enabled" is not supported
for this model. Use "thinking.type.adaptive" and "output_config.effort" to
control thinking behavior.
```

**Причина**: тело запроса по-прежнему использует старую форму fixed-budget thinking `thinking: { "type": "enabled", "budget_tokens": N }`. Opus 4.7 / 4.8 (и более новые модели) **удалили** ее и поддерживают только adaptive thinking; upstream AWS возвращает `ValidationException` 400. Это соответствует примечанию в разделе [Адаптивное thinking](#adaptive-thinking) выше.

<Warning>
  `thinking.type.enabled` в ошибке означает, что поле `thinking.type` в вашем запросе установлено в `"enabled"`. Аналогично, `budget_tokens` больше не поддерживается; `temperature` / `top_p` / `top_k` также удалены в этих моделях и при отправке вернут 400.
</Warning>

**Исправление**: удалите `type: "enabled"` и `budget_tokens` и используйте `adaptive` + `output_config.effort`, чтобы управлять глубиной рассуждения.

```json theme={null}
{
  "model": "claude-opus-4-8",
  "max_tokens": 16000,
  "thinking": { "type": "adaptive", "display": "summarized" },
  "output_config": { "effort": "xhigh" },
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

| Старая форма (400)                                         | Новая форма                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| `"thinking": { "type": "enabled", "budget_tokens": 8000 }` | `"thinking": { "type": "adaptive" }`                                      |
| Управление thinking через `budget_tokens`                  | Управление через `output_config.effort` (`low` – `max`)                   |
| `temperature` / `top_p` / `top_k`                          | Просто удалите их — направляйте через prompt, параметры sampling не нужны |

<Info>
  Чтобы работать без thinking: Opus 4.7 / 4.8 принимают `thinking: { "type": "disabled" }`, или просто не указывайте поле `thinking` (нет поля = нет thinking).
</Info>

## Ссылки

* Anthropic — документация по Effort: `platform.claude.com/docs/en/build-with-claude/effort`
* AWS Bedrock — адаптивное рассуждение: `docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html`
* AWS Bedrock — Claude Opus 4.8: `docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-4-8.html`
