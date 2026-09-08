> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Roo Code (VS Code)

> Ваша AI-команда разработчиков в VS Code - умный помощник по программированию с многоимодальной конфигурацией

## Обзор

Roo Code — мощный AI-помощник для программирования в VS Code, который предоставляет вам полноценную AI-команду для разработки. Его отличительная особенность — **многорежимная конфигурация**, позволяющая использовать разные AI-модели для разных задач разработки и тем самым достигать максимальной эффективности.

<Card>
  **Основные преимущества**

  * 🎯 **Многорежимная конфигурация**: назначайте специализированные модели для архитектуры, кодирования, отладки и других задач
  * 🤖 **Интеллект агента**: автоматически планируйте и выполняйте сложные задачи разработки
  * 🔄 **Операции с несколькими файлами**: понимайте структуру проекта и интеллектуально изменяйте несколько файлов
  * 💰 **Полностью бесплатно**: открытый исходный код и бесплатно, оплачивается только использование AI-модели
  * 🌐 **Широкая совместимость**: поддерживает более 400 основных AI-моделей
  * 🔌 **Поддержка MCP**: подключайте внешние инструменты через Model Context Protocol
</Card>

<Info>
  **Roo Code против Cline**

  Roo Code — это форк Cline, который сохраняет основную функциональность Cline и добавляет уникальную систему многорежимной конфигурации. Если вам нужно использовать разные модели для разных этапов разработки, Roo Code — лучший выбор.
</Info>

## Статус поддержки и поддержка эндпоинта Responses

### Официально прекращено (2026)

Команда Roo Code выпустила свой **финальный релиз** и объявила о переходе на Roomote, свою облачную платформу agent: расширение будет работать бесконечно, но **больше не будет исправлений ошибок, новых функций или обновлений моделей**. Команда рекомендует форк `ZooCode`, поддерживаемый сообществом, или [Cline](/ru/scenarios/programming/cline) — проект, от которого Roo Code изначально был форкнут, — всем, кто хочет остаться в формате расширения.

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-final-version-notice.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=79f576a16c788e343200e409e1cfecf2" alt="Окончательное уведомление о релизе Roo Code: расширение продолжит работать бесконечно, но больше не будет получать исправления ошибок, новые функции или обновления моделей; рекомендуются ZooCode и Cline" style={{maxWidth: "560px"}} width="860" height="706" data-path="images/roo-code-final-version-notice.png" />

<Warning>
  Практический эффект заморозки: список предустановленных моделей у провайдера "OpenAI" останавливается на `gpt-5.4` — gpt-5.5 / gpt-5.6 и более новые модели никогда не появляются в выпадающем списке. Существующая функциональность не затрагивается.
</Warning>

### Одно из немногих IDE-плагинов, которые поддерживают /v1/responses (подтверждено)

Провайдер "OpenAI" в Roo Code использует эндпоинт `/v1/responses` (в отличие от провайдера "OpenAI Compatible", который использует `/v1/chat/completions`) и принимает настраиваемый Base URL. Это делает его одним из немногих плагинов, которые могут запускать **GPT-5.4 "рассуждение плюс вызов tools"** внутри IDE — в chat/completions OpenAI не позволяет использовать tools и рассуждение вместе для GPT-5.4 и более поздних моделей (см. [Нативное руководство по Responses API](/ru/api-capabilities/openai/native)), тогда как у responses такого ограничения нет.

Настройка: выберите **OpenAI** в качестве API Provider (не OpenAI Compatible), задайте Base URL как `https://api.apiyi.com/v1` и выберите `gpt-5.4` в качестве модели.

### Установка в Trae и других IDE семейства VS Code

IDE на базе VS Code, такие как Trae, тоже могут установить плагин Roo Code. Мы проверили, что Roo Code, установленный внутри Trae и настроенный с провайдером OpenAI, как указано выше, нормально выполняет вызовы tools и задачи через эндпоинт Responses — фактически добавляя канал Responses в [Trae](/ru/scenarios/programming/trae), чьи собственные custom models поддерживают только chat/completions (с тем же `gpt-5.4` пределом по моделям).

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-in-trae-responses-test.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=19bcff9afd8acdb6f3e30b631b2da7a1" alt="Подтверждённый скриншот работы Roo Code как плагина внутри IDE Trae, выполняющего задачу через эндпоинт Responses" style={{maxWidth: "480px"}} width="800" height="1548" data-path="images/roo-code-in-trae-responses-test.png" />

## Быстрая установка

### Способ 1: VS Code Marketplace (Рекомендуется)

<Steps>
  <Step title="Откройте Marketplace расширений">
    Нажмите `Ctrl+Shift+X` (Windows/Linux) или `Cmd+Shift+X` (macOS) в VS Code
  </Step>

  <Step title="Найдите и установите">
    Найдите «Roo Code» и нажмите Install

    **ID расширения**: `RooVeterinaryInc.roo-cline`
  </Step>

  <Step title="Откройте плагин">
    После установки нажмите на значок Roo Code в левой панели активности
  </Step>
</Steps>

### Способ 2: Open VSX Registry

Посетите [Open VSX Registry](https://open-vsx.org/) и найдите Roo Code, чтобы установить его.

## Настройка APIYI

### Базовая настройка

<Steps>
  <Step title="Откройте настройки">
    Нажмите на **значок шестерёнки** (кнопка настроек) в боковой панели Roo Code
  </Step>

  <Step title="Выберите поставщика API">
    Выберите **OpenAI-совместимый** в раскрывающемся списке API Provider
  </Step>

  <Step title="Настройте параметры подключения">
    **Базовый URL**: `https://api.apiyi.com/v1`

    **Ключ API**: Ваш ключ APIYI (формат: `sk-***`)

    **Имя модели**: Введите имя модели, которую хотите использовать
  </Step>

  <Step title="Сохраните конфигурацию">
    Нажмите «Сохранить», и Roo Code автоматически проверит подключение
  </Step>
</Steps>

<Warning>
  **Требования к настройке базового URL**:

  * Должен использоваться `https://api.apiyi.com/v1` (включает путь `/v1`)
  * Не используйте `https://api.apiyi.com` (отсутствие `/v1` приведёт к сбою подключения)
</Warning>

### Получите ключ APIYI

<Steps>
  <Step title="Перейдите в панель APIYI">
    Войдите в `api.apiyi.com`
  </Step>

  <Step title="Создайте ключ API">
    Перейдите на страницу «Управление token» (`api.apiyi.com/token`) и нажмите «Создать новый token»
  </Step>

  <Step title="Скопируйте ключ">
    Скопируйте сгенерированный ключ API (формат: `sk-***`) и вставьте его в конфигурацию Roo Code
  </Step>
</Steps>

## Многорежимная конфигурация (основная возможность)

Уникальная возможность Roo Code — назначать разные AI-модели для разных режимов разработки для специализированного разделения труда.

### Пять режимов разработки

<Tabs>
  <Tab title="Architect Mode">
    **Режим архитектуры** - Для проектирования системы и архитектурного планирования

    **Рекомендуемые модели**:

    * Claude Sonnet (сильное рассуждение, отлично подходит для проектирования архитектуры)
    * GPT-4o (всесторонние технические знания)
    * DeepSeek V3 (глубокое мышление, экономически выгодный вариант)

    **Типичные задачи**:

    ```text theme={null}
    Design a microservices architecture for an e-commerce system:
    - User service
    - Product service
    - Order service
    - Payment service
    Deploy using Docker + Kubernetes
    ```
  </Tab>

  <Tab title="Code Mode">
    **Режим кодирования** - Для непосредственной генерации и написания кода

    **Рекомендуемые модели**:

    * Claude Sonnet (высокое качество кода)
    * DeepSeek Coder (профессиональная модель для программирования)
    * Qwen Coder (комментарии, удобные для китайскоязычных пользователей)

    **Типичные задачи**:

    ```text theme={null}
    Implement user authentication module:
    - JWT token generation and validation
    - Password encryption (bcrypt)
    - Login/registration endpoints
    - Permission middleware
    ```
  </Tab>

  <Tab title="Ask Mode">
    **Режим вопросов и ответов** - Для технических консультаций и планирования реализации

    **Рекомендуемые модели**:

    * GPT-4o-mini (быстрый отклик, низкая стоимость)
    * Gemini Flash (высокая скорость)
    * DeepSeek Chat (экономичный вариант)

    **Типичные задачи**:

    ```text theme={null}
    Q: How to optimize React component rendering performance?
    Q: What's the difference between Redux and Zustand?
    Q: How to handle memory leaks in Node.js?
    ```
  </Tab>

  <Tab title="Debug Mode">
    **Режим отладки** - Для устранения ошибок и исправления багов

    **Рекомендуемые модели**:

    * GPT-4o (понимает сложные ошибки)
    * Claude Sonnet (сильный анализ кода)
    * DeepSeek V3 (глубокий анализ)

    **Типичные задачи**:

    ```text theme={null}
    Debug this error:
    TypeError: Cannot read property 'map' of undefined

    Help me find the memory leak in this code
    Analyze why this async function isn't executing correctly
    ```
  </Tab>

  <Tab title="Orchestrator Mode">
    **Режим оркестрации** - Для декомпозиции и координации сложных задач

    **Рекомендуемые модели**:

    * Claude Opus (справляется со сложными задачами)
    * GPT-4o (сильное глобальное планирование)
    * DeepSeek V3 (логическое рассуждение)

    **Типичные задачи**:

    ```text theme={null}
    Migrate entire project from JavaScript to TypeScript:
    1. Analyze existing code structure
    2. Create type definition files
    3. Gradually convert modules
    4. Update configuration files
    5. Run tests for validation
    ```
  </Tab>
</Tabs>

### Настройка многорежимности

<Steps>
  <Step title="Open Mode Settings">
    Найдите раздел **Mode Configuration** в настройках Roo Code
  </Step>

  <Step title="Выберите модель для каждого режима">
    Настройте отдельно для каждого режима:

    * API Provider
    * Название модели
    * Temperature (параметр креативности)
    * Max Tokens
  </Step>

  <Step title="Переключайте режимы">
    В интерфейсе Roo Code используйте переключатель режимов, чтобы сменить текущий режим
  </Step>
</Steps>

<Tip>
  **Рекомендуемая стратегия настройки**:

  * **Architect/Orchestrator** → Используйте модели высокого качества (Claude Sonnet, GPT-4o)
  * **Code** → Используйте профессиональные модели для программирования (DeepSeek Coder, Claude Sonnet)
  * **Ask** → Используйте быстрые и экономичные модели (GPT-4o-mini, Gemini Flash)
  * **Debug** → Используйте модели с сильными аналитическими возможностями (Claude Sonnet, GPT-4o)
</Tip>

## Рекомендуемые модели

Roo Code поддерживает более 400 основных моделей ИИ через APIYI, включая OpenAI, Google Gemini, Claude, DeepSeek и отечественные модели.

<Card title="Посмотреть рекомендации по моделям для программирования" icon="code" href="/ru/api-capabilities/model-info">
  Ознакомьтесь с последними рекомендациями по моделям для программирования, сравнениями производительности и советами по использованию. Включает подробные классификации, такие как модели с лучшей производительностью, экономичные модели, модели с усиленным рассуждением и другие.
</Card>

<Info>
  **Почему здесь не перечислены конкретные модели?**

  Модели ИИ обновляются и итеративно развиваются очень быстро. Чтобы вы получали самые точные рекомендации по моделям, мы поддерживаем актуальный список моделей, данные о производительности и советы по использованию на [странице рекомендаций по моделям](/ru/api-capabilities/model-info).
</Info>

## Основные возможности

### Режим интеллектуального агента

Самая мощная возможность Roo Code — это **Режим агента**, в котором AI может автономно планировать и выполнять сложные задачи:

```text theme={null}
Task: Create a complete user authentication system

Roo Code will automatically:
1. Analyze requirements and create implementation plan
2. Create necessary file and directory structure
3. Write backend API code
4. Create frontend login/registration pages
5. Add error handling and validation
6. Generate unit tests
7. Update relevant documentation
```

### Умное редактирование нескольких файлов

Понимает структуру проекта и автоматически изменяет несколько связанных файлов:

```text theme={null}
"Convert all API calls from axios to fetch and update error handling logic"

Roo Code will:
- Find all files using axios
- Convert to fetch API
- Unify error handling patterns
- Update type definitions (if using TypeScript)
```

### Генерация кода

<CodeGroup>
  ```python Python theme={null}
  # Input description
  """
  Create a FastAPI endpoint for user registration:
  - Accept email and password
  - Validate email format
  - Encrypt and store password
  - Return JWT token
  """

  # Roo Code auto-generates complete implementation
  from fastapi import APIRouter, HTTPException
  from passlib.hash import bcrypt
  import jwt
  # ... complete code implementation
  ```

  ```javascript JavaScript theme={null}
  // Input requirement
  // Create a React Hook for form state management
  // Support validation, error messages, submit handling

  // Roo Code generates
  import { useState, useCallback } from 'react';

  export function useForm(initialValues, validationRules) {
    // ... complete Hook implementation
  }
  ```

  ```go Go theme={null}
  // Requirement: Implement a concurrent-safe cache
  // Support Set, Get, Delete, clear expired data

  // Roo Code generates complete Go code
  package cache

  import (
      "sync"
      "time"
  )

  type Cache struct {
      // ... complete implementation
  }
  ```
</CodeGroup>

### Ревью и оптимизация кода

```text theme={null}
Review this PR, focusing on:
- Code standards
- Performance issues
- Security vulnerabilities
- Potential bugs
- Readability improvements
```

Roo Code предоставит подробный отчет о ревью с рекомендациями по улучшению.

### Умный рефакторинг

```text theme={null}
Refactor this function, requirements:
- Improve readability
- Optimize performance
- Add error handling
- Improve type safety
```

### Генерация тестов

```text theme={null}
Generate comprehensive unit tests for UserService class, including:
- Normal flow tests
- Boundary condition tests
- Error handling tests
- Mock external dependencies
```

## Частые команды

Roo Code предоставляет набор команд для палитры команд:

| Команда                     | Сочетание клавиш | Функция                      |
| --------------------------- | ---------------- | ---------------------------- |
| Roo Code: Новая задача      | `Ctrl+Shift+L`   | Начать новую задачу          |
| Roo Code: Продолжить        | `Enter`          | Продолжить текущую задачу    |
| Roo Code: Одобрить          | `Ctrl+Enter`     | Одобрить изменения AI        |
| Roo Code: Отклонить         | `Ctrl+Backspace` | Отклонить изменения          |
| Roo Code: Очистить историю  | -                | Очистить историю чата        |
| Roo Code: Переключить режим | -                | Переключить режим разработки |

<Tip>
  **Совет по сочетаниям клавиш**: Вы можете настроить сочетания клавиш Roo Code в настройках сочетаний клавиш VS Code.
</Tip>

## Расширенные возможности

### Профили настройки API

Создавайте разные профили настройки API для разных проектов или команд:

```json theme={null}
{
  "roocode.apiProfiles": {
    "production": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-prod-key",
      "defaultModel": "claude-sonnet-4"
    },
    "development": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-dev-key",
      "defaultModel": "deepseek-chat"
    }
  }
}
```

### Индексация кодовой базы

Roo Code автоматически индексирует вашу кодовую базу, чтобы понимать структуру проекта:

* Автоматически обнаруживать связи между файлами
* Понимать зависимости кода
* Интеллектуальное понимание контекста
* Отслеживание ссылок между файлами

### Интеграция MCP

Подключайте внешние инструменты через Model Context Protocol:

* Запросы к базе данных
* Вызовы API
* Операции с файловой системой
* Операции Git
* Интеграция пользовательских инструментов

### Пользовательские шаблоны prompt

Настраивайте общие шаблоны prompt в настройках:

```json theme={null}
{
  "roocode.customTemplates": {
    "codeReview": "Detailed code review, focus on performance, security, maintainability",
    "optimize": "Optimize code performance and readability, add necessary comments",
    "test": "Generate comprehensive unit tests, cover edge cases",
    "refactor": "Refactor code following SOLID principles and design patterns"
  }
}
```

## Советы по использованию

### 1. Предоставляйте понятный контекст

<CardGroup cols={2}>
  <Card title="❌ Размытое описание" icon="x">
    "Оптимизируйте эту функцию"
  </Card>

  <Card title="✅ Понятное описание" icon="check">
    "Оптимизируйте производительность этой функции, сосредоточьтесь на эффективности циклов и использовании памяти, добавьте уместные комментарии, поясняющие подход к оптимизации"
  </Card>
</CardGroup>

### 2. Выполняйте сложные задачи пошагово

Для сложных задач рекомендуется разбивать их на несколько шагов:

<Steps>
  <Step title="Шаг 1: Проектирование архитектуры">
    Используйте **Architect Mode** для проектирования общей архитектуры
  </Step>

  <Step title="Шаг 2: Реализация модулей">
    Переключитесь в **Code Mode** для реализации модулей
  </Step>

  <Step title="Шаг 3: Отладка и оптимизация">
    Используйте **Debug Mode** для поиска и устранения проблем
  </Step>

  <Step title="Шаг 4: Интеграционное тестирование">
    Используйте **Orchestrator Mode** для координации интеграции
  </Step>
</Steps>

### 3. Используйте переключение режимов

Переключайтесь в наиболее подходящий режим для разных типов задач:

* Нужна разработка архитектуры? → Architect Mode
* Написание реализации кода? → Code Mode
* Быстрая консультация? → Ask Mode
* Обнаружена ошибка? → Debug Mode
* Сложный рефакторинг? → Orchestrator Mode

### 4. Проверяйте и утверждайте изменения

<Warning>
  **Важная привычка**:

  * Всегда проверяйте код, сгенерированный AI, перед утверждением
  * Понимайте назначение каждого изменения
  * Тестируйте изменённую функциональность
  * Поддерживайте согласованность кодовой базы
</Warning>

## Вопросы и ответы

<AccordionGroup>
  <Accordion title="В чем разница между Roo Code и Cline?">
    **Основные различия**:

    1. **Многорежимная конфигурация**: ключевая функция Roo Code, не поддерживается Cline
    2. **Кодовая база**: Roo Code — форк Cline, но развивается независимо
    3. **Частота обновлений**: Roo Code обновляется чаще, с более быстрой итерацией функций
    4. **Сообщество**: у обоих есть активные сообщества, но с разным фокусом

    **Как выбрать**:

    * Нужна многорежимность? → Roo Code
    * Нужна стабильность? → Cline
    * Оба варианта можно попробовать бесплатно, выберите то, что лучше вам подходит
  </Accordion>

  <Accordion title="Почему не удается подключиться или модели не работают?">
    **Распространенные причины и решения**:

    1. **Ошибка Base URL**:
       * ✅ Правильно: `https://api.apiyi.com/v1`
       * ❌ Неправильно: `https://api.apiyi.com`

    2. **Недействительный API Key**:
       * Проверьте, что key скопирован правильно (обратите внимание на пробелы в начале и конце)
       * Подтвердите, что на счету достаточно баланса
       * Проверьте, что статус key — «Включен»

    3. **Неверное имя модели**:
       * Убедитесь, что используется правильное имя модели
       * См. [Список моделей](/ru/api-capabilities/model-info)

    4. **Проблемы с сетью**:
       * Проверьте сетевое подключение
       * Попробуйте перезапустить VS Code
  </Accordion>

  <Accordion title="Как настроить разные модели для разных режимов?">
    **Шаги настройки**:

    1. Откройте настройки Roo Code (значок шестеренки)
    2. Найдите раздел **Mode Configuration**
    3. Настройте отдельно для каждого режима:
       * Architect Mode → `claude-sonnet-4`
       * Code Mode → `deepseek-coder`
       * Ask Mode → `gpt-4o-mini`
       * Debug Mode → `claude-sonnet-4`
       * Orchestrator Mode → `gpt-4o`
    4. Сохраните конфигурацию

    При использовании переключайтесь через селектор режимов.
  </Accordion>

  <Accordion title="Будет ли Roo Code автоматически изменять мой код?">
    **Автоматического изменения нет**, требуется ваше подтверждение:

    1. Roo Code сначала показывает предложенные изменения
    2. Вы можете:
       * Просмотреть Diff (сравнение)
       * Одобрить (Apply) изменения
       * Отклонить изменения
       * Изменить, затем одобрить
    3. Все изменения находятся под вашим контролем

    <Tip>
      Рекомендуем включить систему контроля версий (Git), чтобы вы могли в любой момент откатить неудовлетворительные изменения.
    </Tip>
  </Accordion>

  <Accordion title="Как снизить затраты на использование API?">
    **Стратегии экономии**:

    1. **Умный выбор моделей**:
       * Используйте более дешевые модели для простых задач (GPT-4o-mini, DeepSeek)
       * Используйте премиальные модели только для сложных задач (Claude Opus, GPT-4o)

    2. **Используйте многорежимную конфигурацию**:
       * Ask Mode → Используйте самые дешевые модели
       * Code/Debug Mode → Используйте профессиональные модели среднего уровня
       * Architect Mode → Используйте премиальные модели только при необходимости

    3. **Бонусы за пополнение**:
       * APIYI предлагает бонусы за пополнение (10%-20%)
       * См. [Акции на пополнение](/ru/faq/recharge-promotions)

    4. **Контролируйте длину контекста**:
       * Очистите ненужную историю чата
       * Сосредоточьтесь на текущей задаче, сократите нерелевантный контекст
  </Accordion>

  <Accordion title="Какие языки программирования поддерживает Roo Code?">
    **Почти все основные языки программирования**, включая, помимо прочего:

    * **Веб**: JavaScript, TypeScript, HTML, CSS, React, Vue, Angular
    * **Бэкенд**: Python, Java, Go, Rust, C++, C#, PHP, Ruby
    * **Мобильные**: Swift, Kotlin, Dart (Flutter), React Native
    * **Данные**: SQL, R, Julia
    * **Другое**: Shell, YAML, JSON, Markdown

    Эффективность зависит от:

    * Выбранной AI модели
    * Обучающих данных модели
    * Популярности языка
  </Accordion>
</AccordionGroup>

## Сравнение с другими инструментами

| Функция                                   | Roo Code | Cline   | Cursor     | GitHub Copilot    |
| ----------------------------------------- | -------- | ------- | ---------- | ----------------- |
| **Конфигурация нескольких режимов**       | ✅        | ❌       | ❌          | ❌                 |
| **Режим агента**                          | ✅        | ✅       | ❌          | ❌                 |
| **Редактирование нескольких файлов**      | ✅        | ✅       | Частично   | ❌                 |
| **Пользовательский API**                  | ✅        | ✅       | ✅          | ❌                 |
| **Бесплатно и с открытым исходным кодом** | ✅        | ✅       | ❌          | ❌                 |
| **Выбор модели**                          | 400+     | 400+    | Ограничено | Только для GitHub |
| **Кривая обучения**                       | Средняя  | Средняя | Низкая     | Низкая            |

<Tip>
  **Руководство по выбору**:

  * **Нужна конфигурация нескольких режимов** → Roo Code
  * **Нужна стабильность и зрелость** → Cline
  * **Нужна простота** → Cursor
  * **Глубокая интеграция с GitHub** → GitHub Copilot
</Tip>

## Тарифы

Плагин Roo Code **полностью бесплатный**. Вы платите только за расходы на использование AI models.

Стоимость использования AI models через APIYI зависит от выбранных вами моделей и объема использования.

<Card title="Посмотреть подробные тарифы" icon="dollar-sign" href="/ru/api-capabilities/model-info">
  Ознакомьтесь с подробными тарифами и сравнением экономической эффективности для всех моделей
</Card>

<Info>
  APIYI предлагает бонусы за пополнение: чем больше вы пополняете, тем выше бонус (10%-20%). При первом пополнении начисляется дополнительный бонус. Смотрите [Подробности акции пополнения](/ru/faq/recharge-promotions).
</Info>

## Связанные ресурсы

* [Официальный сайт Roo Code](https://roo-code.net/)
* [Официальная документация Roo Code](https://docs.roocode.com/)
* [Репозиторий GitHub](https://github.com/RooCodeInc/Roo-Code)
* [Магазин VS Code](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline)
* [APIYI: быстрый старт](/ru/getting-started)
* [Рекомендации по моделям и тарификация](/ru/api-capabilities/model-info)

## Получить помощь

<CardGroup cols={2}>
  <Card title="Корпоративный WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="QR-код Корпоративный WeChat" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Отсканируйте QR-код или [Нажмите, чтобы связаться со службой поддержки](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Проблемы с конфигурацией, руководство по использованию
  </Card>

  <Card title="Запрос по электронной почте" icon="mail">
    **Служба поддержки**: [support@apiyi.com](mailto:support@apiyi.com)

    **Коммерческие вопросы**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **Быстрый старт**: Следуйте разделам «Quick Installation» и «Configure APIYI» выше, чтобы начать использовать Roo Code для программирования с помощью AI за 5 минут!
</Tip>
