> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini CLI

> Используйте Gemini CLI через APIYI для программирования с помощью ИИ, включая генерацию кода, code review, вопросы и ответы и многое другое

## Обзор

Gemini CLI — это официальный инструмент командной строки Google, который позволяет напрямую взаимодействовать с моделями Gemini AI в вашем терминале. Через APIYI вы можете:

* 🚀 Быстро вызывать модели Gemini в терминале
* 💻 Программирование с помощью AI и генерация кода
* 🔍 Проверка кода и предложения по оптимизации
* 📝 Технические вопросы и ответы, а также генерация документации
* 🌐 Кроссплатформенная поддержка (Linux, macOS, Windows)

<Info>
  **Почему стоит выбрать APIYI?**

  Использование Gemini CLI через APIYI обеспечивает более стабильные сетевые соединения, более выгодную тарификацию и круглосуточную техническую поддержку.
</Info>

## Быстрый старт

### Требования

* Node.js >= 18.0.0
* Менеджер пакетов npm или yarn
* Аккаунт APIYI и API-ключ

### Шаг 1: Установите Gemini CLI

<CodeGroup>
  ```bash npm theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install Gemini CLI globally
  npm install -g @google/gemini-cli

  # Verify installation
  gemini --version
  ```

  ```bash yarn theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install with yarn
  yarn global add @google/gemini-cli

  # Verify installation
  gemini --version
  ```
</CodeGroup>

### Шаг 2: Получите API-ключ APIYI

<Steps>
  <Step title="Регистрация/вход в APIYI">
    Перейдите на `api.apiyi.com`, чтобы зарегистрироваться или войти
  </Step>

  <Step title="Создайте API-ключ">
    Перейдите на страницу «Token Management» в панели управления (`api.apiyi.com/token`) и нажмите «Create New Token»
  </Step>

  <Step title="Скопируйте ключ">
    Скопируйте сгенерированный API-ключ (формат: `sk-***`) и храните его в безопасности
  </Step>
</Steps>

### Шаг 3: Настройте переменные окружения

<Warning>
  **Важная настройка**: `GOOGLE_GEMINI_BASE_URL` необходимо задать как `https://api.apiyi.com` без дополнительных путей (например, `/v1` или `/gemini`), иначе подключение завершится ошибкой.
</Warning>

<Tabs>
  <Tab title="Zsh (macOS/Linux)">
    ```bash theme={null}
    # Edit .zshrc file
    nano ~/.zshrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.zshrc
    ```
  </Tab>

  <Tab title="Bash (Linux)">
    ```bash theme={null}
    # Edit .bashrc file
    nano ~/.bashrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="PowerShell (Windows)">
    ```powershell theme={null}
    # Set environment variables
    $env:GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    $env:GEMINI_API_KEY="sk-your-api-key"

    # Save permanently (optional)
    [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
    [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
    ```
  </Tab>

  <Tab title="CMD (Windows)">
    ```cmd theme={null}
    # Temporary environment variables
    set GOOGLE_GEMINI_BASE_URL=https://api.apiyi.com
    set GEMINI_API_KEY=sk-your-api-key

    # Save permanently (requires admin)
    setx GOOGLE_GEMINI_BASE_URL "https://api.apiyi.com"
    setx GEMINI_API_KEY "sk-your-api-key"
    ```
  </Tab>
</Tabs>

### Шаг 4: Инициализация и тестирование

<Steps>
  <Step title="Запустите Gemini CLI">
    ```bash theme={null}
    gemini
    ```
  </Step>

  <Step title="Первичная аутентификация">
    В интерактивном интерфейсе введите:

    ```bash theme={null}
    /auth
    ```

    Выберите: **Gemini API-ключ (AI Studio)**
  </Step>

  <Step title="Проверьте подключение">
    ```bash theme={null}
    # Simple test
    gemini "Hello, test connection"

    # Programming-related test
    gemini "Explain how React Hooks work"
    gemini "Write a Python function to calculate Fibonacci sequence"
    ```
  </Step>
</Steps>

## Основные возможности

### Генерация кода

<Tabs>
  <Tab title="Генерация функций">
    ```bash theme={null}
    gemini "Write a quick sort algorithm in Python with detailed comments"
    ```

    **Пример вывода**:

    ```python theme={null}
    def quick_sort(arr):
        """
        Quick sort algorithm
        Time complexity: Average O(n log n), Worst O(n²)
        Space complexity: O(log n)
        """
        if len(arr) <= 1:
            return arr

        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]

        return quick_sort(left) + middle + quick_sort(right)
    ```
  </Tab>

  <Tab title="Создание каркаса проекта">
    ```bash theme={null}
    gemini "Create an Express.js REST API project structure with user auth and database config"
    ```
  </Tab>

  <Tab title="Модульные тесты">
    ```bash theme={null}
    gemini "Write Jest unit tests for this function:
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }"
    ```
  </Tab>
</Tabs>

### Ревью кода

```bash theme={null}
# Review code quality
gemini "Review the following code for performance issues and potential bugs:
[paste your code]
"

# Security audit
gemini "Check this code for security vulnerabilities, especially SQL injection and XSS"

# Best practices
gemini "What can be improved in this React component? Does it follow best practices?"
```

### Технические вопросы и ответы

```bash theme={null}
# Concept explanation
gemini "Explain JavaScript closures with practical use cases"

# Error troubleshooting
gemini "Why isn't my Promise being resolved correctly?"

# Performance optimization
gemini "How to optimize React component rendering performance?"

# Architecture design
gemini "Compare microservices vs monolithic architecture"
```

### Генерация документации

```bash theme={null}
# Generate README
gemini "Generate a professional README.md for my Node.js library with installation, usage, and API docs"

# API documentation
gemini "Generate OpenAPI 3.0 spec documentation for this REST API endpoint"

# Code comments
gemini "Add detailed JSDoc comments to the following code"
```

## Интерактивные команды

В интерактивном режиме Gemini CLI вы можете использовать следующие команды:

| Команда  | Описание                       | Пример                        |
| -------- | ------------------------------ | ----------------------------- |
| `/auth`  | Повторная аутентификация       | `/auth`                       |
| `/model` | Переключить модель             | `/model gemini-3-pro-preview` |
| `/clear` | Очистить историю разговора     | `/clear`                      |
| `/help`  | Показать справочную информацию | `/help`                       |
| `/exit`  | Выйти из CLI                   | `/exit` или `Ctrl+C`          |
| `/save`  | Сохранить разговор в файл      | `/save conversation.txt`      |

<Tip>
  **Переключение моделей**: Используйте команду `/model`, чтобы переключаться между различными моделями Gemini, такими как `gemini-3-pro-preview`, `gemini-2.5-flash`, `gemini-2.5-pro` и т. д.
</Tip>

## Поддерживаемые модели

Через APIYI вы можете использовать новейшие модели Gemini:

### Серия Gemini 3 (Рекомендуется)

| Модель                            | Сценарий использования                              | Особенности                                                      |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| **gemini-3-pro-preview**          | Качественный код, сложное рассуждение               | 🏆 Максимальная производительность, #1 в таблице лидеров LMArena |
| **gemini-3-pro-preview-thinking** | Сверхсложное рассуждение, проектирование алгоритмов | 🧠 Вывод chain-of-thought, глубокое рассуждение                  |

### Серия Gemini 2.5

| Модель                    | Сценарий использования                | Особенности                               |
| ------------------------- | ------------------------------------- | ----------------------------------------- |
| **gemini-2.5-pro**        | Профессиональная генерация кода       | ⚡ Высокая производительность, контекст 1M |
| **gemini-2.5-flash**      | Быстрый отклик, ежедневная разработка | 🚀 Высокая скорость, низкая стоимость     |
| **gemini-2.5-flash-lite** | Легкие задачи, пакетные вызовы        | 💰 Сверхнизкая стоимость, частые вызовы   |

<Info>
  **Рекомендуемая конфигурация**:

  * Сложное программирование, проектирование архитектуры: `gemini-3-pro-preview`
  * Ежедневная генерация кода, Q\&A: `gemini-2.5-flash`
  * Пакетная обработка, быстрая итерация: `gemini-2.5-flash-lite`
</Info>

<Card title="Посмотреть полный список моделей" icon="list" href="/ru/api-capabilities/model-info">
  Посмотреть все модели Gemini, поддерживаемые APIYI, подробное сравнение тарификации и производительности
</Card>

## Расширенное использование

### Интеграция с VS Code

Используйте расширение Gemini CLI в VS Code:

```json theme={null}
{
  "gemini.apiKey": "sk-your-api-key",
  "gemini.baseUrl": "https://api.apiyi.com",
  "gemini.model": "gemini-3-pro-preview",
  "gemini.temperature": 0.7,
  "gemini.maxTokens": 4000
}
```

### Интеграция с GitHub Actions

Автоматизированный code review:

```yaml theme={null}
name: Gemini Code Review
on:
  pull_request:
    branches: [ main ]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Code Review
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          GOOGLE_GEMINI_BASE_URL: https://api.apiyi.com
        run: |
          gemini "Review this Pull Request for code quality, security, and performance:
          $(git diff origin/main...HEAD)"
```

### Пакетные скрипты

Создайте скрипты автоматизации:

```bash theme={null}
#!/bin/bash

# Batch code review
for file in src/**/*.js; do
  echo "Reviewing $file..."
  gemini "Review code quality of $file" < "$file"
done

# Generate project documentation
gemini "Generate technical documentation outline for the entire project" < README.md
```

## FAQ

<AccordionGroup>
  <Accordion title="Соединение не удалось или возникла ошибка аутентификации?">
    **Контрольный список**:

    1. **Проверьте переменные среды**:

       ```bash theme={null}
       echo $GOOGLE_GEMINI_BASE_URL
       echo $GEMINI_API_KEY
       ```

       Должно вывести:

       * `GOOGLE_GEMINI_BASE_URL`: `https://api.apiyi.com` (без /v1 или других путей)
       * `GEMINI_API_KEY`: Полный ключ, начинающийся с `sk-`

    2. **Перезагрузите переменные среды**:
       ```bash theme={null}
       source ~/.zshrc  # or source ~/.bashrc
       ```

    3. **Перезапустите терминал**: Полностью закройте и снова откройте терминал

    4. **Проверьте API-ключ**: Войдите в панель APIYI, чтобы подтвердить, что ключ действителен и на балансе достаточно средств
  </Accordion>

  <Accordion title="Как переключаться между моделями Gemini?">
    Используйте команду `/model` в интерактивном режиме:

    ```bash theme={null}
    /model gemini-3-pro-preview
    /model gemini-3-pro-preview-thinking
    /model gemini-2.5-flash
    ```

    Или укажите напрямую в команде:

    ```bash theme={null}
    gemini --model gemini-3-pro-preview "your question"
    gemini --model gemini-2.5-flash "quick test"
    ```
  </Accordion>

  <Accordion title="Как сохранить историю разговора?">
    **Способ 1**: Используйте команду `/save`

    ```bash theme={null}
    /save conversation-2025-01-01.txt
    ```

    **Способ 2**: Перенаправьте вывод

    ```bash theme={null}
    gemini "your question" > output.txt
    gemini "your question" | tee output.txt  # Display and save
    ```

    **Способ 3**: Используйте управление сессиями

    ```bash theme={null}
    gemini --session my-project "continue previous discussion"
    ```
  </Accordion>

  <Accordion title="Версия Node.js не соответствует требованиям?">
    **Рекомендуется: используйте nvm для управления версиями Node.js**:

    ```bash theme={null}
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Install Node.js 18+
    nvm install 18
    nvm use 18
    nvm alias default 18

    # Verify version
    node --version
    ```
  </Accordion>

  <Accordion title="Почему ответ медленный?">
    **Возможные причины и решения**:

    1. **Проблемы с сетью**: APIYI предоставляет оптимизированные внутренние узлы, обычно это быстро
    2. **Выбор модели**: Используйте `gemini-2.5-flash` или `gemini-2.5-flash-lite` для максимально быстрого ответа
    3. **Лимит token**: Сократите сложность одного запроса
    4. **Параллельные запросы**: Не отправляйте слишком много запросов одновременно

    **Проверьте скорость соединения**:

    ```bash theme={null}
    time gemini --model gemini-2.5-flash "Hello"
    ```
  </Accordion>

  <Accordion title="Как использовать в Windows?">
    **Рекомендуется: используйте PowerShell**:

    1. Установите Node.js (скачайте установщик с официального сайта)
    2. Запустите PowerShell от имени администратора
    3. Установите переменные среды:
       ```powershell theme={null}
       [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
       [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
       ```
    4. Перезапустите PowerShell
    5. Установите и используйте Gemini CLI

    **Или используйте WSL** (Windows Subsystem for Linux) для более удобной работы.
  </Accordion>
</AccordionGroup>

## Лучшие практики

### Оптимизация промпта

<CardGroup cols={2}>
  <Card title="Будьте конкретны" icon="target">
    ❌ "Optimize this code"

    ✅ "Optimize this code for performance, focusing on loop efficiency and memory usage"
  </Card>

  <Card title="Давайте контекст" icon="book">
    ❌ "What's wrong with this function?"

    ✅ "This is a user login function encountering async errors, help me find the issue"
  </Card>

  <Card title="Пошагово" icon="list-ordered">
    ❌ "Help me complete the entire project"

    ✅ "Step 1: Design database models; Step 2: Create API routes; Step 3: ..."
  </Card>

  <Card title="Запрашивайте примеры" icon="code">
    ❌ "Explain closures"

    ✅ "Explain JavaScript closures with 3 practical use cases and code examples"
  </Card>
</CardGroup>

### Рекомендации по рабочему процессу

<Steps>
  <Step title="Определите проблему">
    Четко опишите проблему, которую нужно решить, или функцию, которую нужно реализовать
  </Step>

  <Step title="Получите решение">
    Используйте Gemini CLI для генерации начального решения или кода
  </Step>

  <Step title="Проверьте и оптимизируйте">
    Попросите ИИ проверить собственный код и найти потенциальные проблемы
  </Step>

  <Step title="Итеративно улучшайте">
    Постепенно оптимизируйте на основе обратной связи, пока не будут выполнены требования
  </Step>

  <Step title="Добавьте документацию">
    Сгенерируйте необходимые комментарии и документацию
  </Step>
</Steps>

## Цены

Стоимость использования моделей Gemini через APIYI зависит от выбранной вами модели и объема использования.

<Card title="Посмотреть подробные цены" icon="dollar-sign" href="/ru/api-capabilities/model-info">
  Посмотрите подробные цены и сравнение экономической эффективности для всех моделей Gemini
</Card>

<Info>
  APIYI предлагает бонусы за пополнение: чем больше вы пополняете баланс, тем выше бонус (10%-20%). При первом пополнении предоставляется дополнительный бонус. Посмотрите [подробности акции по пополнению](/ru/faq/recharge-promotions).
</Info>

## Связанные ресурсы

* [Официальная документация Gemini CLI](https://ai.google.dev/gemini-api/docs/cli)
* [Краткое руководство по APIYI](/ru/getting-started)
* [Рекомендации по моделям и тарификация](/ru/api-capabilities/model-info)
* [Акции на пополнение](/ru/faq/recharge-promotions)
* [Руководство по API](/ru/api-manual)

## Получить помощь

<CardGroup cols={2}>
  <Card title="Корпоративный WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="QR-код корпоративного WeChat" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Отсканируйте QR-код или [Нажмите, чтобы связаться со службой поддержки](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Техническая консультация, помощь по использованию
  </Card>

  <Card title="Запрос по email" icon="mail">
    **Служба поддержки**: [support@apiyi.com](mailto:support@apiyi.com)

    **Бизнес**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **Быстрый старт**: Следуйте разделу «Быстрый старт» выше, чтобы завершить настройку и начать использовать Gemini CLI за 5 минут!
</Tip>
