> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck Nano Banana Pro - Узел ComfyUI

> Расширенный узел ComfyUI, созданный сообществом: до 14 референсных изображений, выход 1K/2K/4K, 15 соотношений сторон, настраиваемые повторные попытки и тайм-аут — создан для production.

## Обзор

`Comfyui-LuckNanoBananaPro` — это пользовательский узел ComfyUI, внесенный участником сообщества luckdvr. Он вызывает Gemini 3 Pro Image Preview / Flash через APIYI для **генерации изображений по тексту и редактирования нескольких изображений**. По сравнению с базовыми узлами его главное преимущество — **инженерная отточенность**: встроенные timeout/retry, отображение прогресса в реальном времени, нативные режимы seed ComfyUI и до 14 входных изображений в стеке — идеально для более тяжелых production-процессов.

<Info>
  **Информация о проекте**

  * 🔗 Источник: `github.com/luckdvr/Comfyui-LuckNanoBananaPro`
  * 📜 Лицензия: MIT / Apache-2.0 (dual)
  * 👤 Автор: luckdvr
  * ⭐ Вклад сообщества, создано для APIYI
</Info>

<Tip>
  **Как выбрать среди трех узлов ComfyUI?**

  Доступны три community-узла ComfyUI для Nano Banana — выберите подходящий:

  * **[Nano Banana ComfyUI Nodes](/ru/scenarios/ecosystem/nano-banana-comfyui)**: полнофункциональный (диалоговое редактирование, память многоходового диалога), отлично подходит для интерактивного создания
  * **[APIYI Nano Banana Node (Lite)](/ru/scenarios/ecosystem/apiyi-nano-banana-node)**: минималистичная кодовая база, отлично подходит для изучения и настройки
  * **Luck Nano Banana Pro (эта страница)**: богатые инженерные параметры (timeout, retry, 14 входных изображений), создан для стабильной работы в production-среде
</Tip>

## Основные возможности

<CardGroup cols={2}>
  <Card title="До 14 входных изображений" icon="images">
    `image_01` \~ `image_14` слота позволяют загрузить до 14 референсных изображений, что соответствует теоретическому пределу входных данных Nano Banana Pro
  </Card>

  <Card title="Многоуровневое разрешение" icon="image">
    **1K / 2K / 4K** вывод с адаптивным таймаутом — баланс скорости и качества
  </Card>

  <Card title="15 соотношений сторон" icon="ratio">
    Богатый набор пресетов, охватывающих вертикальный, горизонтальный, квадратный и кинематографический широкоформатный режимы
  </Card>

  <Card title="Переключение между двумя моделями" icon="layers">
    Переключайте между `gemini-3-pro-image-preview` (Pro) и `gemini-3.1-flash-image-preview` (Flash)
  </Card>

  <Card title="Таймаут и повторные попытки" icon="refresh-cw">
    `timeout_seconds` (10-600s) + `retry_times` (1-20) — стабильно даже в часы пик
  </Card>

  <Card title="Прогресс в реальном времени" icon="gauge">
    Встроенное отображение статуса / процента / прошедшего времени — больше никаких непрозрачных запусков
  </Card>

  <Card title="Нативные режимы seed" icon="dices">
    Поддерживает стандартные в ComfyUI шаблоны seed: фиксированный / случайный / с увеличением / с уменьшением
  </Card>

  <Card title="Двойная лицензия MIT / Apache-2.0" icon="shield">
    Либеральная лицензия — коммерческое использование и производные работы приветствуются
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Модель                | ID модели                        | Использование                                                                    | Документация API                                            |
| --------------------- | -------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | Высококачественная генерация изображений и редактирование нескольких изображений | [Просмотр](/ru/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | Быстрая генерация, более низкая стоимость                                        | [Просмотр](/ru/api-capabilities/gemini/native)              |

## Параметры узла

| Параметр                | Тип    | Обязательно | По умолчанию                 | Описание                                                             |
| ----------------------- | ------ | ----------- | ---------------------------- | -------------------------------------------------------------------- |
| `api_key`               | string | Yes         | -                            | token APIYI — мы рекомендуем выделенный ключ с лимитом использования |
| `prompt`                | string | Yes         | -                            | Инструкция для генерации или редактирования                          |
| `model`                 | enum   | Yes         | `gemini-3-pro-image-preview` | Выбор модели (Pro / Flash)                                           |
| `image_size`            | enum   | No          | `2K`                         | Разрешение вывода (1K / 2K / 4K)                                     |
| `aspect_ratio`          | enum   | No          | `1:1`                        | Одно из 15 соотношений сторон                                        |
| `timeout_seconds`       | int    | No          | 120                          | Тайм-аут на один запрос (10-600s)                                    |
| `retry_times`           | int    | No          | 3                            | Количество повторных попыток при сбое (1-20)                         |
| `seed`                  | int    | No          | 0                            | Случайный seed (работает с режимами seed в ComfyUI)                  |
| `image_01` … `image_14` | IMAGE  | No          | -                            | Необязательные эталонные изображения (до 14)                         |

## Installation

<Steps>
  <Step title="Шаг 1: Клонируйте в custom_nodes">
    Внутри вашей установки ComfyUI:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-LuckNanoBananaPro.git
    ```
  </Step>

  <Step title="Шаг 2: Установите зависимости">
    ```bash theme={null}
    cd Comfyui-LuckNanoBananaPro
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="Шаг 3: Перезапустите ComfyUI">
    Найдите `Luck Nano Banana Pro` в палитре узлов.
  </Step>

  <Step title="Шаг 4: Настройте ключ APIYI">
    * Перейдите в [APIYI Console](https://www.apiyi.com) → Токены, **создайте отдельный ключ с лимитом использования** (лучшая практика)
    * Вставьте ключ в поле `api_key`
    * Узел уже указывает на `api.apiyi.com` — настройка эндпоинта не требуется
  </Step>

  <Step title="Шаг 5: Соберите свой workflow">
    * **Текст-в-изображение**: просто укажите `prompt`, оставьте входы изображений пустыми
    * **Редактирование нескольких изображений**: подключите несколько `Load Image` к `image_01`, `image_02` и т. д., с prompt, описывающим правку
  </Step>
</Steps>

## Примеры использования

### Пример 1: Текст-в-изображение с высокой стабильностью

```
prompt: "Cinematic product shot of a minimalist ceramic teacup on a wooden tray, soft morning light, 35mm lens, shallow depth of field"
model: gemini-3-pro-image-preview
image_size: 4K
aspect_ratio: 3:2
timeout_seconds: 300
retry_times: 5
```

### Пример 2: Смешивание нескольких изображений

```
image_01: person photo
image_02: outfit reference
image_03: scene reference
image_04: lighting reference
prompt: "Photorealistic portrait: subject from image_01 wearing outfit from image_02, in the setting of image_03, with lighting style of image_04"
image_size: 2K
aspect_ratio: 4:5
```

### Пример 3: Перебор seed

Используйте встроенное управление seed в режиме `increment`, чтобы пакетно запускать несколько seed и сравнивать варианты одного и того же prompt.

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Не найден узел после установки?">
    1. Убедитесь, что репозиторий находится в `ComfyUI/custom_nodes/Comfyui-LuckNanoBananaPro`
    2. Зависимости установлены без ошибок (особенно requests / Pillow / numpy)
    3. Полностью перезапустите ComfyUI (одного обновления недостаточно)
  </Accordion>

  <Accordion title="4K часто уходит в таймаут?">
    Узел позволяет настраивать `timeout_seconds` напрямую:

    * Начните с `timeout_seconds=300` для 4K
    * Используйте вместе с `retry_times=5` для автоматических повторов при сетевых флуктуациях
    * Если по-прежнему нестабильно, см. [Скачивание изображений/видео с CDN медленное](/ru/faq/cdn-download-slow), чтобы оптимизировать сетевой путь
  </Accordion>

  <Accordion title="Будут ли использоваться все 14 reference images?">
    Вы можете подключить до 14, но **будут ли они фактически использованы** зависит от вашего prompt. Явно укажите их в prompt (например, `image_01`, `image_02`) или опишите роль каждого — model учтет ваши указания.
  </Accordion>

  <Accordion title="Вызовы возвращают 401 / 403?">
    1. Проверьте `api_key` и убедитесь, что он не ограничен неправильным каналом
    2. Выбранный model должен быть в белом списке token
    3. Баланс аккаунта — см. [Баланс вроде достаточный, но вызовы не проходят](/ru/faq/balance-insufficient)
  </Accordion>

  <Accordion title="Чем это отличается от двух других узлов Nano Banana для ComfyUI?">
    * [nano-banana-comfyui (полнофункциональный)](/ru/scenarios/ecosystem/nano-banana-comfyui): делает акцент на **диалоговом редактировании** и памяти между несколькими ходами
    * [apiyi-nano-banana-node (lite)](/ru/scenarios/ecosystem/apiyi-nano-banana-node): минимальный код, отлично подходит для обучения/настройки
    * **Luck Nano Banana Pro (эта страница)**: инженерные параметры (timeout / retry / 14 images), создан для пакетной обработки и production
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/ru/api-capabilities/nano-banana-image/overview">
    Полные возможности модели и справочник API
  </Card>

  <Card title="Luck GPT-Image 2 (тот же автор)" icon="puzzle" href="/ru/scenarios/ecosystem/luckgpt2-comfyui">
    Узлы ComfyUI линейки OpenAI от luckdvr: `gpt-image-2` + `gpt-image-2-all`
  </Card>

  <Card title="Коллекция узлов ComfyUI" icon="workflow" href="/ru/scenarios">
    Просмотрите все узлы Nano Banana для ComfyUI
  </Card>

  <Card title="FAQ: медленная загрузка с CDN" icon="gauge" href="/ru/faq/cdn-download-slow">
    Изображения 4K загружаются медленно? Прочитайте это
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Управляйте ключами, использованием и каналами
  </Card>
</CardGroup>
