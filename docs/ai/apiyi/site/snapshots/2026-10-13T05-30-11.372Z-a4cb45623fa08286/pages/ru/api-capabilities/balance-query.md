> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API запроса баланса

> Получайте баланс аккаунта, квоту использования и количество запросов, чтобы обеспечить проактивный мониторинг баланса и оповещения

## Обзор API

API запроса баланса получает текущий расход квоты вашего аккаунта, включая общую квоту, использованную квоту, оставшийся баланс и количество запросов.

Этот API помогает вам легко отслеживать баланс аккаунта, обеспечивая заблаговременное и гибкое управление уведомлениями о балансе.

## Как получить token Authorization

Этот API выполняет аутентификацию с помощью **персонального token доступа** (начинающегося с `nap_`). Он отличается от API Key, который используется для вызова моделей.

<Steps>
  <Step title="Откройте раздел Personal Access Tokens">
    Перейдите на страницу своего профиля по адресу `api.apiyi.com/account/profile`. В блоке **Account Options** нажмите **Personal Access Tokens** → **Create Token**.
  </Step>

  <Step title="Выберите разрешения">
    Для этого API требуется только **Profile · Read**. Срок действия по умолчанию составляет 30 дней, поэтому мы рекомендуем выбрать более длительный период.
  </Step>

  <Step title="Сохраните token">
    Скопируйте token сразу после создания и укажите его в заголовке `Authorization`.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="Создание персонального token доступа: имя, срок действия, белый список IP и разрешения" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **Устаревшие системные tokens планируется вывести из эксплуатации 2026-11-11 (UTC+8).** AccessTokens, созданные в «Account Options - System Token», продолжат работать до этой даты. После нее они будут возвращать 401 `ACCESS_TOKEN_LEGACY_RETIRED`.
  Мы проанализируем использование и, возможно, продлим этот срок, но рекомендуем перейти на персональный token доступа уже сейчас. Достаточно просто заменить значение в заголовке. Ваш код менять не потребуется.
  Подробнее о сроках действия, белых списках IP и разрешениях см. в разделе [Что такое персональный token доступа?](/ru/faq/personal-access-token)
</Warning>

## Информация об API

| Параметр | Описание |
| - | - |
| **URL API** | `https://api.apiyi.com/api/user/self` |
| **Метод** | `GET` |
| **Аутентификация** | Заголовок Authorization (личный token доступа; префикс `Bearer ` необязателен) |
| **Формат ответа** | JSON |

## Детали запроса

### Заголовки запроса

| Название заголовка | Обязательный | Описание |
| - | - | - |
| `Authorization` | Да | Персональный token доступа, в виде обычной строки |
| `Accept` | Нет | Рекомендуется: `application/json` |
| `Content-Type` | Нет | Рекомендуется: `application/json` |

### Параметры запроса

<Info>
  Это GET-запрос, и он **не требует** параметров в теле запроса.
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

| Имя поля | Тип | Описание |
| - | - | - |
| `success` | Boolean | Был ли запрос успешным |
| `message` | String | Сообщение об ошибке (null при успехе) |
| `data.username` | String | Имя пользователя |
| `data.display_name` | String | Отображаемое имя |
| `data.quota` | Integer | **Оставшаяся квота** (текущий доступный баланс в единицах квоты) |
| `data.used_quota` | Integer | **Использованная квота** (в единицах квоты) |
| `data.request_count` | Integer | **Общее количество запросов** |
| `data.group` | String | Группа пользователя |
| `data.ModelFixedPrice` | Array | Список цен моделей (можно игнорировать) |

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

## Ответы с ошибками

### HTTP 401 - Ошибка аутентификации

```json theme={null}
{
  "success": false,
  "message": "Unauthorized"
}
```

**Причина:** Token недействителен, истек или удален. Смена пароля учетной записи, двухфакторной аутентификации или passkey отзывает каждый персональный token доступа.

**Решение:** Создайте новый персональный token доступа в консоли.

Два других ответа 401 содержат явное сообщение:

| Сообщение | Причина |
| - | - |
| `ACCESS_TOKEN_LEGACY_RETIRED` | Вы все еще используете устаревший системный token. Перейдите на персональный token доступа. |
| `This access token may not be used from the current IP address.` | Запрос поступил с IP-адреса вне списка разрешенных адресов token. Список разрешенных адресов нельзя изменить, поэтому создайте новый token. |

### HTTP 403 - Доступ запрещен

```json theme={null}
{
  "code": "ACCESS_TOKEN_SCOPE_DENIED",
  "message": "This endpoint is outside this access token’s granted permissions.",
  "success": false
}
```

**Причина:** У персонального token доступа отсутствует разрешение **Profile · Read**.

**Решение:** Создайте новый token с этим разрешением. Изменить разрешения после создания невозможно.

## Примеры кода

### Пример cURL

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **Важно:** параметр `--compressed` обязателен, поскольку API возвращает содержимое, сжатое gzip, иначе вы получите нечитаемый вывод.
</Warning>

**Быстрый тест (замените YOUR\_TOKEN\_HERE):**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  Примечание: параметр `-s` скрывает индикатор выполнения, а `--compressed` автоматически распаковывает gzip-ответ
</Info>

### Пример на Python (базовый)

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

### Пример на Python (оптимизированный)

По сравнению с базовым примером сюда добавлено следующее:

<CardGroup cols={2}>
  <Card title="Обработка ошибок" icon="shield-check">
    Полноценная обработка исключений и перехват ошибок
  </Card>

  <Card title="Переменные окружения" icon="lock">
    Безопасное управление token, предотвращение хардкода
  </Card>

  <Card title="Форматированный вывод" icon="table">
    Красивое табличное отображение и форматирование чисел
  </Card>

  <Card title="Автоматическая конвертация" icon="calculator">
    Автоматический расчет суммы в USD
  </Card>
</CardGroup>

Сохраните приведенный ниже код как `quota.py`, и он готов к запуску:

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
        sys.exit("Authentication failed: token invalid, expired or IP not allowlisted; create a new personal access token in the console")
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

## FAQ

<AccordionGroup>
  <Accordion title="Как получить token Authorization?">
    Следуйте инструкциям в разделе «Как получить token Authorization» выше: создайте персональный access token на странице своего профиля и выберите «Profile · Read». Устаревшие системные tokens планируется вывести из эксплуатации 2026-11-11 (UTC+8). См. [Что такое персональный access token?](/ru/faq/personal-access-token)
  </Accordion>

  <Accordion title="Расходует ли запрос баланса квоту?">
    Нет, API запроса баланса не расходует вашу квоту.
  </Accordion>

  <Accordion title="Как часто можно запрашивать баланс?">
    Мы рекомендуем интервал между запросами не менее 1 секунды, чтобы избежать срабатывания лимитов запросов.
  </Accordion>

  <Accordion title="Для чего нужно поле ModelFixedPrice?">
    Это поле возвращает информацию о ценах на различные модели AI. Вы можете проигнорировать его, если вам нужны только сведения о балансе.
  </Accordion>

  <Accordion title="Что означает поле quota?">
    Поле `quota` представляет собой текущий остаток баланса. Если `quota` равно 0 или близко к 0, баланс вашего аккаунта недостаточен и требует пополнения.
  </Accordion>

  <Accordion title="Почему curl возвращает нечитаемый текст или jq сообщает об ошибках?">
    **Проблема:** При выполнении curl возвращается нечитаемый текст или jq выдает ошибку «Invalid numeric literal»

    **Причина:** API возвращает содержимое, сжатое с помощью gzip (`Content-Encoding: gzip`), и curl не распаковывает его автоматически.

    **Решение:** Добавьте параметр `--compressed`, чтобы curl распаковывал ответ автоматически:

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.