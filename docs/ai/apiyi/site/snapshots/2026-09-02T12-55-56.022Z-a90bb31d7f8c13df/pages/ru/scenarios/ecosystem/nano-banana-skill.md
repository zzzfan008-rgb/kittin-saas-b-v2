> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Skill для генерации изображений

> Open-source Skill сообщества для генерации и редактирования изображений с помощью естественного языка в Codex CLI, OpenCode, Gemini CLI, Cursor и других инструментах, работающий на Nano Banana Pro через APIYI.

## Обзор

nano-banana-pro-image-gen — это созданный сообществом open-source AI Agent Skill, который позволяет генерировать и редактировать изображения одной командой на естественном языке в **Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp** и других. Он обращается к модели Nano Banana Pro через APIYI — сложная настройка не нужна, достаточно установить и начать.

<Info>
  **Информация о проекте**

  * 🔗 Исходный код: `github.com/wuchubuzai2018/expert-skills-hub`
  * 🌐 Страница Skill: `skills.sh/wuchubuzai2018/expert-skills-hub/nano-banana-pro-image-gen`
  * 👤 Автор: wuchubuzai2018
  * ⭐ Создано сообществом
</Info>

## Почему этот навык

<CardGroup cols={2}>
  <Card title="Генерация изображений одной строкой" icon="wand-sparkles">
    Опишите на естественном языке в вашем AI coding assistant и мгновенно генерируйте качественные изображения, не покидая редактор
  </Card>

  <Card title="Редактирование изображений" icon="square-pen">
    Передавайте существующие изображения для редактирования, до 14 reference images, что позволяет выполнять style transfer и изменение контента
  </Card>

  <Card title="Много платформ" icon="puzzle">
    Работает с Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp и другими
  </Card>

  <Card title="Гибкий вывод" icon="sliders-horizontal">
    10 соотношений сторон + 3 уровня разрешения (1K/2K/4K), покрывающие все — от быстрых предпросмотров до постеров высокого разрешения
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Название модели | ID модели                    | Использование                 | Документация API                                                  |
| --------------- | ---------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | text-to-image, image-to-image | [Посмотреть документацию](/en/api-capabilities/nano-banana-image) |

<Tip>
  Этот навык использует модель Nano Banana Pro. Если вам также нужна более высокая скорость и более низкая стоимость с Nano Banana 2, посмотрите [Nano Banana ComfyUI Nodes](/ru/scenarios/ecosystem/nano-banana-comfyui), которые поддерживают обе модели.
</Tip>

## Быстрый старт: 3 шага для генерации изображений

<Steps>
  <Step title="Шаг 1: Получите свой ключ APIYI">
    1. Перейдите в [APIYI Console](https://api.apiyi.com), чтобы зарегистрироваться или войти
    2. Перейдите в раздел Token и сгенерируйте новый ключ API
    3. Скопируйте ключ (начинается с `sk-`)

    <Info>
      Новые пользователи получают бесплатные пробные кредиты, которых достаточно, чтобы опробовать генерацию изображений Nano Banana.
    </Info>
  </Step>

  <Step title="Шаг 2: Установите навык">
    Выполните следующую команду в терминале:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill nano-banana-pro-image-gen
    ```

    <Warning>
      Требуется Node.js. Если он не установлен, перейдите по `nodejs.org`, чтобы загрузить его. В качестве запасной среды выполнения можно использовать Python.
    </Warning>
  </Step>

  <Step title="Шаг 3: Настройте ключ API">
    Установите переменную окружения:

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Пользователи Windows PowerShell:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```

    <Tip>
      Добавьте переменную окружения в ваш `~/.zshrc` или `~/.bashrc`, чтобы не задавать ее каждый раз.
    </Tip>
  </Step>
</Steps>

Настройка завершена! Теперь вы можете напрямую использовать генерацию изображений в любом совместимом с Skills AI-инструменте для программирования.

## Практическое руководство

### Способ использования 1: Текст-в-изображение из командной строки

Самый прямой подход — введите описание в терминале и сгенерируйте изображение.

<CodeGroup>
  ```bash Node.js (Рекомендуется) theme={null}
  node scripts/generate_image.js \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```

  ```bash Python theme={null}
  python scripts/generate_image.py \
    -p "An astronaut cat floating in space, Earth in the background, digital art style" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```
</CodeGroup>

### Способ использования 2: Редактирование существующих изображений

Передайте одно или несколько эталонных изображений и опишите нужное изменение на естественном языке.

```bash theme={null}
node scripts/generate_image.js \
  -p "Convert this photo to Studio Ghibli animation style, keep the character composition" \
  -i "photo.jpg" \
  -f "ghibli-style.png" \
  -r 2K
```

Поддерживается несколько эталонных изображений (до 14), которые автоматически преобразуются в Base64:

```bash theme={null}
node scripts/generate_image.js \
  -p "Merge these elements into a poster" \
  -i "bg.jpg" -i "logo.png" -i "text.png" \
  -f "poster.png" \
  -a 3:4 \
  -r 4K
```

### Способ использования 3: Внутри AI-ассистентов для программирования

После установки навыка используйте команды на естественном языке в поддерживаемых AI-инструментах для программирования:

* **Codex CLI / OpenCode**: «Сгенерируйте обои с киберпанк-городским пейзажем в формате 16:9 в 4K»
* **Cursor**: «Сгенерируйте логотип продукта в минималистичном стиле, соотношение 1:1»
* **Gemini CLI**: «Отредактируйте input.jpg, измените фон на закатный пляж»

AI-ассистент автоматически вызовет Skill для генерации изображений.

## Параметры команды

| Параметр         | Кратко | Обязательно | Описание                                                            | Пример           |
| ---------------- | ------ | ----------- | ------------------------------------------------------------------- | ---------------- |
| `--prompt`       | `-p`   | Yes         | Описание изображения или инструкция по редактированию               | `"a cat"`        |
| `--filename`     | `-f`   | No          | Путь к выходному файлу (если не указан, генерируется автоматически) | `"output.png"`   |
| `--aspect-ratio` | `-a`   | No          | Соотношение сторон                                                  | `16:9`           |
| `--resolution`   | `-r`   | No          | Разрешение (должно быть в верхнем регистре)                         | `1K`, `2K`, `4K` |
| `--input-image`  | `-i`   | No          | Путь к входному изображению (можно указать несколько, до 14)        | `"photo.jpg"`    |
| `--key`          | `-k`   | No          | API Key, указанный inline (рекомендуется переменная окружения)      | `"sk-xxx"`       |

### Поддерживаемые соотношения сторон

`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`

### Разрешение и время обработки

| Разрешение        | Прим. время | Лучше всего для                                |
| ----------------- | ----------- | ---------------------------------------------- |
| 1K                | \~30 секунд | Быстрый предварительный просмотр, тестирование |
| 2K (по умолчанию) | 1-4 минуты  | Ежедневное использование, социальные сети      |
| 4K                | Дольше      | HD-плакаты, печатные материалы                 |

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Ошибка установки?">
    Проверьте следующее:

    1. Установлен Node.js (запустите `node -v` для проверки)
    2. Сетевое соединение работает
    3. Если npx недоступен, вручную клонируйте репозиторий:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    Затем скопируйте каталог `skills/nano-banana-pro-image-gen` в вашу папку Skills.
  </Accordion>

  <Accordion title="Ошибка: недействительный API-ключ?">
    Проверьте:

    1. Переменная окружения `APIYI_API_KEY` правильно задана (начинается с `sk-`)
    2. На вашем аккаунте APIYI достаточно баланса
    3. Также можно протестировать с параметром `-k`, чтобы передать ключ напрямую
  </Accordion>

  <Accordion title="Параметр Resolution не работает?">
    Resolution должен быть **В ВЕРХНЕМ РЕГИСТРЕ**: `1K`, `2K`, `4K`. Значения в нижнем регистре `1k`, `2k` не будут распознаны.
  </Accordion>

  <Accordion title="Генерация изображений работает медленно?">
    * Разрешение 4K по своей природе требует более длительной обработки (может занять более 5 минут)
    * Сначала используйте разрешение 1K, чтобы проверить prompt и композицию
    * Переключитесь на 2K или 4K для финальной версии, когда результат вас устроит
  </Accordion>

  <Accordion title="Как получить APIYI API-ключ?">
    Перейдите в [Консоль APIYI](https://api.apiyi.com/token), зарегистрируйте аккаунт и создайте новый ключ в разделе Token. Новые пользователи получают бесплатные пробные кредиты.
  </Accordion>

  <Accordion title="Какие AI-инструменты для кодинга поддерживаются?">
    Сейчас адаптировано для: Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp. Любой инструмент, поддерживающий протокол Skills, может использовать его.
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Документация Nano Banana Pro" icon="banana" href="/en/api-capabilities/nano-banana-image">
    См. полную документацию API и тарифы Nano Banana Pro
  </Card>

  <Card title="Навыки APIYI GPT-Image 2 (тот же автор)" icon="puzzle" href="/ru/scenarios/ecosystem/apiyi-gpt-image-skills">
    Смежные навыки wuchubuzai2018 для `gpt-image-2` / `gpt-image-2-all`
  </Card>

  <Card title="Узлы ComfyUI для Nano Banana" icon="workflow" href="/ru/scenarios/ecosystem/nano-banana-comfyui">
    Используйте генерацию изображений Nano Banana в ComfyUI
  </Card>

  <Card title="Устранение неполадок при сбоях генерации изображений" icon="circle-question-mark" href="/ru/faq/nano-banana-image-failure">
    Руководство по устранению неполадок генерации изображений Nano Banana
  </Card>

  <Card title="APIYI - Управление token" icon="settings" href="https://api.apiyi.com/token">
    Управляйте API-ключами, просматривайте использование и баланс
  </Card>
</CardGroup>
