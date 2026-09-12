> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по масковому inpainting

> Полное руководство по масковому inpainting в gpt-image-2 — основы альфа-канала, создание и проверка маски, примеры на Python/cURL/Node.js и устранение ошибок

<Info>
  Эта страница — практическое руководство по локализованному редактированию (inpainting) с `gpt-image-2` через `POST /v1/images/edits`, путем загрузки **изображение + маску + prompt**. Для полного справочника параметров и интерактивного Playground см. [Image Edit API Reference](/ru/api-capabilities/gpt-image-2/image-edit).
</Info>

## Основной принцип: альфа-канал определяет область редактирования

Запрос на локализованное редактирование состоит из трех частей:

```text theme={null}
original image
+ mask image
+ edit prompt
= fully edited image
```

Маска отмечает редактируемые области через канал alpha (прозрачности) PNG:

| Область маски          | Значение alpha | Эффект                                                       |
| ---------------------- | -------------: | ------------------------------------------------------------ |
| Полностью прозрачная   |              0 | Модель может редактировать                                   |
| Полностью непрозрачная |            255 | Сохранить оригинал максимально возможно                      |
| Полупрозрачная         |          1–254 | Переходная зона; не полагайтесь на нее как на точное правило |

<Warning>
  **Самая распространенная ошибка**: область редактирования определяет именно **альфа-канал**, а не черные или белые пиксели, которые вы видите.

  ```text theme={null}
  Transparent region = the area to modify
  Opaque region      = the area to keep unchanged
  ```

  PNG, который «выглядит черно-белым», но не имеет альфа-канала, завершится ошибкой `invalid_image_file`.
</Warning>

### Визуальный пример

Предположим, исходное изображение имеет размер 1024×1024:

```text theme={null}
┌──────────────────────────┐
│      Opaque region        │
│   keep original intact    │
│                          │
│      ┌──────────┐        │
│      │transparent│       │
│      │→ flowers  │       │
│      └──────────┘        │
└──────────────────────────┘
```

С таким prompt:

```text theme={null}
Replace the cup in the transparent region with a bouquet of white tulips.
Keep everything else unchanged, preserving the original lighting,
camera angle, and photographic style.
```

## Маска — это не жесткая обрезка

Маски GPT Image — это **не** абсолютные ограничения на уровне пикселей, как выделения в Photoshop. Официально редактирование маски по-прежнему остается **prompt-guided editing**: модель использует маску как ориентир, но не гарантирует строгое соблюдение каждой границы пикселя.

Поэтому вы можете увидеть:

* Незначительные изменения теней вне маски
* Выход границ объекта за пределы маски
* Согласованные изменения освещения и отражений
* Небольшую перерисовку фона
* Эффекты перехода у границ маски

Это хорошо подходит для естественного смешивания, но не годится, когда требуется пиксель-в-пиксельное сохранение (см. «Строгое сохранение содержимого вне маски» ниже).

### Повышение стабильности редактирования

Не пишите просто: «измените это на красную рубашку». Вместо этого пишите так:

```text theme={null}
Only modify the transparent region of the mask. Replace the person's top
with a plain red crew-neck cotton T-shirt. Keep the face, hair, body pose,
arms, background, composition, camera angle, lighting direction, and image
dimensions unchanged. The new shirt must fit the body naturally and
preserve the original photographic realism.
```

Практические советы:

1. Сделайте маску немного больше, чем границы целевого объекта
2. Не закрывайте только центр объекта — включите края, тени и отражения
3. Явно укажите, что должно остаться без изменений
4. Если область редактирования слишком мала, увеличьте маску
5. Когда требуется абсолютное сохранение, выполните финальное покадровое совмещение самостоятельно (см. ниже)

## Маска или не маска? Компромиссы против редактирования только prompt

Частый вопрос: **современный AI уже может «редактировать именно то, на что вы указываете» на обычном языке — зачем вообще делать маску?**

Это правда: `gpt-image-2` без маски, имея только «замени чашку слева на столе цветами», обычно правит нужное место — следование инструкциям работает хорошо, и для несложных правок одного prompt обычно достаточно. Но маска решает случаи, когда **язык двусмысленен или однозначен, но все еще недостаточно надежен**:

| Сценарий                                                                                      | Только prompt                                        | Prompt + маска                                           |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| В кадре только один целевой объект                                                            | ✅ Достаточно; маска избыточна                        | Не нужно                                                 |
| Несколько похожих объектов, изменить только один (поменять одежду только у человека в центре) | ⚠️ Легко попадает не в того близнеца                 | ✅ Жестко привязано к месту, без двусмысленности          |
| Строгие границы (съемка продукта / скриншоты UI / макеты ID)                                  | ❌ Полная перегенерация изображения; области «плывут» | ✅ При пиксельном композитировании — строго без изменений |
| Пакетные пайплайны (многократная замена одной и той же области в фиксированном макете)        | ⚠️ Нестабильно между запусками                       | ✅ Маски программируемы и воспроизводимы                  |
| Точное управление формой / положением (переместить объект в точные координаты)                | ❌ Язык не может выразить пиксельные координаты       | ✅ Маска и есть пиксельные координаты                     |

Исследования указывают на то же самое: безмасочное (чисто текстовое) редактирование испытывает трудности с точным пространственным контролем — методы в стиле prompt-to-prompt, например, не могут **пространственно переместить** объект по кадру, а когда неявная область редактирования задана неверно, получается «должна была измениться не та часть, а изменилась не та, что не должна была». Редактирование с маской жертвует немного удобства ради явной пространственной точности.

<Tip>
  **Если в одной фразе**: маска — не устаревшая технология, а инструмент точного контроля. Неформальные правки в стиле чата → достаточно одного prompt; производственные сценарии, где нужны воспроизводимость, управляемость и строгие границы → используйте маску. Также помните: редактирование только prompt с `gpt-image-2` по сути является **полной перегенерацией изображения**, поэтому могут измениться и неуказанные области — именно поэтому и существует маска + пиксельное композитирование.
</Tip>

## Требования к файлам с первого взгляда

| Параметр                       | Требование                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Формат изображения             | PNG / JPG / WebP, каждый меньше 50MB                                                                  |
| Количество входных изображений | До 16 (повторяйте поле `image[]`)                                                                     |
| Формат маски                   | **PNG с альфа-каналом (обязательно)**                                                                 |
| Размеры маски                  | Должны **точно совпадать** с **первым** изображением (расхождение даже в 1 пиксель приводит к ошибке) |
| Размер файла маски             | Менее **4MB**                                                                                         |
| Область действия маски         | Применяется только к `image[0]` (первому изображению)                                                 |

Назначение ролей при редактировании с несколькими изображениями:

```text theme={null}
image[0]  = the main editing canvas
image[1…] = reference images
mask      = applies only to image[0]
```

<Tip>
  «Точное совпадение размеров» звучит утомительно, но вам не нужно выравнивать размеры вручную — маски **выводятся из исходного изображения** (путем стирания / кисти / сегментации на его копии), поэтому совпадение размеров получается автоматически. См. [Откуда берутся маски](#where-do-masks-come-from-five-common-methods) ниже.
</Tip>

## Пример на Python

```python theme={null}
import base64
from pathlib import Path
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("input.png", "rb") as image_file, \
     open("mask.png", "rb") as mask_file:

    result = client.images.edit(
        model="gpt-image-2",
        image=image_file,
        mask=mask_file,
        prompt=(
            "Only modify the transparent region of the mask. "
            "Replace the white cup on the table with a bouquet of white tulips. "
            "Keep the table, background, camera angle, composition, and lighting unchanged. "
            "The bouquet should sit naturally where the cup was, casting shadows "
            "consistent with the original lighting."
        ),
        size="1536x1024",
        quality="high",
        output_format="png",
        n=1,
    )

image_bytes = base64.b64decode(result.data[0].b64_json)
Path("edited.png").write_bytes(image_bytes)
print("Saved: edited.png")
```

<Warning>
  **Не передавайте `input_fidelity="high"`** — `gpt-image-2` по умолчанию всегда обрабатывает входные изображения с высокой точностью. API не позволяет настраивать этот параметр; его передача возвращает ошибку 400. Просто опустите его.
</Warning>

## Пример cURL

Эндпоинт редактирования изображений требует `multipart/form-data` — вы не можете отправить изображение и маску как обычные JSON-поля:

```bash theme={null}
curl -s \
  -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "image[]=@input.png;type=image/png" \
  -F "mask=@mask.png;type=image/png" \
  -F "prompt=Only modify the transparent region of the mask. Replace the cup on the table with a bouquet of white tulips. Keep everything else unchanged, preserving the original composition, lighting, and photographic realism." \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "output_format=png" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > edited.png
```

Даже при одном изображении используйте имя поля `image[]`, как в официальных примерах.

<Warning>
  При использовании `-F`, **не задавайте вручную** `-H "Content-Type: multipart/form-data"`. curl должен автоматически сгенерировать `boundary`; при ручной установке заголовка boundary boundary теряется, и сервер не может разобрать файлы.
</Warning>

## Пример на Node.js

```javascript theme={null}
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({
  apiKey: "sk-your-api-key",
  baseURL: "https://api.apiyi.com/v1",
});

const image = await toFile(
  fs.createReadStream("input.png"),
  "input.png",
  { type: "image/png" }
);

const mask = await toFile(
  fs.createReadStream("mask.png"),
  "mask.png",
  { type: "image/png" }
);

const result = await client.images.edit({
  model: "gpt-image-2",
  image,
  mask,
  prompt:
    "Only modify the transparent region of the mask. Replace the white cup " +
    "on the table with a bouquet of white tulips. Keep the background, " +
    "composition, camera angle, and lighting unchanged.",
  size: "1536x1024",
  quality: "high",
  output_format: "png",
});

const imageBuffer = Buffer.from(result.data[0].b64_json, "base64");
fs.writeFileSync("edited.png", imageBuffer);
console.log("Saved: edited.png");
```

## Откуда берутся маски? Пять распространенных способов

Маски часто кажутся пугающими — «они должны в точности совпадать с исходным изображением пиксель в пиксель». Ключевая мысль: **вы почти никогда не рисуете маску с нуля; вы выводите ее из исходного изображения**. Будь то код, фоторедактор или веб-Canvas, процесс всегда один: «открыть оригинал → отметить на нем области → экспортировать», поэтому совпадение размеров происходит **автоматически**.

| Способ                                           | Лучше всего подходит для                                      | Сложность                                           |
| ------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------- |
| ① Генерация через код (рисование областей с PIL) | Пакетные задачи с фиксированным макетом, известные координаты | Низкая (несколько строк)                            |
| ② Ручное стирание в фоторедакторе                | Разовые точные правки, сложные формы                          | Низкая (базовые навыки выделения)                   |
| ③ Веб-Canvas с кистью                            | Встраивание режима «кистью для редактирования» в свой продукт | Средняя (Canvas на фронтенде)                       |
| ④ AI-автосегментация (семейство SAM)             | Один клик / одна фраза → точная маска                         | Средняя (развернуть или вызвать сервис сегментации) |
| ⑤ Преобразование черно-белой маски в alpha       | Использование черно-белых масок из других инструментов        | Низкая (несколько строк)                            |

### Способ 1: Сгенерируйте прозрачную маску программно

Сделайте прямоугольную область прозрачной (редактируемой):

```python theme={null}
from PIL import Image, ImageDraw

original = Image.open("input.png").convert("RGBA")

# Fully opaque by default: preserve everything
mask = Image.new("RGBA", original.size, (255, 255, 255, 255))

draw = ImageDraw.Draw(mask)

# Make the target region fully transparent: editable
# Coordinates: (left, top, right, bottom)
draw.rectangle((300, 250, 750, 800), fill=(0, 0, 0, 0))

mask.save("mask.png")
print("Mask size:", mask.size)
```

* `(255, 255, 255, 255)` = непрозрачная, сохраняемая область
* `(0, 0, 0, 0)` = прозрачная, редактируемая область

### Способ 2: Ручное стирание в фоторедакторе

Любой редактор, который поддерживает прозрачные PNG (Photoshop, GIMP, Krita, Photopea и т. д.), может создать маску — все сводится к одному действию: **сотрите область, которую нужно редактировать, чтобы она стала прозрачной**. В Photoshop:

1. Откройте **копию исходного изображения** (работа с самим оригиналом гарантирует совпадение размеров)
2. Если слой заблокирован как «Фон», дважды щелкните его, чтобы преобразовать в обычный слой (слои фона не поддерживают прозрачность)
3. Выделите область для изменения с помощью инструмента Lasso / Quick Selection / Object Selection
4. Нажмите Delete — выделение станет прозрачной шахматной сеткой
5. Выберите «Экспортировать как PNG» (с включенной прозрачностью) — получится корректная alpha-маска

Тот же принцип в GIMP: `Layer → Transparency → Add Alpha Channel`, выделите, Delete, экспортируйте как PNG.

<Tip>
  Фигуры вовсе не ограничиваются прямоугольниками — обведите объект лассо или выберите объект одним щелчком с помощью smart selection, и удаленная прозрачная область может принять любую неправильную форму. Расширьте выделение **на несколько пикселей за контур объекта** (Photoshop: `Select → Modify → Expand`), чтобы захватить тени и края тоже.
</Tip>

### Способ 3: Веб-Canvas с кистью

Взаимодействие «проведите кистью по тому, что хотите изменить» в AI-фото приложениях — это всего лишь alpha-маска, генерируемая прямо в браузере и построенная вокруг одного свойства Canvas API. См. ниже [Как работает редактирование в стиле кисти](#mask-shapes-and-how-brush-style-editing-works).

### Способ 4: Маски одним кликом через AI-сегментацию

Если даже рисование кистью кажется работой, пусть это сделает модель сегментации. Открытое семейство **SAM (Segment Anything Model)** от Meta — основной вариант:

* **Клик для маски**: один раз щелкните по объекту, и модель вернет его пиксельно точный контур (вплоть до границ отдельных волосков)
* **Текст в маску**: **SAM 3**, опубликованная с открытым исходным кодом в ноябре 2025 года, принимает текстовые prompt на уровне понятий вроде «все желтые такси» или «игроки в красных футболках» и возвращает маски для каждого совпадающего экземпляра (модель и код — на `github.com/facebookresearch`, обзор — на `ai.meta.com`)
* **Разделение объекта / фона**: инструменты с открытым исходным кодом, такие как `rembg`, разделяют объект и фон одной командой — область фона может напрямую служить маской «менять только фон»

Результат сегментации обычно представляет собой черно-белое растровое изображение; преобразуйте его с помощью «Способа 5» ниже. Расширение сообщества Stable Diffusion **Inpaint Anything** и Mask Editor в ComfyUI — зрелые реализации именно этого конвейера — «SAM segmentation + доработка кистью → маска → inpaint» — и их стоит взять на вооружение.

### Способ 5: Преобразуйте черно-белую маску в alpha-маску

Если у вас уже есть маска, где «черное = редактировать, белое = оставить»:

```python theme={null}
from PIL import Image

bw_mask = Image.open("mask_bw.png").convert("L")

rgba_mask = Image.new("RGBA", bw_mask.size, (255, 255, 255, 255))

# Black (0)   → alpha 0   → transparent → edit
# White (255) → alpha 255 → opaque      → keep
rgba_mask.putalpha(bw_mask)

rgba_mask.save("mask.png")
```

### Проверьте маску перед загрузкой

Многие ошибки `invalid_image_file` возникают из-за того, что у файла расширение `.png`, но есть только каналы RGB и нет alpha. Выполните эту проверку перед загрузкой:

```python theme={null}
from PIL import Image

image = Image.open("input.png")
mask = Image.open("mask.png")

print("Mask format:", mask.format)
print("Mask mode:", mask.mode)
print("Mask size:", mask.size)

assert mask.format == "PNG", "Mask must be a PNG"
assert mask.mode in ("RGBA", "LA"), "Mask must contain an alpha channel"
assert image.size == mask.size, "Image and mask dimensions must match exactly"

alpha = mask.getchannel("A")
assert alpha.getextrema()[0] == 0, "Mask has no fully transparent editable region"

print("Mask check passed")
```

## Формы масок и как работает редактирование кистью

### Маски могут иметь любую нерегулярную форму

Маска по своей сути — это **bitmap на уровне отдельных пикселей**, а не геометрическая форма: каждый пиксель хранит собственное значение alpha. Поэтому:

* Прямоугольники и окружности — это лишь самые простые примеры
* Силуэт в форме человека, края прядей волос, произвольные штрихи кистью или несколько разрозненных участков — все это допустимо
* На практике **большинство масок нерегулярны**: они повторяют контур целевого объекта, слегка расширяясь

<Tip>
  Единственный «совет по форме» касается результата, а не правил: прозрачная область должна **полностью покрывать объект вместе с его краями, тенями и отражениями**. Лучше заложить запас, чтобы у модели было пространство для естественного смешивания.
</Tip>

### Как реализовано редактирование в стиле кисти

Взаимодействие «рисуете кистью там, где нужны изменения» в фото-приложениях на фронтенде на удивление простое: **два наложенных слоя, где кисть «стирает» верхний слой в прозрачность**.

```text theme={null}
Bottom <img>     shows the original (visual reference only, not exported)
Top <canvas>     same pixel dimensions as the original, initially fully opaque
                 wherever the brush passes → pixels become transparent
Export canvas    → a valid alpha-mask PNG
```

Основа сводится к одной строке — задайте режим композиции canvas на `destination-out` (новые штрихи «вырезают» существующие пиксели):

```javascript theme={null}
const canvas = document.getElementById("mask-canvas");
const ctx = canvas.getContext("2d");

// 1. Canvas size = the image's natural pixel size (not its CSS display size);
//    matching dimensions come for free
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;

// 2. Start fully opaque = preserve everything
ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 3. The key line: switch the brush to "erase" mode — strokes become transparent
ctx.globalCompositeOperation = "destination-out";
ctx.lineWidth = 40;          // brush size
ctx.lineCap = "round";
ctx.strokeStyle = "rgba(0, 0, 0, 1)";

// 4. Draw on pointer events (convert display coordinates back to natural pixels)
canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;
  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  ctx.lineTo(event.offsetX * scaleX, event.offsetY * scaleY);
  ctx.stroke();
});

// 5. Export: a PNG mask with an alpha channel, ready to upload
canvas.toBlob((blob) => {
  const formData = new FormData();
  formData.append("mask", blob, "mask.png");
  // POST to /v1/images/edits together with the image and prompt
}, "image/png");
```

Здесь важны инженерные детали:

1. **Преобразование координат**: canvas на странице обычно уменьшается через CSS; преобразуйте координаты штриха обратно с помощью `naturalWidth / clientWidth`, иначе маска будет смещена
2. **Отмена**: делайте снимок с помощью `ctx.getImageData()` перед каждым штрихом и восстанавливайте его с помощью `putImageData()`
3. **Расширение маски**: пользователи обычно закрашивают только центр объекта — программно расширьте маску на несколько пикселей перед отправкой (кнопка «Expand Mask» в профессиональных инструментах); на стороне Python используйте `PIL.ImageFilter.MaxFilter` или `cv2.dilate` OpenCV
4. **Полупрозрачный предпросмотр**: рисуйте видимую пользователю подсветку (например, полупрозрачную красную) на **отдельном слое предпросмотра**, оставляя экспортируемый слой маски строго бинарным: непрозрачный/прозрачный

### Дальше: маска по клику или тексту

Следующий шаг после рисования кистью — заменить «человеческие штрихи» на «инференс модели»:

```text theme={null}
User clicks an object            → SAM returns a pixel-accurate outline mask
User types "the cup on the left" → SAM 3 finds all instances matching the concept
Program dilates + feathers       → submit to /v1/images/edits
```

Именно так работают Inpaint Anything и Mask Editor в ComfyUI: **сегментация отвечает за точность, кисть — за исправления** — сначала автоматически сгенерируйте точную маску, а затем донастройте ее добавлением или обрезкой штрихов кисти. Для собственного продукта лучшим с точки зрения UX сочетанием сейчас является развертывание SAM как backend-сервиса при сохранении canvas для кисти в качестве fallback.

## Несколько референсных изображений + маска

Типичный сценарий: замена наряда (первое изображение — человек, затем референсы стиля / ткани; маска отмечает область одежды):

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("person.png", "rb") as person, \
     open("clothes_reference.png", "rb") as clothes, \
     open("fabric_reference.png", "rb") as fabric, \
     open("mask.png", "rb") as mask:

    result = client.images.edit(
        model="gpt-image-2",
        image=[person, clothes, fabric],
        mask=mask,
        prompt=(
            "The first image is the subject to edit. "
            "Only modify the clothing inside the transparent mask region "
            "of the first image. Use the garment style from the second image "
            "and the fabric texture from the third image. Keep the face, "
            "hairstyle, pose, body proportions, background, and lighting "
            "of the first image unchanged."
        ),
        quality="high",
        size="1024x1536",
        output_format="png",
    )

with open("result.png", "wb") as output:
    output.write(base64.b64decode(result.data[0].b64_json))
```

<Tip>
  При нескольких изображениях промпт должен **четко описывать роль каждого изображения** (первое = субъект, второе = референс стиля, третье = референс ткани); иначе модель может их перепутать.
</Tip>

## Строгое сохранение содержимого вне маски (постобработка на уровне пикселей)

Поскольку модель может слегка изменять содержимое вне маски, для сценариев, требующих пиксельной точности (фотографии товаров, макеты удостоверений, фиксированные скриншоты интерфейса), после генерации объедините область вне маски обратно из оригинала:

```python theme={null}
from PIL import Image, ImageFilter

original = Image.open("input.png").convert("RGBA")
edited = Image.open("edited.png").convert("RGBA")
mask = Image.open("mask.png").convert("RGBA")

if edited.size != original.size:
    edited = edited.resize(original.size, Image.Resampling.LANCZOS)

# Original mask alpha: 0 = edit region, 255 = preserved region
alpha = mask.getchannel("A")

# Inverted: 255 = use edited result, 0 = use original
edit_area = alpha.point(lambda value: 255 - value)

# Slight feathering to avoid hard edges
edit_area = edit_area.filter(ImageFilter.GaussianBlur(radius=3))

final = Image.composite(edited, original, edit_area)
final.save("final.png")
```

Итог: правка ИИ внутри маски, оригинальное изображение снаружи нее, с мягко сглаженной границей.

## Распространённые ошибки

<AccordionGroup>
  <Accordion title="invalid_image_file / Недопустимый файл изображения или режим">
    Частые причины:

    * Маска не является допустимым PNG, либо файл повреждён
    * Расширение указывает PNG, но фактическое кодирование не PNG
    * Ненормальный режим изображения (CMYK, режим palette, отсутствует alpha)
    * Неверный MIME type при загрузке
    * Поток файла уже был считан или закрыт до запроса

    Повторное кодирование устраняет большинство случаев:

    ```python theme={null}
    from PIL import Image

    Image.open("input_source.jpg").convert("RGBA").save("input.png")
    Image.open("mask_source.png").convert("RGBA").save("mask.png")
    ```
  </Accordion>

  <Accordion title="Размеры изображения и маски не совпадают">
    Ошибка возникает даже при разнице в 1 пиксель. Исправление:

    ```python theme={null}
    from PIL import Image

    image = Image.open("input.png")
    mask = Image.open("mask.png").convert("RGBA")

    mask = mask.resize(image.size, Image.Resampling.NEAREST)
    mask.save("mask_fixed.png")
    ```
  </Accordion>

  <Accordion title="У чёрно-белой маски нет alpha-канала">
    Режимов `RGB` / `L` / `P` недостаточно — маска должна быть `RGBA`. Используйте «Метод 2» выше, чтобы преобразовать.
  </Accordion>

  <Accordion title="Прозрачность маски и прозрачность результата — это разные вещи">
    Эти два понятия легко перепутать:

    ```text theme={null}
    Mask transparency:   marks "the model may change this area" — the alpha channel of the mask file
    Output transparency: the result itself carries an alpha channel — controlled by the background parameter
    ```

    Они **работают вместе**: передайте `mask` с alpha, чтобы отметить область редактирования, и `background: "transparent"`, чтобы получить прозрачный результат. Проверено — они не конфликтуют.

    Для прозрачности результата требуется, чтобы `output_format` был `png` или `webp`; при сочетании с `jpeg` возвращается 400 (у jpeg нет alpha-канала). Полные сведения: [Как сгенерировать изображения с прозрачным фоном](/ru/faq/image-transparent-background).
  </Accordion>

  <Accordion title="response_format=url не возвращает изображение">
    Модели GPT Image всегда возвращают данные Base64; `response_format` относится только к устаревшему поведению DALL·E 2. Получите результат так:

    ```python theme={null}
    result.data[0].b64_json
    ```
  </Accordion>

  <Accordion title="Content-Type не multipart/form-data">
    Обычно это вызвано ручной установкой заголовка `Content-Type` (из-за чего теряется boundary) либо тем, что промежуточный слой преобразует multipart request в JSON перед пересылкой. Позвольте вашему HTTP-клиенту автоматически генерировать multipart-заголовки.
  </Accordion>
</AccordionGroup>

## Параметры размера

`gpt-image-2` поддерживает гибкие размеры при соблюдении всех следующих условий:

```text theme={null}
Width and height must both be multiples of 16
Longest side no more than 3840px
Aspect ratio no more than 3:1
Total pixels at least 655,360
Total pixels no more than 8,294,400
```

Распространенные размеры: `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, `2048x1152`, `3840x2160`, `2160x3840`, `auto`. Квадратные изображения обычно генерируются быстрее.

## Шаблон производственного запроса

```python theme={null}
result = client.images.edit(
    model="gpt-image-2",
    image=open("input.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="""
Only edit the transparent region of the mask.

Edit task:
Replace the white mug inside the transparent region with a bouquet
of white tulips.

Must preserve:
- Original composition
- Camera position and lens perspective
- Table surface and background
- Lighting direction and color temperature
- All people and objects outside the mask
- Realistic photographic style

Blending requirements:
The bouquet should sit naturally where the mug was, with shadows,
reflections, and contact points consistent with the scene lighting.
Do not add any other objects.
""",
    size="1536x1024",
    quality="high",
    output_format="png",
)
```

## Связанные страницы

<CardGroup cols={2}>
  <Card title="Справка по API редактирования изображений" icon="image" href="/ru/api-capabilities/gpt-image-2/image-edit">
    Полная справка по параметрам и интерактивная песочница
  </Card>

  <Card title="Обзор GPT-Image-2" icon="sparkles" href="/ru/api-capabilities/gpt-image-2/overview">
    Возможности модели, тарификация и примечания к версиям
  </Card>
</CardGroup>

<Info>
  Официальные ссылки (скопируйте в браузер):

  * Страница модели: `developers.openai.com/api/docs/models/gpt-image-2`
  * Справка по API редактирования изображений: `developers.openai.com/api/reference/python/resources/images/methods/edit/`
  * Руководство по генерации изображений: `developers.openai.com/api/docs/guides/image-generation`
</Info>
