> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по многотуровому диалогу

> Реализуйте многотуровый чат в APIYI: обработка истории для режима совместимости с OpenAI (с несколькими моделями), а также нативные форматы OpenAI / Gemini / Anthropic, с сравнением и FAQ.

LLM не имеют **собственной памяти** — модель не помнит, что вы сказали мгновение назад. «Многоходовый диалог» на самом деле означает лишь **отправку всей истории разговора с каждым запросом**. Это руководство объясняет, как каждый из четырёх форматов вызова на APIYI сохраняет эту историю и какие подводные камни следует учитывать.

<Info>
  Примеры используют эндпоинт `https://api.apiyi.com` и ваш [APIYI token](https://api.apiyi.com/token). Упоминаемые модели: `gpt-5.4-mini`, `deepseek-v4-pro`, `gemini-3.5-flash`, `claude-sonnet-4-6`.
</Info>

## Основной принцип: ведите историю сами

Одной фразой: **модель не сохраняет состояние; вы (клиент) ведете историю и отправляете ее целиком на каждом ходе.**

```text theme={null}
Turn 1: send [user Q1]                              → get [reply 1]
Turn 2: send [user Q1, reply 1, user Q2]            → get [reply 2]
Turn 3: send [user Q1, reply 1, user Q2, reply 2, user Q3] → get [reply 3]
```

На каждом новом ходе **добавляйте** предыдущее сообщение пользователя и ответ модели в конец массива истории, затем отправляйте его целиком. Единственные различия между форматами — как называется массив истории и как записываются роли.

<Warning>
  **На APIYI всегда используйте подход «ведите историю сами».** Не полагайтесь на любое состояние разговора на стороне сервера (например, `previous_response_id` в OpenAI Responses) — через шлюз это не гарантированно работает, как подробно описано в разделе OpenAI native ниже.
</Warning>

## OpenAI compatible mode (работает во всех моделях)

Самый универсальный подход, endpoint `/v1/chat/completions`. История хранится в массиве `messages`, при этом каждый элемент содержит `role` (`system` / `user` / `assistant`). **Изменение строки `model` позволяет одному и тому же коду работать с разными моделями** (gpt, deepseek, claude, gemini…).

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  messages = [{"role": "system", "content": "You are a friendly assistant."}]

  def chat(user_input, model="gpt-5.4-mini"):
      messages.append({"role": "user", "content": user_input})
      resp = client.chat.completions.create(model=model, messages=messages)
      reply = resp.choices[0].message.content
      messages.append({"role": "assistant", "content": reply})  # append reply to history
      return reply

  print(chat("My name is Alice and I'm 28. Please remember."))
  print(chat("How old am I? And plus 5?"))   # remembers → 28, 33
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });
  const messages = [{ role: 'system', content: 'You are a friendly assistant.' }];

  async function chat(userInput, model = 'gpt-5.4-mini') {
    messages.push({ role: 'user', content: userInput });
    const resp = await client.chat.completions.create({ model, messages });
    const reply = resp.choices[0].message.content;
    messages.push({ role: 'assistant', content: reply });   // append reply to history
    return reply;
  }

  console.log(await chat("My name is Alice and I'm 28. Please remember."));
  console.log(await chat('How old am I?'));
  ```

  ```bash cURL theme={null}
  {/* Turn 2: include both the question and answer from turn 1 */}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "deepseek-v4-pro",
      "messages": [
        {"role": "user", "content": "My name is Alice and I am 28. Please remember."},
        {"role": "assistant", "content": "Got it: your name is Alice and you are 28."},
        {"role": "user", "content": "How old am I?"}
      ]
    }'
  ```
</CodeGroup>

<Tip>
  **Одна кодовая база, много моделей**: измените `model` на `deepseek-v4-pro`, `claude-sonnet-4-6`, `gemini-3.5-flash` или любую другую модель — логика многоходового диалога останется прежней. См. [Обзор моделей и тарифов](/ru/api-capabilities/model-info).
</Tip>

### Обработка истории для reasoning-моделей

Reasoning-модели, такие как `deepseek-v4-pro`, возвращают дополнительное поле `reasoning_content` (цепочка рассуждений).

<Warning>
  **Оставляйте в истории только `content` — не передавайте `reasoning_content` обратно.** Это рассуждение — всего лишь промежуточный результат текущего хода; возврат его обратно впустую расходует tokens и нарушает правила upstream (в прямом API DeepSeek за это даже возвращается 400). При добавлении в историю берите только `content`:

  ```python theme={null}
  messages.append({"role": "assistant", "content": resp.choices[0].message.content})
  # do NOT include resp.choices[0].message.reasoning_content
  ```
</Warning>

Подробнее о разборе ответов reasoning-моделей см. [Вывод reasoning-модели](/ru/api-capabilities/openai/reasoning-models).

## Нативный формат OpenAI (Responses API)

Эндпоинт `/v1/responses`. Для многотурового взаимодействия **передавайте полную историю в массиве `input`** (каждая запись с `role` / `content`) — тот же подход с самостоятельным управлением, что и в совместимом режиме:

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

resp = client.responses.create(
    model="gpt-5.4-mini",
    input=[
        {"role": "user", "content": "Remember the codeword: purple elephant."},
        {"role": "assistant", "content": "Got it, the codeword is purple elephant."},
        {"role": "user", "content": "What's the codeword?"},
    ],
)
print(resp.output_text)   # The codeword is: purple elephant.
```

<Warning>
  **Не полагайтесь на серверное состояние** вроде `previous_response_id` / `conversation` / `store`. Проверено через шлюз APIYI: при передаче `previous_response_id` ошибка не возникает (возвращается 200), но на следующем ходе **предыдущий ответ не запоминается**, а `GET /v1/responses/{id}` недоступен. Поэтому в APIYI используйте Responses API с **самостоятельно управляемой историей** (массив `input`), как показано выше.
</Warning>

## Нативный формат Gemini

Эндпоинт `/v1beta/models/{model}:generateContent`. История хранится в массиве `contents`. Обратите внимание, что **роли — `user` / `model`** (а не `assistant`), и содержимое каждой записи помещается в `parts`.

```python theme={null}
from google import genai

client = genai.Client(api_key="YOUR_API_KEY",
                      http_options={"base_url": "https://api.apiyi.com"})

contents = [
    {"role": "user", "parts": [{"text": "Remember the codeword: purple elephant."}]},
    {"role": "model", "parts": [{"text": "Got it: purple elephant."}]},
    {"role": "user", "parts": [{"text": "What's the codeword?"}]},
]
resp = client.models.generate_content(model="gemini-3.5-flash", contents=contents)
print(resp.text)   # The codeword is: purple elephant.
```

<Tip>
  **Еще проще**: официальный `google-genai` SDK `client.chats.create(...)` сохраняет для вас историю `contents` — просто вызывайте `send_message`, без ручной сборки.
</Tip>

<Note>
  Ответы Gemini 3-series прикрепляют `thoughtSignature` к частям. Для **обычного текста в несколько ходов достаточно возвращать только `text`** для сохранения контекста (и это дешевле по token); только сценарии, требующие строгой непрерывности рассуждения, такие как **вызов функций**, требуют передавать `thoughtSignature` обратно без изменений — официальный SDK делает это автоматически. См. [Нативные вызовы Gemini](/ru/api-capabilities/gemini/native) и [Вызов функций](/ru/api-capabilities/gemini/function-calling).
</Note>

## Нативный формат Anthropic

Эндпоинт `/v1/messages`. История хранится в массиве `messages` с ролями `user` / `assistant`; `content` может быть обычной строкой. Обратите внимание, что **`max_tokens` обязателен**.

```python theme={null}
import requests

def chat(messages):
    r = requests.post(
        "https://api.apiyi.com/v1/messages",
        headers={
            "content-type": "application/json",
            "anthropic-version": "2023-06-01",
            "x-api-key": "YOUR_API_KEY",
        },
        json={"model": "claude-sonnet-4-6", "max_tokens": 200, "messages": messages},
        timeout=60,
    )
    return "".join(b["text"] for b in r.json()["content"] if b["type"] == "text")

messages = [{"role": "user", "content": "Remember the codeword: purple elephant."}]
reply = chat(messages)
messages.append({"role": "assistant", "content": reply})       # append reply
messages.append({"role": "user", "content": "What's the codeword?"})
print(chat(messages))   # The codeword is: purple elephant.
```

<Tip>
  Вы также можете использовать официальный `anthropic` SDK, указав base\_url на `https://api.apiyi.com`. Ответ представляет собой массив блоков `content` — подробности разбора см. в [Claude Streaming & Responses](/ru/api-capabilities/claude-response-handling).
</Tip>

## Сравнение четырех форматов

| Аспект                       | Совместимый с OpenAI           | OpenAI нативный (Responses) | Gemini нативный             | Anthropic нативный     |
| ---------------------------- | ------------------------------ | --------------------------- | --------------------------- | ---------------------- |
| Endpoint                     | `/v1/chat/completions`         | `/v1/responses`             | `/v1beta/…:generateContent` | `/v1/messages`         |
| Поле истории                 | `messages`                     | `input`                     | `contents`                  | `messages`             |
| Роли                         | система/пользователь/ассистент | пользователь/ассистент      | **пользователь/модель**     | пользователь/ассистент |
| Форма содержимого            | `content` строка               | `content` строка            | `parts: [{text}]`           | `content` строка       |
| Владелец истории             | вы                             | вы                          | вы                          | вы                     |
| Состояние на стороне сервера | нет                            | ⚠️ недоступно               | нет                         | нет                    |
| Межмодельная совместимость   | ✅ сменить `model`              | только OpenAI               | только Gemini               | только Claude          |

<Tip>
  **Выбор**: если вам нужен один кодовая база для нескольких вендоров → выбирайте **режим, совместимый с OpenAI**; если вам нужны только нативные функции конкретного вендора (Gemini thought signatures / code execution, Claude thinking blocks & caching, встроенные инструменты OpenAI) → используйте этот **нативный формат**.
</Tip>

## Вопросы и ответы

<AccordionGroup>
  <Accordion title="Длинный разговор стоит дороже?">
    Да. Каждый ход повторно отправляет всю историю, поэтому **число input tokens растет с количеством ходов** и стоимость соответственно увеличивается. Основной способ сэкономить — **кэширование контекста**: при идентичном префиксе истории автоматически срабатывает ставка кэша (намного ниже базовой цены). См. [OpenAI caching](/ru/api-capabilities/openai/prompt-caching), [Claude caching](/ru/api-capabilities/claude-prompt-caching), [Gemini caching](/ru/api-capabilities/gemini/prompt-caching).
  </Accordion>

  <Accordion title="Сколько ходов мне сохранять? Что делать, если я превышу контекстное окно?">
    Четкого правила нет, но более длинная история обходится дороже и может превысить контекстное окно модели. Типичные стратегии: (1) **скользящее окно** — хранить только последние N ходов; (2) **сжатие summary** — сжимать более ранние ходы в абзац в system prompt; (3) всегда сохранять системную инструкцию и самые последние ходы. Сопоставляйте это с тем, сколько «памяти» нужно вашему сценарию.
  </Accordion>

  <Accordion title="Где указывать system / системную инструкцию?">
    Совместимые с OpenAI и Anthropic: в начале разговора (совместимые используют `role:"system"`; Anthropic использует верхнеуровневое поле `system` или первое сообщение). Gemini: используйте `config.system_instruction`. Системную инструкцию нужно задать только **один раз** — не нужно добавлять ее повторно на каждом ходе.
  </Accordion>

  <Accordion title="Нужно ли возвращать обратно thinking reasoning model (reasoning_content)?">
    **Нет.** Рассуждение — промежуточный результат хода; в истории следует хранить только финальный `content` (для Gemini — только `text`). Возврат рассуждения впустую расходует tokens, и некоторые upstream его отклоняют. Исключение — `thoughtSignature` в function calling у Gemini: официальный SDK обрабатывает это автоматически.
  </Accordion>

  <Accordion title="Может ли сервер запоминать разговор, чтобы мне не приходилось повторно отправлять историю?">
    В APIYI это **не рекомендуется**. `previous_response_id` в OpenAI Responses не гарантированно работает через шлюз (проверено: памяти нет). Используйте самостоятельно управляемую историю на стороне клиента везде — это самый стабильный и единообразный вариант для всех моделей.
  </Accordion>
</AccordionGroup>

## Ссылки по теме

* Основы вызовов: [OpenAI Compatible Mode](/ru/api-capabilities/openai/compatible) · [OpenAI Native Calls](/ru/api-capabilities/openai/native) · [Gemini Native Calls](/ru/api-capabilities/gemini/native) · [Claude API Basics](/ru/api-capabilities/claude)
* Разбор ответов: [OpenAI Handling Responses](/ru/api-capabilities/openai/response-handling) · [Reasoning Model Output](/ru/api-capabilities/openai/reasoning-models) · [Claude Streaming & Responses](/ru/api-capabilities/claude-response-handling) · [Gemini Streaming & Responses](/ru/api-capabilities/gemini/response-handling)
* Модели и тарификация: [Models & Pricing Overview](/ru/api-capabilities/model-info)
* Получить / управлять token: `https://api.apiyi.com/token`
