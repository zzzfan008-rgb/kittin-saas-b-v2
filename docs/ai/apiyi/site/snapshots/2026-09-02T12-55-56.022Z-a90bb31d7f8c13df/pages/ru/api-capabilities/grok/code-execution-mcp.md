> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Выполнение кода и руководство по Remote MCP для Grok

> Серверное выполнение кода Grok в `code_interpreter` и инструменты Remote MCP на APIYI, проверено на практике: Python-песочница действительно запускает код, а внешние MCP-серверы успешно подключаются. Включает примеры и структуру ответа.

Помимо живого поиска, Responses API Grok предлагает еще два серверных инструмента: **выполнение кода** (`code_interpreter`, серверная песочница Python) и **Remote MCP** (серверы xAI напрямую подключаются к указанному вами MCP-серверу). Оба подтверждены как работающие на APIYI (13 июля 2026, UTC+8) с ключом из группы по умолчанию.

## Выполнение кода

Модель пишет Python и действительно запускает его в изолированной среде на сервере xAI — это идеально для точных вычислений и обработки данных. В тестировании мы попросили вычислить 2 в степени 100: модель выполнила `print(2 ** 100)` и вернула точное значение (арифметика больших целых, с которой чистые языковые модели регулярно ошибаются; выполнение кода дает точный результат):

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "code_interpreter"}],
    input="Compute 2 to the power of 100 exactly, using code",
)
print(resp.output_text)
# 2^100 = 1267650600228229401496703205376

# Inspect the code the model actually ran
for item in resp.output:
    if item.type == "code_interpreter_call":
        print("Executed code:", item.code)
```

Измеренная задержка для одной задачи выполнения кода: \~6 с. `usage.server_side_tool_usage_details.code_interpreter_calls` фиксирует число выполнений.

## Удалённые MCP-инструменты

Укажите внешний MCP-сервер в запросе, и серверы xAI автоматически подключатся, перечислят его инструменты и вызовут их по необходимости — локальный MCP-клиент не требуется. Подтверждено подключение к общедоступному MCP-серверу и выполнение вызова инструмента (\~16 с):

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never"
    }],
    input="Use deepwiki to find out what the openai/openai-python repo does, in one sentence",
)
print(resp.output_text)

# Inspect MCP call details
for item in resp.output:
    if item.type == "mcp_call":
        print("Tool:", item.name, "| Output:", item.output[:200])
```

| Параметр           | Примечания                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `server_label`     | Ваш ярлык для различения нескольких MCP-серверов                                                                                  |
| `server_url`       | Адрес MCP-сервера (должен быть доступен из интернета — серверы xAI подключаются напрямую)                                         |
| `require_approval` | `"never"` автоматически вызывает инструменты; значение по умолчанию возвращает запросы на подтверждение, требующие второго раунда |

<Warning>
  * **MCP-сервер должен быть доступен из интернета**: подключения исходят от серверов xAI; адреса intranet / localhost не подойдут.
  * **Учитывайте безопасность данных**: содержимое вашего разговора отправляется через серверы xAI на этот MCP-сервер — подключайте только те сервисы, которым доверяете.
  * Доступность внешнего сервера не зависит от APIYI; при сбоях сначала проверьте состояние сервера.
</Warning>

## Поиск по коллекциям (RAG) — Недоступно

xAI также предлагает инструмент `collections_search` (извлечение из базы знаний / file\_search). **Он не работает в APIYI**: для этого заранее нужно загрузить файлы и создать коллекции в консоли xAI, а APIYI работает в режиме key-pool без доступа к upstream-консоли. В тестах запрос проходит, но извлечение неизбежно завершается ошибкой (`file_search_call` возвращает failed).

Для RAG реализуйте извлечение на своей стороне (векторное хранилище + добавляйте извлеченный контент в prompt), используя контекстное окно Grok на 1M и [автоматическое кэширование](/ru/faq/cache-billing).

## Вопросы и ответы

<AccordionGroup>
  <Accordion title="Могу ли я объявить несколько инструментов сразу?">
    Да. Массив `tools` может включать `web_search` / `x_search` / `code_interpreter` / `mcp` вместе; модель решает, какой вызывать для каждой задачи. `usage.server_side_tool_usage_details` учитывает их по отдельности.
  </Accordion>

  <Accordion title="Может ли песочница кода получать доступ к сети или моим файлам?">
    Песочница предназначена для вычислений (математика на Python / обработка данных) и не может получать доступ к вашим локальным файлам. Для внешних данных сочетайте ее с инструментами web\_search или MCP.
  </Accordion>

  <Accordion title="Взимается ли плата за неудачные вызовы инструментов?">
    Tokens для рассуждения на стороне модели тарифицируются обычным образом. Плата за вызовы инструментов соответствует тарифам APIYI на инструменты и вашему фактическому счету по тарификации — проверьте на небольших объемах, прежде чем масштабироваться.
  </Accordion>
</AccordionGroup>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Поиск Web и X" icon="globe" href="/ru/api-capabilities/grok/web-search">
    Инструменты live-search в том же Responses API
  </Card>

  <Card title="Обзор Grok" icon="rocket" href="/ru/api-capabilities/grok/overview">
    Линейка моделей, тарификация и полная таблица границ возможностей
  </Card>
</CardGroup>
