> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI Nano Banana ComfyUI узел (легковесный пример)

> Легковесный кастомный узел ComfyUI, созданный сообществом, — встраиваемая генерация изображений Nano Banana Pro / 2 внутри ваших рабочих процессов, идеально подходит для быстрого старта и дальнейшего расширения.

## Обзор

`api_yi_nano_banana_node` — это **легковесный пользовательский узел ComfyUI**, созданный участником сообщества JerrIsTheBesta. Он делает ставку на «простоту внедрения + легкость расширения». Просто поместите его в каталог `custom_nodes`, перезапустите ComfyUI, и вы сможете напрямую вызывать генерацию изображений Nano Banana Pro / Nano Banana 2 от APIYI в своем рабочем процессе — отличная отправная точка для обучения и настройки.

<Info>
  **Информация о проекте**

  * 🔗 Источник: `github.com/JerrIsTheBesta/api_yi_nano_banana_node`
  * 📜 Лицензия: MIT
  * 👤 Автор: JerrIsTheBesta
  * ⭐ Предоставлено партнером сообщества — позиционируется как **пример, который вы можете расширить**
</Info>

<Tip>
  **Для кого это?**

  Этот узел ориентирован на две наиболее распространенные операции: преобразование текста в изображение и редактирование нескольких изображений. Код минимален и легко читается. Если вам нужны более богатые возможности (редактирование в диалоге, смешивание 14 изображений и т. д.), посмотрите [полнофункциональный узел Nano Banana для ComfyUI](/ru/scenarios/ecosystem/nano-banana-comfyui) или форкните этот и расширьте его.
</Tip>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Два основных узла" icon="workflow">
    `APIYI Text to Image` + `APIYI Multi Image Edit` — охватывает два наиболее распространённых сценария работы
  </Card>

  <Card title="Переключение между двумя моделями" icon="layers">
    Выбирайте между `gemini-3-pro-image-preview` (Nano Banana Pro) и `gemini-3.1-flash-image-preview`
  </Card>

  <Card title="Вывод в высоком разрешении" icon="image">
    Поддерживает вывод **2K / 4K** с автоматической настройкой таймаута в зависимости от разрешения
  </Card>

  <Card title="Широкий набор соотношений сторон" icon="ratio">
    Встроены 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 21:9, 5:4, 4:5 — всего 10 соотношений
  </Card>

  <Card title="Редактирование нескольких изображений" icon="images">
    `Multi Image Edit` принимает до **5 опорных изображений** для смешивания / переноса стиля
  </Card>

  <Card title="Лёгкий и гибкий для доработки" icon="code">
    Чистый Python с минимальным набором зависимостей (requests / Pillow / numpy). Понятная структура, легко настраивать
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Model                 | Model ID                         | Use                                                       | API Docs                                                |
| --------------------- | -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | Высококачественная генерация изображений и редактирование | [View](/ru/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | Быстрая генерация, более низкая стоимость                 | [View](/ru/api-capabilities/gemini/native)              |

## Сведения о ноде

### APIYI Генерация изображений по тексту

Генерирует изображения по текстовому prompt — **входное изображение не требуется**. Результат: сгенерированное изображение + идентификатор имени файла.

### APIYI Редактирование нескольких изображений

Принимает **до 5 входных изображений** для смешивания, редактирования или композиции. Результат: итоговое изображение, имя файла, количество фактически использованных изображений.

### Параметры ноды

| Параметр       | Тип    | Обязательно | По умолчанию                 | Описание                                                             |
| -------------- | ------ | ----------- | ---------------------------- | -------------------------------------------------------------------- |
| `api_key`      | string | Да          | -                            | APIYI token — мы рекомендуем выделенный ключ с лимитом использования |
| `prompt`       | string | Да          | -                            | Текстовый prompt                                                     |
| `model`        | enum   | Да          | `gemini-3-pro-image-preview` | Модель (Pro / Flash)                                                 |
| `resolution`   | enum   | Нет         | `2K`                         | Разрешение вывода (2K / 4K, 4K автоматически увеличивает тайм-аут)   |
| `aspect_ratio` | enum   | Нет         | `1:1`                        | Доступно 10 соотношений сторон                                       |
| `images`       | IMAGE  | Нет         | -                            | Референсные изображения для Multi Image Edit (до 5)                  |

## Установка

<Steps>
  <Step title="Шаг 1: Поместите в custom_nodes">
    Внутри вашей установки ComfyUI клонируйте репозиторий в `custom_nodes`:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/JerrIsTheBesta/api_yi_nano_banana_node.git
    ```
  </Step>

  <Step title="Шаг 2: Установите Python-зависимости">
    Зависимостей минимум — обычно в ComfyUI уже входит torch. Установите остальное, если чего-то не хватает:

    ```bash theme={null}
    pip install requests pillow numpy
    ```
  </Step>

  <Step title="Шаг 3: Перезапустите ComfyUI">
    После перезапуска найдите `APIYI` в палитре узлов, чтобы найти:

    * `APIYI Text to Image`
    * `APIYI Multi Image Edit`
  </Step>

  <Step title="Шаг 4: Настройте ключ APIYI">
    * Перейдите в [APIYI Console](https://www.apiyi.com) → Tokens и **создайте отдельный ключ с лимитом использования** (лучшая практика безопасности)
    * Вставьте ключ в поле `api_key` узла
    * Настраивать endpoint не нужно — узел использует `https://api.apiyi.com` внутри
  </Step>

  <Step title="Шаг 5: Соберите простой workflow">
    * **Text-to-image**: `APIYI Text to Image` → `Preview Image`
    * **Multi-image edit**: несколько `Load Image` → `APIYI Multi Image Edit` → `Preview Image`
  </Step>
</Steps>

## Примеры использования

### Пример 1: Текст в изображение

```
Node: APIYI Text to Image
prompt: "A cute corgi astronaut floating in a neon-lit space station, cinematic lighting"
model: gemini-3-pro-image-preview
resolution: 2K
aspect_ratio: 16:9
```

### Пример 2: Смешивание нескольких изображений

```
Node: APIYI Multi Image Edit
images: [person photo, outfit reference, background reference]
prompt: "Replace the outfit with the reference clothing, and set the scene in the reference background"
resolution: 4K
aspect_ratio: 1:1
```

## Идеи расширения

Этот проект позиционируется как **пример и отправная точка** — сделайте fork и дорабатывайте по мере необходимости:

<CardGroup cols={2}>
  <Card title="Диалоговое редактирование" icon="messages-square">
    Сохраняйте контекст сессии внутри узла для итеративной доработки
  </Card>

  <Card title="Больше референсных изображений" icon="images">
    Увеличьте лимит до 14 изображений, чтобы соответствовать полной емкости Nano Banana Pro
  </Card>

  <Card title="Управление seed" icon="dices">
    Добавьте параметр seed для воспроизводимых генераций
  </Card>

  <Card title="Пакетный вывод" icon="layers">
    Выводите пакеты изображений в последующие узлы ComfyUI
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="Установили узел, но не можете найти его в палитре?">
    1. Убедитесь, что репозиторий находится внутри `ComfyUI/custom_nodes/`
    2. Полностью перезапустите ComfyUI (не просто обновите фронтенд)
    3. Проверьте консоль ComfyUI на наличие ошибок импорта Python
  </Accordion>

  <Accordion title="Вызовы завершаются с ошибкой 401 / 403?">
    Проверьте:

    1. `api_key` указан правильно и не ограничен неправильным каналом
    2. Выбранная модель есть в белом списке token
    3. Баланс аккаунта достаточен — см. [Баланс кажется достаточным, но вызовы завершаются с ошибкой](/ru/faq/balance-insufficient)
  </Accordion>

  <Accordion title="Разрешение 4K часто завершается по тайм-ауту?">
    Узел автоматически увеличивает тайм-аут для 4K, но если это все равно не помогает:

    1. Проверьте сетевой путь к API (см. [Загрузка изображений/видео через CDN идет медленно](/ru/faq/cdn-download-slow))
    2. Переключитесь на 2K или Flash в часы пик
  </Accordion>

  <Accordion title="Безопасно ли раскрывать API key?">
    Автор прямо рекомендует **не** использовать ваш основной ключ — создайте для этого узла отдельный token с лимитом использования в консоли APIYI, чтобы при утечке зона возможного ущерба была ограничена.
  </Accordion>

  <Accordion title="Чем это отличается от другого узла ComfyUI-Nano-Banana-apiyi?">
    * Этот узел: **легковесный пример**, только 2 узла, минимальные зависимости — идеально для начала работы и настройки
    * [Полная версия](/ru/scenarios/ecosystem/nano-banana-comfyui): более богатый набор возможностей (диалоговое редактирование, смешивание 14 изображений), создана для рабочих процессов production
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/ru/api-capabilities/nano-banana-image/overview">
    Полный справочник по API для Nano Banana Pro
  </Card>

  <Card title="Full ComfyUI Node" icon="workflow" href="/ru/scenarios/ecosystem/nano-banana-comfyui">
    Полнофункциональный пакет узлов Nano Banana для ComfyUI
  </Card>

  <Card title="Обзор сценариев" icon="rocket" href="/ru/scenarios">
    Ознакомьтесь с другими сценариями APIYI
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Управляйте API-ключами и использованием
  </Card>
</CardGroup>
