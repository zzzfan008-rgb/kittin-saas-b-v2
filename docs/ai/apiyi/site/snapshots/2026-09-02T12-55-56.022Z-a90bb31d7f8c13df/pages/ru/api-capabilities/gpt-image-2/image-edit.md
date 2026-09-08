> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для редактирования изображений

> справочник API для редактирования изображений gpt-image-2 и live-тестирование — загрузите референсные изображения (до 16) + инструкции для редактирования одного изображения, слияния нескольких изображений или inpainting по маске

<Info>
  Интерактивный Playground справа поддерживает прямую локальную загрузку изображений. Заполните ваш API Key в **Authorization** (формат: `Bearer sk-xxx`), выберите файлы image / mask, заполните `prompt` и `model` и отправьте.
</Info>

<Tip>
  **Сценарий использования**: Эта страница предназначена для «редактирования / объединения / inpaint на основе одного или нескольких reference images». Формат запроса — `multipart/form-data`. Для чистой генерации изображений по тексту используйте [эндпоинт Text-to-Image](/ru/api-capabilities/gpt-image-2/text-to-image).
</Tip>

<Warning>
  **🖥️ Ограничение Browser Playground (важно)**

  Этот эндпоинт возвращает в ответе **сырую base64-строку** (обычно несколько МБ). Из-за ограничений рендеринга браузера Playground справа может показать `请求时发生错误: unable to complete request` после получения ответа — **запрос на самом деле успешно выполнен**; браузер просто не может отрисовать такую длинную base64-строку.

  **Рекомендуемый рабочий процесс** (подходит новичкам):

  * **Скопируйте приведённый ниже пример Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **записывает изображение в файл**.
  * Если вам всё же нужно использовать встроенный Playground в браузере, **используйте крошечное reference image (\< 50KB)**, установите `size` на самый низкий уровень (например, `1024x1024`) и задайте `quality` равным `low`.
</Warning>

<Warning>
  **⚠️ Ключевые отличия (при миграции с gpt-image-1.5)**

  * **Не передавайте `input_fidelity`** — `gpt-image-2` принудительно включает high-fidelity; при передаче возвращается 400
  * **Запросы на редактирование заметно имеют больше input tokens** — референсы преобразуются в множество tokens через тарификацию Vision; планируйте бюджет соответственно
  * **Объединение нескольких изображений: максимум 16** — повторяйте поле `image[]`; при количестве больше 16 возникает ошибка
</Warning>

<Warning>
  **📎 Порядок при объединении нескольких изображений имеет значение**

  Поле `image[]` принимает несколько reference images. **Порядок загрузки соответствует ссылкам «image 1 / image 2 / image 3» в prompt**. Ссылайтесь на них явно:

  > Поместите subject из image 1 в scene из image 2, используя цветовой стиль из image 3

  Ограничение для каждого файла: **не более 50MB каждый** (multipart file upload), форматы: `png` / `jpg` / `webp`; на практике сжимайте до **не более 1.5MB** перед загрузкой (см. ниже «Ограничения размера загрузки»).
</Warning>

## Примеры кода

### Python (OpenAI SDK · редактирование одного изображения)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.edit(
    model="gpt-image-2",
    image=open("photo.png", "rb"),
    prompt="Replace the background with a seaside sunset, preserve subject details",
    size="1536x1024",
    quality="high"
)

# b64_json is raw base64 (no prefix) — decode manually
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · объединение нескольких изображений)

```python theme={null}
resp = client.images.edit(
    model="gpt-image-2",
    image=[
        open("person.png", "rb"),
        open("scene.png", "rb"),
        open("style.png", "rb"),
    ],
    prompt="Place subject from image 1 into scene from image 2, using color style from image 3, keep lighting consistent",
    size="1536x1024",
    quality="high"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### cURL (объединение нескольких изображений)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=Place subject from image 1 into scene from image 2, using color style from image 3" \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "image[]=@person.png" \
  -F "image[]=@scene.png" \
  -F "image[]=@style.png"
```

### cURL (дорисовка по маске)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=Replace the sky with pink sunset clouds" \
  -F "size=1024x1024" \
  -F "quality=high" \
  -F "image[]=@photo.png" \
  -F "mask=@mask.png" \
  | jq -r '.data[0].b64_json' | base64 -d > photo_edited.png
```

### Node.js (Native fetch + FormData · объединение нескольких изображений)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2');
form.append('prompt', 'Place subject from image 1 into scene from image 2');
form.append('size', '1536x1024');
form.append('quality', 'high');
form.append('image[]', new Blob([fs.readFileSync('./person.png')]), 'person.png');
form.append('image[]', new Blob([fs.readFileSync('./scene.png')]), 'scene.png');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const { data } = await resp.json();
fs.writeFileSync('fused.png', Buffer.from(data[0].b64_json, 'base64'));
```

## Справочник параметров

| Поле                 | Тип  | Обязательно | По умолчанию | Описание                                                                                                                                                                                                                                                                   |
| -------------------- | ---- | ----------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | text | Да          | —            | Фиксировано: `gpt-image-2`                                                                                                                                                                                                                                                 |
| `prompt`             | text | Да          | —            | Инструкция по редактированию / слиянию                                                                                                                                                                                                                                     |
| `image[]`            | file | Да          | —            | Референсные изображения, можно повторять (**макс. 16**)                                                                                                                                                                                                                    |
| `mask`               | file | Нет         | —            | Изображение маски (применяется только к первому изображению, требуется альфа-канал)                                                                                                                                                                                        |
| `size`               | text | Нет         | `auto`       | Размер вывода, такой же, как у text-to-image                                                                                                                                                                                                                               |
| `quality`            | text | Нет         | `auto`       | `low` / `medium` / `high` / `auto`                                                                                                                                                                                                                                         |
| `output_format`      | text | Нет         | `png`        | `png` / `jpeg` / `webp`                                                                                                                                                                                                                                                    |
| `output_compression` | text | Нет         | —            | 0–100, только для `jpeg` / `webp`                                                                                                                                                                                                                                          |
| `background`         | text | Нет         | `auto`       | `transparent` / `opaque` / `auto`. При `transparent` `output_format` должен быть `png` или `webp`. Учтите, что прозрачность на эндпоинте редактирования — это **перерисовка**, а не точное вырезание — см. [FAQ по прозрачному фону](/ru/faq/image-transparent-background) |

<Warning>
  **Не передавайте устаревшие значения DALL·E `standard` / `hd` для `quality`.** Только четыре официальных enum-значения `low` / `medium` / `high` / `auto` принимаются. Устаревшие значения ведут себя непоследовательно в разных backend-каналах: иногда они сразу завершаются с 400 (`invalid_value`), а иногда молча игнорируются, и запрос выполняется на `auto` (непредсказуемая стоимость). Всегда явно передавайте одно из четырёх официальных значений.
</Warning>

## Ограничения на размер загрузки

| Пункт                                          | Лимит                  | Примечания                                                                                                                                                                                                                                       |
| ---------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Количество reference image                     | До **16**              | Повторите поле `image[]`                                                                                                                                                                                                                         |
| На одно изображение (загрузка файла multipart) | **Менее 50MB** каждое  | Форматы: `png` / `jpg` / `webp`                                                                                                                                                                                                                  |
| На одно изображение (base64 data URL)          | Длина поля \~**20MiB** | Это ограничение длины для URL/base64 **строкового поля** (схема `maxLength: 20971520`) — **не** то же самое, что и лимит 50MB для multipart; base64 увеличивает размер примерно на 1/3, поэтому исходные изображения держите **в пределах 15MB** |
| Файл mask                                      | **PNG до 4MB**         | Должен совпадать с размерами исходного изображения и содержать alpha-канал                                                                                                                                                                       |

<Warning>
  **Не заполняйте общий размер запроса до максимума**: хотя лимит на одно изображение составляет 50MB и можно загрузить до 16 изображений, несколько изображений почти у верхней границы делают тело одного запроса огромным и повышают вероятность сбоев шлюз / CDN / timeout. На практике **сжимайте каждое изображение до 1.5MB** (JPEG quality 80-90) — вероятность успеха и скорость генерации заметно повышаются, а качество результата не зависит от размера исходного файла.
</Warning>

## Требования к формату эталонного изображения и предварительная обработка

`/v1/images/edits` принимает только стандартные форматы **png / jpg / webp**. Если вы получаете эту ошибку 400:

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "type": "shell_api_error",
    "code": "invalid_image_file"
  }
}
```

эталонное изображение, скорее всего, **не является стандартным JPEG/PNG**. Самая частая ловушка — это **формат MPO** (Multi-Picture Object, многокадровый контейнер JPEG) из камер смартфонов: файлы `.jpg`, полученные прямо с телефонов серии Huawei Mate, содержат вложенный подкадр HDR gain-map и на самом деле являются MPO. Эти файлы начинаются с того же заголовка `FFD8` — **расширение и команда `file` оба сообщают JPEG** — поэтому их невозможно распознать визуально; определить это может только разбор с учетом кадров (например, Pillow). «изображение 1» в сообщении об ошибке относится к N-му эталонному изображению (нумерация с 1), поэтому используйте индекс, чтобы найти проблемный файл.

<Info>
  **Проверено в июле 2026**: файлы MPO завершались ошибкой 400 во всех 5/5 загрузках; те же изображения, перекодированные в стандартный JPEG/PNG, успешно проходили **при полном исходном разрешении 3072×4096** — проблема в формате, а не в размерах или объеме файла. Ошибка возвращается быстро (\~4s) на этапе проверки входных данных и **не тарифицируется**.
</Info>

**Обнаружение и исправление**: если `Image.open(f).format` возвращает `"MPO"`, файл нужно конвертировать. Один шаг повторного кодирования в вашем пайплайне загрузки также покрывает HEIC и другие форматы смартфонов:

```python theme={null}
from PIL import Image
import io

def normalize_image(path: str) -> bytes:
    """Convert phone photos (MPO/HDR multi-frame etc.) to standard JPEG that passes edits validation"""
    im = Image.open(path)
    im.load()                      # for MPO, keeps only the first (full-size) frame
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)   # or format="PNG"
    return out.getvalue()
```

<Tip>
  Если ваш продукт принимает фотографии, снятые пользователями (рендеры интерьеров, фотографии товаров и т. д.), выполняйте повторное кодирование **единообразно на стороне сервера** вместо отладки изображений по одному — HDR-фото со смартфонов будут продолжать появляться. Дополнительные советы по обработке входных данных: [Основы Image API и лучшие практики](/ru/api-capabilities/image-api-best-practices).
</Tip>

## Требования к Mask Inpainting

* **Тот же размер**, что и у оригинала, **формат PNG**, **меньше 4MB**
* **Обязательно наличие alpha channel**: прозрачные области (alpha=0) = область inpaint, непрозрачные = сохранять
* Маска применяется только к **первому** изображению
* Маска — это «мягкая подсказка»: модель может расширять или сужать область вокруг замаскированного региона

<Tip>
  **Итерация в несколько шагов**: передавайте предыдущий результат обратно как `image[]` следующего вызова с новой инструкцией для постепенной доработки. Каждый раунд тарифицируется отдельно по tokens — следите за совокупной стоимостью.
</Tip>

## Формат ответа

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 848,
        "input_tokens_details": {
            "image_tokens": 832,
            "text_tokens": 16
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 1044
    }
}
```

<Warning>
  `b64_json` — это **необработанный base64**, **без** префикса `data:image/...;base64,` — в отличие от `gpt-image-2-all`. Декодируйте его на стороне клиента, чтобы записать файл, или добавьте префикс для отображения в браузере.
</Warning>

<Info>
  `input_tokens` у запросов на редактирование обычно **значительно выше**, чем у генерации изображений по тексту при том же размере, поскольку опорные изображения тарифицируются по правилам тарификации Vision — точная сумма доступна напрямую в `usage.input_tokens_details.image_tokens` и учитывается отдельно от текстовой части (`text_tokens`). Объединение нескольких изображений увеличивает `image_tokens` **строго линейно** с каждым дополнительным опорным изображением (проверено в июле 2026: 4 × 1024² изображений = 4 × 1024 tokens) — см. [Как несколько входных изображений влияют на стоимость](/ru/api-capabilities/gpt-image-2/overview#how-multiple-input-images-affect-the-price-verified-july-2026) для таблицы измерений. См. [Как проверить фактическое количество token для каждого вызова](/ru/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call) на странице обзора для полной справки по полям.
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2 Image Edit API
  description: >
    OpenAI's flagship image generation model `gpt-image-2` — image edit
    endpoint.


    - Supports single-image edit, multi-image fusion (up to 16 reference
    images), mask inpainting

    - Request format: `multipart/form-data`

    - In prompt, use "image 1 / image 2 / image 3" to reference `image` upload
    order

    - **Reference images auto-enable high-fidelity** — **do not** pass
    `input_fidelity` (will error)

    - Edit requests have noticeably higher input tokens than text-to-image at
    the same size


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [APIYI Console](https://api.apiyi.com/token) to
    create a token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/edits:
    post:
      tags:
        - Image Edit
      summary: 'Image Edit: edit or fuse reference images by instruction'
      description: >
        Use `gpt-image-2` to edit, fuse, or inpaint images by text instruction.


        - At least one `image` required (max 16)

        - multipart file upload: each image under 50MB, formats: png/jpg/webp
        (base64 data URL is bound by a ~20MiB field-length limit — keep
        originals ≤ 15MB)

        - `mask` field (optional) must match the original image's size, be PNG
        and under 4MB, and have an alpha channel (transparent = inpaint area)

        - mask only applies to the first image

        - Do not pass `input_fidelity` (forced high-fidelity, will error if
        passed)
      operationId: editGptImage2Image
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
              mask:
                contentType: image/png
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (input_fidelity / background:transparent / size
            constraint violation, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Content moderation block
        '429':
          description: Rate limit or quota exceeded
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model name, fixed as gpt-image-2
          enum:
            - gpt-image-2
          default: gpt-image-2
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image, use 'image 1 / image 2 /
            image 3' to reference upload order
          example: >-
            Place subject from image 1 into scene from image 2, using color
            style from image 3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`, **max 16**) — upload order maps to
            image 1 / image 2 / ... in the prompt. multipart file upload: each
            under 50MB, formats: png/jpg/webp; compress to within 1.5MB in
            practice
          items:
            type: string
            format: binary
        mask:
          type: string
          format: binary
          description: >
            Mask image (optional, only applies to first image). Requirements:

            - Same size as original

            - PNG format, under 4MB

            - Must have alpha channel (alpha=0 = inpaint area, opaque =
            preserve)
        size:
          type: string
          description: >-
            Output size (same as text-to-image). Preset or constraint-satisfying
            custom size
          example: 1536x1024
          default: auto
        quality:
          type: string
          description: Quality tier
          enum:
            - auto
            - low
            - medium
            - high
          default: auto
        output_format:
          type: string
          description: Output format
          enum:
            - png
            - jpeg
            - webp
          default: png
        output_compression:
          type: integer
          description: Output compression (0–100), only effective for jpeg/webp
          minimum: 0
          maximum: 100
        background:
          type: string
          description: 'Background mode. auto or opaque. **Not supported**: transparent'
          enum:
            - auto
            - opaque
          default: auto
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '**Raw base64 string** (no data:image/...;base64, prefix)'
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call
          properties:
            input_tokens:
              type: integer
              example: 1280
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 7520
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````