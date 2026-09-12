> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Как настроить Base URL? Различия между /v1, корневым доменом и /v1beta

> Полное руководство по настройке Base URL API.YI: /v1 для OpenAI, корневой домен для Claude, /v1beta для Gemini

## Краткий ответ

<Info>
  **Помните**: моделям OpenAI нужны `/v1`, Claude использует только корневой домен, Gemini нужны `/v1beta`. Неверный Base URL — самая распространенная проблема интеграции.
</Info>

| Семейство моделей                     | Base URL                   | SDK                                                |
| ------------------------------------- | -------------------------- | -------------------------------------------------- |
| GPT / DeepSeek / Llama / Qwen и т. д. | `https://api.apiyi.com/v1` | OpenAI SDK                                         |
| Серия Claude                          | `https://api.apiyi.com`    | Anthropic SDK                                      |
| Серия Gemini                          | `https://api.apiyi.com`    | Google GenAI SDK (задайте `api_version: "v1beta"`) |

## Почему для разных моделей используются разные базовые URL?

Это определяется реализацией SDK у каждого вендора:

* **OpenAI SDK**: добавляет пути ресурсов после `base_url`, поэтому `/v1` должен быть указан
* **Anthropic SDK**: внутренне добавляет `/v1/messages` — если вы добавите `/v1` самостоятельно, получится `/v1/v1/messages` (ошибка 404)
* **Google GenAI SDK**: использует путь `/v1beta`, SDK автоматически обрабатывает объединение путей

## Примеры кода

### Совместимые модели OpenAI (GPT / DeepSeek / Llama и т. д.)

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"  # Domain + /v1
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

### Модели Claude (Anthropic SDK)

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com"  # Root domain only, NO /v1
)

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

### Модели Gemini (Google GenAI SDK)

```python theme={null}
from google import genai

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"api_version": "v1beta", "base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="Hello!"
)
print(response.text)
```

<Warning>
  **Распространенная ошибка для пользователей Claude**: при использовании официального Anthropic SDK базовый URL должен быть только `https://api.apiyi.com` — не добавляйте `/v1`. Однако если вы вызываете Claude через совместимый режим OpenAI SDK, вам действительно нужен `/v1`.
</Warning>

## Выбор доменного узла

APIYI предоставляет 4 доменных узла с одинаковыми возможностями, отличающиеся сетевой маршрутизацией и архитектурой развертывания:

<CardGroup cols={2}>
  <Card title="🌏 Глобальный прямой доступ (рекомендуется для зарубежных пользователей)" icon="globe">
    **`vip.apiyi.com`**

    Прямое подключение к backend, минимальная задержка. **Рекомендуется для всех клиентов за пределами материкового Китая**.
  </Card>

  <Card title="🇨🇳 Китай по умолчанию (рекомендуется для материкового Китая)" icon="server">
    **`api.apiyi.com`**

    Оптимизирован для сети материкового Китая. **По умолчанию для клиентов из материкового Китая**.
  </Card>

  <Card title="🏢 Резервный узел Китая / бизнес" icon="building">
    **`b.apiyi.com`**

    Резервный узел и бизнес-линия для enterprise. Используйте, когда основной узел недоступен.
  </Card>

  <Card title="⚡ Глобальное ускорение через Cloudflare CDN" icon="bolt">
    **`api-cf.apiyi.com`**

    Глобальное ускорение через Cloudflare CDN. Для **вызовов API только для текста**. Имеет ограничение тайм-аута 100 секунд.
  </Card>
</CardGroup>

| Узел                          | Домен              | Рекомендуется для                       | Примечания                                               |
| ----------------------------- | ------------------ | --------------------------------------- | -------------------------------------------------------- |
| Глобальный прямой доступ      | `vip.apiyi.com`    | Клиенты за пределами материкового Китая | Прямой backend, минимальная задержка                     |
| Китай по умолчанию            | `api.apiyi.com`    | Клиенты из материкового Китая           | Оптимизированная внутренняя маршрутизация (по умолчанию) |
| Резервный узел Китая / бизнес | `b.apiyi.com`      | Enterprise / резервный                  | Резервный + Business                                     |
| Cloudflare CDN                | `api-cf.apiyi.com` | Вызовы только для текста                | Глобальное ускорение, тайм-аут 100 с                     |

<Warning>
  **Ограничение узла Cloudflare CDN**: `api-cf.apiyi.com` развернут на Cloudflare Workers, где максимальный тайм-аут запроса составляет **100 секунд**. Поэтому:

  * ✅ **Подходит для**: обычного текстового чата, короткой генерации текста и других вызовов с быстрым ответом
  * ❌ **Не подходит для**: сложных задач с длинным текстом, превышающих 100 секунд
  * ❌ **Не подходит для**: Nano Banana Pro и других задач генерации изображений
  * ❌ **Не подходит для**: вызовов API генерации видео

  Если ваши задачи могут превышать 100 секунд, используйте вместо этого `vip.apiyi.com` (зарубежные регионы) или `api.apiyi.com` (материковый Китай).
</Warning>

<Tip>
  Мы рекомендуем настроить резервный узел в вашем коде для автоматического переключения, чтобы повысить доступность сервиса.
</Tip>

## Устранение распространённых ошибок

| Ошибка                    | Возможная причина                                                    | Решение                                                                                                 |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **404 Не найдено**        | Отсутствует `/v1` в OpenAI SDK или есть лишний `/v1` в Anthropic SDK | Проверьте, что путь соответствует спецификации SDK                                                      |
| **400 Неверный запрос**   | Несоответствие версии пути в Gemini SDK                              | Убедитесь, что используется `/v1beta`                                                                   |
| **Тайм-аут соединения**   | Неверный доменный узел                                               | Используйте `api.apiyi.com` в Китае, `vip.apiyi.com` за рубежом; узел CF-CDN имеет лимит тайм-аута 100s |
| **Ошибка SSL**            | Отсутствует префикс `https://`                                       | Для всех узлов требуется HTTPS                                                                          |
| **Ошибка двойного слэша** | Лишний `/` в base\_url                                               | Удалите завершающий слэш                                                                                |

## Полная справка по конфигурации

### OpenAI-Compatible Models

| Узел                          | Базовый URL                   |
| ----------------------------- | ----------------------------- |
| Global Direct (Overseas)      | `https://vip.apiyi.com/v1`    |
| China Default (Mainland)      | `https://api.apiyi.com/v1`    |
| China Backup/Business         | `https://b.apiyi.com/v1`      |
| Cloudflare CDN (Только текст) | `https://api-cf.apiyi.com/v1` |

### Claude Models (Anthropic SDK)

| Узел                          | Базовый URL                |
| ----------------------------- | -------------------------- |
| Global Direct (Overseas)      | `https://vip.apiyi.com`    |
| China Default (Mainland)      | `https://api.apiyi.com`    |
| China Backup/Business         | `https://b.apiyi.com`      |
| Cloudflare CDN (Только текст) | `https://api-cf.apiyi.com` |

### Gemini Models

| Узел                          | Базовый URL                |
| ----------------------------- | -------------------------- |
| Global Direct (Overseas)      | `https://vip.apiyi.com`    |
| China Default (Mainland)      | `https://api.apiyi.com`    |
| China Backup/Business         | `https://b.apiyi.com`      |
| Cloudflare CDN (Только текст) | `https://api-cf.apiyi.com` |

<Info>
  При использовании Google GenAI SDK для Gemini установите `base_url` в корневой домен, а `api_version: "v1beta"` — SDK автоматически сформирует полный путь.
</Info>
