> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по вызову функций Gemini

> определения function_declarations, режимы AUTO/ANY/NONE, возвраты function_response и требование thought-signature для Gemini 3.

Нативный формат Gemini полностью поддерживает вызов функций: модель выводит «какая функция + какие аргументы», вы выполняете это локально и возвращаете результат, а модель формирует итоговый ответ. Цикл соответствует [FC OpenAI](/ru/api-capabilities/openai/function-calling), но **форматы полей полностью отличаются** и их нельзя смешивать.

Эта страница основана на официальной документации Google (`ai.google.dev/gemini-api/docs/function-calling`, по состоянию на июнь 2026 года).

## Отличия формата по сравнению с OpenAI

|                                              | Gemini native                                                       | OpenAI                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Определение инструмента                      | `tools: [{"function_declarations": [...]}]`                         | `tools: [{"type": "function", ...}]`                                   |
| Результат вызова                             | `function_call` в части (объект `name` + `args`)                    | `tool_calls` / `function_call` элемент (`arguments` — это строка JSON) |
| Возврат результата                           | `Part(function_response=...)`                                       | `role:"tool"` сообщение / `function_call_output` элемент               |
| Стратегия вызова                             | `tool_config.function_calling_config.mode`: `AUTO` / `ANY` / `NONE` | `tool_choice`: `auto` / `required` / `none`                            |
| Состояние рассуждения в многоходовом диалоге | **Gemini 3 требует возвращать thought signatures**                  | Такого требования нет                                                  |

Одна распространенная ошибка: `function_call.args` Gemini — это **структурированный объект**, а не строка JSON — `json.loads` не нужен.

## Полный цикл вызова

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

# 1. Define tools
tools = [{
    "function_declarations": [{
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. Beijing"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city"]
        }
    }]
}]

# 2. First request: the model decides to call
contents = [types.Content(role="user", parts=[types.Part(text="How hot is it in Beijing right now?")])]

r1 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)

call = r1.candidates[0].content.parts[0].function_call
print(f"Model wants: {call.name}, args: {dict(call.args)}")

# 3. Execute locally (fake data standing in for a real lookup)
weather = {"city": call.args["city"], "temp": 26, "condition": "sunny"}

# 4. Return the result: append the model's reply (function_call + thought signature)
#    and the function result to the history
contents.append(r1.candidates[0].content)
contents.append(types.Content(
    role="user",
    parts=[types.Part(
        function_response=types.FunctionResponse(name=call.name, response=weather)
    )]
))

r2 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)
print(r2.text)
```

<Warning>
  **Сигнатуры мысли Gemini 3 должны быть возвращены**: часть `function_call` содержит зашифрованный `thought_signature`, и второй запрос должен включать **весь ответ модели Content без изменений в истории** (шаг 4 выше). Отсутствие сигнатуры нарушает цепочку reasoning и может привести к сбою запроса. Официальный SDK `google-genai` автоматически обрабатывает это с помощью приведенного выше шаблона; не удаляйте поле в ручных REST-запросах.
</Warning>

## Режимы вызова

```python theme={null}
config = {
    "tools": tools,
    "tool_config": {"function_calling_config": {"mode": "AUTO"}}
}
```

| Режим                               | Поведение                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `AUTO` (рекомендуется по умолчанию) | Модель сама решает, выполнять ли вызов                                                        |
| `ANY`                               | Принудительно выполняет вызов функции; сочетайте с `allowed_function_names`, чтобы ограничить |
| `NONE`                              | Без вызовов — только текст                                                                    |

```python theme={null}
# Force get_weather only
config = {
    "tools": tools,
    "tool_config": {
        "function_calling_config": {
            "mode": "ANY",
            "allowed_function_names": ["get_weather"]
        }
    }
}
```

## Параллельные и многошаговые вызовы

* **Параллельно**: один ход может вернуть несколько частей `function_call` (например, сразу два города); выполните каждую и верните все части `function_response` вместе
* **Многошагово**: модель может выстраивать цепочку «вызов → проверка результата → повторный вызов»; повторяйте цикл, пока в ответе не останется больше `function_call`. Ограничьте цикл, чтобы избежать неконтролируемых расходов

```python theme={null}
# Generic agent loop skeleton
MAX_ROUNDS = 5
for _ in range(MAX_ROUNDS):
    response = client.models.generate_content(
        model="gemini-3.5-flash", contents=contents, config={"tools": tools}
    )
    parts = response.candidates[0].content.parts
    calls = [p.function_call for p in parts if getattr(p, "function_call", None)]
    if not calls:
        print(response.text)  # no more calls — final answer
        break

    contents.append(response.candidates[0].content)  # includes thought signatures
    result_parts = [
        types.Part(function_response=types.FunctionResponse(
            name=c.name, response=execute(c.name, dict(c.args))
        ))
        for c in calls
    ]
    contents.append(types.Content(role="user", parts=result_parts))
```

## Рекомендации по лучшим практикам

* **Описания пишутся для модели**: четко указывайте «когда вызывать меня»; ограничивайте параметры с помощью `enum` вместо свободных строк
* **Поддерживайте стабильность определений инструментов**: они участвуют в сопоставлении префиксов кэша — изменения вредят [попаданиям в кэш](/ru/api-capabilities/gemini/prompt-caching)
* **Нужен детерминированный JSON-вывод вместо внешнего инструмента?** Рассмотрите `response_schema` structured output вместо FC (см. таблицу параметров [Встроенные вызовы](/ru/api-capabilities/gemini/native))
* Для вычислений в изолированной среде используйте встроенный инструмент [code\_execution](/ru/api-capabilities/gemini/multimodal) вместо того, чтобы писать собственную функцию калькулятора

## Распространенные ошибки

| Симптом                                       | Исправление                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Ошибки второго раунда / противоречивые ответы | Ответ модели (с сигнатурами рассуждений) не был добавлен дословно — добавьте весь `candidates[0].content` |
| Не удается `json.loads` на `args`             | `args` у Gemini — это объект, а не строка — используйте `dict(call.args)`                                 |
| Модель никогда не вызывает функцию            | Уточните описание или принудительно вызовите с помощью `mode: "ANY"`                                      |
| Определение tools в стиле OpenAI отклонено    | Эти два формата нельзя смешивать — перепишите как `function_declarations` согласно выше                   |

## Связанные ссылки

* Эта группа: [Native Calls](/ru/api-capabilities/gemini/native) · [Multimodal & Code Execution](/ru/api-capabilities/gemini/multimodal) · [Cache Billing](/ru/api-capabilities/gemini/prompt-caching)
* Соответствие в OpenAI: [OpenAI Function Calling](/ru/api-capabilities/openai/function-calling)
* Официальная документация Google: `ai.google.dev/gemini-api/docs/function-calling`
