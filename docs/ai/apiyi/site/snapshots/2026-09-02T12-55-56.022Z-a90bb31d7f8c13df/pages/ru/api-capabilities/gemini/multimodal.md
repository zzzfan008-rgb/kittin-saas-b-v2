> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Мультимодальный ввод и выполнение кода в Gemini

> Передавайте изображения, аудио и видео встроенно в Gemini: ограничение в 20MB, управление затратами через media_resolution и изолированный Python через code_execution.

Нативный формат Gemini напрямую принимает изображения, аудио и видео для понимания и анализа, а также включает встроенный инструмент `code_execution`, который запускает Python в песочнице. Примеры ниже предполагают настройку клиента из [Нативные вызовы](/ru/api-capabilities/gemini/native).

<Warning>
  **Два жестких ограничения на канале APIYI**:

  1. **Files API не поддерживается** (`client.files.upload()` работает только на официальном эндпоинте Google) — медиа нужно передавать **inline**
  2. Размер inline-медиа ограничен **20MB на файл**; если больше, сначала сожмите его или извлеките кадры
</Warning>

## Понимание изображений

Передавайте PIL Image напрямую — SDK самостоятельно выполняет кодирование:

```python theme={null}
from google import genai
from PIL import Image

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

img = Image.open("photo.jpg")

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        "Describe this image in detail: key elements, colors, composition.",
        img
    ]
)
print(response.text)
```

Или явно передавайте байты с помощью `types.Part.from_bytes`:

```python theme={null}
from google.genai import types

with open("photo.jpg", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "What's in this image?"
    ]
)
```

## Понимание аудио

```python theme={null}
from google.genai import types

with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=audio_bytes, mime_type="audio/mp3"),
        "Transcribe this audio and summarize the main topics."
    ]
)
print(response.text)
```

## Понимание видео

```python theme={null}
from google.genai import types

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        "Summarize the main content and key information of this video."
    ]
)
print(response.text)
```

Видео токенизируется по каждому кадру плюс аудиодорожка — более длинные видео обходятся дороже. Больше сценариев для видео: [Понимание видео](/ru/api-capabilities/video-understanding).

## Контроль затрат с media\_resolution

Потребление token для медиа масштабируется в зависимости от разрешения. Для задач с «грубым просмотром» (классификация, проверка наличия) более низкое разрешение позволяет заметно экономить:

```python theme={null}
from google.genai import types

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=["What's the theme of this image?", img],
    config=types.GenerateContentConfig(
        media_resolution="MEDIA_RESOLUTION_LOW"  # LOW / MEDIUM / HIGH
    )
)
```

| Уровень  | Для чего подходит                                                  |
| -------- | ------------------------------------------------------------------ |
| `LOW`    | Классификация, грубое распознавание — самый дешевый вариант        |
| `MEDIUM` | Общее описание и понимание (сбалансированный вариант по умолчанию) |
| `HIGH`   | OCR, мелкий текст, задачи с высокой плотностью деталей             |

## Поддерживаемые форматы

| Тип         | Форматы        | Как передавать                  |
| ----------- | -------------- | ------------------------------- |
| Изображения | JPG, PNG, WebP | PIL Image или `Part.from_bytes` |
| Аудио       | MP3, WAV       | `Part.from_bytes`               |
| Видео       | MP4, MOV       | `Part.from_bytes`               |

Все — встроенно, максимум 20 МБ на файл.

## Выполнение кода

Объявите инструмент `code_execution`, и модель пишет Python-код, запускает его в песочнице и отвечает на основе результата — идеально подходит для вычислений и анализа данных:

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="""
Sales data: Product A 100 units × \$50, Product B 200 × \$30, Product C 150 × \$40.
Compute total revenue, average unit price, and each product's revenue share.
""",
    config={"tools": [{"code_execution": {}}]}
)

for part in response.candidates[0].content.parts:
    if getattr(part, "executable_code", None):
        print(f"[Code executed]\n{part.executable_code.code}")
    if getattr(part, "code_execution_result", None):
        print(f"[Result]\n{part.code_execution_result.output}")
    if getattr(part, "text", None):
        print(f"[Explanation]\n{part.text}")
```

<Info>
  Ограничения выполнения кода: только Python; у песочницы нет доступа к сети или файловой системе; время выполнения ограничено. Чтобы вызывать собственные внешние сервисы, используйте [Function Calling](/ru/api-capabilities/gemini/function-calling).
</Info>

## Связанные ссылки

* Эта группа: [Native Calls](/ru/api-capabilities/gemini/native) · [Тарификация кэширования](/ru/api-capabilities/gemini/prompt-caching) · [Function Calling](/ru/api-capabilities/gemini/function-calling)
* Варианты использования: [Понимание видео](/ru/api-capabilities/video-understanding) · [Понимание изображений](/ru/api-capabilities/vision-understanding)
* Официальная документация Google: `ai.google.dev/gemini-api/docs/vision`
