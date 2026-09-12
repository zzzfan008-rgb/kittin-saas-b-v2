> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Token 管理 API

> API キーをプログラムから作成、一覧表示、無効化、削除でき、一括発行と、各キーごとのクォータ、モデル、有効期限の制限を設定できます

## API 概要

Token 管理 API では、コンソールでキーを 1 つずつクリックして操作する代わりに、APIキーのライフサイクル全体をコードで管理できます。

最も一般的なユースケースは **一括発行** です。各チームメンバー、下流の顧客、またはプロジェクトにそれぞれ専用のキーを割り当て、**利用できる金額の上限**、**呼び出せるモデル**、**有効な期間** にそれぞれ制限を設定します。

<CardGroup cols={3}>
  <Card title="クォータ上限" icon="wallet">
    `remain_quota` は、このキーが合計で利用できる金額の上限を設定します
  </Card>

  <Card title="モデル上限" icon="list-checks">
    `models` は許可リストを設定し、それ以外への呼び出しは拒否されます
  </Card>

  <Card title="有効期限上限" icon="clock">
    `expired_time` は有効期限のタイムスタンプを設定し、その後はキーが動作しなくなります
  </Card>
</CardGroup>

<Info>
  1つか2つのキーだけ必要なら、コンソールのほうが速いです。[APIキーの作成方法](/ja/faq/token-management)を参照してください。この API は、自動発行、定期ローテーション、またはキー管理を自社システムに組み込む用途に向いています。
</Info>

## システムトークンの取得方法

トークン管理 API は **システムトークン** で認証します。これは API キーとは別物です。

<Steps>
  <Step title="コンソールにアクセス">
    プロフィールページにアクセスするには `api.apiyi.com/account/profile` を開いてください
  </Step>

  <Step title="システムトークンを見つける">
    ページ下部の「アカウントオプション - システムトークン」セクションを見つけてください
  </Step>

  <Step title="アクセストークンを生成">
    アカウントのパスワードを入力すると、その後の API クエリに使用できるアクセストークンを取得できます
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="システムトークンを取得" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

<Warning>
  **システムトークンでは API キーの作成と削除ができます。アカウントのパスワードと同じように扱ってください。**

  システムトークンはモデルを直接呼び出すことはできません — `/v1/chat/completions` に対して使用すると拒否されます —
  しかし、使用できる API キーを作成できます。**そのため、システムトークンの漏洩は 1 つの API キーの漏洩よりもはるかに深刻です。** コード内ではなくシークレットマネージャーに保管し、リポジトリには決してコミットせず、定期的にローテーションしてください。
</Warning>

## エンドポイント

すべてのエンドポイントは同じ方法で認証します。生のシステム token を `Authorization` ヘッダーに入れ、**`Bearer` プレフィックスは付けません**。

| Method   | Path                            | 用途                                       |
| -------- | ------------------------------- | ---------------------------------------- |
| `GET`    | `/api/token/?p=0&page_size=100` | アカウント内のすべての token を一覧表示します               |
| `GET`    | `/api/token/{id}`               | 単一の token を取得します                         |
| `POST`   | `/api/token/`                   | **token を作成します**; レスポンスはキーをプレーンテキストで返します |
| `PUT`    | `/api/token/`                   | token を更新します（完全なオブジェクトが必要です）             |
| `PUT`    | `/api/token/?status_only=true`  | 有効/無効の状態のみを切り替えます                        |
| `DELETE` | `/api/token/{id}`               | token を削除します                             |

ベース URL は `https://api.apiyi.com` です。

## トークンの作成

### リクエスト例

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

### リクエスト項目

| Field             | Type    | Description                           |
| ----------------- | ------- | ------------------------------------- |
| `name`            | String  | トークン名、識別用                             |
| `remain_quota`    | Integer | クレジット単位のクォータ上限；500,000 = \$1.00       |
| `unlimited_quota` | Boolean | クォータが無制限かどうか；**デフォルトは`false`です**      |
| `group`           | String  | トークンが紐づくグループ識別子。例：`default`           |
| `models`          | String  | **モデルの許可リスト**、カンマ区切り。制限しない場合は省略してください |
| `expired_time`    | Integer | Unix秒の有効期限タイムスタンプ；`-1` は無期限を意味します     |

<Warning>
  **`unlimited_quota` のデフォルトは `false` で、`remain_quota` のデフォルトは 0 です** — 両方を省略すると
  使用できないクォータ 0 のトークンが作成されます。`remain_quota` を明示的に設定するか、
  `unlimited_quota` を `true` に設定してください。
</Warning>

<Warning>
  **モデルの許可リストには `models` フィールドを使用してください。**

  レスポンス構造には `model_limits`、`model_limits_enabled`、`allow_ips` も含まれます。
  これらを渡してもエラーにはならず、エンドポイントは引き続き 200 を返しますが、現時点では
  効果はなく、トークンを取得し直しても未設定のままです。利用可能な
  モデルを制限するには `models` を使用してください。送信元 IP の制限は、現時点ではご自身で
  実装する必要があります。
</Warning>

### レスポンス例

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
  **レスポンス内の `key` はプレーンテキストで、`sk-` プレフィックスは含まれていません。** 自分で
  先頭に付ける必要があります — 上の例では、実際の API キーは `sk-K1RPzapu…` です。

  作成時にキーを保存して共有し、`key` を含むレスポンス本文を
  ログファイルに残したままにしないでください。
</Warning>

## バッチ作成

**サーバー側のバッチエンドポイントはありません** — リクエストボディに `count` のようなものを渡しても
効果はなく、単一の token が作成されるだけです。バッチ発行はクライアント側でループさせて行います。

<Warning>
  **1人のユーザーが保持できる token は最大 1,000 個です。** これはアカウント全体の上限であり、無効化されているが削除されていない token もカウントされます。上限に達すると作成エンドポイントは失敗します — 使っていない token を削除して枠を空けてください。

  バッチ実行の前に、`GET /api/token/?p=0&page_size=100` をページングして既にあるものを数えてください。キーをローテーションする場合は、実際に「新しいキーを作成 → トラフィックを移行 →
  古いキーを無効化 → 呼び出しがなくなったら削除」という最後の手順まで完了させてください。削除せずに無効化するだけだと枠が占有されたままになるため、数回のローテーションで上限に達してしまいます。
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

## 3つのリミットの使い方

### クォータ制限

`remain_quota` は token が使える金額の上限を設定します。換算は
[残高照会 API](/ja/api-capabilities/balance-query) と一致します:

<Card title="換算ルール" icon="calculator">
  500,000 クォータ = \$1.00 USD
</Card>

たとえば、下流の顧客に \$10 を上限とするキーを発行するには、`remain_quota` を
`5000000` に、`unlimited_quota` を `false` に設定します。これまでの消費量は、token の
`used_quota` フィールドから読み取れます。

### モデル制限

`models` は、カンマ区切りの許可リストです。一度設定すると、リスト外の model を呼び出すと拒否されます:

```json theme={null}
{
  "error": {
    "message": "This token is not authorized to use model: deepseek-chat"
  }
}
```

レスポンスは HTTP 403 で、**課金は発生しません**。`models` を省略すると、制限なしを意味します。

### 有効期限制限

`expired_time` は Unix 秒のタイムスタンプで、`-1` は期限なしを意味します。たとえば、30日後に期限切れになるキー:

```python theme={null}
import time
expired_time = int(time.time()) + 30 * 86400
```

## トークン一覧

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

主要フィールド:

| フィールド                         | 説明                            |
| ----------------------------- | ----------------------------- |
| `id`                          | 更新と削除に使用する Token ID           |
| `key`                         | `sk-` プレフィックスなしのプレーンテキストのキー   |
| `status`                      | `1` = 有効、`2` = 無効             |
| `remain_quota` / `used_quota` | 残り / 消費済みのクォータ                |
| `unlimited_quota`             | クォータが無制限かどうか                  |
| `models`                      | モデルの許可リスト。空の場合は制限なし           |
| `expired_time`                | 有効期限のタイムスタンプ。`-1` は期限なしを意味します |

## token の更新

<Warning>
  **更新エンドポイントには完全なオブジェクトが必要です。パッチではありません。**

  正しい流れは次のとおりです: `GET` 完全な token オブジェクトを取得し、変更したいフィールドを修正してから、
  `PUT` **オブジェクト全体** を送り返します。変更したフィールドだけを送ると、残りはクリアされます。
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

## 無効化と削除

### 無効化（記録は保持されます）

無効化すると、キーは直ちに動作しなくなります — そのキーを使った呼び出しは 401 を返します — ただし token の記録とその利用履歴は保持されます。

```python theme={null}
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]
token["status"] = 2      # 1 = enabled, 2 = disabled

requests.put(f"{BASE}/api/token/", headers=HEADERS,
             params={"status_only": "true"}, json=token, timeout=30)
```

### 削除（元に戻せません）

```bash theme={null}
curl --compressed -s -X DELETE 'https://api.apiyi.com/api/token/119431' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

一括削除も同様にクライアント側のループです:

```python theme={null}
for token_id in [119431, 119432, 119433]:
    requests.delete(f"{BASE}/api/token/{token_id}", headers=HEADERS, timeout=30)
```

<Info>
  削除は元に戻せません。key を一時的に停止したいだけなら、代わりに無効化してください —
  利用履歴は照合用に引き続き利用できます。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="作成時に返された key が動作しないのはなぜですか？">
    レスポンス内の `key` には `sk-` の接頭辞が含まれていません。自分で先頭に付けてください。
    使える API key は、返された値の前に `sk-` を付けたものです。
  </Accordion>

  <Accordion title="新しく作成した token がクォータ不足と報告されるのはなぜですか？">
    おそらく、作成時に `remain_quota` が設定されておらず、または `unlimited_quota` が `true` に設定されていませんでした。
    そのデフォルトの組み合わせだと、クォータが 0 の token になります。どちらか一方を明示的に指定して再作成してください。
  </Accordion>

  <Accordion title="なぜ model_limits や allow_ips は効かないのですか？">
    それらのフィールドは、`model_limits_enabled` とあわせて、現時点では有効になりません。渡しても
    エラーにはなりませんが、何も保存されません。利用可能なモデルを制限するには `models` を使ってください。送信元 IP
    の制限は、当面は各自で対応する必要があります。
  </Accordion>

  <Accordion title="1 回のリクエストで複数の token を作成できますか？">
    サーバー側のバッチ用エンドポイントはなく、body に `count` のようなものを渡しても
    効果はありません。代わりにクライアント側で create 呼び出しをループしてください。上の一括作成セクションを参照してください。
  </Accordion>

  <Accordion title="1 つのアカウントで token は何個保持できますか？">
    1 ユーザーあたり最大 1,000 個です。無効化されていても削除されていない token は、その合計に含まれます。
    上限に達すると、不要な token を削除するまで作成は失敗します。key をローテーションする際は、
    最後に削除ステップまで完了させてください。無効化だけではスロットが占有されたままです。
  </Accordion>

  <Accordion title="更新後に他のフィールドが消えてしまいました">
    update エンドポイントは完全なオブジェクトを必要とします。まず `GET` で完全なオブジェクトを取得し、編集してから、
    変更したフィールドだけを送るのではなく `PUT` 全体を送り返してください。
  </Accordion>

  <Accordion title="無効化と削除の違いは何ですか？">
    無効化（`status: 2`）すると key はすぐに動作しなくなりますが、レコードと使用履歴は保持され、
    いつでも `1` に戻せます。削除は元に戻せず、レコードも削除されます。一時的に停止するなら、無効化を使うのがおすすめです。
  </Accordion>

  <Accordion title="各 key の使用額を確認するにはどうすればよいですか？">
    token の `used_quota` フィールドが、その key の累計使用額です（÷ 500,000 = USD）。期間ごとの内訳や呼び出し単位の詳細は、
    コンソールのログページで token 名で絞り込んで確認できます — [呼び出し記録を確認する方法](/ja/faq/call-logs) を参照してください。
  </Accordion>
</AccordionGroup>

## 重要な注意事項

<Warning>
  **システム token は API key ではなく、両者は互換性がありません**

  * **API key**（`sk-` で始まるもの）は `/v1/*` 推論エンドポイント向けです
  * **システム token**（プレフィックスのないプレーンな文字列）は `/api/*` 管理エンドポイント向けです

  取り違えると、それぞれ 401 と invalid-token エラーが返ります。
</Warning>

<Warning>
  **プレーンテキストのキーは慎重に扱ってください**

  作成レスポンスと token リストの両方で、キーはプレーンテキストで返されます。そのため:

  * `key` を含むレスポンス本文をログファイルに書き込んだり、リポジトリにコミットしたりしないでください
  * キーはグループチャットではなく、安全なチャネルでチームメンバーに共有してください
  * このプレーンテキストには `sk-` プレフィックスが付かないため、**一般的な secret scanner では検出できない場合があります** —
    自動チェックに頼って見つけさせようとしないでください
</Warning>

<Info>
  **運用のヒント**

  * 一括作成するときは、高い瞬間的な同時実行数を避けるため、各呼び出しの間に少し遅延を入れてください
  * 各キーに意味のある `name`（たとえば `team-alice` や `prod-webhook`）を付けて、後でログ上で `token_name` ごとの使用状況を把握できるようにしてください
  * ローテーションでは、新しいキーを作成し、トラフィックを切り替え、古いキーを無効化して、しばらく様子を見てください。
    呼び出しが残っていないと確認できてから削除してください
</Info>

<Card title="関連ドキュメント" icon="link">
  * [自分の呼び出し記録を確認する方法](/ja/faq/call-logs) — コンソールでキーごとの呼び出し詳細と課金
  * [残高照会 API](/ja/api-capabilities/balance-query) — アカウント残高
  * [API key の作成方法](/ja/faq/token-management) — コンソールでの手動作成
  * [token とグループ](/ja/faq/token-and-groups) — グループの役割と選び方
</Card>
