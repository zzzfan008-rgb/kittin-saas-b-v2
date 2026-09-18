> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Compatible Mode: Вывод модели рассуждений

> Как модели рассуждений ведут себя в /v1/chat/completions: содержимое рассуждений (reasoning_content), сигнатуры мыслей и структурированный вывод — с результатами тестирования по каждой модели.

Модели reasoning «думают» перед тем, как ответить. При вызове через [совместимый режим](/ru/api-capabilities/openai/compatible) их вывод содержит несколько дополнительных элементов по сравнению с обычными моделями. На этой странице рассматриваются три вещи: **как получить рассуждение, как обрабатывать многоходовые диалоги и как сделать структурированный вывод надежным.**

<Info>
  Эта страница посвящена `/v1/chat/completions` в совместимом режиме. О нативных блоках thinking Claude (поле `thinking` на `/v1/messages`) см. [Руководство по Claude Effort & Thinking](/ru/api-capabilities/claude-effort-thinking). О нативных `thinking_level` и `thought_signature` Gemini см. [Нативные вызовы Gemini](/ru/api-capabilities/gemini/native).
</Info>

## Обзор

В режиме совместимости reasoning-модели делятся на три группы по признаку «выводят ли они текст рассуждений»:

| Тип                            | Примеры моделей                                       | Содержимое рассуждений                      | Получение ответа                                     |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Текст рассуждений не выводится | gpt-4.1-mini, gemini-3.1-flash-lite, claude-haiku-4-5 | Нет                                         | Как у обычных моделей                                |
| Выводит текст рассуждений      | grok-4.3, qwen3.6-plus, glm-5.1                       | поле `reasoning_content`                    | Ответ в `content`, рассуждение в `reasoning_content` |
| Только tokens                  | gpt-5.4-mini                                          | Нет текста, только `usage.reasoning_tokens` | Как у обычных моделей                                |

<Tip>
  Независимо от типа, **ответ всегда в `content`**. Если вы читаете только `content`, любая reasoning-модель интегрируется так же, как обычная модель; читайте `reasoning_content` только тогда, когда хотите показать рассуждение.
</Tip>

## Содержимое рассуждения: reasoning\_content

Модели, которые выводят текст размышлений, помещают цепочку рассуждений в `reasoning_content`, параллельно `content`.

**Без потоковой передачи** — `message` содержит оба:

```json theme={null}
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "1+1 equals 2.",
      "reasoning_content": "The user is asking 1+1 ... (a chain of thought)"
    },
    "finish_reason": "stop"
  }]
}
```

```python theme={null}
msg = resp.choices[0].message
print("answer:", msg.content)
# thinking (only some models; may live in model_extra in the SDK)
print("thinking:", getattr(msg, "reasoning_content", None))
```

**Потоковая передача** — сначала отправляется последовательность `delta.reasoning_content`; `delta.content` начинается только после завершения размышлений. Обязательно **отображайте их отдельно** (сворачивайте размышления, выводите ответ потоково), иначе UI сначала покажет стену мыслей:

```python theme={null}
for chunk in stream:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    reasoning = getattr(delta, "reasoning_content", None)
    if reasoning:
        render_thinking(reasoning)   # collapsible / muted text
    if delta.content:
        render_answer(delta.content) # main answer area
```

<Warning>
  **Потоковое «взаимоисключение» между рассуждением и содержимым отличается у трех моделей** — учитывайте все три варианта:

  * **grok-4.3**: во время размышления присутствует только ключ `reasoning_content`; во время ответа только `content` (другой ключ просто не появляется).
  * **qwen3.6-plus**: оба ключа присутствуют; неактивный — `null`.
  * **glm-5.1**: во время размышления `content` равен `""` (пустая строка), а `reasoning_content` содержит значение.

  Единый подход: считывайте с проверкой истинности (`if reasoning:` / `if content:`), чтобы пропускать все три пустых состояния — отсутствие, `null` и `""`.
</Warning>

<Note>
  Токены рассуждения могут намного превосходить ответ. В тестах на простой вопрос «1+1» grok-4.3 выдал сотни `reasoning_tokens` против всего нескольких токенов ответа. Размышления тарифицируются как output tokens, поэтому **оцените, стоит ли включать / отображать их в сценариях, чувствительных к задержке и стоимости**.
</Note>

## Сигнатуры мыслей и многоходовое взаимодействие

«thought signature» — это концепция **Gemini native**: в native multimodal / function calling модель возвращает зашифрованную `thought_signature`, которую нужно передавать обратно между ходами, чтобы сохранить непрерывность рассуждения (см. [Gemini Native Calls](/ru/api-capabilities/gemini/native) и [Gemini Function Calling](/ru/api-capabilities/gemini/function-calling)).

**В совместимом режиме `/v1/chat/completions` reasoning-модели не сохраняют состояние:**

* Для multi-turn достаточно поместить **`content`** из предыдущего ответа assistant в историю сообщений;
* Не нужно передавать обратно **`reasoning_content`**, и **поле сигнатуры не появляется** в ответе;
* В тестировании gemini-3.1-flash-lite и grok-4.3 корректно сохраняли multi-turn-контекст, когда обратно передавался только `content`.

```python theme={null}
messages = [
    {"role": "user", "content": "Remember the number 42."},
    {"role": "assistant", "content": "Got it, I'll remember 42."},  # content only
    {"role": "user", "content": "What is that number times 2?"}
]
# grok-4.3 / gemini-3.1-flash-lite both answer 84 correctly
```

<Tip>
  Если вам нужно сохранять сигнатуры мыслей Gemini между ходами или использовать нативные блоки мышления Claude в multi-turn, переключитесь на соответствующий **native** эндпоинт, а не на совместимый режим.
</Tip>

## Структурированный вывод

Используйте `response_format`, чтобы модель выводила только JSON. Два типа:

```python theme={null}
# 1) json_schema: strictly constrain fields by schema (OpenAI standard)
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "city_info",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "population": {"type": "integer"},
                "is_capital": {"type": "boolean"}
            },
            "required": ["city", "population", "is_capital"],
            "additionalProperties": False
        }
    }
}

# 2) json_object: only guarantees valid JSON, no field constraints
response_format = {"type": "json_object"}
```

### Поддержка по моделям (проверено)

`json_schema` поддержка сильно различается — **это главная ловушка в структурированном выводе**:

| Model                 | `json_schema`                                            | `json_object` | Можно ли `content` разобрать напрямую |
| --------------------- | -------------------------------------------------------- | ------------- | ------------------------------------- |
| gpt-4.1-mini          | ✅ строго соблюдается                                     | ✅             | ✅ чистый JSON                         |
| gemini-3.1-flash-lite | ✅                                                        | ✅             | ✅                                     |
| grok-4.3              | ✅ (также выводит рассуждение)                            | ✅             | ✅ содержимое — чистый JSON            |
| gpt-5.4-mini          | ⚠️ JSON корректен, но перед ним стоит `<think>…</think>` | —             | ❌ сначала удалите блок рассуждения    |
| qwen3.6-plus          | ⚠️ возвращает 400: messages must contain the word "json" | ✅             | ✅                                     |
| claude-haiku-4-5      | ❌ игнорирует схему, возвращает Markdown                  | —             | ❌                                     |
| glm-5.1               | ❌ игнорирует схему, возвращает обычный текст             | ✅             | ✅ при json\_object                    |

### Как надежно получать JSON в разных моделях

<Warning>
  Не стоит считать, что `json_schema` работает на каждой модели. Для надежной совместимости между моделями используйте вместе:

  1. Отдавайте предпочтение `json_object` — он совместим с большим числом моделей, чем `json_schema`;
  2. В prompt **явно укажите "возвращайте только JSON" и включите слово "json"** (это требуется для qwen и повышает надежность для остальных тоже);
  3. Парсите **осторожно**: удаляйте ` ```json ` code fences, strip a `<think>…</think>` prefix, then `json.loads`, и корректно обрабатывайте сбои.
</Warning>

````python theme={null}
import json, re

def parse_json_loose(content: str):
    # remove a <think>…</think> prefix (gpt-5.4-mini)
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
    # remove ```json code fences
    content = re.sub(r"^```(json)?|```$", "", content, flags=re.M).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None   # degrade: log raw / retry / switch model
````

## Сопутствующие ссылки

* Та же группа: [Обработка ответов](/ru/api-capabilities/openai/response-handling) · [Вызовы в совместимом режиме](/ru/api-capabilities/openai/compatible) · [Вызов функций](/ru/api-capabilities/openai/function-calling)
* Нативное рассуждение: [Руководство по Claude Effort и Thinking](/ru/api-capabilities/claude-effort-thinking) · [Нативные вызовы Gemini](/ru/api-capabilities/gemini/native)
* Модели и тарификация: [Обзор моделей и тарификации](/ru/api-capabilities/model-info)
