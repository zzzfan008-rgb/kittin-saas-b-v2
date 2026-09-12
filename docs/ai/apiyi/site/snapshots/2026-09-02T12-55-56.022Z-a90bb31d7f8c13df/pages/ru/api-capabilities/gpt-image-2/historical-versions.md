> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image устаревшие версии

> Обзор устаревших моделей GPT-Image-1 / 1-mini / 1.5 — идентификаторы моделей, тарификация, эндпоинты и советы по миграции на GPT-Image-2 / GPT-Image-2-All.

<Info>
  Для новых проектов используйте [GPT-Image-2](/ru/api-capabilities/gpt-image-2/overview) (официальный) или [GPT-Image-2-All](/ru/api-capabilities/gpt-image-2-all/overview) (обратный канал, фиксированные \$0.03/изображение). На этой странице сохранены основные сведения об устаревших версиях, чтобы существующие интеграции могли без проблем устранять неполадки и плавно мигрировать.
</Info>

## Устаревшие модели

| Model ID           | Released | Endpoint                                     | Тарификация                                | Статус                                              |
| ------------------ | -------- | -------------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| `gpt-image-1.5`    | Dec 2025 | `/v1/images/generations`                     | Input \$5.00 / Output \$10.00 per M tokens | Доступно; рекомендуется обновление до `gpt-image-2` |
| `gpt-image-1`      | Apr 2025 | `/v1/images/generations`, `/v1/images/edits` | Input \$2.50 / Output \$8.00 per M tokens  | Доступно; рекомендуется обновление до `gpt-image-2` |
| `gpt-image-1-mini` | Apr 2025 | `/v1/images/generations`                     | Ниже, чем у `gpt-image-1`                  | Доступно                                            |

<Tip>
  **Переход без изменений**: измените `model` на `gpt-image-2` или `gpt-image-2-all`. Параметры (`size` / `quality` / `output_format`, …) в основном совместимы — структурные изменения кода не требуются.
</Tip>

## Общие параметры (генерация)

Все устаревшие версии используют одни и те же параметры генерации:

| Параметр             | Описание                                             |
| -------------------- | ---------------------------------------------------- |
| `model`              | `gpt-image-1.5` / `gpt-image-1` / `gpt-image-1-mini` |
| `prompt`             | Описание изображения (до 1000 символов)              |
| `size`               | `1024x1024` / `1536x1024` / `1024x1536` / `auto`     |
| `quality`            | `low` / `medium` / `high` / `auto`                   |
| `output_format`      | `png` (по умолчанию) / `jpeg` / `webp`               |
| `output_compression` | Только JPEG/WebP, 0–100%                             |
| `background`         | `transparent` / `opaque` / `auto`                    |
| `n`                  | Количество изображений (1–10)                        |

## Быстрый пример

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.images.generate(
    model="gpt-image-1.5",  {/* or gpt-image-1 / gpt-image-1-mini */}
    prompt="A professional product photo on white background, soft studio lighting",
    size="1024x1024",
    quality="high"
)

print(response.data[0].url)
```

## Справочник по ценам за изображение

GPT-Image-1 / 1.5 поддерживают как тарификацию по token, так и тарификацию за изображение — система автоматически выбирает более выгодный вариант:

### GPT-Image-1.5

| Качество | 1024×1024 | 1024×1536 / 1536×1024 |
| -------- | --------- | --------------------- |
| Низкое   | \$0.009   | \$0.013               |
| Среднее  | \$0.034   | \$0.050               |
| Высокое  | \$0.133   | \$0.200               |

### GPT-Image-1

| Качество | 1024×1024 | 1024×1536 / 1536×1024 |
| -------- | --------- | --------------------- |
| Низкое   | \$0.005   | \$0.006               |
| Среднее  | \$0.011   | \$0.015               |
| Высокое  | \$0.036   | \$0.052               |

<Warning>
  Цифры для тарификации за изображение приведены только для справки. Фактическая стоимость определяется по тому режиму тарификации — по token или за изображение, — который система считает более выгодным.
</Warning>

## Редактирование изображений (только `gpt-image-1`)

`gpt-image-1` поддерживает редактирование на основе маски через эндпоинт `/v1/images/edits`:

```python theme={null}
response = client.images.edit(
    model="gpt-image-1",
    image=open("original.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A modern glass skyscraper with reflective windows",
    size="1024x1024"
)
```

| Параметр | Описание                                                              |
| -------- | --------------------------------------------------------------------- |
| `image`  | Исходное изображение, PNG/WebP/JPG, \< 50MB каждое, до 16 изображений |
| `mask`   | Изображение маски — пиксели с alpha=0 будут перерисованы              |
| `prompt` | Описание того, что нужно сгенерировать в замаскированной области      |

<Note>
  Для новых рабочих процессов редактирования используйте [GPT-Image-2 Edit](/ru/api-capabilities/gpt-image-2/image-edit) (официальный) или [GPT-Image-2-All Edit](/ru/api-capabilities/gpt-image-2-all/image-edit) (обратный, поддерживает до 16 входных изображений для смешивания).
</Note>

## Переход на GPT-Image-2 / 2-All

| Что вам нужно                                                                                | Рекомендуемый вариант                               |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Оставайтесь на официальном OpenAI endpoint, если вам нужен точный контроль размера/качества  | `gpt-image-2` (официальный)                         |
| Хотите предсказуемую фиксированную тарификацию (\$0.03/image), лучшее следование инструкциям | `gpt-image-2-all` (обратный)                        |
| Вам по-прежнему нужно редактирование изображений на основе маски                             | `gpt-image-2-all` edit endpoint (до 16 изображений) |

<CardGroup cols={2}>
  <Card title="Обзор GPT-Image-2" icon="bolt" href="/ru/api-capabilities/gpt-image-2/overview">
    Последняя официальная версия — endpoint и параметры совместимы с legacy
  </Card>

  <Card title="Обзор GPT-Image-2-All" icon="sparkles" href="/ru/api-capabilities/gpt-image-2-all/overview">
    Обратный канал, фиксированная \$0.03/image, более быстрое выполнение
  </Card>

  <Card title="Сравнение официального и обратного каналов" icon="scale" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Сравнение рядом и руководство по выбору
  </Card>
</CardGroup>
