> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 令牌管理 API

> 用程序创建、查询、禁用和删除 API Key，支持批量发放并按额度、模型、有效期三重限制

## 接口概述

令牌管理接口让你用程序完成 API Key 的全生命周期管理，不必逐个在控制台点击。

最常见的场景是**批量发放**：给团队成员、给下游客户、给不同项目各发一把 Key，
并分别限制**能花多少钱**、**能用哪些模型**、**用到什么时候**。

<CardGroup cols={3}>
  <Card title="额度限制" icon="wallet">
    `remain_quota` 设定这把 Key 最多能消费多少
  </Card>

  <Card title="模型限制" icon="list-checks">
    `models` 设定白名单，调用名单外的模型直接被拒
  </Card>

  <Card title="有效期限制" icon="clock">
    `expired_time` 设定到期时间，到点自动失效
  </Card>
</CardGroup>

<Info>
  只需要建一两把 Key 的话，直接用控制台更快，见 [如何创建 KEY](/faq/token-management)。
  本接口面向需要自动化发放、定期轮换、或把 Key 管理接入自有系统的场景。
</Info>

## 如何获取系统令牌

令牌管理接口用**系统令牌**认证，与 API Key 不是一回事。

<Steps>
  <Step title="访问控制台">
    访问 `api.apiyi.com/account/profile` 个人中心页面
  </Step>

  <Step title="找到系统令牌">
    在页面最下方找到「账号选项 - 系统令牌」部分
  </Step>

  <Step title="生成 AccessToken">
    输入当前的账户密码后，会得到一个 AccessToken，该密钥可用于后续接口的查询数据
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="获取系统令牌" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

<Warning>
  **系统令牌可以创建和删除 API Key，请像保管账号密码一样保管它。**

  系统令牌本身不能调用模型（拿去请求 `/v1/chat/completions` 会被拒绝），但它能创建出可以调用
  模型的 API Key。因此**泄漏系统令牌的后果比泄漏单把 API Key 严重得多** ——
  请存进密钥管理工具而不是写在代码里，不要提交进代码仓库，并定期轮换。
</Warning>

## 端点一览

所有端点的认证方式相同：`Authorization` 请求头填系统令牌裸值，**不加 `Bearer` 前缀**。

| 方法       | 路径                              | 用途                    |
| -------- | ------------------------------- | --------------------- |
| `GET`    | `/api/token/?p=0&page_size=100` | 列出本账号所有令牌             |
| `GET`    | `/api/token/{id}`               | 查询单个令牌                |
| `POST`   | `/api/token/`                   | **创建令牌**，响应直接返回明文 key |
| `PUT`    | `/api/token/`                   | 更新令牌（需传完整对象）          |
| `PUT`    | `/api/token/?status_only=true`  | 只切换启用/禁用状态            |
| `DELETE` | `/api/token/{id}`               | 删除令牌                  |

基础地址为 `https://api.apiyi.com`。

## 创建令牌

### 请求示例

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

### 请求字段

| 字段                | 类型      | 说明                         |
| ----------------- | ------- | -------------------------- |
| `name`            | String  | 令牌名称，用于自己识别用途              |
| `remain_quota`    | Integer | 额度上限（额度数），500,000 = \$1.00 |
| `unlimited_quota` | Boolean | 是否不限额度；**缺省为 `false`**     |
| `group`           | String  | 令牌绑定的分组标识符，如 `default`     |
| `models`          | String  | **模型白名单**，逗号分隔；不传表示不限      |
| `expired_time`    | Integer | 过期时间戳（Unix 秒），`-1` 表示永不过期  |

<Warning>
  **`unlimited_quota` 缺省为 `false`，而 `remain_quota` 缺省为 0** —— 两者一起缺省时会建出一把
  额度为 0、无法使用的令牌。要么显式给 `remain_quota` 赋值，要么把 `unlimited_quota` 设为 `true`。
</Warning>

<Warning>
  **模型白名单请使用 `models` 字段。**

  响应结构里还存在 `model_limits`、`model_limits_enabled`、`allow_ips` 三个字段，
  传入它们不会报错（接口仍返回 200），但**当前不会生效** —— 回读时这些字段仍为空。
  需要限制可用模型请使用 `models`，需要限制来源 IP 请在自己的服务侧实现。
</Warning>

### 响应示例

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
  **响应里的 `key` 是明文，且不含 `sk-` 前缀。** 实际使用时需要自己拼上前缀，
  即上例中真正的 API Key 是 `sk-K1RPzapu…`。

  请在创建时就妥善保存并分发，不要把包含 `key` 的响应体留在日志文件里。
</Warning>

## 批量创建

**服务端没有批量创建接口** —— 在请求体里传 `count` 之类的参数不会生效，仍然只创建一把。
批量发放的做法是在客户端循环调用创建接口。

<Warning>
  **单个用户最多 1000 个令牌。** 这是账号级别的总量上限，包含已禁用但未删除的令牌。
  达到上限后创建接口会失败，需要先删除不再使用的令牌腾出名额。

  批量发放前先用 `GET /api/token/?p=0&page_size=100` 翻页统计当前数量，
  把「新建 Key → 切流量 → 禁用旧 Key → 确认无调用后删除」中的最后一步真正执行到位，
  不要只禁用不删除，否则轮换几轮就会撞到上限。
</Warning>

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json
    import os

    import requests

    BASE = "https://api.apiyi.com"
    HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
               "Content-Type": "application/json"}
    QUOTA_PER_USD = 500_000


    def create_token(name, quota_usd=None, group="default", models=None, days=0):
        """创建一把令牌。quota_usd 为 None 表示不限额度，days 为 0 表示永不过期。"""
        import time
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

        # 明文 key 只在创建时返回，注意妥善保存与分发
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

## 三重限制怎么用

### 额度限制

`remain_quota` 是这把令牌能消费的额度上限，换算关系与[余额查询](/api-capabilities/balance-query) 一致：

<Card title="换算规则" icon="calculator">
  500,000 额度 = \$1.00 美金 (USD)
</Card>

例如给下游客户发一把最多消费 \$10 的 Key，就设 `remain_quota: 5000000` 且
`unlimited_quota: false`。用量可以从令牌的 `used_quota` 字段读取。

### 模型限制

`models` 是逗号分隔的白名单。设置后，用这把 Key 调用名单外的模型会被直接拒绝：

```json theme={null}
{
  "error": {
    "message": "该令牌无权使用模型：deepseek-chat"
  }
}
```

返回 HTTP 403，**不产生扣费**。不传 `models` 表示不限制。

### 有效期限制

`expired_time` 是 Unix 秒时间戳，`-1` 表示永不过期。例如发一把 30 天后失效的 Key：

```python theme={null}
import time
expired_time = int(time.time()) + 30 * 86400
```

## 查询令牌

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

关键字段：

| 字段                            | 说明                  |
| ----------------------------- | ------------------- |
| `id`                          | 令牌 ID，更新与删除时用       |
| `key`                         | Key 明文（不含 `sk-` 前缀） |
| `status`                      | `1` = 启用，`2` = 禁用   |
| `remain_quota` / `used_quota` | 剩余 / 已用额度           |
| `unlimited_quota`             | 是否不限额度              |
| `models`                      | 模型白名单，空表示不限         |
| `expired_time`                | 过期时间戳，`-1` 表示永不过期   |

## 更新令牌

<Warning>
  **更新接口需要传完整对象，不是增量更新（patch）。**

  正确做法是：先 `GET` 拿到令牌的完整对象 → 修改需要变更的字段 → 把**整个对象** `PUT` 回去。
  只传要改的那几个字段会把其余字段清空。
</Warning>

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
           "Content-Type": "application/json"}

# 1. 取回完整对象
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]

# 2. 只改需要变的字段，其余原样保留
token["remain_quota"] = 2_500_000     # 提到 $5
token["models"] = "gpt-5.6,gemini-3-pro"

# 3. 整个对象 PUT 回去
resp = requests.put(f"{BASE}/api/token/", headers=HEADERS, json=token, timeout=30)
print(resp.json()["success"])
```

## 禁用与删除

### 禁用（保留记录）

禁用后该 Key 立即失效，再用它调用模型会返回 401，但令牌记录和历史用量仍然保留。

```python theme={null}
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]
token["status"] = 2      # 1 = 启用，2 = 禁用

requests.put(f"{BASE}/api/token/", headers=HEADERS,
             params={"status_only": "true"}, json=token, timeout=30)
```

### 删除（不可恢复）

```bash theme={null}
curl --compressed -s -X DELETE 'https://api.apiyi.com/api/token/119431' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

批量删除同样在客户端循环即可：

```python theme={null}
for token_id in [119431, 119432, 119433]:
    requests.delete(f"{BASE}/api/token/{token_id}", headers=HEADERS, timeout=30)
```

<Info>
  删除是不可恢复操作。如果只是想临时停用，用上面的禁用方式，历史用量记录会保留下来便于对账。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="创建时返回的 key 怎么直接不能用？">
    响应里的 `key` 不含 `sk-` 前缀，实际使用时需要自己拼上，即 `sk-` + `key` 的值。
  </Accordion>

  <Accordion title="为什么我建出来的令牌一调用就提示额度不足？">
    最可能的原因是创建时既没传 `remain_quota`，也没把 `unlimited_quota` 设为 `true` ——
    两者的缺省组合会建出一把额度为 0 的令牌。重新创建时显式指定其中之一即可。
  </Accordion>

  <Accordion title="传了 model_limits 或 allow_ips 为什么没有效果？">
    这两个字段（以及 `model_limits_enabled`）当前不生效，传入不会报错但也不会落库。
    限制可用模型请使用 `models` 字段；限制来源 IP 目前需要在你自己的服务侧实现。
  </Accordion>

  <Accordion title="能一次创建多把令牌吗？">
    服务端没有批量创建接口，在请求体里传 `count` 之类的参数不会生效。
    批量发放请在客户端循环调用创建接口，参考上面「批量创建」一节的示例。
  </Accordion>

  <Accordion title="一个账号最多能有多少把令牌？">
    单个用户最多 1000 个令牌，已禁用但未删除的也计入这个总量。达到上限后创建接口会失败，
    需要先删除不再使用的令牌。轮换 Key 时记得走到「删除」这一步，只禁用不删除会占着名额。
  </Accordion>

  <Accordion title="更新令牌后其他字段被清空了？">
    更新接口需要传完整对象。先 `GET` 拿到完整对象，改完再整个 `PUT` 回去，
    不要只传要改的那几个字段。
  </Accordion>

  <Accordion title="禁用和删除有什么区别？">
    禁用（`status: 2`）后 Key 立即失效，但令牌记录与历史用量保留，可以随时改回 `1` 恢复。
    删除是不可恢复的，记录一并移除。临时停用建议用禁用。
  </Accordion>

  <Accordion title="怎么知道每把 Key 各自花了多少钱？">
    令牌对象的 `used_quota` 字段就是这把 Key 的累计消费（÷ 500,000 = 美元）。
    需要按时间段拆分或看每次调用的明细，去控制台日志页按令牌名筛选，
    见[如何查看我的调用记录](/faq/call-logs)。
  </Accordion>
</AccordionGroup>

## 注意事项

<Warning>
  **系统令牌不是 API Key，两者不能互换**

  * **API Key**（`sk-` 开头）用于 `/v1/*` 推理端点
  * **系统令牌**（一串不带前缀的字符）用于 `/api/*` 管理端点

  用错会分别得到 401 与 `Invalid token` 错误。
</Warning>

<Warning>
  **妥善保管明文 Key**

  创建接口的响应体、以及令牌列表接口的返回，都包含 Key 明文。请注意：

  * 不要把包含 `key` 的原始响应写进日志文件或提交进代码仓库
  * 分发给团队成员时使用安全渠道，不要通过聊天群直接发送
  * 这段明文不带 `sk-` 前缀，**常见的密钥扫描工具可能扫不出来**，不要依赖自动化检查兜底
</Warning>

<Info>
  **操作建议**

  * 批量创建时建议在循环里加适度间隔，避免瞬时并发过高
  * 给每把 Key 起有意义的 `name`（如 `team-alice`、`prod-webhook`），便于后续在日志里按 `token_name` 归因
  * 定期轮换：新建 Key → 切流量 → 禁用旧 Key 观察一段时间 → 确认无调用后再删除
</Info>

<Card title="相关文档" icon="link">
  * [如何查看我的调用记录](/faq/call-logs) —— 在控制台查每把 Key 的调用明细与扣费
  * [余额查询 API](/api-capabilities/balance-query) —— 查账号剩余额度
  * [如何创建 KEY](/faq/token-management) —— 控制台手动创建
  * [令牌与分组](/faq/token-and-groups) —— 分组的作用与选择
</Card>
