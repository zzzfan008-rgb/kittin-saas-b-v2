> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по веб-поиску в OpenAI API

> Responses API + инструмент web_search дают вам доступ к вебу в реальном времени с ключом группы по умолчанию. gpt-5.5 / gpt-5.4 проверены на реальном поиске и источниках с цитированием, тарификация включена.

Эта страница объясняет, как использовать веб-поиск с моделями GPT на APIYI, подтверждено практическим тестированием в июне 2026 года.

## Коротко

**APIYI полностью поддерживает официальный веб-поиск OpenAI**: используйте **Responses API (`/v1/responses`) с инструментом `web_search`**. Подтверждено, что и gpt-5.5, и gpt-5.4 действительно ищут в вебе и возвращают актуальную информацию со ссылками на источники. **Ключ группы по умолчанию работает сразу — специальная активация не нужна.**

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tool:      tools: [{"type": "web_search"}]
Models:    gpt-5.5 / gpt-5.4 (verified)
```

## Реальная доступность (тестовые данные, 2026-06-11)

| Model   | Веб-результат                                                                                                                       | Цитаты                             | Поисков на один Q\&A | Задержка |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------- | -------- |
| gpt-5.4 | ✅ Точный результат по новостям той же недели                                                                                        | ✅ Структурированный `url_citation` | 1                    | \~11s    |
| gpt-5.5 | ✅ Точный результат по новостям той же недели (автоматическое ограничение по временному окну, перепроверка по нескольким источникам) | ✅ Структурированный `url_citation` | \~8                  | \~51s    |

<Tip>
  Выбор модели: **выбирайте gpt-5.4 ради скорости и стоимости; выбирайте gpt-5.5 ради охвата и строгости** (большее число раундов поиска и более крупная инъекция извлеченного контента означают более высокую стоимость и задержку — см. раздел о тарификации).
</Tip>

## Быстрый старт

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "content-type: application/json" \
  -H "authorization: Bearer YOUR_APIYI_KEY" \
  -d '{
    "model": "gpt-5.4",
    "max_output_tokens": 8192,
    "tools": [{"type": "web_search"}],
    "input": "What new models has Anthropic released in the past week? Search and include source links."
  }'
```

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_APIYI_KEY",         # default group works
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="gpt-5.4",                  # or gpt-5.5
    max_output_tokens=8192,           # recommend >=8k; gpt-5.5 uses many reasoning tokens, too small -> incomplete
    tools=[{"type": "web_search"}],
    input="What new models has Anthropic released in the past week? Search and include source links.",
)

# 1) Final answer text
print(resp.output_text)

# 2) Actual number of searches in this call (billing basis, see below)
search_calls = [item for item in resp.output if item.type == "web_search_call"]
print(f"Searches in this call: {len(search_calls)}")

# 3) Source citations (structured url_citation)
for item in resp.output:
    if item.type == "message":
        for content in item.content:
            for ann in getattr(content, "annotations", []) or []:
                print(f"Source: {ann.title} | {ann.url}")
```

### Структура ответа

Массив `output` содержит, в порядке выполнения:

| item type         | Meaning                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| `web_search_call` | Один фактически выполненный поиск (**тарификация учитывает эти записи**)              |
| `reasoning`       | Процесс рассуждения модели (серия gpt-5)                                              |
| `message`         | Итоговый ответ; его `content[].annotations` содержит `url_citation` (заголовок + URL) |

`status: "completed"` означает, что выполнение завершилось нормально; `incomplete` обычно означает, что `max_output_tokens` было слишком малым — увеличьте его.

## Тарификация (важно)

Веб-поиск влечет за собой плату за вызов инструмента, состоящую из двух частей:

| Позиция                                      | Цена                                       | Примечания                                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Плата за вызов инструмента**               | **\$10 / 1,000 вызовов** (\$0.01 за вызов) | **Название инструмента: `web_search`**; подсчитывается по количеству записей `web_search_call` в ответе `output` — один вопрос может запускать несколько поисков (gpt-5.4 обычно 1, gpt-5.5 обычно 5–8) |
| **Плата за токены извлеченного содержимого** | Стандартная цена входных token             | Результаты поиска внедряются в контекст модели и тарифицируются как input tokens. **Обычно это большая часть**: по измерениям — примерно 9k input tokens на один Q\&A для gpt-5.4 и 48–54k для gpt-5.5  |

<Info>
  Измеренная общая стоимость одного Q\&A с веб-поддержкой: gpt-5.4 ≈ \$0.01 поисковой платы + 9k tokens; gpt-5.5 ≈ \$0.08 поисковой платы + \~50k tokens. Оценивайте это с учетом ожидаемого объема ваших запросов.
</Info>

## Примечания

1. **Используйте Responses API — не используйте `web_search_options` Chat Completions**: модели серии gpt-5 не поддерживают этот параметр (официальное поведение OpenAI; возвращает 400 `Unknown parameter: 'web_search_options'`). `web_search_options` применяется только к выделенным моделям `*-search-preview`.
2. **Установите `max_output_tokens` не менее 8192**: gpt-5.5 потребляет много reasoning tokens; слишком маленький лимит возвращает `status: "incomplete"` без итогового ответа, при этом tokens все равно тарифицируются.
3. Устаревший тип инструмента `web_search_preview` тоже работает с тем же поведением; для новых интеграций используйте `web_search` напрямую.
4. Чтобы контролировать стоимость, ограничьте поведение поиска в prompt (например, "искать не более 2 раз") или используйте gpt-5.4.

## FAQ

**Q: Как я могу убедиться, что ответ действительно использовал web?**

A: Проверьте, содержит ли ответ `output` записи с `type="web_search_call"` и включают ли аннотации `message` `url_citation`. Если присутствуют оба признака, значит был реальный доступ к web; сам текст ответа без этих двух маркеров означает, что модель ответила на основе обучающих данных.

**Q: Нужна ли мне другая группа или специальный ключ?**

A: Нет. Для моделей OpenAI ключ группы по умолчанию может напрямую вызывать web search.

**Q: Какие модели поддерживаются?**

A: gpt-5.5 и gpt-5.4 подтверждены. Другие модели серии gpt-5 в принципе тоже должны поддерживать инструмент `web_search` в API Responses — перед тем как полагаться на него, выполните проверку из FAQ выше.

## Связанные документы

<CardGroup cols={2}>
  <Card title="Нативные вызовы OpenAI (Responses API)" icon="sparkles" href="/ru/api-capabilities/openai/native">
    Эндпоинт, параметры и настройка Responses API
  </Card>

  <Card title="OpenAI: кэширование промптов" icon="database" href="/ru/api-capabilities/openai/prompt-caching">
    Большой объем input-token, добавляемый веб-поиском, хорошо сочетается с кэшированием
  </Card>
</CardGroup>
