> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Генерация текста

> Бюджетная мультимодальная модель Gemini 3.5 Flash-Lite от Google: контекстное окно 1M, по умолчанию без thinking, очень быстрая. APIYI предлагает нативные Gemini и совместимые с OpenAI эндпоинты по официальным ценам — $0.30 за вход / $2.50 за выход на 1M tokens.

Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) — это легковесная мультимодальная модель Google, обновленная в июле 2026 года (стабильный релиз), предназначенная для высокочастотных, низколатентных и недорогих нагрузок. Она принимает входные данные текст/изображение/видео/аудио/PDF с контекстным окном 1M и выводом 64K. APIYI завершила **полный прогон тестов по двум эндпоинтам** (25+5 случаев): и нативный формат Gemini, и формат, совместимый с OpenAI, работают сразу, а нативные инструменты — поисковая привязка, контекст URL — подтверждены как работающие.

<Info>
  **Доступно на APIYI сейчас**: имя модели `gemini-3.5-flash-lite`, в группах `default` / `svip`. В отличие от 3.6 Flash — **без вывода рассуждений по умолчанию**, простые запросы в наших тестах возвращаются примерно за 2 секунды; передайте `thinkingLevel: "high"`, чтобы явно включить глубокое рассуждение.
</Info>

## Ключевые особенности

<CardGroup cols={2}>
  <Card title="Лучшая в классе ценность" icon="circle-dollar-sign">
    \$0.30 input / \$2.50 output за 1M tokens (audio input по той же ставке) — от одной пятой до одной трети от 3.6 Flash. Создано для высокочастотных и пакетных нагрузок.
  </Card>

  <Card title="Без thinking, минимальная задержка" icon="zap">
    По умолчанию без thinking tokens; простые запросы выполняются примерно за \~2s (против \~4.5s на 3.6 Flash). Готово к использованию сразу для ботов поддержки, классификации и извлечения.
  </Card>

  <Card title="Полное мультимодальное понимание" icon="eye">
    Изображения, PDF и audio подтверждены как точные (video использует тот же pipeline), с тем же контекстным окном 1M, что и у флагмана.
  </Card>

  <Card title="Нативные инструменты доступны" icon="wrench">
    Grounding для Google Search, grounding для Maps, URL context и code execution подтверждены как работающие на нативном эндпоинте — ключ API Google не требуется.
  </Card>
</CardGroup>

## Сведения о модели

| Property             | Value                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Model name**       | `gemini-3.5-flash-lite` (стабильная, без alias перенаправления)                                                          |
| **Input modalities** | Текст, изображение, видео, аудио, PDF                                                                                    |
| **Context window**   | 1,048,576 входных / 65,536 выходных                                                                                      |
| **Groups**           | `default`, `svip`                                                                                                        |
| **Endpoints**        | `POST /v1beta/models/gemini-3.5-flash-lite:generateContent` (native), `POST /v1/chat/completions` (совместимый с OpenAI) |
| **Thinking**         | **ВЫКЛ. по умолчанию**; включите с помощью `thinkingLevel: "high"`                                                       |
| **Streaming**        | ✅ оба эндпоинта                                                                                                          |

## Проверенная матрица возможностей

Результаты тестирования APIYI от 22 июля 2026 года (официальные заявления vs. измеренное поведение):

| Возможность                                                             | Официально                     | Нативный Gemini                                                                                                          | Совместимый с OpenAI                                             |
| ----------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Чат (не stream / stream)                                                | ✅                              | ✅ / ✅                                                                                                                    | ✅ / ✅                                                            |
| Системные инструкции                                                    | ✅                              | ✅                                                                                                                        | ✅                                                                |
| Рассуждение                                                             | ✅                              | ✅ `thinkingLevel: "high"` запускает (\~1000 tokens), `includeThoughts` работает                                          | ⚠️ `reasoning_effort` принят, но reasoning\_tokens не сообщается |
| Понимание изображений / PDF / аудио                                     | ✅                              | ✅ все подтверждено                                                                                                       | ✅ изображение (data URL) подтверждено                            |
| Вызов функций                                                           | ✅                              | ✅                                                                                                                        | ✅                                                                |
| Структурированный вывод                                                 | ✅                              | ✅ responseSchema                                                                                                         | ✅ json\_schema                                                   |
| Привязка к Google Search                                                | ✅                              | ✅ полные groundingMetadata                                                                                               | — только в нативной версии                                       |
| Привязка Maps / контекст URL                                            | ✅                              | ✅ / ✅                                                                                                                    | — только в нативной версии                                       |
| Выполнение кода                                                         | ✅                              | ⚠️ фактически подтверждено, что выполняется с корректными результатами, но поля `executableCode` не возвращаются обратно | — только в нативной версии                                       |
| Использование компьютера                                                | ❌ официально не поддерживается | —                                                                                                                        | —                                                                |
| Неявное кэширование                                                     | ✅                              | ⚠️ попаданий в кэш не наблюдалось в наших тестах — не стройте модели стоимости на его основе                             | то же самое                                                      |
| Явный cache API / countTokens / поиск по файлам                         | частично                       | ❌ на платформе пока не включено                                                                                          | —                                                                |
| Пакетная обработка / Live API / генерация аудио / генерация изображений | ❌ или N/A для шлюза            | —                                                                                                                        | —                                                                |

## Тарифы

| Позиция                       | цена APIYI (как у официальной)                           |
| ----------------------------- | -------------------------------------------------------- |
| Ввод (text/image/video/audio) | \$0.30 / 1M tokens                                       |
| Вывод (вкл. thinking)         | \$2.50 / 1M tokens                                       |
| Привязка к Google Search      | \$14 / 1K queries (списание за каждый вызов инструмента) |

<Info>
  **Примечание по тарифам**: APIYI соответствует официальным ценам; скидка складывается из бонусов за пополнение: +10% при \$100, до +20% (≈17% скидки). См. [акции на пополнение](/ru/faq/recharge-promotions).
</Info>

## Управление рассуждением

**В отличие от 3.6 Flash — эта модель не думает по умолчанию**, поэтому она и быстрая, и дешевая. Измерено:

| Конфигурация                                | Токены рассуждения (измерено) | Примечания                                                                  |
| ------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| По умолчанию / `minimal` / `low` / `medium` | 0                             | Рассуждение не запускается на простых prompt'ах ни на одном из этих уровней |
| `thinkingLevel: "high"`                     | \~1000                        | Надежно запускает глубокое рассуждение                                      |

<Tip>
  Практическое правило: **когда вам нужно рассуждение, сразу переходите к `high`** — промежуточные уровни не запускают его на простых prompt'ах. Используйте вместе с `includeThoughts: true`, чтобы просматривать ход рассуждений. Если вашей нагрузке постоянно нужно глубокое рассуждение, [Gemini 3.6 Flash](/ru/api-capabilities/gemini-3-6-flash/overview) — более подходящий вариант.
</Tip>

## Краткий старт

### Нативный формат Gemini (рекомендуется — полная поддержка инструментов)

<CodeGroup>
  ```bash cURL (базовый чат, рассуждение отключено по умолчанию) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.5-flash-lite:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Translate to French: The weather is nice today"}]}]
    }'
  ```

  ```python Python (google-genai SDK, рассуждение по запросу) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents="Pipe A fills a pool in 8 hours, pipe B in 12. How long with both open?",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python (понимание изображений) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents=[
          types.Part.from_bytes(data=open("photo.png", "rb").read(),
                                mime_type="image/png"),
          "Describe this image"
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
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content":
                 "Classify this review as positive/negative/neutral: fast shipping, mediocre packaging"}]
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (потоковая передача) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.5-flash-lite',
    messages: [{ role: 'user', content: 'Summarize how RAG works in three sentences' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Когда следует выбирать Flash-Lite вместо 3.6 Flash?">
    Выбирайте Flash-Lite для нагрузок, ориентированных на пропускную способность: частые Q\&A, классификация, извлечение, перевод, боты поддержки (примерно вдвое быстрее, стоимость — до одной пятой). Выбирайте [3.6 Flash](/ru/api-capabilities/gemini-3-6-flash/overview) для глубокого рассуждения, сложного планирования или Computer Use.
  </Accordion>

  <Accordion title="Нужен ли мне Google API Key для нативного эндпоинта?">
    Нет. Поместите ваш APIYI token (ключ `sk-`) в заголовок `x-goog-api-key`. В официальном SDK google-genai просто задайте `base_url` как `https://api.apiyi.com`.
  </Accordion>

  <Accordion title="Как отслеживать расход на thinking?">
    На нативном эндпоинте читайте `usageMetadata.thoughtsTokenCount`. Обратите внимание: эндпоинт, совместимый с OpenAI, не сообщает `reasoning_tokens` для этой модели — используйте нативный эндпоинт для точного наблюдения.
  </Accordion>

  <Accordion title="Срабатывает ли неявное кэширование?">
    Мы наблюдали ноль попаданий в кэш за три подряд запроса с общим префиксом на 15,9K-token (3.6 Flash попал в кэш один раз при тех же условиях). Не стройте модели стоимости на основе попаданий в кэш. Явный API кэша пока не включен на платформе.
  </Accordion>
</AccordionGroup>

## Связанные

* [Нативная песочница generateContent](/ru/api-capabilities/gemini-3-5-flash-lite/generate-content)
* [Песочница Chat Completions](/ru/api-capabilities/gemini-3-5-flash-lite/chat-completions)
* [Обзор Gemini 3.6 Flash](/ru/api-capabilities/gemini-3-6-flash/overview)
* [Руководство по нативным вызовам Gemini](/ru/api-capabilities/gemini/native)
