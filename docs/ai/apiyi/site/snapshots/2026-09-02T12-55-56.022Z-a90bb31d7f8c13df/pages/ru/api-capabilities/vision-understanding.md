> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API для понимания изображений (распознавания изображений)

> Используйте AI-модели для интеллектуального анализа и понимания изображений, поддерживающие распознавание объектов, описание сцены, извлечение текста и многое другое

APIYI предоставляет мощные возможности понимания изображений, поддерживая глубокий анализ и интерпретацию изображений с использованием различных продвинутых моделей AI. Благодаря унифицированному формату OpenAI API вы можете легко реализовать распознавание изображений, описание сцены, распознавание текста OCR и другие функции.

<Note>
  **🔍 Интеллектуальный визуальный анализ**
  Поддерживает различные визуальные задачи, включая распознавание объектов, понимание сцены, извлечение текста, анализ тональности и многое другое, позволяя AI по-настоящему «понимать» изображения.
</Note>

## 🌟 Основные возможности

* **🎯 Поддержка нескольких моделей**: Топовые мультимодальные модели, такие как Gemini 3, GPT-5 и серия Claude 4
* **📸 Гибкий ввод**: Поддерживает ссылки URL и изображения, закодированные в Base64
* **🌏 Оптимизация для китайского языка**: Полная поддержка понимания сцен на китайском языке и распознавания текста
* **⚡ Быстрый отклик**: Высокопроизводительный inference с результатами за секунды
* **💰 Контроль затрат**: Несколько вариантов моделей для разных бюджетных требований

## 📋 Поддерживаемые vision-модели

Ниже приведены актуальные основные рекомендации по мультимодальным моделям. ID моделей могут меняться с выходом новых релизов — всегда ориентируйтесь на консоль.

| Название модели                   | ID модели                | Особенности                                                  | Рекомендуемые сценарии                               |
| --------------------------------- | ------------------------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| **Gemini 3.1 Pro Предпросмотр** ⭐ | `gemini-3.1-pro-preview` | Наиболее сильное multimodal-рассуждение, богатая детализация | Сложный анализ изображений/сцен                      |
| **Gemini 3.5 Flash** 🔥           | `gemini-3.5-flash`       | Быстро и недорого, лучшее соотношение цены и качества        | Распознавание в реальном времени, пакетная обработка |
| **GPT-5.5** ⭐                     | `gpt-5.5`                | Сильное универсальное понимание vision, стабильность         | Общее понимание изображений                          |
| **Claude Opus 4.7**               | `claude-opus-4-7`        | Глубокое понимание, точные описания                          | Профессиональный анализ изображение+текст            |
| **Claude Sonnet 4.6**             | `claude-sonnet-4-6`      | Конкурирует с Opus, высокая экономическая эффективность      | Экономичное распознавание                            |
| **GPT-4o**                        | `gpt-4o`                 | Классическая multimodal-модель, зрелая и стабильная          | Общие сценарии                                       |
| **Gemini 2.5 Flash**              | `gemini-2.5-flash`       | Сверхбыстрая и дешёвая, GA-релиз                             | Простое распознавание в больших объёмах              |

<Info>
  **Большинство chat-моделей теперь поддерживают мультимодальный ввод изображений**: приведённая выше таблица содержит распространённые рекомендации, а не полный список. Основные модели, включая GPT-5, Gemini 3, серию Claude 4, Grok 4 и Kimi, принимают ввод изображений.

  * ⚠️ Однако **возможности различаются между поколениями одного и того же поставщика** — `deepseek-v4-pro`, `deepseek-v4-flash` и `glm-5.2` по-прежнему поддерживают только текст, а при передаче изображения возвращается `Model do not support image input`. Чтобы проверить конкретную модель, используйте строку «Input modalities» на её странице сведений; см. [Текст + изображение в одном API](/ru/faq/text-and-image-in-one-api)
  * 📚 Полный список моделей и сравнение возможностей: [Популярные модели (обновляется)](/ru/api-capabilities/model-info)
  * 🔗 Актуальный список моделей и тарифы: [Страница тарифов консоли APIYI](https://www.apiyi.com/account/pricing) (проверьте в консоли поддержку vision)
</Info>

## 🚀 Быстрый старт

### 1. Базовый пример - URL изображения

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gpt-5.5",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Please describe this image in detail"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result['choices'][0]['message']['content'])
```

### 2. Пример локального изображения - кодирование Base64

```python theme={null}
import base64
import requests

def image_to_base64(image_path):
    """Convert local image to base64 encoding"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Read local image
base64_image = image_to_base64("path/to/your/image.jpg")

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze all text content in this image"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 3. Продвинутый пример - Сравнение нескольких изображений

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please compare the differences between these two images:"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image1.jpg"}
                },
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image2.jpg"}
                }
            ]
        }
    ],
    "max_tokens": 1000
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 4. Пример cURL (командная строка)

**Метод с URL изображения**:

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.1-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Please describe this image in detail" },
          { "type": "image_url", "image_url": { "url": "https://example.com/image.jpg" } }
        ]
      }
    ]
  }'
```

**Метод с локальным изображением Base64** (закодируйте изображение в Base64, затем встроите его в тело запроса):

```bash theme={null}
# 1. Convert local image to base64 (macOS / Linux)
BASE64_IMAGE=$(base64 -i path/to/your/image.jpg | tr -d '\n')

# 2. Pass the image content via a data URI
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Analyze all text content in this image" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,'"$BASE64_IMAGE"'" } }
        ]
      }
    ]
  }'
```

<Tip>
  **Предпочитайте загрузку через Base64 для большей надежности**: при использовании метода с URL изображения сервер сначала должен скачать изображение в реальном времени — если хост изображения отвечает медленно или ограничивает доступ, загрузка не удастся. Base64 встраивает данные изображения напрямую в тело запроса, без зависимости от какой-либо внешней загрузки, поэтому этот способ более стабилен. Оба метода официально поддерживаются. Base64 примерно в 1.33 раза больше исходного изображения, поэтому перед кодированием стоит сжать большие изображения.
</Tip>

### 5. Распространенная ошибка: тайм-аут загрузки изображения по URL

При использовании метода URL изображения вы можете получить такую ошибку:

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

Это означает, что **сервер превысил время ожидания при загрузке изображения по URL** — это не связано ни с моделью, ни с вашим API key, ни с вашей квотой. Распространенные причины:

1. Сервер-источник изображения / origin server отвечает медленно или плохо доступен для некоторых сетевых регионов
2. Изображение слишком большое, и загрузка превышает лимит времени
3. У URL есть защита от hotlinking, требуется login, или это не public direct link

**Решения**:

* ✅ **Переключитесь на загрузку Base64 (data URI)** (рекомендуется, см. Пример 2 выше) — данные изображения отправляются напрямую в теле запроса, полностью обходя шаг загрузки, что является самым стабильным вариантом
* Используйте более быстрый direct image link с публичным доступом
* Сожмите изображение и повторите попытку

### 6. Распространенная ошибка: недопустимые данные Base64 (URL ошибочно помещен в поле Base64)

Если вы получаете ошибку 400, подобную приведенной ниже (здесь показана формулировка для серии Claude; у других серий моделей она немного отличается, но ключевой признак — `invalid base64 data`):

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  },
  "request_id": "req_011CczN..."
}
```

Обычно это означает, что **URL изображения был вставлен в слот данных Base64 внутри data URI**:

```json theme={null}
// ❌ Wrong: what follows base64, is an image link, not Base64-encoded data
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

Что бы ни шло после префикса `data:image/...;base64,`, должно быть **содержимым файла изображения, закодированным в Base64**, а не ссылкой на изображение. Способ через URL и способ через Base64 — это два взаимоисключающих способа передачи изображения — их нельзя смешивать. Частая причина: код клиента всегда проходит по пути конкатенации data URI, поэтому туда также попадают удаленные URL изображений.

**Правильное использование, для сравнения**:

```json theme={null}
// ✅ Image is a remote URL → pass the link directly, no prefix at all
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ Image is a local file / binary → Base64-encode it first, then build the data URI (see Example 2 above)
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **Самопроверка**: определяйте способ по источнику изображения еще до отправки — если строка начинается с `http`, используйте метод URL; иначе только кодируйте в Base64 и собирайте data URI. Кроме того, в корректной строке Base64 никогда не встречаются символы вроде `://` или `?` — если вы видите их после `base64,`, туда почти наверняка была сконкатенирована ссылка.
</Tip>

### 7. Распространенная ошибка: заявленный тип носителя не совпадает с фактическим форматом изображения

Если вы получаете ошибку 400, подобную следующей (ключевая сигнатура — `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`):

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: e87a35ed-..., ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

**Что это значит**: эта ошибка приходит от проверки входных данных во внешнем upstream-сервисе модели (`Bedrock Runtime: InvokeModel, ValidationException` в примере указывает, что запрос дошел до upstream-канала серии Claude и был отклонен на этапе проверки параметров). Сообщение следует понимать буквально:

* Ваш data URI **объявляет** изображение как PNG (`data:image/png;base64,...`)
* Но после декодирования Base64 upstream проверил заголовок файла (magic bytes) и обнаружил, что **фактическое содержимое — JPEG**
* Объявление и содержимое не совпадают → 400. Само кодирование Base64 корректно — проблема именно в MIME type в префиксе

**Распространенные причины**:

1. **MIME type определен по расширению файла, но расширение вводит в заблуждение** — файл называется `xxx.png`, но на самом деле это JPEG с переименованным расширением (так делают инструменты загрузки, чаты и инструменты для снимков экрана)
2. **`image/png` (или `image/jpeg`) жестко задан в коде клиента**, и для каждого изображения используется один и тот же префикс независимо от формата
3. Изображение прошло через конвейер обработки, который изменил его формат, но имя файла осталось прежним

**Исправление**: никогда не доверяйте расширению — определяйте реальный MIME type по magic bytes файла перед сборкой data URI:

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """Detect the real format from magic bytes so the media type always matches the content"""
    with open(image_path, "rb") as f:
        data = f.read()

    if data[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif data[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    elif data[:6] in (b"GIF87a", b"GIF89a"):
        mime = "image/gif"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        raise ValueError(f"Unrecognized image format: {image_path}")

    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
```

Или перекодируйте через PIL — это гарантирует, что объявление совпадет с содержимым за один шаг (и заодно позволит сжать файл и удалить необычные кадры на этом пути):

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(image_path):
    img = Image.open(image_path)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"
```

<Tip>
  **Самопроверка**: `file xxx.png` (командная строка macOS / Linux) за одну секунду показывает истинный формат файла; в Python то же самое делает `Image.open(path).format`. Серии моделей отличаются по строгости проверки media type — некоторые пропускают несовпадения, тогда как серия Claude (особенно через канал Bedrock) самая строгая. Пишите код так, чтобы объявление всегда совпадало с содержимым, и тогда вы будете защищены на любой модели.
</Tip>

<Warning>
  **Различия параметров серии GPT-5**: если вы заменяете примеры на модель серии GPT-5, например `gpt-5.5` / `gpt-5.4`, учтите, что:

  1. Используйте `max_completion_tokens` вместо `max_tokens`
  2. `temperature` поддерживает только `1` (оставьте его значением по умолчанию — не передавайте другие значения)
  3. Не передавайте параметр `top_p`

  Серии Gemini и Claude не имеют таких ограничений и нормально работают с `max_tokens`, `temperature` и т. д.
</Warning>

## 🎯 Распространенные сценарии использования

### 1. Распознавание и анализ продукта

```python theme={null}
prompt = """
Please analyze this product image, including:
1. Product type and brand
2. Main features and selling points
3. Suitable target audience
4. Suggested marketing copy
"""
```

### 2. Распознавание текста в документах с помощью OCR

```python theme={null}
prompt = """
Please extract all text content from the image and organize it in the original format.
If there are tables, please present them in Markdown table format.
"""
```

### 3. Помощь в анализе медицинских изображений

```python theme={null}
prompt = """
This is a medical imaging picture, please:
1. Describe basic image information (such as imaging type, body part, etc.)
2. Label visible anatomical structures
3. Note: For reference only, not for diagnostic purposes
"""
```

### 4. Анализ данных системы видеонаблюдения

```python theme={null}
prompt = """
Analyze the surveillance footage to identify:
1. Number of people and their positions in the scene
2. Any abnormal behavior
3. Environmental safety hazards
4. Timestamp information (if visible)
"""
```

## 💡 Лучшие практики

### Рекомендации по предварительной обработке изображений

1. **Поддержка форматов**: Распространенные форматы, такие как JPEG, PNG, GIF, WebP
2. **Ограничение размера**: Рекомендуемый размер одного изображения — менее 20MB
3. **Разрешение**: Изображения с более высоким разрешением обеспечивают лучшее распознавание
4. **Сжатие**: Умеренное сжатие для повышения скорости передачи

### Оптимизация prompt

```python theme={null}
# ❌ Not Recommended: Vague prompt
prompt = "What is this"

# ✅ Recommended: Specific and clear prompt
prompt = """
Please analyze this image from the following aspects:
1. Main Objects: Identify main objects or people in the image
2. Scene Environment: Describe the shooting location and environmental features
3. Color Composition: Analyze color scheme and composition characteristics
4. Emotional Atmosphere: Emotions or atmosphere conveyed by the image
5. Possible Uses: What scenarios this image is suitable for
"""
```

### Обработка ошибок

```python theme={null}
import requests
from requests.exceptions import RequestException

def analyze_image_with_retry(image_url, prompt, max_retries=3):
    """Image analysis function with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://api.apiyi.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-5.5",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }]
                },
                timeout=30
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print(f"Rate limited, waiting to retry... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Error: {response.status_code} - {response.text}")

        except RequestException as e:
            print(f"Request exception: {e}")

    return None
```

## 🔧 Расширенные возможности

### 1. Потоковый вывод

Для продолжительного анализа потоковый вывод обеспечивает более удобный пользовательский опыт:

```python theme={null}
payload = {
    "model": "gpt-5.5",
    "messages": [...],
    "stream": True
}

response = requests.post(url, headers=headers, json=payload, stream=True)
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### 2. Многоходовой диалог

Сохраняйте контекст для углубленного анализа:

```python theme={null}
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What animal is this?"},
            {"type": "image_url", "image_url": {"url": "animal.jpg"}}
        ]
    },
    {
        "role": "assistant",
        "content": "This is a Golden Retriever."
    },
    {
        "role": "user",
        "content": [{"type": "text", "text": "How old does it look? How is its health condition?"}]
    }
]
```

### 3. В сочетании с вызовом функций

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "save_image_analysis",
            "description": "Save image analysis results to database",
            "parameters": {
                "type": "object",
                "properties": {
                    "objects": {"type": "array", "items": {"type": "string"}},
                    "scene": {"type": "string"},
                    "text_content": {"type": "string"}
                }
            }
        }
    }
]

payload = {
    "model": "gpt-5.5",
    "messages": messages,
    "tools": tools,
    "tool_choice": "auto"
}
```

## 📊 Сравнение производительности

| Модель                 | Скорость отклика | Точность распознавания | Поддержка китайского языка | Цена |
| ---------------------- | ---------------- | ---------------------- | -------------------------- | ---- |
| Gemini 3.1 Pro Preview | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐⭐                      | \$\$ |
| Gemini 3.5 Flash       | ⭐⭐⭐⭐⭐            | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐                       | \$   |
| GPT-5.5                | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐⭐                      | \$\$ |
| Claude Sonnet 4.6      | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐                       | \$\$ |
| Gemini 2.5 Flash       | ⭐⭐⭐⭐⭐            | ⭐⭐⭐⭐                   | ⭐⭐⭐⭐                       | \$   |

## 🚨 Важные примечания

1. **Защита конфиденциальности**: Не загружайте изображения, содержащие конфиденциальную информацию
2. **Соответствующее использование**: Соблюдайте применимые законы и нормативные требования, не используйте для незаконных целей
3. **Проверка результатов**: Результаты анализа ИИ предназначены только для справки, важные решения требуют ручной проверки
4. **Контроль затрат**: Разумно выбирайте модели, чтобы избежать лишних расходов

## 🔗 Связанные ресурсы

* [Полные примеры кода](https://github.com/apiyi-api/ai-api-code-samples/tree/main/Vision-API-OpenAI)
* [Информация о тарифах API](https://api.apiyi.com/account/pricing)

<Note>
  💡 **Совет**: Сначала протестируйте на экономичных моделях, таких как Gemini 3.5 Flash или Gemini 2.5 Flash, затем переключитесь на продвинутые модели, такие как Gemini 3.1 Pro или GPT-5.5, для рабочей среды, когда вы убедитесь в качестве. Чтобы узнать о других доступных моделях, см. [Популярные модели](/ru/api-capabilities/model-info) или [список моделей в консоли](https://www.apiyi.com/account/pricing).
</Note>
