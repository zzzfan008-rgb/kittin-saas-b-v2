> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Как сгенерировать изображения с прозрачным фоном (PNG-вырезки)

> Передайте background: transparent в gpt-image-2, и вы получите настоящий PNG с альфа-каналом обратно, без дополнительной обработки. png и webp оба работают; jpeg не имеет альфа-канала, поэтому он несовместим с прозрачностью. Эта страница охватывает все модели для генерации изображений, минимальные примеры и распространённые ошибки.

## Краткий ответ

**Используйте `gpt-image-2` и добавьте в запрос два поля:**

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

Изображение возвращается в виде PNG с настоящим alpha-каналом — дополнительная постобработка для вырезки не требуется. Text-to-image, image editing и инструмент Responses для изображений поддерживают это.

<Info>
  `background: "transparent"` — это возможность, которую OpenAI предоставила для GPT-Image-2 2026-08-21 (OpenAI пометила это как preview). APIYI проверила это сквозным образом: и text-to-image, и image editing возвращают настоящую альфа-прозрачность.
</Info>

## Какие модели могут создавать прозрачный фон

| Модель                                                          | Как                                                                                            | Надёжность                                                                            |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `gpt-image-2`                                                   | **Параметр** — `background: "transparent"` с `output_format`, установленным в `png` или `webp` | ✅ Надёжно, рекомендуется                                                              |
| `gpt-image-1.5` / `gpt-image-1`                                 | Тот же параметр                                                                                | ✅ Надёжно (старые модели; в новых проектах следует использовать только `gpt-image-2`) |
| `gpt-image-2-all` / `gpt-image-2-vip`                           | **Параметр `background` отсутствует** — можно только попросить об этом в prompt                | ⚠️ Иногда ненадёжно; тот же prompt всё ещё может вернуться на белом фоне              |
| `seedream-5-0` / `seedream-5-0-pro`                             | `output_format: "png"` плюс `transparent background, alpha channel` в prompt                   | ⚠️ Зависит от prompt, альфа не гарантируется при каждом вызове                        |
| Модели Gemini для генерации изображений (семейство Nano Banana) | Только prompt                                                                                  | ⚠️ То же самое                                                                        |
| `seedream-4-5` / `seedream-4-0`                                 | Только выходной `jpeg`, без альфа-канала                                                       | ❌ Не поддерживается                                                                   |

<Tip>
  **Если вам нужна надёжная прозрачность, используйте `gpt-image-2`.** Параметр и запрос в prompt — это не одно и то же: первое гарантируется API, второе — это максимум, на который способна модель. При пакетной обработке разница заметна.
</Tip>

## Три способа вызова

### Текст в изображение `/v1/images/generations`

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a cute cartoon fox sticker, flat vector illustration, single centered subject, clean cutout edges, no background, no shadow",
    "background": "transparent",
    "output_format": "png",
    "quality": "low"
  }'
```

### Редактирование изображений `/v1/images/edits`

Дайте ему обычную фотографию и попросите убрать фон:

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

Инпейтинг на основе маски (`mask`) и прозрачный фон работают вместе — они не конфликтуют.

### Инструмент изображений Responses

```json theme={null}
{
  "model": "gpt-5.2",
  "input": "Generate a cartoon fox sticker",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

Возвращаемый `image_generation_call` повторяет `"background": "transparent"`.

## Почему `jpeg` не работает

У JPEG **нет альфа-канала** — прозрачность негде хранить. При сочетании `output_format: "jpeg"` с `background: "transparent"` возвращается 400:

```json theme={null}
{
  "error": {
    "message": "Transparent background is not supported for JPEG output format",
    "param": "background",
    "code": "invalid_value"
  }
}
```

Для прозрачности выберите `png` (без потерь, больше) или `webp` (с потерями и настраиваемый, меньше, также поддерживает альфа-канал). `webp` также принимает `output_compression`, чтобы уменьшить размер файла.

## Редактирование — это перерисовка, а не точное вырезание

Сразу задайте ожидания: когда `/v1/images/edits` выполняется с `background: transparent`, модель **понимает сцену и заново рисует объект**, а не обводит исходный контур так, как это сделал бы Photoshop. Это означает:

* **Позу, стиль и мелкие детали объекта будет меняться** — это не сохранение на уровне пикселей
* Чтобы оставаться ближе к оригиналу, используйте `quality: "high"` и укажите в prompt: "сохраните исходную композицию, не меняйте внешний вид объекта"
* Если вашему workflow нужно извлечение с точностью до пикселя, выполните вырезание самостоятельно с помощью `rembg`, `PIL` или `sharp`. Генерация модели лучше подходит для "создания переиспользуемых assets", чем для точного matting

## Тарификация

**Прозрачность не требует доплаты.** При том же уровне качества и размере `background: "transparent"` и `background: "opaque"` используют абсолютно одинаковое количество image tokens и тарифицируются по обычным правилам за token для `gpt-image-2`.

## Распространённые ошибки

<AccordionGroup>
  <Accordion title="400: Прозрачный фон не поддерживается для формата вывода JPEG">
    `output_format` был установлен в `jpeg`. Измените его на `png` или `webp`.
  </Accordion>

  <Accordion title="Изображение действительно на белом фоне, а не прозрачное">
    Проверьте три вещи. Во‑первых, что поле `background` действительно дошло до API — эндпоинт редактирования — `multipart/form-data`, поэтому это должно быть `-F background=transparent`, а не поле в теле JSON. Во‑вторых, повторяет ли верхнеуровневый `background` в ответе `transparent`. В‑третьих, используете ли вы `gpt-image-2` — `gpt-image-2-all` и `gpt-image-2-vip` не имеют такого параметра и просто игнорируют его.
  </Accordion>

  <Accordion title="Как проверить, что у изображения действительно есть alpha-канал">
    Достаточно одного фрагмента Python:

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA means it has alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # share of fully transparent pixels
    ```

    Режим `RGB` означает, что alpha-канал вообще отсутствует. Режим `RGBA`, при котором все значения alpha равны 255, означает, что канал существует, но ничего не было вырезано.
  </Accordion>

  <Accordion title="В моём prompt уже сказано про прозрачный фон — зачем тогда передавать параметр">
    prompt лишь просит модель изобразить это таким образом, и модель может нарисовать серо-белую шахматную сетку, которая лишь выглядит прозрачной — это по‑прежнему непрозрачные пиксели. Только параметр `background: "transparent"` гарантирует настоящий alpha-канал.
  </Accordion>
</AccordionGroup>

## Связанная документация

<CardGroup cols={2}>
  <Card title="Обзор GPT-Image-2" icon="image" href="/ru/api-capabilities/gpt-image-2/overview">
    Полные параметры, размеры, уровни качества и коды ошибок
  </Card>

  <Card title="Справочник API для text-to-image" icon="wand-sparkles" href="/ru/api-capabilities/gpt-image-2/text-to-image">
    Все поля на `/v1/images/generations`
  </Card>

  <Card title="Справочник API по редактированию изображений" icon="scissors" href="/ru/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits` и слияние нескольких изображений
  </Card>

  <Card title="Инпейтинг по маске" icon="square-dashed" href="/ru/api-capabilities/gpt-image-2/mask-editing">
    Используйте альфа-маску, чтобы отметить область, которую нужно изменить
  </Card>

  <Card title="Официальные и реверсные маршруты" icon="git-compare" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Выбор между `gpt-image-2` / `-all` / `-vip`
  </Card>

  <Card title="Артефакты на белом фоне" icon="triangle-alert" href="/ru/faq/white-background-image-artifacts">
    Другая проблема с чисто-белым фоном
  </Card>
</CardGroup>
