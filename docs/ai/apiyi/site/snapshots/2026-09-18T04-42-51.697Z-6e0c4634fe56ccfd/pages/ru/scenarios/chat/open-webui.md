> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Open WebUI

> Руководство по интеграции многофункционального self-hosted AI-интерфейса

Open WebUI — это богатая функциями саморазворачиваемая AI-платформа, поддерживающая полностью автономную работу без подключения к сети. Через APIYI вы можете интегрировать различные основные large language models в Open WebUI.

## Быстрое развертывание

### Быстрый старт с Docker

```bash theme={null}
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Развертывание с Docker Compose

```yaml theme={null}
version: '3.6'

services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    volumes:
      - open-webui:/app/backend/data
    environment:
      - OPENAI_API_BASE_URL=https://api.apiyi.com
      - OPENAI_API_KEY=Your APIYI key
    restart: unless-stopped

volumes:
  open-webui:
```

## Настройка APIYI

### Способ 1: Настройка через переменные окружения

Задайте переменные окружения во время развертывания:

```bash theme={null}
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL=https://api.apiyi.com \
  -e OPENAI_API_KEY=Your APIYI key \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

### Способ 2: Настройка через интерфейс

1. Откройте административный интерфейс Open WebUI
2. Перейдите в **Настройки** > **Подключения**
3. Настройте в разделе **OpenAI API**:
   * **Базовый URL API**: `https://api.apiyi.com/v1`
   * **Ключ API**: Введите ваш ключ APIYI
4. Нажмите кнопку сохранения конфигурации

<Info>
  **Ключевые моменты настройки**

  * В URL базы API должен быть указан суффикс `/v1`
  * Ключ API можно получить в [консоли APIYI](https://api.apiyi.com)
  * Рекомендуется использовать метод с переменными окружения для более удобного управления и обновления
</Info>

## Поддерживаемые модели

Open WebUI поддерживает более 400 популярных AI-моделей через APIYI.

<Card title="Посмотрите модели, которые мы рекомендуем прямо сейчас" icon="star" href="/ru/api-capabilities/model-info">
  Последние рекомендации по моделям, сравнения производительности и руководство по сценариям использования — охватывающие написание текстов, программирование, быстрые ответы, генерацию изображений, генерацию видео и многое другое.
</Card>

<Info>
  **Почему мы не перечисляем здесь конкретные модели?**

  AI-модели обновляются очень быстро. Чтобы вы всегда получали точные рекомендации, мы ведем список моделей, данные о производительности и рекомендации по использованию в одном месте: на странице [Рекомендации по моделям](/ru/api-capabilities/model-info).
</Info>

## Основные возможности

### RAG (генерация с дополненным извлечением)

Open WebUI поддерживает загрузку документов и функции базы знаний:

1. **Загрузка документов**
   * Поддерживает PDF, TXT, DOCX и другие форматы
   * Автоматическое хранение векторизованных данных
   * Поддерживает многоязычные документы

2. **Управление базой знаний**
   * Создание специализированных баз знаний
   * Классификация и тегирование документов
   * Интеллектуальное сопоставление при извлечении

### API, совместимый с OpenAI

Open WebUI предоставляет полный API, совместимый с OpenAI:

```bash theme={null}
# Chat completion
curl -X POST "http://localhost:3000/api/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer Your APIYI key" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### Интеграция инструментов

Поддерживаются внешние инструменты и плагины:

* Поиск в вебе
* Выполнение кода
* Генерация изображений
* Обработка документов

## Расширенная настройка

### Настройка нескольких моделей

Настройте несколько источников моделей в `docker-compose.yml`:

```yaml theme={null}
environment:
  - OPENAI_API_BASE_URL=https://api.apiyi.com
  - OPENAI_API_KEY=Your APIYI key
  - ENABLE_OPENAI_API=true
  - ENABLE_OLLAMA_API=false
```

### Управление правами пользователей

```yaml theme={null}
environment:
  - ENABLE_SIGNUP=false
  - DEFAULT_USER_ROLE=user
  - WEBHOOK_URL=Your webhook address
```

### Сохранение данных

```yaml theme={null}
volumes:
  - open-webui:/app/backend/data
  - ./uploads:/app/backend/data/uploads
  - ./vector_db:/app/backend/data/vector_db
```

## Примеры интеграции API

### Интеграция Python

```python theme={null}
import requests

# Open WebUI API endpoint
api_url = "http://localhost:3000/api/chat/completions"

# Request configuration
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer Your APIYI key"
}

data = {
    "model": "gpt-4-turbo",
    "messages": [
        {"role": "user", "content": "Explain the basic principles of quantum computing"}
    ],
    "stream": False
}

# Send request
response = requests.post(api_url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
```

### Интеграция JavaScript

```javascript theme={null}
const apiUrl = 'http://localhost:3000/api/chat/completions';

const requestData = {
  model: 'gpt-4-turbo',
  messages: [
    { role: 'user', content: 'Write a simple Python function' }
  ]
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer Your APIYI key'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  console.log(data.choices[0].message.content);
});
```

## Устранение неполадок

### Частые проблемы

**Соединение не удалось**

* Проверьте, правильно ли указан API Base URL: `https://api.apiyi.com/v1`
* Убедитесь в действительности API Key
* Проверьте настройки firewall

**Модель недоступна**

* Проверьте баланс аккаунта
* Убедитесь, что модель входит в область обслуживания
* Проверьте статус сервиса APIYI

**Загрузка не удалась**

* Проверьте поддержку формата файла
* Убедитесь, что доступно достаточно места для хранения
* Проверьте ограничения на размер файла

### Отладка логов

Включите режим отладки:

```bash theme={null}
docker logs -f open-webui
```

Просмотрите подробные логи:

```yaml theme={null}
environment:
  - LOG_LEVEL=DEBUG
  - WEBUI_DEBUG=true
```

## Лучшие практики

### Оптимизация производительности

1. **Выбор модели**
   * Выберите модель, соответствующую сложности задачи
   * См. [страницу рекомендаций по моделям](/ru/api-capabilities/model-info) для актуальных рекомендаций по выбору модели

2. **Стратегия кэширования**
   * Включите кэширование беседы
   * Установите разумное время истечения кэша
   * Регулярно очищайте неиспользуемый кэш

3. **Управление ресурсами**
   * Отслеживайте использование памяти
   * Установите разумные лимиты параллельных запросов
   * Регулярно создавайте резервные копии пользовательских данных

### Настройка безопасности

```yaml theme={null}
environment:
  - ENABLE_ADMIN_EXPORT=false
  - ENABLE_ADMIN_CHAT_ACCESS=false
  - JWT_EXPIRES_IN=7d
```

### Оповещения мониторинга

Интегрируйте систему мониторинга:

```yaml theme={null}
environment:
  - ENABLE_WEBHOOKS=true
  - WEBHOOK_URL=https://your-monitoring-url
```

Нужна дополнительная помощь? Пожалуйста, ознакомьтесь с [официальной документацией Open WebUI](https://docs.openwebui.com) или посетите [официальный сайт APIYI](https://api.apiyi.com).
