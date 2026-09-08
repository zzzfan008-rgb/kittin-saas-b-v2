> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Paper2Any - Мультимодальный рабочий процесс для научных статей

> Открытый проект сообщества для преобразования научных статей, который с помощью APIYI и LLM, таких как GPT, Claude и другие, превращает академические статьи в архитектурные диаграммы, технические дорожные карты, презентации PPT, rebuttal и многое другое.

## Обзор

Paper2Any — это мультимодальная workflow-платформа с открытым исходным кодом для академических статей. Она преобразует PDF-файлы статей, скриншоты или текст в диаграммы архитектуры моделей, технические дорожные карты, графики экспериментов, PPT-презентации и многое другое — и все это в один клик.

<Info>
  **Информация о проекте**

  * 🔗 Исходный код: `github.com/OpenDCAI/Paper2Any`
  * 📜 Лицензия: Open Source
  * 👤 Организация: OpenDCAI
  * ⭐ Вклад сообщества, поддерживает несколько LLMs через APIYI
</Info>

## Почему Paper2Any

<CardGroup cols={2}>
  <Card title="Несколько форматов вывода" icon="layers">
    Преобразуйте статьи в архитектурные диаграммы, дорожные карты, PPT, rebuttal и многое другое — один инструмент для всего исследовательского workflow
  </Card>

  <Card title="Гибкий выбор модели" icon="sliders-horizontal">
    Динамически переключайтесь между GPT-4o, Claude Sonnet, Qwen-VL и другими через параметры API — без необходимости hardcoding
  </Card>

  <Card title="Двойной режим CLI + Web" icon="terminal">
    Доступны как скрипты командной строки, так и web-интерфейс, чтобы соответствовать разным workflow
  </Card>

  <Card title="API, совместимый с OpenAI" icon="plug">
    Нативная поддержка формата API, совместимого с OpenAI, — просто настройте Base URL APIYI, чтобы получить доступ к 400+ моделям
  </Card>
</CardGroup>

## Основные модули

| Module             | Description                                                 | Output Formats                                                |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| **Paper2Figure**   | Генерация научных визуализаций по статьям                   | Архитектурные диаграммы, дорожные карты (PPTX + SVG), графики |
| **Paper2Diagram**  | Создание блок-схем по статьям/тексту/изображениям           | draw\.io / PNG / SVG                                          |
| **Paper2PPT**      | Преобразование статей в презентации                         | PPTX (поддерживает более 40 слайдов)                          |
| **Paper2Rebuttal** | Генерация структурированных ответов на rebuttal             | Документы rebuttal с опорой на доказательства                 |
| **PDF2PPT**        | Преобразование PDF в редактируемый PPT с сохранением макета | PPTX                                                          |
| **Image2PPT**      | Преобразование изображений/скриншотов в слайды              | PPTX                                                          |
| **PPTPolish**      | Оптимизация макета с помощью ИИ                             | PPTX                                                          |
| **Knowledge Base** | Импорт файлов, семантический поиск, генерация на основе KB  | Несколько форматов                                            |

## Подключение к LLM через APIYI

Paper2Any поддерживает формат API, совместимый с OpenAI. После настройки APIYI как LLM-эндпоинта вы можете использовать GPT, Claude, Gemini, DeepSeek и более 400 других моделей.

### Развертывание в Docker

<Steps>
  <Step title="Шаг 1: Получите ваш API key APIYI">
    1. Посетите [APIYI Console](https://api.apiyi.com), чтобы зарегистрироваться/войти
    2. Перейдите в раздел **Tokens**
    3. Сгенерируйте новый API key
    4. Скопируйте ключ (начинается с `sk-`)
  </Step>

  <Step title="Шаг 2: Клонируйте и настройте backend">
    После клонирования репозитория отредактируйте `fastapi_app/.env`, чтобы задать APIYI как LLM-эндпоинт:

    ```bash theme={null}
    # fastapi_app/.env
    DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    BACKEND_API_KEY=sk-your-apiyi-key
    ```

    При необходимости укажите модели по умолчанию для разных рабочих процессов:

    ```bash theme={null}
    PAPER2PPT_DEFAULT_MODEL=gpt-4o
    PDF2PPT_DEFAULT_MODEL=gpt-4o
    ```
  </Step>

  <Step title="Шаг 3: Настройте frontend">
    Отредактируйте `frontend-workflow/.env`, чтобы web UI по умолчанию использовал APIYI:

    ```bash theme={null}
    # frontend-workflow/.env
    VITE_DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    VITE_LLM_API_URLS=https://api.apiyi.com/v1
    ```
  </Step>

  <Step title="Шаг 4: Запуск">
    Запустите все с помощью Docker Compose:

    ```bash theme={null}
    docker compose up -d --build
    ```

    После запуска откройте frontend, чтобы начать работу с Paper2Any.
  </Step>
</Steps>

### Использование CLI

Paper2Any предоставляет автономные скрипты CLI с параметрами `--api-url` и `--api-key` для прямой интеграции с APIYI:

```bash theme={null}
# Paper to PPT
python script/run_paper2ppt_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --model gpt-4o

# Paper to Figure
python script/run_paper2figure_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-your-apiyi-key \
  --graph-type model_arch
```

<Tip>
  **Рекомендации по моделям**: Для преобразования paper-to-PPT рекомендуются GPT-4o или Claude Sonnet 4.5 благодаря их сильному пониманию длинных документов и возможностям структурированного вывода. Для генерации диаграмм также стоит попробовать vision-модели, такие как Qwen-VL.
</Tip>

## Варианты развертывания

| Способ                     | Требования                                 | Лучше всего для           |
| -------------------------- | ------------------------------------------ | ------------------------- |
| **Docker (Рекомендуется)** | Однократный запуск frontend + backend      | Быстрый старт, production |
| **Нативно в Linux**        | Python 3.11+, LaTeX, Inkscape, LibreOffice | Разработка, настройка     |
| **Windows**                | Python 3.12, Inkscape                      | Локальное использование   |

<Warning>
  Функции, зависящие от GPU, такие как PDF2PPT и Image2PPT, требуют отдельного сервера модели SAM3. См. README проекта для инструкций по развертыванию на GPU.
</Warning>

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Как подключить Paper2Any к моделям APIYI?">
    Установите `DEFAULT_LLM_API_URL` в значение `https://api.apiyi.com/v1` и укажите `BACKEND_API_KEY` как ваш ключ APIYI в переменных окружения. Для режима CLI используйте параметры `--api-url` и `--api-key`.
  </Accordion>

  <Accordion title="Какие модели поддерживаются?">
    Через APIYI вы можете получить доступ к более чем 400 моделям, включая GPT-4o, Claude Sonnet 4.5, Gemini, DeepSeek, Qwen и другие. Модели можно динамически переключать в веб-интерфейсе без изменения кода.
  </Accordion>

  <Accordion title="Запуск Docker не удается — что проверить?">
    Проверьте, что:

    1. Docker и Docker Compose установлены корректно
    2. Файлы `.env` настроены правильно
    3. Необходимые порты не используются
    4. Проверьте `docker compose logs` на наличие подробных сообщений об ошибках
  </Accordion>

  <Accordion title="Ошибки генерации PPT или неполный контент?">
    * Убедитесь, что на вашем аккаунте APIYI достаточно баланса
    * Для длинных статей используйте модели с более широким контекстным окном (например, GPT-4o 128K)
    * Проверьте, что PDF статьи содержит распознаваемый текст (сканированные PDF могут давать плохие результаты)
  </Accordion>

  <Accordion title="Как получить API-ключ APIYI?">
    Перейдите в [консоль APIYI](https://api.apiyi.com/token), создайте аккаунт и сгенерируйте новый ключ в разделе Tokens. Новые пользователи получают бесплатные пробные кредиты.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Список моделей APIYI" icon="list" href="/ru/api-capabilities/model-info">
    Просмотрите полный список из более чем 400 моделей, поддерживаемых APIYI
  </Card>

  <Card title="Настройка базового URL" icon="settings" href="/ru/faq/base-url-config">
    Узнайте, как настроить Base URL APIYI в различных инструментах
  </Card>

  <Card title="Управление токенами APIYI" icon="key" href="https://api.apiyi.com/token">
    Управляйте ключами API, проверяйте использование и баланс
  </Card>

  <Card title="Тарификация APIYI" icon="banknote" href="https://api.apiyi.com/account/pricing">
    Просматривайте тарификацию моделей и предложения по пополнению
  </Card>
</CardGroup>
