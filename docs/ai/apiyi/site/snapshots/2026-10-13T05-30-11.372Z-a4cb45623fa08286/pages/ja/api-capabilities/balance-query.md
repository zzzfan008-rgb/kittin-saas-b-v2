> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 残高照会 API

> アカウント残高、利用クォータ、リクエスト数を取得し、残高の事前監視とアラートを有効にします

## API概要

Balance Query API は、合計クォータ、使用済みクォータ、残高、リクエスト数を含む、アカウントの現在のクォータ使用状況を取得します。

この API を使うと、アカウントの残高を簡単に監視でき、事前かつ柔軟な残高アラート管理が可能になります。

## Authorization token の取得方法

この API は**パーソナルアクセス token**（`nap_`で始まる形式）で認証します。モデルの呼び出しに使用する API Key とは異なります。

<Steps>
  <Step title="パーソナルアクセス tokens を開く">
    `api.apiyi.com/account/profile` のプロフィールページにアクセスします。**アカウントオプション**で、**パーソナルアクセス tokens** → **token を作成**をクリックします。
  </Step>

  <Step title="権限を選択する">
    この API に必要な権限は **プロフィール · 読み取り** のみです。デフォルトの有効期限は30日間ですので、より長い期間を選択することをおすすめします。
  </Step>

  <Step title="token を保存する">
    token が作成されたらすぐにコピーし、`Authorization` ヘッダーに設定します。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="パーソナルアクセス token の作成：名前、有効期限、IP 許可リスト、権限" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **旧来のシステム tokens は 2026-11-11 (UTC+8) に廃止される予定です。**「アカウントオプション - システム token」で生成された AccessTokens は、その期日まで引き続き機能します。その期日以降は 401 `ACCESS_TOKEN_LEGACY_RETIRED` を返します。
  利用状況を確認した上で期日を延長する可能性もありますが、今すぐパーソナルアクセス token への切り替えをおすすめします。ヘッダーの値を置き換えるだけで、コードを変更する必要はありません。
  有効期限、IP 許可リスト、権限の詳細については、[パーソナルアクセス token とは？](/ja/faq/personal-access-token) を参照してください。
</Warning>

## API 情報

| 項目 | 説明 |
| - | - |
| **API URL** | `https://api.apiyi.com/api/user/self` |
| **メソッド** | `GET` |
| **認証** | Authorization ヘッダー（パーソナルアクセス token。`Bearer ` プレフィックスは省略可能） |
| **レスポンス形式** | JSON |

## リクエスト詳細

### リクエストヘッダー

| ヘッダー名 | 必須 | 説明 |
| - | - | - |
| `Authorization` | はい | プレーン文字列としてのパーソナル access token |
| `Accept` | いいえ | 推奨: `application/json` |
| `Content-Type` | いいえ | 推奨: `application/json` |

### リクエストパラメータ

<Info>
  これはGETリクエストのため、リクエストボディパラメータは**不要です**。
</Info>

## レスポンス詳細

### 成功レスポンス例

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

### 主なレスポンスフィールド

| Field Name | Type | Description |
| - | - | - |
| `success` | Boolean | リクエストが成功したかどうか |
| `message` | String | エラーメッセージ（成功時は null） |
| `data.username` | String | ユーザー名 |
| `data.display_name` | String | 表示名 |
| `data.quota` | Integer | **残りクォータ**（現在利用可能な残高、quota単位） |
| `data.used_quota` | Integer | **使用済みクォータ**（quota単位） |
| `data.request_count` | Integer | **総リクエスト数** |
| `data.group` | String | ユーザーグループ |
| `data.ModelFixedPrice` | Array | モデルの料金一覧（無視してかまいません） |

### クォータ換算

<Card title="換算ルール" icon="calculator">
  500,000 quota = \$1.00 USD
</Card>

**計算式:**

* USD 金額 = quota ÷ 500,000
* 残りクォータ = quota（quota は現在の残高を表します）
* 残り USD = quota ÷ 500,000

**例:**

* `quota: 24997909` → \$49.99 USD（現在の残高）
* `used_quota: 10027091` → \$20.05 USD（使用額）

## エラーレスポンス

### HTTP 401 - 認証失敗

```json theme={null}
{
  "success": false,
  "message": "Unauthorized"
}
```

**原因:** token が無効であるか、有効期限切れ、または削除されています。アカウントのパスワード、2要素認証、またはパスキーを変更すると、すべてのパーソナルアクセス token が無効化されます。

**解決策:** コンソールで新しいパーソナルアクセス token を作成してください。

他の2つの401レスポンスには、明示的なメッセージが含まれています:

| メッセージ | 原因 |
| - | - |
| `ACCESS_TOKEN_LEGACY_RETIRED` | 廃止されたレガシーシステム token を使用しています。パーソナルアクセス token に切り替えてください。 |
| `This access token may not be used from the current IP address.` | リクエストが token の許可リスト外の IP から送信されました。許可リストは編集できないため、新しい token を作成してください。 |

### HTTP 403 - 権限拒否

```json theme={null}
{
  "code": "ACCESS_TOKEN_SCOPE_DENIED",
  "message": "This endpoint is outside this access token’s granted permissions.",
  "success": false
}
```

**原因:** パーソナルアクセス token に **Profile · Read** がありません。

**解決策:** その権限を持つ新しい token を作成してください。権限は作成後に変更できません。

## コード例

### cURLの例

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **重要：** APIはgzip圧縮されたコンテンツを返すため、`--compressed`オプションが必須です。指定しない場合、文字化けした出力が返されます。
</Warning>

**クイックテスト（YOUR\_TOKEN\_HEREを置き換えてください）：**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  注意：`-s`オプションはプログレスバーを非表示にし、`--compressed`はgzipレスポンスを自動的に解凍します
</Info>

### Pythonの例（基本）

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

### Pythonの例（最適化版）

基本の例に加えて、以下の機能を追加しています：

<CardGroup cols={2}>
  <Card title="エラーハンドリング" icon="shield-check">
    完全な例外処理とエラー捕捉
  </Card>

  <Card title="環境変数" icon="lock">
    安全なtoken管理、ハードコードの回避
  </Card>

  <Card title="フォーマット済み出力" icon="table">
    見やすいテーブル表示と数値フォーマット
  </Card>

  <Card title="自動変換" icon="calculator">
    USD金額の自動計算
  </Card>
</CardGroup>

以下のコードを`quota.py`として保存すれば、すぐに実行できます：

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

**使用方法：**

```bash theme={null}
# Method 1: Using environment variable (recommended)
export APIYI_TOKEN='YOUR_TOKEN_HERE'
python quota.py

# Method 2: Command line argument
python quota.py 'YOUR_TOKEN_HERE'
```

**出力例：**

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

## よくある質問

<AccordionGroup>
  <Accordion title="Authorization tokenはどのように取得しますか？">
    上記の「Authorization tokenの取得方法」の手順に従ってください。プロフィールページでパーソナルアクセストークンを作成し、「Profile · Read」を選択します。従来のシステムtokenは2026-11-11 (UTC+8)に廃止される予定です。[パーソナルアクセストークンとは何ですか？](/ja/faq/personal-access-token)をご覧ください。
  </Accordion>

  <Accordion title="残高の照会はクォータを消費しますか？">
    いいえ、残高照会APIはクォータを消費しません。
  </Accordion>

  <Accordion title="残高はどのくらいの頻度で照会できますか？">
    レート制限の発生を避けるため、照会間隔は少なくとも1秒以上空けることを推奨します。
  </Accordion>

  <Accordion title="ModelFixedPriceフィールドは何のためのものですか？">
    このフィールドは各種AIモデルの価格情報を返します。残高情報のみが必要な場合は、無視して問題ありません。
  </Accordion>

  <Accordion title="quotaフィールドは何を表していますか？">
    `quota`フィールドは現在の残高を表しています。`quota`が0または0に近い場合、アカウントの残高が不足しているためチャージが必要です。
  </Accordion>

  <Accordion title="curlが文字化けしたテキストを返す、またはjqがエラーを報告するのはなぜですか？">
    **問題：** curlを実行すると文字化けしたテキストが返される、またはjqが「Invalid numeric literal」とエラーを報告する

    **原因：** APIがgzip圧縮されたコンテンツ（`Content-Encoding: gzip`）を返しますが、curlが自動的に展開しないためです。

    **解決策：** curlが自動的に展開するように、`--compressed`オプションを追加してください：

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

## 重要な注意事項

<Warning>
  **セキュリティに関する注意**

  * Authorization token をコードにハードコードしないでください
  * 機密情報の管理には環境変数または設定ファイルを使用してください
  * token を含むコードを公開リポジトリにコミットしないでください
</Warning>

<Info>
  **リクエスト制限**

  * 適切なリクエストタイムアウトを設定してください（推奨: 10秒）
  * 過度に頻繁なクエリリクエストは避けてください
</Info>

<Card title="エラーハンドリングの推奨事項" icon="bug">
  * ネットワーク例外、タイムアウト、認証失敗は必ず処理してください
  * トラブルシューティングをしやすくするため、エラーをログに記録してください
</Card>

<Card title="レスポンス形式に関する注意" icon="file-code">
  * API は gzip 圧縮されたコンテンツを返します。curl では`--compressed`オプションが必要です
  * Python の requests ライブラリは、追加設定なしで gzip の解凍を自動的に処理します
</Card>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.