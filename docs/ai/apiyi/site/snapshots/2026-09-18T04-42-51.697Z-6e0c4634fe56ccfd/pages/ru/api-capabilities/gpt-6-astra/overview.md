> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Генерация текста GPT-6 Astra

> Флагманская GPT-6 Astra от OpenAI в APIYI: Responses и Chat Completions доступны, $10 за входные данные / $50 за выходные данные на 1M tokens, вдвое дешевле в группе Codex_Reverse. Включает более 220 проверок по линиям официального релея и reverse, данные рассуждения четырёх уровней и атрибуцию каждого отклонения по элементам.

GPT-6 Astra (`gpt-6-astra`) — флагманское новое поколение OpenAI, выпущенное 3 сентября 2026 года и предназначенное для работы с компьютером, разработки ПО, науки и длительных агентных задач: контекст на 1 050 000 tokens, максимальный вывод 128 000 tokens, настраиваемый уровень reasoning. APIYI открыл оба эндпоинта **Responses** и **Chat Completions** и в день запуска выполнил одинаковую матрицу из 74 проверок по трём линиям: официальный релей через OpenAI напрямую, официальный релей через Azure и `Codex_Reverse`.

<Info>
  **GPT-6 Astra уже доступна в APIYI**: имя модели — `gpt-6-astra`. Официальные релей-группы `default` / `svip` тарифицируются в точном соответствии с OpenAI и обслуживаются двумя официальными линиями — OpenAI напрямую и Azure; группа `Codex_Reverse` (ресурсы Codex, полученные обратной разработкой) тарифицируется со **скидкой 0,5x**. **Вызов функций и агентная цепочка tools доступны только в Responses**, поэтому начинайте новые проекты с него.
</Info>

<Warning>
  **Chat Completions не поддерживает function tools.** Запрос с `tools` отклоняется вышестоящей системой на линиях официального релея (400 с указанием перейти на Responses) независимо от `reasoning_effort` или `tool_choice`. Это ограничение модели, а не проблема платформы. Существующий код Chat, использующий вызов функций, необходимо перенести на Responses при переходе на Astra.
</Warning>

## Чем он выделяется

<CardGroup cols={2}>
  <Card title="Создан для выполнения задач" icon="monitor">
    Terminal-Bench 4.0 — с 37,3% до 57,9%, ScreenSpot-Pro — с 76,9% до 92,7%, OSWorld 2.0 — 72,6%. Наибольший прирост приходится на агентные задачи; OpenAI сообщает, что среднее время выполнения сложных задач сократилось примерно с 75 до 40 минут.
  </Card>

  <Card title="1,05M контекста, подтверждено измерениями" icon="file-text">
    Тест «иголка в стоге сена» на 308K символов (210 657 tokens) был правильно выполнен за 10,3 с. OpenAI сообщает примерно на 70% меньше tokens на задачу, чем у GPT-5.6 Sol, поэтому реальная разница в стоимости одной задачи меньше, чем разрыв в цене за единицу в 2,5 раза.
  </Card>

  <Card title="Полная цепочка инструментов Responses" icon="bot">
    Вызов функций поддерживает одиночные, параллельные, циклические и потоковые сценарии; размещенные инструменты `web_search` и `code_interpreter` работают; зашифрованные элементы рассуждений воспроизводятся без сохранения состояния. Строгий вывод JSON Schema в точности соответствовал набору полей.
  </Card>

  <Card title="Три линии измерены, каждому отклонению присвоена причина" icon="git-fork">
    Одна и та же матрица запускалась на OpenAI напрямую, Azure и Codex\_Reverse. Возможности модели идентичны во всех трех вариантах; все отклонения возникают в конвейере, и на этой странице каждое из них помечено как ограничение вышестоящего провайдера, специфичное для группы или специфичное для линии.
  </Card>
</CardGroup>

## Информация о модели

| Параметр                            | Значение                                                                                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Название модели**                 | `gpt-6-astra`                                                                                                                                                   |
| **Релиз**                           | 3 сентября 2026 года (OpenAI); доступна на APIYI с 5 сентября 2026 года                                                                                         |
| **Входные модальности**             | Текст, изображение (без аудио или видео на момент запуска)                                                                                                      |
| **Выходная модальность**            | Текст                                                                                                                                                           |
| **Контекст / максимальный вывод**   | 1,050,000 / 128,000 tokens                                                                                                                                      |
| **Срез знаний**                     | 30 апреля 2026 года                                                                                                                                             |
| **Усилие рассуждения**              | `low` / `medium` / `high` / `xhigh`, по умолчанию `medium`; `max` возвращается как `xhigh`                                                                      |
| **Группы**                          | `default`, `svip` (официальный релей), `Codex_Reverse` (обратно спроектированный, 0.5x)                                                                         |
| **Эндпоинты**                       | `POST /v1/responses` (основной; здесь доступен вызов функций), `POST /v1/chat/completions` (совместимость; без function tools)                                  |
| **Потоковая передача**              | ✅ оба эндпоинта; финальный chunk Chat содержит usage                                                                                                            |
| **Классификация кибербезопасности** | Preparedness Framework «Критический»; публичный релиз отклоняет задачи по поиску уязвимостей; прямая линия OpenAI возвращает `access_programs.cyber = standard` |

## Матрица измеренных возможностей

5 сентября 2026 года, 74 проверки на линию (официальные линии использовали вариант с длинным контекстом в 70K token, чтобы снизить стоимость):

| Возможность                                                                            | Responses                                                                                                 | Chat Completions                                                            | По трём линиям                                                                                                                                                                        |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Базовый чат (без stream / stream)                                                      | ✅ / ✅                                                                                                     | ✅ / ✅                                                                       | Идентично; минимальный prompt тарифицируется как 7 входных tokens, без скрытой инъекции                                                                                               |
| Уровень рассуждения low / medium / high / xhigh                                        | ✅ все корректны                                                                                           | ✅                                                                           | Идентично, reasoning\_tokens монотонно растут                                                                                                                                         |
| Уровень рассуждения `max`                                                              | ⚠️ отображается как `xhigh` на всех трёх                                                                  | ⚠️                                                                          | Официальные линии расходуют больше reasoning tokens на max, чем на xhigh, поэтому уровень может применяться при нормализованном отображении                                           |
| Системный prompt                                                                       | ✅ `instructions` / `system` оба работают                                                                  | ✅ официальные; ⚠️ Codex\_Reverse отбрасывает `system`, `developer` работает | Зависит от группы                                                                                                                                                                     |
| **Вызов функций** (одиночный / с повторным циклом / параллельный / потоковая передача) | ✅ / ✅ / ✅ 2 вызова / ✅                                                                                    | ❌ 400 на официальных линиях                                                 | **Ограничение upstream**: Chat не поддерживает function tools                                                                                                                         |
| Структурированный вывод `json_schema` (строгий)                                        | ✅                                                                                                         | ✅                                                                           | Идентично, набор полей совпал в точности                                                                                                                                              |
| `json_object`                                                                          | ✅                                                                                                         | ✅                                                                           | Идентично                                                                                                                                                                             |
| Входное изображение (base64)                                                           | ✅                                                                                                         | ✅                                                                           | Идентично, три цветовых блока подсчитаны и названы                                                                                                                                    |
| Входное изображение (URL)                                                              | ✅ доступные для скачивания хосты                                                                          | ✅ официальные; ⚠️ Codex\_Reverse молча отбрасывает                          | Ссылка должна быть доступна для получения на стороне сервера; хосты с защитой от скрейпинга, такие как Wikimedia, не работают на всех трёх линиях                                     |
| Кэширование промптов                                                                   | ✅ попадания по префиксу 8.7K при втором вызове                                                            | ✅                                                                           | Попадания есть на всех трёх линиях и являются общими для эндпоинтов. Отображение `cached_tokens` в API может запаздывать; детализация тарификации кэша в консоли является достоверной |
| Длинный контекст                                                                       | ✅ 210K tokens за 10.3 с; 70K за 6.3 с                                                                     | —                                                                           | Идентично                                                                                                                                                                             |
| `web_search` / `web_search_preview`                                                    | ✅ OpenAI напрямую, Codex\_Reverse                                                                         | —                                                                           | **Временно отключено на линии Azure** (уведомление платформы: тарификация Bing находится на проверке)                                                                                 |
| `code_interpreter`                                                                     | ✅ официальные; ❌ Codex\_Reverse 400                                                                       | —                                                                           | Зависит от группы                                                                                                                                                                     |
| `computer_use_preview`                                                                 | ❌ 400 «не поддерживается с gpt-6-astra»                                                                   | —                                                                           | Не поддерживается upstream                                                                                                                                                            |
| Зашифрованное рассуждение (`include: reasoning.encrypted_content`)                     | ✅ повторное воспроизведение возвращает 200 со связным ответом                                             | —                                                                           | Идентично                                                                                                                                                                             |
| `previous_response_id`                                                                 | ✅ официальные; ⚠️ Codex\_Reverse молча игнорирует                                                         | —                                                                           | Зависит от группы; `GET /v1/responses/{id}` возвращает 503 на всех трёх                                                                                                               |
| Ограничения вывода                                                                     | ✅ официальные `max_output_tokens` / `max_completion_tokens` применяются; ⚠️ Codex\_Reverse не применяются | то же                                                                       | Зависит от группы; устаревший `max_tokens` возвращает 400 на официальных линиях                                                                                                       |
| `temperature`                                                                          | ❌ 400 на официальных; принимается, но игнорируется на Codex\_Reverse                                      | то же                                                                       | Ограничение upstream, обычное для моделей рассуждения                                                                                                                                 |
| `text.verbosity` low / high                                                            | ✅ около 550 против 1350 символов                                                                          | —                                                                           | Идентично                                                                                                                                                                             |
| `service_tier` flex / priority                                                         | ⚠️ принимается, отображается как default                                                                  | —                                                                           | Стандартный уровень на всех трёх                                                                                                                                                      |
| 8 параллельных запросов                                                                | ✅ 8/8                                                                                                     | —                                                                           | Медианная задержка: OpenAI напрямую — 2.4 с, Azure — 2.7 с, Codex\_Reverse — 3.6 с                                                                                                    |

## Усилия рассуждения

Та же головоломка с переправой через реку в Responses, reasoning\_tokens в каждой строке:

| `reasoning.effort`        | напрямую через OpenAI | Azure | Codex\_Reverse | Результат |
| ------------------------- | --------------------- | ----- | -------------- | --------- |
| `low`                     | 12                    | 28    | 22             | ✅         |
| `medium` (по умолчанию)   | 33                    | 43    | 62             | ✅         |
| `high`                    | 146                   | 169   | 99             | ✅         |
| `xhigh`                   | 246                   | 320   | 199            | ✅         |
| `max` (повторяет `xhigh`) | 278                   | 516   | 207            | ✅         |

<Warning>
  **Не отправляйте `none` или `minimal`.** `minimal` отклоняется везде (400 на официальных линиях, переписывается в `low` в Codex\_Reverse). `none` ведёт себя тремя разными способами: 400 при прямом обращении к OpenAI, принимается в Azure, а в Codex\_Reverse переписывается в `medium`, при этом input\_tokens увеличивается с 14 до 4394 (около 4,2K tokens скрытых инструкций внедряются на стороне upstream). Допустимые уровни: `low` / `medium` / `high` / `xhigh`.
</Warning>

<Tip>
  Тарификация reasoning tokens осуществляется по ставке \$50 / 1M output. Используйте `low` / `medium` для детерминированных шагов и оставляйте `xhigh` для планирования и отладки. Считывайте использование из `usage.output_tokens_details.reasoning_tokens` в Responses или `usage.completion_tokens_details.reasoning_tokens` в Chat (присутствует на официальных линиях).
</Tip>

## Тарификация

### Группы официального релея (`default` / `svip`)

Два уровня в зависимости от количества входных tokens в каждом запросе; если вход превышает 272K, **весь запрос** тарифицируется по второму уровню, как в OpenAI:

| Входные tokens   | Ввод    | Вывод (включая рассуждение) | Чтение из кэша | Запись в кэш (5 мин) |
| ---------------- | ------- | --------------------------- | -------------- | -------------------- |
| 0 - 272K         | \$10.00 | \$50.00                     | \$1.00         | \$12.50              |
| 272,001 - 1,050K | \$20.00 | \$75.00                     | \$2.00         | \$25.00              |

### Группа Codex\_Reverse

0.5x от официальной цены: первый уровень — \$5.00 за ввод / \$25.00 за вывод / \$0.50 за чтение из кэша / \$6.25 за запись в кэш.

<Info>
  APIYI соответствует тарификации провайдера позиция в позицию; скидки предоставляются через группы и бонусы за пополнение, см. [Акции](/ru/faq/recharge-promotions). Различия между группами описаны в разделе [В чём разница между группами Codex, ClaudeCode и Default](/ru/faq/codex-claudecode-default-groups). Актуальные цены указаны на [странице тарифов моделей](/en/models/index).
</Info>

## Выбор группы

| Группа             | Цена             | Подходит для                                                                                                     | Примечание                                                    |
| ------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `default` / `svip` | Официальная цена | Продакшен, задачи, чувствительные к стабильности, всё, что требует ограничений вывода или `previous_response_id` | Обслуживается прямой линией OpenAI и официальной линией Azure |
| `Codex_Reverse`    | 0.5x             | Разработка в Codex CLI, чаты в клиентах, таких как Cherry Studio, агентские конфигурации, такие как OpenClaw     | 5 отклонений, специфичных для группы, перечислены ниже        |

## Примеры

### Эндпоинт Responses (рекомендуется)

<CodeGroup>
  ```python Python (основы + усилие рассуждений) theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh
      instructions="You are a senior backend engineer. Be concise.",
      input="Migrate this repo from Python 3.9 to 3.13 and list every file that needs changes, with reasons",
      max_output_tokens=4000,
  )
  print(response.output_text)
  print(response.usage.output_tokens_details.reasoning_tokens)
  ```

  ```python Python (вызов функций + веб-поиск) theme={null}
  from openai import OpenAI
  import json

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  tools = [
      {"type": "web_search"},
      {"type": "function", "name": "get_weather", "description": "Current weather for a city",
       "parameters": {"type": "object", "properties": {"city": {"type": "string"}},
                      "required": ["city"], "additionalProperties": False}, "strict": True},
  ]
  r = client.responses.create(model="gpt-6-astra", tools=tools, reasoning={"effort": "low"},
                              input="Check the current weather in Beijing and Shanghai.")
  for item in r.output:
      if item.type == "function_call":
          print(item.name, json.loads(item.arguments))
  ```

  ```python Python (многоходовый диалог без сохранения состояния через зашифрованное рассуждение) theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  history = [{"role": "user", "content": "Multiply 17 by 23. Answer with the number only."}]

  r1 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  # Replay the previous turn's full output (including the encrypted reasoning item); works on all three lines, no server-side storage needed
  history += [item.model_dump(exclude_none=True) for item in r1.output]
  history.append({"role": "user", "content": "Now add 1 to the result. Number only."})

  r2 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  print(r2.output_text)   # 392
  ```

  ```bash cURL (ввод изображений, base64) theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "low"},
      "input": [{"role": "user", "content": [
        {"type": "input_text", "text": "How many colored blocks are in this image?"},
        {"type": "input_image", "image_url": "data:image/png;base64,iVBORw0KGgo..."}
      ]}]
    }'
  ```
</CodeGroup>

### Эндпоинт Chat Completions (миграция существующего кода, без инструментов функций)

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",
      max_completion_tokens=4000,      # not the legacy max_tokens (400)
      messages=[
          # system works on the official lines; Codex_Reverse drops it, and developer works everywhere
          {"role": "developer", "content": "You are a senior backend engineer. Be concise."},
          {"role": "user", "content": "Explain Python 3.13's free-threaded mode"},
      ],
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (потоковая передача) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });

  const stream = await client.chat.completions.create({
    model: 'gpt-6-astra',
    reasoning_effort: 'low',
    messages: [{ role: 'user', content: 'Describe the Great Wall in three sentences' }],
    stream: true,
    stream_options: { include_usage: true },
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## Атрибуция отклонений

Запуск одной и той же матрицы на трёх линиях распределяет каждое отклонение по одной из трёх категорий.

### Ограничения upstream (идентичны на всех трёх линиях)

<AccordionGroup>
  <Accordion title="Chat Completions не поддерживает инструменты функций">
    Каждый запрос Chat, содержащий `tools`, возвращает 400 на обеих официальных линиях с текстом upstream, предлагающим использовать Responses; удаление `reasoning_effort` или добавление `tool_choice: required` ничего не меняет. Группа `Codex_Reverse` проходит только потому, что её пайплайн внутренне преобразуется в Responses, поэтому не считайте это доказательством поддержки. Используйте Responses для вызова функций.
  </Accordion>

  <Accordion title="максимальный reasoning.effort возвращается как xhigh">
    В 3 из 3 запросов для `max` на всех трёх линиях возвращалось `xhigh`. На официальных линиях max явно расходует больше tokens рассуждения, чем xhigh (OpenAI напрямую: 278–379 против 246, Azure: 342–516 против 320), поэтому уровень может применяться при нормализованном возврате; в Codex\_Reverse различий нет. Мы гарантируем четыре уровня.
  </Accordion>

  <Accordion title="Параметры Chat: max_tokens и temperature возвращают 400">
    Официальные линии отклоняют устаревший `max_tokens` с 400 и предлагают использовать `max_completion_tokens`; `temperature` возвращает 400 как неподдерживаемый, что обычно для моделей рассуждения. Codex\_Reverse принимает оба и игнорирует их. Удаляйте оба при миграции существующего кода.
  </Accordion>

  <Accordion title="computer_use_preview недоступен">
    Все три линии возвращают 400 «Tool 'computer\_use\_preview' is not supported with gpt-6-astra». Возможность использования компьютера, указанная в материалах о запуске, сейчас не предоставляется через API с этим типом инструмента.
  </Accordion>
</AccordionGroup>

### Только группа Codex\_Reverse (5 пунктов)

<AccordionGroup>
  <Accordion title="1. Chat полностью отбрасывает системные сообщения">
    Системные сообщения в стиле инструкций и в информационном стиле дают 0/3 в каждом случае; то же содержимое в сообщении `developer` даёт 3/3; обе официальные линии пропускают `system` 3/3. **Используйте developer в Chat**, он работает на всех трёх линиях.
  </Accordion>

  <Accordion title="2. Ни один из трёх параметров ограничения вывода не применяется">
    При использовании `max_output_tokens: 20`, `max_tokens: 20` или `max_completion_tokens: 20` вывод составлял 403 tokens, а Responses возвращал `max_output_tokens: null`. Официальные линии корректно обрезают вывод до 20 с `incomplete` / `length`. Когда ограничения важны для контроля затрат, используйте группы официального релея.
  </Accordion>

  <Accordion title="3. previous_response_id молча игнорируется">
    `store: true` всё ещё возвращает `false`, а второй ход возвращает 200 без памяти о первом; обе официальные линии корректно помнят контекст. В этой группе храните историю на клиенте и объединяйте её с `include: ["reasoning.encrypted_content"]` для воспроизведения без сохранения состояния (проверено на всех трёх линиях). `GET /v1/responses/{id}` везде возвращает 503.
  </Accordion>

  <Accordion title="4. Chat молча отбрасывает URL изображений">
    При использовании ссылки http(s) на изображение в Chat значение prompt\_tokens было 15, и модель сообщила, что не видит изображения; та же ссылка работает на обеих официальных линиях. base64 работает на обоих эндпоинтах всех трёх линий. **Отправляйте изображения как base64 в Chat в этой группе.**
  </Accordion>

  <Accordion title="5. effort none добавляет около 4,2K tokens скрытых инструкций">
    `none` переписывается в `medium`, а input\_tokens увеличивается с 14 до 4394 (4224 отнесены к `usage.attribution.request_fields.instructions` по кэшированной ставке); `minimal` переписывается в `low`. В этой группе также отсутствует размещённый инструмент `code_interpreter` (400).
  </Accordion>
</AccordionGroup>

### Только линия Azure (1 пункт)

<AccordionGroup>
  <Accordion title="web_search временно отключён">
    Запросы, содержащие `web_search` / `web_search_preview`, на линии Azure возвращают 400 с уведомлением шлюза о том, что web\_search временно отключён, пока тарификация Azure Bing находится на рассмотрении, и что другие инструменты не затронуты. Линия OpenAI напрямую и группа Codex\_Reverse работают нормально. Эта страница будет обновлена после восстановления.
  </Accordion>
</AccordionGroup>

## Руководство по миграции

<AccordionGroup>
  <Accordion title="С gpt-5.6-sol">
    В Responses измените только поле `model`. В Chat всё, использующее `tools`, необходимо перенести в Responses и удалить `max_tokens` и `temperature`. Цена в 2,5 раза выше текущего промотарифа Sol (\$4 / \$20 → \$10 / \$50), поэтому сначала проведите сравнительное тестирование на агентных задачах, автоматизации и сложных инженерных задачах; повседневный чат, классификацию и извлечение данных оставьте на Terra / Luna.
  </Accordion>

  <Accordion title="С Chat Completions на Responses">
    `messages` → `input`, `reasoning_effort` → `reasoning: {"effort": ...}`, `response_format` → `text: {"format": ...}`, `system` → `instructions`, `max_completion_tokens` → `max_output_tokens`. Определения tools преобразуются из `{"type": "function", "function": {...}}` в `{"type": "function", "name": ..., "parameters": ...}`. Полное сопоставление приведено в [руководстве по миграции Responses](/ru/api-capabilities/openai/responses-migration).
  </Accordion>

  <Accordion title="Контроль стоимости длинного контекста">
    Когда объём входных данных превышает 272K tokens, весь запрос тарифицируется по второму уровню (стоимость входных данных удваивается, выходных — в 1,5 раза). Если вам действительно не нужен весь репозиторий за один раз, поддерживайте повседневный контекст ниже 272K и размещайте стабильные префиксы в начале, чтобы они попадали в кэш (кэшированные чтения стоят одну десятую стандартной цены входных данных).
  </Accordion>

  <Accordion title="Будут ли задачи по безопасности отклоняться?">
    Astra — первая модель, которую OpenAI отнесла к критическому уровню кибербезопасности в своей Preparedness Framework, и публичная версия отклоняет наступательные задачи, такие как поиск уязвимостей и написание exploit-кода. Защитная работа не затронута: во всех трёх линейках запрос об инженерных практиках защиты от SQL-инъекций вернул полный ответ, охватывающий параметризованные запросы, принцип наименьших привилегий и многое другое.
  </Accordion>
</AccordionGroup>

## Связанные материалы

* [Статья о запуске GPT-6 Astra (бенчмарки и выбор модели)](/en/news/gpt-6-astra-launch)
* [gpt-6-astra присоединяется к группе Codex\_Reverse с ценой вдвое ниже](/en/live/2026-09/codex-reverse-gpt-6-astra)
* [Руководство по моделям рассуждений OpenAI](/ru/api-capabilities/openai/reasoning-models)
* [Кэширование промптов OpenAI](/ru/api-capabilities/openai/prompt-caching)
* [Вызов функций OpenAI](/ru/api-capabilities/openai/function-calling)
