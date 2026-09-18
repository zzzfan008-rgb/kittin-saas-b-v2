> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API запроса баланса

> Получайте баланс аккаунта, квоту использования и количество запросов, чтобы обеспечить проактивный мониторинг баланса и оповещения

## Обзор API

API запроса баланса получает текущий расход квоты вашего аккаунта, включая общую квоту, использованную квоту, оставшийся баланс и количество запросов.

Этот API помогает вам легко отслеживать баланс аккаунта, обеспечивая заблаговременное и гибкое управление уведомлениями о балансе.

## Как получить Authorization Token

<Steps>
  <Step title="Открыть консоль">
    Перейдите на `api.apiyi.com/account/profile`, чтобы открыть страницу профиля
  </Step>

  <Step title="Найдите System Token">
    Найдите внизу страницы раздел "Параметры учетной записи - System Token"
  </Step>

  <Step title="Сгенерировать AccessToken">
    Введите пароль учетной записи, чтобы получить AccessToken, который можно использовать для последующих API-запросов
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="Получить System Token" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

## Информация об API

| Пункт              | Описание                              |
| ------------------ | ------------------------------------- |
| **URL API**        | `https://api.apiyi.com/api/user/self` |
| **Метод**          | `GET`                                 |
| **Аутентификация** | Заголовок Authorization               |
| **Формат ответа**  | JSON                                  |

## Сведения о запросе

### Заголовки запроса

| Имя заголовка   | Обязательно | Описание                                         |
| --------------- | ----------- | ------------------------------------------------ |
| `Authorization` | Да          | Токен доступа API, формат: строка прямого токена |
| `Accept`        | Нет         | Рекомендуется: `application/json`                |
| `Content-Type`  | Нет         | Рекомендуется: `application/json`                |

### Параметры запроса

<Info>
  Это GET-запрос и **не требует** никаких параметров тела запроса.
</Info>

## Детали ответа

### Пример успешного ответа

```json theme={null}
{
  "success": true,
  "message": null,
  "data": {
    "id": 19489,
    "username": "testnano",
    "display_name": "testnano",
    "role": 1,
    "status": 1,
    "email": "",
    "quota": 24997909,
    "used_quota": 10027091,
    "request_count": 339,
    "group": "ceshi",
    "aff_code": "ZM0H",
    "inviter_id": 0,
    "access_token": "...",
    "ModelFixedPrice": [...]
  }
}
```

### Ключевые поля ответа

| Имя поля               | Тип     | Описание                                                         |
| ---------------------- | ------- | ---------------------------------------------------------------- |
| `success`              | Boolean | Был ли запрос успешным                                           |
| `message`              | String  | Сообщение об ошибке (null при успехе)                            |
| `data.username`        | String  | Имя пользователя                                                 |
| `data.display_name`    | String  | Отображаемое имя                                                 |
| `data.quota`           | Integer | **Оставшаяся квота** (текущий доступный баланс в единицах квоты) |
| `data.used_quota`      | Integer | **Использованная квота** (в единицах квоты)                      |
| `data.request_count`   | Integer | **Общее количество запросов**                                    |
| `data.group`           | String  | Группа пользователя                                              |
| `data.ModelFixedPrice` | Array   | Список цен моделей (можно игнорировать)                          |

### Преобразование квоты

<Card title="Правило преобразования" icon="calculator">
  500,000 quota = \$1.00 USD
</Card>

**Формулы расчета:**

* Сумма в USD = quota ÷ 500,000
* Оставшаяся квота = quota (quota представляет текущий оставшийся баланс)
* Оставшиеся USD = quota ÷ 500,000

**Примеры:**

* `quota: 24997909` → \$49.99 USD (текущий оставшийся баланс)
* `used_quota: 10027091` → \$20.05 USD (использованная сумма)

## Ответы на ошибки

### HTTP 401 - Ошибка аутентификации

```json theme={null}
{
  "success": false,
  "message": "Unauthorized"
}
```

**Причина:** Authorization token недействителен или срок его действия истек

**Решение:** Проверьте и обновите ваш API token

### HTTP 403 - Доступ запрещен

```json theme={null}
{
  "success": false,
  "message": "Forbidden"
}
```

**Причина:** У текущего token нет разрешения на доступ к этому API

**Решение:** Обратитесь к администратору, чтобы проверить настройки разрешений

## Примеры кода

### Пример cURL

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **Важно:** Параметр `--compressed` обязателен, потому что API возвращает gzip-сжатое содержимое, иначе вы получите искажённый вывод.
</Warning>

**Быстрая проверка (замените YOUR\_TOKEN\_HERE):**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  Примечание: Параметр `-s` скрывает полосу прогресса, `--compressed` автоматически распаковывает gzip-ответ
</Info>

### Пример Python (Базовый)

```python theme={null}
import requests

# Configuration
url = "https://api.apiyi.com/api/user/self"
authorization = "YOUR_TOKEN_HERE"  # Replace with your token

# Request headers
headers = {
    'Accept': 'application/json',
    'Authorization': authorization,
    'Content-Type': 'application/json'
}

# Send request
response = requests.get(url, headers=headers, timeout=10)

# Check response
if response.status_code == 200:
    data = response.json()
    user_data = data['data']

    # Extract key information
    quota = user_data['quota']
    used_quota = user_data['used_quota']
    request_count = user_data['request_count']

    # Calculate USD amounts (note: quota represents current remaining balance)
    remaining_usd = quota / 500000
    used_usd = used_quota / 500000

    # Print results
    print(f"Remaining quota: ${remaining_usd:.2f} USD ({quota:,} quota)")
    print(f"Used: ${used_usd:.2f} USD ({used_quota:,} quota)")
    print(f"Request count: {request_count:,} times")
else:
    print(f"Request failed: HTTP {response.status_code}")
    print(response.text)
```

### Пример Python (Оптимизированный)

Это добавляет следующее к базовому примеру:

<CardGroup cols={2}>
  <Card title="Обработка ошибок" icon="shield-check">
    Полная обработка исключений и захват ошибок
  </Card>

  <Card title="Переменные окружения" icon="lock">
    Безопасное управление token, избегайте хардкода
  </Card>

  <Card title="Форматированный вывод" icon="table">
    Красивое отображение таблиц и форматирование чисел
  </Card>

  <Card title="Автоматическое преобразование" icon="calculator">
    Автоматический расчет суммы в USD
  </Card>
</CardGroup>

Сохраните код ниже как `quota.py`, и он будет готов к запуску:

```python theme={null}
import os
import sys

import requests

URL = "https://api.apiyi.com/api/user/self"
QUOTA_PER_USD = 500_000


def fetch_quota(token):
    """Query the account balance and return the data field."""
    headers = {
        "Accept": "application/json",
        "Authorization": token,
        "Content-Type": "application/json",
    }
    try:
        resp = requests.get(URL, headers=headers, timeout=10)
    except requests.exceptions.Timeout:
        sys.exit("Request timed out, please check your network and retry")
    except requests.exceptions.RequestException as exc:
        sys.exit(f"Request failed: {exc}")

    if resp.status_code == 401:
        sys.exit("Authentication failed: token invalid or expired, regenerate it in the console")
    if resp.status_code != 200:
        sys.exit(f"Request failed: HTTP {resp.status_code}\n{resp.text[:200]}")

    body = resp.json()
    if not body.get("success"):
        sys.exit(f"API error: {body.get('message')}")
    return body["data"]


def report(data):
    quota = data.get("quota", 0)
    used = data.get("used_quota", 0)
    count = data.get("request_count", 0)

    print("=" * 60)
    print("📊 APIYI Account Balance")
    print("=" * 60)
    print(f"Username: {data.get('username')} ({data.get('display_name')})")
    print("-" * 60)
    print(f"Remaining: {quota:,} quota (${quota / QUOTA_PER_USD:.2f} USD)")
    print(f"Used:      {used:,} quota (${used / QUOTA_PER_USD:.2f} USD)")
    print(f"Requests:  {count:,}")
    print("=" * 60)
    print(f"💡 Conversion: {QUOTA_PER_USD:,} quota = $1.00 USD")
    print("=" * 60)


if __name__ == "__main__":
    # Prefer the command-line argument, fall back to the environment variable,
    # so the token never has to be hardcoded
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("APIYI_TOKEN")
    if not token:
        sys.exit("Provide a token: set APIYI_TOKEN, or pass it as the first argument")
    report(fetch_quota(token))
```

**Использование:**

```bash theme={null}
# Method 1: Using environment variable (recommended)
export APIYI_TOKEN='YOUR_TOKEN_HERE'
python quota.py

# Method 2: Command line argument
python quota.py 'YOUR_TOKEN_HERE'
```

**Пример вывода:**

```
============================================================
📊 APIYI Account Balance Information
============================================================
Username: testnano (testnano)
------------------------------------------------------------
Remaining quota: 24,997,909 quota ($49.99 USD)
Used:           10,027,091 quota ($20.05 USD)
Request count: 339 times
============================================================
💡 Conversion: 500,000 quota = $1.00 USD
============================================================
```

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Как получить Authorization token?">
    Обратитесь к разделу «Как получить Authorization token» выше или перейдите на страницу профиля в консоли, чтобы получить системный token.
  </Accordion>

  <Accordion title="Запрос баланса расходует квоту?">
    Нет, API запроса баланса не расходует вашу квоту.
  </Accordion>

  <Accordion title="Как часто можно запрашивать баланс?">
    Мы рекомендуем интервал запросов не менее 1 секунды, чтобы не вызывать лимиты запросов.
  </Accordion>

  <Accordion title="Для чего нужно поле ModelFixedPrice?">
    Это поле возвращает информацию о тарификации для различных AI-моделей. Вы можете не обращать на него внимания, если вам нужна только информация о балансе.
  </Accordion>

  <Accordion title="Что означает поле квоты?">
    Поле `quota` показывает текущий оставшийся баланс. Если `quota` равно 0 или близко к 0, ваш баланс недостаточен и его нужно пополнить.
  </Accordion>

  <Accordion title="Почему curl возвращает искаженный текст или jq сообщает об ошибках?">
    **Проблема:** При выполнении curl возвращается искаженный текст, или jq сообщает «Invalid numeric literal»

    **Причина:** API возвращает содержимое, сжатое gzip (`Content-Encoding: gzip`), а curl не распаковывает его автоматически.

    **Решение:** Добавьте опцию `--compressed`, чтобы curl автоматически распаковывал данные:

    ```bash theme={null}
    # ✅ Correct (with --compressed)
    curl --compressed 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq

    # ❌ Wrong (missing --compressed)
    curl 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq
    ```
  </Accordion>
</AccordionGroup>

## Важные примечания

<Warning>
  **Напоминания по безопасности**

  * Никогда не прописывайте Authorization tokens непосредственно в коде
  * Используйте переменные окружения или файлы конфигурации для управления конфиденциальной информацией
  * Не коммитьте код, содержащий tokens, в публичные репозитории
</Warning>

<Info>
  **Лимиты запросов**

  * Устанавливайте разумный request timeout (рекомендуется: 10 секунд)
  * Избегайте слишком частых запросов
</Info>

<Card title="Рекомендации по обработке исключений" icon="bug">
  * Всегда обрабатывайте сетевые исключения, timeout'ы и ошибки аутентификации
  * Логируйте ошибки для более простой диагностики
</Card>

<Card title="Примечания к формату ответа" icon="file-code">
  * API возвращает содержимое, сжатое gzip; curl требует опцию `--compressed`
  * Библиотека requests в Python автоматически обрабатывает распаковку gzip без дополнительной настройки
</Card>
