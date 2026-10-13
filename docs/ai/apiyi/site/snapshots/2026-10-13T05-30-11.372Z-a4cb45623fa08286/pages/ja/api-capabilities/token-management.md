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

## パーソナルアクセス token の取得方法

Token 管理 API は、**パーソナルアクセス token**（`nap_`で始まる）で認証を行いますが、これは API キーとは異なります。

<Steps>
  <Step title="パーソナルアクセス tokens を開く">
    `api.apiyi.com/account/profile`のプロフィールページに移動します。**アカウントオプション**配下の **Personal Access Tokens** → **Create Token** をクリックします。
  </Step>

  <Step title="必要な Model keys の権限を選択する">
    3つの権限は独立しています。使用するもののみを選択してください：

    | 行いたい操作 | 選択する権限 |
    | - | - |
    | API キーの一覧表示または取得 | Model keys · Read |
    | API キーの作成、更新、無効化、または削除 | Model keys · Write |
    | 新しい API キーのプレーンテキストを取得（配布用） | Model keys · Reveal secret |

    一括発行スクリプトには3つすべてが必要です。使用状況監視スクリプトには Read のみが必要です。
  </Step>

  <Step title="有効期限と IP 許可リストを設定する">
    デフォルトの有効期限は30日間であるため、より長い期間を設定することをお勧めします。発行スクリプトが固定 IP を持つサーバー上で動作する場合は、IP 許可リストの設定を強く推奨します。許可リストは作成後に編集できないため、まずは許可リストなしでスクリプトの動作を確認し、その後、許可リストを設定した本番用の別の token を作成してください。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="パーソナルアクセス token の作成：名前、有効期限、IP 許可リスト、権限" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **Write および Reveal secret 権限を持つ token は、モデルを呼び出す API キーを作成できます。アカウントのパスワードと同様に取り扱ってください。**

  パーソナルアクセス token 自体はモデルを呼び出すことはできませんが、呼び出し可能なキーを発行できます。このような token には**IP 許可リスト**を設定し、コード内ではなくシークレットマネージャーに保存し、リポジトリには絶対にコミットせず、有効期限が切れる前に更新してください。
</Warning>

<Warning>
  **レガシーなシステム tokens は 2026-11-11 (UTC+8) に廃止予定です。** 「アカウントオプション - システム token」配下で生成された AccessTokens は、その日まで引き続き機能します。その日付以降は 401 `ACCESS_TOKEN_LEGACY_RETIRED` を返します。
  使用状況を確認した上で期日を延長する可能性もありますが、今すぐパーソナルアクセス token に切り替えることをお勧めします。切り替える際は、スクリプトも確認してください。**作成エンドポイントはマスクされた `key` を返すようになりました**。プレーンテキストを取得するには、以下で説明するように `POST /api/token/{id}/key` を呼び出してください。
  [パーソナルアクセス token とは？](/ja/faq/personal-access-token) を参照してください。
</Warning>

## エンドポイント

すべてのエンドポイントで認証方法は共通です。`Authorization` ヘッダーにパーソナルアクセストークンを設定します。
`Bearer ` プレフィックスは任意です。

| メソッド | パス | 目的 | 権限 |
| - | - | - | - |
| `GET` | `/api/token/?p=0&page_size=100` | アカウント内のすべての tokens を一覧取得（`key` はマスクされます） | 読み取り |
| `GET` | `/api/token/{id}` | 単一の token を取得 | 読み取り |
| `POST` | `/api/token/` | **token を作成**（レスポンス内の `key` はマスクされます） | 書き込み |
| `POST` | `/api/token/{id}/key` | **キーのプレーンテキストを取得** | シークレットの表示 |
| `PUT` | `/api/token/` | token を更新（完全なオブジェクトが必要） | 書き込み |
| `PUT` | `/api/token/?status_only=true` | 有効/無効状態の切り替えのみ | 書き込み |
| `DELETE` | `/api/token/{id}` | token を削除 | 書き込み |

ベース URL は `https://api.apiyi.com` です。

## Tokenの作成

### リクエスト例

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

### リクエストフィールド

| フィールド | タイプ | 説明 |
| - | - | - |
| `name` | String | Token名（自身の識別用） |
| `remain_quota` | Integer | クレジット単位のクォータ上限。500,000 = \$1.00 |
| `unlimited_quota` | Boolean | クォータが無制限かどうか。**デフォルトは `false`** |
| `group` | String | tokenがバインドされているグループ識別子（例: `default`） |
| `models` | String | **モデルの許可リスト**（カンマ区切り）。制限なしの場合は省略 |
| `expired_time` | Integer | Unix秒単位の有効期限タイムスタンプ。`-1` は無期限を意味します |

<Warning>
  **`unlimited_quota` はデフォルトで `false`、`remain_quota` はデフォルトで 0 です** — 両方を省略するとクォータがゼロの token が生成され、使用できません。`remain_quota` を明示的に設定するか、`unlimited_quota` を `true` に設定してください。
</Warning>

<Warning>
  **モデルの許可リストには `models` フィールドを使用してください。**

  レスポンス構造には `model_limits`、`model_limits_enabled`、`allow_ips` も含まれます。
  これらを渡してもエラーは発生せず、エンドポイントは 200 を返しますが、**現時点では効果がなく**、token を再取得しても未設定の状態で表示されます。利用可能なモデルを制限するには `models` を使用してください。送信元IP制限は、現時点ではご自身側で実装する必要があります。
</Warning>

### レスポンス例

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
  **レスポンス内の `key` はマスクされており、直接使用することはできません。** 平文を取得するには、レスポンスの `id` を使用して平文取得エンドポイントを呼び出してください。
</Warning>

## キーの平文を取得する

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

* パーソナルアクセストークンには**Model keys · Reveal secret**の権限が必要です。ない場合は403 `ACCESS_TOKEN_SCOPE_DENIED`が返されます。
* 返される`key`には\*\*`sk-`プレフィックスが含まれていません\*\*。ご自身で先頭に付加してください。上記の例では、実際のAPIキーは`sk-K1RPzapu…`になります。
* 取得後はすぐに保存し、安全なチャネル経由で配布してください。レスポンスボディをログファイルに残さないようにしてください。

## 一括作成

**サーバー側の一括エンドポイントはありません** — リクエストボディに `count` などを渡しても効果はなく、単一の token のみが作成されます。一括発行はクライアント側でループ処理を行って実行します。

<Warning>
  **1人のユーザーが保持できるのは最大 1,000 tokens です。** これはアカウント全体の上限であり、削除されずに無効化されている token もカウントされます。上限に達すると、作成エンドポイントは失敗します — スロットを解放するために、使用しなくなった token を削除してください。

  一括実行を行う前に、`GET /api/token/?p=0&page_size=100` をページングして既存の数量を確認してください。キーをローテーションする際は、「新しいキーの作成 → トラフィックの移行 → 古いキーの無効化 → 呼び出しが残っていないことを確認して削除」という最後の手順まで確実に完了させてください。削除せずに無効化するだけではスロットが占有されたままになるため、数回のローテーションサイクルで上限に達してしまいます。
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

## tokenの一覧表示

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

主要なフィールド:

| フィールド | 説明 |
| - | - |
| `id` | token ID。更新および削除に使用されます |
| `key` | マスクされたキー。平文については「キー平文の取得」を参照してください |
| `status` | `1` = 有効、`2` = 無効 |
| `remain_quota` / `used_quota` | 残りクォータ / 消費済みクォータ |
| `unlimited_quota` | クォータが無制限かどうか |
| `models` | モデルの許可リスト。空の場合は制限なしを意味します |
| `expired_time` | 有効期限のタイムスタンプ。`-1` は無期限を意味します |

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

## FAQ

<AccordionGroup>
  <Accordion title="作成時に返されたキーが機能しないのはなぜですか？">
    作成エンドポイントはマスクされた`key`（中央が連続した`*`になっている）を返すため、そのまま直接使用することはできません。
    返された`id`を指定して`POST /api/token/{id}/key`を呼び出し、平文を取得してから（シークレット表示権限が必要です）、
    先頭に`sk-`を付加してください。古いスクリプトが作成レスポンスの`key`を直接使用している場合は、パーソナルアクセストークンに切り替える際にこのステップを追加してください。
  </Accordion>

  <Accordion title="新しく作成したtokenでクォータ不足と報告されるのはなぜですか？">
    作成時に`remain_quota`が設定されておらず、かつ`unlimited_quota`も`true`に設定されていなかった可能性が最も高いです。
    このデフォルトの組み合わせでは、クォータがゼロのtokenが生成されます。どちらか一方を明示的に指定して再作成してください。
  </Accordion>

  <Accordion title="model_limits または allow_ips が反映されないのはなぜですか？">
    これらのフィールドは（`model_limits_enabled`を含め）現在機能しません。これらを渡してもエラーは発生しませんが、何も保存されません。利用可能なモデルを制限するには`models`を使用してください。送信元IPの制限は、現時点ではクライアント側で処理する必要があります。
  </Accordion>

  <Accordion title="1回のリクエストで複数のtokenを作成できますか？">
    サーバー側の一括処理エンドポイントは存在せず、リクエストボディに`count`などを渡しても効果はありません。代わりにクライアント側で作成呼び出しをループ処理してください。上記の一括作成セクションを参照してください。
  </Accordion>

  <Accordion title="1つのアカウントで保持できるtokenの数はいくつですか？">
    1ユーザーあたり最大1,000個まで保持でき、無効化されていても削除されていないtokenもこの合計にカウントされます。
    上限に達すると、不要なtokenを削除するまで作成に失敗します。キーをローテーションする際は、必ず最後に削除手順を実行してください。無効化だけではスロットが占有されたままになります。
  </Accordion>

  <Accordion title="更新後に他のフィールドが消去されてしまいました">
    更新エンドポイントには完全なオブジェクトが必要です。変更されたフィールドのみを送信するのではなく、まず完全なオブジェクトを`GET`し、変更を加えた後、全体を`PUT`してください。
  </Accordion>

  <Accordion title="無効化と削除の違いは何ですか？">
    無効化（`status: 2`）すると、キーは直ちに機能しなくなりますが、レコードと使用履歴は保持され、いつでも`1`に戻すことができます。削除は元に戻せず、レコードも削除されます。一時的に停止したい場合は、無効化することをお勧めします。
  </Accordion>

  <Accordion title="各キーがどれだけ消費したかを確認するにはどうすればよいですか？">
    tokenの`used_quota`フィールドは、そのキーの累計消費額です（÷ 500,000 = USD）。期間ごとの内訳や呼び出しレベルの詳細については、コンソールのログページでtoken名でフィルタリングしてください。[呼び出し履歴の確認方法](/ja/faq/call-logs)を参照してください。
  </Accordion>
</AccordionGroup>

## 重要な注意事項

<Warning>
  **パーソナルアクセストークンは API キーではなく、両者に互換性はありません**

  * **API キー**（`sk-` で始まります）は `/v1/*` 推論エンドポイント用です
  * **パーソナルアクセストークン**（`nap_` で始まります）は `/api/*` 管理エンドポイント用であり、モデルを呼び出すことはできません

  エラーリファレンス：401 `ACCESS_TOKEN_LEGACY_RETIRED` は、廃止されたレガシーシステムトークンをまだ使用していることを意味します。
  401 `This access token may not be used from the current IP address.` は、トークンのホワイトリスト外の IP からリクエストが送信されたことを意味します。
  403 `ACCESS_TOKEN_SCOPE_DENIED` は、このエンドポイントに必要な権限がトークンに不足していることを意味します（エンドポイント一覧表を参照してください）。
</Warning>

<Warning>
  **平文キーの取り扱いにご注意ください**

  平文取得エンドポイントは、モデルを直接呼び出すことができるキーを返します。そのため、以下の点にご注意ください。

  * `key` を含むレスポンスボディをログファイルに記録したり、リポジトリにコミットしたりしないでください
  * キーをチームメンバーに配布する際は、グループチャットではなく安全なチャネルを使用してください
  * この平文には `sk-` プレフィックスが付いていないため、**一般的なシークレットスキャナーで検出されない可能性があります** — 自動チェックによる検出に依存しないでください
</Warning>

<Info>
  **運用のヒント**

  * 一括作成する際は、瞬間的な高い同時実行数を避けるため、呼び出し間に適度な遅延を設けてください
  * 後でログ内で `token_name` ごとに使用状況を特定できるよう、各キーにわかりやすい `name`（`team-alice` や `prod-webhook` など）を付けてください
  * ローテーションの場合：新しいキーを作成し、トラフィックを移行させ、古いキーを無効化してしばらく観察し、呼び出しが残っていないことを確認してから削除してください
</Info>

<Card title="関連ドキュメント" icon="link">
  * [呼び出し履歴の確認方法](/ja/faq/call-logs) — コンソールでのキーごとの呼び出し詳細および料金
  * [残高照会 API](/ja/api-capabilities/balance-query) — アカウントの残高
  * [API キーの作成方法](/ja/faq/token-management) — コンソールでの手動作成
  * [トークンとグループ](/ja/faq/token-and-groups) — グループの役割と選択方法
</Card>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.