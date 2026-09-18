> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI - Корпоративный хаб API моделей ИИ

> Профессиональный и стабильный сервис агрегации API ИИ, работает более 2 лет, 150K ежемесячных посетителей, долгосрочно надежный сервис

<Info>
  **Пользователь из Китая?** [Переключиться на китайскую версию](/ru)
</Info>

**APIYI** — это профессиональный и стабильный шлюз API моделей ИИ корпоративного уровня, совместимый с единым стандартом API OpenAI и поддерживающий собственные форматы API каждого поставщика (Claude, Gemini и другие), всего более 400 популярных моделей ИИ. С помощью одного token вы получаете удобный доступ к OpenAI, Claude, Gemini, DeepSeek, Qwen, Kimi, GLM, Minimax и всем основным большим языковым моделям.

## 🏢 Сведения о компании

* Операционная компания: APIYI, LLC (Соединенные Штаты)
* Официальные партнеры: Google AI Studio, Microsoft Azure, Amazon AWS (законные источники квоты, можно использовать без опасений)
* Гарантия сервиса:
  * Стабильность: обеспечивает высокую параллельную работу и стабильные услуги для массовых моделей вроде OpenAI, Claude, Google Gemini
  * Надежность:
    * Многие известные приложения уже стабильно интегрированы в production-средах (см. раздел «Сценарии использования»).
    * Сотрудничество с известными университетами, больницами и другими учреждениями, обслуживание известных предприятий.
    * Отечественные юридические лица могут проводить корпоративные платежи, выставлять счета и помогать с перечнями закупок для беспроблемного возмещения расходов.

## 🛡️ Устали от сомнительных перепродавцов API?

<Info>
  Рынок перепродаж API — это неоднозначная среда: тайная подмена моделей, ухудшение качества и исчезающие операторы встречаются слишком часто. APIYI не опирается на устные обещания; мы предоставляем проверяемые доказательства.
</Info>

<CardGroup cols={3}>
  <Card title="Более 2 лет работы" icon="calendar-check" href="/ru/faq/enterprise-trust">
    150K ежемесячных посетителей, долгосрочная стабильная работа — не новичок-однодневка
  </Card>

  <Card title="Возврат без вопросов в течение 30 дней" icon="rotate-ccw" href="/ru/faq/refund-policy">
    Неиспользованный баланс возвращается на исходный способ оплаты в течение 30 дней, без комиссии через WeChat/Alipay
  </Card>

  <Card title="Чистый официальный релей · Верность модели" icon="shield-check" href="/ru/faq/enterprise-trust">
    Без перенаправления, без деградации, без подмены модели — проверьте верность сами
  </Card>

  <Card title="Практическая гарантия SLA" icon="file-check" href="/ru/faq/sla-guarantee">
    Компенсация за аномалии тарификации, повторная выдача кредита при сбоях, договорной SLA для предприятий
  </Card>

  <Card title="Безопасность данных" icon="lock" href="/ru/faq/data-security">
    Прозрачный прокси, содержимое разговоров не сохраняется, ведется минимальное логирование
  </Card>

  <Card title="Корпоративная оплата · Простое возмещение" icon="receipt" href="/ru/faq/university-reimbursement">
    Поддерживаются счета и корпоративные переводы — удобно для возмещения в университетах, больницах и предприятиях
  </Card>
</CardGroup>

## 🤖 Три способа поручить ИИ интеграцию за вас

Не нужно читать документацию и вручную заполнять конфигурацию. Выберите любой доступный вам ИИ, скопируйте ему соответствующий промпт — всё остальное он сделает сам.

<Tabs>
  <Tab title="Навыки · чат-агенты" icon="sparkles">
    **Вызывайте APIYI на естественном языке из чат-агента, например OpenClaw.** Скопируйте промпт агенту: он установит навык, самостоятельно проверит ключ и проведёт вас через настройку.

    <Prompt description="Скопируйте в OpenClaw, Claude Code, Cursor или любого агента с поддержкой навыков" icon="bot" actions={["copy"]}>
      Установите навык APIYI с [https://docs.apiyi.com](https://docs.apiyi.com): сначала попробуйте `npx skills add https://docs.apiyi.com`;
      если вы используете OpenClaw, вместо этого установите `git:apiyi-com/skills`; в противном случае просто прочитайте [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md).
      Затем самостоятельно проверьте ключ (scripts/apiyi.py --check в навыке или npx apiyi\@latest check).
      Если ключ отсутствует, помогите мне скопировать его с [https://api.apiyi.com/token](https://api.apiyi.com/token) и поместить в APIYI\_API\_KEY. Никогда не встраивайте его непосредственно в код.
      Когда проверка сообщит о готовности, отправьте «Hello» с помощью gpt-5.4-mini и покажите мне ответ.
    </Prompt>

    Исходный код навыка `github.com/apiyi-com/skills` · маршруты установки и настройка ключа в [комплекте для разработчиков ИИ](/ru/developer-kit#skills)
  </Tab>

  <Tab title="CLI · терминал" icon="terminal">
    **Выполните первый вызов из терминала, не написав ни одной строки кода.** Для `npx apiyi@latest check` не требуется установка: он проверяет ключ, измеряет задержку узла, выводит список моделей, отправляет сообщения и генерирует изображения.

    <Prompt description="Скопируйте в любого агента, способного выполнять команды терминала, или выполните эти строки самостоятельно" icon="terminal" actions={["copy"]}>
      Помогите мне установить и запустить CLI APIYI: [https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
      Требования: Node 18+; выполните `npx apiyi@latest check` — устанавливать ничего не нужно;
      помогите мне настроить ключ API (`npx apiyi@latest auth set-key` или переменную окружения APIYI\_API\_KEY), скопированный с [https://api.apiyi.com/token](https://api.apiyi.com/token);
      наконец, выполните `npx apiyi@latest models --grep gpt-5` и `npx apiyi@latest chat "Hello" -m gpt-5.4-mini` и вставьте вывод.
    </Prompt>

    Исходный код `github.com/apiyi-com/cli` · пакет npm `apiyi` · полная таблица команд в [комплекте для разработчиков ИИ](/ru/developer-kit#cli)
  </Tab>

  <Tab title="Комплект для разработчиков ИИ · агенты для программирования" icon="code">
    **Позвольте Cursor / Claude Code / Codex прочитать контракт до написания кода.** Файл skill.md — это свод правил, llms.txt — индекс, а model-registry.json — единственный источник достоверных данных о моделях. Сначала прочитайте и объясните, затем внесите изменения. Не придумывайте эндпоинты.

    <Prompt description="Скопируйте в Cursor, Claude Code, Codex или любого другого агента для программирования" icon="code" actions={["copy"]}>
      Сначала полностью прочитайте [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) и [https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt).
      Вы должны соблюдать правила интеграции APIYI: не придумывайте эндпоинты, имена параметров, значения перечислений или структуры ответов.
      Используйте [https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) как единственный источник достоверных данных об идентификаторах моделей (с версией через точку, с учётом регистра, например gpt-5.4-mini).
      Выбирайте базовый URL в зависимости от SDK: для OpenAI SDK — [https://api.apiyi.com/v1](https://api.apiyi.com/v1); для Anthropic и Google GenAI SDK — [https://api.apiyi.com](https://api.apiyi.com) (Gemini также задаёт api\_version равным v1beta).
      Читайте ключ только из переменной окружения APIYI\_API\_KEY. После чтения сначала объясните процесс интеграции. Пока не редактируйте код.
    </Prompt>

    Содержимое комплекта и назначение каждого файла: [комплект для разработчиков ИИ](/ru/developer-kit)
  </Tab>
</Tabs>

## 🌟 Избранные модели

<CardGroup cols={3}>
  <Card title="Nano Banana Pro/2 Серия" icon="image" href="/ru/api-capabilities/nano-banana-pricing">
    **🎨 Генерация изображений**

    Лучшее доступное качество, 4K всего за

    **\$0.09** /image

    🎯 Всего за 30.3% от официальной цены
  </Card>

  <Card title="Claude официальный релей" icon="sparkles" href="/ru/api-capabilities/claude">
    **🤖 Чат и кодинг**

    Чистый официальный релей через AWS + официальные двойные каналы, высокий процент попаданий в кэш

    ⚡ \~80% от официальной цены
  </Card>

  <Card title="GPT-image-2 Полная серия" icon="images" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    **🖼️ Генерация изображений**

    Официальный релей + reverse (-all/-vip) с полным покрытием

    🎯 Выберите то, что подходит вашим задачам
  </Card>

  <Card title="Gemini Полная мультимодальная серия" icon="gem" href="/ru/api-capabilities/model-info">
    **🔥 Мультимодальность**

    Полная линейка для текста, изображений и видео

    🏆 Gemini 3.1 Pro лидирует по производительности
  </Card>

  <Card title="OpenAI Полная мультимодальная серия" icon="bot" href="/ru/api-capabilities/model-info">
    **🚀 Мультимодальность**

    Серии GPT / o, изображения, видео и аудио

    ✅ Полная линейка, стабильная поддержка
  </Card>
</CardGroup>

## 📖 Основы продукта

<CardGroup cols={2}>
  <Card title="Быстрый старт" icon="rocket" href="/ru/getting-started">
    Завершите интеграцию за три шага и сразу начните использовать модели ИИ
  </Card>

  <Card title="Руководство по API" icon="book" href="/ru/api-manual">
    Полная документация по API и руководство для разработчиков
  </Card>

  <Card title="Комплект разработчика ИИ" icon="bot" href="/ru/developer-kit">
    🤖 Навык, CLI, контракт и реестр моделей для агентов программирования
  </Card>

  <Card title="Журнал изменений" icon="megaphone" href="/en/changelog">
    🔥 Последние запуски моделей, изменения цен и важные обновления
  </Card>

  <Card title="Цены" icon="tag" href="/ru/pricing">
    Просмотрите подробные цены и специальные предложения для всех моделей
  </Card>
</CardGroup>

## 🔧 Основные API

<CardGroup cols={2}>
  <Card title="API завершения чата" icon="message-circle" href="/ru/api-manual">
    API завершения чата - Создавайте многотуровые беседы и генерируйте текст
  </Card>

  <Card title="API моделей" icon="list" href="/ru/api-capabilities/model-info">
    API моделей - Получайте информацию обо всех доступных моделях
  </Card>

  <Card title="API генерации изображений" icon="image" href="/ru/api-capabilities/image-video-models">
    API изображений - Nano Banana Pro, gpt-image-2 и другие
  </Card>

  <Card title="API эмбеддингов" icon="vector-square" href="/ru/api-manual#embeddings-api">
    API эмбеддингов - Векторизация текста и семантический поиск
  </Card>
</CardGroup>

## ⚡ Возможности API

### 🎬 API генерации видео

<CardGroup cols={2}>
  <Card title="Генерация видео Seedance 2.0" icon="film" href="/ru/api-capabilities/seedance2/overview">
    🔥 Новейшая флагманская модель ByteDance: уровни standard / fast / mini, синхронизированный звук по умолчанию, высокая поддержка параллельных запросов без постановки в очередь
  </Card>

  <Card title="Генерация видео Wan2.7" icon="videotape" href="/ru/api-capabilities/wan/overview">
    Официальный канал Alibaba: текст / изображение / преобразование референса в видео, а также редактирование видео, от \$0.42 за видео
  </Card>

  <Card title="Генерация видео VEO 3.1" icon="clapperboard" href="/ru/api-capabilities/veo-3-1-official/overview">
    Официальный канал Google, тарификация за каждую генерацию от \$0.3 за видео, 720p / 1080p / 4K
  </Card>

  <Card title="Видео с единообразными персонажами" icon="images" href="/ru/api-capabilities/seedance2/asset-library">
    Библиотека ресурсов Seedance: загрузите изображения один раз и используйте их как референсы для создания видео с единообразными персонажами
  </Card>

  <Card title="API понимания видео" icon="eye" href="/ru/api-capabilities/video-understanding">
    Интеллектуальный анализ видео, распознавание сцен, понимание содержимого
  </Card>
</CardGroup>

### 🎨 API генерации изображений

<CardGroup cols={2}>
  <Card title="Nano Banana Pro" icon="banana" href="/ru/api-capabilities/nano-banana-image/overview">
    🔥 Наша самая мощная модель, 4K HD, лучшее в отрасли отображение текста, \$0.09 за изображение
  </Card>

  <Card title="Nano Banana 2" icon="banana" href="/ru/api-capabilities/nano-banana-2-image/overview">
    🔥 Тарификация на основе использования, новые соотношения сторон длинных изображений 1:8 / 8:1, \$0.055 за изображение (от \$0.025 при тарификации на основе использования)
  </Card>

  <Card title="Nano Banana Lite" icon="zap" href="/ru/api-capabilities/nano-banana-lite-image/overview">
    🆕 Самая быстрая и доступная модель Google, около 4 с на изображение, \$0.025 за изображение
  </Card>

  <Card title="Серия gpt-image-2.5 / 2" icon="images" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Официальный релей OpenAI: 2.5-flare / 2.5-sunburst / 2 с нативным 4K и обратным -all/-vip по \$0.03 за изображение — выберите подходящий вариант
  </Card>

  <Card title="Seedream 5.0/4.5" icon="sparkles" href="/ru/api-capabilities/seedream-image/overview">
    Официальное партнёрство с BytePlus, высокая скорость и вывод через URL, от \$0.035 за изображение
  </Card>

  <Card title="Серия Flux 2" icon="wand-sparkles" href="/ru/api-capabilities/flux/overview">
    🆕 Уровни FLUX.2 max/pro/flex, от \$0.03 за генерацию
  </Card>
</CardGroup>

### 🔧 Базовые API

<CardGroup cols={2}>
  <Card title="Информация о модели" icon="database" href="/ru/api-capabilities/model-info">
    Просматривайте подробную информацию о более чем 400 поддерживаемых моделях ИИ
  </Card>

  <Card title="Интеграция с OpenAI SDK" icon="code" href="/ru/api-capabilities/openai/compatible">
    Легко интегрируйте APIYI с помощью официального SDK
  </Card>

  <Card title="API понимания изображений" icon="eye" href="/ru/api-capabilities/vision-understanding">
    Интеллектуальный анализ изображений, OCR, распознавание объектов, описание сцен
  </Card>

  <Card title="Нативный формат Claude" icon="messages-square" href="/ru/api-capabilities/claude">
    Нативный формат API Anthropic, полная поддержка функций
  </Card>

  <Card title="Нативный формат Gemini" icon="gem" href="/ru/api-capabilities/gemini/native">
    Нативный формат API Google, полная поддержка функций
  </Card>

  <Card title="API текстовых эмбеддингов" icon="vector-square" href="/ru/api-capabilities/text-embedding">
    Векторизация текста и семантический поиск
  </Card>
</CardGroup>

## 🎯 Сценарии использования

### 💬 Диалоговый AI

<CardGroup cols={2}>
  <Card title="Cherry Studio" icon="cherry" href="/ru/scenarios/chat/cherry-studio">
    Мощный AI-клиент для чата с переключением между несколькими моделями
  </Card>

  <Card title="Chatbox" icon="message-square" href="/ru/scenarios/chat/chatbox">
    Кроссплатформенное настольное AI-приложение для чата
  </Card>

  <Card title="Open WebUI" icon="globe" href="/ru/scenarios/chat/open-webui">
    Самостоятельно размещаемый веб-интерфейс для чата
  </Card>

  <Card title="ChatGPT Next Web" icon="app-window" href="/ru/scenarios/chat/chatgpt-next-web">
    Веб-версия ChatGPT, разворачиваемая в один клик
  </Card>
</CardGroup>

### 💻 Программирование и разработка

<CardGroup cols={2}>
  <Card title="Claude Code" icon="terminal" href="/ru/scenarios/programming/claude-code">
    🔥 Официальный AI-помощник Anthropic для программирования
  </Card>

  <Card title="Cursor" icon="mouse-pointer-click" href="/ru/scenarios/programming/cursor">
    Редактор кода на базе AI
  </Card>

  <Card title="Cline (VS Code)" icon="code" href="/ru/scenarios/programming/cline">
    AI-помощник для программирования в VS Code
  </Card>

  <Card title="Roo Code" icon="rocket" href="/ru/scenarios/programming/roo-code">
    Эффективный инструмент для генерации кода с помощью AI
  </Card>

  <Card title="Codex CLI" icon="square-terminal" href="/ru/scenarios/programming/codex-cli">
    AI-помощник для программирования в командной строке
  </Card>

  <Card title="Gemini CLI" icon="gem" href="/ru/scenarios/programming/gemini-cli">
    Инструмент командной строки Google Gemini
  </Card>
</CardGroup>

### 🔧 Инженерия

<CardGroup cols={2}>
  <Card title="LangChain" icon="link" href="/ru/scenarios/engineering/langchain">
    Фреймворк разработки для создания AI-приложений
  </Card>

  <Card title="Dify" icon="workflow" href="/ru/scenarios/engineering/dify">
    Визуальная платформа разработки AI-приложений
  </Card>
</CardGroup>

### 🌐 Перевод

<CardGroup cols={2}>
  <Card title="Bob Translator" icon="languages" href="/ru/scenarios/translation/bob">
    Профессиональный инструмент для перевода на macOS
  </Card>

  <Card title="Immersive Translate" icon="globe" href="/ru/scenarios/translation/immersive">
    Расширение браузера для двуязычного чтения
  </Card>
</CardGroup>

## 🚀 Почему стоит выбрать APIYI?

### Один интерфейс, множество моделей

Нет необходимости подавать заявки на отдельные аккаунты и управлять API keys для каждого сервиса ИИ. С APIYI вам нужны только:

* **Один аккаунт**: Управляйте всеми сервисами ИИ
* **Один API key**: Получайте доступ ко всем моделям
* **Один стандарт**: Совместимо с форматом OpenAI API

### 💡 Поддерживаемые модели

Мы поддерживаем более 400 ведущих в отрасли моделей ИИ:

#### Серия OpenAI

* Полная серия GPT-5.1 (последняя итерация, сбалансированы интеллектуальные возможности и скорость)
* GPT-5 / GPT-5 Mini / GPT-5 Nano
* o3 / o3 Pro / o4-mini (модели для рассуждения)
* Серия GPT-4.1 / GPT-4o
* Серия Codex (ориентированные на программирование)
* DALL·E 3 / GPT-Image-1

#### Серия Anthropic

* **Claude Opus 4.5** (🔥 Новейший флагман, SWE-bench 80.9%)
* Claude Sonnet 4.5 (модель для кодинга мирового уровня)
* Claude Haiku 4.5 (высокое соотношение цена/производительность)
* Claude 4 Sonnet / Claude 4 Opus

#### Серия Google

* **Gemini 3 Pro Preview** (🔥 №1 в мире по версии LMArena)
* **Nano Banana Pro** (🔥 генерация изображений 4K HD)
* Gemini 2.5 Pro (контекст 2M)
* Gemini 2.5 Flash (Быстрый отклик)

#### Серия xAI Grok

* **Grok 4.5** (🔥 Новейший флагман для кода и агентов)
* Серия Grok 4.3 / Grok 4.20 (контекст 1M)
* Grok Build 0.1 (Ориентирован на код)
* Grok 4.20 Multi-Agent (Совместная работа нескольких агентов)
* [Руководство по API](/ru/api-capabilities/grok/overview) (веб-поиск / поиск X / выполнение кода подтверждены)

#### Китайские модели

* DeepSeek V3.2 / V3.1 / R1 (Гибридное рассуждение)
* GLM-4.6 / GLM-4.5 (Zhipu AI)
* Kimi K2 (официально от BytePlus)
* Серия Qwen (Alibaba)
* ERNIE 4.0 (Baidu)
* SparkDesk 3.5 (iFlytek)

#### Модели генерации видео

* **Seedance 2.0** (🔥 Последняя модель ByteDance, синхронизированный звук по умолчанию)
* **Wan2.7** (Alibaba Wan, включает редактирование видео)
* VEO 3.1 (официальный канал Google, до 4K)
* Sora 2 / Sora 2 Pro (официальный канал OpenAI)

#### Модели генерации изображений

* Nano Banana Pro (4K HD)
* Flux / SeeDream (профессионального уровня)
* Sora Image (восстановленная по обратной разработке)

### 🔧 Просто и удобно

Переключение моделей так же просто, как изменение одного параметра:

```python theme={null}
# Using GPT-4
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Switch to Claude 3
response = openai.ChatCompletion.create(
    model="claude-3-opus-20240229",  # Just change the model name
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 🛡️ Стабильно и надёжно

* **Высокая доступность**: Развёртывание на нескольких узлах, интеллектуальная маршрутизация
* **Автоматическое переключение при сбое**: Автоматическое переключение, когда модель недоступна
* **Балансировка нагрузки**: Интеллектуальное распределение запросов, избегая лимитов запросов
* **Мониторинг в реальном времени**: Круглосуточный мониторинг состояния сервиса

### 💰 Оптимизация затрат

* **Единая тарификация**: Для всех моделей используется единый баланс
* **Прозрачная тарификация**: Понятная структура тарифов
* **Статистика использования**: Подробные отчёты об использовании
* **Гибкое пополнение**: Поддерживается несколько способов оплаты

## 🎯 Ключевые возможности

### 🔥 Новейшие модели доступны сразу

* **Claude Opus 4.5**: SWE-bench 80.9%, лучшие возможности кодинга, цена снижена до 1/3 по сравнению с предшественником
* **Gemini 3 Pro Preview**: LMArena 1501 Elo, №1 в мире, контекстное окно 1M
* **Nano Banana Pro**: генерация изображений 4K HD, лучшее в классе отображение текста
* **Seedance 2.0 Video Generation**: новейший флагман ByteDance, синхронизированный звук по умолчанию, высокая параллельность без очереди

### 🚀 Стабильно, надежно и с неограниченными параллельными запросами

Ресурсы официальных партнеров (AWS, Azure, Google Cloud, BytePlus), высокопроизводительная инфраструктурная поддержка, неограниченные параллельные запросы, обеспечивающие стабильную работу в производственных средах разных отраслей.

### 💰 Максимальная выгода

* Бонус за пополнение: скидка до 80%
* Преимущество обменного курса: цены в USD более выгодны
* Оптимизация кэширования: GPT-5.1 prompt caching экономит 90% затрат
* Тарификация по факту использования: гибкая тарификация по token или по использованию

## 🚀 Начните

Готовы начать? Всего три шага:

<CardGroup cols={3}>
  <Card title="Зарегистрируйтесь" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    Создайте учетную запись APIYI
  </Card>

  <Card title="Получите ключ API" icon="key" href="/ru/getting-started">
    Сгенерируйте свой ключ API
  </Card>

  <Card title="Интеграция" icon="code" href="/ru/api-manual">
    Изучите документацию API, чтобы начать интеграцию
  </Card>
</CardGroup>

## 🔗 Быстрые ссылки

<CardGroup cols={2}>
  <Card title="Зарегистрироваться" icon="user-plus" href="https://api.apiyi.com/register/?aff_code=Snip">
    Новые аккаунты получают \$0.05 пробного кредита — сделайте свой первый вызов без пополнения
  </Card>

  <Card title="Панель управления" icon="settings" href="https://api.apiyi.com/token">
    Управляйте ключами API, просматривайте статистику использования и тарификацию
  </Card>
</CardGroup>

***

<Note>
  Новые аккаунты получают \$0.05 пробного кредита — этого достаточно, чтобы запустить «Hello World» на облегчённой модели, такой как `gpt-5.4-mini`, и убедиться, что ваша интеграция работает. Пополните баланс, когда будете готовы к реальному использованию; см. [политику бонуса за пополнение](/ru/faq/recharge-promotions).
</Note>
