> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> Интеграция ChatGPT в веб-приложение с развертыванием в один клик

ChatGPT Next Web — это тщательно продуманный веб-клиент ChatGPT, поддерживающий развертывание в один клик и несколько моделей ИИ.

## Быстрое развертывание

### Развертывание в Vercel в один клик

1. Нажмите [Развернуть в один клик](https://vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web)
2. Задайте переменные окружения:
   * `OPENAI_API_KEY`: Ваш ключ APIYI
   * `BASE_URL`: `https://api.apiyi.com`
3. Завершите развертывание

### Развертывание с Docker

```bash theme={null}
docker run -d \
  --name chatgpt-next-web \
  -p 3000:3000 \
  -e OPENAI_API_KEY="Your APIYI key" \
  -e BASE_URL="https://api.apiyi.com" \
  yidadaa/chatgpt-next-web
```

## Инструкции по конфигурации

### Базовая конфигурация

Настройте на странице настроек:

* **API Key**: Введите ключ APIYI
* **API Address**: `https://api.apiyi.com`

### Модели, не относящиеся к OpenAI

Для моделей вроде Claude, Gemini:

1. Добавьте в «Custom Models»
2. Формат: `+model-name@OpenAI`
3. Пример: `+claude-3-opus-20240229@OpenAI`

## Основные возможности

### Предустановленные prompt

Встроенные богатые шаблоны prompt

### Функция маски

Создавайте предустановленные роли ИИ

### Экспорт беседы

Поддерживаются форматы Markdown, изображение, PDF

### Контроль доступа

Установите защиту паролем для вашего приложения

## Переменные окружения

```bash theme={null}
# API Configuration
OPENAI_API_KEY=Your APIYI key
BASE_URL=https://api.apiyi.com

# Access Control
CODE=Your access password

# Model Configuration
DEFAULT_MODEL=gpt-3.5-turbo
CUSTOM_MODELS=+claude-3-opus-20240229@OpenAI
```

## Советы по использованию

### Стратегия выбора модели

| Тип задачи            | Рекомендуемая модель | Причина                                   |
| --------------------- | -------------------- | ----------------------------------------- |
| Ежедневное общение    | GPT-3.5-Turbo        | Быстро и экономично                       |
| Сложное рассуждение   | GPT-4                | Высокая точность                          |
| Творческое письмо     | Claude 3             | Высокая креативность                      |
| Программирование кода | GPT-4                | Сильные способности к логическому анализу |

### Оптимизация промпта

```markdown theme={null}
# Role Setting
You are an experienced [specific role]

# Task Description
Please help me [specific task]

# Output Requirements
- Requirement 1
- Requirement 2
```

## Распространенные проблемы

### Модели не отображаются

Убедитесь, что используется версия v2.13.0+

### Не удалось подключиться

Проверьте адрес API: `https://api.apiyi.com`

### Ответ прерван

Проверьте баланс аккаунта и сетевое подключение

## Обновление и обслуживание

### Обновление Vercel

Синхронизируйте fork в GitHub, Vercel автоматически выполнит повторное развертывание

### Обновление Docker

```bash theme={null}
docker pull yidadaa/chatgpt-next-web
docker stop chatgpt-next-web
docker rm chatgpt-next-web
# Re-run container
```
