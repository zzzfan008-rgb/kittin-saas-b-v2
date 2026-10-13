> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Как настроить Base URL? Различия между /v1, корневым доменом и /v1beta

> Полное руководство по настройке Base URL API.YI: /v1 для OpenAI, корневой домен для Claude, /v1beta для Gemini

## Краткий ответ

<Info>
  **Помните**: моделям OpenAI нужны `/v1`, Claude использует только корневой домен, Gemini нужны `/v1beta`. Неверный Base URL — самая распространенная проблема интеграции.
</Info>

| Семейство моделей | Base URL | SDK |
| - | - | - |
| GPT / DeepSeek / Llama / Qwen и т. д. | `https://api.apiyi.com/v1` | OpenAI SDK |
| Серия Claude | `https://api.apiyi.com` | Anthropic SDK |
| Серия Gemini | `https://api.apiyi.com` | Google GenAI SDK (задайте `api_version: "v1beta"`) |

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

APIYI предоставляет 3 доменных узла с одинаковыми возможностями, различающихся сетевой маршрутизацией и архитектурой развертывания:

<CardGroup cols={3}>
  <Card title="🌏 По умолчанию (рекомендуется)" icon="server">
    **`api.apiyi.com`**

    Основная линия по умолчанию. **Рекомендуется для всех клиентов как внутри материкового Китая, так и за его пределами**.
  </Card>

  <Card title="🏢 Резервный для Китая / Business" icon="building">
    **`b.apiyi.com`**

    Резервный узел и корпоративная линия Business. Используйте, если основной узел недоступен.
  </Card>

  <Card title="⚡ Глобальное ускорение Cloudflare CDN" icon="bolt">
    **`api-cf.apiyi.com`**

    Глобальное CDN-ускорение Cloudflare. Для **API-вызовов только с текстом**. Ограничение по таймауту — 100 секунд.
  </Card>
</CardGroup>

| Узел | Домен | Кому рекомендуется | Примечания |
| - | - | - | - |
| По умолчанию | `api.apiyi.com` | Всем клиентам (рекомендуется) | Основная линия по умолчанию |
| Резервный для Китая / Business | `b.apiyi.com` | Корпоративным клиентам / резерв | Резервный + Business |
| Cloudflare CDN | `api-cf.apiyi.com` | Вызовов только с текстом | Глобальное ускорение, таймаут 100 с |

<Warning>
  **Ограничение узла Cloudflare CDN**: `api-cf.apiyi.com` развернут на Cloudflare Workers с максимальным таймаутом запроса **100 секунд**. Поэтому:

  * ✅ **Подходит для**: обычного текстового чата, генерации короткого текста и других запросов с быстрым ответом
  * ❌ **Не подходит для**: сложных задач с длинным текстом длительностью более 100 секунд
  * ❌ **Не подходит для**: Nano Banana Pro и других задач генерации изображений
  * ❌ **Не подходит для**: API-вызовов генерации видео

  Если выполнение ваших задач может занимать более 100 секунд, используйте вместо него `api.apiyi.com` (или резервный узел `b.apiyi.com`).
</Warning>

<Tip>
  Мы рекомендуем настроить резервный узел в вашем коде для автоматического переключения, чтобы повысить доступность сервиса.
</Tip>

## Устранение распространенных ошибок

| Ошибка | Возможная причина | Решение |
| - | - | - |
| **404 Not Found** | Отсутствует `/v1` в OpenAI SDK или указан лишний `/v1` в Anthropic SDK | Убедитесь, что путь соответствует спецификации SDK |
| **400 Bad Request** | Несовпадение версии пути в Gemini SDK | Убедитесь, что используется `/v1beta` |
| **Таймаут соединения** | Неправильный узел домена | Используйте `api.apiyi.com` или `b.apiyi.com` для длительных запросов; узел CF-CDN имеет ограничение по таймауту в 100 с |
| **Ошибка SSL** | Отсутствует префикс `https://` | Для всех узлов требуется HTTPS |
| **Ошибка двойного слэша** | Замыкающий `/` в base\_url | Удалите замыкающий слэш |

## Полный справочник по конфигурации

### OpenAI-совместимые модели

| Узел | Базовый URL |
| - | - |
| По умолчанию (рекомендуется) | `https://api.apiyi.com/v1` |
| Резервный/бизнес для Китая | `https://b.apiyi.com/v1` |
| Cloudflare CDN (только текст) | `https://api-cf.apiyi.com/v1` |

### Модели Claude (Anthropic SDK)

| Узел | Базовый URL |
| - | - |
| По умолчанию (рекомендуется) | `https://api.apiyi.com` |
| Резервный/бизнес для Китая | `https://b.apiyi.com` |
| Cloudflare CDN (только текст) | `https://api-cf.apiyi.com` |

### Модели Gemini

| Узел | Базовый URL |
| - | - |
| По умолчанию (рекомендуется) | `https://api.apiyi.com` |
| Резервный/бизнес для Китая | `https://b.apiyi.com` |
| Cloudflare CDN (только текст) | `https://api-cf.apiyi.com` |

<Info>
  При использовании Google GenAI SDK для Gemini установите `base_url` на корневой домен и `api_version: "v1beta"` — SDK автоматически сформирует полный путь.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.