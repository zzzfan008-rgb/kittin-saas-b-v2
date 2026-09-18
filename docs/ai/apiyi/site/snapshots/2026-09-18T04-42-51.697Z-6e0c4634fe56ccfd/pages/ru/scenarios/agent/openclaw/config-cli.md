> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Интерактивная настройка в CLI

> Используйте мастер первичной настройки OpenClaw и команды CLI, чтобы быстро настроить OpenClaw

## Мастер настройки (рекомендуется для новых пользователей)

Для первого использования запустите мастер настройки, чтобы завершить всю конфигурацию:

```bash theme={null}
openclaw onboard
```

### Шаг 1: Выберите поставщика модели

В списке **поставщика модели/авторизации** прокрутите вниз и выберите:

```text theme={null}
Custom Provider (Any OpenAI or Anthropic compatible endpoint)
```

### Шаг 2: Введите базовый URL API

В поле **базовый URL API** введите endpoint APIYI:

```text theme={null}
https://api.apiyi.com
```

### Шаг 3: Выберите способ ввода API key

Когда вас спросят, как предоставить API key, выберите:

```text theme={null}
Paste API key now
```

### Шаг 4: Вставьте API key

Вставьте ваш token APIYI (также называемый API key, начинающийся с `sk-`) в поле ввода.

Как получить ваш token:

1. Откройте страницу управления token APIYI: `https://api.apiyi.com/token`
2. Найдите token по умолчанию с типом **Pay-per-use Priority**
3. Справа в строке этого token, в столбце «Actions», нажмите **первую кнопку копирования**
4. Это скопирует token с префиксом `sk-` (API key) — вставьте его сюда

<img src="https://mintcdn.com/apiyillc/VhX_X1CtsRG4uabo/images/openclaw-paste-api-key.png?fit=max&auto=format&n=VhX_X1CtsRG4uabo&q=85&s=e34c60488a8e4ed46fdcb1edccda8812" alt="Вставьте API key" width="1338" height="800" data-path="images/openclaw-paste-api-key.png" />

<Tip>
  Не нужно создавать новый token — просто используйте token по умолчанию «Pay-per-use Priority», сгенерированный системой.
</Tip>

### Шаг 5: Выберите совместимость эндпоинта

В параметре **совместимость эндпоинта** выберите:

```text theme={null}
OpenAI-compatible (Uses /chat/completions)
```

<Info>
  Если вы в основном используете модели Claude и вам нужны нативные функции, такие как Prompt Caching, вы можете вместо этого выбрать `Anthropic-compatible`. Подробности см. в [Нативная конфигурация Anthropic](/ru/scenarios/agent/openclaw/config-anthropic).
</Info>

### Шаг 6: Укажите ID модели

В поле **ID модели** введите имя модели, которую хотите использовать, например:

```text theme={null}
gpt-5.4
```

Другие варианты: `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` и т. д.

### Шаг 7: Проверьте и завершите

OpenClaw автоматически проверит конфигурацию. При успешной проверке система сгенерирует **ID эндпоинта** (например, `custom-api-apiyi-com`), что означает завершение настройки.

<Warning>
  Проверка иногда может возвращать ошибки — обычно повторная попытка помогает. Если ошибка продолжает появляться, проверьте, что ваш API key указан верно и соединение с сетью стабильно.
</Warning>

### Сводка конфигурации

| Параметр      | Значение                                            |
| ------------- | --------------------------------------------------- |
| Поставщик     | Пользовательский поставщик                          |
| API Base URL  | `https://api.apiyi.com`                             |
| Совместимость | Совместимый с OpenAI                                |
| Endpoint ID   | `custom-api-apiyi-com` (сгенерирован автоматически) |

## Изменение конфигурации

После первоначальной настройки используйте команду `configure`, чтобы снова перейти к интерактивной конфигурации:

```bash theme={null}
openclaw configure
```

Это откроет интерактивное меню конфигурации для:

* Провайдеров модели и модели по умолчанию
* Настроек канала чата
* Включения и отключения возможностей
* Параметров шлюза

## Команды для отдельных конфигурационных параметров

Быстро просматривайте или изменяйте отдельные элементы конфигурации:

```bash theme={null}
{/* View current config value */}
openclaw config get agents.defaults.model.primary

{/* Set config value */}
openclaw config set agents.defaults.model.primary "apiyi/gpt-5.4"

{/* Set API key */}
openclaw config set models.providers.apiyi.apiKey "sk-your-key"
```

## Панель конфигурации веб-интерфейса

После запуска Dashboard вы также можете управлять конфигурацией в браузере:

```bash theme={null}
openclaw dashboard
```

Откройте `http://127.0.0.1:18789/`, чтобы перейти на страницу настроек, где вы можете:

* Визуально редактировать конфигурацию модели
* Управлять подключениями каналов чата
* Просматривать и переключать настроенные навыки
* В реальном времени отслеживать логи и состояние работы

## Запуск службы

После настройки запустите шлюз:

```bash theme={null}
openclaw gateway start
```

<Tip>
  После изменения конфигурации перезапустите службу:

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
