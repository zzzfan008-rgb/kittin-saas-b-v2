> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Генерация текста Seed 2.1 Turbo

> ByteDance Seed 2.1 Turbo — текстовая модель промышленного уровня: контекстное окно 256K, управляемое глубокое рассуждение, двухуровневое кэширование. APIYI предоставляет эндпоинты Chat Completions и Responses по цене $0.50 за вход / $2.50 за выход на 1M tokens.

Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — это текстовая модель промышленного уровня, выпущенная командой Seed ByteDance 23 июня 2026 года (название продукта BytePlus: Dola-Seed-2.1-turbo). Она нацелена на корпоративные нагрузки с низкой стоимостью и низкой задержкой при высоком объеме запросов, с контекстным окном 256K, заявленным для всей линейки. APIYI **полностью проверила оба эндпоинта** (15/15 тестовых случаев пройдены) — Chat Completions и Responses оба готовы к вызову.

<Info>
  **Seed 2.1 Turbo уже доступен на APIYI**: название модели `dola-seed-2-1-turbo-260628`, доступна в группах `default` / `svip`. Есть одно отличие от большинства моделей — **глубокое рассуждение включено по умолчанию**. Для вызовов, чувствительных к задержке или стоимости, явно передавайте `thinking: {"type": "disabled"}` (см. «Управление глубоким рассуждением» ниже).
</Info>

## Key Strengths

<CardGroup cols={2}>
  <Card title="Цены уровня production" icon="circle-dollar-sign">
    \$0.50 за вход / \$2.50 за выход на 1M tokens — вдвое дешевле, чем Seed 2.1 Pro того же поколения, рассчитано на частые вызовы.
  </Card>

  <Card title="Два нативных эндпоинта" icon="git-fork">
    И Chat Completions, и Responses нативно поддерживаются: потоки событий, элементы рассуждения и многотуровый previous\_response\_id все работают на стороне Responses.
  </Card>

  <Card title="Управляемое глубокое рассуждение" icon="brain">
    Переключатель рассуждения плюс уровни reasoning\_effort (при low и high измеряемое количество tokens рассуждения отличается в 4 раза) позволяют закладывать бюджет на рассуждение для каждой задачи.
  </Card>

  <Card title="Двухуровневое кэширование" icon="database-zap">
    Неявное кэширование автоматически срабатывает со 2-го запроса; явное кэширование в Responses при цепочке вызовов захватывает весь предыдущий контекст и примерно вдвое снижает задержку.
  </Card>
</CardGroup>

## Информация о модели

| Параметр                                       | Значение                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Название модели**                            | `dola-seed-2-1-turbo-260628`                                                           |
| **Дата выпуска**                               | June 23, 2026 (ByteDance Seed team)                                                    |
| **Контекстное окно**                           | 256K (family-rated)                                                                    |
| **Доступные группы**                           | `default`, `svip`                                                                      |
| **Эндпоинты**                                  | `POST /v1/chat/completions`, `POST /v1/responses`                                      |
| **Глубокое рассуждение**                       | ВКЛ по умолчанию; переключение через `thinking.type`, уровень через `reasoning_effort` |
| **Потоковая передача**                         | ✅ оба эндпоинта                                                                        |
| **Вызов функций / использование инструментов** | ✅ оба эндпоинта                                                                        |

## Проверенная матрица возможностей

Измеренные результаты APIYI на 21 июля 2026 года (официальные заявления против фактического поведения):

| Возможность                                                | Официальное заявление | Chat Completions                   | Responses                                           |
| ---------------------------------------------------------- | --------------------- | ---------------------------------- | --------------------------------------------------- |
| Базовый чат (без stream / stream)                          | ✅                     | ✅ / ✅                              | ✅ / ✅ (полный поток событий)                        |
| Структурированный вывод (json\_schema, strict)             | ✅                     | ✅                                  | ✅ (`text.format`)                                   |
| Переключатель thinking `thinking.type`                     | ✅                     | ✅ переключение работает            | items рассуждения по умолчанию                      |
| Уровни thinking `reasoning_effort`                         | ✅                     | ✅ low/high измерено 226/960 tokens | ✅ low/high измерено 371/1317 tokens                 |
| Function calling (двухпроходный цикл)                      | ✅                     | ✅                                  | ✅                                                   |
| Неявное кэширование                                        | ✅                     | ✅ попадания в кэш со 2-го запроса  | ✅ попадания в кэш со 2-го запроса                   |
| Явное кэширование                                          | ✅ (только Responses)  | —                                  | ✅ требует `previous_response_id` chaining           |
| Многоходовые `previous_response_id`                        | —                     | —                                  | ✅                                                   |
| MCP                                                        | ✅ (только Responses)  | —                                  | официально поддерживается, но нами еще не проверено |
| Веб-поиск / база знаний / fine-tuning / пакетная обработка | ❌                     | —                                  | —                                                   |

## Тарифы

| Позиция | цена APIYI         |
| ------- | ------------------ |
| Ввод    | \$0.50 / 1M tokens |
| Вывод   | \$2.50 / 1M tokens |

<Info>
  **Примечание по тарификации**: содержимое рассуждения тарифицируется как обычные output tokens — именно поэтому вам следует закладывать глубину рассуждения под каждую задачу. Бонусы за пополнение дополнительно снижают эффективную стоимость, см. [Акции пополнения](/ru/faq/recharge-promotions).
</Info>

## Управление глубоким размышлением

**Это самое важное свойство этой модели**: глубокое размышление включено по умолчанию, поэтому даже один вопрос сначала порождает сотни token рассуждения. В наших тестах одно предложение самопредставления расходовало 444 output tokens (409 из них — рассуждение) и занимало 7–19 секунд без streaming.

<Warning>
  Для нагрузок, чувствительных к задержке или стоимости (боты поддержки, частые короткие Q\&A, пакетные задачи), явно передавайте `"thinking": {"type": "disabled"}`. Измеренный результат: token рассуждения падают до нуля, а ответы становятся значительно быстрее.
</Warning>

### Три уровня мышления, по измерениям

| Setting                          | Токены рассуждения (измерено) | Лучше всего для                                          |
| -------------------------------- | ----------------------------- | -------------------------------------------------------- |
| `thinking: {"type": "disabled"}` | 0                             | частые короткие Q\&A, вызовы, чувствительные к стоимости |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371      | обычные задачи рассуждения                               |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317     | сложное планирование, математика, анализ кода            |

<Tip>
  **Дайте `max_output_tokens` запас**: рассуждение учитывается в бюджете вывода. В Responses небольшой бюджет полностью съедается размышлением, и вызов возвращает `status: "incomplete"` (`reason: length`) с **пустым текстом** — это выглядит как отсутствие вывода, но на самом деле проблема в бюджете. Начните с 1500 и используйте 4000+ для высокого уровня.
</Tip>

## Снижение затрат с кэшированием

Модель поддерживает два уровня кэширования с разной механикой — не путайте их:

### Неявное кэширование (автоматическое, оба эндпоинта)

Параметры не нужны: повторяющийся длинный префикс (например, фиксированный system prompt) автоматически попадает в кэш со 2-го запроса. Измерено: при system prompt длиной около 2 600 token запросы 2 и 3 показывали 2 360 `cached_tokens`. Проверяйте попадания в `usage.prompt_tokens_details.cached_tokens` (Chat) или `usage.input_tokens_details.cached_tokens` (Responses).

### Явное кэширование (только Responses, требует chaining)

Правильный способ использовать явное кэширование — `caching: {"type": "enabled"}` **в сочетании с chaining по `previous_response_id`**: когда на втором ходе передается предыдущий response id, весь предыдущий контекст попадает в кэш (измерено: 7 873 token полностью закэшированы, задержка снизилась с 8 с до 4 с).

<Warning>
  **Включение без chaining проигрывает по обоим направлениям**: при установленном `caching.enabled`, но без `previous_response_id`, простое повторение того же префикса дает `cached_tokens`, равный 0, каждый раз — и кэш неявного префикса тоже перестает применяться. Либо не указывайте параметр кэширования и полагайтесь на неявное кэширование, либо включите его и строго используйте chaining.
</Warning>

## Примеры кода

### Chat Completions

<CodeGroup>
  ```bash cURL (thinking выключен, быстрый ответ) theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
      ],
      "max_tokens": 500,
      "thinking": {"type": "disabled"}
    }'
  ```

  ```python Python (многоуровневое thinking) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="dola-seed-2-1-turbo-260628",
      messages=[
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations"}
      ],
      max_tokens=3000,
      reasoning_effort="high",  # low / medium / high
  )

  msg = response.choices[0].message
  print(msg.content)
  # Reasoning text is in msg.reasoning_content (via model_extra with the OpenAI SDK)
  ```

  ```javascript Node.js (потоковая передача) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'dola-seed-2-1-turbo-260628',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    max_tokens: 1500,
    stream: true,
    stream_options: { include_usage: true }
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

### Responses (встроенные многораундовые диалоги + явное кэширование)

<CodeGroup>
  ```bash cURL (базовый вызов) theme={null}
  curl -X POST "https://api.apiyi.com/v1/responses" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "input": "Introduce yourself in one sentence",
      "max_output_tokens": 1500
    }'
  ```

  ```python Python (связанные вызовы с явным кэшированием) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  # Turn 1: enable explicit caching
  r1 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input=[
          {"role": "system", "content": "A long, fixed background document goes here..."},
          {"role": "user", "content": "First question"},
      ],
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}, "store": True},
  )
  print(r1.output_text)

  # Turn 2: carry the previous id - the whole prior context hits the cache (~2x faster measured)
  r2 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input="Second question",
      previous_response_id=r1.id,
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}},
  )
  print(r2.output_text)
  print(r2.usage.input_tokens_details.cached_tokens)  # cache hits
  ```
</CodeGroup>

## Лучшие практики

1. **Thinking off как базовый режим, on — только по исключению**: сделайте `thinking: {"type": "disabled"}` конфигурацией по умолчанию и переключайтесь на уровни `reasoning_effort` только для действительно сложных задач — не платите за thinking на простых вопросах.
2. **Оставляйте запас для `max_output_tokens`**: 3000+ при включенном thinking, 4000+ на высоком уровне, чтобы reasoning не вытесняло сам ответ.
3. **Ставьте фиксированные системные prompts первыми**: неявное кэширование сопоставляет по префиксу — держите неизменяемую часть в начале и автоматически экономьте деньги уже со 2-го запроса.
4. **Используйте цепочку Responses для многоходовых диалогов**: `previous_response_id` позволяет не отправлять историю заново, а в сочетании с явным кэшированием снижает и стоимость, и задержку в разговорах с длинным контекстом.
5. **Обрабатывайте 503 в логике ошибок**: опечатка в имени model или отсутствие разрешения для группы возвращает 503 (нет доступного канала), а не привычный для OpenAI 404 — не привязывайте логику повторных попыток к 404.

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Почему простые вопросы выполняются медленно и расходуют много token?">
    Потому что **глубокое рассуждение включено по умолчанию**. Даже однострочный вопрос сначала генерирует сотни reasoning tokens (\~400 по измерениям) — это медленно и затратно. Добавьте `"thinking": {"type": "disabled"}` в тело запроса; измеренное число reasoning tokens снизится до нуля.
  </Accordion>

  <Accordion title="Responses возвращает неполный ответ с пустым текстом — что произошло?">
    `max_output_tokens` слишком мал, и thinking израсходовал весь бюджет (`incomplete_details.reason` равно `length`). Увеличьте бюджет до 1500+ или отключите/уменьшите уровень thinking.
  </Accordion>

  <Accordion title="Chat Completions или Responses — что выбрать?">
    Используйте Chat Completions для одноходовых запросов или истории, которую вы ведете сами (наибольшая совместимость с экосистемой). Используйте Responses для многоходовых разговоров, явного кэширования или MCP tools — явное кэширование и MCP доступны только в Responses.
  </Accordion>

  <Accordion title="Явное кэширование включено, но cached_tokens остается 0 — почему?">
    Явное кэширование требует **цепочки**: начиная со второго хода вы должны передавать `previous_response_id` предыдущего хода. Независимые повторные запросы с `caching.enabled` никогда не дают попадания в кэш — и неявный кэш префикса тоже перестает применяться. Если цепочка не подходит для вашего приложения, просто уберите параметр кэширования и полагайтесь на неявное кэширование.
  </Accordion>

  <Accordion title="Поддерживается ли MCP?">
    Официальная таблица возможностей указывает поддержку MCP в Responses API. Тестовый прогон APIYI не охватывал MCP (для него нужен внешний MCP server) — проверьте при низком трафике перед использованием в production.
  </Accordion>

  <Accordion title="Я получил 503 — сервис недоступен?">
    Сначала проверьте написание названия model. Эта model возвращает 503 («no available channels») вместо 404 для неизвестных названий model. Если название указано верно, а 503 сохраняется, проверьте разрешение вашей group (для этой model требуется `default` или `svip`) либо обратитесь в поддержку.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Chat Playground" icon="terminal" href="/ru/api-capabilities/dola-seed-2-1-turbo/chat-completions">
    Интерактивная отладка endpoint Chat Completions
  </Card>

  <Card title="Responses Playground" icon="messages-square" href="/ru/api-capabilities/dola-seed-2-1-turbo/responses">
    Интерактивная отладка endpoint Responses
  </Card>

  <Card title="Информация о модели" icon="list" href="/ru/api-capabilities/model-info">
    Просмотрите все доступные модели и группы
  </Card>

  <Card title="Руководство по API" icon="book" href="/ru/api-manual">
    Полное руководство по использованию API
  </Card>
</CardGroup>
