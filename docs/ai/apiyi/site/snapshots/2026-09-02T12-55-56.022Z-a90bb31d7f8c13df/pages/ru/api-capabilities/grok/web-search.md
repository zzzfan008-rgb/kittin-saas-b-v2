> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по Web Search и X Search в Grok

> Живой поиск Grok на APIYI, проверено на практике: Responses API + инструменты web_search / x_search выполняют реальные поиски и возвращают результаты с цитированием, актуальные на данный момент. X search уникален для Grok. Включает структуру ответа и примечания по тарификации.

На этой странице показано, как использовать веб-поиск Grok и поиск в X (Twitter) на APIYI; проверено на практике 13 июля 2026 (UTC+8).

## Кратко

**APIYI полностью поддерживает официальные серверные инструменты поиска Grok**: используйте **Responses API (`/v1/responses`) с инструментами `web_search` / `x_search`**. `grok-4.5` достоверно выполняет реальные поиски и возвращает цитируемые актуальные результаты. Ключ группы по умолчанию работает сразу из коробки.

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tools:     tools: [{"type": "web_search"}] or [{"type": "x_search"}]
Model:     grok-4.5 (verified)
```

<Warning>
  **Устаревшая точка входа удалена**: поле `search_parameters` в Chat Completions (старый Live Search) было удалено xAI — при проверке возвращается 410. Перенесите существующий код на формат tools в Responses API.
</Warning>

## Проверенные результаты (2026-07-13)

| Tool         | Результат                                                                                                               | Поисков на Q\&A | Задержка |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------- | -------- |
| `web_search` | ✅ Корректно вернул новости за текущую неделю (правильно нашел анонс запуска Grok 4.5 от 8 июля), с указанием источников | 5               | \~12s    |
| `x_search`   | ✅ Корректно вернул последние посты и содержимое треда из указанного аккаунта X                                          | 24              | \~45s    |

<Tip>
  **Поиск по X — ключевое отличие Grok**: он ищет посты в реальном времени, активность аккаунтов и обсуждения тем в X (Twitter) — источник, который не охватывает ни один другой инструмент поиска вендоров. Отлично подходит для мониторинга соцсетей, отслеживания трендов и анализа KOL. Учтите, что x\_search выполняет много раундов поиска и заметно медленнее (измерено \~45 с); установите тайм-ауты клиента на 120 с или больше.
</Tip>

## Быстрый старт

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/responses" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.5",
    "tools": [{"type": "web_search"}],
    "input": "What has xAI announced in the past week? Search and cite sources"
  }'
```

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "web_search"}],      # for X search use {"type": "x_search"}
    input="What has xAI announced in the past week? Search and cite sources",
)

# 1) Final answer
print(resp.output_text)

# 2) Actual number of searches performed
searches = [i for i in resp.output if i.type == "web_search_call"]
print(f"Performed {len(searches)} searches")

# 3) Server-side tool usage breakdown (for cost auditing)
print(resp.usage.server_side_tool_usage_details)
```

### Пример поиска в X

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "x_search"}],
    input="Search X for the latest posts from the official xAI account and summarize the topics",
)
print(resp.output_text)
```

## Структура ответа

Массив `output` содержит в порядке выполнения:

| тип элемента      | Значение                                                                      |
| ----------------- | ----------------------------------------------------------------------------- |
| `reasoning`       | Рассуждение модели (планирование стратегии поиска)                            |
| `web_search_call` | Один фактически выполненный веб-поиск (`x_search` формирует похожие элементы) |
| `message`         | Итоговый ответ со встроенными цитатами источников                             |

`usage.server_side_tool_usage_details` сообщает количество вызовов по каждому инструменту (`web_search_calls` / `x_search_calls` / `code_interpreter_calls` / `mcp_calls` и т. д.) — это стоит логировать у себя для сверки затрат.

## Тарификация

У Q\&A с live-search есть две составляющие стоимости:

| Пункт                                      | Примечания                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Стоимость tokens извлеченного контента** | Результаты поиска внедряются в контекст модели и тарифицируются по стандартной ставке за входные tokens модели. **Это основная составляющая стоимости**: в одном Q\&A с web\_search было измерено примерно 27K input tokens (из них около 11K попали в кэш по сниженной ставке) |
| **Плата за вызов инструмента**             | Инструменты на стороне сервера могут взимать плату за каждый вызов; см. тарифы инструментов APIYI и вашу фактическую выписку по тарификации                                                                                                                                     |

<Info>
  x\_search выполняет много раундов (24 поиска в одном измеренном Q\&A), что приводит к более высокой инъекции tokens и задержке по сравнению с web\_search — оценивайте стоимость с учетом ожидаемого объема запросов. И количество поисков, и `cached_tokens` можно самостоятельно проверить в использовании ответа.
</Info>

## Примечания

1. **Только Responses API**: `search_parameters` в Chat Completions больше нет (410) — не используйте его.
2. **Ожидаемая задержка**: \~12 s для web\_search, \~45 s для x\_search (измерено; зависит от сложности задачи). Установите тайм-ауты клиента ≥ 120 s.
3. **Контроль затрат**: ограничьте поведение поиска в prompt (например, «ищите не более 2 раз») и следите за `server_side_tool_usage_details`.
4. **Проверьте, что реальный поиск был выполнен**: проверьте массив `output` на наличие элементов `web_search_call` (или эквивалентных) — ответ с текстом, но без элементов поиска, был получен из обучающих данных, а не из web.

## Связанные документы

<CardGroup cols={2}>
  <Card title="Обзор Grok" icon="rocket" href="/ru/api-capabilities/grok/overview">
    Линейка моделей, тарификация и матрица возможностей
  </Card>

  <Card title="Выполнение кода и MCP" icon="terminal" href="/ru/api-capabilities/grok/code-execution-mcp">
    Два других серверных инструмента в Responses API
  </Card>

  <Card title="Тарификация кэша" icon="database" href="/ru/faq/cache-billing">
    Крупные вставки input-token из поиска хорошо сочетаются с автоматическим кэшированием
  </Card>

  <Card title="Веб-поиск OpenAI" icon="sparkles" href="/ru/api-capabilities/openai/web-search">
    Использование веб-поиска для серии GPT, для сравнения
  </Card>
</CardGroup>
