> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenCode

> AI-агент с открытым исходным кодом для программирования, поддерживающий платформы терминала/IDE/настольных компьютеров; настройте с APIYI для стабильной и эффективной работы при программировании

## Обзор

OpenCode — полностью open-source AI coding agent, созданный на TypeScript и AI SDK, с поддержкой терминального TUI, интеграции с IDE и настольных приложений. У проекта более 94,9 тыс.+ звезд на GitHub и активное сообщество.

Настроив сервис APIYI, вы получите:

<CardGroup cols={2}>
  <Card title="🖥️ Поддержка нескольких платформ" icon="monitor">
    Терминальный TUI, расширение для VS Code и настольные приложения
  </Card>

  <Card title="🔌 Поддержка 75+ моделей" icon="plug">
    Поддерживает 75+ провайдеров LLM через Models.dev
  </Card>

  <Card title="🛠️ Встроенный LSP" icon="code">
    Поддержка Language Server Protocol для интеллектуального понимания кода
  </Card>

  <Card title="🔄 Параллельная работа нескольких сессий" icon="layers">
    Параллельная обработка сессий и совместное использование сессий
  </Card>
</CardGroup>

<Info>
  **Информация о проекте**: OpenCode — активно поддерживаемый open-source проект. Веб-сайт: `opencode.ai`, репозиторий: `github.com/anomalyco/opencode`.
</Info>

## Предварительные требования

### Установите OpenCode

<Tabs>
  <Tab title="Быстрая установка (рекомендуется)">
    ```bash theme={null}
    curl -fsSL https://opencode.ai/install | bash
    ```
  </Tab>

  <Tab title="npm">
    ```bash theme={null}
    npm i -g opencode-ai@latest
    ```
  </Tab>

  <Tab title="Homebrew (macOS/Linux)">
    ```bash theme={null}
    brew install anomalyco/tap/opencode
    ```
  </Tab>

  <Tab title="Windows">
    Scoop:

    ```bash theme={null}
    scoop install opencode
    ```

    Chocolatey:

    ```bash theme={null}
    choco install opencode
    ```
  </Tab>

  <Tab title="Arch Linux">
    ```bash theme={null}
    paru -S opencode-bin
    ```
  </Tab>

  <Tab title="Настольное приложение">
    Скачайте настольное приложение для вашей системы с `opencode.ai`:

    * macOS (Apple Silicon / Intel)
    * Windows
    * Linux (AppImage / deb)
  </Tab>
</Tabs>

Проверьте установку:

```bash theme={null}
opencode --version
```

## Быстрая конфигурация

OpenCode использует JSON-файлы конфигурации с несколькими расположениями конфигурации (приоритет от низкого к высокому):

1. Удаленная конфигурация (`.well-known/opencode`)
2. Глобальная конфигурация: `~/.config/opencode/opencode.json`
3. Пользовательская конфигурация: путь, указанный переменной окружения `OPENCODE_CONFIG`
4. Конфигурация проекта: `opencode.json` в корне проекта
5. Конфигурация каталога `.opencode`
6. Встроенная конфигурация: переменная окружения `OPENCODE_CONFIG_CONTENT`

### Метод 1: Пользовательский провайдер (рекомендуется)

Создайте или отредактируйте файл конфигурации `~/.config/opencode/opencode.json`:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "gpt-4.1": {
          "name": "GPT-4.1",
          "limit": { "context": 1047576, "output": 32768 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gemini-2.5-pro-preview-05-06": {
          "name": "Gemini 2.5 Pro",
          "limit": { "context": 1048576, "output": 65536 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

Затем задайте переменную окружения:

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    # zsh
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.zshrc
    source ~/.zshrc

    # bash
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.bashrc
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell:

    ```powershell theme={null}
    [System.Environment]::SetEnvironmentVariable('APIYI_API_KEY', 'sk-your-apiyi-key', 'User')
    ```

    Или добавьте `APIYI_API_KEY` в системные переменные окружения.
  </Tab>
</Tabs>

### Метод 2: Аутентификация через команду /connect

OpenCode предоставляет команду `/connect` для быстрого подключения новых провайдеров:

1. После запуска OpenCode введите `/connect`
2. Выберите «Другое»
3. Введите ID провайдера (например, `apiyi`)
4. Введите API key

Затем добавьте в файл конфигурации описание провайдера и моделей, чтобы использовать их.

### Метод 3: Переопределение существующего провайдера

Для быстрой настройки переопределите baseURL встроенного провайдера OpenAI:

```json theme={null}
{
  "provider": {
    "openai": {
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      }
    }
  }
}
```

### Метод 4: Конфигурация на уровне проекта

Создайте `opencode.json` в корне проекта для настроек, относящихся к проекту:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

## Система агентов

В OpenCode есть три встроенных агента, каждый со своим назначением:

| Агент       | Описание                                                                                 | Использование    |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **build**   | Агент по умолчанию с полным доступом, отвечает за генерацию и изменение кода             | Прямое общение   |
| **plan**    | Агент только для чтения, предназначен для анализа кода и планирования, не изменяет файлы | Команда `/plan`  |
| **general** | Подагент для сложного поиска и многошагового извлечения информации                       | Вызов `@general` |

### Конфигурация моделей агентов

Настройте разные модели для разных агентов:

```json theme={null}
{
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gpt-4.1-mini": {
          "name": "GPT-4.1 Mini",
          "limit": { "context": 1047576, "output": 32768 }
        }
      }
    }
  },
  "agents": {
    "build": {
      "model": "apiyi/claude-sonnet-4-20250514"
    },
    "plan": {
      "model": "apiyi/deepseek-chat"
    },
    "general": {
      "model": "apiyi/gpt-4.1-mini"
    }
  }
}
```

## Рекомендуемые модели

OpenCode поддерживает более 400 AI-моделей через APIYI. Выберите подходящую модель для разных задач.

<Card title="Посмотреть рекомендации по моделям для программирования" icon="code" href="/ru/api-capabilities/model-info">
  Ознакомьтесь с последними рекомендациями по моделям для программирования, сравнениями производительности и советами по использованию. Включает модели высшего уровня, экономичные варианты и модели с улучшенным рассуждением.
</Card>

### Рекомендации по моделям в зависимости от сценария

| Агент   | Назначение                       | Рекомендуемая модель            |
| ------- | -------------------------------- | ------------------------------- |
| build   | Генерация и модификация кода     | Claude Sonnet 4, GPT-4.1        |
| plan    | Планирование и анализ задач      | DeepSeek V3, Gemini 2.5 Pro     |
| general | Быстрый поиск и вопросы и ответы | GPT-4.1 Mini (низкая стоимость) |

## Основные возможности

### Интерактивный терминальный интерфейс

Запустите OpenCode, чтобы перейти в интерактивный TUI:

```bash theme={null}
# Start in current directory
opencode

# Specify project directory
opencode /path/to/project
```

### Операции с файлами

OpenCode может читать, искать и изменять файлы проекта:

```text theme={null}
> View the contents of src/index.ts

> Search for all files containing "TODO" in the project

> Refactor the calculateSum function in utils.ts to a more efficient implementation
```

### Выполнение команд

Выполняйте команды в терминале и просматривайте результаты:

```text theme={null}
> Run npm test and analyze the failed tests

> Execute npm install and check for dependency conflicts
```

### Управление сеансами

* **Параллельное выполнение нескольких сеансов**: Запускайте несколько сеансов одновременно
* **Совместное использование сеансов**: Экспортируйте и делитесь сеансами
* **Автосохранение**: Все сеансы автоматически сохраняются
* **Сохранение контекста**: Сохраняйте полный контекст беседы во время сеансов

## Советы по использованию

### 1. Сочетания клавиш

| Сочетание | Функция                      |
| --------- | ---------------------------- |
| `Ctrl+C`  | Прервать текущую операцию    |
| `Ctrl+D`  | Выйти из OpenCode            |
| `Tab`     | Автодополнение               |
| `↑/↓`     | Просматривать историю команд |

### 2. Частые команды

| Команда    | Функция                                 |
| ---------- | --------------------------------------- |
| `/connect` | Подключить нового провайдера            |
| `/model`   | Переключить текущую модель              |
| `/plan`    | Использовать плановый агент для анализа |
| `/clear`   | Очистить текущую сессию                 |
| `/help`    | Просмотреть справочную информацию       |

### 3. Вызов подагента

Используйте `@general`, чтобы вызвать поискового подагента для сложных запросов:

```text theme={null}
> @general Find all files handling user authentication in the codebase and summarize their functions
```

### 4. Инкрементальная разработка

```text theme={null}
{/* Step 1: Generate basic framework */}
> Create a basic REST API structure

{/* Step 2: Add specific features */}
> Add user authentication middleware

{/* Step 3: Refine details */}
> Add request parameter validation and error handling
```

## Устранение неполадок

<AccordionGroup>
  <Accordion title="Не удается подключиться к APIYI">
    1. Проверьте, что переменная окружения задана правильно:

    ```bash theme={null}
    echo $APIYI_API_KEY  # macOS/Linux
    echo %APIYI_API_KEY%  # Windows
    ```

    2. Проверьте baseURL в файле конфигурации:

    ```json theme={null}
    "baseURL": "https://api.apiyi.com/v1"
    ```

    3. Проверьте подключение к API:

    ```bash theme={null}
    curl -H "Authorization: Bearer $APIYI_API_KEY" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="Ошибка: модель не найдена">
    Убедитесь, что идентификатор модели указан правильно. Проверьте в консоли APIYI поддерживаемые модели.

    Часто используемые идентификаторы моделей:

    * `claude-sonnet-4-20250514`
    * `gpt-4.1`
    * `deepseek-chat`
    * `gemini-2.5-pro-preview-05-06`
  </Accordion>

  <Accordion title="Файл конфигурации не применяется">
    Приоритет загрузки файла конфигурации (от низкого к высокому):

    1. Удаленная конфигурация (`.well-known/opencode`)
    2. Глобальная конфигурация: `~/.config/opencode/opencode.json`
    3. Переменная окружения `OPENCODE_CONFIG`
    4. Конфигурация проекта: `opencode.json`
    5. Конфигурация каталога `.opencode`
    6. Переменная окружения `OPENCODE_CONFIG_CONTENT`

    Убедитесь, что файл конфигурации находится в правильном месте и имеет допустимый формат JSON.
  </Accordion>

  <Accordion title="Медленный ответ">
    1. Попробуйте использовать более легкую модель (например, GPT-4.1 Mini)
    2. Уменьшите длину контекстного окна, начните новую сессию
    3. Проверьте стабильность сетевого соединения
  </Accordion>
</AccordionGroup>

## Лучшие практики

### 1. Стратегия выбора модели

| Тип задачи                | Рекомендуемая модель | Причина                                                       |
| ------------------------- | -------------------- | ------------------------------------------------------------- |
| Сложная генерация кода    | Claude Sonnet 4      | Высокие навыки кодинга, хорошее понимание контекста           |
| Code review               | GPT-4.1              | Сильные аналитические способности, хорошее внимание к деталям |
| Быстрые вопросы и ответы  | DeepSeek V3          | Быстрый ответ, экономичность                                  |
| Анализ длинных документов | Gemini 2.5 Pro       | Поддерживает сверхдлинное контекстное окно                    |

### 2. Эффективные промпты

```text theme={null}
❌ Poor prompt: Help me write code

✅ Good prompt: Write an HTTP middleware in TypeScript that
logs requests, including request method, path,
response time, and status code, using pino for output
```

### 3. Соображения по безопасности

* Не встраивайте API-ключи в код
* Используйте переменные окружения для управления конфиденциальной информацией
* Проверяйте код, сгенерированный AI, особенно части, связанные с безопасностью
* Будьте осторожны и не позволяйте AI выполнять опасные системные команды

### 4. Контроль затрат

* Настройте разные модели для разных агентов (сильные модели для сборки, легкие — для общих задач)
* Используйте легкие модели для простых задач
* Регулярно проверяйте консоль APIYI, чтобы отслеживать использование

## Альтернативы

Если OpenCode не подходит вам, рассмотрите эти инструменты:

<CardGroup cols={2}>
  <Card title="Claude Code" icon="bot" href="/ru/scenarios/programming/claude-code">
    Официальный терминальный помощник Anthropic для программирования
  </Card>

  <Card title="Codex CLI" icon="code" href="/ru/scenarios/programming/codex-cli">
    Официальный инструмент командной строки OpenAI
  </Card>

  <Card title="Gemini CLI" icon="terminal" href="/ru/scenarios/programming/gemini-cli">
    Официальный терминальный помощник Google для программирования
  </Card>

  <Card title="Roo Code" icon="wand-sparkles" href="/ru/scenarios/programming/roo-code">
    AI-расширение для программирования для VS Code
  </Card>
</CardGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Консоль APIYI" icon="settings" href="https://api.apiyi.com">
    Управляйте API-ключами и просматривайте использование
  </Card>

  <Card title="Рекомендации по моделям" icon="chart-bar" href="/ru/api-capabilities/model-info">
    Просматривайте рекомендации моделей для сценариев программирования
  </Card>
</CardGroup>
