> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Интеграция Updream Desktop с APIYI

> Используйте плагин hellojint/updream-openai-compatible-plugin для пересылки задач генерации изображений из Updream Desktop v0.2.0 на OpenAI-совместимый эндпоинт изображений APIYI. Подходит для сценариев, требующих локального выполнения или локального хранения учетных данных.

## Обзор

Плагин `hellojint/updream-openai-compatible-plugin` (GitHub) — это плагин с открытым исходным кодом для генерации изображений в **Updream Desktop v0.2.0**, поддерживающий протокол **Universal OpenAI-compatible Image**. После установки десктопный клиент перенаправляет запросы на генерацию изображений к любому вышестоящему стороннему API, соответствующему интерфейсу OpenAI Images — **APIYI удовлетворяет этому требованию на пути API**.

<Info>
  **Информация о проекте**

  * Исходный код: `github.com/hellojint/updream-openai-compatible-plugin` (GitHub)
  * Лицензия: MIT
  * Автор: hellojint
  * Имя пакета плагина: `updream-openai-compatible-v1.updplugin`
  * Основано на: примере провайдера изображений OpenAI из официального руководства по разработке плагинов Updream
</Info>

<Tip>
  **Два пути интеграции**

  Если вам не требуется «локальное выполнение задач / локальное хранение учетных данных», **отдайте предпочтение веб-клиенту Updream**:
  [Интеграция Updream с APIYI (веб)](/ru/scenarios/agent/updream). Веб-клиент подключается к APIYI через навык **«External Model Connector» + OpenAI-совместимый** протокол, при этом **установка плагина не требуется** — это рекомендуемый вариант для большинства пользователей.

  Описанный здесь путь с использованием десктопного клиента и плагина предназначен для пользователей, которым необходимо хранить API-ключ локально, выполнять пакетные задачи генерации изображений или которые сталкиваются с ограничениями протокола OpenAI Images в веб-клиенте.
</Tip>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Универсальный OpenAI-совместимый протокол" icon="workflow">
    Работает с любым апстримом, который предоставляет `/v1/images/generations` и выполняет аутентификацию с помощью `Bearer`. APIYI удовлетворяет этим требованиям.
  </Card>

  <Card title="Локальное выполнение на десктопе" icon="monitor">
    Задачи выполняются локально в Updream Desktop v0.2.0 и возвращают результаты на веб-холст.
  </Card>

  <Card title="API-ключ хранится локально" icon="key">
    Ключ хранится в системной связке ключей Updream и считывается во время выполнения. Сам плагин поставляется без каких-либо учетных данных.
  </Card>

  <Card title="Несколько провайдеров бок о бок" icon="layers">
    Десктопный клиент может содержать несколько провайдеров (например, `openai`, `apiyi-compatible`) и переключаться между ними.
  </Card>

  <Card title="Автоматическое сопоставление размеров" icon="ratio">
    Четкость и соотношение сторон на десктопе автоматически сопоставляются с параметром апстрима `size`. Жестко заданный `extra.size` переопределяет это сопоставление.
  </Card>

  <Card title="Несколько форматов ответа" icon="image">
    Совместимо с `data[].url`, `data[].b64_json`, `url` верхнего уровня и т. д. MIME определяется по Base64.
  </Card>
</CardGroup>

## Примеры моделей APIYI

Следующие ID можно указать в поле **ID эндпоинта**. Они приведены исключительно для примера:

| Название модели | ID модели | Сценарий использования |
| - | - | - |
| GPT Image (пример) | `gpt-image-1` | Высококачественная генерация изображений |
| GPT Image v2 (пример) | `gpt-image-2` | Последнее поколение (доступность зависит от актуального списка моделей APIYI) |
| Nano Banana (пример) | `nano-banana` | Семейство моделей Google для изображений |
| Gemini Flash Image (пример со скриншота автора) | `gemini-3.1-flash-image` | Выше скорость и ниже стоимость |

> Фактически поддерживаемые модели перечислены на странице [рекомендаций по моделям APIYI](/ru/api-capabilities/model-info). В этой таблице лишь показан формат поля, который принимает плагин.

## Поля конфигурации плагина

После загрузки плагина в десктопный клиент в форме **Add API-Key** доступны следующие поля:

| Поле | Обязательно | Описание |
| - | - | - |
| **Configuration name** | Да | Пользовательское название, например `apiyi-compatible`, используемое для различения провайдеров в списке |
| **Protocol type** | Да | Выберите **Universal OpenAI-compatible Image** |
| **Generation type** | Да | Выберите `image` |
| **API-Key** | Да | Ваш ключ платформы APIYI. Сохраняется в связке ключей Updream и считывается во время выполнения |
| **API base URL** | Да | Базовый URL вышестоящего сервиса. Для APIYI используйте `https://api.apiyi.com/v1` |
| **Model** | Да | По умолчанию (совпадает с Endpoint ID) либо выберите значение явно |
| **Endpoint ID** | Нет | Если задано, **переопределяет** поле Model в качестве окончательного значения `model`. Обычно представляет собой строку идентификатора модели |
| **Use proxy** | Нет | При необходимости направлять запросы к этому провайдеру через глобальный прокси |

Ключи API конфиденциальны. **Не вставляйте реальные ключи в скриншоты, документацию, issues, файлы README или чаты.** В [консоли APIYI](https://www.apiyi.com) создайте отдельный ключ с лимитом использования для десктопного клиента и отзовите его после завершения работы.

## Установка и настройка (пошаговое руководство)

### Шаг 0: Обзор десктопного клиента

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-task-overview.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=b2431a85db7a53efd727fad1b51cf896" alt="Обзор задач Updream Desktop (v0.2.0)" width="1200" height="811" data-path="images/updream-desktop-task-overview.png" />

Стандартный интерфейс версии v0.2.0: список задач «Локальное выполнение» слева, верхняя панель с кнопками **Синхронизация / Добавить ключ / Импорт плагина / Управление плагинами** и метка версии `v0.2.0` в правом нижнем углу.

### Шаг 1: Импорт плагина

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-import-plugin.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=8f63d49aa37892c70145edcf2bb03300" alt="Пункт «Импорт плагина» на верхней панели десктопного клиента" width="1194" height="70" data-path="images/updream-desktop-import-plugin.png" />

Нажмите кнопку **Импорт плагина** в верхней части экрана. В окне выбора файла выберите скачанный `updream-openai-compatible-v1.updplugin` и при появлении запроса **подтвердите установку**. Автор рекомендует ознакомиться с `plugin.py` перед подтверждением.

### Шаг 2: Проверка установки

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-plugin-installed.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=d0a9cd5d819da625a4cb95a13fb1309e" alt="Состояние установленного плагина" width="609" height="169" data-path="images/updream-desktop-plugin-installed.png" />

На странице **Управление плагинами** появится **Универсальный OpenAI-совместимый модуль изображений** (universal-openai-compatible-image · v1.0.0 · image). С этого момента десктопный клиент готов к обращению к любому вышестоящему сервису, совместимому с генерацией изображений OpenAI.

### Шаг 3: Добавление ключа

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-add-key.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=720b99501217ca1651ba3676211c0b94" alt="Пункт «Добавить ключ» на верхней панели десктопного клиента" width="1193" height="144" data-path="images/updream-desktop-add-key.png" />

Нажмите кнопку **Добавить ключ**, чтобы открыть форму настройки.

### Шаг 4: Настройка APIYI

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-config-apiyi.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=3c52f8755f39c1d6330ec97772e4484a" alt="Пример настройки APIYI" width="514" height="668" data-path="images/updream-desktop-config-apiyi.png" />

Заполните форму в соответствии с примером на скриншоте:

| Поле | Пример |
| - | - |
| Имя конфигурации | `apiyi-compatible` |
| Тип протокола | Универсальный OpenAI-совместимый модуль изображений |
| Тип генерации | `image` |
| API-ключ | Ваш ключ платформы APIYI (считывается во время выполнения, не сохраняется в коде) |
| Базовый URL API | `https://api.apiyi.com/v1` |
| Модель | По умолчанию (совпадает с ID эндпоинта) |
| ID эндпоинта | `gemini-3.1-flash-image` (из документации по моделям APIYI) |

Нажмите **Проверить подключение** и **Проверить генерацию**. Когда появится сообщение **Подключение успешно! API доступен**, сохраните конфигурацию.

### Шаг 5: Убедитесь, что провайдер включен

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-provider-list.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=1357b08d7da971ce18923f71e62e1d80" alt="Список провайдеров" width="807" height="407" data-path="images/updream-desktop-provider-list.png" />

В списке провайдеров на странице **Конфигурация** появится ваша новая запись `apiyi-compatible`. Ее идентификатор провайдера — `plugin:universal-openai-compatible-image`, а статус — **Включено**. Вы можете переключаться между провайдерами или отключать их в любое время.

<Tip>
  После завершения настройки десктопного клиента снова откройте **веб-клиент** Updream. В выпадающем списке провайдеров генерации изображений на узле холста выберите `apiyi-compatible`, чтобы отправлять задачи из веб-клиента для их выполнения десктопным клиентом.
</Tip>

## Использование: цикл Web → Desktop → Web

После выполнения пяти вышеуказанных шагов запуск генерации изображений из **веб-клиента Updream** задействует провайдер `apiyi-compatible` на стороне десктопного клиента и передаст его в `https://api.apiyi.com/v1/images/generations`. Результат возвращается в узел веб-холста.

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-web-recv-from-desktop.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=383de779592d3d3a270db2ca330bd158" alt="Веб-клиент получает результат генерации от десктопного клиента" width="891" height="611" data-path="images/updream-web-recv-from-desktop.png" />

На скриншоте панель под холстом показывает: Генерация изображений + `apiyi-compatible` (позиция стрелки) + `16:9 / 2K / ×1`. Это наглядный результат задачи, которая была запущена в веб-клиенте Updream, выполнена в десктопном клиенте и возвращена на веб-холст.

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="В десктопном клиенте отсутствует кнопка «Импорт плагина»?">
    Убедитесь, что версия десктопного клиента — **≥ v0.2.0**. В более ранних версиях поддержка плагинов отсутствует, и вам необходимо сначала обновить Updream Desktop.
  </Accordion>

  <Accordion title="После импорта плагина в раскрывающемся списке протоколов не появляется «Универсальное OpenAI-совместимое изображение»?">
    1. Убедитесь, что архив `.updplugin` содержит `plugin.py` непосредственно в корне, в соответствии с `manifest.entry`
    2. Перезапустите десктопный клиент
    3. На странице **Управление плагинами** убедитесь, что статус плагина — не **Отключено**
  </Accordion>

  <Accordion title="Проверка подключения проходит успешно, но генерация завершается ошибкой?">
    1. Проверьте правильность написания **ID эндпоинта** и его наличие в актуальном списке моделей APIYI
    2. Убедитесь, что баланса вашего аккаунта достаточно (см. [Почему аккаунт выдает ошибку даже при наличии баланса?](/ru/faq/balance-insufficient))
    3. Проверьте точный код ошибки на странице **Локальное выполнение** десктопного клиента
  </Accordion>

  <Accordion title="Почему десктопный клиент работает, а веб-клиент не может использовать того же провайдера?">
    Веб-клиент не работает через этот плагин. Используйте навык **Коннектор внешних моделей** веб-клиента с конфигурацией OpenAI-совместимого протокола или см. [Интеграция Updream с APIYI (веб)](/ru/scenarios/agent/updream).
  </Accordion>

  <Accordion title="Как переупаковать плагин?">
    Увеличьте версию в `manifest.json.version`, затем выполните переупаковку:

    ```bash theme={null}
    zip -r updream-openai-compatible-v1.updplugin plugin.py manifest.json README.md
    ```

    ZIP-архив должен содержать `plugin.py` непосредственно в корне.
  </Accordion>

  <Accordion title="Попадет ли API-ключ в код или логи плагина?">
    Нет. Плагин **поставляется без учетных данных**. Ключ хранится в связке ключей Updream и считывается во время выполнения через `cfg.get('api_key')`. Не вставляйте реальные ключи в `plugin.py`, README, тикеты или чат.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Интеграция Updream с APIYI (веб-версия, рекомендуется)" icon="globe" href="/ru/scenarios/agent/updream">
    Веб-клиент подключается к APIYI с помощью навыка **External Model Connector** — плагин не требуется
  </Card>

  <Card title="hellojint/updream-openai-compatible-plugin" icon="github">
    Открытый репозиторий, на котором основан данный документ (лицензия MIT): `github.com/hellojint/updream-openai-compatible-plugin`
  </Card>

  <Card title="Рекомендации моделей APIYI" icon="star" href="/ru/api-capabilities/model-info">
    Ознакомьтесь с моделями изображений и ценами, поддерживаемыми в APIYI в настоящее время
  </Card>

  <Card title="Управление API-ключами APIYI" icon="key" href="/ru/faq/token-management">
    Рекомендации по созданию API-ключей и управлению ими
  </Card>

  <Card title="Консоль APIYI" icon="settings" href="https://www.apiyi.com">
    Создавайте выделенные ключи, отслеживайте использование и устанавливайте лимиты баланса
  </Card>

  <Card title="Интеграция и использование APIYI" icon="book" href="/ru/getting-started">
    Обзор интеграции по API и OpenAI-совместимого протокола
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.