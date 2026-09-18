> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Hermes Агент

> Самоулучшающийся AI-агент Nous Research со встроенным циклом обучения и мультиплатформенным шлюзом, подключаемый к любой LLM через APIYI

## Обзор

Hermes Agent — это AI-агент с открытым исходным кодом, созданный Nous Research и позиционируемый как «агент, который растет вместе с вами». Это один из немногих агентов со встроенным **циклом обучения** — он автономно создает навыки на основе опыта, улучшает их во время использования, подталкивает себя к сохранению знаний, ищет собственные прошлые разговоры через полнотекстовый индекс FTS5 и формирует все более глубокую модель пользователя между сессиями. Hermes не обязан работать только на вашем ноутбуке — он одинаково хорошо запускается на VPS за \$5, кластере GPU или serverless-инфраструктуре, которая почти ничего не стоит в простое.

Интегрировав APIYI, вы получаете:

<CardGroup cols={2}>
  <Card title="🧠 Цикл самоулучшения" icon="brain">
    Автономное создание и улучшение навыков, долговременная память между сессиями
  </Card>

  <Card title="📱 Шлюз для нескольких платформ" icon="message-circle">
    Telegram / Discord / Slack / WhatsApp / Signal / Email / CLI
  </Card>

  <Card title="⏰ Планирование по Cron" icon="clock">
    Встроенный планировщик доставляет отчеты/аудиты через любую платформу
  </Card>

  <Card title="☁️ Работает где угодно" icon="cloud">
    Семь terminal backends — local / Docker / SSH / Modal / Daytona / Vercel Sandbox
  </Card>
</CardGroup>

<Info>
  **Информация о проекте**: Hermes Agent распространяется с лицензией MIT и имеет открытый исходный код. Репозиторий: `github.com/NousResearch/hermes-agent`. Документация: `hermes-agent.nousresearch.com/docs/`.
</Info>

## Установка

### Linux / macOS / WSL2 / Termux

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Windows (PowerShell, ранняя бета для нативной версии)

```powershell theme={null}
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

Установщик автоматически обрабатывает `uv`, Python 3.11, Node.js, `ripgrep`, `ffmpeg` и портативный Git Bash.

После установки обновите shell и запустите:

```bash theme={null}
source ~/.bashrc    # or source ~/.zshrc
hermes              # Launches the TUI, ready to chat
```

## Подключение к APIYI

Hermes поставляется с командой `hermes model`, поддерживающей Nous Portal / OpenRouter / OpenAI / пользовательские эндпоинты. APIYI предоставляет **OpenAI-compatible API** — подключите его как «пользовательский OpenAI-эндпоинт», и вы сразу получите всю матрицу моделей APIYI.

### Вариант 1: Настройка через `hermes model` (рекомендуется)

```bash theme={null}
hermes model        # Enter the model selection wizard
```

Мастер спросит:

| Шаг          | Ввод                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| Провайдер    | Выберите `OpenAI` (или `Custom OpenAI endpoint`)                                                         |
| API Base URL | `https://api.apiyi.com/v1`                                                                               |
| API Key      | Ваш ключ APIYI (`sk-...`)                                                                                |
| Модель       | Нужный вам ID модели, например `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` |

### Вариант 2: Настройка через `hermes config set`

```bash theme={null}
hermes config set llm.provider openai
hermes config set llm.base_url https://api.apiyi.com/v1
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model gpt-5.4
```

Затем один раз выполните `hermes`, чтобы проверить подключение.

### Вариант 3: Переменные окружения (лучше всего для Docker / serverless)

```bash theme={null}
export OPENAI_API_BASE=https://api.apiyi.com/v1
export OPENAI_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=gpt-5.4
hermes
```

Меняйте модели в любой момент через `hermes model` или обновляя `HERMES_MODEL` — **изменения в коде не нужны**.

### Вариант 4: Нативный протокол Anthropic (лучше всего для нагрузок с упором на Claude)

Hermes рассматривает Anthropic как **провайдера первого класса**. Внутри wire-протокол называется `anthropic_messages`, и он дает преимущества, которых нет у пути, совместимого с OpenAI:

<Info>
  **Почему нативный Anthropic — лучший путь для Claude**: для нативного Anthropic, OpenRouter и провайдеров Nous Portal Hermes автоматически добавляет `cache_control` контрольные точки с TTL 1 час для system prompt, блоков навыков и ранней части длинного context. Последующие отправки между сессиями и форкнутыми подагентами используют кэш по сниженной ставке чтения из кэша. **Эта оптимизация НЕ работает на пути, совместимом с OpenAI.**
</Info>

Настройка CLI:

```bash theme={null}
hermes config set llm.provider anthropic
hermes config set llm.base_url https://api.apiyi.com
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model claude-sonnet-4-6
```

Эквивалент для переменных окружения:

```bash theme={null}
export ANTHROPIC_BASE_URL=https://api.apiyi.com
export ANTHROPIC_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=claude-sonnet-4-6
hermes
```

<Warning>
  **НЕ включайте `/v1` в `base_url`** — должно быть `https://api.apiyi.com`. Протокол Anthropic автоматически добавляет `/v1/messages`; если включить `/v1` вручную, получится `.../v1/v1/messages` и возникнет 404.
</Warning>

Hermes автоматически определяет wire-протокол по URL (пути, заканчивающиеся на `/anthropic`, направляются в `anthropic_messages`). Для нестандартных эндпоинтов, таких как прокси LiteLLM, задайте режим явно:

```bash theme={null}
hermes config set llm.api_mode anthropic_messages
```

**Бонус**: при создании token в `api.apiyi.com/token` **выберите группу `ClaudeCode`**, чтобы автоматически получить скидку 5%, суммируемую с бонусом за пополнение 10%-20%.

<Tip>
  **Почему APIYI?**

  * **Один ключ, много моделей**: OpenAI / Anthropic / Google / DeepSeek / Zhipu / Kimi и не только
  * **Преимущество в тарификации**: обычно на 5%-20% дешевле официальной тарификации, с бонусами за пополнение на выбранных моделях
  * **Прямой доступ в Китае**: получайте доступ к зарубежным LLM без VPN
  * **Совместимость с двумя протоколами**: поддерживаются эндпоинты как с OpenAI-wire, так и с Anthropic-wire. Пользователи Claude с высокой нагрузкой получают скидку на кэш между сессиями при использовании нативного пути Anthropic.
</Tip>

## Краткая памятка по функциям

<CardGroup cols={2}>
  <Card title="Терминальный UI" icon="terminal">
    Полный TUI: многострочное редактирование, автодополнение slash-команд, история диалога, потоковая передача вывода инструментов
  </Card>

  <Card title="Шлюз сообщений" icon="bot">
    Запустите `hermes gateway setup`, чтобы привязать bot tokens и вести чат с любой IM-платформы
  </Card>

  <Card title="Система навыков" icon="puzzle">
    Процедурная память + Центр навыков (`agentskills.io`) — становится умнее по мере использования
  </Card>

  <Card title="Интеграция MCP" icon="plug">
    Подключите любой MCP server, включая созданный сообществом Linux desktop-control MCP
  </Card>

  <Card title="Запланированные задачи" icon="clock">
    Встроенный cron — на естественном языке, например «отправляйте мне ежедневный отчет в 9:00»
  </Card>

  <Card title="Субагенты" icon="users">
    Создавайте изолированные subagents для параллельной работы; вызывайте tools через RPC из Python-скриптов
  </Card>
</CardGroup>

## Миграция с OpenClaw

Если вы переходите с OpenClaw, Hermes включает встроенный инструмент миграции:

```bash theme={null}
hermes claw migrate              # Interactive full migration
hermes claw migrate --dry-run    # Preview what would be migrated
hermes claw migrate --preset user-data   # User data only, no secrets
hermes claw migrate --overwrite  # Overwrite conflicts
```

Он импортирует `SOUL.md`, memories (`MEMORY.md` / `USER.md`), созданные пользователем skills, списки разрешённых команд, конфигурации messaging platform, API keys (Telegram / OpenRouter / OpenAI / Anthropic / ElevenLabs), ресурсы TTS и инструкции workspace.

## Вопросы и ответы

<AccordionGroup>
  <Accordion title="Чем Hermes Agent отличается от OpenClaw и FastClaw?">
    * **Hermes Agent**: реализация на Python от Nous Research — ориентирована на **цикл самоулучшения** с эволюцией навыков и памятью между сессиями, удобна для исследований (поддерживает генерацию траекторий)
    * **OpenClaw**: реализация на Node.js — ориентирована на локальную конфиденциальность + взаимодействие между несколькими IM-платформами
    * **FastClaw**: однобинарная реализация на Go — ориентирована на управление несколькими агентами в формате Dashboard

    Все три могут работать с полной матрицей моделей APIYI. Выбирайте тот вариант, который подходит вашему сценарию.
  </Accordion>

  <Accordion title="Поддерживает ли он полную линейку моделей APIYI?">
    Да. Hermes поддерживает как протоколы, совместимые с **OpenAI**, так и нативные протоколы **Anthropic**:

    * Эндпоинт OpenAI: `https://api.apiyi.com/v1` — полная матрица моделей
    * Эндпоинт Anthropic: `https://api.apiyi.com` (без `/v1`) — семейство Claude

    Используйте идентификаторы моделей из документации APIYI напрямую (например, `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`). Пользователям, активно использующим Claude, следует перейти на нативный путь Anthropic, чтобы разблокировать 1-часовое кэширование промптов между сессиями Hermes.
  </Accordion>

  <Accordion title="Как работает межплатформенный обмен сообщениями?">
    Hermes запускает **один процесс шлюза**, который управляет подключениями ботов в Telegram / Discord / Slack / WhatsApp / Signal. `hermes gateway setup` проведет вас через вставку tokens, а `hermes gateway start` направляет сообщения со всех платформ в один и тот же экземпляр агента — **разговоры остаются непрерывными между платформами**, так что вы можете продолжить тред Telegram в Discord.

    Он включает транскрибацию голосовых заметок, а доставки cron проходят через тот же шлюз.
  </Accordion>

  <Accordion title="Можно ли запускать его в облаке?">
    Да — и Hermes для этого и создан. Он предлагает семь терминальных бэкендов:

    * **Local / Docker / SSH / Singularity**: традиционные развёртывания
    * **Modal / Daytona**: serverless-постоянство — уходит в гибернацию при простое, пробуждается по запросу, почти нулевая стоимость между сессиями
    * **Vercel Sandbox**: edge runtime

    Для работы 24/7 достаточно VPS за \$5. Отправка задач с телефона через Telegram на облачную VM работает без дополнительной настройки.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Репозиторий проекта" icon="github">
    `github.com/NousResearch/hermes-agent`
  </Card>

  <Card title="Официальная документация" icon="book">
    `hermes-agent.nousresearch.com/docs/`
  </Card>

  <Card title="Альтернатива OpenClaw" icon="bot" href="/ru/scenarios/agent/openclaw/overview">
    Для сценария использования с локальной конфиденциальностью и взаимодействием с IM
  </Card>

  <Card title="Альтернатива FastClaw" icon="bolt" href="/ru/scenarios/agent/fastclaw">
    Для сценария использования с фабрикой multi-agent и Dashboard
  </Card>
</CardGroup>
