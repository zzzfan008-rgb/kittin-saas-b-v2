> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 残高照会 API

> アカウント残高、利用クォータ、リクエスト数を取得し、残高の事前監視とアラートを有効にします

## API概要

Balance Query API は、合計クォータ、使用済みクォータ、残高、リクエスト数を含む、アカウントの現在のクォータ使用状況を取得します。

この API を使うと、アカウントの残高を簡単に監視でき、事前かつ柔軟な残高アラート管理が可能になります。

## 認証トークンを取得する方法

<Steps>
  <Step title="コンソールにアクセス">
    `api.apiyi.com/account/profile` にアクセスしてプロフィールページを開きます
  </Step>

  <Step title="システムトークンを見つける">
    ページ下部の「アカウントオプション - システムトークン」セクションを見つけます
  </Step>

  <Step title="アクセストークンを生成">
    アカウントのパスワードを入力すると、以降の API クエリに使用できるアクセストークンを受け取れます
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="システムトークンを取得" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

## API情報

| 項目          | 説明                                    |
| ----------- | ------------------------------------- |
| **API URL** | `https://api.apiyi.com/api/user/self` |
| **メソッド**    | `GET`                                 |
| **認証**      | Authorization ヘッダー                    |
| **レスポンス形式** | JSON                                  |

## リクエスト詳細

### リクエストヘッダー

| ヘッダー名           | 必須  | 説明                            |
| --------------- | --- | ----------------------------- |
| `Authorization` | はい  | API アクセストークン、形式: 直接 token 文字列 |
| `Accept`        | いいえ | 推奨: `application/json`        |
| `Content-Type`  | いいえ | 推奨: `application/json`        |

### リクエストパラメーター

<Info>
  これは GET リクエストであり、**リクエストボディのパラメーターは不要です**。
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

| Field Name             | Type    | Description                   |
| ---------------------- | ------- | ----------------------------- |
| `success`              | Boolean | リクエストが成功したかどうか                |
| `message`              | String  | エラーメッセージ（成功時は null）           |
| `data.username`        | String  | ユーザー名                         |
| `data.display_name`    | String  | 表示名                           |
| `data.quota`           | Integer | **残りクォータ**（現在利用可能な残高、quota単位） |
| `data.used_quota`      | Integer | **使用済みクォータ**（quota単位）         |
| `data.request_count`   | Integer | **総リクエスト数**                   |
| `data.group`           | String  | ユーザーグループ                      |
| `data.ModelFixedPrice` | Array   | モデルの料金一覧（無視してかまいません）          |

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

## エラー応答

### HTTP 401 - 認証に失敗しました

```json theme={null}
{
  "success": false,
  "message": "Unauthorized"
}
```

**理由:** Authorization token は無効または期限切れです

**対処:** API token を確認して更新してください

### HTTP 403 - 権限が拒否されました

```json theme={null}
{
  "success": false,
  "message": "Forbidden"
}
```

**理由:** 現在の token にはこの API にアクセスする権限がありません

**対処:** 管理者に連絡して権限設定を確認してください

## コード例

### cURL サンプル

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **重要:** `--compressed` オプションは必須です。API は gzip 圧縮されたコンテンツを返すため、これがないと文字化けした出力になります。
</Warning>

**クイックテスト（YOUR\_TOKEN\_HERE を置き換えてください）:**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  注: `-s` オプションはプログレスバーを非表示にし、`--compressed` は gzip レスポンスを自動的に展開します
</Info>

### Python サンプル（基本）

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

### Python サンプル（最適化版）

これは基本サンプルに次の内容を追加したものです:

<CardGroup cols={2}>
  <Card title="エラーハンドリング" icon="shield-check">
    完全な例外処理とエラー捕捉
  </Card>

  <Card title="環境変数" icon="lock">
    token を安全に管理し、ハードコードを避けます
  </Card>

  <Card title="整形済み出力" icon="table">
    見やすい表の表示と数値フォーマット
  </Card>

  <Card title="自動換算" icon="calculator">
    USD 金額の自動計算
  </Card>
</CardGroup>

下のコードを `quota.py` として保存すれば、そのまま実行できます:

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

**使い方:**

```bash theme={null}
# Method 1: Using environment variable (recommended)
export APIYI_TOKEN='YOUR_TOKEN_HERE'
python quota.py

# Method 2: Command line argument
python quota.py 'YOUR_TOKEN_HERE'
```

**出力例:**

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
  <Accordion title="Authorization token はどのように取得しますか？">
    上記の「Authorization token の取得方法」セクションを参照するか、コンソールのプロフィールページにアクセスしてシステム token を取得してください。
  </Accordion>

  <Accordion title="残高を照会するとクォータを消費しますか？">
    いいえ、残高照会 API はクォータを消費しません。
  </Accordion>

  <Accordion title="残高はどのくらいの間隔で照会できますか？">
    レート制限を回避するため、少なくとも 1 秒の照会間隔を推奨します。
  </Accordion>

  <Accordion title="ModelFixedPrice フィールドは何のためのものですか？">
    このフィールドは、さまざまな AI モデルの料金情報を返します。残高情報だけが必要な場合は無視してかまいません。
  </Accordion>

  <Accordion title="クォータ フィールドは何を表しますか？">
    `quota` フィールドは現在の残高を表します。`quota` が 0 または 0 に近い場合、アカウントの残高が不足しており、チャージが必要です。
  </Accordion>

  <Accordion title="なぜ curl で文字化けしたテキストが返ったり、jq がエラーを報告したりするのですか？">
    **問題:** curl を実行すると文字化けしたテキストが返る、または jq が「Invalid numeric literal」と報告します

    **理由:** API は gzip 圧縮されたコンテンツ（`Content-Encoding: gzip`）を返しますが、curl は自動で展開しません。

    **解決策:** curl が自動で展開するように、`--compressed` オプションを追加します。

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
