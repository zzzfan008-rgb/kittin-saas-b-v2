> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Управление Token API

> Программно создавайте, получайте список, отключайте и удаляйте API-ключи, с пакетной выдачей и ограничениями для каждого ключа по квоте, моделям и сроку действия

## Обзор API

API управления token позволяет вам управлять полным жизненным циклом ваших API-ключей в коде, вместо того чтобы
кликать по консоли по одному key за раз.

Наиболее распространенный сценарий использования — **массовая выдача**: предоставлять каждому члену команды, downstream-клиенту или
проекту свой key, у каждого — свои лимиты на **сколько он может потратить**, **к каким моделям он может
обращаться**, и **как долго он остается действительным**.

<CardGroup cols={3}>
  <Card title="Лимит квоты" icon="wallet">
    `remain_quota` ограничивает, сколько этот key может потратить в сумме
  </Card>

  <Card title="Лимит модели" icon="list-checks">
    `models` задает allowlist; обращения ко всему, что вне его, отклоняются
  </Card>

  <Card title="Лимит срока действия" icon="clock">
    `expired_time` задает временную метку истечения, после которой key перестает работать
  </Card>
</CardGroup>

<Info>
  Если вам нужен только один или два key, консоль быстрее — см.
  [Как создать API key](/ru/faq/token-management). Этот API предназначен для автоматизированной выдачи,
  плановой ротации или интеграции управления key в ваши собственные системы.
</Info>

## Как получить персональный access token

Для аутентификации в Token Management API используется **персональный access token** (начинающийся с `nap_`), который отличается от API-ключа.

<Steps>
  <Step title="Откройте раздел Personal Access Tokens">
    Перейдите на страницу своего профиля по адресу `api.apiyi.com/account/profile`. В разделе **Параметры аккаунта** (Account Options) нажмите **Personal Access Tokens** → **Create Token**.
  </Step>

  <Step title="Выберите необходимые разрешения Model keys">
    Эти три разрешения независимы друг от друга. Выбирайте только те, которые вам нужны:

    | Что требуется сделать | Выбираемое разрешение |
    | - | - |
    | Просмотр списка или получение API-ключей | Model keys · Read |
    | Создание, обновление, отключение или удаление API-ключей | Model keys · Write |
    | Получение открытого значения нового API-ключа (для выдачи) | Model keys · Reveal secret |

    Скрипту для массового выпуска ключей понадобятся все три разрешения. Скрипту для мониторинга использования достаточно только Read.
  </Step>

  <Step title="Задайте срок действия и список разрешенных IP-адресов">
    Срок действия по умолчанию составляет 30 дней, поэтому мы рекомендуем выбрать более длительный период. Если ваш скрипт выпуска ключей работает на сервере со статическим IP, настоятельно рекомендуем настроить список разрешенных IP-адресов (IP allowlist). Этот список нельзя отредактировать после создания, поэтому сначала отладьте работу скрипта без него, а затем создайте отдельный рабочий token со списком разрешенных IP-адресов.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="Создание персонального access token: имя, срок действия, список разрешенных IP-адресов и разрешения" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **Token с разрешениями Write и Reveal secret может создавать API-ключи, вызывающие модели. Относитесь к нему как к паролю от своего аккаунта.**

  Персональный access token сам по себе не может вызывать модели, но может выпускать ключи, обладающие этой возможностью. Обязательно задайте для такого token **список разрешенных IP-адресов**, храните его в менеджере секретов, а не в коде, ни в коем случае не фиксируйте в репозитории и обновляйте до истечения срока действия.
</Warning>

<Warning>
  **Устаревшие системные tokens планируется вывести из эксплуатации 2026-11-11 (UTC+8).** AccessTokens, созданные в разделе «Account Options - System Token», продолжат работать до этой даты. После нее они будут возвращать 401 `ACCESS_TOKEN_LEGACY_RETIRED`.
  Мы проанализируем интенсивность использования и при необходимости перенесем дату, но рекомендуем перейти на персональный access token уже сейчас. При переходе также проверьте ваши скрипты: **эндпоинт создания теперь возвращает маскированный `key`**. Чтобы получить открытый текст, вызовите `POST /api/token/{id}/key`, как описано ниже.
  См. [Что такое персональный access token?](/ru/faq/personal-access-token)
</Warning>

## Эндпоинты

Все эндпоинты аутентифицируются одинаково: укажите personal access token в заголовке `Authorization`.
Префикс `Bearer ` необязателен.

| Метод | Путь | Назначение | Разрешение |
| - | - | - | - |
| `GET` | `/api/token/?p=0&page_size=100` | Список всех tokens в вашем аккаунте (`key` маскируется) | Чтение |
| `GET` | `/api/token/{id}` | Получить отдельный token | Чтение |
| `POST` | `/api/token/` | **Создать token** (`key` в ответе маскируется) | Запись |
| `POST` | `/api/token/{id}/key` | **Получить открытый текст ключа** | Раскрытие секрета |
| `PUT` | `/api/token/` | Обновить token (требуется полный объект) | Запись |
| `PUT` | `/api/token/?status_only=true` | Переключить только состояние «включен/отключен» | Запись |
| `DELETE` | `/api/token/{id}` | Удалить token | Запись |

Базовый URL: `https://api.apiyi.com`.

## Создание token

### Пример запроса

```bash theme={null}
export APIYI_SYS_TOKEN='nap_YOUR_PERSONAL_ACCESS_TOKEN'   # personal access token

curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
  -H "Authorization: $APIYI_SYS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "team-alice",
    "remain_quota": 500000,
    "unlimited_quota": false,
    "group": "default",
    "models": "gpt-5.6,deepseek-chat",
    "expired_time": -1
  }'
```

### Поля запроса

| Поле | Тип | Описание |
| - | - | - |
| `name` | String | Имя token для вашей идентификации |
| `remain_quota` | Integer | Лимит квоты в кредитах; 500,000 = \$1.00 |
| `unlimited_quota` | Boolean | Является ли квота неограниченной; **по умолчанию `false`** |
| `group` | String | Идентификатор группы, к которой привязан token, например `default` |
| `models` | String | **Белый список моделей**, через запятую; опустите при отсутствии ограничений |
| `expired_time` | Integer | Временная метка истечения срока действия в секундах Unix; `-1` означает, что срок действия не ограничен |

<Warning>
  **`unlimited_quota` по умолчанию равен `false`, а `remain_quota` по умолчанию равен 0** — если опустить оба параметра,
  будет создан token с нулевой квотой, который нельзя использовать. Либо явно укажите `remain_quota`, либо
  установите `unlimited_quota` в `true`.
</Warning>

<Warning>
  **Используйте поле `models` для белого списка моделей.**

  Структура ответа также содержит `model_limits`, `model_limits_enabled` и `allow_ips`.
  Их передача не вызывает ошибки — эндпоинт по-прежнему возвращает 200, — но они **в настоящее время не
  действуют**, и при повторном чтении token они отображаются как неустановленные. Используйте `models` для ограничения доступных
  моделей. Ограничения по исходному IP-адресу на данный момент необходимо реализовывать на вашей стороне.
</Warning>

### Пример ответа

```json theme={null}
{
  "success": true,
  "message": "",
  "data": {
    "id": 119431,
    "user_id": 80778,
    "key": "K1RP**********4b75",
    "status": 1,
    "name": "team-alice",
    "group": "default",
    "models": "gpt-5.6,deepseek-chat",
    "remain_quota": 500000,
    "unlimited_quota": false,
    "used_quota": 0,
    "expired_time": -1,
    "created_time": 1785599000
  }
}
```

<Warning>
  **`key` в ответе замаскирован и не может использоваться напрямую.** Чтобы получить открытый текст, вызовите
  эндпоинт получения открытого текста с `id` из ответа.
</Warning>

## Получение открытого текста ключа

```bash theme={null}
curl --compressed -s -X POST 'https://api.apiyi.com/api/token/119431/key' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

```json theme={null}
{
  "success": true,
  "message": "",
  "data": {
    "key": "K1RPzapuXLfBU4kDC5D9C0E70b1841AeAa542186B2F54b75"
  }
}
```

* Для персонального токена доступа требуется разрешение **Model keys · Reveal secret**, иначе вы получите 403 `ACCESS_TOKEN_SCOPE_DENIED`.
* Возвращаемый `key` **не содержит префикса `sk-`**. Добавьте его в начало самостоятельно. В приведенном выше примере фактический API-ключ — `sk-K1RPzapu…`.
* Сразу же сохраните его и передавайте по защищенному каналу. Не оставляйте тело ответа в лог-файлах.

## Пакетное создание

**Серверного эндпоинта для пакетного создания нет** — передача чего-то вроде `count` в теле запроса
не даст эффекта и все равно создаст только один token. Пакетный выпуск выполняется циклом на клиенте.

<Warning>
  **Один пользователь может иметь не более 1 000 tokens.** Это общее ограничение на весь аккаунт, и оно учитывает tokens,
  которые отключены, но не удалены. Как только вы его достигнете, эндпоинт создания начнет возвращать ошибку — удаляйте tokens,
  которые больше не используются, чтобы освободить слоты.

  Перед пакетным запуском выполните пагинацию по `GET /api/token/?p=0&page_size=100`, чтобы подсчитать уже
  имеющиеся. При ротации ключей обязательно выполняйте последний шаг: «создать новый ключ → перенаправить трафик →
  отключить старый ключ → удалить, когда не останется вызовов». Отключение без удаления оставляет слот занятым,
  поэтому через несколько циклов ротации вы упретесь в лимит.
</Warning>

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json
    import os
    import time

    import requests

    BASE = "https://api.apiyi.com"
    HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
               "Content-Type": "application/json"}
    QUOTA_PER_USD = 500_000


    def create_token(name, quota_usd=None, group="default", models=None, days=0):
        """Create one token. quota_usd=None means unlimited; days=0 means never expires."""
        body = {
            "name": name,
            "group": group,
            "unlimited_quota": quota_usd is None,
            "remain_quota": 0 if quota_usd is None else int(quota_usd * QUOTA_PER_USD),
            "expired_time": -1 if not days else int(time.time()) + days * 86400,
        }
        if models:
            body["models"] = models

        resp = requests.post(f"{BASE}/api/token/", headers=HEADERS, json=body, timeout=30)
        resp.raise_for_status()
        data = resp.json()["data"]          # key here is masked

        # Retrieve the plaintext: needs "Model keys · Reveal secret"
        resp = requests.post(f"{BASE}/api/token/{data['id']}/key", headers=HEADERS, timeout=30)
        resp.raise_for_status()
        key = resp.json()["data"]["key"]
        return {"id": data["id"], "name": data["name"], "key": "sk-" + key}


    if __name__ == "__main__":
        names = ["team-alice", "team-bob", "team-carol"]
        created = [
            create_token(n, quota_usd=1, group="default", models="gpt-5.6", days=30)
            for n in names
        ]
        for row in created:
            print(f"{row['name']:16s} id={row['id']} {row['key']}")

        # keys.json holds plaintext keys: store and distribute carefully, delete when done
        with open("keys.json", "w") as f:
            json.dump(created, f, ensure_ascii=False, indent=1)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const BASE = "https://api.apiyi.com";
    const HEADERS = {
      Authorization: process.env.APIYI_SYS_TOKEN,
      "Content-Type": "application/json",
    };
    const QUOTA_PER_USD = 500_000;

    async function createToken(name, { quotaUsd = null, group = "default",
                                       models = null, days = 0 } = {}) {
      const body = {
        name,
        group,
        unlimited_quota: quotaUsd === null,
        remain_quota: quotaUsd === null ? 0 : Math.round(quotaUsd * QUOTA_PER_USD),
        expired_time: days ? Math.floor(Date.now() / 1000) + days * 86400 : -1,
      };
      if (models) body.models = models;

      const resp = await fetch(`${BASE}/api/token/`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const { data } = await resp.json();   // key here is masked

      // Retrieve the plaintext: needs "Model keys · Reveal secret"
      const r2 = await fetch(`${BASE}/api/token/${data.id}/key`, { method: "POST", headers: HEADERS });
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
      const { data: secret } = await r2.json();
      return { id: data.id, name: data.name, key: `sk-${secret.key}` };
    }

    const names = ["team-alice", "team-bob", "team-carol"];
    for (const name of names) {
      const row = await createToken(name, { quotaUsd: 1, models: "gpt-5.6", days: 30 });
      console.log(row.name, row.id, row.key);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    export APIYI_SYS_TOKEN='nap_YOUR_PERSONAL_ACCESS_TOKEN'   # personal access token

    for NAME in team-alice team-bob team-carol; do
      ID=$(curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
        -H "Authorization: $APIYI_SYS_TOKEN" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$NAME\",\"remain_quota\":500000,\"unlimited_quota\":false,\"group\":\"default\",\"expired_time\":-1}" \
        | jq -r '.data.id')
      KEY=$(curl --compressed -s -X POST "https://api.apiyi.com/api/token/$ID/key" \
        -H "Authorization: $APIYI_SYS_TOKEN" | jq -r '.data.key')
      printf '%s\tsk-%s\n' "$NAME" "$KEY"
    done
    ```
  </Tab>
</Tabs>

## Использование трех лимитов

### Лимит квоты

`remain_quota` ограничивает, сколько token может потратить. Конвертация соответствует
[API запроса баланса](/ru/api-capabilities/balance-query):

<Card title="Правило конвертации" icon="calculator">
  500,000 квот = \$1.00 USD
</Card>

Например, чтобы выдать downstream-клиенту ключ с лимитом \$10, установите `remain_quota` в
`5000000` с `unlimited_quota`, установленным в `false`. Потребление на текущий момент можно прочитать в
поле `used_quota` token.

### Лимит модели

`models` — это список разрешенных значений, разделенный запятыми. После задания вызов модели вне списка отклоняется:

```json theme={null}
{
  "error": {
    "message": "This token is not authorized to use model: deepseek-chat"
  }
}
```

Ответом будет HTTP 403, и **плата не взимается**. Если не указывать `models`, ограничение отсутствует.

### Лимит срока действия

`expired_time` — это Unix-метка времени в секундах, при этом `-1` означает «никогда». Например, ключ, срок действия которого истекает через 30 дней:

```python theme={null}
import time
expired_time = int(time.time()) + 30 * 86400
```

## Получение списка tokens

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

Основные поля:

| Поле | Описание |
| - | - |
| `id` | ID token, используется для обновления и удаления |
| `key` | Маскированный ключ; см. «Получение ключа в открытом виде» для просмотра открытого текста |
| `status` | `1` = включен, `2` = отключен |
| `remain_quota` / `used_quota` | Оставшаяся / израсходованная квота |
| `unlimited_quota` | Является ли квота неограниченной |
| `models` | Список разрешенных моделей; пустое значение означает отсутствие ограничений |
| `expired_time` | Метка времени истечения срока действия; `-1` означает бессрочно |

## Обновление token

<Warning>
  **Эндпоинт обновления требует полный объект — это не патч.**

  Правильная последовательность: `GET` полный объект token, измените поля, которые хотите поменять, затем
  `PUT` **весь объект** обратно. Отправка только измененных полей очистит остальные.
</Warning>

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
           "Content-Type": "application/json"}

# 1. fetch the complete object
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]

# 2. change only what you need, leaving everything else as-is
token["remain_quota"] = 2_500_000     # raise the cap to $5
token["models"] = "gpt-5.6,gemini-3-pro"

# 3. PUT the whole object back
resp = requests.put(f"{BASE}/api/token/", headers=HEADERS, json=token, timeout=30)
print(resp.json()["success"])
```

## Отключение и удаление

### Отключение (сохраняет запись)

После отключения ключ сразу перестает работать — запросы с ним возвращают 401 — но запись token
и история его использования сохраняются.

```python theme={null}
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]
token["status"] = 2      # 1 = enabled, 2 = disabled

requests.put(f"{BASE}/api/token/", headers=HEADERS,
             params={"status_only": "true"}, json=token, timeout=30)
```

### Удаление (необратимо)

```bash theme={null}
curl --compressed -s -X DELETE 'https://api.apiyi.com/api/token/119431' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

Пакетное удаление также выполняется в виде цикла на стороне клиента:

```python theme={null}
for token_id in [119431, 119432, 119433]:
    requests.delete(f"{BASE}/api/token/{token_id}", headers=HEADERS, timeout=30)
```

<Info>
  Удаление нельзя отменить. Если вы хотите лишь временно приостановить key, вместо этого отключите его —
  история использования останется доступной для сверки.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Ключ, возвращенный при создании, не работает — почему?">
    Эндпоинт создания возвращает маскированный `key` (с цепочкой `*` посередине), поэтому его нельзя использовать напрямую.
    Вызовите `POST /api/token/{id}/key` с полученным `id`, чтобы получить открытый текст (требуется разрешение Reveal secret),
    затем добавьте в начало `sk-`. Если в старом скрипте напрямую используется `key` из ответа на создание, добавьте этот шаг при переходе на personal access token.
  </Accordion>

  <Accordion title="Почему только что созданный token сообщает о недостаточной квоте?">
    Скорее всего, при создании не был задан `remain_quota`, а `unlimited_quota` не был установлен в `true`.
    Такая комбинация по умолчанию создает token с нулевой квотой. Создайте его заново, явно
    указав один из двух параметров.
  </Accordion>

  <Accordion title="Почему model_limits или allow_ips не действуют?">
    Эти поля — наряду с `model_limits_enabled` — в настоящее время не действуют. Их передача
    не вызывает ошибки, но данные не сохраняются. Используйте `models` для ограничения доступных моделей;
    ограничения по IP-адресу источника пока необходимо обрабатывать на вашей стороне.
  </Accordion>

  <Accordion title="Можно ли создать несколько tokens за один запрос?">
    На стороне сервера нет пакетного эндпоинта, и передача таких данных, как `count` в теле запроса, не дает
    эффекта. Вместо этого вызывайте создание в цикле на стороне клиента — см. раздел о пакетном создании выше.
  </Accordion>

  <Accordion title="Сколько tokens может содержать один аккаунт?">
    Не более 1 000 на пользователя, при этом отключенные, но не удаленные tokens также учитываются в этом лимите.
    Как только вы достигнете ограничения, создание перестанет работать, пока вы не удалите ненужные tokens. При
    ротации ключей не забывайте завершать процесс шагом удаления — простого отключения недостаточно, слот останется занятым.
  </Accordion>

  <Accordion title="После обновления другие поля очистились">
    Эндпоинт обновления требует передачи объекта целиком. Сначала `GET` полный объект, измените его, а затем
    `PUT` весь объект обратно вместо отправки только измененных полей.
  </Accordion>

  <Accordion title="В чем разница между отключением и удалением?">
    Отключение (`status: 2`) немедленно прекращает работу ключа, но сохраняет запись и историю
    использования, и вы можете в любой момент вернуть значение `1`. Удаление необратимо и полностью удаляет
    запись. Для временной приостановки лучше использовать отключение.
  </Accordion>

  <Accordion title="Как узнать, сколько израсходовал каждый ключ?">
    Поле `used_quota` у token представляет собой совокупные расходы этого ключа (÷ 500 000 = USD). Для
    детализации по периодам или по отдельным вызовам отфильтруйте данные по имени token на странице логов в консоли — см.
    [Как просмотреть историю вызовов](/ru/faq/call-logs).
  </Accordion>
</AccordionGroup>

## Важные примечания

<Warning>
  **Personal access token — это не API-ключ, и они не взаимозаменяемы**

  * **API-ключ** (начинающийся с `sk-`) предназначен для эндпоинтов инференса `/v1/*`
  * **Personal access token** (начинающийся с `nap_`) предназначен для эндпоинтов управления `/api/*` и не может вызывать модели

  Справка по ошибкам: 401 `ACCESS_TOKEN_LEGACY_RETIRED` означает, что вы все еще используете устаревший системный token, выведенный из эксплуатации.
  401 `This access token may not be used from the current IP address.` означает, что запрос поступил с IP-адреса вне списка разрешенных адресов для данного token.
  403 `ACCESS_TOKEN_SCOPE_DENIED` означает, что у token нет разрешения, необходимого для этого эндпоинта (см. таблицу «Эндпоинты»).
</Warning>

<Warning>
  **Обращайтесь с ключами в открытом виде с осторожностью**

  Эндпоинт retrieve-plaintext возвращает ключ, с помощью которого можно напрямую вызывать модели. Поэтому:

  * Не записывайте тела ответов, содержащие `key`, в лог-файлы и не фиксируйте их в репозитории
  * Передавайте ключи участникам команды по защищенным каналам, а не через групповые чаты
  * Этот открытый текст не содержит префикса `sk-`, поэтому **распространенные сканеры секретов могут его не обнаружить** —
    не полагайтесь на автоматические проверки в его поиске
</Warning>

<Info>
  **Рекомендации по эксплуатации**

  * При массовом создании добавляйте небольшую задержку между вызовами, чтобы избежать высокого мгновенного числа параллельных запросов
  * Задавайте каждому ключу осмысленное значение `name` (например, `team-alice` или `prod-webhook`), чтобы позже можно было атрибутировать
    использование по `token_name` в логах
  * Для ротации: создайте новый ключ, переключите трафик, отключите старый ключ, понаблюдайте некоторое время и
    удаляйте его только после того, как убедитесь в отсутствии вызовов
</Info>

<Card title="Связанная документация" icon="link">
  * [Как просмотреть историю вызовов](/ru/faq/call-logs) — детализация вызовов и списаний по каждому ключу в консоли
  * [API проверки баланса](/ru/api-capabilities/balance-query) — остаток средств на счете
  * [Как создать API-ключ](/ru/faq/token-management) — создание вручную в консоли
  * [Tokens и группы](/ru/faq/token-and-groups) — для чего нужны группы и как их выбирать
</Card>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.