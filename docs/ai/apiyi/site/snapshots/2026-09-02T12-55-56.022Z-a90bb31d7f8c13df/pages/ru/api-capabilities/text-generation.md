> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Генерация текста (Chat Completions)

> Используйте большие языковые модели для разговорного ИИ, поддерживая одноходовый диалог, многоходовую беседу, ролевую игру и многое другое

## Обзор

Генерация текста (Chat Completions) — одна из ключевых возможностей платформы APIYi, поддерживающая более 400 популярных моделей ИИ для интеллектуальных диалогов и генерации текста. Через единый интерфейс, совместимый с OpenAI, вы можете легко реализовать:

* **Интеллектуальный диалог**: Создавайте чат-ботов и виртуальных ассистентов
* **Создание контента**: Написание статей, креативная генерация, копирайтинг
* **Помощь с кодом**: Генерация кода, отладка, предложения по рефакторингу
* **Вопросы и ответы по знаниям**: Ответы на вопросы, поиск знаний, извлечение информации
* **Ролевое моделирование**: Настраиваемые персонажи ИИ и симуляция сценариев

<Info>
  Поддерживает OpenAI GPT-4, Claude, Gemini, DeepSeek, Qwen и более 400 основных моделей с одним API-ключом.
</Info>

## Быстрый старт

### Пример базового диалога

Простой однораундовый диалог с использованием Chat Completions API:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Tell me about the history of artificial intelligence"}
    ]
)

print(response.choices[0].message.content)
```

### Пример многораундового диалога

Сохраняйте историю диалога через массив `messages` для диалога с учетом контекста:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

messages = [
    {"role": "system", "content": "You are a professional Python programming assistant"},
    {"role": "user", "content": "How do I read a CSV file?"},
    {"role": "assistant", "content": "You can use pandas library's read_csv() function..."},
    {"role": "user", "content": "How do I filter specific columns?"}
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

print(response.choices[0].message.content)
```

## Основные параметры

### model (обязательный)

Укажите имя модели. Подробности см. в [Информации о модели](/ru/api-capabilities/model-info).

```python theme={null}
model="gpt-4o"  # GPT-4 Omni
model="claude-sonnet-4.5"  # Claude Sonnet 4.5
model="gemini-3-pro-preview"  # Gemini 3 Pro
model="deepseek-chat"  # DeepSeek Chat
```

### messages (обязательный)

Массив сообщений диалога, каждое из которых содержит поля `role` и `content`:

<CardGroup cols={3}>
  <Card title="system" icon="settings">
    Системный prompt, определяющий поведение и роль AI
  </Card>

  <Card title="user" icon="user">
    Сообщение пользователя, представляющее ввод пользователя
  </Card>

  <Card title="assistant" icon="bot">
    Сообщение assistant, представляющее ответ AI
  </Card>
</CardGroup>

```python theme={null}
messages = [
    {"role": "system", "content": "You are a friendly customer service assistant"},
    {"role": "user", "content": "I want to inquire about refunds"},
    {"role": "assistant", "content": "Sure, what issue did you encounter?"},
    {"role": "user", "content": "The product has quality issues"}
]
```

### temperature (необязательно)

Управляет случайностью вывода, диапазон `0.0 ~ 2.0`, значение по умолчанию `1.0`:

* **0.0 \~ 0.3**: Более детерминированный и согласованный вывод, подходит для фактических задач (перевод, сводка, генерация кода)
* **0.7 \~ 1.0**: Сбалансированное сочетание креативности и точности, подходит для повседневного общения
* **1.0 \~ 2.0**: Более креативный и разнообразный вывод, подходит для творческого письма и мозгового штурма

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a poem about spring"}],
    temperature=1.2  # Increase creativity
)
```

### max\_tokens (необязательно)

Ограничивает максимальное число token, которое можно сгенерировать, чтобы контролировать стоимость и длину ответа:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Describe AI in one sentence"}],
    max_tokens=50  # Limit output length
)
```

<Warning>
  У разных моделей разная стоимость token. Подробности см. в [Тарификации](/ru/pricing).
</Warning>

### top\_p (необязательно)

Параметр nucleus sampling, диапазон `0.0 ~ 1.0`, управляет разнообразием вывода:

* Меньшие значения (например, `0.5`): Более сфокусированный и детерминированный вывод
* Большие значения (например, `0.9`): Более разнообразный и случайный вывод

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Recommend some sci-fi movies"}],
    top_p=0.8
)
```

<Info>
  Рекомендуется настраивать только `temperature` или `top_p`, но не оба одновременно.
</Info>

### stream (необязательно)

Включите потоковую передачу вывода, чтобы возвращать результаты token за token и улучшить пользовательский опыт:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write an article about artificial intelligence"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## Расширенное использование

### Системный промпт

Определяйте поведение ИИ, роль, область знаний и стиль ответа через роль `system`:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": """You are a professional legal advisor assistant.

Rules:
1. Provide accurate and professional legal advice
2. Use plain language to explain legal terms
3. Cite relevant laws when necessary
4. Avoid absolute conclusions, suggest consulting professional lawyers
5. Maintain a neutral and objective stance"""
    },
    {"role": "user", "content": "Can employment contracts be terminated at any time?"}
]
```

### Ролевая игра

Создавайте ИИ-ассистентов с заданными личностными чертами и экспертизой:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": "You are an experienced Python developer with 10 years of experience. You excel at solving problems with concise code, prefer Pythonic approaches, and proactively identify potential issues in code."
    },
    {"role": "user", "content": "Help me write a quicksort algorithm"}
]
```

### Управление контекстом

Для длинных разговоров правильно управляйте длиной контекста, чтобы не превышать лимиты tokens модели:

```python theme={null}
def manage_context(messages, max_history=10):
    """Keep recent conversation history"""
    # Preserve system messages
    system_messages = [m for m in messages if m["role"] == "system"]
    # Keep recent N messages
    recent_messages = messages[-max_history:]

    return system_messages + recent_messages

# Usage example
messages = manage_context(messages, max_history=10)
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)
```

### Вывод в режиме JSON

Некоторые модели поддерживают принудительный вывод в формате JSON:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a data extraction assistant. Always return results in JSON format"},
        {"role": "user", "content": "Extract key information from this text: Zhang San, male, 30 years old, software engineer"}
    ],
    response_format={"type": "json_object"}
)

import json
result = json.loads(response.choices[0].message.content)
print(result)
```

## Лучшие практики

### 1. Выберите подходящую модель

Выберите наиболее экономичную модель в зависимости от требований задачи:

| Тип задачи           | Рекомендуемые модели                            | Примечания                            |
| -------------------- | ----------------------------------------------- | ------------------------------------- |
| Ежедневное общение   | gpt-4o-mini, deepseek-chat                      | Низкая стоимость, быстрый ответ       |
| Сложное рассуждение  | gpt-4o, claude-sonnet-4.5, gemini-3-pro-preview | Высокие возможности, высокая точность |
| Генерация кода       | gpt-4o, deepseek-coder, claude-sonnet-4.5       | Профессиональная экспертиза           |
| Творческое письмо    | claude-sonnet-4.5, gpt-4o                       | Свободное изложение                   |
| Многоязычный перевод | gemini-3-pro-preview, gpt-4o                    | Поддержка многих языков               |

### 2. Оптимизируйте prompt'ы

Хорошо составленные prompt'ы значительно улучшают качество результата:

<CardGroup cols={2}>
  <Card title="Чёткая задача" icon="check">
    Чётко укажите, что нужно сделать ИИ, и предоставьте необходимый контекст
  </Card>

  <Card title="Укажите формат" icon="list">
    Определите формат вывода, длину, тон и т. д.
  </Card>

  <Card title="Приведите примеры" icon="lightbulb">
    Приведите примеры входа-выхода, чтобы помочь ИИ понять ожидания
  </Card>

  <Card title="Пошагово" icon="list-ordered">
    Разбейте сложные задачи на несколько шагов
  </Card>
</CardGroup>

```python theme={null}
# ❌ Poor prompt
"Write an article"

# ✅ Good prompt
"""Write a popular science article about AI applications in healthcare.

Requirements:
- Length: 800-1000 words
- Audience: General readers
- Structure: Introduction, Application Scenarios, Case Analysis, Future Outlook
- Tone: Professional but accessible
- Include 2-3 real-world cases"""
```

### 3. Контроль затрат

Используйте параметры разумно, чтобы снизить затраты на API:

```python theme={null}
# Set max_tokens to limit output length
response = client.chat.completions.create(
    model="gpt-4o-mini",  # Use more cost-effective model
    messages=messages,
    max_tokens=500,  # Limit maximum output
    temperature=0.7
)

{/* Regularly clean conversation history */}
if len(messages) > 20:
    messages = messages[-10:]  # Keep only recent 10 messages
```

### 4. Обработка ошибок

Добавьте обработку исключений, чтобы повысить стабильность приложения:

```python theme={null}
from openai import OpenAI, OpenAIError
import time

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def chat_with_retry(messages, max_retries=3):
    """Chat function with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return response.choices[0].message.content
        except OpenAIError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise

# Usage example
try:
    result = chat_with_retry(messages)
    print(result)
except OpenAIError as e:
    print(f"API call failed: {e}")
```

### 5. Используйте потоковую передачу вывода

При генерации длинного текста потоковая передача вывода улучшает пользовательский опыт:

```python theme={null}
def stream_chat(messages):
    """Streaming output example"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True
    )

    full_response = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            full_response += content

    return full_response
```

## Частые вопросы

### Как считать tokens?

Разные модели используют разные токенизаторы. Используйте библиотеку `tiktoken` для оценки:

```python theme={null}
import tiktoken

def count_tokens(text, model="gpt-4o"):
    """Estimate token count for text"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# Usage example
text = "Hello, world!"
tokens = count_tokens(text)
print(f"Token count: {tokens}")
```

### Почему вывод обрезается?

Возможные причины:

1. Достигнут лимит `max_tokens`
2. Контекстное окно модели недостаточно
3. Сработала политика безопасности контента

Решения:

* Увеличьте параметр `max_tokens`
* Выбирайте модели с поддержкой более длинного контекстного окна
* Проверьте поле `finish_reason`, чтобы определить причину

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=2000  # Increase output length limit
)

finish_reason = response.choices[0].finish_reason
if finish_reason == "length":
    print("Output truncated due to length limit")
elif finish_reason == "content_filter":
    print("Output filtered due to content safety")
```

### Как реализовать память диалога?

Сохраняйте историю диалога на уровне приложения:

```python theme={null}
class ChatSession:
    def __init__(self, system_prompt=""):
        self.messages = []
        if system_prompt:
            self.messages.append({"role": "system", "content": system_prompt})

    def chat(self, user_message):
        """Send message and record conversation"""
        self.messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=self.messages
        )

        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

# Usage example
session = ChatSession(system_prompt="You are a friendly assistant")
print(session.chat("Hello"))
print(session.chat("What did I just say?"))  # AI can remember context
```

## Связанная документация

<CardGroup cols={2}>
  <Card title="Информация о моделях" icon="database" href="/ru/api-capabilities/model-info">
    Просмотрите все поддерживаемые модели и тарификацию
  </Card>

  <Card title="Текстовые эмбеддинги" icon="vector-square" href="/ru/api-capabilities/text-embedding">
    Преобразуйте текст в векторные представления
  </Card>
</CardGroup>
