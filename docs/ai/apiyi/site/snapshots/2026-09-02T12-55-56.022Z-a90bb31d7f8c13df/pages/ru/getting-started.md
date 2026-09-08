> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Быстрый старт

> Два способа интеграции APIYI — передайте документацию вашему AI-кодинг-агенту и позвольте ему выполнить работу, либо настройте всё самостоятельно за три шага.

<Note>
  Новые аккаунты получают **\$0.05** пробного кредита, поэтому вы можете сделать первый вызов ниже без пополнения баланса. Легковесной модели, такой как `gpt-5.4-mini`, более чем достаточно, чтобы убедиться, что ваша интеграция работает.
</Note>

## Два пути, выберите один

<CardGroup cols={2}>
  <Card title="Пусть ИИ сделает это" icon="bot" href="#let-an-ai-do-it">
    Скопируйте один prompt в Codex, Claude Code или Cursor. Он читает документацию, пишет код и запускает его. Лучше всего, если вы уже работаете с агентом для написания кода.
  </Card>

  <Card title="Сделайте это сами" icon="wrench" href="#do-it-yourself">
    Зарегистрируйтесь, создайте ключ, выполните первый запрос. Три шага, пять минут. Лучше всего, если вы хотите разобраться в каждом элементе.
  </Card>
</CardGroup>

<Info>
  **Оба пути начинаются одинаково**: вы сами регистрируете аккаунт и создаете ключ. То, что ИИ может взять на себя после этого, — это выбор модели, правильная настройка базового URL, написание примера и его отладка.
</Info>

## Пусть это сделает ИИ

### Отправьте вашему агенту этот prompt

<Prompt description="Пусть кодирующий агент самостоятельно интегрирует APIYI. Скопируйте и вставьте в Codex, Claude Code, Cursor и похожие инструменты." icon="bot" actions={["copy"]}>
  Интегрируйте APIYI в этот проект.

  1. Сначала загрузите знания по интеграции: выполните `npx skills add https://docs.apiyi.com`
     чтобы установить навык APIYI. Если эта команда не работает, просто полностью
     скачайте и прочитайте [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) — то же содержание.
  2. Для более конкретных вопросов найдите страницу в [https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt);
     добавьте `.md` к любому URL документации, чтобы получить версию в обычном Markdown, которая
     требует гораздо меньше tokens, чем скрейпинг HTML.
  3. Попросите у меня ключ API (я скопирую его с [https://api.apiyi.com/token](https://api.apiyi.com/token)) и поместите
     его в переменную окружения `APIYI_API_KEY`. **Не встраивайте его в код и не
     коммитьте его в git.**
  4. Напишите минимальный рабочий пример в уже используемом в этом проекте стеке, начиная с
     модели `gpt-5.4-mini`. Учтите, что базовый URL зависит от SDK: SDK OpenAI
     использует `https://api.apiyi.com/v1`, SDK Anthropic использует корневой домен
     `https://api.apiyi.com` без /v1, а SDK Google GenAI использует корневой
     домен с api\_version, установленным в v1beta.
  5. Фактически запустите его и покажите мне ответ. Как только всё заработает, скажите мне, сколько
     стоил вызов и на какую модель вы бы перешли для реального использования.
</Prompt>

### Что он будет делать

<Steps>
  <Step title="Установите навык, или прочитайте skill.md напрямую">
    `https://docs.apiyi.com/skill.md` — это справочник по интеграции, написанный для машин: эндпоинты, аутентификация, правило именования моделей, известные подводные камни и чек-лист проверки. Прочитав его, агент получает всё необходимое для интеграции APIYI.
  </Step>

  <Step title="Ищите страницы по мере необходимости">
    `llms.txt` — это индекс всех страниц на этом сайте. Агент выбирает нужные и добавляет `.md`, чтобы читать их в виде обычного текста.
  </Step>

  <Step title="Напишите код и фактически запустите его">
    Он пишет пример на уже используемом в вашем проекте языке и с имеющимися зависимостями, а не копирует Python из документации. Работа не завершена, пока вызов не выполнится успешно.
  </Step>
</Steps>

### Четыре точки входа, которые можно передать AI

| Точка входа                 | URL                                      | Когда использовать                                                                                      |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Навык**                   | `https://docs.apiyi.com/skill.md`        | Передайте агенту полный справочник по интеграции одним сообщением. Начните отсюда.                      |
| **Индекс страниц**          | `https://docs.apiyi.com/llms.txt`        | Пусть агент сам решит, какая страница ему нужна                                                         |
| **Одна страница как текст** | Добавьте `.md` к любому URL документации | Когда вам нужна только одна страница — дешевле, чем HTML                                                |
| **Сервер MCP**              | `https://docs.apiyi.com/mcp`             | Подключите этот сайт документации как сервер MCP, чтобы ваш агент мог искать по нему в реальном времени |

<Tip>
  Версия этой страницы в виде обычного текста, например, — `https://docs.apiyi.com/en/getting-started.md`. Каждый page on the site supports the suffix.
</Tip>

### Отправьте любую страницу напрямую в AI

На каждой странице документации в правом верхнем углу есть кнопка **Копировать страницу**. Если раскрыть стрелку рядом с ней, появятся дополнительные варианты:

<img src="https://mintcdn.com/apiyillc/pSJvB-WdRHZF62ww/images/contextual-menu-copy-page.png?fit=max&auto=format&n=pSJvB-WdRHZF62ww&q=85&s=34ae33d4f4555c0b9436364f12bab88b" alt="Меню Копировать страницу в правом верхнем углу страницы документации с вариантами скопировать страницу, просмотреть как Markdown и открыть в ChatGPT, Claude, Perplexity или Google AI Studio" width="648" height="694" data-path="images/contextual-menu-copy-page.png" />

| Вариант                        | Что делает                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **Копировать страницу**        | Копирует текущую страницу как Markdown в буфер обмена, готовую к вставке в любой AI    |
| **Просмотреть как Markdown**   | Открывает версию в обычном тексте в браузере — удобно для проверки или отправки ссылки |
| **Открыть в ChatGPT**          | Переходит в ChatGPT, передавая эту страницу как контекст                               |
| **Открыть в Claude**           | То же, для Claude                                                                      |
| **Открыть в Perplexity**       | То же, для Perplexity                                                                  |
| **Открыть в Google AI Studio** | То же, для Google AI Studio                                                            |

Если у вас возникла проблема с конкретной моделью, самый быстрый путь — открыть страницу этой модели, нажать **Копировать страницу** и отправить её в AI вместе с описанием ошибки.

## Сделайте это самостоятельно

### Шаг 1: Зарегистрируйтесь и получите ключ

<Steps>
  <Step title="Создайте аккаунт">
    Перейдите на [сайт APIYI](https://api.apiyi.com), зарегистрируйтесь по email и подтвердите его (рекомендуется университетский или корпоративный адрес), затем войдите в консоль.
  </Step>

  <Step title="Создайте API-ключ">
    Откройте [страницу token](https://api.apiyi.com/token):

    1. Вы можете скопировать **token по умолчанию** и использовать его напрямую (значок копирования справа)
    2. Или нажмите **Создать** в правом верхнем углу, чтобы создать его, задайте ему имя (например `test-key`) и подтвердите

    Ключи начинаются с `sk-`. Подробности см. в [Как создать ключ](/ru/faq/token-management).
  </Step>

  <Step title="Пополняйте при необходимости">
    Когда пробный кредит на \$0.05 закончится, выполните пополнение через консоль. Минимальные суммы и правила зачисления зависят от платёжного канала — см. [Способы оплаты](/ru/faq/payment-methods) — а политика бонусов описана в [Акции на пополнение](/ru/faq/recharge-promotions).
  </Step>
</Steps>

### Шаг 2: Правильно укажите сведения для подключения

**Выбирайте базовый URL по SDK, а не по модели.** Это самая частая ошибка при интеграции:

| Ваш SDK                             | Базовый URL                | Почему                                                                                        |
| ----------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| OpenAI SDK (и большинство клиентов) | `https://api.apiyi.com/v1` | SDK сам добавляет `/chat/completions`, поэтому `/v1` должен быть указан                       |
| Anthropic SDK (нативный Claude)     | `https://api.apiyi.com`    | SDK сам добавляет `/v1/messages` — **если добавить `/v1`, получится `/v1/v1/messages` и 404** |
| Google GenAI SDK (нативный Gemini)  | `https://api.apiyi.com`    | Также укажите `api_version: "v1beta"`                                                         |

<Warning>
  Не оставляйте завершающий слэш в `base_url` — это приводит к двойным слэшам и 404. Полные сведения и выбор узла см. в [настройке базового URL](/ru/faq/base-url-config).
</Warning>

### Шаг 3: Выполните первый вызов

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "user", "content": "Hello!"}
        ]
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from 'openai';

    const openai = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: 'https://api.apiyi.com/v1'
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    console.log(response.choices[0].message.content);
    ```
  </Tab>

  <Tab title="Java">
    ```java theme={null}
    // Using the official OpenAI Java library
    OpenAiService service = new OpenAiService(
        System.getenv("APIYI_API_KEY"),
        Duration.ofSeconds(60),
        "https://api.apiyi.com/v1"
    );

    ChatCompletionRequest request = ChatCompletionRequest.builder()
        .model("gpt-5.4-mini")
        .messages(List.of(
            new ChatMessage(ChatMessageRole.USER, "Hello!")
        ))
        .build();

    ChatCompletionResult result = service.createChatCompletion(request);
    System.out.println(result.getChoices().get(0).getMessage().getContent());
    ```
  </Tab>
</Tabs>

<Warning>
  Серия `gpt-5` и выше имеет три ограничения по параметрам: `temperature` должен быть равен 1, используйте `max_completion_tokens` вместо `max_tokens` и не отправляйте `top_p`.
</Warning>

## Следующие шаги

<CardGroup cols={2}>
  <Card title="Подключите Claude Code" icon="terminal" href="/ru/scenarios/programming/claude-code">
    Настройте `ANTHROPIC_BASE_URL` и управляйте Claude Code через APIYI
  </Card>

  <Card title="Подключите Codex" icon="square-terminal" href="/ru/scenarios/programming/codex-cli">
    Одна `config.toml` охватывает настольное приложение, плагин IDE и CLI
  </Card>

  <Card title="Изучите список моделей" icon="bot" href="/ru/api-capabilities/model-info">
    Каждая поддерживаемая модель и шпаргалка по возможностям
  </Card>

  <Card title="Прочитайте руководство по API" icon="book" href="/ru/api-manual">
    Полный справочник по эндпоинтам, коды ошибок и отладка
  </Card>
</CardGroup>

## FAQ

### Как переключать модели?

Просто измените параметр `model` в вашем запросе:

```json theme={null}
{
  "model": "gpt-5.6-sol",         // Use GPT-5.6 Sol
  "model": "claude-opus-5",       // Use Claude Opus 5
  "model": "gemini-3.6-flash"     // Use Gemini 3.6 Flash
}
```

<Warning>
  **Идентификаторы моделей используют точки, а не дефисы.** Дефисы в URL документации — это замена для безопасного использования URL; настоящий идентификатор модели сохраняет точки. Страница `/models/qwen3-7-max` соответствует идентификатору модели `qwen3.7-max`. Если указать `gpt-5-4-mini`, вернётся 404 — правильная форма: `gpt-5.4-mini`.

  Если сомневаетесь, выведите их списком: `GET https://api.apiyi.com/v1/models`.
</Warning>

### Какие языки программирования поддерживаются?

APIYI совместим со стандартами OpenAI API и поддерживает все языки, которые поддерживают SDK OpenAI:

* Python
* JavaScript/TypeScript
* Java
* C#/.NET
* Go
* Ruby
* PHP
* И другие...

### Как проверить баланс?

Войдите в [консоль](https://api.apiyi.com/account/profile), чтобы просмотреть:

* Баланс аккаунта
* Историю использования
* Статистику потребления

Вы также можете выполнить запрос программно через API:

* [API запроса баланса](/ru/api-capabilities/balance-query): Получите баланс аккаунта, дату истечения и многое другое через API
* [Настройка оповещения о низком балансе](/ru/faq/balance-alerts): Автоматически уведомлять при низком балансе, чтобы избежать прерывания работы сервиса

### Что делать, если возникла проблема?

1. Откройте страницу, с которой у вас возникла проблема, нажмите **Copy page** в правом верхнем углу и отправьте её в AI вместе с вашей ошибкой
2. Ознакомьтесь с [руководством API](/ru/api-manual)
3. Просмотрите [частые ошибки](/ru/faq/invalid-api-key)
4. Свяжитесь со службой поддержки: [support@apiyi.com](mailto:support@apiyi.com)

<Info>
  Совет: храните ваш API key в безопасном месте и регулярно проверяйте журналы использования в консоли. Каждый запрос содержит историю сообщений для оптимизации затрат.
  Приятной работы!
</Info>
