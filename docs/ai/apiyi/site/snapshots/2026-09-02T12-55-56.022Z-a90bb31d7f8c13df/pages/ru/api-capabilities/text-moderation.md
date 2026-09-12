> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Модерация текста

> Используйте AI-модели, чтобы определить, содержит ли текстовый контент нарушения, вредный или неподобающий контент, и обеспечить безопасность контента на платформе

## Обзор

API модерации текста использует передовые модели ИИ для автоматического обнаружения и определения потенциальных рисков в текстовом контенте, помогая вам создавать безопасные и соответствующие требованиям приложения.

<Info>
  Поддерживает модели модерации OpenAI и другие распространенные модели модерации контента с высокой точностью и быстрой реакцией.
</Info>

### Ключевые возможности

<CardGroup cols={2}>
  <Card title="Обнаружение нарушений" icon="ban">
    Выявляйте нарушения, такие как насилие, порнография и язык ненависти
  </Card>

  <Card title="Фильтр вредоносного контента" icon="triangle-alert">
    Обнаруживайте вредоносную информацию, такую как самоповреждение, домогательства и мошенничество
  </Card>

  <Card title="Многоязычная поддержка" icon="languages">
    Поддерживайте модерацию на китайском, английском и других языках
  </Card>

  <Card title="Детализированная классификация" icon="tags">
    Предоставляйте подробные категории нарушений и оценки уверенности
  </Card>
</CardGroup>

## Быстрый старт

### Базовый вызов API

Используйте Moderation API, чтобы определить, нарушает ли текстовый контент политики:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.moderations.create(
    model="omni-moderation-latest",
    input="This is a text to be checked"
)

result = response.results[0]
if result.flagged:
    print("⚠️ Violation detected")
    print(f"Categories: {result.categories}")
else:
    print("✅ Content is safe")
```

### Пример пакетного обнаружения

Определяйте несколько текстов одновременно:

```python theme={null}
texts = [
    "This is the first text",
    "This is the second text",
    "This is the third text"
]

response = client.moderations.create(
    model="omni-moderation-latest",
    input=texts
)

for i, result in enumerate(response.results):
    print(f"Text {i+1}: {'Flagged' if result.flagged else 'Safe'}")
```

## Категории модерации

### Поддерживаемые категории модерации OpenAI

| Категория                | Описание                                          | Примеры                                                           |
| ------------------------ | ------------------------------------------------- | ----------------------------------------------------------------- |
| `hate`                   | Речь ненависти                                    | Дискриминационный контент по признаку расы, пола, религии и т. д. |
| `hate/threatening`       | Угрожающая речь ненависти                         | Контент ненависти с насильственными угрозами                      |
| `harassment`             | Травля                                            | Оскорбления, насмешки, личные нападки                             |
| `harassment/threatening` | Угрожающая травля                                 | Травля с угрозами                                                 |
| `self-harm`              | Самоповреждение                                   | Поощрение или прославление самоповреждения                        |
| `self-harm/intent`       | Намерение самоповреждения                         | Контент, выражающий намерение причинить себе вред                 |
| `self-harm/instructions` | Инструкции по самоповреждению                     | Контент, предоставляющий способы самоповреждения                  |
| `sexual`                 | Сексуальный контент                               | Контент для взрослых, порнографические описания                   |
| `sexual/minors`          | Сексуальный контент с участием несовершеннолетних | Сексуальный контент с участием несовершеннолетних                 |
| `violence`               | Насилие                                           | Насильственные действия, кровавые сцены                           |
| `violence/graphic`       | Графическое насилие                               | Подробно описанное насилие, кровавые описания                     |

<Warning>
  Разные модели могут поддерживать разные категории модерации. Пожалуйста, выберите подходящую модель в соответствии с вашими потребностями.
</Warning>

## Структура ответа

### Формат ответа

```json theme={null}
{
  "id": "modr-xxxxx",
  "model": "omni-moderation-latest",
  "results": [
    {
      "flagged": true,
      "categories": {
        "hate": false,
        "hate/threatening": false,
        "harassment": false,
        "harassment/threatening": false,
        "self-harm": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        "sexual": false,
        "sexual/minors": false,
        "violence": true,
        "violence/graphic": false
      },
      "category_scores": {
        "hate": 0.0001,
        "hate/threatening": 0.0001,
        "harassment": 0.0002,
        "harassment/threatening": 0.0001,
        "self-harm": 0.0001,
        "self-harm/intent": 0.0001,
        "self-harm/instructions": 0.0001,
        "sexual": 0.0001,
        "sexual/minors": 0.0001,
        "violence": 0.9876,
        "violence/graphic": 0.1234
      }
    }
  ]
}
```

### Описание полей

<CardGroup cols={3}>
  <Card title="flagged" icon="flag">
    Логическое значение, указывающее, обнаружены ли нарушения
  </Card>

  <Card title="categories" icon="folder">
    Результаты бинарной оценки для каждой категории
  </Card>

  <Card title="category_scores" icon="chart-line">
    Оценки уверенности для каждой категории (0-1)
  </Card>
</CardGroup>

## Примеры интеграции

### Модерация контента в чате

Интегрируйте модерацию контента в чат-приложениях:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def moderate_message(user_message):
    """Moderate user message"""
    # 1. Moderate content first
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=user_message
    )

    result = moderation.results[0]

    # 2. If flagged, reject processing
    if result.flagged:
        violated_categories = [
            category for category, flagged in result.categories.items()
            if flagged
        ]
        return {
            "success": False,
            "error": f"Violations detected: {', '.join(violated_categories)}",
            "message": "Your message contains inappropriate content. Please revise and retry."
        }

    # 3. Content is safe, continue processing
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    return {
        "success": True,
        "reply": response.choices[0].message.content
    }

# Usage example
user_input = "Help me write an article about artificial intelligence"
result = moderate_message(user_input)

if result["success"]:
    print(result["reply"])
else:
    print(result["message"])
```

### Фильтрация UGC (контента, созданного пользователями)

Фильтруйте пользовательский контент на форумах, в комментариях и т. д.:

```python theme={null}
def review_ugc(content):
    """Review user-generated content"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=content
    )

    result = moderation.results[0]

    if not result.flagged:
        return {"status": "approved", "action": "Publish"}

    # Analyze violation severity
    max_score = max(result.category_scores.values())

    if max_score > 0.9:
        return {"status": "rejected", "action": "Reject"}
    elif max_score > 0.7:
        return {"status": "pending", "action": "Manual Review"}
    else:
        return {"status": "approved_with_warning", "action": "Publish with Flag"}

# Usage example
ugc_content = "This is a user comment..."
review_result = review_ugc(ugc_content)
print(f"Review result: {review_result['action']}")
```

### Модерация контента, созданного ИИ

Вторичная модерация для контента, созданного ИИ:

```python theme={null}
def generate_safe_content(prompt):
    """Generate and moderate content"""
    # 1. Moderate user input first
    input_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=prompt
    )

    if input_moderation.results[0].flagged:
        return "Your request contains inappropriate content and cannot be processed"

    # 2. Generate content
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )

    generated_content = response.choices[0].message.content

    # 3. Moderate generated content
    output_moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=generated_content
    )

    if output_moderation.results[0].flagged:
        return "Generated content does not meet safety standards and has been filtered"

    return generated_content

# Usage example
result = generate_safe_content("Write a children's story")
print(result)
```

## Расширенное использование

### Настраиваемые пороги модерации

Настраивайте строгость модерации в зависимости от бизнес-потребностей:

```python theme={null}
def custom_moderation(text, threshold=0.5):
    """Custom moderation threshold"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # Use custom threshold for judgment
    flagged_categories = []
    for category, score in result.category_scores.items():
        if score > threshold:
            flagged_categories.append({
                "category": category,
                "score": score,
                "severity": "high" if score > 0.8 else "medium"
            })

    return {
        "flagged": len(flagged_categories) > 0,
        "violations": flagged_categories
    }

# Usage example
result = custom_moderation("This is test text", threshold=0.3)
if result["flagged"]:
    for violation in result["violations"]:
        print(f"{violation['category']}: {violation['score']:.2f} ({violation['severity']})")
```

### Журналирование модерации

Записывайте историю модерации для анализа и улучшения:

```python theme={null}
import json
from datetime import datetime

def moderate_with_logging(text, user_id=None):
    """Moderation with logging"""
    moderation = client.moderations.create(
        model="omni-moderation-latest",
        input=text
    )

    result = moderation.results[0]

    # Record moderation log
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "text_length": len(text),
        "flagged": result.flagged,
        "categories": {k: v for k, v in result.categories.items() if v},
        "max_score": max(result.category_scores.values())
    }

    # Save to log file
    with open("moderation_logs.jsonl", "a") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")

    return result.flagged

# Usage example
is_flagged = moderate_with_logging("Test text", user_id="user_123")
```

### Совместная модерация несколькими моделями

Объединяйте несколько моделей модерации для более высокой точности:

```python theme={null}
def multi_model_moderation(text):
    """Moderate using multiple models"""
    models = ["omni-moderation-latest", "text-moderation-stable"]
    results = []

    for model in models:
        try:
            moderation = client.moderations.create(
                model=model,
                input=text
            )
            results.append(moderation.results[0])
        except Exception as e:
            print(f"Model {model} call failed: {e}")

    # If any model flags as violation, consider it a violation
    flagged = any(r.flagged for r in results)

    return {
        "flagged": flagged,
        "model_count": len(results),
        "results": results
    }
```

## Лучшие практики

### 1. Двунаправленная модерация

<CardGroup cols={2}>
  <Card title="Модерация входных данных" icon="log-in">
    Модерируйте ввод пользователя, чтобы предотвратить вредоносные запросы
  </Card>

  <Card title="Модерация выходных данных" icon="log-out">
    Модерируйте контент, сгенерированный AI, чтобы обеспечить безопасный вывод
  </Card>
</CardGroup>

```python theme={null}
def safe_chat(user_message):
    """Chat with bidirectional moderation"""
    # Input moderation
    if moderate_text(user_message):
        return "Your message contains inappropriate content"

    # Generate reply
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_message}]
    )

    reply = response.choices[0].message.content

    # Output moderation
    if moderate_text(reply):
        return "AI-generated content did not pass safety review"

    return reply
```

### 2. Асинхронная модерация

Используйте асинхронную модерацию для сценариев без обработки в реальном времени, чтобы повысить производительность:

```python theme={null}
import asyncio
from openai import AsyncOpenAI

async_client = AsyncOpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

async def async_moderate(texts):
    """Asynchronous batch moderation"""
    tasks = [
        async_client.moderations.create(
            model="omni-moderation-latest",
            input=text
        )
        for text in texts
    ]

    results = await asyncio.gather(*tasks)
    return [r.results[0].flagged for r in results]

# Usage example
texts = ["Text 1", "Text 2", "Text 3"]
flagged_list = asyncio.run(async_moderate(texts))
```

### 3. Кэшируйте результаты модерации

Кэшируйте результаты модерации для одинакового контента, чтобы уменьшить число вызовов API:

```python theme={null}
import hashlib
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_moderate(text_hash):
    """Cache moderation results"""
    # Actual moderation logic
    pass

def moderate_with_cache(text):
    """Moderation with caching"""
    text_hash = hashlib.md5(text.encode()).hexdigest()
    return cached_moderate(text_hash)
```

### 4. Многоуровневая обработка

Применяйте разные действия в зависимости от степени нарушения:

```python theme={null}
def handle_moderation_result(text, result):
    """Tiered handling of moderation results"""
    if not result.flagged:
        return {"action": "allow", "message": "Content is safe"}

    max_score = max(result.category_scores.values())

    if max_score > 0.95:
        return {"action": "block", "message": "Severe violation, directly reject"}
    elif max_score > 0.8:
        return {"action": "review", "message": "Suspected violation, manual review"}
    elif max_score > 0.5:
        return {"action": "warn", "message": "Minor violation, warn user"}
    else:
        return {"action": "allow", "message": "Possible false positive, allow"}
```

## FAQ

### Поддерживает ли модерация китайский язык?

Да. OpenAI Moderation и другие основные модели модерации поддерживают модерацию китайского контента с точностью, сопоставимой с английским.

### Какова задержка модерации?

Обычно от 100 до 500 мс, в зависимости от:

* Длины текста
* Выбора модели
* Сетевых условий

### Как обрабатывать ложные срабатывания?

Рекомендуется многоуровневая стратегия:

1. Нарушения с высокой степенью уверенности: прямой отказ
2. Средняя степень уверенности: ручная проверка
3. Низкая степень уверенности: разрешить или предупредить

### Взимается ли плата за модерацию?

OpenAI Moderation API в настоящее время бесплатен. Другие модели могут взимать плату. Подробности см. в [Цены](/ru/pricing).

### Можно ли модераировать изображения и видео?

Текущий Moderation API в основном ориентирован на текстовый контент. Для модерации изображений и видео требуются специализированные мультимодальные модели модерации.

## Связанная документация

<CardGroup cols={2}>
  <Card title="Генерация текста" icon="messages-square" href="/ru/api-capabilities/text-generation">
    Документация API Chat Completions
  </Card>

  <Card title="Безопасность контента" icon="shield" href="/ru/faq/content-safety">
    Политики безопасности контента платформы
  </Card>

  <Card title="Тарифы" icon="dollar-sign" href="/ru/pricing">
    Сведения о тарифах API Moderation
  </Card>
</CardGroup>
