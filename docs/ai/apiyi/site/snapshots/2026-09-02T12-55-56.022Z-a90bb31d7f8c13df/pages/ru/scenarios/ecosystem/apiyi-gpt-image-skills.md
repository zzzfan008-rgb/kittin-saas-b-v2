> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI GPT-Image 2 Image-Gen Skills

> Пакет из двух Skills, предоставленный сообществом: вызывайте gpt-image-2 (official) и gpt-image-2-all (reverse) из Codex CLI, Cursor, Gemini CLI и других AI-инструментов для программирования с помощью одной фразы.

## Обзор

`apiyi-gpt-image-2-gen` и `apiyi-gpt-image-2-all-gen` — это два open-source навыка AI Agent, внесенные пользователем сообщества wuchubuzai2018. Они позволяют вызывать две модели OpenAI GPT для генерации изображений от APIYI — **официальный `gpt-image-2`** (тонкая настройка управления, тарификация по token, 4K) и **обратный `gpt-image-2-all`** (диалоговый, тарификация за вызов, соответствие опыту ChatGPT) — напрямую из **Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp** и любого инструмента, совместимого со Skills, через один prompt на естественном языке.

<Info>
  **Сведения о проекте**

  * 🔗 Источник: `github.com/wuchubuzai2018/expert-skills-hub`
  * 📦 ID навыков: `apiyi-gpt-image-2-gen` (официальный), `apiyi-gpt-image-2-all-gen` (обратный)
  * 👤 Автор: wuchubuzai2018
  * ⭐ Вклад сообщества, использует тот же репозиторий, что и [Nano Banana Pro Skill для генерации изображений](/ru/scenarios/ecosystem/nano-banana-skill) автора
</Info>

<Tip>
  **Какой skill мне выбрать?**

  * **`apiyi-gpt-image-2-gen` (официальный, рекомендуется)**: управляемый `size / quality / output-format / compression`, поддерживает 4K (3840×2160), пользовательские размеры и семантическое редактирование; тарификация на основе token — лучше всего, если у вас есть конкретные требования к качеству или размеру
  * **`apiyi-gpt-image-2-all-gen` (обратный)**: требуется только `prompt` плюс необязательный `response-format`; размер/соотношение сторон описываются в prompt; тарификация за вызов (\$0.03/call); соответствует веб-опыту ChatGPT — лучше всего для прямого вывода на естественном языке, качественного рендеринга текста и итеративного редактирования
  * Полное сравнение бок о бок: [сравнение official и reverse](/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
</Tip>

## Основные возможности

<CardGroup cols={2}>
  <Card title="Генерация изображений в одну фразу" icon="wand-sparkles">
    Опишите это на китайском или английском прямо в вашем AI coding assistant и получите изображение в ответ
  </Card>

  <Card title="Поддержка двух моделей" icon="layers">
    Доступны как официальный `gpt-image-2`, так и обратный `gpt-image-2-all` — выбирайте в зависимости от сценария
  </Card>

  <Card title="4K + пользовательские размеры (официально)" icon="image">
    Официальный Skill поддерживает пресеты 1024², 1536×1024, 2048², **3840×2160** и пользовательские размеры
  </Card>

  <Card title="Управление качеством / форматом (официально)" icon="sliders-horizontal">
    `quality` (низкий / средний / высокий / авто) + формат вывода (png / jpeg / webp) + сжатие 0-100
  </Card>

  <Card title="До 5 референсных изображений" icon="images">
    Оба skill поддерживают до 5 сложенных референсных изображений для слияния нескольких изображений и переноса стиля
  </Card>

  <Card title="Совместимо с несколькими инструментами" icon="puzzle">
    Работает в Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp
  </Card>

  <Card title="Среды выполнения Node.js + Python" icon="terminal">
    Поставляется с `generate_image.js` и `generate_image.py`
  </Card>

  <Card title="Настройка без лишних усилий" icon="key">
    Задайте `APIYI_API_KEY` один раз; используйте `-k` для временных переопределений
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Модель                                   | ID модели         | Навык                       | Тарификация     | Документация по API                                   |
| ---------------------------------------- | ----------------- | --------------------------- | --------------- | ----------------------------------------------------- |
| GPT-Image 2 (официальная, рекомендовано) | `gpt-image-2`     | `apiyi-gpt-image-2-gen`     | По токенам      | [View](/ru/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (reverse)                | `gpt-image-2-all` | `apiyi-gpt-image-2-all-gen` | \$0.03 за вызов | [View](/ru/api-capabilities/gpt-image-2-all/overview) |

## Быстрый старт: 3 шага

<Steps>
  <Step title="Шаг 1: Получите ваш ключ APIYI">
    1. Откройте [Консоль APIYI](https://api.apiyi.com) и войдите в систему
    2. В разделе **Tokens** создайте новый ключ (начинается с `sk-`)
    3. Рекомендуем: создайте отдельный ключ с лимитом использования

    <Info>
      Новые пользователи получают бесплатный пробный кредит — его достаточно, чтобы опробовать обе модели GPT для генерации изображений.
    </Info>
  </Step>

  <Step title="Шаг 2: Установите навык(и) — выберите один или установите оба">
    **Официальный `gpt-image-2` (рекомендуется)**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-gen
    ```

    **Обратный `gpt-image-2-all`**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-all-gen
    ```

    <Warning>
      Node.js обязателен; скрипты Python работают как резервная среда выполнения. Если Node.js не установлен, скачайте его по `nodejs.org`.
    </Warning>
  </Step>

  <Step title="Шаг 3: Настройте ключ API">
    Установите переменную окружения (мы рекомендуем сохранить ее в `~/.zshrc` / `~/.bashrc`):

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Windows PowerShell:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```
  </Step>
</Steps>

Готово! Теперь любой AI-инструмент для программирования, совместимый со Skills, может запускать эти два навыка с помощью естественного языка.

## Параметры командной строки

### `apiyi-gpt-image-2-gen` (официальный)

| Параметр               | Кратко | Обязательно | Описание                                                                                                                      | Пример                     |
| ---------------------- | ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `--prompt`             | `-p`   | Да          | Промпт для генерации или инструкция на редактирование                                                                         | `"An orange cat on grass"` |
| `--filename`           | `-f`   | Нет         | Путь вывода (если не указан, автоматически добавляется метка времени)                                                         | `"cat.png"`                |
| `--size`               | `-s`   | Нет         | Пресет (`1024x1024` / `1536x1024` / `1024x1536` / `2048x2048` / `2048x1152` / `3840x2160` / `2160x3840`) или пользовательский | `"2048x1152"`              |
| `--quality`            | `-q`   | Нет         | `low` / `medium` / `high` / `auto`                                                                                            | `"high"`                   |
| `--output-format`      | `-o`   | Нет         | `png` (по умолчанию) / `jpeg` / `webp`                                                                                        | `"webp"`                   |
| `--output-compression` | `-c`   | Нет         | 0-100 (только jpeg / webp)                                                                                                    | `80`                       |
| `--input-image`        | `-i`   | Нет         | Референсные изображения, до 5                                                                                                 | `"portrait.png"`           |
| `--api-key`            | `-k`   | Нет         | Переопределяет env var для одного вызова                                                                                      | `"sk-xxx"`                 |

**Поддерживаемые соотношения сторон**: `1:1`, `3:2`, `2:3`, `16:9`, `9:16`, а также любое пользовательское соотношение в пределах 3:1.

**Ограничения для пользовательского размера**: каждая сторона ≤ 3840px; оба измерения должны делиться на 16; общее число пикселей — от 655,360 до 8,294,400.

**Типичная задержка**: 120–150 с на запрос (дольше для сложных сцен в 4K).

### `apiyi-gpt-image-2-all-gen` (обратный)

| Параметр            | Кратко | Обязательно | Описание                                                                     | Пример                             |
| ------------------- | ------ | ----------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| `--prompt`          | `-p`   | Да          | Разговорный prompt (размер/соотношение сторон указываются внутри prompt)     | `"widescreen 16:9 cyberpunk city"` |
| `--filename`        | `-f`   | Нет         | Путь вывода (если не указан, автоматически добавляется PNG с меткой времени) | `"city.png"`                       |
| `--response-format` | `-r`   | Нет         | `url` (по умолчанию, R2 CDN действует около 24 ч) или `b64_json`             | `"b64_json"`                       |
| `--input-image`     | `-i`   | Нет         | Референсные изображения, до 5                                                | `"ref.png"`                        |
| `--api-key`         | `-k`   | Нет         | Переопределяет env var для одного вызова                                     | `"sk-xxx"`                         |

<Info>
  Навык reverse **не принимает** CLI-флаги `size` / `quality` / `aspect_ratio` — опишите все это в prompt (например, `"vertical 9:16 mobile poster"`, `"1024x1024 square"`). Задержка: 60–300 с.
</Info>

## Примеры использования

### Пример 1: Официальный text-to-image с точным контролем

```bash theme={null}
node scripts/generate_image.js \
  -p "Cinematic product shot of a minimalist ceramic teacup, soft morning light, 35mm lens" \
  -f "teacup.png" \
  -s "3840x2160" \
  -q "high" \
  -o "png"
```

### Пример 2: Официальное редактирование изображения (reference image)

```bash theme={null}
node scripts/generate_image.js \
  -p "replace the background with a sunset beach, keep the subject intact" \
  -i "portrait.png" \
  -f "portrait-beach.jpg" \
  -s "2048x1152" \
  -q "high" \
  -o "jpeg" \
  -c 85
```

### Пример 3: Официальное слияние нескольких изображений

```bash theme={null}
node scripts/generate_image.js \
  -p "put the person from img 1 into the scene from img 2, lighting style from img 3" \
  -i person.png scene.png light.png \
  -f merged.png \
  -q high
```

### Пример 4: Обратный диалоговый режим (размер через prompt)

```bash theme={null}
node scripts/generate_image.js \
  -p "widescreen 16:9 cinematic frame: a girl in hanfu under cherry blossoms, watercolor style, soft light" \
  -f "sakura.png" \
  -r url
```

### Пример 5: Вызов из AI coding tools

После установки просто попросите ассистента в Cursor / Codex CLI и т. д.:

* "Используйте apiyi-gpt-image-2-gen, чтобы сгенерировать высококачественные обои с киберпанк-городом в разрешении 3840x2160"
* "Вызовите apiyi-gpt-image-2-all-gen, чтобы преобразовать photo.jpg в стиль Studio Ghibli"
* "Используйте официальный skill, чтобы создать логотип 1:1, высокого качества, в формате webp"

Ассистент выберет нужный skill и подготовит для вас флаги CLI.

## Частые вопросы

<AccordionGroup>
  <Accordion title="Какой skill мне выбрать?">
    * Нужен **точный размер** (например, 3840×2160), **уровни качества** (low/medium/high) или **определенные форматы вывода** (webp / compression) → выбирайте **официальный `apiyi-gpt-image-2-gen`**
    * Предпочитаете **диалоговый поток на уровне ChatGPT**, **фиксированную цену за вызов** (\$0.03), **сильный рендеринг текста** и готовы задавать размер на естественном языке → выбирайте **обратный `apiyi-gpt-image-2-all-gen`**
    * Полное сравнение: [сравнение official и reverse](/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="`npx skills` установка не удалась">
    1. Убедитесь, что Node.js установлен (`node -v`)
    2. Проверьте сетевой доступ к GitHub
    3. Если `npx skills` недоступен, клонируйте вручную:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    Затем скопируйте либо `skills/apiyi-gpt-image-2-gen`, либо `skills/apiyi-gpt-image-2-all-gen` в ваш локальный каталог Skills.
  </Accordion>

  <Accordion title="ошибка: неверный API key">
    1. Проверьте, что `APIYI_API_KEY` задан правильно (начинается с `sk-`)
    2. Баланс — см. [Баланс вроде достаточный, но вызовы завершаются ошибкой](/ru/faq/balance-insufficient)
    3. Для быстрой проверки передайте `-k "sk-xxx"` inline
  </Accordion>

  <Accordion title="официальный skill отклоняет мой custom size">
    Пользовательский `size` должен соответствовать требованиям:

    * каждая сторона ≤ 3840px
    * обе размерности кратны 16
    * общее число пикселей от 655,360 до 8,294,400
      Например, `2048x3072` допустим; `3000x2000` отклоняется, потому что 3000 не делится на 16.
  </Accordion>

  <Accordion title="Как долго действителен URL обратного skill?">
    URL по умолчанию для R2 CDN у обратного skill действителен примерно **24 hours**. Для production передайте `-r b64_json`, чтобы получить Base64 и сохранить локально, либо сразу скачайте asset.
  </Accordion>

  <Accordion title="Какие AI-инструменты для кодинга поддерживаются?">
    Проверено с: Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp. Должен подойти любой инструмент, совместимый со Skills.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="gpt-image-2 (официальная) документация" icon="book" href="/ru/api-capabilities/gpt-image-2/overview">
    Нативная генерация 2K/4K, тарификация за token
  </Card>

  <Card title="gpt-image-2-all (реверс) документация" icon="book" href="/ru/api-capabilities/gpt-image-2-all/overview">
    Паритет с ChatGPT, \$0.03 за вызов
  </Card>

  <Card title="Сравнение официальной версии и реверса" icon="scale" href="/ru/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Сопоставление по 17 параметрам
  </Card>

  <Card title="Навык Nano Banana Pro (тот же автор)" icon="puzzle" href="/ru/scenarios/ecosystem/nano-banana-skill">
    Дочерний навык из того же репозитория — генерация изображений Gemini
  </Card>

  <Card title="Узлы ComfyUI для Luck GPT-Image 2" icon="workflow" href="/ru/scenarios/ecosystem/luckgpt2-comfyui">
    Те же модели, в стиле узлов ComfyUI
  </Card>

  <Card title="Консоль APIYI" icon="settings" href="https://www.apiyi.com">
    Управляйте ключами, использованием и каналами
  </Card>
</CardGroup>
