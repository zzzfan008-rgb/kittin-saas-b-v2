> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Генерация текста

> DeepSeek V4 Flash GA: контекстное окно 1M, 284B всего / 13B активируемых MoE, доступны оба эндпоинта. В APIYI по $0.44 за вход / $1.32 за выход на 1M tokens — DeepSeek тарифицирует по пиковому/внепиковому тарифу, а APIYI всегда тарифицирует по пиковому уровню — при измеренном контекстном окне 322K token ответ был получен за 15 секунд.

DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) соответствует `DeepSeek-V4-Flash-0731`,
open-source checkpoint DeepSeek, который DeepSeek перевёл в общедоступный статус 31 июля 2026 года. Архитектура
соответствует апрельскому preview (284B total / 13B activated MoE, 1M context), и
DeepSeek утверждает, что был переделан только этап post-training — однако агентные бенчмарки
значительно улучшились. APIYI завершил **21 test cases plus a dedicated dual-endpoint retest**;
и Chat Completions, и Responses можно вызывать напрямую.

<Info>
  **APIYI запустил DeepSeek V4 Flash GA**: имя модели `deepseek-v4-flash-ga-260731`,
  доступна в группах `default` / `svip`. Обратите внимание: у этой модели **по умолчанию много рассуждает** —
  явно передавайте `thinking: {"type": "disabled"}` для простых задач (см. «Управление рассуждением» ниже).
</Info>

## Ключевые преимущества

<CardGroup cols={2}>
  <Card title="Контекст 1M, который выдерживает нагрузку" icon="scroll-text">
    Жёсткий верхний предел входных данных — 1,048,570 tokens. Тест «иголка в стоге сена» с 322K-token вернулся за 14.77 с с корректным попаданием; максимальный вывод составляет 393,216 tokens.
  </Card>

  <Card title="Два слоя кэширования" icon="database-zap">
    Неявный кэш не требует настройки и даёт попадание 99.9% на втором проходе; Responses добавляет цепочечное явное кэширование, которое покрывает весь предыдущий контекст.
  </Card>

  <Card title="Параллельные запросы без троттлинга" icon="gauge">
    Все 20 параллельных запросов вернули 200, а общее время выполнения было всего на 1.3 с больше, чем у одного вызова — подходит для агентов с высокой параллельностью и пакетных текстовых задач.
  </Card>

  <Card title="Тарификация" icon="circle-dollar-sign">
    \$0.44 input / \$1.32 output на 1M tokens, а попадания в кэш — всего от \$0.0136. DeepSeek перешёл на двухуровневую тарификацию по пиковым/непиковым периодам 17 August 2026; APIYI всегда тарифицирует по пиковому уровню.
  </Card>
</CardGroup>

## Информация о модели

| Параметр                                | Значение                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| **Название модели**                     | `deepseek-v4-flash-ga-260731`                                                   |
| **Дата выпуска**                        | 31 июля 2026 г. (preview переведён в GA)                                        |
| **Архитектура**                         | 284B всего / 13B активировано, MoE                                              |
| **Контекстное окно**                    | 1M (измеренный жёсткий предел 1,048,570 tokens)                                 |
| **Максимальный объём вывода**           | 384K (измеренный жёсткий предел 393,216 tokens)                                 |
| **Доступные группы**                    | `default`, `svip`                                                               |
| **Эндпоинты**                           | `POST /v1/chat/completions`, `POST /v1/responses`                               |
| **Глубокое рассуждение**                | Включено по умолчанию и в подробном режиме; `thinking.type` можно отключить его |
| **Потоковая передача**                  | ✅ оба эндпоинта                                                                 |
| **Вызов функций / использование tools** | ✅ оба эндпоинта                                                                 |
| **Ввод изображений**                    | ❌ модель только для текста                                                      |
| **Anthropic эндпоинт / Claude Code**    | ❌ не подключён — используйте `deepseek-v4-flash` при необходимости              |

## Матрица измеренных возможностей

Результаты тестирования APIYI 5 августа 2026 года (официальные заявления vs фактическое поведение):

| Возможность                            | Официально    | Chat Completions                               | Responses                                          |
| -------------------------------------- | ------------- | ---------------------------------------------- | -------------------------------------------------- |
| Базовый чат (без stream / stream)      | ✅             | ✅ / ✅ (TTFB 1.43s)                             | ✅ / ✅ (TTFB 2.31s)                                 |
| Function Call (двухраундовый цикл)     | ✅             | ✅                                              | ✅                                                  |
| Переключатель thinking `thinking.type` | ✅             | ✅ отключено / включено / auto все работают     | ✅ возвращает элементы рассуждения                  |
| Уровни рассуждения                     | ✅             | ⚠️ только `minimal` детерминирован             | ⚠️ то же самое                                     |
| Неявный кэш                            | ✅             | ✅ 99.9% попадание в кэш на втором раунде       | ✅ 99.9% попадание в кэш                            |
| Явный кэш                              | ✅ (Responses) | —                                              | ✅ требует цепочки `previous_response_id`           |
| Структурированный вывод                | ❌             | ❌ принимается, но не принудительно применяется | ❌ принимается, но не принудительно применяется     |
| Онлайн-поиск                           | ✅ (Responses) | —                                              | ⚠️ подключен, но backend дал сбой 6/6              |
| MCP                                    | ✅ (Responses) | —                                              | ❌ `AccessDenied`, право доступа на уровне аккаунта |
| Ввод изображений                       | —             | ❌                                              | ❌ явная ошибка                                     |

<Warning>
  **Три возможности не совпадают с официальной таблицей — учтите это перед интеграцией**:
  structured output silently fails on both endpoints (returns 200 while ignoring the schema
  entirely — use Function Call when you need enforcement); the online search tool is wired but
  its backend keeps erroring and returns no `results`; MCP returns `AccessDenied`
  (an account-level built-in-tool entitlement, not a model limitation).
</Warning>

## Контроль рассуждений

Эта модель **по умолчанию много рассуждает** — вопрос в одну строку вроде «9.11 больше 9.9»
в наших тестах потребовал 263 токена рассуждения (а родственная `deepseek-v4-flash` использовала только 44).
Отключайте это явно для простых задач:

```python theme={null}
extra_body={"thinking": {"type": "disabled"}}   # reliably off
# or
extra_body={"reasoning_effort": "minimal"}      # 0 reasoning tokens in 10/10 runs
```

<Warning>
  **`reasoning_effort` — это не монотонная лестница.** Два вопроса × пять уровней × пять выборок:

  | Уровень   | медиана river | медиана prob |
  | --------- | ------------- | ------------ |
  | `minimal` | **0**         | **0**        |
  | `low`     | 956           | 367          |
  | `medium`  | 506           | 193          |
  | `high`    | **97**        | **153**      |
  | `max`     | 577           | 173          |

  `high` потребовал меньше рассуждений, чем `low`, по обоим вопросам, а дисперсия внутри уровня
  (`low` варьировало от 150 до 1993) намного превышает различия между уровнями.
  **Только `minimal` надежно** — не воспринимайте low → max как регулятор затрат.
</Warning>

## Кэширование

### Неявный кэш (автоматически на обоих эндпоинтах)

Идентичный длинный префикс даёт попадание в кэш со второго запроса: префикс длиной 15,634 token совпал по 15,616
token (99.9%), тарифицируется по \$0.028 за миллион token.

<Tip>
  Неявный кэш требует **байт-в-байт идентичного префикса**. Любые переменные данные — метки времени,
  случайные ID, имена пользователей — держите в конце prompt, никогда не смешивайте их с префиксом.
</Tip>

### Явный кэш (Responses, требует цепочки)

**Распространённая ошибка**: повторная отправка одного и того же длинного префикса дважды с установленным `caching` приводит к тому, что
`cached_tokens` остаётся на 0. Правильный шаблон — записать на первом вызове, затем продолжить цепочку с
`previous_response_id`:

| Раунд      | Вид вызова               | input\_tokens | cached\_tokens |
| ---------- | ------------------------ | ------------- | -------------- |
| 1 (запись) | `caching: enabled`       | 15,629        | 0              |
| 2          | + `previous_response_id` | 15,664        | **15,629**     |
| 3          | + `previous_response_id` | 15,701        | **15,664**     |
| 4          | + `previous_response_id` | 15,738        | **15,701**     |

## Быстрый старт

<CodeGroup>
  ```python Python theme={null}
  import os
  from openai import OpenAI

  client = OpenAI(
      api_key=os.environ["APIYI_API_KEY"],
      base_url="https://api.apiyi.com/v1",
  )

  resp = client.chat.completions.create(
      model="deepseek-v4-flash-ga-260731",
      messages=[{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      extra_body={"thinking": {"type": "disabled"}},
  )
  print(resp.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "deepseek-v4-flash-ga-260731",
      "messages": [{"role": "user", "content": "Explain the MoE architecture in one sentence"}],
      "thinking": {"type": "disabled"}
    }'
  ```

  ```javascript Node.js theme={null}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.APIYI_API_KEY,
    baseURL: "https://api.apiyi.com/v1",
  });

  const resp = await client.chat.completions.create({
    model: "deepseek-v4-flash-ga-260731",
    messages: [{ role: "user", content: "Explain the MoE architecture in one sentence" }],
    thinking: { type: "disabled" },
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

### Нужен структурированный вывод? Используйте Function Call

`response_format` не оказывает влияния на эту модель и не вызывает ошибки — самая простая ловушка, в которую можно
попасть. Аргументы tools — это то, что на самом деле ограничивается:

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "submit_result",
        "description": "Submit the extracted result",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temp_c": {"type": "number"},
            },
            "required": ["city", "temp_c"],
        },
    },
}]

resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "Beijing is 25 degrees today"}],
    tools=tools,
)

import json
print(json.loads(resp.choices[0].message.tool_calls[0].function.arguments))
```

## Тарификация

| Позиция         | Цена                |
| --------------- | ------------------- |
| Ввод            | \$0.44 / M tokens   |
| Вывод           | \$1.32 / M tokens   |
| Попадание в кэш | \$0.0136 / M tokens |

DeepSeek перешёл на двухуровневую тарификацию в 00:00 17 августа 2026 года (UTC+8), при этом внепиковый тариф составляет половину
пикового. APIYI тарифицирует **пиковый уровень в любое время**, без привязки ко времени суток — см.
[уведомление DeepSeek об изменении цен](/en/news/deepseek-price-increase-2026-08). Суммируется с
[акциями на пополнение](/ru/faq/recharge-promotions), чтобы ещё больше снизить вашу фактическую стоимость.

<Info>
  **По поводу «менее 1/10 от флагмана»**: в маркетинге поставщика сравнение идёт с предварительной ценой V4-Pro
  в период предварительного просмотра — \$1.74 / \$3.48. Если сравнивать с текущей ценой V4-Pro (\$1.32 / \$3.96),
  эта модель — **примерно 1/3**, а не 1/10.
</Info>

## Связанные страницы

<CardGroup cols={2}>
  <Card title="Завершения чата" icon="message-square" href="/ru/api-capabilities/deepseek-v4-flash/chat-completions">
    OpenAI-compatible чат-эндпоинт с интерактивной песочницей
  </Card>

  <Card title="Ответы" icon="git-fork" href="/ru/api-capabilities/deepseek-v4-flash/responses">
    Endпоинт Responses с цепочечным явным кэшированием
  </Card>

  <Card title="Описание запуска и полные тестовые данные" icon="newspaper" href="/en/news/deepseek-v4-flash-ga-launch">
    Бенчмарки, трёхстороннее сравнение скорости и ловушки, с которыми мы столкнулись
  </Card>

  <Card title="Таблица цен моделей" icon="table" href="/en/models">
    Цены за единицу, эндпоинты и группы для каждой модели
  </Card>
</CardGroup>
