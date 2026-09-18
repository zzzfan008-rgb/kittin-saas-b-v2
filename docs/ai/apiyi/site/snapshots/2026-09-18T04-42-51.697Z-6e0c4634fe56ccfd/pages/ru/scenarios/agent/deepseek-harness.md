> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Каркас DeepSeek

> Плагинный каркас ИИ-агента с открытым исходным кодом от DeepSeek с поддержкой веб-интерфейса, безголового CLI и Python SDK

## Обзор

DeepSeek Harness (`dsh`) — это разрабатываемая с открытым исходным кодом оболочка AI-агента, созданная DeepSeek AI. Она использует архитектуру «всё является плагином», позволяющую компоновать модели, инструменты, файловые системы, терминалы, сессии и рабочие процессы в расширяемую среду выполнения агента.

С APIYI вы можете запускать DeepSeek Harness локально и использовать совместимый с OpenAI эндпоинт APIYI для настройки моделей, выполнения задач разработки и поддержки постоянных сессий.

<CardGroup cols={2}>
  <Card title="🧩 Архитектура на основе плагинов" icon="puzzle">
    Компонуйте модели, инструменты, сессии и рабочие процессы с помощью плагинов и при необходимости расширяйте агента.
  </Card>

  <Card title="🌐 Веб-интерфейс" icon="globe">
    Запускайте локальный веб-интерфейс одной командой и настраивайте модели, рабочие пространства и сессии в браузере.
  </Card>

  <Card title="⌨️ CLI без графического интерфейса" icon="terminal">
    Отправляйте разовые задачи из командной строки для скриптов автоматизации, пакетных заданий и рабочих процессов разработки.
  </Card>

  <Card title="💾 Постоянные сессии" icon="database">
    Сохраняйте сессии, вызовы инструментов и состояние рабочего пространства, чтобы продолжать выполнение задач и устранять неполадки при выполнении.
  </Card>
</CardGroup>

<Info>
  **Информация о проекте**: DeepSeek Harness распространяется с открытым исходным кодом по лицензии MIT. Репозиторий проекта находится по адресу `github.com/deepseek-ai/deepseek-harness`. В настоящее время проект находится на этапе предварительной версии для разработчиков, поэтому будущие выпуски могут содержать несовместимые изменения.
</Info>

## Установка и запуск

### Запуск веб-интерфейса с помощью npm

Установите Node.js, затем выполните:

```bash theme={null}
npx @deepseek-ai/dsh web
```

После запуска сервера откройте `http://127.0.0.1:3080`. При первом запуске настройте APIYI в разделе настроек модели веб-интерфейса.

### Запуск из исходного кода

Чтобы запустить исходный код репозитория или внести вклад в проект:

```bash theme={null}
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

### Использование безграфического CLI

После сборки из исходного кода отправьте разовую задачу с помощью:

```bash theme={null}
pnpm dsh --profile headless "Inspect the repository and explain the failing tests."
```

## Подключение APIYI

DeepSeek Harness поддерживает встроенный маршрут DeepSeek и маршруты нескольких провайдеров на основе `llm-pi-ai`. В текущей конфигурации используются провайдер `apiyi`, протокол `openai-responses` и эндпоинт `https://api.apiyi.com/v1`. Модель по умолчанию — `deepseek-v4-pro-0813`.

Файл конфигурации — `$DSH_HOME/settings.yaml`. Если `DSH_HOME` не задан, расположением по умолчанию в Windows обычно является `C:\Users\Administrator\.dsh\settings.yaml`.

### Вариант 1: настройка через веб-интерфейс (рекомендуется)

<Steps>
  <Step title="Подготовьте token APIYI">
    Создайте token в консоли APIYI. Никогда не сохраняйте настоящий token в файле проекта, истории командной строки или общедоступном журнале.
  </Step>

  <Step title="Откройте настройки моделей">
    Запустите веб-интерфейс, откройте **Настройки → Модели** и выберите **Добавить пользовательского провайдера**.
  </Step>

  <Step title="Введите сведения о провайдере">
    Используйте следующие значения в качестве отправной точки:

    | Поле                     | Рекомендуемое значение     |
    | ------------------------ | -------------------------- |
    | ID провайдера            | `apiyi`                    |
    | Отображаемое имя         | `apiyi`                    |
    | Базовый URL              | `https://api.apiyi.com/v1` |
    | Протокол API             | `openai-responses`         |
    | Ссылка на учетные данные | `APIYI_API_KEY`            |
    | Модель                   | `deepseek-v4-pro-0813`     |

    В текущей конфигурации в качестве модели по умолчанию используется `deepseek-v4-pro-0813`. В файле конфигурации также сохранены другие модели APIYI; при переключении моделей используйте актуальный список моделей APIYI.
  </Step>

  <Step title="Сохраните настройки и выберите модель">
    Сохраните провайдера, выберите добавленную модель в селекторе моделей и начните новый сеанс, чтобы проверить подключение.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-config.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=283844b8bb9f276b3236661422af5be3" alt="Настройка пользовательского провайдера APIYI в DeepSeek Harness" width="655" height="526" data-path="images/deepseek-harness-model-config.png" />

<Tip>
  При сохранении ключа через веб-интерфейс DeepSeek Harness сохраняет его в локальном хранилище учетных данных и возвращает странице только скрытое описание. Изменения конфигурации вступают в силу при следующем запросе и обычно не требуют перезапуска веб-интерфейса.
</Tip>

### Вариант 2: настройка settings.yaml

Для настройки на основе файла объявите провайдера APIYI в `$DSH_HOME/settings.yaml` и укажите token через переменную окружения:

```yaml theme={null}
llm-pi-ai:
  providers:
    apiyi:
      displayName: apiyi
      apiKeyEnv: APIYI_API_KEY
      api: openai-responses
      baseURL: https://api.apiyi.com/v1
      models:
        - id: deepseek-v4-pro-0813
```

macOS или Linux:

```bash theme={null}
export APIYI_API_KEY=YOUR_API_KEY
```

Windows PowerShell:

```powershell theme={null}
$env:APIYI_API_KEY = "YOUR_API_KEY"
```

`apiKeyEnv` — это только ссылка на учетные данные. Не помещайте настоящий token в `settings.yaml`. Чтобы добавить другую модель, добавьте ее ID в список `models`.

## Распространённые сценарии использования

### Локальный веб-агент

Используйте веб-интерфейс в браузере для анализа кода, организации файлов, отладки тестов и обслуживания проектов. Выберите рабочую область для сеанса, затем опишите цель и ограничения на естественном языке.

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-chat.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=8e9ed8c8428b7a3fd8618db5c6ec5bbb" alt="Локальный интерфейс чата веб-агента DeepSeek Harness" width="934" height="758" data-path="images/deepseek-harness-model-chat.png" />

### Автоматизированные задачи

Профиль без интерфейса выполняет одну задачу и выводит итоговый ответ, что делает его подходящим для локальных скриптов и рабочих процессов автоматизации:

```bash theme={null}
pnpm dsh --profile headless "Review the changed files and summarize possible regressions."
```

### Python SDK

DeepSeek Harness предоставляет `deepseek-harness-sdk`, который может запускать среду выполнения и вызывать агент из Python. Обратите внимание, что встроенная среда выполнения Python по умолчанию использует `deepseek-official`; она автоматически не наследует маршрут `apiyi`, используемый текущей конфигурацией веб-интерфейса/профиля без интерфейса.

```bash theme={null}
python -m pip install deepseek-harness-sdk
```

```python theme={null}
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness(
    provider="apiyi",
    model="deepseek-v4-pro-0813",
    cwd="/absolute/path/to/workspace",
    session_root="/absolute/path/to/sessions",
    cordis="/absolute/path/to/apiyi.cordis.yml",
) as harness:
    result = harness.run(
        "Inspect the repository and summarize the failing tests.",
        session_id="example-001",
    )

print(result.final_response)
```

Чтобы использовать указанный выше маршрут `apiyi`, пользовательская композиция Cordis должна подключить `@deepseek-ai/dsh-llm-pi-ai` и предоставить `apiKeyEnv: APIYI_API_KEY`, `api: openai-responses` и список моделей APIYI через `settings.yaml` или конфигурацию композиции.

В руководстве по Python SDK для встроенной композиции постоянного терминала указаны Linux x64, Linux arm64 и macOS 14 или более поздней версии на arm64. Эта композиция не поддерживает агентов Windows. Пользователям Windows рекомендуется использовать веб-интерфейс или CLI.

## Выбор модели

Модели APIYI постоянно обновляются. Перед выбором модели для рабочего использования ознакомьтесь с последним списком моделей, их возможностями и рекомендациями по использованию:

<Card title="Просмотреть последние рекомендации по моделям" icon="star" href="/ru/api-capabilities/model-info">
  Ознакомьтесь с актуальными рекомендациями по моделям, сравнением возможностей и руководством по использованию. Используйте идентификаторы моделей, доступные в текущем списке моделей APIYI.
</Card>

## Лучшие практики

* Используйте отдельный идентификатор сеанса для каждой независимой задачи. Повторно используйте существующий идентификатор только тогда, когда необходимо продолжить тот же разговор и сохранить состояние оболочки.
* В примере Python SDK используется доступное для записи рабочее пространство и композиция `danger-full-access`. Запускайте его в одноразовой рабочей копии или контейнере.
* Не размещайте ключи API в `cordis.yml`, `settings.yaml`, исходном коде или журналах коммитов. Предпочтительно использовать хранилище учетных данных веб-интерфейса или ссылку на переменную окружения.
* DeepSeek Harness находится на этапе предварительной версии для разработчиков. Перед обновлением убедитесь, что конфигурация вашего плагина и маршруты моделей остаются совместимыми.

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Какой провайдер и модель используются в текущей конфигурации?">
    В текущей конфигурации используются провайдер `apiyi`, протокол `openai-responses`, базовый URL `https://api.apiyi.com/v1` и `deepseek-v4-pro-0813` в качестве модели по умолчанию.
  </Accordion>

  <Accordion title="Какой базовый URL и протокол следует использовать для APIYI?">
    Используйте `https://api.apiyi.com/v1` в качестве базового URL и `openai-responses` в качестве протокола в соответствии с текущей конфигурацией. Не изменяйте протокол, не подтвердив совместимость эндпоинта.
  </Accordion>

  <Accordion title="Почему моя модель не отображается в списке выбора моделей?">
    Убедитесь, что идентификатор провайдера содержит непустое значение в нижнем регистре, идентификатор модели указан правильно, а сохранённая конфигурация относится к провайдеру `llm-pi-ai`. Текущая модель по умолчанию — `deepseek-v4-pro-0813`; пользовательскую модель необходимо добавить в список `models`, прежде чем её можно будет выбрать.
  </Accordion>

  <Accordion title="Как исправить ошибку MISSING_CREDENTIAL?">
    В веб-интерфейсе перейдите в **Настройки → Модели** и сохраните учетные данные для провайдера. При использовании `settings.yaml` убедитесь, что задано `APIYI_API_KEY` и что `apiKeyEnv` указывает на эту переменную окружения.
  </Accordion>

  <Accordion title="Что делать, если обнаружение моделей возвращает ошибку 401?">
    Сначала проверьте token APIYI и базовый URL. DeepSeek Harness использует `GET /models` для обнаружения моделей у пользовательских провайдеров, совместимых с OpenAI. Если эндпоинт не предоставляет этот маршрут, введите идентификатор модели вручную.
  </Accordion>

  <Accordion title="Можно ли запускать Python SDK в Windows?">
    Встроенная конфигурация persistent-terminal не поддерживает агентов Windows. Пользователи Windows могут использовать веб-интерфейс или CLI; для Python SDK соблюдайте требования к платформе, указанные в документации проекта.
  </Accordion>

  <Accordion title="Что делать, если обновление нарушило конфигурацию?">
    Проект находится на стадии предварительной версии для разработчиков, поэтому обновления могут содержать критические изменения. Повторно проверьте конфигурацию провайдера, идентификатор модели и состав плагинов по последней документации проекта.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Краткое руководство APIYI" icon="book" href="/ru/getting-started">
    Получите ключ API и узнайте о базовых URL и основном использовании API.
  </Card>

  <Card title="Рекомендации по моделям APIYI" icon="star" href="/ru/api-capabilities/model-info">
    Ознакомьтесь с актуальными моделями, их возможностями и рекомендациями по использованию.
  </Card>

  <Card title="Репозиторий DeepSeek Harness" icon="github">
    `github.com/deepseek-ai/deepseek-harness`
  </Card>

  <Card title="Настройка провайдера DeepSeek Harness" icon="settings">
    Ознакомьтесь с документацией проекта по настройке провайдера, учётных данных и модели.
  </Card>
</CardGroup>

## Получить помощь

<CardGroup cols={2}>
  <Card title="Поддержка в корпоративном WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="QR-код поддержки в корпоративном WeChat" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Отсканируйте код, чтобы добавить поддержку, или [свяжитесь с поддержкой напрямую](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Конфигурация APIYI, интеграция DeepSeek Harness и рекомендации по использованию
  </Card>

  <Card title="Поддержка по электронной почте" icon="mail">
    **Поддержка**: [support@apiyi.com](mailto:support@apiyi.com)

    **Деловые запросы**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  При обращении в поддержку укажите провайдера, идентификатор модели, базовый URL, протокол API, сообщение об ошибке, версию Node.js, режим использования и соответствующие снимки экрана, чтобы проблему можно было быстрее диагностировать.
</Tip>
