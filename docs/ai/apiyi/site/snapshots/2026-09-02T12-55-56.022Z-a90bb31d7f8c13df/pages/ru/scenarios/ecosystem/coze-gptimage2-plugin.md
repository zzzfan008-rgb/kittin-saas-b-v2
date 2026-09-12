> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 2 Coze Plugin

> Пользовательский Python-плагин для платформы Coze, который оборачивает вызовы GPT Image 2, классификацию ошибок и конвейер загрузки в OSS через APIYI, чтобы рабочие процессы Coze могли выполнять text-to-image, image-to-image и прямую доставку результата.

## Обзор

Это пользовательский Python-плагин для платформы Coze (`coze.cn`), который оборачивает модель OpenAI GPT Image 2 (`gpt-image-2`) через шлюз **APIYI** в узел, к которому рабочие процессы Coze могут обращаться напрямую. Плагин поставляется с полной сборкой запроса, классификацией кодов ошибок, обнаружением фильтрации по безопасности контента и конвейером загрузки в Alibaba Cloud OSS. **Он возвращает общедоступный URL, готовый к отображению**, избавляя вас от необходимости строить в рабочем процессе Coze ещё один шаг перенаправления результата.

<Info>
  **Информация о проекте**

  * 📦 Распространение: предоставляется как кодовый пакет (**не опубликован на GitHub**)
  * 👤 Автор: вклад сообщества
  * 🎯 Целевая платформа: пользовательские плагины Coze (Китай / глобально)
  * 🔌 Используемая модель: `gpt-image-2` (APIYI, выпущена 21 апреля 2026 г.)
  * 🌐 Шлюз: [APIYI](https://api.apiyi.com) — прямой доступ из материкового Китая, VPN не требуется
  * 📝 Полный исходный код приведён ниже в разделе «Полный исходный код плагина», готов к копированию и использованию
</Info>

## Об APIYI шлюзе

[APIYI](https://api.apiyi.com) — это шлюз для GPT Image 2 с прямым подключением из материкового Китая, предлагающий три маршрута, которые используют один и тот же API Key:

| Домен           | Описание             |
| --------------- | -------------------- |
| `api.apiyi.com` | Маршрут по умолчанию |
| `vip.apiyi.com` | VIP-маршрут          |
| `b.apiyi.com`   | Резервный маршрут    |

APIYI предлагает три способа доступа к GPT Image 2:

| ID модели         | Канал             | Тарификация          | Скорость генерации | Особенности                                                                                          |
| ----------------- | ----------------- | -------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `gpt-image-2`     | Официальный релей | Тарификация по token | \~120s             | Полная совместимость с официальным OpenAI API, поддерживает quality/size/4K                          |
| `gpt-image-2-all` | Reverse (ChatGPT) | \$0.03/image         | 30-60s             | Подходит для китайских пользователей, вызывается через Chat endpoint, возвращает image URLs напрямую |
| `gpt-image-2-vip` | Reverse (Codex)   | \$0.03/image         | 90-150s            | 30 заблокированных пресетов размера, включая 4K                                                      |

> Этот плагин по умолчанию использует **`gpt-image-2` (официальный релей)**, полностью совместим с официальным OpenAI API и поддерживает полный контроль параметров. Если вам нужна более быстрая генерация, переключитесь в режим `gpt-image-2-all` (см. ниже).

<Tip>
  Запросите API Key (начинающийся с `sk-`) в [консоли APIYI](https://api.apiyi.com/token). Рекомендуем установить дневной лимит квоты (например, ¥20-50), чтобы держать расходы под контролем.
</Tip>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Единая точка входа text-to-image / image-to-image" icon="wand-sparkles">
    Автоматически переключается между режимами text-to-image (/v1/images/generations) и editing (/v1/images/edits) в зависимости от того, пуст ли fileurls — не нужно создавать два отдельных узла в вашем workflow Coze
  </Card>

  <Card title="Прямой доступ из материкового Китая, без VPN" icon="bolt">
    Все запросы проходят через шлюз APIYI (api.apiyi.com) — он доступен напрямую из китайских сетей, с низкой задержкой и надежной стабильностью
  </Card>

  <Card title="Редактирование по нескольким reference images" icon="images">
    Передайте список URL изображений, и плагин загрузит их и внедрит в запрос как загрузки файлов multipart/form-data — до 16 референсных изображений (каждое ≤ 50MB), сохраняя исходные детали изображения
  </Card>

  <Card title="Тонкая классификация ошибок" icon="shield-check">
    Различает MODERATION\_BLOCKED, INVALID\_API\_KEY, RATE\_LIMIT, SERVER\_ERROR, TIMEOUT, NO\_DATA и другие причины сбоев, что упрощает ветвление workflow
  </Card>

  <Card title="Двухэтапная проверка безопасности контента" icon="ban">
    Различает moderation\_blocked (400) на этапе ввода и content\_filter (200) на этапе вывода, и при срабатывании возвращает понятное сообщение об отказе, избегая бессмысленных повторных попыток
  </Card>

  <Card title="Прямая загрузка в OSS" icon="cloud-upload">
    Сгенерированное base64-изображение загружается напрямую в Alibaba Cloud OSS — workflow получает URL, готовый для внешнего обмена или хранения
  </Card>

  <Card title="Тонкая настройка параметров" icon="sliders-horizontal">
    Поддерживает quality (low/medium/high/auto), moderation (auto/low), output\_format (png/jpeg/webp) и другие параметры, чтобы вы могли настроить стратегию генерации по мере необходимости
  </Card>
</CardGroup>

## Поддерживаемые модели

| Модель                          | Model ID          | Назначение                                                                                    | Документация API                                                                 |
| ------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| GPT Image 2 (официальный релей) | `gpt-image-2`     | Text-to-image, image-to-image (редактирование), полностью совместимо с официальным API OpenAI | [Посмотреть документацию](/ru/api-capabilities/gpt-image-2/overview)             |
| GPT Image 2-All (обратный)      | `gpt-image-2-all` | Text-to-image, image-to-image через Chat-endpoint, адаптировано для китайского языка          | [Посмотреть документацию](/en/api-capabilities/gpt-image-2-all/chat-completions) |
| GPT Image 2-VIP (обратный)      | `gpt-image-2-vip` | Генерация фиксированного размера с 30 предустановками размеров, включая 4K                    | [Посмотреть документацию](/ru/api-capabilities/gpt-image-2-vip/overview)         |

<Tip>
  По умолчанию плагин использует `gpt-image-2` (официальный релей), с эндпоинтами `https://api.apiyi.com/v1/images/generations` (text-to-image) и `https://api.apiyi.com/v1/images/edits` (image-to-image), и требует действительный APIYI API Key (начинающийся с `sk-`). Чтобы переключить маршруты, измените `API_BASE` в коде на `https://vip.apiyi.com/v1` или `https://b.apiyi.com/v1`.
</Tip>

## GPT Image 2 Основные характеристики

| Возможность                 | Описание                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Дата выпуска**            | 21 апреля 2026                                                                                                      |
| **Максимальное разрешение** | 3840×2160 (4K), общее число пикселей ≤ 8,294,400                                                                    |
| **Соотношения сторон**      | 1:1 / 16:9 / 9:16 / 4:3 / 3:2 / 3:1 / 1:3                                                                           |
| **Уровни качества**         | low / medium / high / auto (по умолчанию)                                                                           |
| **Форматы вывода**          | png (по умолчанию) / jpeg / webp                                                                                    |
| **Сжатие вывода**           | 0-100 (только jpeg / webp)                                                                                          |
| **Режимы фона**             | auto / opaque / transparent (модель поддерживает прозрачность; **этот плагин пока не предоставляет этот параметр**) |
| **Уровень модерации**       | auto (по умолчанию) / low                                                                                           |
| **Рендеринг текста**        | Точность > 99%                                                                                                      |
| **Изображений на запрос**   | 1 (`n` поддерживает только 1)                                                                                       |
| **Формат ответа**           | b64\_json (raw base64, без префикса data:image)                                                                     |
| **input\_fidelity**         | Зафиксирован на high, **передавать нельзя** (при передаче возвращается ошибка 400)                                  |

## Эндпоинты API

| Эндпоинт                                      | Method | Content-Type          | Назначение                                                                                                   |
| --------------------------------------------- | ------ | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `https://api.apiyi.com/v1/images/generations` | POST   | `application/json`    | Генерация изображения по тексту (создание на основе текстового prompt)                                       |
| `https://api.apiyi.com/v1/images/edits`       | POST   | `multipart/form-data` | Генерация изображения по изображению (загрузите эталонные изображения через `-F "image[]=@file"`, до 16 шт.) |

> Чтобы переключить маршруты: `https://vip.apiyi.com/v1/...` или `https://b.apiyi.com/v1/...`. Все маршруты функционально идентичны.

## Архитектура плагина

<img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-architecture.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=50eb8b0eafa03c71cb5a6863af7b872a" alt="Диаграмма архитектуры плагина GPT Image 2 Coze" width="1840" height="2100" data-path="images/coze-gptimage2-architecture.png" />

Основная цепочка вызовов плагина:

```text theme={null}
Coze workflow inputs (cleantext / fileurls / aspect_ratio / resolution / quality / apikey)
        ↓
    handler() entry point
        ↓
    Check whether reference images exist (fileurls)
        ↓            ↓
  Text-to-image   Image-to-image
    ↓            ↓
 POST api.apiyi.com/v1/images/generations   POST api.apiyi.com/v1/images/edits
   (application/json)                         (multipart/form-data)
    ↓            ↓
   Parse response / classify error codes
        ↓
upload_base64_to_oss()  — upload to Alibaba Cloud OSS
        ↓
Return { analysis, url, error }
```

## Справочник по разрешению и размеру

Плагин автоматически выбирает размер из `aspect_ratio` и `resolution` (на основе официальных пресетов APIYI):

| Соотношение сторон | 1K (размер / пиксели) | 2K (размер / пиксели) | 4K (размер / пиксели) |
| ------------------ | --------------------- | --------------------- | --------------------- |
| 1:1                | 1024×1024 ≈ 1.0M      | 2048×2048 ≈ 4.2M      | 3840×2160 ≈ 8.3M      |
| 16:9               | 1536×1024 ≈ 1.6M      | 2048×1152 ≈ 2.4M      | 3840×2160 ≈ 8.3M      |
| 9:16               | 1024×1536 ≈ 1.6M      | 1152×2048 ≈ 2.4M      | 2160×3840 ≈ 8.3M      |
| 4:3                | 1024×768 ≈ 0.8M       | 2048×1536 ≈ 3.1M      | 3264×2448 ≈ 8.0M      |
| 3:2                | 1536×1024 ≈ 1.6M      | 2048×1360 ≈ 2.8M      | 3456×2304 ≈ 8.0M      |
| 3:1                | 1536×512 ≈ 0.8M       | 3072×1024 ≈ 3.1M      | 3840×1280 ≈ 4.9M      |
| 1:3                | 512×1536 ≈ 0.8M       | 1024×3072 ≈ 3.1M      | 1280×3840 ≈ 4.9M      |

> **Ограничения**: каждое измерение должно делиться на 16, соотношение сторон ≤ 3:1, общее число пикселей ≤ 8,294,400.
>
> **Примечание**: 1:1 при 4K выводит 3840×2160 (альбомная ориентация 16:9), а не квадрат — это ограничение API, и фактическое соотношение сторон становится 16:9. Выводы выше `2560×1440` по-прежнему являются экспериментальными; для production рекомендуется использовать пресетные размеры.

## Входные и выходные параметры

### Вход (`Input`)

| Параметр        | Тип       | Обязательно | По умолчанию | Описание                                                                                         |
| --------------- | --------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------ |
| `cleantext`     | string    | Да          | —            | Текстовый prompt пользователя или инструкция по редактированию (до 32 000 символов)              |
| `fileurls`      | string\[] | Нет         | —            | Список URL эталонных изображений; оставьте пустым для text-to-image                              |
| `aspect_ratio`  | string    | Да          | —            | Соотношение сторон, например `1:1`, `16:9`, `9:16`                                               |
| `resolution`    | string    | Да          | —            | Разрешение, должно быть в верхнем регистре: `1K` / `2K` / `4K`                                   |
| `quality`       | string    | Нет         | `auto`       | Уровень качества: `low` / `medium` / `high` / `auto`                                             |
| `moderation`    | string    | Нет         | `auto`       | Уровень модерации: `auto` / `low` (ослабленная модерация)                                        |
| `output_format` | string    | Нет         | `png`        | Формат вывода: `png` / `jpeg` / `webp`                                                           |
| `apikey`        | string    | Да          | —            | APIYI API Key (начинается с `sk-`, запросите его в [консоли APIYI](https://api.apiyi.com/token)) |

### Выход (`Output`)

| Поле       | Тип            | Описание                                          |
| ---------- | -------------- | ------------------------------------------------- |
| `analysis` | string         | Текст статуса: `图片生成成功` (успех) / `图片生成失败` (сбой) |
| `url`      | string \| null | При успехе — публичный OSS URL                    |
| `error`    | string \| null | При сбое — понятное описание ошибки               |

## Этапы развертывания

<Steps>
  <Step title="Шаг 1: Подготовьте ключ API APIYI и учетные данные OSS">
    * Запросите ключ API (начинающийся с `sk-`) в [консоли APIYI](https://api.apiyi.com/token); рекомендуем установить дневной лимит квоты (например, ¥20-50)
    * Создайте bucket OSS в Alibaba Cloud и подаккаунт RAM с разрешением `oss:PutObject` для этого bucket
    * Запишите `AccessKey ID`, `AccessKey Secret`, `Bucket name` и `Endpoint` (например, `oss-cn-beijing.aliyuncs.com`)
  </Step>

  <Step title="Шаг 2: Найдите и установите плагин в маркетплейсе плагинов Coze">
    1. Перейдите в рабочее пространство Coze → Плагины → Маркетплейс плагинов
    2. Найдите 'GPT Image 2' или 'APIYI', чтобы найти этот плагин
    3. Откройте карточку плагина, чтобы просмотреть сведения, затем нажмите 'Добавить', чтобы установить его в ваше рабочее пространство

           <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-plugin-market.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=58d8111524c893c61aae7c52f4fb68db" alt="Поиск в маркетплейсе плагинов Coze" width="1450" height="738" data-path="images/coze-gptimage2-plugin-market.png" />
  </Step>

  <Step title="Шаг 3: Скопируйте код плагина">
    Вставьте полный Python-код из раздела 'Полный исходный код плагина' ниже в Coze IDE и замените конфигурацию Alibaba Cloud OSS вверху на свою:

    ```python theme={null}
    # API易 线路配置（可选）
    API_BASE = "https://api.apiyi.com/v1"
    # 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

    # 阿里云 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名称"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="Шаг 4: Настройте метаданные и входные/выходные параметры">
    Настройте типы полей Input / Output и обязательные флаги, как показано ниже, в соответствии с полями `args.input` в коде:

    Настройка входных параметров:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-basic-info.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=f06e617314b795c936cb5605a28746d0" alt="Основная информация о плагине Coze" width="1611" height="458" data-path="images/coze-gptimage2-basic-info.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-input-params.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=410d34cca5c9aa191df0add21a51a848" alt="Настройка входных параметров плагина Coze" width="1617" height="505" data-path="images/coze-gptimage2-input-params.png" />

    Настройка выходных параметров:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-1.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=c590fca7d3196326aebddb3a7dbdefda" alt="Настройка выходных параметров плагина Coze (часть 1)" width="1606" height="695" data-path="images/coze-gptimage2-output-params-1.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-2.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=5546f08b19320ba2f6332555eef8f3c2" alt="Настройка выходных параметров плагина Coze (часть 2)" width="1577" height="373" data-path="images/coze-gptimage2-output-params-2.png" />
  </Step>

  <Step title="Шаг 5: Протестируйте и опубликуйте">
    * Заполните тестовые параметры в Coze IDE (начните с `quality=low` + `resolution=1K` + простого prompt, чтобы проверить конвейер APIYI)
    * После успешного тестирования нажмите 'Опубликовать' и перетащите плагин в любой workflow
  </Step>
</Steps>

## Стратегия классификации ошибок

Плагин не просто сообщает `success=True/False` — он классифицирует причину сбоя в следующем порядке приоритета, чтобы ваш workflow Coze мог ветвиться соответствующим образом:

| Приоритет | Тип ошибки              | Условие срабатывания                                | Рекомендуемое действие                                                                                       |
| --------- | ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1         | `MODERATION_BLOCKED`    | HTTP 400 / 403, блокировка по безопасности контента | Промпт или изображение вызвали модерацию; переформулируйте и повторите — **не повторяйте с исходным вводом** |
| 2         | `INVALID_API_KEY`       | HTTP 401                                            | Проверьте, корректен ли APIYI API Key или не истёк ли срок его действия                                      |
| 3         | `RATE_LIMIT`            | HTTP 429                                            | Превышен лимит запросов; попробуйте переключить маршруты или снизить параллельные запросы                    |
| 4         | `SERVER_ERROR`          | HTTP 500 / 502 / 503                                | Сбой на стороне сервера APIYI / OpenAI; сделайте паузу и повторите 2-3 раза                                  |
| 5         | `BAD_REQUEST`           | HTTP 400 (не связанная с модерацией)                | Проверьте параметры: допустимость размера или не был ли по ошибке передан input\_fidelity                    |
| 6         | `TIMEOUT`               | Запрос превысил тайм-аут, зависящий от качества     | Снизьте качество или разрешение и повторите                                                                  |
| 7         | `NO_DATA`               | `data` в ответе пусто                               | Повторите                                                                                                    |
| 8         | `NO_IMAGE_DATA`         | Поле `b64_json` пустое                              | Повторите                                                                                                    |
| 9         | `IMAGE_DOWNLOAD_FAILED` | Не удалось скачать URL референсного изображения     | Проверьте доступность URL                                                                                    |
| 10        | `EDIT_FAILED`           | Эндпоинт редактирования вернул не-200               | Проверьте формат референсного изображения, количество (≤16) и размер каждого изображения (≤50MB)             |

### Двухэтапная фильтрация контента

GPT Image 2 использует **двухэтапную фильтрацию по безопасности контента**, в отличие от Nano Banana Pro:

```text theme={null}
User request
    ↓
[Stage 1: Input Filter]
    ├── Blocked → HTTP 400 / 403 (moderation_blocked)
    │          ↑ Rewriting the prompt fixes it (free, not billed)
    ├── Passed ↓
[Model inference generates the image] (billed at this point)
    ↓
[Stage 2: Output Filter]
    ├── Blocked → HTTP 200 but empty b64_json (content_filter, already billed)
    ├── Passed ↓
Image returned (HTTP 200)
```

| Параметр            | moderation\_blocked            | content\_filter                |
| ------------------- | ------------------------------ | ------------------------------ |
| Стадия срабатывания | Стадия ввода                   | Стадия вывода                  |
| HTTP status         | 400                            | 200                            |
| Списывается         | Нет                            | **Да** (инференс уже завершён) |
| Как исправить       | Переформулируйте текст промпта | Переработайте всю сцену        |

### Типичные триггеры moderation\_blocked

| # | Сценарий                                      | Примечания                                        |
| - | --------------------------------------------- | ------------------------------------------------- |
| 1 | Портреты реальных людей / имена знаменитостей | Elon Musk, Taylor Swift и т. д.                   |
| 2 | Имена живых художников                        | Hayao Miyazaki = блокируется, Van Gogh = разрешён |
| 3 | Персонажи / IP, защищённые авторским правом   | Spider-Man, Pikachu, Mickey Mouse и т. д.         |
| 4 | Насилие / gore / детали оружия                | Блокируется автоматически                         |
| 5 | Сексуальные намёки / откровенная одежда       | Описания вроде bikini, tight-fitting, sexy        |
| 6 | Фотореалистичные изображения детей            | Практически нулевая терпимость                    |
| 7 | Символика ненависти / политический экстремизм | Блокируется автоматически                         |

### Ошибки, специфичные для APIYI

| Ошибка                    | Причина                                      | Исправление                                   |
| ------------------------- | -------------------------------------------- | --------------------------------------------- |
| 401 + `invalid_api_key`   | В Key отсутствует префикс `sk-` или он истёк | Скопируйте полный Key из консоли APIYI        |
| 404 Not Found             | У base\_url отсутствует суффикс `/v1`        | Убедитесь, что это `https://api.apiyi.com/v1` |
| 429 + частые срабатывания | Достигнут лимит запросов APIYI               | Переключите маршруты и повторите              |
| Тайм-аут соединения       | Колебания DNS / сети                         | Попробуйте другой маршрут и повторите         |

## Ожидаемая задержка в зависимости от разрешения/качества

| Разрешение     | Качество | Ожидаемая задержка | Тайм-аут плагина |
| -------------- | -------- | ------------------ | ---------------- |
| 1K (1024×1024) | низкий   | 3-8 s              | 180 s            |
| 1K (1024×1024) | средний  | 20-40 s            | 360 s            |
| 1K (1024×1024) | высокий  | 145-280 s          | 900 s            |
| 2K (2048×2048) | средний  | 80-120 s           | 360 s            |
| 2K (2048×2048) | высокий  | 200-250 s          | 900 s            |
| 4K (3840×2160) | средний  | 150-200 s          | 360 s            |
| 4K (3840×2160) | высокий  | 300-600 s          | 900 s            |

> Рекомендация: используйте `resolution=1K + quality=medium` для повседневной работы (20-40 s на изображение) и `resolution=4K + quality=high` для итоговых материалов.
>
> При `quality=auto` (опущено или установлено в auto) плагин применяет единый тайм-аут 360 секунд, а API определяет фактический уровень качества.

## Полный исходный код плагина

Ниже приведён полный код `coze-gptimage2.py`, готовый к прямой вставке в Coze IDE. **Перед использованием нужно изменить только конфигурацию OSS вверху**.

<Note>
  Исходный код плагина сохраняется без изменений, как был предоставлен; комментарии и строки ошибок, видимые пользователю, на китайском языке и могут быть свободно локализованы под ваш рабочий процесс.
</Note>

```python coze-gptimage2.py theme={null}
from runtime import Args
from typings.gptimage2.gptimage2 import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re


# ╔══════════════════════════════════════════════════════════╗
# ║           API易 线路配置（按需切换）                      ║
# ╚══════════════════════════════════════════════════════════╝
API_BASE = "https://api.apiyi.com/v1"
# 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

# ╔══════════════════════════════════════════════════════════╗
# ║              阿里云 OSS 配置（请修改为你的值）            ║
# ╚══════════════════════════════════════════════════════════╝
ACCESS_KEY_ID = ""          # 填入你的阿里云 Access Key ID
ACCESS_KEY_SECRET = ""      # 填入你的阿里云 Access Key Secret
BUCKET_NAME = ""            # 填入你的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com"  # 填入你的 OSS Endpoint

# ╔══════════════════════════════════════════════════════════╗
# ║       质量超时配置（GPT Image 2 基于 quality 分级）       ║
# ╚══════════════════════════════════════════════════════════╝
TIMEOUT = {
    "low": 180,     # 低质量快速出图（3-8 秒实际耗时）
    "medium": 360,  # 中等质量（20-40 秒实际耗时，推荐）
    "high": 900,    # 高质量精细渲染（145-280 秒实际耗时）
}

# ╔══════════════════════════════════════════════════════════╗
# ║     分辨率 → 尺寸映射表（宽高比 × 分辨率 → W×H）          ║
# ╚══════════════════════════════════════════════════════════╝
RESOLUTION_SIZES = {
    "1:1":  {"1K": "1024x1024", "2K": "2048x2048", "4K": "3840x2160"},
    "16:9": {"1K": "1536x1024", "2K": "2048x1152", "4K": "3840x2160"},
    "9:16": {"1K": "1024x1536", "2K": "1152x2048", "4K": "2160x3840"},
    "4:3":  {"1K": "1024x768",  "2K": "2048x1536", "4K": "3264x2448"},
    "3:2":  {"1K": "1536x1024", "2K": "2048x1360", "4K": "3456x2304"},
    "3:1":  {"1K": "1536x512",  "2K": "3072x1024", "4K": "3840x1280"},
    "1:3":  {"1K": "512x1536",  "2K": "1024x3072", "4K": "1280x3840"},
}


# ==============================
# OSS 上传工具
# ==============================

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回公网 URL
    支持带 data:image/...;base64, 前缀和纯 base64 两种情况
    """
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/gptimage2_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"


# ==============================
# 工具函数
# ==============================

def get_size(aspect_ratio: str, resolution: str) -> str:
    """根据宽高比和分辨率获取推荐尺寸"""
    ratio_map = RESOLUTION_SIZES.get(aspect_ratio, RESOLUTION_SIZES["1:1"])
    return ratio_map.get(resolution, ratio_map.get("1K", "1024x1024"))


def guess_mime_from_url(url: str) -> str:
    """根据 URL 后缀猜测 MIME 类型"""
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    return "image/png"


# ==============================
# 核心：GPT Image 2 生图 / 编辑
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str,
                   quality: str, apikey: str, output_format: str = "png",
                   moderation: str = "auto", image_urls=None):
    """
    GPT Image 2 文生图 / 图生图核心函数

    - image_urls 为空：纯文生图 → API易 /v1/images/generations（JSON）
    - image_urls 不为空：参考图编辑 → API易 /v1/images/edits（multipart/form-data）
    """

    size = get_size(aspect_ratio, resolution)
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # ── 分支 1：有参考图 → 图生图（编辑） ──
    if image_urls:
        return _generate_edit(prompt, size, quality, apikey,
                              output_format, moderation, image_urls, headers)

    # ── 分支 2：无参考图 → 文生图（/v1/images/generations，JSON）──
    payload = {
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": size,
    }
    if quality and quality != "auto":
        payload["quality"] = quality
    if output_format and output_format != "png":
        payload["output_format"] = output_format
    if moderation and moderation != "auto":
        payload["moderation"] = moderation

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/generations"

    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=timeout_seconds
        )

        # ── HTTP 错误分发 ──
        if response.status_code in (400, 403):
            try:
                err_body = response.json()
                err = err_body.get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text

            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过\n"
                             "您的提示词触发了内容安全策略，"
                             "请修改提示词后重试（不要用原提示词重试）",
                }
            return {
                "success": False,
                "errorType": "BAD_REQUEST",
                "error": f"❌ 请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity，或 background:transparent 配了 output_format:jpeg",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效\n请检查您的 API易 API 密钥是否正确，"
                        "或是否已过期。可在 https://api.apiyi.com/token 查看",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限\nAPI 调用过于频繁，"
                        "可尝试切换线路或降低并发",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}），"
                        "请稍后重试或尝试切换线路",
            }

        if response.status_code != 200:
            return {
                "success": False,
                "errorType": "HTTP_ERROR",
                "error": f"HTTP {response.status_code}: "
                        f"{(response.text or '')[:500]}",
            }

        # ── JSON 解析 ──
        try:
            data = response.json()
        except ValueError:
            return {
                "success": False,
                "errorType": "INVALID_JSON",
                "error": "响应不是有效 JSON",
            }

        images = data.get("data", [])
        if not isinstance(images, list) or len(images) == 0:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "生成失败：未返回图片数据（可能触发了 output filter）",
                "response": data,
            }

        # ── 提取 b64_json（API易 返回纯 base64，无 data:image 前缀）──
        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "生成失败：b64_json 为空（可能被 content_filter 过滤）",
                "response": data,
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片生成请求超时"
                     f"（超过 {timeout_seconds} 秒，"
                     f"当前 quality={quality}）\n"
                     f"建议降低 quality 或 resolution 重试",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片生成请求失败: {str(e)}",
        }


def _generate_edit(prompt: str, size: str, quality: str,
                   apikey: str, output_format: str, moderation: str,
                   image_urls: list, headers: dict):
    """
    GPT Image 2 图生图（编辑）子函数
    调用 API易 /v1/images/edits 端点（multipart/form-data 方式上传参考图）

    注意：API易 的 /v1/images/edits 要求 Content-Type: multipart/form-data，
    通过 -F "image[]=@file" 方式传图，不支持 JSON base64 data URI。
    参考图数量最多 16 张，单张 ≤ 50MB（建议压到 1.5MB 以内）。
    """

    # ── 下载参考图到内存 ──
    image_files = []
    for i, url in enumerate(image_urls):
        try:
            resp = requests.get(url, timeout=180)
            if resp.status_code != 200:
                return {
                    "success": False,
                    "errorType": "IMAGE_DOWNLOAD_FAILED",
                    "error": f"图片获取失败（{url}）HTTP {resp.status_code}",
                }
            mime = guess_mime_from_url(url)
            ext = mime.split("/")[-1]  # png / jpeg / webp
            if ext == "jpeg":
                ext = "jpg"
            image_files.append(
                ("image[]", (f"image{i}.{ext}", io.BytesIO(resp.content), mime))
            )
        except Exception as e:
            return {
                "success": False,
                "errorType": "IMAGE_DOWNLOAD_FAILED",
                "error": f"图片获取失败（{url}）: {e}",
            }

    # ── 构造 multipart/form-data 请求（-F 方式）──
    form_data = {
        "model": "gpt-image-2",
        "prompt": prompt,
    }
    if size:
        form_data["size"] = size
    if quality and quality != "auto":
        form_data["quality"] = quality
    if output_format and output_format != "png":
        form_data["output_format"] = output_format
    if moderation and moderation != "auto":
        form_data["moderation"] = moderation

    # multipart/form-data 不传 Content-Type（让 requests 自动生成 boundary）
    auth_headers = {
        "Authorization": headers["Authorization"],
    }

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/edits"

    try:
        response = requests.post(
            api_url,
            headers=auth_headers,
            data=form_data,
            files=image_files,
            timeout=timeout_seconds
        )

        # ── 错误处理 ──
        if response.status_code in (400, 403):
            try:
                err = response.json().get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text[:500]
            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过",
                }
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity、"
                         "超过 16 张参考图或单张超过 50MB",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限，可尝试切换线路重试",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}）",
            }

        if response.status_code != 200:
            try:
                err = response.json().get("error", {}).get("message", "")
            except Exception:
                err = response.text[:500]
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑失败（HTTP {response.status_code}）: {err}",
            }

        # ── 提取图片（b64_json 是纯 base64，无前缀）──
        data = response.json()
        images = data.get("data", [])
        if not images:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "编辑结果为空",
            }

        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "编辑结果图片数据为空",
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片编辑请求超时（超过 {timeout_seconds} 秒）",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片编辑请求失败: {str(e)}",
        }


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / GPT Image 2（API易 代理）节点入口

    - args.input.cleantext:    用户文字提示词
    - args.input.fileurls:     参考图 URL 列表（用于图生图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "16:9" / "9:16"
    - args.input.resolution:   分辨率，如 "1K" / "2K" / "4K"
    - args.input.quality:      质量等级，如 "low" / "medium" / "high"（默认 auto）
    - args.input.moderation:   审核强度，如 "auto" / "low"（默认 auto）
    - args.input.output_format: 输出格式，如 "png" / "jpeg" / "webp"（默认 png）
    - args.input.apikey:       API易 API Key（sk-开头）
    """
    API_KEY = args.input.apikey
    cleantext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspect_ratio = args.input.aspect_ratio or "1:1"
    resolution = args.input.resolution or "1K"
    quality = getattr(args.input, 'quality', None) or "auto"
    output_format = getattr(args.input, 'output_format', None) or "png"
    moderation = getattr(args.input, 'moderation', None) or "auto"

    prompt = cleantext.strip()
    if not prompt:
        prompt = "根据参考图片进行合理的编辑与优化。"

    # 调用 GPT Image 2 生图 / 编辑
    result = generate_image(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        quality=quality,
        apikey=API_KEY,
        output_format=output_format,
        moderation=moderation,
        image_urls=fileurls if fileurls else None
    )

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {
            "analysis": "图片生成成功",
            "url": oss_url,
            "error": None,
        }
    else:
        return {
            "analysis": "图片生成失败",
            "url": None,
            "error": result.get("error", "未知错误"),
        }
```

## Опционально: gpt-image-2-all в быстром режиме

Если вам нужна **более быстрая генерация (30-60s) и вас не интересует контроль параметра размера**, вы можете переключить плагин на `gpt-image-2-all` от APIYI (обратная версия), вызываемую через эндпоинт Chat Completions. Этот режим стоит \$0.03/изображение и напрямую возвращает URL изображений, без необходимости разбирать base64.

Основное изменение (просто замените функцию `generate_image`):

```python theme={null}
def generate_image_chat(prompt: str, apikey: str, image_urls=None):
    """
    gpt-image-2-all 快速模式（通过 API易 Chat Completions 端点）
    价格 $0.03/张，出图 30-60s，尺寸由 prompt 描述驱动
    """
    api_url = f"{API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # 构造消息
    if image_urls:
        # 图生图：多模态 message
        content = [{"type": "text", "text": prompt}]
        for url in image_urls:
            content.append({
                "type": "image_url",
                "image_url": {"url": url}
            })
    else:
        # 文生图：纯文本 message
        content = prompt

    payload = {
        "model": "gpt-image-2-all",
        "messages": [{"role": "user", "content": content}],
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=300)
        if response.status_code != 200:
            err = response.json().get("error", {}).get("message", response.text)
            return {"success": False, "errorType": "API_ERROR", "error": str(err)[:500]}

        data = response.json()
        content_text = data["choices"][0]["message"]["content"]

        # 从 Markdown ![image](url) 中提取图片 URL
        match = re.search(r'!\[[^\]]*\]\((.*?)\)', content_text)
        if not match:
            return {"success": False, "errorType": "NO_URL", "error": "未从响应中提取到图片 URL"}

        image_url = match.group(1)

        # 如果是 base64 data URL，直接使用
        if image_url.startswith("data:image/"):
            return {"success": True, "image_data": image_url.split(",", 1)[1]}

        # 如果是 HTTP URL，下载图片 → 转 base64
        img_resp = requests.get(image_url, timeout=60)
        if img_resp.status_code != 200:
            return {"success": False, "errorType": "DOWNLOAD_FAILED", "error": f"下载图片失败: HTTP {img_resp.status_code}"}

        image_b64 = base64.b64encode(img_resp.content).decode("utf-8")
        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {"success": False, "errorType": "TIMEOUT", "error": "请求超时"}
    except Exception as e:
        return {"success": False, "errorType": "EXCEPTION", "error": str(e)}
```

> Как переключиться: замените `generate_image(...)` в `handler()` на `generate_image_chat(...)`. Единственные необходимые входные данные — `prompt`, `apikey` и, при необходимости, `fileurls`.

## Использование в workflow Coze

После публикации плагина перетащите узел плагина в редактор workflow Coze и подключите его следующим образом:

```text theme={null}
Start node (user enters prompt + images)
    ↓
Prompt/image splitter (code node that splits the user message into cleantext and fileurls)
    ↓
Per-user apikey dispatch (dictionary lookup that maps each user to their APIYI API Key)
    ↓
gptimage2 plugin node (this plugin)
    ↓
Success / failure branches
    ↓
End node (outputs url or error)
```

<Tip>
  Мы рекомендуем использовать это вместе с [решением генерации изображений Feishu Base AI](/ru/scenarios/ecosystem/feishu-bitable-image-shortcut). Такое сочетание позволяет коллегам из ops/design **массово генерировать изображения, просто заполняя prompt'ы в таблице Feishu**, без открытия какого-либо кода. Просто замените плагин Nano Banana Pro в этом решении на этот.
</Tip>

## Сравнение с Nano Banana Pro

| Dimension                          | Nano Banana Pro (APIYI)                                    | GPT Image 2 (APIYI)                                               |
| ---------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Модель                             | `gemini-3-pro-image-preview`                               | `gpt-image-2`                                                     |
| Шлюз                               | APIYI (same platform, same Key)                            | APIYI (same platform, same Key)                                   |
| Эндпоинт text-to-image             | Gemini `generateContent` (JSON)                            | `/v1/images/generations` (JSON)                                   |
| Эндпоинт image-to-image            | Тот же эндпоинт + inline\_data (JSON)                      | `/v1/images/edits` (**multipart/form-data**)                      |
| Схема разрешения                   | 1K / 2K / 4K (фиксированная)                               | Гибкое разрешение (до 3840×2160)                                  |
| Стратегия таймаута                 | По разрешению (360s / 600s / 1200s)                        | По качеству (180s / 360s / 900s)                                  |
| Фильтрация контента                | Одноступенчатая (ZERO\_CANDIDATES\_TOKEN + TEXT\_RESPONSE) | Двухступенчатая (HTTP 400/403 + content\_filter)                  |
| Количество референсных изображений | Неограничено (inline\_data)                                | До 16                                                             |
| Прозрачный фон                     | ✅ Поддерживается                                           | ✅ Модель поддерживает это (плагин не предоставляет этот параметр) |
| Рендеринг текста                   | Хорошо                                                     | Отлично (>99%)                                                    |
| Сжатие вывода                      | Не поддерживается                                          | ✅ Сжатие jpeg/webp                                                |
| Управление модерацией              | Не поддерживается                                          | ✅ Параметр moderation (auto/low)                                  |

## FAQ

<AccordionGroup>
  <Accordion title="Где находится полный исходный код? Можно ли просто скопировать его?">
    Да. Раздел этой страницы 'Полный исходный код плагина' содержит полный `coze-gptimage2.py`. **Просто измените конфигурацию OSS и API\_BASE вверху** и вставьте его напрямую в Coze IDE — больше ничего запрашивать не нужно.

    Если вам также нужны:

    * Код ярлыка полей Feishu → см. раздел 'Полный исходный код ярлыка полей Feishu' в [решении генерации изображений Feishu Base AI](/ru/scenarios/ecosystem/feishu-bitable-image-shortcut)
    * Плагин Nano Banana Pro → см. [плагин Coze для Nano Banana Pro](/ru/scenarios/ecosystem/coze-nanobanana-plugin)
  </Accordion>

  <Accordion title="Почему apikey передаётся как входной параметр, а не жёстко задан в коде?">
    Чтобы каждому пользователю можно было выдать отдельный APIYI API Key. В workflow Coze поставьте перед ним словарный узел «распределение apikey по пользователям», который сопоставляет имя вызывающего пользователя с его API Key — удобно для учёта использования и контроля доступа.
  </Accordion>

  <Accordion title="Чем APIYI API Key отличается от официального OpenAI Key?">
    APIYI — это шлюз с прямым подключением из материкового Китая. Его API Key также начинаются с `sk-`, но:

    * Прямой доступ из материкового Китая, VPN не требуется
    * Запрашиваются и управляются в [консоли APIYI](https://api.apiyi.com/token)
    * Поддерживает дневные/месячные лимиты квоты, что упрощает контроль затрат
    * Один Key работает и для Nano Banana Pro, и для GPT Image 2
  </Accordion>

  <Accordion title="В чём разница между тремя маршрутами?">
    Все три маршрута функционально идентичны — используйте любой из них с одним и тем же API Key:

    | Домен           | Описание             |
    | --------------- | -------------------- |
    | `api.apiyi.com` | Маршрут по умолчанию |
    | `vip.apiyi.com` | VIP-маршрут          |
    | `b.apiyi.com`   | Резервный маршрут    |

    Просто измените переменную `API_BASE` в коде, чтобы переключиться.
  </Accordion>

  <Accordion title="Зачем использовать OSS вместо прямого возврата base64?">
    Последующие узлы workflow Coze (особенно ярлыки полей Feishu) в основном требуют **доступного URL**, чтобы преобразовать результат в вложение изображения. Если возвращать base64 напрямую, данные будут гоняться туда и обратно через workflow — это плохо для производительности, а на стороне Feishu это нельзя отрисовать напрямую. Ссылка OSS также удобна для долгосрочного архивирования и внешнего обмена.
  </Accordion>

  <Accordion title="Как обрабатывать ошибку MODERATION_BLOCKED?">
    Это означает, что входной prompt или референсное изображение сработали на фильтрацию по безопасности контента. Эта ошибка **не требует повторной попытки** — повтор даст тот же результат. Рекомендации:

    1. Переформулируйте prompt
    2. Избегайте имён реальных людей, имён персонажей, защищённых авторским правом, и имён живых художников
    3. Избегайте сексуальных намёков, насилия, кровавых сцен и других чувствительных описаний
  </Accordion>

  <Accordion title="Как устранить NO_IMAGE_DATA или NO_DATA?">
    Обычно это означает, что модель завершила inference (уже тарифицировано), но вывод был заблокирован фильтром безопасности контента (`content_filter`). Рекомендации:

    1. Переработайте всю визуальную сцену, а не просто подправляйте формулировки
    2. Попробуйте совершенно другой prompt
    3. Снижение качества иногда позволяет пройти более строгий фильтр вывода
  </Accordion>

  <Accordion title="Высокое качество всё ещё уходит в тайм-аут?">
    Высокое качество GPT Image 2 занимает 145–280 секунд даже при 1K, а 4K может превышать 600 секунд. В плагине уже установлен тайм-аут 900 секунд для высокого качества. Если он всё равно истекает:

    1. Сначала отладьте prompt через `quality=medium`
    2. Проверьте в консоли APIYI наличие лимита запросов
    3. Попробуйте переключить маршруты и повторить
    4. Уменьшите количество одновременных вызовов
    5. Рассмотрите режим `gpt-image-2-all` (30–60 с на изображение)
  </Accordion>

  <Accordion title="Поддерживается ли прозрачный фон?">
    **Модель это поддерживает, но этот плагин пока не раскрывает параметр.** С 2026-08-21 `gpt-image-2` принимает `background: "transparent"`, а при прямом вызове API возвращается настоящее изображение с альфа-каналом — см. [Как сгенерировать изображения с прозрачным фоном](/ru/faq/image-transparent-background).

    Чтобы получить прозрачность внутри плагина, у вас есть два варианта: отредактировать исходный код плагина и добавить `"background": "transparent"` в тело запроса (и убедиться, что `output_format` — это `png` или `webp`), либо перейти на [плагин Nano Banana Pro](/ru/scenarios/ecosystem/coze-nanobanana-plugin).
  </Accordion>

  <Accordion title="Поддерживается ли параметр reasoning глубины рассуждения?">
    **Нет.** Список параметров официального релея gpt-image-2 в APIYI не полностью совпадает со списком OpenAI; `thinking` не входит в число параметров, поддерживаемых APIYI. Для точной настройки качества вывода используйте вместо этого параметр `quality` (low / medium / high / auto).

    Другие неподдерживаемые параметры:

    * `response_format` — ответ всегда возвращает `b64_json`
    * `n` — фиксирован на 1
    * `background: "transparent"` — **модель это поддерживает**, но этот плагин не раскрывает параметр; отредактируйте исходный код, чтобы передать его
    * `input_fidelity` — жёстко зафиксирован на high; **передача приводит к ошибке 400**
  </Accordion>

  <Accordion title="Что мне выбрать: GPT Image 2 или Nano Banana Pro?">
    Оба плагина используют **одну и ту же платформу APIYI**, и один API Key подходит для обоих. Рекомендации:

    | Сценарий                                                      | Рекомендуется                                                                              |
    | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
    | Высокие требования к рендерингу текста (постеры, обложки, UI) | GPT Image 2 (точность текста > 99%)                                                        |
    | Сверхвысокое разрешение 4K                                    | GPT Image 2 (до 3840×2160)                                                                 |
    | Редактирование с несколькими референсными изображениями       | GPT Image 2 (до 16)                                                                        |
    | Сжатие вывода (меньший размер файла)                          | GPT Image 2 (сжатие jpeg / webp)                                                           |
    | Прозрачный фон                                                | Любой вариант (для GPT Image 2 нужно изменить исходный код, чтобы передавать `background`) |
    | Чувствительным к бюджету                                      | GPT Image 2-All (\$0.03/изображение)                                                       |
    | prompt'ы с упором на китайский язык                           | GPT Image 2-All (обратная версия)                                                          |
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Решение для генерации изображений Feishu Base AI" icon="table" href="/ru/scenarios/ecosystem/feishu-bitable-image-shortcut">
    Идеальное дополнение к этому плагину: свяжите весь workflow Coze с Feishu Base, чтобы коллеги из ops могли массово генерировать изображения, заполняя таблицу
  </Card>

  <Card title="Плагин Coze для Nano Banana Pro" icon="banana" href="/ru/scenarios/ecosystem/coze-nanobanana-plugin">
    Еще одно решение Coze для генерации изображений, построенное на Gemini 3 Pro Image, использующее тот же ключ APIYI, что и GPT Image 2
  </Card>

  <Card title="Документация APIYI GPT Image 2" icon="book" href="/ru/api-capabilities/gpt-image-2/overview">
    Полная документация, справочник параметров и примеры кода для официального релея GPT Image 2 от APIYI
  </Card>

  <Card title="APIYI GPT Image 2 — полная документация" icon="code" href="/en/api-capabilities/gpt-image-2-all/chat-completions">
    Документация эндпоинта Chat Completions в реверс-версии APIYI (\$0.03 за изображение, 30–60 секунд на изображение)
  </Card>

  <Card title="Консоль APIYI" icon="settings" href="https://api.apiyi.com/token">
    Управляйте API-ключами, проверяйте использование и баланс, задавайте лимиты квоты
  </Card>

  <Card title="Исправления распространённых ошибок GPT Image 2" icon="circle-question-mark" href="https://help.apiyi.com/fix-gpt-image-2-moderation-blocked-400-error.html">
    Диагностика ошибки 400 moderation\_blocked и способы устранения
  </Card>
</CardGroup>
