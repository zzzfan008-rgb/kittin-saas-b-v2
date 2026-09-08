> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Нативный формат Gemini: потоковые и непотоковые ответы

> Структура ответа нативного generateContent / streamGenerateContent Gemini: candidates/parts, thoughtSignature, потоковая передача SSE, а также разбор и справочник полей.

Когда вы вызываете [нативный формат Gemini](/ru/api-capabilities/gemini/native) (`/v1beta` generateContent), ответ использует структуру Google `candidates / parts`, отличную от режима совместимости с OpenAI. На этой странице показано, как разбирать как ответ без потоковой передачи (`generateContent`), так и ответ с потоковой передачей (`streamGenerateContent`).

<Info>
  Сторона запроса (base\_url — `https://api.apiyi.com` без `/v1`, `x-goog-api-key` аутентификации, `thinking_level` управления) описана в [Руководстве по нативному формату Gemini](/ru/api-capabilities/gemini/native). Эта страница посвящена только **стороне ответа**. В примерах используется облегченная модель `gemini-3.1-flash-lite`.
</Info>

## Ответ без потоковой передачи

Эндпоинт `…:generateContent`. **Ответ находится в `candidates[0].content.parts[]`**:

```json theme={null}
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [
        { "text": "1+1 equals 2.", "thoughtSignature": "EjQKMgEM…" }
      ]
    },
    "finishReason": "STOP",
    "index": 0
  }],
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 6,
    "totalTokenCount": 21
  },
  "modelVersion": "gemini-3.1-flash-lite",
  "responseId": "Il0taoSYJ5Cez7…"
}
```

Чтобы получить ответ, нужно **итерировать `parts`** и конкатенировать каждый `text`:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
      json={"contents": [{"parts": [{"text": "What is 1+1?"}]}]},
      timeout=60,
  )
  data = resp.json()
  parts = data["candidates"][0]["content"]["parts"]
  text = "".join(p["text"] for p in parts if "text" in p)
  print(text)
  print(data["usageMetadata"])
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{"contents":[{"parts":[{"text":"What is 1+1?"}]}]}'
  ```
</CodeGroup>

<Note>
  `finishReason` — это **в верхнем регистре** `STOP` (а не строчный `stop` в OpenAI); другие значения включают `MAX_TOKENS` и `SAFETY`. `part` может содержать только `thoughtSignature` и не содержать `text`, поэтому при итерации фильтруйте по `if "text" in p`, иначе возникнет KeyError.
</Note>

## Сигнатура мысли

Модели серии Gemini 3 прикрепляют `thoughtSignature` (зашифрованное состояние рассуждения) к фрагментам — **в тестировании даже облегчённый `gemini-3.1-flash-lite` возвращает его**.

* **Один ход**: не нужно; игнорируйте это.
* **Многоходовый / вызов функций**: передавайте `thoughtSignature` предыдущего ответа обратно **дословно** в `contents` следующего хода, чтобы модель могла продолжить цепочку рассуждения. Официальный `google-genai` SDK делает это автоматически; при ручной записи REST не пропускайте это поле. См. [Вызов функций Gemini](/ru/api-capabilities/gemini/function-calling).

<Tip>
  Это ключевое отличие от [режима совместимости с OpenAI](/ru/api-capabilities/openai/reasoning-models): в режиме совместимости модели рассуждения без состояния и не предоставляют сигнатуру; только нативный формат содержит `thoughtSignature`, который нужно возвращать между ходами.
</Tip>

## Потоковый ответ (SSE)

Эндпоинт `…:streamGenerateContent`. Каждая строка — `data: {...}`, а приращение каждого чанка находится в `candidates[0].content.parts[0].text`:

```text theme={null}
data: {"candidates":[{"content":{"parts":[{"text":"1"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"text":"+1 equals 2."}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"thoughtSignature":"EjQK…"}]},"finishReason":"STOP","index":0}],"usageMetadata":{...}}
```

<Warning>
  **Через шлюз APIYI потоковая передача всегда возвращает строки SSE `data:`** (с `?alt=sse` или без него), и **завершающего `[DONE]` нет** — завершение происходит на чанке, у которого `finishReason == "STOP"`. Этот последний чанк обычно содержит **только `thoughtSignature` и не содержит `text`**.
</Warning>

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse",
    headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
    json={"contents": [{"parts": [{"text": "Write a short poem"}]}]},
    stream=True, timeout=120,
)

text, usage = "", None
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    chunk = json.loads(line[6:])
    usage = chunk.get("usageMetadata", usage)        # cumulative; later overrides
    for cand in chunk.get("candidates", []):
        for p in cand.get("content", {}).get("parts", []):
            if "text" in p:                          # skip signature-only chunks
                text += p["text"]
                print(p["text"], end="", flush=True)
print("\n", usage)
```

<Note>
  `usageMetadata` **присутствует в каждом чанке и является накопительным** (`candidatesTokenCount` растет по мере вывода) — просто возьмите значение **последнего** чанка; ручное суммирование не требуется.
</Note>

## Ключевые отличия от режима, совместимого с OpenAI

| Аспект                    | Нативный Gemini (`/v1beta`)                               | Совместимый с OpenAI (`/v1/chat/completions`) |
| ------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| base\_url                 | `https://api.apiyi.com` (без `/v1`)                       | `https://api.apiyi.com/v1`                    |
| Заголовок Auth            | `x-goog-api-key`                                          | `Authorization: Bearer`                       |
| Расположение ответа       | `candidates[0].content.parts[].text`                      | `choices[0].message.content`                  |
| Инкремент stream          | каждого фрагмента `parts[].text`                          | `choices[0].delta.content`                    |
| Завершающий маркер stream | `finishReason == "STOP"`, **без `[DONE]`**                | `data: [DONE]`                                |
| Причина завершения        | верхний регистр `STOP` / `MAX_TOKENS`                     | нижний регистр `stop`                         |
| Сигнатура мысли           | ✅ `thoughtSignature` (передавайте обратно между ходами)   | ❌ не отображается                             |
| usage                     | `usageMetadata` (накапливается в каждом фрагменте stream) | `usage` (один раз, в конце stream)            |

## Использование и тарификация

```python theme={null}
u = data["usageMetadata"]
# promptTokenCount  input / candidatesTokenCount output / thoughtsTokenCount thinking / totalTokenCount total
```

* `thoughtsTokenCount` (thinking tokens) тарифицируется по **тарифу вывода**; используйте `thinking_level`, чтобы ограничить его и снизить стоимость.
* Скидку для поля cache-hit (`cachedContentTokenCount`) см. в [Тарификация кэша Gemini](/ru/api-capabilities/gemini/prompt-caching).
* Полный справочник полей находится в разделе «Поля использования» в [Руководстве по нативному формату Gemini](/ru/api-capabilities/gemini/native).

## Связанные ссылки

* Та же группа: [Gemini Native Format Guide](/ru/api-capabilities/gemini/native) · [Multimodal & Code Execution](/ru/api-capabilities/gemini/multimodal) · [Function Calling](/ru/api-capabilities/gemini/function-calling)
* Соответствующий вариант в совместимом формате: [OpenAI Compatible Mode: Handling Responses](/ru/api-capabilities/openai/response-handling)
* Получение / управление token: `https://api.apiyi.com/token`
