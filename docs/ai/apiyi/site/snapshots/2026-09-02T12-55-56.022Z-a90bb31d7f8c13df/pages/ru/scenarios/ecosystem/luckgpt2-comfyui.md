> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - Узлы ComfyUI

> Пакет из двух нод, созданный сообществом: напрямую вызывайте gpt-image-2 (официальный) и gpt-image-2-all (реверсный) в ComfyUI — поддерживает text-to-image, редактирование по reference-image, mask inpainting и настраиваемые разрешения.

## Обзор

`Comfyui-Luck-gpt2.0` — это пакет пользовательских узлов ComfyUI, созданный участником сообщества luckdvr. Он позволяет вызывать две GPT image модели APIYI напрямую внутри ComfyUI — **официальный `gpt-image-2`** и **`gpt-image-2-all` на основе обратной разработки**. Два узла четко разделяют задачи: первый ориентирован на детальные параметры (разрешение, качество, mask, multi-reference), а второй обеспечивает разговорный опыт генерации изображений на уровне паритета с ChatGPT, со встроенными timeout/retry — идеально для рабочих процессов в продакшене.

<Info>
  **Информация о проекте**

  * 🔗 Источник: `github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 Лицензия: Apache-2.0
  * 👤 Автор: luckdvr
  * ⭐ Вклад сообщества, создано для APIYI
</Info>

<Tip>
  **Как отличить это от другого пакета узлов автора?**

  luckdvr вносит вклад в два пакета узлов ComfyUI для APIYI:

  * **[Luck Nano Banana Pro](/ru/scenarios/ecosystem/lucknanobananapro-comfyui)**: вызывает линейку Gemini (`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`) — делает акцент на 14 референсных изображениях и инженерно надежных retry/timeout
  * **Luck GPT-Image 2 (эта страница)**: вызывает линейку OpenAI (`gpt-image-2` / `gpt-image-2-all`) — делает акцент на переключении между двумя эндпоинтами (chat\_completions / images\_api) и inpainting по маске
</Tip>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Два узла, два маршрута" icon="layers">
    `Comfyui-Luck gpt-image-2` (официальный) и `Comfyui-Luck gpt-2.0 all` (обратный) — выбирайте тот, который подходит под сцену
  </Card>

  <Card title="До 5 референсных изображений" icon="images">
    Официальный узел принимает до 5 референсных изображений для сложного объединения и переноса стиля
  </Card>

  <Card title="Inpainting по маске" icon="eraser">
    Необязательный ввод маски для точного выбора области редактирования при локальных изменениях
  </Card>

  <Card title="Несколько уровней + пользовательское разрешение" icon="image">
    Пресеты 1K / 2K / 4K плюс пользовательский размер (макс. 3840px по каждой стороне, 655,360–8,294,400 всего пикселей)
  </Card>

  <Card title="15 соотношений сторон" icon="ratio">
    AUTO, 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, 1:4, 4:1, 1:8, 8:1
  </Card>

  <Card title="Качество и формат вывода" icon="sliders-horizontal">
    `quality` (авто / низкое / среднее / высокое) + формат вывода (png / jpeg / webp) + сжатие 0-100
  </Card>

  <Card title="Два эндпоинта (обратный узел)" icon="git-branch">
    `gpt-image-2-all` поддерживает переключение между эндпоинтами `chat_completions` и `images_api`
  </Card>

  <Card title="Встроенные timeout и retry" icon="refresh-cw">
    Параметры timeout и retry встроены — стабильно даже в часы пик
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Модель                    | ID модели         | Узел                       | Назначение                                                                                              | Документация API                                          |
| ------------------------- | ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| GPT-Image 2 (официальный) | `gpt-image-2`     | `Comfyui-Luck gpt-image-2` | Нативная генерация изображений по тексту 2K/4K, редактирование по референс-изображению, дорисовка маски | [Просмотр](/ru/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (реверс)  | `gpt-image-2-all` | `Comfyui-Luck gpt-2.0 all` | Разговорная генерация изображений на уровне ChatGPT, тарификация за каждый вызов                        | [Просмотр](/ru/api-capabilities/gpt-image-2-all/overview) |

<Info>
  Для полного сравнения side by side см. [сравнение gpt-image-2 (официальный) vs gpt-image-2-all (реверс)](/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all).
</Info>

## Параметры Node

### `Comfyui-Luck gpt-image-2` (официальный)

| Параметр              | Тип    | Обязательно | По умолчанию | Описание                                                                    |
| --------------------- | ------ | ----------- | ------------ | --------------------------------------------------------------------------- |
| `api_key`             | string | Yes         | -            | APIYI token — рекомендуем выделенный ключ с лимитом использования           |
| `prompt`              | string | Yes         | -            | Инструкция для генерации или редактирования                                 |
| `image_1` … `image_5` | IMAGE  | No          | -            | Референсные изображения, до 5                                               |
| `mask`                | MASK   | No          | -            | Необязательная маска для inpainting (белая область = регион редактирования) |
| `size`                | enum   | No          | `2K`         | Разрешение вывода (1K / 2K / 4K / custom)                                   |
| `custom_size`         | string | No          | -            | Используется, когда `size` равно `custom`, например, `2048x3072`            |
| `aspect_ratio`        | enum   | No          | `AUTO`       | Одно из 15 соотношений сторон                                               |
| `quality`             | enum   | No          | `auto`       | auto / low / medium / high                                                  |
| `output_format`       | enum   | No          | `png`        | png / jpeg / webp                                                           |
| `output_compression`  | int    | No          | 80           | 0-100 (применяется только к jpeg / webp)                                    |

### `Comfyui-Luck gpt-2.0 all` (обратный)

| Параметр          | Тип    | Обязательно | По умолчанию       | Описание                          |
| ----------------- | ------ | ----------- | ------------------ | --------------------------------- |
| `api_key`         | string | Yes         | -                  | APIYI token                       |
| `prompt`          | string | Yes         | -                  | Диалоговый image prompt           |
| `endpoint`        | enum   | No          | `chat_completions` | `chat_completions` / `images_api` |
| `response_format` | enum   | No          | -                  | `b64_json` / `url` и т. д.        |
| `timeout_seconds` | int    | No          | -                  | Тайм-аут на один запрос           |
| `retry_times`     | int    | No          | -                  | Количество повторов при сбое      |

## Установка

<Steps>
  <Step title="Шаг 1: Клонируйте в custom_nodes">
    Внутри вашей установки ComfyUI:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```
  </Step>

  <Step title="Шаг 2: Установите зависимости">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="Шаг 3: Перезапустите ComfyUI">
    Найдите `Luck gpt-image-2` или `Luck gpt-2.0 all` в палитре узлов.
  </Step>

  <Step title="Шаг 4: Настройте ключ APIYI">
    * Перейдите в [APIYI Console](https://www.apiyi.com) → Tokens, создайте новый ключ (для безопасности используйте ограничение по использованию)
    * Вставьте его в поле `api_key`
    * По умолчанию у узла используется `api.apiyi.com`; при необходимости можно переключиться на резервные домены `vip.apiyi.com` / `b.apiyi.com`
  </Step>

  <Step title="Шаг 5: Импортируйте пример рабочего процесса">
    В репозитории есть `example_workflow.json` — импортируйте его в ComfyUI как отправную точку.
  </Step>
</Steps>

## Примеры использования

### Пример 1: Официальная высококачественная генерация изображений по тексту в 4K

```
Node: Comfyui-Luck gpt-image-2
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
size: 4K
aspect_ratio: 2:3
quality: high
output_format: png
```

### Пример 2: Inpainting по маске (официально)

```
Node: Comfyui-Luck gpt-image-2
image_1: original photo
mask: the area to be replaced (white = edit region)
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
size: 2K
quality: high
```

### Пример 3: Обратное диалоговое изображение

```
Node: Comfyui-Luck gpt-2.0 all
endpoint: chat_completions
prompt: "A girl in hanfu standing under a cherry blossom tree, watercolor style, soft lighting"
response_format: b64_json
timeout_seconds: 180
retry_times: 3
```

## Частые вопросы

<AccordionGroup>
  <Accordion title="Какой node мне выбрать?">
    * **`gpt-image-2` (официальный)**: настраиваемые параметры, нативная поддержка mask, тарификация по token, детальная настройка разрешения/качества — лучше всего подходит, если у вас есть конкретные требования к размеру или нужны локальные правки
    * **`gpt-image-2-all` (реверсный)**: тарификация за каждый вызов (\$0.03/вызов), диалоговые prompt на естественном языке, паритет с веб-опытом ChatGPT — лучше всего подходит для итеративного редактирования и качественного рендеринга текста
    * Полное сравнение: [сравнение официального и реверсного вариантов](/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="Node не найден после установки?">
    1. Проверьте, что папка находится в `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0`
    2. `pip install -r requirements.txt` завершился без ошибок
    3. Полностью перезапустите ComfyUI (обновления frontend недостаточно)
  </Accordion>

  <Accordion title="4K или пользовательские размеры часто завершаются по тайм-ауту?">
    * Увеличьте `timeout_seconds` на reverse node
    * Если сеть вашего сервера медленная, см. [Скачивание изображений/видео через CDN идет медленно](/ru/faq/cdn-download-slow)
    * Переключитесь на резервные домены `vip.apiyi.com` / `b.apiyi.com`, если основной endpoint нестабилен
  </Accordion>

  <Accordion title="b64_json возвращается с префиксом?">
    Реверсный `gpt-image-2-all` возвращает `b64_json` с префиксом `data:image/png;base64,`, а официальный `gpt-image-2` — нет. Подробности в [сравнении официального и реверсного вариантов](/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all).
  </Accordion>

  <Accordion title="Вызовы возвращают 401 / 403?">
    1. Проверьте действительность `api_key` и не ограничен ли он каналом
    2. Убедитесь, что выбранная модель добавлена в белый список token
    3. Проблемы с балансом — см. [Баланс кажется достаточным, но вызовы не проходят](/ru/faq/balance-insufficient)
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="gpt-image-2 (официальная) документация" icon="book" href="/ru/api-capabilities/gpt-image-2/overview">
    Нативная генерация 2K/4K, тарификация за token
  </Card>

  <Card title="gpt-image-2-all (реверс) документация" icon="book" href="/ru/api-capabilities/gpt-image-2-all/overview">
    Паритет с ChatGPT, \$0.03 за вызов
  </Card>

  <Card title="Сравнение официальной и реверсной версий" icon="scale" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Таблица сравнения по 17 параметрам
  </Card>

  <Card title="Коллекция узлов ComfyUI" icon="workflow" href="/ru/scenarios">
    Просмотрите больше узлов ComfyUI, адаптированных под APIYI
  </Card>

  <Card title="Luck Nano Banana Pro (тот же автор)" icon="puzzle" href="/ru/scenarios/ecosystem/lucknanobananapro-comfyui">
    Узел ComfyUI для линейки Gemini от luckdvr
  </Card>

  <Card title="APIYI GPT-Image 2 Skills (те же модели)" icon="puzzle" href="/ru/scenarios/ecosystem/apiyi-gpt-image-skills">
    Вариант AI Agent Skill для тех же двух моделей GPT для генерации изображений
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Управляйте ключами, использованием и каналами
  </Card>
</CardGroup>
