> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Token Management API

> Create, list, disable, and delete API keys programmatically, with batch issuance and per-key limits on quota, models, and expiry

## API Overview

The Token Management API lets you handle the full lifecycle of your API keys in code, instead of
clicking through the console one key at a time.

The most common use case is **batch issuance**: giving each team member, downstream customer, or
project its own key, each with its own limits on **how much it can spend**, **which models it can
call**, and **how long it stays valid**.

<CardGroup cols={3}>
  <Card title="Quota limit" icon="wallet">
    `remain_quota` caps how much this key can spend in total
  </Card>

  <Card title="Model limit" icon="list-checks">
    `models` sets an allowlist; calls to anything outside it are rejected
  </Card>

  <Card title="Expiry limit" icon="clock">
    `expired_time` sets an expiry timestamp, after which the key stops working
  </Card>
</CardGroup>

<Info>
  If you only need one or two keys, the console is faster — see
  [How to create an API key](/en/faq/token-management). This API is aimed at automated issuance,
  scheduled rotation, or integrating key management into your own systems.
</Info>

## How to Get a Personal Access Token

The Token Management API authenticates with a **personal access token** (starting with `nap_`), which is not the same thing as
an API key.

<Steps>
  <Step title="Open Personal Access Tokens">
    Go to your profile page at `api.apiyi.com/account/profile`. Under **Account Options**, click **Personal Access Tokens** → **Create Token**.
  </Step>

  <Step title="Select the Model keys permissions you need">
    The three permissions are independent. Select only the ones you use:

    | What you want to do | Permission to select |
    | - | - |
    | List or get API keys | Model keys · Read |
    | Create, update, disable or delete API keys | Model keys · Write |
    | Retrieve a new API key's plaintext (to hand it out) | Model keys · Reveal secret |

    A bulk-issuance script needs all three. A usage-monitoring script only needs Read.
  </Step>

  <Step title="Set the expiry and IP allowlist">
    The default expiry is 30 days, so we recommend a longer period. If your issuance script runs on a server with a fixed IP, we strongly recommend an IP allowlist. The allowlist can't be edited after creation, so get the script working without one first, then create a separate production token with an allowlist.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="Create a personal access token: name, expiry, IP allowlist and permissions" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **A token with Write and Reveal secret can create API keys that call models. Treat it like your account password.**

  A personal access token cannot call models itself, but it can issue keys that can. Give this kind of token
  **an IP allowlist**, store it in a secret manager rather than in code, never commit it to a repository,
  and replace it before it expires.
</Warning>

<Warning>
  **Legacy system tokens are scheduled to retire on 2026-11-11 (UTC+8).** AccessTokens generated under "Account Options - System Token" keep working until then. After that date they return 401 `ACCESS_TOKEN_LEGACY_RETIRED`.
  We will review usage and may extend the date, but we recommend switching to a personal access token now. When you switch, also check your scripts: **the create endpoint now returns a masked `key`**. To get the plaintext, call `POST /api/token/{id}/key` as described below.
  See [What Is a Personal Access Token?](/en/faq/personal-access-token)
</Warning>

## Endpoints

All endpoints authenticate the same way: put the personal access token in the `Authorization` header.
The `Bearer ` prefix is optional.

| Method | Path | Purpose | Permission |
| - | - | - | - |
| `GET` | `/api/token/?p=0&page_size=100` | List all tokens on your account (`key` is masked) | Read |
| `GET` | `/api/token/{id}` | Retrieve a single token | Read |
| `POST` | `/api/token/` | **Create a token** (`key` in the response is masked) | Write |
| `POST` | `/api/token/{id}/key` | **Retrieve the key's plaintext** | Reveal secret |
| `PUT` | `/api/token/` | Update a token (requires the complete object) | Write |
| `PUT` | `/api/token/?status_only=true` | Toggle enabled/disabled state only | Write |
| `DELETE` | `/api/token/{id}` | Delete a token | Write |

The base URL is `https://api.apiyi.com`.

## Creating a Token

### Request Example

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

### Request Fields

| Field | Type | Description |
| - | - | - |
| `name` | String | Token name, for your own identification |
| `remain_quota` | Integer | Quota cap in credits; 500,000 = \$1.00 |
| `unlimited_quota` | Boolean | Whether quota is unlimited; **defaults to `false`** |
| `group` | String | The group identifier the token is bound to, e.g. `default` |
| `models` | String | **Model allowlist**, comma-separated; omit for no restriction |
| `expired_time` | Integer | Expiry timestamp in Unix seconds; `-1` means never expires |

<Warning>
  **`unlimited_quota` defaults to `false` and `remain_quota` defaults to 0** — omitting both
  produces a token with zero quota that cannot be used. Either set `remain_quota` explicitly or
  set `unlimited_quota` to `true`.
</Warning>

<Warning>
  **Use the `models` field for the model allowlist.**

  The response structure also contains `model_limits`, `model_limits_enabled`, and `allow_ips`.
  Passing these does not raise an error — the endpoint still returns 200 — but they **currently have
  no effect**, and reading the token back shows them unset. Use `models` to restrict available
  models. Source-IP restrictions need to be implemented on your own side for now.
</Warning>

### Response Example

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
  **The `key` in the response is masked and can't be used directly.** To get the plaintext, call the
  retrieve-plaintext endpoint with the `id` from the response.
</Warning>

## Retrieve the Key Plaintext

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

* The personal access token needs **Model keys · Reveal secret**, otherwise you get 403 `ACCESS_TOKEN_SCOPE_DENIED`.
* The returned `key` **does not include the `sk-` prefix**. Prepend it yourself. In the example above, the actual API key is `sk-K1RPzapu…`.
* Save it right away and distribute it over a secure channel. Don't leave the response body in log files.

## Batch Creation

**There is no server-side batch endpoint** — passing something like `count` in the request body
has no effect and still creates a single token. Batch issuance is done by looping on the client.

<Warning>
  **A single user can hold at most 1,000 tokens.** This is an account-wide cap and it counts tokens
  that are disabled but not deleted. Once you hit it, the create endpoint fails — delete tokens you
  no longer use to free up slots.

  Before a batch run, page through `GET /api/token/?p=0&page_size=100` to count what you already
  have. When rotating keys, actually finish the last step of "create new key → shift traffic →
  disable old key → delete once no calls remain". Disabling without deleting keeps the slot occupied,
  so a few rotation cycles will run you into the cap.
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

## Using the Three Limits

### Quota limit

`remain_quota` caps what the token can spend. The conversion matches the
[Balance Query API](/en/api-capabilities/balance-query):

<Card title="Conversion Rule" icon="calculator">
  500,000 quota = \$1.00 USD
</Card>

For example, to issue a downstream customer a key capped at \$10, set `remain_quota` to
`5000000` with `unlimited_quota` set to `false`. Consumption so far is readable from the token's
`used_quota` field.

### Model limit

`models` is a comma-separated allowlist. Once set, calling a model outside the list is rejected:

```json theme={null}
{
  "error": {
    "message": "This token is not authorized to use model: deepseek-chat"
  }
}
```

The response is HTTP 403 and **no charge is incurred**. Omitting `models` means no restriction.

### Expiry limit

`expired_time` is a Unix-seconds timestamp, with `-1` meaning never. For example, a key that
expires in 30 days:

```python theme={null}
import time
expired_time = int(time.time()) + 30 * 86400
```

## Listing Tokens

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

Key fields:

| Field | Description |
| - | - |
| `id` | Token ID, used for updates and deletion |
| `key` | Masked key; see "Retrieve the Key Plaintext" for the plaintext |
| `status` | `1` = enabled, `2` = disabled |
| `remain_quota` / `used_quota` | Remaining / consumed quota |
| `unlimited_quota` | Whether quota is unlimited |
| `models` | Model allowlist; empty means no restriction |
| `expired_time` | Expiry timestamp; `-1` means never |

## Updating a Token

<Warning>
  **The update endpoint requires the complete object — it is not a patch.**

  The correct flow is: `GET` the full token object, modify the fields you want to change, then
  `PUT` **the whole object** back. Sending only the changed fields will clear the rest.
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

## Disabling and Deleting

### Disable (keeps the record)

Once disabled, the key stops working immediately — calls with it return 401 — but the token
record and its usage history are retained.

```python theme={null}
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]
token["status"] = 2      # 1 = enabled, 2 = disabled

requests.put(f"{BASE}/api/token/", headers=HEADERS,
             params={"status_only": "true"}, json=token, timeout=30)
```

### Delete (irreversible)

```bash theme={null}
curl --compressed -s -X DELETE 'https://api.apiyi.com/api/token/119431' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

Batch deletion is likewise a client-side loop:

```python theme={null}
for token_id in [119431, 119432, 119433]:
    requests.delete(f"{BASE}/api/token/{token_id}", headers=HEADERS, timeout=30)
```

<Info>
  Deletion cannot be undone. If you only want to suspend a key temporarily, disable it instead —
  the usage history stays available for reconciliation.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="The key returned at creation does not work — why?">
    The create endpoint returns a masked `key` (with a run of `*` in the middle), so it can't be used directly.
    Call `POST /api/token/{id}/key` with the returned `id` to get the plaintext (needs the Reveal secret permission),
    then prepend `sk-`. If an older script uses the `key` from the create response directly, add this step when you switch to a personal access token.
  </Accordion>

  <Accordion title="Why does my newly created token report insufficient quota?">
    Most likely neither `remain_quota` was set nor `unlimited_quota` was set to `true` at creation.
    That default combination produces a token with zero quota. Recreate it with one of the two
    specified explicitly.
  </Accordion>

  <Accordion title="Why do model_limits or allow_ips have no effect?">
    Those fields — along with `model_limits_enabled` — currently do not take effect. Passing them
    raises no error but nothing is stored. Use `models` to restrict available models; source-IP
    restrictions need to be handled on your own side for now.
  </Accordion>

  <Accordion title="Can I create several tokens in a single request?">
    There is no server-side batch endpoint, and passing something like `count` in the body has no
    effect. Loop the create call on the client instead — see the batch creation section above.
  </Accordion>

  <Accordion title="How many tokens can one account hold?">
    At most 1,000 per user, and tokens that are disabled but not deleted count toward that total.
    Once you reach the cap, creation fails until you delete tokens you no longer need. When
    rotating keys, remember to finish with the delete step — disabling alone keeps the slot taken.
  </Accordion>

  <Accordion title="My other fields got cleared after an update">
    The update endpoint requires the complete object. `GET` the full object first, modify it, then
    `PUT` the whole thing back rather than sending only the changed fields.
  </Accordion>

  <Accordion title="What is the difference between disabling and deleting?">
    Disabling (`status: 2`) stops the key working immediately but keeps the record and usage
    history, and you can set it back to `1` at any time. Deleting is irreversible and removes the
    record. For temporary suspension, prefer disabling.
  </Accordion>

  <Accordion title="How do I see how much each key has spent?">
    The token's `used_quota` field is that key's cumulative spend (÷ 500,000 = USD). For a
    per-period breakdown or call-level detail, filter by token name on the console log page — see
    [How to view my call records](/en/faq/call-logs).
  </Accordion>
</AccordionGroup>

## Important Notes

<Warning>
  **A personal access token is not an API key, and the two are not interchangeable**

  * An **API key** (starting with `sk-`) is for `/v1/*` inference endpoints
  * A **personal access token** (starting with `nap_`) is for `/api/*` management endpoints and cannot call models

  Error reference: 401 `ACCESS_TOKEN_LEGACY_RETIRED` means you are still using a retired legacy system token.
  401 `This access token may not be used from the current IP address.` means the request came from an IP outside the token's allowlist.
  403 `ACCESS_TOKEN_SCOPE_DENIED` means the token lacks the permission this endpoint needs (see the Endpoints table).
</Warning>

<Warning>
  **Handle plaintext keys carefully**

  The retrieve-plaintext endpoint returns a key that can call models directly. Therefore:

  * Do not write response bodies containing `key` into log files or commit them to a repository
  * Distribute keys to team members over secure channels, not group chats
  * This plaintext does not carry the `sk-` prefix, so **common secret scanners may not detect it** —
    do not rely on automated checks to catch it for you
</Warning>

<Info>
  **Operational tips**

  * When creating in bulk, add a modest delay between calls to avoid high instantaneous concurrency
  * Give each key a meaningful `name` (such as `team-alice` or `prod-webhook`) so you can attribute
    usage by `token_name` in the logs later
  * For rotation: create the new key, shift traffic, disable the old key, observe for a while, and
    only delete it once you confirm no calls remain
</Info>

<Card title="Related Documentation" icon="link">
  * [How to view my call records](/en/faq/call-logs) — per-key call detail and charges in the console
  * [Balance Query API](/en/api-capabilities/balance-query) — remaining account credit
  * [How to create an API key](/en/faq/token-management) — manual creation in the console
  * [Tokens and groups](/en/faq/token-and-groups) — what groups do and how to choose
</Card>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.