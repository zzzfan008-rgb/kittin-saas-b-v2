> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Режим совместимости OpenAI: обработка ответов

> Единый способ разбора потоковых и непотоковых ответов из /v1/chat/completions: в первую очередь общие принципы, а затем надежный эталонный парсер, учитывающий немногие особенности отдельных моделей.

Когда вы вызываете [совместимый режим](/ru/api-capabilities/openai/compatible), каждая модель — OpenAI, Claude, Gemini, Grok, Qwen, GLM и другие — возвращает одну и ту же схему OpenAI. **Почти вся ваша логика парсинга общая**: следуйте приведенным ниже шаблонам, и при переключении моделей не потребуется менять код.

Эта страница помогает сразу правильно настроить обработку ответов: сначала общее, затем одна таблица с немногими различиями, которые вам нужно учитывать (и ни одно из них не мешает интеграции).

<Info>
  Сторона запроса (base\_url, auth, переключение моделей) описана в [Вызовы в совместимом режиме](/ru/api-capabilities/openai/compatible). Эта страница посвящена исключительно **стороне ответа**: тому, как разбирать полученные данные.
</Info>

## Два режима, один endpoint

Один и тот же endpoint `/v1/chat/completions`; только флаг `stream` меняет форму:

|                        | `stream: false` (по умолчанию)              | `stream: true`                             |
| ---------------------- | ------------------------------------------- | ------------------------------------------ |
| Форма                  | Один объект JSON                            | Поток SSE (много строк `data:`)            |
| Тип верхнего уровня    | `chat.completion`                           | `chat.completion.chunk`                    |
| Получить текст         | `choices[0].message.content`                | Накопите каждый `choices[0].delta.content` |
| Сценарий использования | Бэкенды, пакетные задания, полный результат | Чат-интерфейсы, рендеринг token за token   |

## Ответ без потоковой передачи

Стабильная структура — просто прочитайте `choices[0].message.content`:

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4.1-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "1+1 equals 2." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 31, "completion_tokens": 8, "total_tokens": 39 }
}
```

<CodeGroup>
  ```python Python theme={null}
  resp = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "What is 1+1?"}]
  )
  print(resp.choices[0].message.content)
  print(resp.usage.total_tokens)
  ```

  ```javascript Node.js theme={null}
  const resp = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'What is 1+1?' }]
  });
  console.log(resp.choices[0].message.content);
  console.log(resp.usage.total_tokens);
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{"model":"gpt-4.1-mini","messages":[{"role":"user","content":"What is 1+1?"}]}'
  ```
</CodeGroup>

<Tip>
  Вывод без потоковой передачи очень стабилен во всех основных моделях — `choices[0].message.content` работает везде. Некоторые модели (например, семейство OpenAI) также добавляют `annotations` и `refusal` в `message`; читайте их, если они вам нужны, и игнорируйте, если нет.
</Tip>

## Потоковый ответ (SSE)

Потоковая передача отправляет фрагменты как Server-Sent Events, по одному в строке как `data: {...}`, завершаясь `data: [DONE]`:

```text theme={null}
data: {"choices":[{"delta":{"content":"1"},"index":0}], ...}
data: {"choices":[{"delta":{"content":"+1"},"index":0}], ...}
data: {"choices":[{"delta":{},"finish_reason":"stop","index":0}], ...}
data: [DONE]
```

С официальным SDK просто выполняйте итерацию; суть в **накоплении `delta.content`**:

<CodeGroup>
  ```python Python theme={null}
  stream = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "Write a short poem"}],
      stream=True
  )

  for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
          print(chunk.choices[0].delta.content, end="", flush=True)
  ```

  ```javascript Node.js theme={null}
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'Write a short poem' }],
    stream: true
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  ```
</CodeGroup>

## Примечания по интеграции: несколько различий, обрабатываемых единообразно

Детали потоковой передачи немного различаются между моделями, но **соблюдение правил ниже позволяет одному кодовому пути покрыть их все**.

<Warning>
  **`choices` последнего чанка может быть пустым массивом.** Последний чанк, который содержит `usage`, у некоторых моделей (gpt-4.1-mini, grok, qwen, glm) — `"choices":[]`; индексация `choices[0]` там вызывает ошибку. **Проверьте, что `choices` не пустой, прежде чем читать его.**
</Warning>

| Различие                               | Что вы видите                                                          | Единообразная обработка                                      |
| -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| Варианты последнего чанка              | Может быть `[]` пустым или непустым                                    | Проверьте, что `choices` не пустой, прежде чем читать delta  |
| `finish_reason` промежуточное значение | Обычно `null`; Claude использует `""` (пустую строку)                  | Определяйте завершение по `finish_reason === "stop"`         |
| `usage` расположение                   | Чанк с пустым choices / непустой чанк / тот же чанк, что и `stop`      | Попробуйте все три; записывайте, когда значение присутствует |
| Гранулярность чанков                   | По token (OpenAI) или по предложениям (Gemini/Claude)                  | Не имеет значения — просто накапливайте                      |
| Первый чанк объявления роли            | Некоторые отправляют чанк с пустым содержимым, объявляющий `role`      | Пропускайте, когда content пустой; не считайте это текстом   |
| Поля, приватные для вендора            | `obfuscation`, `system_fingerprint`, `first_token_return_time` и т. д. | Игнорируйте — никогда не полагайтесь на них                  |

## Надежный парсер ссылок

Когда вы обрабатываете raw SSE самостоятельно (без SDK), это покрывает все различия выше:

<CodeGroup>
  ```python Python theme={null}
  import json, requests

  def stream_chat(model, messages, api_key):
      resp = requests.post(
          "https://api.apiyi.com/v1/chat/completions",
          headers={"Authorization": f"Bearer {api_key}",
                   "Content-Type": "application/json"},
          json={"model": model, "messages": messages, "stream": True},
          stream=True, timeout=300,
      )
      text, usage = "", None
      for line in resp.iter_lines(decode_unicode=True):
          if not line or not line.startswith("data: "):
              continue
          data = line[6:]
          if data == "[DONE]":
              break
          chunk = json.loads(data)
          if chunk.get("usage"):          # usage may appear in any chunk
              usage = chunk["usage"]
          choices = chunk.get("choices")
          if not choices:                 # final chunk may be empty; guard it
              continue
          delta = choices[0].get("delta", {})
          piece = delta.get("content")
          if piece:                       # skip role-only / empty-content chunks
              text += piece
              print(piece, end="", flush=True)
          # finish_reason == "stop" is just a marker; don't break (usage often follows)
      return text, usage
  ```

  ```javascript Node.js theme={null}
  async function streamChat(model, messages, apiKey) {
    const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "", usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();             // keep the possibly-incomplete last line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return { text, usage };
        const chunk = JSON.parse(data);
        if (chunk.usage) usage = chunk.usage;        // usage may appear in any chunk
        const choices = chunk.choices;
        if (!choices || choices.length === 0) continue;  // final chunk may be empty
        const piece = choices[0].delta?.content;
        if (piece) { text += piece; process.stdout.write(piece); }
      }
    }
    return { text, usage };
  }
  ```
</CodeGroup>

<Note>
  Модели рассуждения (grok, qwen, glm и т. д.) сначала передают в поток `delta.reasoning_content` (chain of thought), затем `delta.content` (ответ). Парсер выше читает только `content`, поэтому thinking пропускается автоматически. Чтобы отобразить thinking, см. [Вывод модели рассуждения](/ru/api-capabilities/openai/reasoning-models).
</Note>

## Использование и тарификация

* `usage` возвращается встроенно в ответах без потоковой передачи; при потоковой передаче оно приходит в завершающем фрагменте (место указано в таблице выше — «записывайте всякий раз, когда присутствует»).
* Разбивка полей отличается: семейство OpenAI добавляет `completion_tokens_details`, Gemini/Claude добавляют `input_tokens`/`output_tokens`, модели с reasoning добавляют `reasoning_tokens`. Ориентируйтесь на три стандартных поля: `prompt_tokens` / `completion_tokens` / `total_tokens`.

<Warning>
  **Не доверяйте потоковому `total_tokens`.** При тестировании некоторые модели (например, gpt-5.4-mini) выдают завершающий фрейм, где `total ≠ prompt + completion`, тогда как у той же модели в режиме без потоковой передачи все корректно. **Списывайте по выписке по вашему счету**, а не по этому потоковому фрейму.
</Warning>

## Связанные ссылки

* Та же группа: [Вызовы в режиме совместимости](/ru/api-capabilities/openai/compatible) · [Вывод модели рассуждения](/ru/api-capabilities/openai/reasoning-models) · [Нативные вызовы](/ru/api-capabilities/openai/native)
* Модели и тарифы: [Обзор моделей и тарифов](/ru/api-capabilities/model-info)
* Получение / управление tokens: `https://api.apiyi.com/token`
