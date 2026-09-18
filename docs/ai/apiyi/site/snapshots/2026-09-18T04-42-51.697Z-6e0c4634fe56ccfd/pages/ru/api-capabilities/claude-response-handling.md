> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Нативный формат Claude: потоковая передача и ответы без потоковой передачи

> Структура ответов нативного Anthropic /v1/messages: массив блоков content, SSE-протокол с именованными событиями, а также как разобрать каждый из них и справочник по полям.

Когда вы используете [нативный формат Claude](/ru/api-capabilities/claude) (`/v1/messages`), ответ **полностью отличается** от режима, совместимого с OpenAI: ответ представляет собой типизированный массив блоков `content`, а потоковая передача использует SSE-протокол Anthropic с именованными событиями. На этой странице объясняется, как разбирать оба режима.

<Info>
  Сторона запроса (эндпоинт, заголовок `anthropic-version`, auth `x-api-key`, параметры effort / thinking) описана в [Основах Claude API](/ru/api-capabilities/claude) и [Руководстве по Claude Effort & Thinking](/ru/api-capabilities/claude-effort-thinking). Эта страница посвящена исключительно **стороне ответа**. В примерах используется облегченная модель `claude-haiku-4-5-20251001`.
</Info>

## Непотоковый ответ

Верхний уровень — это объект `message`, а **ответ находится в массиве `content`**, разбитом на блоки по `type`:

```json theme={null}
{
  "id": "msg_bdrk_xxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-4-5-20251001",
  "content": [
    { "type": "text", "text": "1+1 equals 2." }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 26,
    "output_tokens": 11,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

Получение ответа означает **итерацию по массиву `content`** — вы не можете прочитать одно строковое поле, как в OpenAI:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1/messages",
      headers={
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": "YOUR_API_KEY",
      },
      json={
          "model": "claude-haiku-4-5-20251001",
          "max_tokens": 100,
          "messages": [{"role": "user", "content": "What is 1+1?"}],
      },
      timeout=60,
  )
  data = resp.json()
  for block in data["content"]:
      if block["type"] == "text":
          print(block["text"])
      elif block["type"] == "thinking":      # only present when thinking is on
          print("[thinking]", block["thinking"])
  print(data["usage"])
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/messages \
    -H "content-type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -H "x-api-key: YOUR_API_KEY" \
    -d '{
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 100,
      "messages": [{"role": "user", "content": "What is 1+1?"}]
    }'
  ```
</CodeGroup>

<Note>
  `stop_reason` значений: `end_turn` (обычный), `max_tokens` (обрезан по `max_tokens` — текст может быть пустым; увеличьте лимит), `stop_sequence`, `tool_use` (хочет вызвать инструмент). При включенном рассуждении массив `content` получает блок `type: "thinking"`, расположенный перед блоком `text`.
</Note>

## Потоковый ответ (SSE с именованными событиями)

Claude streaming использует **протокол событий Anthropic**: каждое сообщение имеет имя `event:` и payload `data:`, и вы **выполняете обработку по типу события**, а не рассматриваете каждый фрагмент одинаково, как в OpenAI.

```text theme={null}
event: message_start
data: {"type":"message_start","message":{"id":"...","content":[],"usage":{"input_tokens":26,"output_tokens":8}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"1+1 equals 2."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":11}}

event: message_stop
data: {"type":"message_stop"}
```

Фиксированная последовательность событий и что каждое из них содержит:

| Событие               | Роль                                                                               |
| --------------------- | ---------------------------------------------------------------------------------- |
| `message_start`       | Каркас сообщения; здесь находятся `usage.input_tokens` и начальные `output_tokens` |
| `content_block_start` | Начинается блок содержимого (`index` + тип блока text / thinking)                  |
| `content_block_delta` | Прирост; текст `delta.text`, где `delta.type == "text_delta"`                      |
| `content_block_stop`  | Текущий блок завершается                                                           |
| `message_delta`       | Здесь находятся итоговые `stop_reason` + **накопленные `output_tokens`**           |
| `message_stop`        | Всё сообщение завершается (**`[DONE]` отсутствует; это событие — терминатор**)     |

Суть в **накоплении `text_delta` внутри `content_block_delta`**:

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": "YOUR_API_KEY",
    },
    json={
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 100,
        "stream": True,
        "messages": [{"role": "user", "content": "Write a short poem"}],
    },
    stream=True, timeout=120,
)

text, usage = "", {}
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue                       # the event: line can be skipped; type is in data's "type"
    evt = json.loads(line[6:])
    t = evt["type"]
    if t == "message_start":
        usage.update(evt["message"]["usage"])
    elif t == "content_block_delta" and evt["delta"]["type"] == "text_delta":
        piece = evt["delta"]["text"]
        text += piece
        print(piece, end="", flush=True)
    elif t == "message_delta":
        usage.update(evt["usage"])     # final output_tokens
    elif t == "message_stop":
        break                          # terminator, no [DONE]
```

<Tip>
  Тип события присутствует и в строке `event:`, и в поле `"type"` payload `data:`; обрабатывайте по любому из них. С официальным SDK `anthropic` укажите base\_url на `https://api.apiyi.com`, и SDK сам обработает поток событий — ручной цикл не нужен.
</Tip>

<Note>
  При включенном thinking (adaptive thinking) сначала появляется блок `type: "thinking"`; его приросты — `thinking_delta`, а перед закрытием блока появляется `signature_delta` (сигнатура блока thinking). Чтобы отображать thinking, рендерьте `thinking_delta` и `text_delta` отдельно. См. [Руководство Claude Effort & Thinking](/ru/api-capabilities/claude-effort-thinking).
</Note>

## Ключевые различия по сравнению с режимом совместимости с OpenAI

| Аспект                      | Нативный Claude (`/v1/messages`)                                                   | Совместимый с OpenAI (`/v1/chat/completions`)          |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Расположение ответа         | `content` **массив блоков**, типизированный                                        | `choices[0].message.content` строка                    |
| Протокол потоковой передачи | Именованные события (`event:` + `data:`)                                           | Однотипные объекты chunk                               |
| Завершитель потока          | событие `message_stop`, **без `[DONE]`**                                           | `data: [DONE]`                                         |
| Поле инкремента             | `content_block_delta.delta.text`                                                   | `choices[0].delta.content`                             |
| поля usage                  | `input_tokens` / `output_tokens` (разделены между message\_start и message\_delta) | `prompt_tokens` / `completion_tokens` / `total_tokens` |
| Причина завершения          | `stop_reason` (`end_turn` и т. д.)                                                 | `finish_reason` (`stop` и т. д.)                       |
| `max_tokens`                | **Обязательно**                                                                    | Необязательно                                          |

<Warning>
  Два самых простых подводных камня при миграции: (1) ответ — это **массив**, а не строка — перебирайте `content` для `type=="text"` блоков; (2) в потоковой передаче нет **`[DONE]`** — определяйте завершение по событию `message_stop`.
</Warning>

## Использование и тарификация

* Без потоковой передачи: `usage` возвращается с результатом, включая `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`.
* Потоковая передача: `input_tokens` находится в `message_start`, а финальный `output_tokens` находится в `message_delta` — **объедините оба**.
* Для скидки и использования поля cache-hit (`cache_read_input_tokens`) см. [Тарификация Claude Cache](/ru/api-capabilities/claude-prompt-caching).

## Связанные ссылки

* Та же группа: [Claude API Basics](/ru/api-capabilities/claude) · [Claude Cache Billing](/ru/api-capabilities/claude-prompt-caching) · [Claude Effort & Thinking Guide](/ru/api-capabilities/claude-effort-thinking)
* Аналог в совместимом формате: [OpenAI Compatible Mode: Handling Responses](/ru/api-capabilities/openai/response-handling)
* Получение / управление token: `https://api.apiyi.com/token`
