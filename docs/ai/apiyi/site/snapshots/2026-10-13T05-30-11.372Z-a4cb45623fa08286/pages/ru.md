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

## 🛡️ Устали от сомнительных реселлеров API?

<Info>
  Рынок реселлеров API весьма неоднороден: скрытая подмена моделей, ухудшение качества и внезапно исчезающие провайдеры — обычное дело. APIYI не полагается на пустые обещания; мы предоставляем проверяемые доказательства.
</Info>

<CardGroup cols={3}>
  <Card title="Более 2 лет стабильной работы" icon="calendar-check" href="/ru/faq/enterprise-trust">
    150 тыс. посетителей в месяц, долгосрочная надежная работа — не фирма-однодневка
  </Card>

  <Card title="Безусловный возврат средств в течение 30 дней" icon="rotate-ccw" href="/ru/faq/refund-policy">
    Неиспользованный баланс возвращается на исходный способ оплаты в течение 30 дней, без комиссий через WeChat/Alipay
  </Card>

  <Card title="Чистый официальный релей · Точность моделей" icon="shield-check" href="/ru/faq/enterprise-trust">
    Без скрытого перенаправления, без ухудшения качества, без подмены моделей — проверяйте точность самостоятельно
  </Card>

  <Card title="Прагматичные гарантии SLA" icon="file-check" href="/ru/faq/sla-guarantee">
    Компенсация за аномалии в тарификации, начисление средств при сбоях, договорной SLA для корпоративных клиентов
  </Card>

  <Card title="Безопасность данных" icon="lock" href="/ru/faq/data-security">
    Прозрачное проксирование, отсутствие сохранения содержимого диалогов, минимальное логирование
  </Card>

  <Card title="Оплата от юрлиц · Простая отчетность" icon="receipt" href="/ru/faq/university-reimbursement">
    Поддержка счетов-фактур и безналичных расчетов для юрлиц — удобно для оформления компенсаций в университетах, клиниках и на предприятиях
  </Card>
</CardGroup>

### Где подходит APIYI

Надежность и спокойствие превыше всего. Но будем честны: **качественные ресурсы не бывают дешевыми, а за дешевизну всегда приходится расплачиваться чем-то другим** — подменой моделей, ухудшением результатов, искусственными задержками или исчезновением сервиса, и в конечном счете страдает ваш бизнес.

<CardGroup cols={2}>
  <Card title="Используйте APIYI как основной сервис" icon="star">
    Получите стабильный, высококачественный опыт работы с оригинальными API без потери точности и сосредоточьтесь на создании собственного продукта
  </Card>

  <Card title="Держите APIYI в качестве резерва" icon="life-buoy">
    Если у вашего основного поставщика возникнут неполадки, мы подстрахуем вас, чтобы ваш бизнес продолжал бесперебойно работать
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

## 🌟 Рекомендуемые модели

<CardGroup cols={3}>
  <Card title="Серия Nano Banana Pro/2" icon="image" href="/ru/api-capabilities/nano-banana-pricing">
    **🎨 Генерация изображений**

    Лучшее из доступного, 4K всего за

    **\$0.09** /изображение

    🎯 Всего от 30.3% от официальной цены
  </Card>

  <Card title="Официальный релей Claude" icon="sparkles" href="/ru/api-capabilities/claude">
    **🤖 Чат и написание кода**

    Чистый официальный релей через два канала: AWS + Official, высокая доля попаданий в кэш

    ⚡ \~80% от официальной цены
  </Card>

  <Card title="Полная серия GPT-image-2" icon="images" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    **🖼️ Генерация изображений**

    Официальный релей + reverse (-all/-vip), полное покрытие

    🎯 Выбирайте то, что подходит под ваши задачи
  </Card>

  <Card title="Полная мультимодальная серия Gemini" icon="gem" href="/ru/api-capabilities/model-info">
    **🔥 Мультимодальность**

    Полная линейка для текста, изображений и видео

    🏆 Gemini 3.8 Flash только что запущен
  </Card>

  <Card title="Полная мультимодальная серия OpenAI" icon="bot" href="/ru/api-capabilities/model-info">
    **🚀 Мультимодальность**

    Серия GPT-6 / GPT-5.6, изображения и аудио

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
    🔥 Новейший флагман ByteDance: уровни standard / fast / mini, синхронизированное аудио по умолчанию, большое количество параллельных запросов без очередей
  </Card>

  <Card title="Генерация видео Wan2.7" icon="videotape" href="/ru/api-capabilities/wan/overview">
    Официальный канал Alibaba: генерация видео из текста / изображения / референса плюс редактирование видео, от \$0.42/видео
  </Card>

  <Card title="Генерация видео VEO 3.1" icon="clapperboard" href="/ru/api-capabilities/veo-3-1-official/overview">
    Официальный канал Google, тарификация за каждую генерацию от \$0.3/видео, 720p / 1080p / 4K
  </Card>

  <Card title="Видео с сохранением персонажей" icon="images" href="/ru/api-capabilities/seedance2/asset-library">
    Библиотека ресурсов Seedance: загрузите изображения один раз и ссылайтесь на них для создания видео со стабильной внешностью персонажей
  </Card>

  <Card title="API анализа видео" icon="eye" href="/ru/api-capabilities/video-understanding">
    Интеллектуальный анализ видео, распознавание сцен, понимание контента
  </Card>
</CardGroup>

### 🎨 API генерации изображений

<CardGroup cols={2}>
  <Card title="Nano Banana Pro" icon="banana" href="/ru/api-capabilities/nano-banana-image/overview">
    🔥 Наша самая мощная модель, 4K HD, лучший в своем классе рендеринг текста, \$0.09/изображение
  </Card>

  <Card title="Nano Banana 2" icon="banana" href="/ru/api-capabilities/nano-banana-2-image/overview">
    🔥 Тарификация по объему использования, новые соотношения сторон 1:8/8:1 для длинных изображений, \$0.055/изображение (от \$0.025 при оплате по факту использования)
  </Card>

  <Card title="Nano Banana Lite" icon="zap" href="/ru/api-capabilities/nano-banana-lite-image/overview">
    🆕 Самая быстрая и доступная модель от Google, \~4 с на изображение, \$0.025/изображение
  </Card>

  <Card title="Серия gpt-image-2.5 / 2" icon="images" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Официальный релей OpenAI: 2.5-flare / 2.5-sunburst / 2 с нативным 4K + reverse; -all по цене \$0.025/изображение и -vip по цене \$0.03/изображение — выбирайте то, что подходит
  </Card>

  <Card title="Seedream 5.0/4.5" icon="sparkles" href="/ru/api-capabilities/seedream-image/overview">
    Официальное партнерство с BytePlus, высокая скорость с выводом URL, от \$0.035/изображение
  </Card>

  <Card title="Серия Flux 2" icon="wand-sparkles" href="/ru/api-capabilities/flux/overview">
    🆕 Уровни FLUX.2 max/pro/flex, от \$0.03/генерация
  </Card>
</CardGroup>

### 🔧 Базовые API

<CardGroup cols={2}>
  <Card title="Информация о моделях" icon="database" href="/ru/api-capabilities/model-info">
    Просмотр подробной информации о более чем 400 поддерживаемых моделях ИИ
  </Card>

  <Card title="Интеграция с OpenAI SDK" icon="code" href="/ru/api-capabilities/openai/compatible">
    Бесшовная интеграция с APIYI с помощью официального SDK
  </Card>

  <Card title="API анализа изображений" icon="eye" href="/ru/api-capabilities/vision-understanding">
    Интеллектуальный анализ изображений, OCR, распознавание объектов, описание сцен
  </Card>

  <Card title="Нативный формат Claude" icon="messages-square" href="/ru/api-capabilities/claude">
    Нативный формат API Anthropic, полная поддержка всех возможностей
  </Card>

  <Card title="Нативный формат Gemini" icon="gem" href="/ru/api-capabilities/gemini/native">
    Нативный формат API Google, полная поддержка всех возможностей
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

## 🚀 Почему выбирают APIYI?

### Один интерфейс, множество моделей

Вам больше не нужно регистрировать отдельные аккаунты и управлять API-ключами для каждого сервиса ИИ. С APIYI вам потребуются лишь:

* **Один аккаунт**: управление всеми сервисами ИИ
* **Один API-ключ**: доступ ко всем моделям
* **Один стандарт**: совместимость с форматом API от OpenAI

### 💡 Поддерживаемые модели

Мы поддерживаем 400+ передовых ИИ-моделей:

#### Серия OpenAI

* **GPT-6 Astra** (🔥 флагман 6-го поколения для управления компьютером и автономных агентов с длинным горизонтом планирования)
* **GPT-6 Sol / GPT-6 Luna** (🔥 примерно вдвое дешевле 5.6, долгосрочные цены)
* GPT-5.6 Sol / Terra / Luna, GPT-5.5 / GPT-5.4
* GPT-5.5 Pro (глубокое рассуждение, только эндпоинт Responses)
* gpt-image-2.5 Flare / Sunburst, gpt-image-2 (генерация изображений)
* gpt-realtime-2.1 / 2.1-mini (голос в реальном времени)

#### Серия Anthropic

* **Claude Opus 5.5** (🔥 новейший флагман, Terminal-Bench 4.0 66,4%, дешевле Opus 5)
* **Claude Fable 5.1** (флагман класса Mythos)
* Claude Opus 5 / Claude Sonnet 5
* Claude Opus 4.8 / Opus 4.7 / Sonnet 4.6 / Haiku 4.5

#### Серия Google

* **Gemini 3.8 Flash** (🔥 новейший Flash, по той же цене, что и 3.7)
* Gemini 3.7 Flash / 3.6 Flash / 3.5 Flash-Lite
* Gemini 3.1 Pro Preview (самая мощная модель для рассуждений от Google)
* **Nano Banana Pro / Nano Banana 2** (🔥 генерация изображений в формате 4K HD)

#### Серия xAI Grok

* **Grok 4.7** (🔥 новейший флагман на базе 2.1T)
* Grok 4.6 / Grok 4.5 (код и агенты)
* Grok 4.3 (контекст 1M)
* [Руководство по API](/ru/api-capabilities/grok/overview) (проверены веб-поиск / поиск в X / выполнение кода)

#### Китайские модели

* DeepSeek V4.1 Flash / V4 Pro
* GLM-5.3 / GLM-5.3-Flash (Zhipu AI)
* Kimi K3 (Moonshot)
* Qwen3.8-Max / серия Qwen3.7 (Alibaba)
* MiniMax-M3
* Seed 2.1 Turbo (ByteDance)

#### Модели генерации видео

* **Seedance 2.5** (🔥 новейшая модель от ByteDance, 30-секундные ролики, до 30 референсных изображений)
* Серия Seedance 2.0 (standard / fast / mini)
* **Wan2.7** (Alibaba Wan, включая редактирование видео), HappyHorse
* VEO 3.1 (официальный канал Google, до 4K)

#### Модели генерации изображений

* **gpt-image-2.5** (🔥 Flare для скорости / Sunburst для качества)
* Nano Banana Pro / Nano Banana 2 (4K HD)
* Seedream 5.0 Pro / Flash (профессиональный дизайн / быстро и экономично)

### 🔧 Просто и удобно

Переключение моделей выполняется простой заменой одного параметра:

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

### 🛡️ Стабильность и надежность

* **Высокая доступность**: многоузловое развертывание, интеллектуальная маршрутизация
* **Автоматическое переключение при сбое**: автоматический переход при недоступности модели
* **Балансировка нагрузки**: интеллектуальное распределение запросов, предотвращающее превышение лимитов запросов
* **Мониторинг в реальном времени**: круглосуточный мониторинг состояния сервисов 24/7

### 💰 Оптимизация затрат

* **Единая тарификация**: для всех моделей используется единый баланс
* **Прозрачные цены**: понятная структура ценообразования
* **Статистика использования**: подробные отчеты об использовании
* **Гибкое пополнение**: поддержка различных способов оплаты

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.