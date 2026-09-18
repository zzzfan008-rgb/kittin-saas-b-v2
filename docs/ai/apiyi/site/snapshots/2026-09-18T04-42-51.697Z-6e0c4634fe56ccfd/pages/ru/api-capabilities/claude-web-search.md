> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по веб-поиску Claude API

> Группа по умолчанию (AWS Claude) не поддерживает нативный инструмент web_search. Два проверенных на практике варианта: бета-группа ClaudeOfficial или пользовательский инструмент поиска.

Эта страница объясняет два рабочих пути для веб-поиска с моделями Claude на APIYI, подтвержденные практическим тестированием в июне 2026 года. Для каналов, тарификации и базовой настройки сначала см. [Основы Claude API](/ru/api-capabilities/claude).

## Кратко

**Стандартная Claude-группа в APIYI направляет запросы к официальной AWS Claude (Amazon Bedrock), а сам AWS не поддерживает нативный веб-поиск Claude** — это ограничение архитектуры Bedrock, а не проблема настройки шлюза. Чтобы получить доступ к вебу, у вас есть два варианта:

| Вариант                                                                                           | Лучше всего подходит для                                                                      | Стабильность                                      |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Вариант 1: бета-группа ClaudeOfficial** (нативный `web_search` инструмент)                      | Вам нужен именно нативный опыт поиска Anthropic, и вы можете принять стабильность уровня бета | ⚠️ Бета, менее стабильно, чем группа по умолчанию |
| **Вариант 2: пользовательский инструмент поиска** (работает в группе по умолчанию, рекомендуется) | Продакшен-нагрузки, где важны стабильность и контроль                                         | ✅ Тот же уровень, что и у группы по умолчанию     |

<Warning>
  **Распространенная ошибка**: отправка запроса с инструментом `web_search` в группе по умолчанию **не вызывает ошибку** — шлюз корректно обрабатывает его, запрос возвращает HTTP 200, но поиск не выполняется; модель просто отвечает на основе своих обучающих данных. Не считайте «нет ошибки» признаком того, что поиск сработал. См. FAQ в конце, чтобы узнать, как это проверить.
</Warning>

## Почему это не поддерживается в группе по умолчанию?

`web_search` / `web_fetch` Claude — это **server-side tools**: поиск выполняется собственной серверной инфраструктурой Anthropic. AWS Bedrock предоставляет только model inference и не имеет такого search backend, поэтому интерфейс Bedrock отклоняет эти tools на уровне валидации. В whitelist типов tool у Bedrock входят только client-side tools:

```
bash_20250124, custom, memory_20250818, text_editor_*(20250124/0429/0728),
tool_search_tool_bm25(_20251119), tool_search_tool_regex(_20251119)
```

Аналогично, **MCP Connector** Anthropic (параметр `mcp_servers`) тоже является server-side функцией и не поддерживается в группе по умолчанию.

## Вариант 1: бета-группа ClaudeOfficial (нативный web\_search)

APIYI предлагает бета-группу под названием **ClaudeOfficial** (прямой официальный канал Anthropic), которая поддерживает нативные инструменты Claude `web_search` / `web_fetch`.

<Info>
  * **Как включить: обратитесь в службу поддержки**, чтобы ваш ключ был добавлен в группу ClaudeOfficial
  * **Примечание о стабильности**: это бета-группа, и она менее стабильна, чем группа по умолчанию — для важных нагрузок подготовьте запасной вариант (в качестве такого варианта хорошо подходит Option 2)
</Info>

### Пример запроса

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_APIYI_KEY(ClaudeOfficial group)" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 2048,
    "tools": [{"type": "web_search_20260209", "name": "web_search"}],
    "messages": [{"role": "user", "content": "What new models has Anthropic released recently? Search and cite sources."}]
  }'
```

Версии инструментов:

| Инструмент                 | тип                                                 | Примечания                                   |
| -------------------------- | --------------------------------------------------- | -------------------------------------------- |
| Web Search (рекомендуемый) | `web_search_20260209`                               | С динамической фильтрацией, для моделей 4.6+ |
| Web Search (базовый)       | `web_search_20250305`                               | Совместим с более ранними моделями           |
| Web Fetch                  | `web_fetch_20260209` (устар.: `web_fetch_20250910`) | Получает содержимое по заданному URL         |

Необязательные параметры: `max_uses` (ограничивает число поисков), `allowed_domains` / `blocked_domains` (фильтрация по домену).

### Как проверить, что поиск действительно был выполнен

Успешный ответ содержит блоки `server_tool_use` и `web_search_tool_result` в `content`, с цитатами в тексте ответа и полем-счетчиком в `usage`:

```json theme={null}
"usage": {
  "server_tool_use": { "web_search_requests": 2 }
}
```

Если в ответе есть только блоки `text`, а в `usage` нет `server_tool_use`, запрос не дошел до канала, поддерживающего поиск.

### Тарификация

* **Названия инструментов: `web_search`, `web_fetch`**
* web\_search: **\$10 / 1,000 searches** (\$0.01 за поиск, считается по `usage.server_tool_use.web_search_requests` — один ответ может вызвать несколько поисков) плюс обычная плата за token; неудачные поиски не тарифицируются
* web\_fetch: платы за вызов нет; полученный контент тарифицируется как входные token
* Ориентировочная стоимость одного вопрос-ответа с web (sonnet): примерно \$0.02–0.08

## Вариант 2: Пользовательский инструмент поиска (работает в группе по умолчанию, рекомендуется для production)

Группа по умолчанию (Bedrock) **полностью поддерживает стандартный вызов функций (пользовательские инструменты)**. Определите инструмент поиска, заставьте ваш клиент выполнять фактический поиск (через Search API, например Tavily / Brave / Serper / Bing), и передавайте результаты обратно модели. В ходе тестирования Claude активно вызывает инструмент, переписывает запросы как на китайском, так и на английском, и выдает ответы с источниками после нескольких раундов поиска.

### Полный пример (Python)

```python theme={null}
import requests

API_KEY = "YOUR_APIYI_KEY"  # default group works
URL = "https://api.apiyi.com/v1/messages"
HEADERS = {
    "content-type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
}

SEARCH_TOOL = {
    "name": "web_search",
    "description": ("Search the web for current information. Call this whenever "
                    "the user asks about recent events or anything after your "
                    "knowledge cutoff. You may call it multiple times."),
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "Search keywords"}},
        "required": ["query"],
    },
}

def do_search(query: str) -> str:
    """Call your search API of choice (Tavily/Brave/Serper, etc.) and return result text."""
    # Tavily example:
    # r = requests.post("https://api.tavily.com/search",
    #                   json={"api_key": TAVILY_KEY, "query": query, "max_results": 5})
    # return "\n".join(f"- {x['title']}\n  {x['url']}\n  {x['content'][:200]}"
    #                  for x in r.json()["results"])
    ...

messages = [{"role": "user", "content": "What new models has Anthropic released recently? Search, then answer with sources."}]

for _ in range(5):  # tool loop, up to 5 rounds
    resp = requests.post(URL, headers=HEADERS, json={
        "model": "claude-sonnet-4-6",
        "max_tokens": 2048,
        "tools": [SEARCH_TOOL],
        "messages": messages,
    }, timeout=180).json()

    if resp.get("stop_reason") != "tool_use":
        print(next(b["text"] for b in resp["content"] if b["type"] == "text"))
        break

    messages.append({"role": "assistant", "content": resp["content"]})
    results = [{"type": "tool_result", "tool_use_id": b["id"],
                "content": do_search(b["input"]["query"])}
               for b in resp["content"] if b["type"] == "tool_use"]
    messages.append({"role": "user", "content": results})
```

### Справка по стоимости

* Комиссии за token модели: один вопрос-ответ с несколькими раундами поиска использует примерно 10k входных + 1–2k выходных token (около \$0.05 на sonnet)
* Комиссии за Search API: бесплатный уровень Tavily — 1,000 вызовов/месяц (платный — примерно \$0.008 за вызов), Brave — \$3 / 1,000 вызовов; это того же порядка, что и официальный web\_search
* Преимущества: не зависящие от канала, контролируемые и кэшируемые источники поиска, а также сохранение стабильности и преимуществ тарификации кэша у группы по умолчанию

### Расширенно: источники поиска MCP

Если вы уже используете экосистему MCP (например, Tavily MCP, Brave MCP), подключитесь к MCP server на **стороне клиента** и преобразуйте его tools в пользовательские инструменты, показанные выше — принцип идентичен. Примечание: передача параметра `mcp_servers` напрямую в запросе (server-side MCP) **недоступна** для группы по умолчанию.

## FAQ

**Q: Я отправил инструмент web\_search в группу по умолчанию и не получил ошибки — значит, он поддерживается?**

A: Нет. Группа по умолчанию корректно обрабатывает серверные инструменты (игнорирует их); запрос возвращает 200, но поиск не выполняется. Чтобы проверить: посмотрите, содержит ли ответ `content` блоки `server_tool_use` и есть ли у `usage` поле `server_tool_use.web_search_requests` — если нет, поиск не был выполнен.

**Q: А что насчет передачи параметра `mcp_servers`?**

A: Тоже не поддерживается (это также серверная функция Anthropic). Важно: в этом случае модель может сгенерировать в теле ответа правдоподобный текст «результат инструмента» — это галлюцинация, а не реальные данные. Не полагайтесь на него.

**Q: Как выбрать между двумя вариантами?**

A: Для production выбирайте Вариант 2 (стабильный и управляемый). Если вам нужно нативное качество поиска Anthropic, формат цитирования или вы не хотите строить собственный поиск, обратитесь в службу поддержки, чтобы включить бета-группу ClaudeOfficial — и держите готовый резервный вариант.

## Связанные документы

<CardGroup cols={2}>
  <Card title="Claude API Basics" icon="sparkles" href="/ru/api-capabilities/claude">
    Каналы, список моделей, настройка и основы тарификации
  </Card>

  <Card title="Claude Prompt Caching" icon="database" href="/ru/api-capabilities/claude-prompt-caching">
    Многораундовый поиск вопросов и ответов хорошо сочетается с кэшированием для значительного снижения затрат
  </Card>
</CardGroup>
