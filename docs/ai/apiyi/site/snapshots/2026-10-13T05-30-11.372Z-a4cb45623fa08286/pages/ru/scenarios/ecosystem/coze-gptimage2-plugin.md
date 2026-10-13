> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Плагин GPT Image 2 для Coze

> Созданный сообществом плагин на Python для платформы Coze, который инкапсулирует вызовы GPT Image 2, классификацию ошибок и пайплайн загрузки в OSS через APIYI, позволяя воркфлоу Coze выполнять задачи text-to-image, image-to-image и напрямую доставлять готовые результаты.

## Обзор

Это пользовательский плагин на Python для платформы Coze (`coze.cn`), который оборачивает модель OpenAI GPT Image 2 (`gpt-image-2`) через шлюз **APIYI** в узел, доступный для прямого вызова из воркфлоу Coze. Плагин включает в себя полное формирование запросов, классификацию кодов ошибок, обнаружение фильтрации контента на безопасность и конвейер загрузки в Alibaba Cloud OSS. **Он возвращает общедоступный URL, готовый к отображению**, избавляя вас от необходимости настраивать дополнительный шаг пересылки результатов в воркфлоу Coze.

<Info>
  **Информация о проекте**

  * 📦 Распространение: предоставляется в виде пакета кода (**не опубликован на GitHub**)
  * 👤 Автор: вклад сообщества
  * 🎯 Целевая платформа: пользовательские плагины Coze (Китай / международная версия)
  * 🔌 Вызываемая модель: `gpt-image-2` (APIYI, дата релиза: 21 апреля 2026 г.)
  * 🌐 Шлюз: [APIYI](https://api.apiyi.com) — прямой доступ из материкового Китая, VPN не требуется
  * 📝 Полный исходный код приведен ниже в разделе «Полный исходный код плагина», готов к копированию и использованию
</Info>

## О шлюзе APIYI

[APIYI](https://api.apiyi.com) — это шлюз для GPT Image 2 с прямым подключением из материкового Китая, предлагающий три маршрута с единым API Key:

| Домен | Описание |
| - | - |
| `api.apiyi.com` | Маршрут по умолчанию |
| `b.apiyi.com` | Резервный маршрут |

APIYI предлагает три способа доступа к GPT Image 2:

| ID модели | Канал | Тарификация | Скорость генерации | Особенности |
| - | - | - | - | - |
| `gpt-image-2` | Официальный релей | Потокеновая тарификация | \~120 с | Полная совместимость с официальным OpenAI API, поддержка quality/size/4K |
| `gpt-image-2-all` | Реверс (ChatGPT) | \$0.025/изображение | 30–60 с | Оптимизирован для китайского языка, вызывается через эндпоинт Chat, напрямую возвращает URL изображений |
| `gpt-image-2-vip` | Реверс (линия Adobe) | \$0.03/изображение | 90–150 с | 30 фиксированных пресетов размера, включая 4K |

> По умолчанию этот плагин использует **`gpt-image-2` (официальный релей)**, полностью совместимый с официальным OpenAI API и поддерживающий полный контроль над параметрами. Если вам требуется более быстрая генерация, переключитесь в режим `gpt-image-2-all` (см. ниже).

<Tip>
  Получите API Key (начинающийся с `sk-`) в [консоли APIYI](https://api.apiyi.com/token). Рекомендуется установить дневной лимит квоты (например, ¥20–50) для контроля расходов.
</Tip>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Единая точка входа для text-to-image / image-to-image" icon="wand-sparkles">
    Автоматически переключается между режимами text-to-image (/v1/images/generations) и редактирования (/v1/images/edits) в зависимости от того, пуст ли параметр fileurls, — нет необходимости создавать два отдельных узла в вашем workflow Coze
  </Card>

  <Card title="Прямой доступ из материкового Китая без VPN" icon="bolt">
    Все запросы проходят через шлюз APIYI (api.apiyi.com) — прямой доступ из сетей Китая с низкой задержкой и высокой стабильностью
  </Card>

  <Card title="Редактирование по нескольким референсным изображениям" icon="images">
    Передайте список URL изображений, и плагин скачает их и передаст в запрос как файлы multipart/form-data — поддерживается до 16 референсных изображений (каждое ≤ 50 МБ) с сохранением исходных деталей
  </Card>

  <Card title="Детальная классификация ошибок" icon="shield-check">
    Различает MODERATION\_BLOCKED, INVALID\_API\_KEY, RATE\_LIMIT, SERVER\_ERROR, TIMEOUT, NO\_DATA и другие причины сбоев, упрощая ветвление логики в workflow
  </Card>

  <Card title="Двухэтапная проверка безопасности контента" icon="ban">
    Различает moderation\_blocked (400) на этапе ввода и content\_filter (200) на этапе вывода, возвращая понятное сообщение об отклонении при срабатывании, что исключает бессмысленные повторные попытки
  </Card>

  <Card title="Прямая загрузка в OSS" icon="cloud-upload">
    Сгенерированное изображение base64 загружается напрямую в Alibaba Cloud OSS — workflow получает URL, готовый для публикации или сохранения
  </Card>

  <Card title="Тонкая настройка параметров" icon="sliders-horizontal">
    Поддерживает параметры quality (low/medium/high/auto), moderation (auto/low), output\_format (png/jpeg/webp) и другие, позволяя гибко настраивать стратегию генерации под ваши задачи
  </Card>
</CardGroup>

## Поддерживаемые модели

| Модель | ID модели | Назначение | Документация API |
| - | - | - | - |
| GPT Image 2 (официальный релей) | `gpt-image-2` | Text-to-image, image-to-image (редактирование), полная совместимость с официальным OpenAI API | [Посмотреть документацию](/ru/api-capabilities/gpt-image-2/overview) |
| GPT Image 2-All (реверс) | `gpt-image-2-all` | Text-to-image, image-to-image через эндпоинт Chat, оптимизировано для китайского языка | [Посмотреть документацию](/en/api-capabilities/gpt-image-2-all/chat-completions) |
| GPT Image 2-VIP (реверс) | `gpt-image-2-vip` | Генерация с фиксированным размером, 30 предустановленных разрешений, включая 4K | [Посмотреть документацию](/ru/api-capabilities/gpt-image-2-vip/overview) |

<Tip>
  По умолчанию плагин использует `gpt-image-2` (официальный релей) с эндпоинтами `https://api.apiyi.com/v1/images/generations` (text-to-image) и `https://api.apiyi.com/v1/images/edits` (image-to-image) и требует действительный API-ключ APIYI (начинающийся с `sk-`). Чтобы сменить маршрут, измените `API_BASE` в коде на `https://b.apiyi.com/v1`.
</Tip>

## Ключевые характеристики GPT Image 2

| Характеристика | Описание |
| - | - |
| **Дата выпуска** | 21 апреля 2026 г. |
| **Максимальное разрешение** | 3840×2160 (4K), общее количество пикселей ≤ 8 294 400 |
| **Соотношения сторон** | 1:1 / 16:9 / 9:16 / 4:3 / 3:2 / 3:1 / 1:3 |
| **Уровни качества** | low / medium / high / auto (по умолчанию) |
| **Форматы вывода** | png (по умолчанию) / jpeg / webp |
| **Сжатие вывода** | 0-100 (только jpeg / webp) |
| **Режимы фона** | auto / opaque / transparent (модель поддерживает прозрачность; **в этом плагине данный параметр пока не поддерживается**) |
| **Уровень модерации** | auto (по умолчанию) / low |
| **Рендеринг текста** | Точность > 99% |
| **Изображений за запрос** | 1 (`n` поддерживает только 1) |
| **Формат ответа** | b64\_json (необработанный base64, без префикса data:image) |
| **input\_fidelity** | Зафиксировано на high, **передавать нельзя** (передача параметра возвращает ошибку 400) |

## Эндпоинты API

| Эндпоинт | Метод | Content-Type | Назначение |
| - | - | - | - |
| `https://api.apiyi.com/v1/images/generations` | POST | `application/json` | Text-to-image (генерация на основе текстового prompt) |
| `https://api.apiyi.com/v1/images/edits` | POST | `multipart/form-data` | Image-to-image (загрузка референсных изображений через `-F "image[]=@file"`, до 16) |

> Для переключения маршрутов: `https://b.apiyi.com/v1/...`. Все маршруты функционально идентичны.

## Архитектура плагина

<img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-architecture.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=50eb8b0eafa03c71cb5a6863af7b872a" alt="Схема архитектуры плагина GPT Image 2 Coze" width="1840" height="2100" data-path="images/coze-gptimage2-architecture.png" />

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

## Справочник по разрешениям и размерам

Плагин автоматически выбирает размер на основе `aspect_ratio` и `resolution` (в соответствии с официальными пресетами APIYI):

| Соотношение сторон | 1K (размер / пиксели) | 2K (размер / пиксели) | 4K (размер / пиксели) |
| - | - | - | - |
| 1:1 | 1024×1024 ≈ 1.0M | 2048×2048 ≈ 4.2M | 3840×2160 ≈ 8.3M |
| 16:9 | 1536×1024 ≈ 1.6M | 2048×1152 ≈ 2.4M | 3840×2160 ≈ 8.3M |
| 9:16 | 1024×1536 ≈ 1.6M | 1152×2048 ≈ 2.4M | 2160×3840 ≈ 8.3M |
| 4:3 | 1024×768 ≈ 0.8M | 2048×1536 ≈ 3.1M | 3264×2448 ≈ 8.0M |
| 3:2 | 1536×1024 ≈ 1.6M | 2048×1360 ≈ 2.8M | 3456×2304 ≈ 8.0M |
| 3:1 | 1536×512 ≈ 0.8M | 3072×1024 ≈ 3.1M | 3840×1280 ≈ 4.9M |
| 1:3 | 512×1536 ≈ 0.8M | 1024×3072 ≈ 3.1M | 1280×3840 ≈ 4.9M |

> **Ограничения**: каждое измерение должно делиться на 16, соотношение сторон ≤ 3:1, общее количество пикселей ≤ 8 294 400.
>
> **Примечание**: при 1:1 в разрешении 4K на выходе формируется 3840×2160 (альбомная ориентация 16:9), а не квадрат — это ограничение API, из-за которого фактическое соотношение сторон становится 16:9. Разрешения выше `2560×1440` пока являются экспериментальными; для продакшена рекомендуется отдавать предпочтение предустановленным размерам.

## Входные и выходные параметры

### Входные параметры (`Input`)

| Параметр | Тип | Обязательный | По умолчанию | Описание |
| - | - | - | - | - |
| `cleantext` | string | Да | — | Текстовый prompt пользователя или инструкция по редактированию (до 32 000 символов) |
| `fileurls` | string\[] | Нет | — | Список URL эталонных изображений; оставьте пустым для генерации текста в изображение |
| `aspect_ratio` | string | Да | — | Соотношение сторон, например `1:1`, `16:9`, `9:16` |
| `resolution` | string | Да | — | Разрешение, обязательно в верхнем регистре: `1K` / `2K` / `4K` |
| `quality` | string | Нет | `auto` | Уровень качества: `low` / `medium` / `high` / `auto` |
| `moderation` | string | Нет | `auto` | Уровень модерации: `auto` / `low` (ослабленная модерация) |
| `output_format` | string | Нет | `png` | Формат вывода: `png` / `jpeg` / `webp` |
| `apikey` | string | Да | — | API-ключ APIYI (начинается с `sk-`, запросите в [консоли APIYI](https://api.apiyi.com/token)) |

### Выходные параметры (`Output`)

| Поле | Тип | Описание |
| - | - | - |
| `analysis` | string | Текст статуса: `图片生成成功` (успешно) / `图片生成失败` (ошибка) |
| `url` | string \| null | При успешном выполнении — общедоступный OSS URL |
| `error` | string \| null | При ошибке — понятное описание ошибки |

## Шаги развертывания

<Steps>
  <Step title="Шаг 1: Подготовьте API-ключ APIYI и учетные данные OSS">
    * Получите API-ключ (начинающийся с `sk-`) в [консоли APIYI](https://api.apiyi.com/token); рекомендуем установить ежедневный лимит квоты (например, ¥20-50)
    * Создайте бакет OSS в Alibaba Cloud и субаккаунт RAM с правами `oss:PutObject` для этого бакета
    * Сохраните `AccessKey ID`, `AccessKey Secret`, `Bucket name` и `Endpoint` (например, `oss-cn-beijing.aliyuncs.com`)
  </Step>

  <Step title="Шаг 2: Найдите и установите плагин в магазине плагинов Coze">
    1. Перейдите в рабочее пространство Coze → Plugins → Plugin marketplace
    2. Выполните поиск по запросу «GPT Image 2» или «APIYI», чтобы найти этот плагин
    3. Откройте карточку плагина, чтобы просмотреть сведения, затем нажмите «Add», чтобы установить его в свое рабочее пространство

           <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-plugin-market.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=58d8111524c893c61aae7c52f4fb68db" alt="Поиск в магазине плагинов Coze" width="1450" height="738" data-path="images/coze-gptimage2-plugin-market.png" />
  </Step>

  <Step title="Шаг 3: Скопируйте код плагина">
    Вставьте полный код Python из раздела «Полный исходный код плагина» ниже в IDE Coze и замените конфигурацию Alibaba Cloud OSS в верхней части на свои данные:

    ```python theme={null}
    # API易 线路配置（可选）
    API_BASE = "https://api.apiyi.com/v1"
    # 也可切换为: "https://b.apiyi.com/v1"

    # 阿里云 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名称"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="Шаг 4: Настройте метаданные и входные/выходные параметры">
    Настройте типы полей Input / Output и флаги обязательности, как показано ниже, в соответствии с полями `args.input` в коде:

    Конфигурация входных параметров:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-basic-info.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=f06e617314b795c936cb5605a28746d0" alt="Базовая информация о плагине Coze" width="1611" height="458" data-path="images/coze-gptimage2-basic-info.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-input-params.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=410d34cca5c9aa191df0add21a51a848" alt="Конфигурация входных параметров плагина Coze" width="1617" height="505" data-path="images/coze-gptimage2-input-params.png" />

    Конфигурация выходных параметров:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-1.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=c590fca7d3196326aebddb3a7dbdefda" alt="Конфигурация выходных параметров плагина Coze (часть 1)" width="1606" height="695" data-path="images/coze-gptimage2-output-params-1.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-2.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=5546f08b19320ba2f6332555eef8f3c2" alt="Конфигурация выходных параметров плагина Coze (часть 2)" width="1577" height="373" data-path="images/coze-gptimage2-output-params-2.png" />
  </Step>

  <Step title="Шаг 5: Протестируйте и опубликуйте">
    * Заполните тестовые параметры в IDE Coze (начните с `quality=low` + `resolution=1K` + простого prompt для проверки пайплайна APIYI)
    * После успешного прохождения тестов нажмите «Publish» и перетащите плагин в любой workflow
  </Step>
</Steps>

## Стратегия классификации ошибок

Плагин не просто сообщает `success=True/False` — он классифицирует причину сбоя в следующем порядке приоритета, позволяя вашему рабочему процессу в Coze выполнять соответствующее ветвление:

| Приоритет | Тип ошибки | Условие возникновения | Рекомендуемые действия |
| - | - | - | - |
| 1 | `MODERATION_BLOCKED` | HTTP 400 / 403, блокировка системой безопасности контента | Промпт или изображение вызвали срабатывание модерации; перефразируйте и повторите попытку — **не повторяйте запрос с исходными входными данными** |
| 2 | `INVALID_API_KEY` | HTTP 401 | Проверьте правильность или срок действия API-ключа APIYI |
| 3 | `RATE_LIMIT` | HTTP 429 | Превышен лимит запросов; попробуйте сменить маршрут или уменьшить количество параллельных запросов |
| 4 | `SERVER_ERROR` | HTTP 500 / 502 / 503 | Сбой на стороне сервера APIYI / OpenAI; повторите попытку 2–3 раза с экспоненциальной задержкой |
| 5 | `BAD_REQUEST` | HTTP 400 (не связанная с модерацией) | Проверьте параметры: корректность size или не был ли случайно передан input\_fidelity |
| 6 | `TIMEOUT` | Превышено время ожидания, зависящее от качества | Снизьте качество или разрешение и повторите попытку |
| 7 | `NO_DATA` | Поле `data` в ответе пусто | Повторите попытку |
| 8 | `NO_IMAGE_DATA` | Поле `b64_json` пусто | Повторите попытку |
| 9 | `IMAGE_DOWNLOAD_FAILED` | Не удалось загрузить эталонное изображение по URL | Проверьте доступность URL |
| 10 | `EDIT_FAILED` | Эндпоинт редактирования вернул статус, отличный от 200 | Проверьте формат эталонных изображений, их количество (≤16) и размер каждого файла (≤50MB) |

### Двухэтапная фильтрация контента

В GPT Image 2 используется **двухэтапная фильтрация безопасности контента**, в отличие от Nano Banana Pro:

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

| Критерий | moderation\_blocked | content\_filter |
| - | - | - |
| Этап срабатывания | Этап ввода | Этап вывода |
| HTTP-статус | 400 | 200 |
| Тарификация | Нет | **Да** (инференс уже был выполнен) |
| Способ устранения | Перефразировать формулировку промпта | Полностью изменить композицию сцены |

### Распространенные причины срабатывания moderation\_blocked

| № | Сценарий | Примечания |
| - | - | - |
| 1 | Портреты реальных людей / имена знаменитостей | Elon Musk, Taylor Swift и т. д. |
| 2 | Имена ныне живущих художников | Hayao Miyazaki = блокировка, Van Gogh = разрешено |
| 3 | Защищенные авторским правом персонажи / объекты интеллектуальной собственности | Spider-Man, Pikachu, Mickey Mouse и т. д. |
| 4 | Насилие / жестокость / детализированное оружие | Автоматическая блокировка |
| 5 | Сексуальный подтекст / откровенная одежда | Описания вроде bikini, tight-fitting, sexy |
| 6 | Фотореалистичные изображения детей | Практически нулевая терпимость |
| 7 | Символы ненависти / политический экстремизм | Автоматическая блокировка |

### Специфические ошибки APIYI

| Ошибка | Причина | Способ устранения |
| - | - | - |
| 401 + `invalid_api_key` | В ключе отсутствует префикс `sk-` или истек срок его действия | Скопируйте ключ полностью из консоли APIYI |
| 404 Not Found | В base\_url отсутствует суффикс `/v1` | Убедитесь, что указан `https://api.apiyi.com/v1` |
| 429 + частые срабатывания | Превышен лимит запросов APIYI | Переключите маршрут и повторите попытку |
| Таймаут подключения | Колебания в работе DNS / сети | Попробуйте другой маршрут и повторите попытку |

## Ожидаемая задержка в зависимости от разрешения и качества

| Разрешение | Качество | Ожидаемая задержка | Тайм-аут плагина |
| - | - | - | - |
| 1K (1024×1024) | низкое | 3-8 с | 180 с |
| 1K (1024×1024) | среднее | 20-40 с | 360 с |
| 1K (1024×1024) | высокое | 145-280 с | 900 с |
| 2K (2048×2048) | среднее | 80-120 с | 360 с |
| 2K (2048×2048) | высокое | 200-250 с | 900 с |
| 4K (3840×2160) | среднее | 150-200 с | 360 с |
| 4K (3840×2160) | высокое | 300-600 с | 900 с |

> Рекомендация: используйте `resolution=1K + quality=medium` для повседневной работы (20-40 с на изображение) и `resolution=4K + quality=high` для финальных результатов.
>
> При использовании `quality=auto` (параметр не указан или установлен в auto) плагин применяет единый 360-секундный тайм-аут, а фактический уровень качества определяет API.

## Полный исходный код плагина

Ниже представлен полный код `coze-gptimage2.py`, готовый к прямой вставке в Coze IDE. Перед использованием **необходимо изменить только конфигурацию OSS в верхней части**.

<Note>
  Исходный код плагина сохранен в исходном виде, как был предоставлен; комментарии и строки ошибок для пользователей написаны на китайском языке и могут быть свободно локализованы под ваш рабочий процесс.
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
# 也可切换为: "https://b.apiyi.com/v1"

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

## Опционально: быстрый режим gpt-image-2-all

Если вам нужна **более быстрая генерация (30–60 с) и не требуется контроль над параметром размера**, вы можете переключить плагин на `gpt-image-2-all` от APIYI (reverse-версия), вызываемый через эндпоинт Chat Completions. Этот режим стоит \$0.025 за изображение и возвращает URL изображений напрямую, без необходимости парсинга base64.

Основное изменение (просто замените функцию `generate_image`):

```python theme={null}
def generate_image_chat(prompt: str, apikey: str, image_urls=None):
    """
    gpt-image-2-all 快速模式（通过 API易 Chat Completions 端点）
    价格 $0.025/张，出图 30-60s，尺寸由 prompt 描述驱动
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

> Как переключиться: замените `generate_image(...)` в `handler()` на `generate_image_chat(...)`. Требуются только входные данные `prompt`, `apikey` и опционально `fileurls`.

## Использование в воркфлоу Coze

После публикации плагина перетащите узел плагина в редактор воркфлоу Coze и настройте связи следующим образом:

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
  Рекомендуем использовать это в связке с [решением для генерации изображений с помощью ИИ в Feishu Base](/ru/scenarios/ecosystem/feishu-bitable-image-shortcut). Такая конфигурация позволяет коллегам из операционных и дизайн-команд **пакетно генерировать изображения, просто заполняя prompt в таблице Feishu**, вообще не работая с кодом. Просто замените плагин Nano Banana Pro в том решении на этот.
</Tip>

## Сравнение с Nano Banana Pro

| Параметр | Nano Banana Pro (APIYI) | GPT Image 2 (APIYI) |
| - | - | - |
| Модель | `gemini-3-pro-image-preview` | `gpt-image-2` |
| Шлюз | APIYI (одна платформа, один ключ) | APIYI (одна платформа, один ключ) |
| Эндпоинт text-to-image | Gemini `generateContent` (JSON) | `/v1/images/generations` (JSON) |
| Эндпоинт image-to-image | Тот же эндпоинт + inline\_data (JSON) | `/v1/images/edits` (**multipart/form-data**) |
| Схема разрешения | 1K / 2K / 4K (фиксированное) | Гибкое разрешение (до 3840×2160) |
| Стратегия таймаута | По разрешению (360 с / 600 с / 1200 с) | По качеству (180 с / 360 с / 900 с) |
| Фильтрация контента | Одноэтапная (ZERO\_CANDIDATES\_TOKEN + TEXT\_RESPONSE) | Двухэтапная (HTTP 400/403 + content\_filter) |
| Количество референсных изображений | Не ограничено (inline\_data) | До 16 |
| Прозрачный фон | ✅ Поддерживается | ✅ Поддерживается моделью (плагин не предоставляет этот параметр) |
| Рендеринг текста | Хороший | Отличный (>99%) |
| Сжатие результата | Не поддерживается | ✅ Сжатие jpeg/webp |
| Управление модерацией | Не поддерживается | ✅ Параметр moderation (auto/low) |

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Где находится полный исходный код? Можно ли его просто скопировать?">
    Да. В разделе «Полный исходный код плагина» на этой странице находится полный `coze-gptimage2.py`. **Просто измените конфигурацию OSS и API\_BASE в верхней части** и вставьте его прямо в Coze IDE — больше ничего запрашивать не нужно.

    Если вам также требуется:

    * Код для ярлыка поля Feishu → см. раздел «Полный исходный код ярлыка поля Feishu» в статье [Решение для генерации изображений с помощью ИИ в Feishu Base](/ru/scenarios/ecosystem/feishu-bitable-image-shortcut)
    * Плагин Nano Banana Pro → см. [Плагин Nano Banana Pro для Coze](/ru/scenarios/ecosystem/coze-nanobanana-plugin)
  </Accordion>

  <Accordion title="Почему apikey передается как входной параметр, а не прописан жестко в коде?">
    Чтобы каждому пользователю можно было выдать отдельный API-ключ APIYI. В workflow Coze поставьте перед ним узел словаря «распределение apikey по пользователям», который сопоставляет имя вызывающего с его API-ключом — это удобно для учета использования и контроля доступа.
  </Accordion>

  <Accordion title="Чем API-ключ APIYI отличается от официального ключа OpenAI?">
    APIYI — это шлюз с прямым подключением из материкового Китая. Его API-ключи также начинаются с `sk-`, но:

    * Прямой доступ из материкового Китая, VPN не требуется
    * Запрашивается и управляется в [консоли APIYI](https://api.apiyi.com/token)
    * Поддерживает дневные и месячные лимиты квот, упрощая контроль затрат
    * Один ключ работает как для Nano Banana Pro, так и для GPT Image 2
  </Accordion>

  <Accordion title="В чем разница между тремя маршрутами?">
    Все три маршрута функционально идентичны — вы можете использовать любой из них с одним и тем же API-ключом:

    | Домен | Описание |
    | - | - |
    | `api.apiyi.com` | Основной маршрут |
    | `b.apiyi.com` | Резервный маршрут |

    Для переключения просто измените переменную `API_BASE` в коде.
  </Accordion>

  <Accordion title="Зачем использовать OSS вместо прямого возврата base64?">
    Последующим узлам workflow Coze (особенно ярлыкам полей Feishu) в большинстве случаев требуется **доступный URL**, чтобы преобразовать результат во вложение-изображение. При прямом возврате base64 данные постоянно пересылаются туда и обратно по workflow — это снижает производительность, а Feishu не может отрендерить их напрямую. Кроме того, ссылка на OSS удобна для долгосрочного архивирования и внешнего шеринга.
  </Accordion>

  <Accordion title="Как исправить ошибку MODERATION_BLOCKED?">
    Она означает, что входной prompt или референсное изображение активировали фильтрацию безопасности контента. Повторять запрос при этой ошибке **не имеет смысла** — повторная попытка приведет к тому же результату. Рекомендации:

    1. Перефразируйте prompt
    2. Избегайте имен реальных людей, персонажей, защищенных авторским правом, и имен ныне живущих художников
    3. Избегайте сексуального подтекста, насилия, жестокости и других деликатных описаний
  </Accordion>

  <Accordion title="Как устранить ошибки NO_IMAGE_DATA или NO_DATA?">
    Обычно это означает, что модель завершила инференс (запрос уже тарифицирован), но выходные данные были заблокированы фильтром безопасности контента (`content_filter`). Рекомендации:

    1. Полностью переработайте визуальную сцену, а не просто меняйте формулировки
    2. Попробуйте совершенно другое направление для prompt
    3. Снижение качества иногда позволяет обойти более строгий выходной фильтр
  </Accordion>

  <Accordion title="Постоянно возникает таймаут при качестве high?">
    Генерация с качеством high в GPT Image 2 занимает 145–280 секунд даже при 1K, а при 4K время может превышать 600 секунд. В плагине уже установлен таймаут в 900 секунд для качества high. Если таймаут все еще возникает:

    1. Сначала отладьте свой prompt с помощью `quality=medium`
    2. Проверьте консоль APIYI на наличие ограничений лимита запросов
    3. Попробуйте переключить маршрут и повторить попытку
    4. Уменьшите количество параллельных запросов
    5. Рассмотрите использование режима `gpt-image-2-all` (30–60 с на изображение)
  </Accordion>

  <Accordion title="Поддерживается ли прозрачный фон?">
    **Модель поддерживает эту функцию, но данный плагин пока не предоставляет этот параметр.** С 2026-08-21 `gpt-image-2` принимает `background: "transparent"`, и при прямом вызове API возвращается полноценное изображение с альфа-каналом — см. [Как генерировать изображения с прозрачным фоном](/ru/faq/image-transparent-background).

    Чтобы получить прозрачность внутри плагина, у вас есть два варианта: отредактировать исходный код плагина, добавив `"background": "transparent"` в тело запроса (и убедиться, что `output_format` имеет значение `png` или `webp`), либо перейти на [плагин Nano Banana Pro](/ru/scenarios/ecosystem/coze-nanobanana-plugin).
  </Accordion>

  <Accordion title="Поддерживается ли параметр глубины рассуждения thinking?">
    **Нет.** Список параметров официального релея gpt-image-2 от APIYI не полностью совпадает со списком OpenAI; `thinking` не входит в число параметров, поддерживаемых APIYI. Для тонкой настройки качества вывода используйте вместо этого параметр `quality` (low / medium / high / auto).

    К другим неподдерживаемым параметрам относятся:

    * `response_format` — в ответе всегда возвращается `b64_json`
    * `n` — фиксировано со значением 1
    * `background: "transparent"` — **модель поддерживает его**, но этот плагин не предоставляет данный параметр; отредактируйте исходный код, чтобы передать его
    * `input_fidelity` — зафиксирован на high; **его передача возвращает ошибку 400**
  </Accordion>

  <Accordion title="Что выбрать: GPT Image 2 или Nano Banana Pro?">
    Оба плагина используют **одну и ту же платформу APIYI**, и один API-ключ подходит для обоих. Рекомендации:

    | Сценарий | Рекомендация |
    | - | - |
    | Высокие требования к рендерингу текста (постеры, обложки, UI) | GPT Image 2 (точность текста > 99%) |
    | Сверхвысокое разрешение 4K | GPT Image 2 (до 3840×2160) |
    | Редактирование с несколькими референсными изображениями | GPT Image 2 (до 16) |
    | Сжатие результата (меньший размер файлов) | GPT Image 2 (сжатие jpeg / webp) |
    | Прозрачный фон | Подойдет любой (для GPT Image 2 нужно отредактировать исходный код, чтобы передать `background`) |
    | Экономия бюджета | GPT Image 2-All (\$0.025/изображение) |
    | Промпты на китайском языке | GPT Image 2-All (reverse edition) |
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Решение для генерации изображений с помощью ИИ в Feishu Base" icon="table" href="/ru/scenarios/ecosystem/feishu-bitable-image-shortcut">
    Идеальное дополнение к этому плагину: подключите весь рабочий процесс Coze к Feishu Base, чтобы сотрудники операционного отдела могли пакетом генерировать изображения, просто заполняя таблицу
  </Card>

  <Card title="Плагин Nano Banana Pro для Coze" icon="banana" href="/ru/scenarios/ecosystem/coze-nanobanana-plugin">
    Еще одно решение для генерации изображений в Coze на базе Gemini 3 Pro Image, использующее тот же ключ APIYI, что и GPT Image 2
  </Card>

  <Card title="Документация APIYI по GPT Image 2" icon="book" href="/ru/api-capabilities/gpt-image-2/overview">
    Полная документация, справочник параметров и примеры кода для официального релея GPT Image 2 от APIYI
  </Card>

  <Card title="Документация APIYI по GPT Image 2-All" icon="code" href="/en/api-capabilities/gpt-image-2-all/chat-completions">
    Документация эндпоинта Chat Completions в реверс-версии APIYI (\$0.025/изображение, 30-60 с на изображение)
  </Card>

  <Card title="Консоль APIYI" icon="settings" href="https://api.apiyi.com/token">
    Управление ключами API, проверка использования и баланса, установка лимитов квоты
  </Card>

  <Card title="Устранение распространенных ошибок GPT Image 2" icon="circle-question-mark" href="https://help.apiyi.com/fix-gpt-image-2-moderation-blocked-400-error.html">
    Диагностика ошибки 400 moderation\_blocked и стратегии ее устранения
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.