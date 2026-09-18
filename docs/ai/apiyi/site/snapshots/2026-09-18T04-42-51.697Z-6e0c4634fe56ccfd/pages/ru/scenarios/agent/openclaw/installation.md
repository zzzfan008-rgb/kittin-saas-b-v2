> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по установке

> Установка локального AI-ассистента OpenClaw на macOS, Linux и Windows

## Системные требования

* Node.js 22 или выше
* macOS / Linux / Windows

## Установите Node.js

<Tabs>
  <Tab title="macOS (Homebrew)">
    ```bash theme={null}
    brew install node@22
    ```
  </Tab>

  <Tab title="Linux (nvm)">
    ```bash theme={null}
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    nvm install 22
    nvm use 22
    ```
  </Tab>

  <Tab title="Windows">
    Скачайте и установите версию 22.x или выше с официального сайта Node.js.

    Или используйте PowerShell, чтобы установить fnm:

    ```powershell theme={null}
    winget install Schniz.fnm
    fnm install 22
    fnm use 22
    ```
  </Tab>
</Tabs>

## Установка OpenClaw

<Tabs>
  <Tab title="npm (Рекомендуется)">
    ```bash theme={null}
    npm install -g openclaw
    ```
  </Tab>

  <Tab title="Скрипт быстрой установки">
    ```bash theme={null}
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```
  </Tab>

  <Tab title="PowerShell для Windows">
    ```powershell theme={null}
    irm https://openclaw.ai/install.ps1 | iex
    ```
  </Tab>
</Tabs>

## Проверка установки

```bash theme={null}
openclaw --version
```

Выполните диагностическую команду, чтобы проверить, готова ли среда:

```bash theme={null}
openclaw doctor
```

Проверьте текущий статус работы:

```bash theme={null}
openclaw status
```

<Info>
  Если `openclaw doctor` сообщает о проблемах, попробуйте автоматическое исправление:

  ```bash theme={null}
  openclaw doctor --fix
  ```
</Info>

## Следующие шаги

После установки выберите способ настройки:

<CardGroup cols={3}>
  <Card title="Конфигурация JSON" icon="file-code" href="/ru/scenarios/agent/openclaw/config-json">
    Вручную редактируйте JSON-конфиг
  </Card>

  <Card title="Интерактивная настройка CLI" icon="terminal" href="/ru/scenarios/agent/openclaw/config-cli">
    Настройка с помощью мастера
  </Card>

  <Card title="Нативная конфигурация Anthropic" icon="bot" href="/ru/scenarios/agent/openclaw/config-anthropic">
    Прямое подключение к Claude
  </Card>
</CardGroup>
