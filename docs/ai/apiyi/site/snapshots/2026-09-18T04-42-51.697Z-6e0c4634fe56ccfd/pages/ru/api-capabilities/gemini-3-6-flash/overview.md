> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Генерация текста с Gemini 3.6 Flash

> Мультимодальная модель Google Gemini 3.6 Flash: контекстное окно на 1 млн токенов, четыре уровня рассуждения, полный набор нативных инструментов. APIYI предлагает нативные эндпоинты Gemini и эндпоинты, совместимые с OpenAI, по официальным тарифам — $1.50 за входные данные / $7.50 за выходные данные на 1 млн токенов.

Gemini 3.6 Flash (`gemini-3.6-flash`) — это мультимодальная текстовая модель Google, обновленная в июле 2026 года (стабильный выпуск), которая принимает input text/image/video/audio/PDF с контекстным окном 1M и выводом 64K. APIYI завершил **полный тестовый прогон по двум эндпоинтам** (26+5 тестовых случаев): как нативный формат Gemini, так и совместимый с OpenAI формат работают без дополнительных настроек, а встроенные инструменты — Search grounding, выполнение кода, URL context — подтверждены как работающие.

<Info>
  **Доступно в APIYI уже сейчас**: имя модели `gemini-3.6-flash`, в группах `default` / `svip`. **Thinking включен по умолчанию** (thinking tokens тарифицируются как output) — снижайте уровень Thinking для нагрузок, чувствительных к задержке или стоимости (см. «Управление Thinking» ниже). Для легких нагрузок рассмотрите более дешевый вариант [Gemini 3.5 Flash-Lite](/ru/api-capabilities/gemini-3-5-flash-lite/overview).
</Info>

## Основные особенности

<CardGroup cols={2}>
  <Card title="Полный нативный набор инструментов" icon="wrench">
    Google Search grounding, Maps grounding, URL context, выполнение кода и Computer Use (предварительная версия) — все подтверждено как работающее на нативном эндпоинте; ключ API Google не требуется.
  </Card>

  <Card title="Полное мультимодальное понимание" icon="eye">
    Входные данные Image, PDF и audio подтверждены как точные (video использует тот же pipeline). Контекст 1M помещает целую книгу или codebase.
  </Card>

  <Card title="Четыре уровня рассуждения" icon="brain">
    thinkingLevel minimal/low/medium/high измеряется на уровне 0/403/487/837 thinking tokens — монотонно, поэтому вы можете точно планировать рассуждение для каждой задачи.
  </Card>

  <Card title="Два эндпоинта, без лишних действий" icon="git-fork">
    Нативный формат Gemini (официальный SDK, просто измените base\_url) и формат, совместимый с OpenAI, оба доступны по официальной тарификации.
  </Card>
</CardGroup>

## Подробности модели

| Property             | Value                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Model name**       | `gemini-3.6-flash` (стабильная версия, без псевдонимов перенаправления)                                               |
| **Input modalities** | Текст, изображение, видео, аудио, PDF                                                                                 |
| **Context window**   | 1,048,576 input / 65,536 output                                                                                       |
| **Groups**           | `default`, `svip`                                                                                                     |
| **Endpoints**        | `POST /v1beta/models/gemini-3.6-flash:generateContent` (нативный), `POST /v1/chat/completions` (совместимый с OpenAI) |
| **Thinking**         | ВКЛ. по умолчанию; четыре уровня `thinkingLevel`, `thinkingBudget: 0` отключает                                       |
| **Streaming**        | ✅ оба эндпоинта                                                                                                       |

## Проверенная матрица возможностей

Результаты тестирования APIYI от 22 июля 2026 года (официальные заявления vs. измеренное поведение):

| Возможность                                    | Официально          | Нативный Gemini                                                                                                                                            | Совместимый с OpenAI                                                  |
| ---------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Chat (non-stream / stream)                     | ✅                   | ✅ / ✅                                                                                                                                                      | ✅ / ✅                                                                 |
| System instructions                            | ✅                   | ✅                                                                                                                                                          | ✅                                                                     |
| Thinking (tiers / off / thought echo)          | ✅                   | ✅ четыре уровня измерены 0–837 token, `includeThoughts` работает                                                                                           | ✅ `reasoning_effort` работает, в usage отображается reasoning\_tokens |
| Image / PDF / audio understanding              | ✅                   | ✅ все подтверждено                                                                                                                                         | ✅ image (data URL) подтверждено                                       |
| Function calling                               | ✅                   | ✅                                                                                                                                                          | ✅                                                                     |
| Structured output                              | ✅                   | ✅ responseSchema                                                                                                                                           | ✅ json\_schema                                                        |
| Google Search grounding                        | ✅                   | ✅ полные groundingMetadata                                                                                                                                 | — только нативно                                                      |
| Maps grounding / URL context                   | ✅                   | ✅ / ✅                                                                                                                                                      | — только нативно                                                      |
| Code execution                                 | ✅                   | ⚠️ подтверждено, что код действительно выполняется upstream с корректными результатами, но поля `executableCode` не возвращаются в ответе (см. примечание) | — только нативно                                                      |
| Computer Use (Preview)                         | ✅                   | ✅ возвращает action functionCall                                                                                                                           | — только нативно                                                      |
| Implicit caching                               | ✅                   | ⚠️ вероятностные попадания — без гарантированного процента попаданий                                                                                       | то же самое                                                           |
| Explicit cache API / countTokens / File search | ✅                   | ❌ пока не включено на платформе                                                                                                                            | —                                                                     |
| Batch / Live API / audio gen / image gen       | ❌ или N/A для шлюза | —                                                                                                                                                          | —                                                                     |

<Warning>
  **Примечание по выполнению кода**: наши тесты подтверждают, что код действительно выполняется на стороне upstream (задача sha256, которую нельзя запомнить, вернула правильный digest), но части `executableCode` / `codeExecutionResult` сейчас не возвращаются в ответе — код и его результат вместо этого появляются в теле текста. Приложениям, которые отображают эти два поля отдельно, стоит это учесть.
</Warning>

## Тарификация

| Позиция                  | цена APIYI (такая же, как официальная)                         |
| ------------------------ | -------------------------------------------------------------- |
| Вход                     | \$1.50 / 1M tokens                                             |
| Вывод (включая thinking) | \$7.50 / 1M tokens                                             |
| Опора на Google Search   | \$14 / 1K queries (тарифицируется за каждый вызов инструмента) |

<Info>
  **Примечание по тарификации**: thinking tokens тарифицируются как output — основная причина управлять уровнями thinking. APIYI соответствует официальной тарификации; скидка складывается из бонусов за пополнение: +10% на \$100, до +20% (≈17% скидки). См. [акции на пополнение](/ru/faq/recharge-promotions).
</Info>

## Управление рассуждением

**Рассуждение включено по умолчанию**: даже «1+1» сначала генерирует \~200 tokens рассуждения. Измеренные уровни:

| Конфигурация                                      | Tokens рассуждения (измерено) | Лучше всего подходит для                                              |
| ------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| `thinkingLevel: "minimal"` or `thinkingBudget: 0` | 0                             | Частые короткие вопросы и ответы, нагрузки, чувствительные к затратам |
| `thinkingLevel: "low"`                            | 403                           | Обычное рассуждение                                                   |
| `thinkingLevel: "medium"`                         | 487                           | Анализ средней сложности                                              |
| `thinkingLevel: "high"`                           | 837+                          | Сложное планирование, математика, анализ кода                         |

<Tip>
  Передайте `thinkingConfig: {"includeThoughts": true}`, чтобы получить обратно части рассуждения (помеченные `thought: true`); расход отображается в `usageMetadata.thoughtsTokenCount`. На совместимом с OpenAI эндпоинте используйте `reasoning_effort` (низкий/средний/высокий) и читайте `usage.completion_tokens_details.reasoning_tokens`.
</Tip>

## Быстрый старт

### Нативный формат Gemini (рекомендуется — полная поддержка инструментов)

<CodeGroup>
  ```bash cURL (basic chat) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Introduce yourself in one sentence"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingLevel": "minimal"}}
    }'
  ```

  ```python Python (google-genai SDK + Search grounding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents="What was the most important AI release in July 2026?",
      config=types.GenerateContentConfig(
          tools=[types.Tool(google_search=types.GoogleSearch())]
      )
  )
  print(response.text)
  ```

  ```python Python (multimodal: PDF understanding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents=[
          types.Part.from_bytes(data=open("report.pdf", "rb").read(),
                                mime_type="application/pdf"),
          "Summarize the key findings of this document"
      ]
  )
  print(response.text)
  ```
</CodeGroup>

### Формат, совместимый с OpenAI (готовая замена для существующего кода)

<CodeGroup>
  ```python Python (OpenAI SDK) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.6-flash",
      messages=[{"role": "user", "content": "Analyze the time complexity of this code"}],
      reasoning_effort="high",
      max_tokens=4000
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (streaming) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.6-flash',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## Частые вопросы

<AccordionGroup>
  <Accordion title="Нужен ли мне Google API Key для нативного эндпоинта?">
    Нет. Поместите ваш APIYI token (ключ `sk-`) в заголовок `x-goog-api-key`. С официальным google-genai SDK просто задайте `base_url` равным `https://api.apiyi.com`.
  </Accordion>

  <Accordion title="Работают ли привязка к поиску / выполнение кода на OpenAI-совместимом эндпоинте?">
    Нет. google\_search, url\_context, codeExecution, привязка к Maps и Computer Use доступны только в нативном формате. OpenAI-совместимый эндпоинт охватывает стандартный набор: чат, потоковую передачу, вызов функций, JSON Schema и vision.
  </Accordion>

  <Accordion title="Сколько экономит неявное кэширование?">
    Повторяющийся длинный префикс может попасть в кэш при втором запросе (измерено: 8,176 из префикса в 15.9K-token), но попадания вероятностные — не стройте на них модели затрат. Явный API кэша (cachedContents) пока не включен на платформе.
  </Accordion>

  <Accordion title="Gemini 3.6 Flash или 3.5 Flash-Lite?">
    Выберите 3.6 Flash для инструментов, глубокого thinking и более сильного рассуждения. Выберите [3.5 Flash-Lite](/ru/api-capabilities/gemini-3-5-flash-lite/overview) (\$0.30 на вход / \$2.50 на выход, без thinking по умолчанию, примерно вдвое быстрее) для высокочастотных задач, чувствительных к задержке и стоимости.
  </Accordion>
</AccordionGroup>

## Связанные

* [Нативная песочница generateContent](/ru/api-capabilities/gemini-3-6-flash/generate-content)
* [Песочница Chat Completions](/ru/api-capabilities/gemini-3-6-flash/chat-completions)
* [Обзор Gemini 3.5 Flash-Lite](/ru/api-capabilities/gemini-3-5-flash-lite/overview)
* [Руководство по нативным вызовам Gemini](/ru/api-capabilities/gemini/native)
