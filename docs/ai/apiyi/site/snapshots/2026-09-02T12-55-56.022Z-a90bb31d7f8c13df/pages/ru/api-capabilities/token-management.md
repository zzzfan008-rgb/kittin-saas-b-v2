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

## Как получить ваш System Token

API для управления token аутентифицируется с помощью **системного token**, который не то же самое, что
ключ API.

<Steps>
  <Step title="Открыть консоль">
    Перейдите на `api.apiyi.com/account/profile`, чтобы открыть страницу профиля
  </Step>

  <Step title="Найдите системный token">
    Найдите раздел «Параметры аккаунта - System Token» в нижней части страницы
  </Step>

  <Step title="Сгенерируйте AccessToken">
    Введите пароль вашей учетной записи, чтобы получить AccessToken, который можно использовать для последующих запросов к API
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="Получить системный token" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

<Warning>
  **Системный token может создавать и удалять API-ключи. Относитесь к нему как к паролю вашей учетной записи.**

  Системный token не может напрямую вызывать модели — использование его с `/v1/chat/completions` отклоняется —
  но он может создавать API-ключи, которые могут. **Утечка системного token поэтому значительно хуже, чем
  утечка одного API-ключа.** Храните его в secret manager, а не в коде, никогда не добавляйте его в
  repository и периодически выполняйте его ротацию.
</Warning>

## Эндпоинты

Все эндпоинты аутентифицируются одинаково: передавайте необработанный системный token в заголовке `Authorization`,
**без префикса `Bearer`**.

| Метод    | Путь                            | Назначение                                                           |
| -------- | ------------------------------- | -------------------------------------------------------------------- |
| `GET`    | `/api/token/?p=0&page_size=100` | Получить список всех tokens в вашей учетной записи                   |
| `GET`    | `/api/token/{id}`               | Получить один token                                                  |
| `POST`   | `/api/token/`                   | **Создать token**; в ответе ключ возвращается в виде обычного текста |
| `PUT`    | `/api/token/`                   | Обновить token (требуется полный объект)                             |
| `PUT`    | `/api/token/?status_only=true`  | Только переключать состояние включено/выключено                      |
| `DELETE` | `/api/token/{id}`               | Удалить token                                                        |

Базовый URL — `https://api.apiyi.com`.

## Создание token

### Пример запроса

```bash theme={null}
export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

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

| Field             | Type    | Description                                                                             |
| ----------------- | ------- | --------------------------------------------------------------------------------------- |
| `name`            | String  | Имя token для собственной идентификации                                                 |
| `remain_quota`    | Integer | Предел квоты в credits; 500,000 = \$1.00                                                |
| `unlimited_quota` | Boolean | Является ли квота безлимитной; **по умолчанию — `false`**                               |
| `group`           | String  | Идентификатор группы, к которой привязан token, например `default`                      |
| `models`          | String  | **Список разрешённых моделей**, через запятую; опустите, если ограничений нет           |
| `expired_time`    | Integer | Временная метка истечения в Unix-секундах; `-1` означает, что срок действия не истекает |

<Warning>
  **`unlimited_quota` по умолчанию = `false`, а `remain_quota` по умолчанию = 0** — если опустить оба
  поля, будет создан token с нулевой квотой, который нельзя использовать. Либо явно задайте `remain_quota`, либо
  установите `unlimited_quota` в `true`.
</Warning>

<Warning>
  **Используйте поле `models` для списка разрешённых моделей.**

  Структура ответа также содержит `model_limits`, `model_limits_enabled` и `allow_ips`.
  Передача этих полей не вызывает ошибку — эндпоинт по-прежнему возвращает 200 — но сейчас они **не
  влияют ни на что**, и при повторном чтении token видно, что они не заданы. Используйте `models`, чтобы ограничить
  доступные модели. Ограничения по исходному IP пока нужно реализовать на своей стороне.
</Warning>

### Пример ответа

```json theme={null}
{
  "success": true,
  "message": "",
  "data": {
    "id": 119431,
    "user_id": 80778,
    "key": "K1RPzapuXLfBU4kDC5D9C0E70b1841AeAa542186B2F54b75",
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
  **`key` в ответе представлен в виде обычного текста и не включает префикс `sk-`.** Вам нужно
  добавить его самостоятельно — в примере выше фактический API key — это `sk-K1RPzapu…`.

  Сохраняйте и передавайте key сразу после создания и не оставляйте тела ответов, содержащие `key`,
  в файлах журналов.
</Warning>

## Пакетное создание

**На стороне сервера нет batch-эндпоинта** — передача чего-то вроде `count` в теле запроса
не влияет ни на что и все равно создает один token. Выпуск batch выполняется циклом на стороне клиента.

<Warning>
  **У одного пользователя может быть не более 1 000 token.** Это ограничение на уровне аккаунта, и оно учитывает token,
  которые отключены, но не удалены. Как только вы достигнете его, create-эндпоинт завершится с ошибкой — удалите token, которые
  вам больше не нужны, чтобы освободить слоты.

  Перед batch-запуском пройдитесь постранично по `GET /api/token/?p=0&page_size=100`, чтобы подсчитать, что у вас уже
  есть. При ротации ключей обязательно доводите до конца последний шаг: «создайте новый ключ → переведите трафик →
  отключите старый ключ → удалите его, когда вызовы прекратятся». Отключение без удаления оставляет слот занятым,
  поэтому после нескольких циклов ротации вы упретесь в лимит.
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
        data = resp.json()["data"]
        return {"id": data["id"], "name": data["name"], "key": "sk-" + data["key"]}


    if __name__ == "__main__":
        names = ["team-alice", "team-bob", "team-carol"]
        created = [
            create_token(n, quota_usd=1, group="default", models="gpt-5.6", days=30)
            for n in names
        ]
        for row in created:
            print(f"{row['name']:16s} id={row['id']} {row['key']}")

        # the plaintext key is only returned at creation time, so store it carefully
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
      const { data } = await resp.json();
      return { id: data.id, name: data.name, key: `sk-${data.key}` };
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
    export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

    for NAME in team-alice team-bob team-carol; do
      curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
        -H "Authorization: $APIYI_SYS_TOKEN" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$NAME\",\"remain_quota\":500000,\"unlimited_quota\":false,\"group\":\"default\",\"expired_time\":-1}" \
        | jq -r '"\(.data.name)\tsk-\(.data.key)"'
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

## Список токенов

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

Основные поля:

| Поле                          | Описание                                                                    |
| ----------------------------- | --------------------------------------------------------------------------- |
| `id`                          | ID токена, используется для обновления и удаления                           |
| `key`                         | Ключ в виде обычного текста, без префикса `sk-`                             |
| `status`                      | `1` = включено, `2` = отключено                                             |
| `remain_quota` / `used_quota` | Оставшаяся / использованная квота                                           |
| `unlimited_quota`             | Является ли квота неограниченной                                            |
| `models`                      | Список разрешенных моделей; пустое значение означает отсутствие ограничений |
| `expired_time`                | Метка времени истечения; `-1` означает «никогда»                            |

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

## Вопросы и ответы

<AccordionGroup>
  <Accordion title="Почему возвращенный при создании ключ не работает?">
    `key` в ответе не содержит префикс `sk-`. Добавьте его сами:
    рабочий API-ключ — это `sk-`, за которым следует возвращенное значение.
  </Accordion>

  <Accordion title="Почему у только что созданного token отображается недостаточная квота?">
    Скорее всего, при создании не был задан ни `remain_quota`, ни `unlimited_quota` было установлено в `true`.
    Такая комбинация по умолчанию создает token с нулевой квотой. Создайте его заново, явно указав одно из этих двух значений.
  </Accordion>

  <Accordion title="Почему model_limits или allow_ips не работают?">
    Эти поля — вместе с `model_limits_enabled` — сейчас не действуют. Их передача
    не вызывает ошибки, но ничего не сохраняется. Используйте `models`, чтобы ограничить доступные модели; ограничения по source-IP
    пока нужно реализовать на своей стороне.
  </Accordion>

  <Accordion title="Могу ли я создать несколько token в одном запросе?">
    На стороне сервера нет пакетного эндпоинта, и передача чего-то вроде `count` в теле не
    дает эффекта. Вместо этого выполняйте create-вызов на клиенте в цикле — см. раздел о пакетном создании выше.
  </Accordion>

  <Accordion title="Сколько token может хранить один аккаунт?">
    Не более 1,000 на пользователя, и отключенные, но не удаленные token учитываются в этом итоге.
    Когда достигнете лимита, создание будет неудачным, пока вы не удалите token, которые больше не нужны. При
    ротации ключей не забудьте завершить удалением — одно только отключение сохраняет слот занятым.
  </Accordion>

  <Accordion title="После обновления у меня сбросились другие поля">
    Эндпоинт обновления требует полный объект. `GET` полный объект сначала, внесите изменения, а затем
    `PUT` отправьте его целиком, а не только измененные поля.
  </Accordion>

  <Accordion title="В чем разница между отключением и удалением?">
    Отключение (`status: 2`) сразу прекращает работу ключа, но сохраняет запись и историю
    использования, и вы можете в любой момент вернуть его в состояние `1`. Удаление необратимо и удаляет
    запись. Для временной приостановки лучше использовать отключение.
  </Accordion>

  <Accordion title="Как посмотреть, сколько потратил каждый ключ?">
    Поле `used_quota` token — это накопленные расходы этого ключа (÷ 500,000 = USD). Для
    разбивки по периодам или детализации на уровне вызовов отфильтруйте по имени token на странице журнала в консоли — см.
    [Как посмотреть мои записи вызовов](/ru/faq/call-logs).
  </Accordion>
</AccordionGroup>

## Важные замечания

<Warning>
  **system token — это не API-ключ, и они не взаимозаменяемы**

  * **API-ключ** (начинается с `sk-`) используется для `/v1/*` эндпоинтов инференса
  * **system token** (обычная строка без префикса) используется для `/api/*` эндпоинтов управления

  При их смешении возвращаются 401 и ошибка invalid-token соответственно.
</Warning>

<Warning>
  **Осторожно обращайтесь с ключами в открытом виде**

  И ответ на создание, и список token возвращают ключи в открытом виде. Поэтому:

  * Не записывайте тела ответов, содержащие `key`, в файлы журналов и не коммитьте их в репозиторий
  * Передавайте ключи участникам команды по защищенным каналам, а не в групповых чатах
  * В этом открытом виде отсутствует префикс `sk-`, поэтому **обычные сканеры секретов могут его не обнаружить** —
    не полагайтесь на автоматические проверки, чтобы поймать его за вас
</Warning>

<Info>
  **Операционные рекомендации**

  * При массовом создании добавляйте небольшую задержку между вызовами, чтобы избежать высокой мгновенной параллельности
  * Давайте каждому ключу понятную `name` (например, `team-alice` или `prod-webhook`), чтобы позже можно было
    атрибутировать использование по `token_name` в логах
  * При ротации: создайте новый ключ, переведите трафик, отключите старый ключ, понаблюдайте некоторое время и
    удаляйте его только после того, как убедитесь, что вызовов больше нет
</Info>

<Card title="Связанная документация" icon="link">
  * [Как просмотреть мои записи вызовов](/ru/faq/call-logs) — подробности вызовов и тарификация по каждому ключу в консоли
  * [API запроса баланса](/ru/api-capabilities/balance-query) — оставшийся баланс аккаунта
  * [Как создать API-ключ](/ru/faq/token-management) — ручное создание в консоли
  * [Tokens и группы](/ru/faq/token-and-groups) — что делают группы и как выбрать
</Card>
