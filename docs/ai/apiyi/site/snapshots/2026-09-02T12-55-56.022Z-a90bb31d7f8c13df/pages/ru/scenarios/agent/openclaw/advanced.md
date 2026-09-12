> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Расширенные возможности и устранение неполадок

> Устранение неполадок OpenClaw, пользовательские навыки, функция памяти, синхронизация между устройствами и советы по безопасности

## Устранение неполадок

<AccordionGroup>
  <Accordion title="Не удается подключиться к Telegram">
    В некоторых регионах Telegram может требовать прокси. Настройте прокси в терминале и перезапустите шлюз:

    ```bash theme={null}
    export https_proxy=http://127.0.0.1:proxy-port
    export http_proxy=http://127.0.0.1:proxy-port
    openclaw gateway restart
    ```

    Или используйте веб-интерфейс напрямую (прокси не нужен).
  </Accordion>

  <Accordion title="Ошибка формата файла конфигурации">
    Запустите диагностическую команду для автоматического исправления:

    ```bash theme={null}
    openclaw doctor --fix
    ```
  </Accordion>

  <Accordion title="Не удалось подключиться к API">
    1. Проверьте, что API-ключ указан верно
    2. Убедитесь, что `baseUrl` установлено в `https://api.apiyi.com/v1`
    3. Проверьте соединение:

    ```bash theme={null}
    curl -H "Authorization: Bearer your-key" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="Как просмотреть логи выполнения">
    ```bash theme={null}
    openclaw logs --follow
    ```
  </Accordion>

  <Accordion title="Как обновить OpenClaw">
    ```bash theme={null}
    openclaw update
    ```
  </Accordion>

  <Accordion title="Как добавить новые каналы чата">
    ```bash theme={null}
    openclaw channels add --channel telegram
    ```
  </Accordion>
</AccordionGroup>

## Пользовательские навыки

OpenClaw поддерживает пользовательские навыки. Создайте их в каталоге `~/.openclaw/workspace/skills/`.

## Функция памяти

OpenClaw запоминает ваши разговоры и предпочтения. Используйте `/memory`, чтобы просматривать и управлять памятью.

## Синхронизация между несколькими устройствами

Запускайте OpenClaw на нескольких устройствах и используйте такие инструменты, как Tailscale, для удаленного доступа.

## Советы по безопасности

<Warning>
  * **Безопасность API Key**: Никогда не делитесь вашим файлом конфигурации с другими
  * **Контроль прав доступа**: OpenClaw может выполнять команды терминала — избегайте опасных операций
  * **Безопасность сети**: По умолчанию он слушает только localhost. Настройте надлежащие меры безопасности для удаленного доступа
</Warning>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="APIYI Console" icon="settings" href="https://api.apiyi.com">
    Управляйте API-ключами и просматривайте использование
  </Card>

  <Card title="Рекомендации по моделям" icon="chart-bar" href="/ru/api-capabilities/model-info">
    Просматривайте рекомендации по моделям для разных сценариев
  </Card>
</CardGroup>
