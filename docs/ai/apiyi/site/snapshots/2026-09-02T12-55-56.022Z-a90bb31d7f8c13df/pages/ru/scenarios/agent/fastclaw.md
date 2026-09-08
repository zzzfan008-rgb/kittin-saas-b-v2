> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FastClaw

> Легковесная многoагентная среда выполнения на Go с одним бинарником + панелью управления, подключайте любую крупную LLM через APIYI

## Обзор

FastClaw — это легковесная среда выполнения AI Agent на Go, позиционируемая как «Фабрика агентов» — она создаёт, управляет и запускает несколько AI-агентов, у каждого из которых есть собственная личность (SOUL.md), память, навыки и инструменты. FastClaw из коробки обрабатывает взаимодействие с LLM, выполнение инструментов, изоляцию в песочнице и управление сессиями, поставляется в виде одного бинарного файла и включает встроенную веб-панель.

Интегрировав APIYI, вы получаете:

<CardGroup cols={2}>
  <Card title="🚀 Развертывание в одном бинарнике" icon="rocket">
    Установка одной строкой, встроенный SQLite, работает локально или в облаке
  </Card>

  <Card title="🤖 Управление несколькими агентами" icon="users">
    У каждого агента есть собственная личность, модель, навыки и сессии
  </Card>

  <Card title="📱 Многоканальный IM" icon="message-circle">
    Встроенные привязки каналов Telegram / Discord / Slack
  </Card>

  <Card title="🛡️ Изоляция в песочнице" icon="shield">
    Поддержка песочниц Docker / E2B для безопасного выполнения инструментов
  </Card>
</CardGroup>

<Info>
  **Информация о проекте**: FastClaw доступен по исходникам под лицензией FastClaw Community License (Apache 2.0 + addendum). Репозиторий: `github.com/fastclaw-ai/fastclaw`.
</Info>

## Установка и запуск

Установите FastClaw с помощью официальной one-liner-команды — она помещает один бинарный файл в `~/.local/bin`:

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/fastclaw-ai/fastclaw/main/install.sh | bash
```

При первом запуске открывается мастер настройки. После настройки вашего LLM provider автоматически создается агент по умолчанию:

```bash theme={null}
fastclaw                    # Foreground (Ctrl+C to stop)
fastclaw daemon start       # Background (logs at ~/.fastclaw/daemon.log)
fastclaw daemon install     # Register as a launchd / systemd service
```

Затем откройте dashboard по адресу `http://localhost:18953` (порт по умолчанию `18953`).

## Подключение к APIYI (Рекомендуется)

APIYI совместим как с протоколом API OpenAI, так и с протоколом API Anthropic. FastClaw может использовать либо **совместимый с OpenAI провайдер**, либо **совместимый с Anthropic провайдер** — оба варианта обеспечивают доступ ко всей матрице моделей с одним ключом APIYI.

### Вариант 1: Настройка через панель управления (Рекомендуется)

1. Откройте `http://localhost:18953` и войдите в систему с учетной записью администратора, сгенерированной при первом запуске
2. Перейдите в **Модели / провайдеры** и добавьте новую запись провайдера:

| Поле           | Рекомендуемое значение                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Тип провайдера | совместимый с `OpenAI`                                                                                             |
| Base URL       | `https://api.apiyi.com/v1`                                                                                         |
| API Key        | Ваш ключ APIYI (`sk-...`)                                                                                          |
| Модели         | Добавьте по мере необходимости, например `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` |

3. Перейдите в панель **Модели** агента и установите его как модель по умолчанию

### Вариант 2: Настройка через CLI

```bash theme={null}
# 1. Create a new agent, initially bound to APIYI (OpenAI-compatible)
fastclaw agents init alpha \
  --provider openai \
  --model openai/gpt-5.4 \
  --api-key-env APIYI_API_KEY

# 2. Point the OpenAI provider's Base URL at APIYI
fastclaw agents config alpha set provider.openai.apiBase https://api.apiyi.com/v1
fastclaw agents config alpha set provider.openai.apiKeyEnv APIYI_API_KEY

# 3. Add the models you want (append, idempotent)
fastclaw agents config alpha set provider.openai.model gpt-5.4
fastclaw agents config alpha set provider.openai.model claude-sonnet-4-6
fastclaw agents config alpha set provider.openai.model deepseek-v3.2
```

Переменную окружения `APIYI_API_KEY` необходимо сначала экспортировать в вашей оболочке (`export APIYI_API_KEY=sk-...`) — FastClaw не хранит ключ в открытом виде в базе данных.

<Tip>
  **Почему APIYI?**

  * **Один ключ, много моделей**: OpenAI / Anthropic / Google / DeepSeek / Zhipu и другие — не нужно оформлять доступ у каждого провайдера отдельно
  * **Преимущество в цене**: обычно на 5%-20% ниже официальной цены, с бонусами за пополнение на выбранных моделях
  * **Прямой доступ в Китае**: получайте доступ к зарубежным LLM без VPN
  * **Совместимость с двумя протоколами**: поддерживаются оба типа провайдеров FastClaw
</Tip>

### Вариант 3: Нативный протокол Anthropic (Лучше всего для нагрузок с преобладанием Claude)

Если вы в основном используете модели Claude, укажите Anthropic Provider напрямую на APIYI:

| Поле           | Рекомендуемое значение                         |
| -------------- | ---------------------------------------------- |
| Тип провайдера | `Anthropic`                                    |
| Base URL       | `https://api.apiyi.com`                        |
| API Key        | Ваш ключ APIYI                                 |
| Модели         | `claude-sonnet-4-6`, `claude-opus-4-7` и т. д. |

Эквивалент через CLI:

```bash theme={null}
fastclaw agents config alpha set provider.anthropic.apiBase https://api.apiyi.com
fastclaw agents config alpha set provider.anthropic.apiKeyEnv APIYI_API_KEY
fastclaw agents config alpha set provider.anthropic.model claude-sonnet-4-6
fastclaw agents config alpha set model claude-sonnet-4-6
```

## Шпаргалка по функциям

<CardGroup cols={2}>
  <Card title="Управление агентами" icon="bot">
    Панель → Агенты: создавайте / редактируйте агентов, задавайте SOUL.md (личность), IDENTITY.md, MEMORY.md (долговременная память)
  </Card>

  <Card title="Навыки" icon="puzzle">
    В комплекте: code-runner, image-gen, data-analysis, web-search, skill-creator. Устанавливайте дополнительные из ClawHub / GitHub.
  </Card>

  <Card title="Привязки IM-каналов" icon="message-circle">
    Агент → Каналы: вставьте токены ботов Telegram / Discord / Slack — при сохранении выполняется автоматическая проверка.
  </Card>

  <Card title="API, совместимый с OpenAI" icon="code">
    `/v1/chat/completions` streaming-эндпоинт работает с любым OpenAI SDK из коробки.
  </Card>

  <Card title="Выполнение в песочнице" icon="shield">
    Настройки → Runtime: переключайте песочницу Docker / E2B, с автоматической синхронизацией артефактов после вызовов инструментов.
  </Card>

  <Card title="Планировщик" icon="clock">
    Агент → Scheduler: позвольте агенту создавать напоминания по cron через `create_cron_job`.
  </Card>
</CardGroup>

## Режимы развертывания

| Режим          | Сценарий использования           | Ключевая конфигурация                                     |
| -------------- | -------------------------------- | --------------------------------------------------------- |
| **Local**      | Личное использование             | `fastclaw daemon start`, хранилище SQLite по умолчанию    |
| **Docker**     | Сервис на одном хосте            | `cd deploy/docker && ./start.sh`                          |
| **Kubernetes** | Продакшн с несколькими репликами | `FASTCLAW_STORAGE_TYPE=postgres` + объектное хранилище S3 |

Развертывания с несколькими репликами требуют:

* `FASTCLAW_STORAGE_TYPE=postgres`, `FASTCLAW_STORAGE_DSN=postgres://...`
* Набор `FASTCLAW_OBJECT_STORE_*` переменных, указывающих на хранилище, совместимое с S3 (используется для синхронизации skills и workspaces между pod'ами)
* `FASTCLAW_BIND=all` (слушает на `0.0.0.0`)

Полные манифесты K8s находятся в папке `deploy/k8s/` репозитория.

## FAQ

<AccordionGroup>
  <Accordion title="В чем разница между FastClaw и OpenClaw?">
    * **FastClaw**: на Go, один бинарный файл, ориентирован на сценарий «Agent Factory» — управление несколькими агентами, доставка через канал IM, изоляция песочницы. Лучше всего подходит, когда вы хотите предоставлять агентов как сервис.
    * **OpenClaw**: на Node.js, ориентирован на сценарий личного локального помощника — локальная конфиденциальность + взаимодействие между несколькими IM-платформами.
    * Оба могут обращаться ко всей матрице моделей APIYI. Выберите тот вариант, который лучше подходит под вашу схему развертывания.
  </Accordion>

  <Accordion title="Поддерживает ли он полный модельный ряд APIYI?">
    Да. APIYI предоставляет как OpenAI-совместимый эндпоинт (`https://api.apiyi.com/v1`), так и Anthropic-совместимый эндпоинт (`https://api.apiyi.com`). Подходит любой тип провайдера FastClaw — используйте ID моделей напрямую из документации APIYI (например, `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`).
  </Accordion>

  <Accordion title="Как предоставить агента через Telegram / Discord?">
    1. Создайте бота на целевой платформе и получите token
    2. Панель управления → выберите агента → Каналы → вставьте token и сохраните (он автоматически проверяется через `getMe` / `auth.test`)
    3. Найдите бота в IM-платформе и начните общение — сессии изолированы по chatID
  </Accordion>

  <Accordion title="Могу ли я использовать это в коммерческом проекте?">
    Да. Лицензия FastClaw Community License разрешает:

    * ✅ Встраивание в качестве backend вашего собственного продукта (коммерческое использование)
    * ✅ Внутреннее развертывание внутри вашей организации

    Не разрешено (без коммерческой лицензии):

    * ❌ Размещать сам FastClaw как multi-tenant SaaS для сторонних организаций
    * ❌ Удалять или изменять фирменное оформление FastClaw в панели управления

    Коммерческое лицензирование: `support@thinkany.ai`
  </Accordion>
</AccordionGroup>

## Сопутствующие ресурсы

<CardGroup cols={2}>
  <Card title="Репозиторий проекта" icon="github">
    `github.com/fastclaw-ai/fastclaw`
  </Card>

  <Card title="API-документация APIYI" icon="book" href="/ru/getting-started">
    Получите свой ключ и справку по Base URL
  </Card>

  <Card title="Альтернатива OpenClaw" icon="bot" href="/ru/scenarios/agent/openclaw/overview">
    Другой вариант для сценария личного локального ассистента
  </Card>

  <Card title="Тарифы и пополнения" icon="coins" href="/ru/faq/recharge-promotions">
    См. тарифы APIYI и бонусы за первое пополнение
  </Card>
</CardGroup>
