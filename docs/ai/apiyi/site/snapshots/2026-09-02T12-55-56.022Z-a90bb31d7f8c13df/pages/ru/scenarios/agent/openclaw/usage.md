> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по использованию

> Способы использования OpenClaw, основные навыки, распространенные команды и практические примеры

## Способы использования

### Способ 1: Web UI (рекомендуется)

Самый простой способ, не требует внешних сервисов:

```bash theme={null}
openclaw dashboard
```

В вашем браузере откроется `http://127.0.0.1:18789/`, где вы сможете общаться напрямую в веб-интерфейсе.

<Tip>
  Web UI — рекомендуемый способ, так как он работает напрямую и не требует прокси.
</Tip>

### Способ 2: Telegram Bot

1. Найдите `@BotFather` в Telegram
2. Отправьте `/newbot`, чтобы создать бота
3. Получите Bot Token
4. Введите Token во время `openclaw onboard`

<Warning>
  Если вы находитесь в регионе, где Telegram требует прокси:

  ```bash theme={null}
  export https_proxy=http://127.0.0.1:proxy-port
  export http_proxy=http://127.0.0.1:proxy-port
  openclaw gateway restart
  ```
</Warning>

### Способ 3: Другие платформы

OpenClaw также поддерживает:

* WhatsApp (сканируйте QR-код для подключения)
* Discord (требует создания бота)
* Slack, Signal, iMessage, Microsoft Teams и т. д.

## Основные навыки

OpenClaw поставляется с богатыми встроенными навыками для различных задач:

### Операции с файлами

| Навык      | Функция                           |
| ---------- | --------------------------------- |
| `fs.read`  | Чтение файлов (текст/изображения) |
| `fs.write` | Запись/создание файлов            |
| `fs.edit`  | Редактирование содержимого файла  |

### Системные операции

| Навык           | Функция                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| `shell.exec`    | Выполнение команд терминала                                              |
| `shell.process` | Управление выполняющимися командами                                      |
| `browser.*`     | Автоматизация браузера (открытие страниц, снимок экрана, щелчки и т. д.) |

### Умные функции

| Навык           | Функция                                             |
| --------------- | --------------------------------------------------- |
| `web_search`    | Поиск в вебе                                        |
| `web_fetch`     | Получение веб-контента                              |
| `memory_search` | Поиск в памяти                                      |
| `memory_get`    | Извлечение из памяти                                |
| `cron.*`        | Запланированные задачи (напоминания, автоматизация) |
| `tts`           | Преобразование текста в речь                        |

## Общие команды

### Команды терминала

| Команда                    | Функция                                       |
| -------------------------- | --------------------------------------------- |
| `openclaw onboard`         | Запустить мастер настройки                    |
| `openclaw gateway start`   | Запустить службу шлюза                        |
| `openclaw gateway restart` | Перезапустить службу шлюза                    |
| `openclaw gateway stop`    | Остановить службу шлюза                       |
| `openclaw status`          | Проверить состояние работы                    |
| `openclaw doctor`          | Диагностировать проблемы конфигурации         |
| `openclaw doctor --fix`    | Автоматически исправить проблемы конфигурации |
| `openclaw dashboard`       | Открыть веб-панель управления                 |
| `openclaw logs --follow`   | Просмотреть журналы в реальном времени        |
| `openclaw configure`       | Изменить конфигурацию                         |
| `openclaw update`          | Обновить до последней версии                  |

### Команды чата

Команды, доступные в окне чата:

| Команда           | Функция                        |
| ----------------- | ------------------------------ |
| `/help`           | Показать справку               |
| `/new`            | Начать новый разговор          |
| `/reset`          | Сбросить разговор              |
| `/stop`           | Остановить текущую задачу      |
| `/think <level>`  | Установить глубину рассуждения |
| `/model <id>`     | Сменить модель                 |
| `/verbose on/off` | Переключить подробный режим    |
| `/status`         | Проверить статус               |
| `/skills`         | Просмотреть доступные навыки   |

## Примеры использования

Общайтесь с OpenClaw естественно, и он будет понимать и выполнять задачи:

### Операции с файлами

```text theme={null}
> Create a test.txt file on my desktop with content "hello world"

> Read the content of ~/Documents/notes.txt

> Move all .png files from desktop to Pictures folder
```

### Команды терминала

```text theme={null}
> List all files on my desktop

> Check current system memory usage

> Install the Python requests library
```

### Управление браузером

```text theme={null}
> Open browser and visit google.com

> Search for the latest MacBook Pro prices

> Take a screenshot of the current webpage
```

### Запланированные задачи

```text theme={null}
> Remind me to drink water every day at 9am

> Remind me to take a break every hour

> Remind me about the meeting tomorrow at 3pm
```

### Помощь в программировании

```text theme={null}
> Write a Python script to batch rename files

> What's wrong with this code: [paste code]

> Create a simple HTML page for me
```

## Рекомендуемые модели

OpenClaw поддерживает более 400 основных AI-моделей через APIYI. Выберите подходящую модель для разных задач.

<Card title="Посмотреть рекомендации по моделям" icon="star" href="/ru/api-capabilities/model-info">
  Проверьте последние рекомендации по моделям на основе сценариев, включая создание текста, программирование, быстрые ответы, обработку длинных документов и многое другое.
</Card>

### Рекомендации по сценариям

| Тип задачи                   | Рекомендуемая модель | Причина                                        |
| ---------------------------- | -------------------- | ---------------------------------------------- |
| Выполнение сложных задач     | Claude Sonnet 4      | Сильное понимание, точное выполнение           |
| Ежедневное общение           | GPT-5.4              | Естественные ответы, хорошая универсальность   |
| Написание кода               | DeepSeek V3.2        | Сильные навыки кодирования, выгодная стоимость |
| Обработка длинных документов | Gemini 3.1 Pro       | Поддерживает ультрадлинное контекстное окно    |
