> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство разработчика по серии Nano Banana

> Полное руководство по выбору модели, тарификации, эндпоинтам, форматам разработки и часто задаваемым вопросам для серии Nano Banana (Pro / 2 / 2 Lite / Gen 1), которое поможет разработчикам начать работу с API генерации изображений Gemini.

## Карточки моделей

| Модель                             | Официальный ID модели            | Тарификация                                                                                                                         | Примечания                               |
| ---------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Nano Banana Pro**                | `gemini-3-pro-image-preview`     | Фиксированная оплата за запрос **\$0.09/req** (прибл. ¥0.63; прибл. ¥0.55 после промоакций на пополнение)                           | Наивысшее качество                       |
| **Nano Banana 2**                  | `gemini-3.1-flash-image-preview` | Оплата за запрос **\$0.055/req** (рекомендуется для вывода 4K); либо динамическая тарификация на основе token, 2K прибл. **\$0.04** | Лучшее соотношение цены и качества       |
| **Nano Banana 2 Lite**             | `gemini-3.1-flash-lite-image`    | Фиксированная оплата за запрос **\$0.025/req**; либо тарификация на основе token прибл. **\$0.018/req** (40% от официальной цены)   | Самое быстрое и самое дешёвое, только 1K |
| **Nano Banana** (первое поколение) | `gemini-2.5-flash-image`         | Фиксированная оплата за запрос **\$0.02/req**                                                                                       | Самое дешёвое                            |

<Info>
  Для полного сравнения цен, а также различий между оплатой за запрос и тарификацией на основе token, и рекомендаций по выбору token см. [Тарификация серии Nano Banana](/ru/api-capabilities/nano-banana-pricing).
</Info>

### Управление размером

* **Сохраняйте соотношение сторон исходного изображения**: просто опустите `aspectRatio`; в сценариях редактирования с несколькими изображениями приоритет имеет **размер последнего изображения**
* **Разрешение `imageSize`**: поддерживает `1K` / `2K` / `4K`
  * Nano Banana (Gen 1) **поддерживает только 1K**
  * Nano Banana 2 **добавляет 512px**
  * Nano Banana 2 Lite **поддерживает только 1K** (без 2K/4K/512px)

<Warning>
  При использовании одного и того же кода для вызова `gemini-2.5-flash-image` первого поколения вы **должны удалить параметр `imageSize`** (он не поддерживает `2K` / `4K`), иначе вызов завершится ошибкой.
</Warning>

## Как интегрировать

### Официальная документация

* Официальная документация Google: `ai.google.dev/gemini-api/docs/image-generation`
* Чтобы интегрироваться с APIYI, просто замените **URL запроса + KEY на APIYI**; все остальные параметры идентичны официальным

### Проверка официального статуса (диагностика проблем на стороне upstream)

Серия Nano Banana работает поверх AIStudio / Gemini API от Google. В редких случаях **размытый результат или сбой вывода 2K / 4K** может быть проблемой на стороне **Google**, а не на уровне интеграции — вы можете проверить официальную страницу статуса Google (скопируйте ссылку и откройте её сами): `aistudio.google.com/status`.

Например, 19 июня 2026 года на этой странице было указано «Проблемы с Nano Banana»: у Nano Banana 2 / Pro в Gemini API и AI Studio возникали проблемы при разрешении 2K или 4K. Когда вы видите похожие симптомы, сначала сравните их с официальной страницей статуса, чтобы быстро определить, не является ли это сбоем у upstream.

<Info>
  APIYI использует серию Nano Banana через **двойные каналы AIStudio + Vertex** для отказоустойчивости: когда на одном официальном канале возникают проблемы, другой может взять на себя обслуживание, чтобы сервис оставался доступным.
</Info>

### Поддержка эндпоинтов

* **Рекомендуемый эндпоинт** (нативный Gemini): `https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
* Поддерживает вызовы в **режиме, совместимом с OpenAI** (примечание: **загрузка через URL не поддерживается**, используйте вместо этого Base64)
* **Не поддерживает** `/v1/image/generations`

### Формат разработки (рекомендуется по умолчанию)

* **\[Рекомендуется] Используйте формат нативного эндпоинта Google**
* Изображения: **загружайте как Base64, скачивайте и размещайте у себя заново**
* Способ вызова: **синхронные многопоточные вызовы**; асинхронные вызовы пока не поддерживаются

## Требования к входным изображениям

* **Одно изображение не может превышать 7MB** (правило Google); если импорт выполняется через Google Cloud Storage, лимит на каждый файл составляет 30MB
* **До 14 изображений на prompt**
* **Поддерживаемые типы MIME**: `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif` (формат `jpg` уже поддерживается APIYI)
* **Увеличение размера при кодировании в Base64**: преобразование изображения в Base64 увеличивает его размер примерно на **33.3%** (изображение размером 7MB становится примерно 9.3MB)
* **Лимит APIYI**: общий объем изображений, загруженных в одном запросе, должен быть **менее 100MB** — все вызовы являются синхронными, а слишком большие payload могут вызвать резкий рост потребления памяти

<Frame caption="Google official technical specs: inline / console upload per-file limit is 7MB, supporting png/jpeg/webp/heic/heif">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-image-size-limit.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=fc422e34e493a907363115118f715690" alt="Официальная таблица технических характеристик Google Gemini 3 Pro Image: лимит на одно изображение — 7MB, до 14 изображений на prompt, поддерживаемые соотношения сторон и типы MIME" width="1400" height="701" data-path="images/nano-banana-image-size-limit.png" />
</Frame>

<Frame caption="Base64 encoding increases size by about 33.3%: a 7MB image is roughly equal to 9.3MB">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-base64-size.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=dffe216ee6e97c2661ce816eb5408a22" alt="Расчет размера Base64: исходное изображение 7MB после кодирования с коэффициентом 4/3 составляет примерно 9.33MB" width="1448" height="984" data-path="images/nano-banana-base64-size.png" />
</Frame>

**Лучшая практика**: применяйте **без потерь** сжатие к изображениям перед отправкой в API, чтобы избежать слишком больших разрешений, замедляющих выполнение запросов.

Ссылка на официальную спецификацию Google (пожалуйста, скопируйте и перейдите по ней самостоятельно): `docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image`

## Ввод изображений по URL

Помимо Base64, **нативный endpoint Gemini** также поддерживает передачу URL изображений (image hosts / OSS-адресов) напрямую через `fileData.fileUri`, устраняя необходимость локального кодирования.

<Warning>
  **Загрузка по URL предъявляет строгие требования к image hosts и OSS-адресам**: если адрес не находится на глобальном CDN (например, Tencent Cloud Object Storage по умолчанию использует CDN только для Китая), серверам Google, скорее всего, не удастся получить доступ к изображению, из-за чего запрос завершится ошибкой (типичный симптом: **изображение не упоминается** в выводе).

  **Если возможно, отдавайте предпочтение загрузке через Base64 для большей стабильности** — с точки зрения платформы, это самый отлаженный и наиболее надежный путь.
</Warning>

<Info>
  Загрузка по URL работает только в **нативном endpoint Gemini**; **режим, совместимый с OpenAI, не поддерживает загрузку по URL** и требует Base64.
</Info>

### Пример Curl (fileUri)

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### Пример Python (fileUri)

```python theme={null}
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini 3 Pro Image - Image editing (minimal file_uri version)
Purpose: only for a quick check that the endpoint works
"""

import requests
import base64
import json
from pathlib import Path
from datetime import datetime

# ============================================================================
# Configuration
# ============================================================================

API_KEY = "sk-"
API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

# Image URL
IMAGE_URL = "https://raw.githubusercontent.com/apiyi-api/ai-pics/refs/heads/main/1762260696217_dd0352c1f9604540.png"
IMAGE_MIME_TYPE = "image/png"

# Edit instructions
EDIT_PROMPT = "Change the person's clothes to a blue jacket and hair to a purple gradient; keep pose, gaze direction, and other structural features unchanged."
SYSTEM_PROMPT = "You are a professional expert in image description and generation. Your task is to produce high-quality image prompts with rich detail and a clear artistic style, or to make accurate, creative edits to existing images, based on the user's request."

# Output parameters
ASPECT_RATIO = "9:16"
RESOLUTION = "4K"
MAX_OUTPUT_TOKENS = 8000
OUTPUT_FILE = f"minimal_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

# ============================================================================
# Core
# ============================================================================

def main():
    print("=" * 60)
    print("Testing file_uri endpoint")
    print("=" * 60)
    print(f"Image URL: {IMAGE_URL[:80]}...")
    print(f"Edit prompt: {EDIT_PROMPT}")
    print(f"Output params: {RESOLUTION}, {ASPECT_RATIO}")
    print("-" * 60)

    # Build the request body
    # Note: fileData, mimeType, fileUri must be in camelCase
    payload = {
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "imageConfig": {
                "imageSize": RESOLUTION,
                "aspectRatio": ASPECT_RATIO
            },
            "maxOutputTokens": MAX_OUTPUT_TOKENS
        },
        "contents": [
            {
                "role": "model",
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            {
                "role": "user",
                "parts": [
                    {
                        "fileData": {           # camelCase: fileData (not file_data)
                            "mimeType": IMAGE_MIME_TYPE,  # camelCase: mimeType
                            "fileUri": IMAGE_URL          # camelCase: fileUri
                        }
                    },
                    {"text": EDIT_PROMPT}
                ]
            }
        ]
    }

    # Send the request
    print("\nSending request...")
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=300
        )

        print(f"Response status: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return

        # Parse the response
        data = response.json()
        print("✅ Response received")

        # Save full response for debugging
        with open(OUTPUT_FILE + ".response.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"📄 Response saved: {OUTPUT_FILE}.response.json")

        # Extract and print text
        parts = data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "text" in part:
                print(f"\n💬 Text response: {part['text']}")

        # Save image
        for part in parts:
            if "inlineData" in part or "inline_data" in part:
                image_data = part.get("inlineData", part.get("inline_data", {})).get("data")
                if image_data:
                    image_bytes = base64.b64decode(image_data)
                    with open(OUTPUT_FILE, "wb") as f:
                        f.write(image_bytes)
                    print(f"\n✅ Image saved: {OUTPUT_FILE}")
                    print(f"📦 File size: {len(image_bytes) / 1024:.1f} KB")
                    print(f"🔗 File path: {Path(OUTPUT_FILE).resolve()}")
                    return

        print("⚠️  No image data found in the response")

    except requests.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
    print("\n" + "=" * 60)
    print("Test finished")
    print("=" * 60)
```

<Tip>
  `fileData`, `mimeType` и `fileUri` должны быть в **camelCase** (а не `file_data` / `file_uri`); иначе параметры будут проигнорированы, и изображение не будет связано.
</Tip>

## Основы тарификации (Важно)

* **Длительность синхронного вызова**: Pro / 2 при 4K требуют разумного времени генерации примерно **30–150s**
* **Отключение при тайм-ауте всё равно влечёт начисление платы**: например, если генерация занимает 120s, но клиент задаёт тайм-аут 100s и отключается, с вас всё равно взимается плата
* **429 / 503 не тарифицируются**: за неудачные запросы плата не взимается (мы стараемся не заставлять клиентов ждать или оставаться без изображения)
* **Отказы из-за политики безопасности контента всё равно влекут начисление платы**: когда во входных данных клиента есть проблемы с безопасностью контента и Google отказывает в генерации изображения, за **код статуса 200** всё равно взимается плата — см. обработку ошибок и план гарантии ниже

## Google Search grounding is charged on top of the per-call price

Pro supports the `googleSearch` tool (grounding triggered in 3/3 test runs, returning full `groundingMetadata`), useful for weather cards, stock charts, and anything else that needs live information.

**But the search call fee is added on top of the \$0.09 per-call price, not included in it**:

| Scenario                         | Charge per call                |
| -------------------------------- | ------------------------------ |
| Ordinary generation (no tools)   | \$0.09                         |
| With search, model ran 1 query   | \$0.09 + \$0.014 = **\$0.104** |
| With search, model ran 2 queries | \$0.09 + \$0.028 = **\$0.118** |

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "A weather card poster for Tokyo today" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

<Warning>
  **The model decides how many searches to run; you cannot set it in advance.** In testing, a single image request issued 1–3 queries on its own, so once this tool is enabled the per-call cost becomes a range (\$0.104–\$0.132) rather than a fixed \$0.09. Budget against the upper bound.
</Warning>

<Note>
  **Image Search grounding (`searchTypes.imageSearch`) does not work on Pro** — 0/2 runs triggered it, and `imageSearchQueries` never appeared in `groundingMetadata`. It is exclusive to Nano Banana 2 (`gemini-3.1-flash-image`); see [Nano Banana 2 · Three parameters that affect billing](/ru/api-capabilities/nano-banana-2-image/overview#three-parameters-that-affect-billing).
</Note>

## thinkingLevel не влияет на Pro — не копируйте его из NB2

`generationConfig.thinkingConfig.thinkingLevel` предназначен исключительно для серии Nano Banana 2. Передача `high` в Pro:

* **Не вызывает ошибку** — запрос нормально возвращает 200
* **Но не влияет**: измеренные значения `thoughtsTokenCount` находились в диапазоне 108–156, полностью перекрывая диапазон 130–159, наблюдаемый без параметра
* Рассуждение в Pro всегда включено и не подлежит настройке, как прямо указано в документации Google

Кроме того, **Pro тарифицируется по фиксированной ставке за каждый вызов, поэтому рассуждение никогда не попадает в счет** — настройка этого параметра в Pro не дает ни эффекта, ни экономического смысла. Чтобы управлять накладными расходами на рассуждение, используйте вместо этого тарификацию по потреблению в Nano Banana 2.

## Настройки таймаута (Важно)

Генерация изображений 4K занимает больше времени в целом, включая такие этапы, как **загрузка изображения, обработка API и скачивание изображения Base64** (наш backend выставляет тарификацию по **времени обработки API**). В обычных условиях 4K занимает около **50s** (без учета polling), но если клиент задаст timeout слишком коротким, он **разорвёт соединение преждевременно** до завершения генерации и вернёт ошибку:

```text theme={null}
API Connection Error: HTTPSConnectionPool(host='api.apiyi.com', port=443): Read timed out. (read timeout=120)
```

<Frame caption="Call logs: time-to-first-byte for 4K generation is about 43–61s, so the default 120s timeout is too tight">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-timeout-error.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=79eb88c65cd4ff91caa57e1402658b81" alt="Журналы вызовов: time-to-first-byte для генерации gemini-3-pro 4K составляет от 43 до 61 секунд" width="1400" height="837" data-path="images/nano-banana-timeout-error.png" />
</Frame>

Для большей безопасности рекомендуем задавать timeout в зависимости от разрешения:

```python theme={null}
timeout = {
    "1K": 300,  # 5 minutes - quick preview
    "2K": 300,  # 5 minutes - recommended
    "4K": 600,  # 10 minutes - ultra HD
}
```

## Многоходовое разговорное редактирование (нативный режим поддерживает это; reverse-модели — нет)

Серия Nano Banana использует **нативный формат Gemini** и поддерживает **настоящее многоходовое разговорное редактирование**: добавляйте сгенерированное изображение каждого хода обратно в `contents` как **`role: "model"` `inlineData`**, затем отправляйте следующую инструкцию пользователя. Модель выполняет правки на основе **полной истории разговора** и **накапливает изменения** (например, сначала измените цвет дивана, затем добавьте аксессуар — предыдущее изменение сохранится).

Это принципиально отличается от «reverse» image models — разберитесь в этом до интеграции:

| Аспект                                     | Nano Banana (нативный Gemini)                                                                        | Reverse model (например, `gpt-image-2-all`)                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Эндпоинт                                   | `/v1beta/...:generateContent`                                                                        | `/v1/chat/completions` (в стиле чата)                                                  |
| Механизм многоходовости                    | ✅ **Настоящий разговорный**: добавляйте `role:model` изображений в `contents`; модель читает историю | ❌ Состояние разговора отсутствует: изображения в истории `assistant` **игнорируются**  |
| Накопление между ходами                    | ✅ Поддерживается (красный диван → добавить шляпу, диван остаётся красным)                            | ⚠️ Только повторная подача, правки в один шаг                                          |
| Как отредактировать предыдущее изображение | Добавьте последнее полученное изображение как изображение с ролью `model` в историю разговора        | Передайте URL предыдущего изображения как reference в **новом сообщении пользователя** |

<Info>
  Проверено: повторное добавление предыдущего изображения как хода с ролью `model` позволяет Nano Banana 2 (`gemini-3.1-flash-image-preview`) корректно продолжать редактирование и накапливать изменения; reverse model читает только reference image из **последнего сообщения пользователя**, поэтому сохранение истории разговора там не работает для многоходового сценария.
</Info>

Минимальный пример (добавляйте каждый результат обратно в тот же `contents`):

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"imageSize": "2K"}}

contents = []  # keep one running conversation history

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # key: backfill the output image
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))

turn("Generate an orange cat sitting on a blue sofa, simple line-art style", "step1.png")
turn("Make the sofa red; keep the cat and composition unchanged", "step2.png")   # edits the previous image
turn("Put a small yellow hat on the cat; keep everything else the same", "step3.png")  # accumulates; red sofa kept
```

<Tip>
  Полные подробности (подходы history-backfill и re-feed, а также запуск многоходового сценария с существующего изображения) приведены в [Image Editing API · Многоходовое разговорное редактирование](/ru/api-capabilities/nano-banana-2-image/image-edit#multi-turn-conversational-editing).
</Tip>

## Всегда перебирайте parts, чтобы получить изображение — никогда не индексируйте его

`parts` — это **неоднородный массив**: он может содержать только сегмент изображения или чередовать текстовые и сегменты изображения, и **ни длина, ни порядок не гарантируются**. Жёстко заданный доступ вроде `parts[0]` / `parts[1]` поэтому наверняка будет периодически приводить к сбоям.

В ходе тестирования было замечено три варианта структуры:

| структура parts       | Длина | Индекс изображения |
| --------------------- | ----- | ------------------ |
| `inlineData`          | 1     | `0`                |
| `text` + `inlineData` | 2     | **`1`**            |
| `inlineData` + `text` | 2     | **`0`**            |

Текстовый сегмент может появиться по нескольким причинам: если включить `TEXT` в `responseModalities`, или если prompt просит модель объяснить саму себя, модель возвращает текст вместе с изображением — и то, окажется ли этот текст до изображения или после него, тоже не фиксировано. **Поэтому индекс, на котором находится изображение, не является постоянным**, и один и тот же код может получать разные структуры в разных запросах.

<Warning>
  Два шаблона с жёстко заданным индексом **взаимодополняют** друг друга: изображение всегда оказывается либо на `[0]`, либо на `[1]`, так что какой бы вариант вы ни выбрали, часть запросов будет возвращаться без изображения. **Переключение между `[0]` и `[1]` ничего не исправляет** — стабильным является только выбор по форме поля.
</Warning>

Правильный подход — **выбирать по форме поля**, а не по позиции. Обратите внимание, что нужно брать **последний** `inlineData`, а не первый — сложные задачи возвращают несколько изображений, и последнее является финальной версией (см. следующий раздел):

```python theme={null}
cand = (resp.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []      # handles parts=null
images = [p["inlineData"] for p in parts if "inlineData" in p]
if not images:
    raise RuntimeError(f"No image returned, finishReason={cand.get('finishReason')}")

final = images[-1]                                 # last one is the final version
image_bytes = base64.b64decode(final["data"])
mime = final["mimeType"]                           # trust the response; don't hardcode image/png
```

```javascript theme={null}
const parts = resp?.candidates?.[0]?.content?.parts ?? [];
const images = parts.filter((p) => p.inlineData?.data);   // ✅ never write parts[1]
if (images.length === 0) throw new Error("Gemini returned no image data");
const { data, mimeType } = images[images.length - 1].inlineData;   // last is the final version
```

<Tip>
  **Усиление надёжности**: объявление `responseModalities: ["IMAGE"]` в `generationConfig` означает, что вы хотите только изображение, что уменьшает количество лишних текстовых сегментов.

  Это усиление надёжности, **а не замена** — фильтрация всё равно должна идти первой. Обратное неверно: передача `["TEXT","IMAGE"]` не **гарантирует** текстовый сегмент; модель всё равно может вернуть только изображение.
</Tip>

<Warning>
  **Не задавайте `mimeType` жёстко тоже.** Формат изображения в ответе непостоянен — встречаются и `image/png`, и `image/jpeg`. Запись файлов с фиксированным расширением `.png` приводит к файлам, у которых расширение противоречит их содержимому — **всегда позволяйте `mimeType` ответа определять расширение**.
</Warning>

## Почему ответы иногда содержат несколько изображений

При вызове `gemini-3-pro-image` вы иногда можете увидеть **несколько частей изображения в одном ответе (в ходе тестирования наблюдалось 2–10)**, что соответствует периодически возникающим записям об output-token 6000+ (и даже пятизначным значениям) в ваших логах. Это не аномалия: в официальной документации Google указано, что у image-моделей Gemini 3 «Thinking» включён по умолчанию (в API его нельзя отключить), модель создаёт промежуточные изображения для проверки композиции и логики, эти черновики появляются в `parts` вместе с финальной версией, а «последнее изображение внутри Thinking также является окончательно отрисованным изображением» (официальная документация: `ai.google.dev/gemini-api/docs/image-generation`). На основе наших тестов в июле 2026 года (нативный формат Google `generateContent`):

| Сценарий                                                                                                                                | Возвращаемых изображений                                           |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Чистый text-to-image                                                                                                                    | Всегда 1 (даже если в prompt явно указано «несколько изображений») |
| Простое редактирование изображения (добавление аксессуаров / смена фона / изменение стиля)                                              | Всегда 1                                                           |
| Сложное редактирование в стиле задачи (например, «лист персонажа с 4 ракурсами + смена одежды + белый фон» с несколькими ограничениями) | 2–10, стабильно воспроизводится                                    |

Срабатывание определяется **сложностью задачи в prompt**, а не самим «редактированием изображения». Несколько изображений по-прежнему находятся в **одном кандидате** (а не в нескольких кандидатах), и каждое из них — это полноценное изображение: это последовательные черновики одного и того же дизайна в процессе рассуждения (одна и та же композиция, немного разные детали), а **последняя часть — финальная версия**. Эти черновики возвращаются как обычные части изображения (с полем `thoughtSignature`, без флага `thought: true`); в документации Google сказано, что Thinking создаёт максимум два промежуточных изображения, но на сложных задачах мы наблюдали до 10.

**Влияние на тарификацию**: каждое изображение тарифицируется фиксированным количеством token (1120 token за изображение при разрешении 1K/2K, 2000 при 4K), поэтому output token растут строго линейно с количеством изображений. Периодическая запись 6000+ (вплоть до \~13,5k в крайних случаях) output-token в ваших логах — это просто ответ с 4–10 изображениями, **а не аномалия тарификации**.

**Рекомендуемый код для последующей обработки**:

```python theme={null}
parts = response["candidates"][0]["content"]["parts"] or []   # parts is null on safety refusals
images = [p["inlineData"]["data"] for p in parts if "inlineData" in p]

if images:
    final_image = images[-1]   # last one = final version
```

* **Всегда итерируйтесь по частям** — не предполагайте, что на каждый ответ приходится одно изображение; любая логика подсчёта или сохранения по изображениям должна опираться на фактическое количество частей
* **Берите последнее изображение, если нужно только одно**: более ранние черновики имеют незавершённые детали и немного более низкое качество, поэтому не выбирайте первое
* **Управление количеством изображений через prompt в основном неэффективно** (в тестировании инструкции вроде «выведи только одно изображение» игнорировались) — обрабатывайте это в коде
* Ответы с несколькими изображениями занимают 35–142 с (при разрешении 1K, дольше при большем числе изображений), заметно больше, чем ответы с одним изображением — сохраняйте рекомендации по тайм-ауту выше (≥ 5 минут)

<Tip>
  Полную разбивку полей usageMetadata (разницу между деталями и итогами, особенность подсчёта в ответах с отказом и многое другое) см. в [Поля Usage и объяснение вывода](/ru/api-capabilities/nano-banana-usage-metadata).
</Tip>

## Часто задаваемые вопросы

<CardGroup cols={2}>
  <Card title="Руководство по обработке ошибок" icon="triangle-alert" href="/ru/api-capabilities/gemini-image-error-handling">
    Три ключевых индикатора для диагностики неудачных генераций, политик модерации контента и дружественных стратегий составления prompt
  </Card>

  <Card title="Обязательные к прочтению распространённые вопросы разработчика" icon="circle-question-mark" href="/ru/faq/nano-banana-image-failure">
    Устранение неполадок при неудачных генерациях и ответы на распространённые вопросы
  </Card>

  <Card title="План гарантии при неудачной генерации" icon="shield-check" href="/ru/api-capabilities/nano-banana-pro-guarantee">
    Для сбоев, не вызванных вашим вводом, кредиты возмещаются в соответствии с количеством неудачных запросов
  </Card>
</CardGroup>

<AccordionGroup>
  <Accordion title="Почему я получаю connection reset by peer / write_response_body_failed (500)?">
    Полный текст ошибки выглядит так:

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    Это **обычно вызвано загрузкой изображений слишком большого размера — тело запроса становится слишком большим, и соединение обрывается**. Следуйте этим рекомендациям:

    * **Ограничьте количество изображений**: соблюдайте официальные правила (не более 14 изображений на prompt — см. официальную спецификацию выше).
    * **Ограничьте размер каждого изображения**: держите каждое изображение меньше 5MB — официальный лимит на одно изображение составляет 7MB, а кодирование base64 увеличивает размер примерно на 1/3, поэтому оставляйте запас.
    * **Сжимайте на frontend перед загрузкой**: сжимайте изображения на frontend (или через серверный relay) перед отправкой в API — обычная практика заключается в ограничении длинной стороны, конвертации в JPEG/WebP и настройке параметра качества.
    * **Переключитесь на ввод через URL**: нативный формат Gemini поддерживает передачу image URL через `fileData.fileUri`, полностью обходя слишком большие base64-тела запроса — см. [Ввод изображения по URL](#url-image-input) выше.
  </Accordion>
</AccordionGroup>

## Сценарии использования

* **Клиенты AI-чатов**: такие клиенты, как [Cherry Studio](/ru/scenarios/chat/cherry-studio), можно настроить для генерации изображений напрямую через APIYI
* **Проверка генерации**: быстро проверьте производительность модели в чат-клиенте или в консоли

## Дополнительные потребности

* **Хотите загружать изображения по URL?** Нативный эндпоинт Gemini поддерживает передачу URL изображения через `fileData.fileUri`; однако режим, совместимый с OpenAI, не поддерживает загрузку по URL, поэтому используйте Base64. См. примеры кода и оговорки в [Ввод изображения по URL](#url-image-input) выше.
* **Хотите напрямую получать URL для скачивания (вместо Base64)?** Используйте группу NB-OSS — см. [Группа Nano Banana OSS](/ru/api-capabilities/nano-banana-oss-group).
