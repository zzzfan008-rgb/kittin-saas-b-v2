> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Генерация текста Kimi K2.5

> Флагманская нативная мультимодальная модель Moonshot AI с контекстным окном 256K и режимом Thinking. APIYI подключается через официальный релей Alibaba Cloud — коэффициент тарифа 0.88× для группы плюс бонусы за пополнение снижают эффективную стоимость ниже 80% от официальной.

Kimi K2.5 — это флагманская нативная мультимодальная модель Moonshot AI, выпущенная 27 января 2026 года. Она ориентирована на Visual Coding и автономную оркестрацию Agent Swarm, а контекстное окно 256K предлагается без доплаты. APIYI интегрирует ее через **официальный релей-канал Alibaba Cloud** для стабильности уровня production. Базовый коэффициент тарифа группы составляет **0.88× от официальной тарификации**, а накопление бонусов за пополнение (от пополнения на \$100 → \$10 в подарок и выше) снижает **фактическую стоимость ниже 80% от официальной тарификации**.

<Info>
  **Kimi K2.5 доступна в APIYI**: официальный релей-канал Alibaba Cloud, совместимый с OpenAI эндпоинт, ID модели `kimi-k2.5`. В отличие от официального сайта Kimi, **режим Thinking необходимо явно включать через `enable_thinking: true`** в теле запроса — по умолчанию модель работает в режиме Instant.
</Info>

## Ключевые преимущества

<CardGroup cols={2}>
  <Card title="Контекст 256K" icon="scroll">
    256K tokens без доплаты — поместите всю кодовую базу среднего размера или длинный документ в один вызов.
  </Card>

  <Card title="Режим рассуждения" icon="brain">
    Поддерживает глубокое рассуждение с помощью `enable_thinking: true` — создан для сложного планирования, анализа первопричин и агентов.
  </Card>

  <Card title="Нативная мультимодальность + визуальное кодирование" icon="eye">
    Нативно понимает изображения и код — отлично подходит для преобразования макетов интерфейсов, скриншотов и диаграмм в исполняемый код.
  </Card>

  <Card title="Стабильный перенос через Alibaba Cloud" icon="server">
    Маршрутизируется через официальный канал transfer Alibaba Cloud — SLA уровня enterprise при высокой параллельности запросов.
  </Card>
</CardGroup>

## Информация о модели

| Параметр                          | Значение                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| **ID модели**                     | `kimi-k2.5`                                                   |
| **Контекстное окно**              | 256,000 tokens                                                |
| **Режимы**                        | Instant / Thinking / Agent / Agent Swarm                      |
| **Переключатель режима Thinking** | `enable_thinking: true` в теле запроса (по умолчанию `false`) |
| **Вход**                          | Текст + Изображение (нативная мультимодальность)              |
| **Выход**                         | Текст                                                         |
| **Потоковая передача**            | ✅ Поддерживается                                              |
| **Function Calling / Tool Use**   | ✅ Поддерживается                                              |
| **Канал**                         | Alibaba Cloud Official Transfer                               |

<Warning>
  Встроенный инструмент `$web_search` в Kimi сейчас несовместим с режимом Thinking. По рекомендации Moonshot отключите `enable_thinking`, когда вам нужен инструмент web\_search. Это ограничение соответствует официальной платформе.
</Warning>

## Цены

| Позиция                | Официальный        | Группа APIYI (0.88×) | С бонусом за пополнение (прибл.) |
| ---------------------- | ------------------ | -------------------- | -------------------------------- |
| Вход                   | \$0.60 / 1M tokens | \$0.528 / 1M tokens  | \~\$0.48 / 1M tokens             |
| Выход                  | \$2.50 / 1M tokens | \$2.20 / 1M tokens   | \~\$2.00 / 1M tokens             |
| Попадание в кэш (Вход) | \$0.10 / 1M tokens | \$0.088 / 1M tokens  | —                                |

<Info>
  **Примечания к тарификации**: APIYI использует **коэффициент тарифа 0.88×** (88% от официальной базовой цены) в качестве базовой ставки группы. Суммирование бонусов за онбординг / крупное пополнение (например, пополнение на \$100 → \$10 бесплатно и выше) снижает **фактическую стоимость ниже 80% от официальной**. См. [Акции за пополнение](/ru/faq/recharge-promotions) для подробностей.
</Info>

## Как включить режим Thinking

Самое большое отличие от официального сайта Kimi заключается в том, что APIYI по умолчанию использует режим Instant — вам нужно явно включить Thinking через `enable_thinking` в теле запроса:

| Сценарий использования                        | `enable_thinking`      | Примечания                                                                 |
| --------------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| Повседневный чат / быстрые ответы             | `false` (по умолчанию) | Режим Instant, минимальная задержка                                        |
| Сложное рассуждение / планирование кода / RCA | `true`                 | Режим Thinking, выводит трассировку рассуждения                            |
| Агент с web\_search                           | `false`                | Официальное ограничение: web\_search и thinking взаимоисключают друг друга |

### Пример cURL (Thinking включен)

```bash theme={null}
curl --location 'https://api.apiyi.com/v1/chat/completions' \
  --header "Authorization: Bearer sk-xxxx" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2.5",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "What is 1+1?"
      }
    ],
    "enable_thinking": true
  }'
```

## Как вызывать

### Эндпоинт

```
https://api.apiyi.com/v1/chat/completions
```

### Базовое использование (Мгновенный режим)

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "kimi-k2.5",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "user", "content": "Introduce yourself in one sentence."}
      ]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'user', content: 'Introduce yourself in one sentence.' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### Расширенное использование (Режим рассуждения)

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations."}
      ],
      extra_body={
          "enable_thinking": True
      }
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Analyze the time complexity of this code and suggest optimizations.' }
    ],
    // @ts-ignore - custom field
    enable_thinking: true
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### Потоковая передача

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k2.5",
    messages=[{"role": "user", "content": "Write a short poem about spring."}],
    stream=True,
    extra_body={"enable_thinking": True}
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

## Параметры запроса

| Имя               | Тип     | Обязательно | Примечания                                    |
| ----------------- | ------- | ----------- | --------------------------------------------- |
| `model`           | string  | Да          | Должно быть `kimi-k2.5`                       |
| `messages`        | array   | Да          | Сообщения диалога                             |
| `enable_thinking` | boolean | Нет         | Включить режим Thinking; по умолчанию `false` |
| `stream`          | boolean | Нет         | Потоковый вывод                               |
| `temperature`     | number  | Нет         | temperature выборки, 0–2                      |
| `max_tokens`      | integer | Нет         | Максимальное число output tokens              |
| `tools`           | array   | Нет         | Список функций / tools                        |

## Формат ответа

```json theme={null}
{
  "id": "chatcmpl-xxxxxxxx",
  "object": "chat.completion",
  "created": 1706300000,
  "model": "kimi-k2.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1+1 equals 2."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 12,
    "total_tokens": 36
  }
}
```

## Лучшие практики

1. **Переключайте режимы в зависимости от задачи**: Оставляйте Instant mode включенным для повседневного чата и коротких генераций; для сложного рассуждение, code review и agent planning задавайте `enable_thinking: true`.
2. **Используйте контекст 256K**: Поместите в один запрос репозиторий среднего размера, полную документацию продукта или длинные стенограммы встреч — без доплаты.
3. **Мультимодальное визуальное кодирование**: Отправляйте скриншоты интерфейса / дизайн-макеты и позвольте K2.5 за один проход «прочитать → спланировать → написать код».
4. **Растягивайте экономию**: Сочетайте бонус за пополнение на \$100+ с коэффициентом тарифа группы 0.88× — итоговая стоимость снижается ниже 80% от официальной.
5. **Учитывайте оговорку насчет web\_search**: Отключите `enable_thinking`, если вам нужен встроенный `$web_search` инструмент от Moonshot.

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Почему мой запрос не использует режим Thinking?">
    Режим Thinking по умолчанию выключен. Убедитесь, что тело запроса включает `"enable_thinking": true`. В OpenAI Python SDK передавайте это внутри `extra_body`; в Node.js SDK вы можете передать это как поле верхнего уровня.
  </Accordion>

  <Accordion title="APIYI's Kimi K2.5 — та же модель, что и у Moonshot?">
    Да — это та же исходная модель, маршрутизируемая через официальный канал Alibaba Cloud official-transfer. Единственное отличие в том, что режим Thinking по умолчанию выключен, и его нужно включить через `enable_thinking`.
  </Accordion>

  <Accordion title="Как работает групповой коэффициент тарифа 0.88×?">
    При создании API token в консоли APIYI назначьте его группе, включающей Kimi K2.5 — тарификация автоматически применяет коэффициент 0.88×. С учетом бонусов за пополнение общая стоимость становится еще ниже. См. [Акции на пополнение](/ru/faq/recharge-promotions).
  </Accordion>

  <Accordion title="Поддерживает ли это вызов функций / использование инструментов?">
    Да. Передавайте стандартные определения в стиле OpenAI для `tools`. Обратите внимание, что официальный встроенный инструмент `$web_search` несовместим с режимом Thinking — используйте их в отдельных вызовах.
  </Accordion>

  <Accordion title="Требует ли режим Thinking дополнительной оплаты?">
    Трассировки Thinking учитываются как output tokens и тарифицируются как обычно. Для сложных задач output tokens может быть значительно больше, поэтому включайте его только когда вам нужно более глубокое рассуждение.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Руководство по API" icon="book" href="/ru/api-manual">
    Полное руководство по использованию API
  </Card>

  <Card title="Акции на пополнение" icon="gift" href="/ru/faq/recharge-promotions">
    Используйте бонусы, чтобы еще сильнее снизить цену
  </Card>

  <Card title="Информация о моделях" icon="list" href="/ru/api-capabilities/model-info">
    Просмотрите все доступные модели и группы
  </Card>

  <Card title="Сценарии использования" icon="layers" href="/ru/scenarios">
    Руководства по интеграции для клиентов
  </Card>
</CardGroup>
