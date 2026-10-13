> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ログクエリ API

> 呼び出しログをプログラムで取得し、各リクエストのモデル、実際の課金額、レイテンシー、エラーコードを把握できます。これにより、自動照合とセルフサービスのトラブルシューティングを実現します

## APIの概要

Log Query API は、アカウント内で実行された**すべての API 呼び出し**の詳細記録を返します。
これには、使用されたモデル、実際に請求された金額、レイテンシ、呼び出しがストリーミングだったかどうか、
および呼び出しが失敗したときのエラーコードが含まれます。

これは [残高照会 API](/ja/api-capabilities/balance-query) を補完するものです。残高照会では残っているクレジット量がわかり、
ログ照会ではそれがどこに使われたかがわかります。

代表的なユースケースは3つあります:

<CardGroup cols={3}>
  <Card title="自動照合" icon="calculator">
    期間ごと、またはモデルごとに実際の支出を集計し、自社の課金と照合する
  </Card>

  <Card title="セルフサービスのトラブルシューティング" icon="bug">
    失敗したリクエストのエラーコードを確認し、パラメータの問題か上流側の問題かを見分ける
  </Card>

  <Card title="サポートチケット" icon="life-buoy">
    正確な呼び出しを特定できるよう、`request_id` をサポートに提供する
  </Card>
</CardGroup>

<Info>
  ログはコンソールの Logs ページでも確認できます。この API は同じデータへのプログラム用エントリーポイントであり、自動照合、定期エクスポート、または独自の監視への取り込みを目的としています。手動で確認する場合はコンソールを使用してください — [呼び出し記録の確認方法](/ja/faq/call-logs)をご覧ください。
</Info>

<Warning>
  **推奨される使い方: 1日1回同期し、ログを自分のデータベースに保存してください。**

  この API は、リアルタイムで繰り返し照会する用途ではなく、定期的な増分エクスポート向けに設計されています:

  * **1日1回実行し**、前回の同期以降に作成されたレコードだけを自分の
    データベースまたは CSV ファイルに取り込んでください
  * **1回のリクエストでより多く取得してください**: `pageSize` は 5000 まで対応しています — デフォルトの 10 のままにしないでください。
    この落とし穴については下のパラメータ注記を参照してください
  * **一括バックフィルには使わないでください**（3か月分を一度に取得するなど）。また、
    UI でのライブページネーションにも使わないでください
  * **同時に呼び出さないでください** — ページは逐次的に、ページ間隔をおおむね1秒空けて取得してください
  * 各期間は**1日以内**に抑え、高ボリュームのアカウントでは時間単位で分割してください

  その理由は下記の Performance Notes セクションをご覧ください。期間が古いほど、ページネーションが深いほど、
  各リクエストのコストは高くなります。サーバー側の制限を超えるとエラーが返り、
  **同じパラメータで再試行しても速くはなりません**。このページの Python の例はすでに
  このパターンに従っており、そのまま日次の cron ジョブに組み込めます。
</Warning>

## パーソナルアクセス token の取得方法

ログクエリ API は**パーソナルアクセス token**（`nap_`で始まります）で認証を行いますが、これは API キーとは異なります（本ページ末尾の「重要な注意事項」を参照してください）。

<Steps>
  <Step title="Personal Access Tokens を開く">
    `api.apiyi.com/account/profile` のプロフィールページに移動します。**アカウントオプション**で、**Personal Access Tokens** → **Create Token** をクリックします。
  </Step>

  <Step title="権限を選択する">
    この API に必要なのは **Usage & personal records · Read** のみです。日次の定期実行ジョブの場合は、長めの有効期限を選択してください。デフォルトは30日間で、token の有効期限が切れるとスクリプトは 401 を受け取ります。
  </Step>

  <Step title="IP許可リストを設定する（任意）">
    同期スクリプトを固定 IP のサーバーで実行する場合に推奨されます。許可リストは作成後に編集できません。まずは許可リストなしでスクリプトが正常に動作することを確認し、その後、許可リストを設定した本番用 token を別途作成してください。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="パーソナルアクセス token の作成：名前、有効期限、IP許可リスト、権限" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **レガシーのシステム tokens は2026-11-11 (UTC+8)に廃止される予定です。**「アカウントオプション - System Token」で生成された AccessTokens はその日まで引き続き動作します。その日付を過ぎると 401 `ACCESS_TOKEN_LEGACY_RETIRED` を返します。
  利用状況を確認した上で期日を延長する可能性もありますが、今すぐパーソナルアクセス token へ切り替えることをお勧めします。`APIYI_SYS_TOKEN` の値を変更するだけで、以降のスクリプトはそのまま動作します。
  [パーソナルアクセス token とは？](/ja/faq/personal-access-token)を参照してください。
</Warning>

## API情報

| 項目 | 説明 |
| - | - |
| **API URL** | `https://api.apiyi.com/api/log/self` |
| **メソッド** | `GET` |
| **認証** | Authorizationヘッダー（パーソナルアクセストークン。`Bearer `プレフィックスは省略可能） |
| **レスポンス形式** | JSON（gzip圧縮） |
| **データ範囲** | ご自身のアカウントのログのみ |

## リクエストの詳細

### リクエストヘッダー

| ヘッダー名 | 必須 | 説明 |
| - | - | - |
| `Authorization` | はい | 個人アクセストークン。プレーン文字列として渡します |
| `Accept` | いいえ | 推奨: `application/json` |

### Query Parameters

| Parameter | Type | Required | Description |
| - | - | - | - |
| `p` | Integer | No | Page number, **zero-based** (not 1). Offset = `p` × `pageSize` |
| `pageSize` | Integer | No | Records per page, default 10, **maximum 5000**. ⚠️ **camelCase** — see the warning below |
| `type` | Integer | No | Log type; pass `2` for reconciliation, see the table below |
| `model_name` | String | No | Exact-match filter by model, e.g. `gpt-5.6` |
| `token_name` | String | No | Filter by token name |
| `request_id` | String | No | Look up a single call by request ID; returns just that record |
| `start_timestamp` | Integer | **Required** | Start time, Unix seconds. See the note below |
| `end_timestamp` | Integer | **Required** | End time, Unix seconds. Keep the span from `start_timestamp` to one day or less |
| `group` | String | No | Filter by group |

<Warning>
  **Treat the time window as required.**

  The endpoint does not actually enforce these two parameters — a call without them succeeds. But
  omitting them tells the server to search your account's **entire history** backwards from the
  newest record, and **accounts with a large call history will hit the server-side limit and get an
  error rather than a slow response**.

  This is the easiest mistake to make on this page and the one with the most direct consequences.
  We mark it Required not because the server rejects the call, but because **the failure mode is
  hard to recognize**: it does not report a missing parameter, it reports a timeout.
</Warning>

<Warning>
  **`pageSize` is the only camelCase parameter on this endpoint. Spelling it `page_size` is
  silently ignored.**

  Every other parameter (`model_name`, `token_name`, `start_timestamp`, `request_id`, …) uses
  snake\_case — this one does not. Getting it wrong does not raise an error: the server treats the
  parameter as absent and **falls back to the default of 10 records per page**, which is easy to
  misread as "the cap is 10" or "I only made 10 calls in this period."

  ```
  ?pageSize=1000    ✅ returns 1000 records
  ?page_size=1000   ❌ silently returns 10
  ```

  Going above 5000 does raise a clear error rather than truncating silently.
</Warning>

<Info>
  **Raising `pageSize` is the single most effective optimization for this endpoint.** At 10 records
  per page, an account making 500,000 calls a day needs 50,000 requests; at 5000 per page it needs
  **100**. Two orders of magnitude fewer requests, and the pagination offset drops with it — see
  Performance Notes below.

  A 5000-record page measures roughly 700 KB gzipped and takes about 2.5 seconds. If bandwidth or
  memory is tight, `1000` is a comfortable middle ground.
</Info>

### パフォーマンスに関する注意

単一リクエストのコストは**固定ではありません**。それは 3 つの要素に依存します。これらのルールに従えば
API は高速ですが、無視するとサーバー側の 60 秒クエリ制限に達し、エラーが返ります。

| 要因 | 安い | 高い |
| - | - | - |
| **ウィンドウの位置** | 直近数日 | 数週間または数か月前 |
| **ウィンドウの幅** | 1 時間〜1 日 | 1 か月まるごと、またはウィンドウなし |
| **オフセット (`p` × `pageSize`)** | 最初の数万件のレコード | 数十万件以上 |

実践的なルールは 4 つあります。

1. **`start_timestamp` と `end_timestamp` を必ず渡してください。** ウィンドウを省略するのは、この API を呼び出すうえで最も高くつく方法です。
2. **`pageSize` を引き上げてください。** これは簡単です。1ページあたり 10 件から 1000〜5000 件にすると、リクエスト数を 2 桁減らせて、オフセットもそれに伴って小さくなります。
3. **オフセットを深くするのではなく、ウィンドウを狭めてください。** コストがかかるのは「どのページか」ではなく、「そこにたどり着くまでに何件スキップしたか」であり、それは超線形に増えます。1つの大きなウィンドウを最後までページングするのではなく、24 個の 1 時間ウィンドウに分割し、各ウィンドウを offset 0 から再開するようにしてください。
4. **履歴は一度だけバックフィルして保存し、その後は増分だけを同期してください。** 古いデータは最新データよりクエリコストがはるかに高いため、同じ履歴を何度も読み直すのは完全な無駄です。

<Info>
  `pageSize=1000` でもウィンドウが数十ページかかるなら、その期間の呼び出し量は多いということです — **ウィンドウを半分に分け、それぞれを別々に取得してください**。これは、さらに深くページングするよりずっと速いです。下の Python 例にある `MAX_PAGES` 定数は、まさにこれを行っています。
</Info>

#### 60 秒は厳格な上限で、それを超えるとエラーが返ります

サーバーは単一クエリを **60 秒** に制限しています。それを過ぎると遅い応答が返るのではなく、
**エラーが返り**、そこまでに費やした時間ではデータは一切得られません。

次の 3 つのパターンは、これを引き起こしやすいです。再試行して期待するのではなく、最初から避けてください。

| パターン | 理由 |
| - | - |
| **時間ウィンドウなし** | サーバーが履歴全体を検索しなければならないため |
| **1 か月以上前のウィンドウ**、かつ大容量アカウント | 古いデータは取得コストが高いため |
| **数十万件台のオフセット** | スキップするレコードが多いほど遅くなり、しかも超線形に悪化するため |

**同じパラメータで再試行しても速くはなりません**。単にさらに 60 秒かかるだけです。
正しい対応は、**時間ウィンドウを狭める**か、`pageSize` を引き上げてページングを減らすことです —
どちらにしても、1 回の呼び出しでサーバーが処理するデータ量を減らしてください。

### ログタイプ

| 値 | 意味 | 備考 |
| - | - | - |
| `1` | チャージ | 変更前後の残高を記録します。`quota` は0です |
| `2` | **消費** | **精算に必要な唯一のタイプです**。`quota` は実際の課金額です |
| `3` | 管理 | アカウントの変更や類似の操作です。`quota` は0です |
| `4` | システム | システム付与クレジットや類似の記録です。`quota` は0です |
| `11` | 非同期タスクの返金 | 動画などの非同期タスクが失敗すると、事前課金分が全額返金されます。`quota` は**負の値**で、`content` には task\_id が格納されます |

<Warning>
  **支出額を計算する際は、必ず `type=2` を渡してください。** これを指定しない場合、チャージおよびシステム付与の記録も
  返されます。これらの `quota` は0ですが、`model_name` と `token_name` も空であるため、単純に
  合計したりモデルごとにグループ化したりすると、誤った結果になります。

  アカウントで非同期動画モデル（Seedance など）を使用している場合は、**`type=11` も取得してください**。タスクが失敗すると、その事前課金分が負の返金エントリとして戻されるため、`type=2` だけを合計すると、その事前課金分が支出としてカウントされます。
</Warning>

## レスポンス詳細

### 成功レスポンスの例

```json theme={null}
{
  "success": true,
  "message": "",
  "data": [
    {
      "request_id": "2026080114481936471351696e93ae3FTV8WKfk",
      "created_at": 1785595715,
      "type": 2,
      "content": "Fixed model price 0.015, group ratio 1",
      "username": "your-account",
      "token_name": "production-primary",
      "token_group": "default",
      "model_name": "gpt-5.6",
      "quota": 7500,
      "prompt_tokens": 1000,
      "completion_tokens": 0,
      "duration_for_view": 16,
      "is_stream": false,
      "error_code": "",
      "other": "{\"billing_type\":\"by_count\",\"request_path\":\"/v1/images/generations\",\"group_ratio\":1,\"model_ratio\":1,\"usage\":{}}"
    }
  ]
}
```

### 主要レスポンスフィールド

| フィールド名 | 型 | 説明 |
| - | - | - |
| `quota` | 整数 | **この呼び出しで実際に課金された金額**。クレジット単位。÷ 500,000 = USD |
| `content` | 文字列 | 固定モデル価格やグループ比率など、人間が読める価格に関する注記 |
| `model_name` | 文字列 | 実際に課金されたモデル |
| `token_name` | 文字列 | 呼び出しを行ったAPIキー |
| `token_group` | 文字列 | tokenのグループ。この値はグループ識別子です。FAQを参照してください |
| `prompt_tokens` / `completion_tokens` | 整数 | 入力 / 出力token数 |
| `duration_for_view` | 整数 | 呼び出し時間（秒） |
| `is_stream` | 真偽値 | 呼び出しがストリーミングされたかどうか |
| `error_code` | 文字列 | 失敗理由コード。成功時は空文字列 |
| `created_at` | 整数 | 呼び出し時刻（Unix秒） |
| `request_id` | 文字列 | **リクエストID — サポートチケットを起票する際にこれを提供してください** |
| `other` | 文字列 | 追加の課金およびリクエスト詳細。**再度パースする必要があるJSON文字列です** |

<Info>
  `other`フィールドにはネストされたオブジェクトではなくJSON**文字列**が格納されるため、2回目のパースが必要です
  （Pythonでは`json.loads()`、JavaScriptでは`JSON.parse()`）。これには`billing_type`、
  `request_path`（実際に呼び出されたエンドポイント）、`group_ratio`、`model_ratio`、および`usage`が含まれます。

  非同期動画タスクの精算エントリには、`final_quota`（タスクの最終合計）、`original_quota`
  （送信時に行われた事前課金）、`adjustment_quota`（このエントリの差額）および`actual_tokens`も含まれます。詳細は以下のFAQを参照してください。
</Info>

### クォータ換算

<Card title="換算ルール" icon="calculator">
  500,000クォータ = \$1.00 USD
</Card>

**計算式：** USD金額 = `quota` ÷ 500,000

**例：**

* `quota: 7500` → \$0.015 USD
* `quota: 22500` → \$0.045 USD
* `quota: 18` → \$0.000036 USD

これは[残高照会API](/ja/api-capabilities/balance-query)で使用される換算と同じです。
そのため、両者は直接対応します。

## エラーレスポンス

### HTTP 401 - 認証失敗

```json theme={null}
{
  "success": false,
  "message": "You are not authorized to perform this operation. The access token is invalid."
}
```

**原因:** tokenが無効、期限切れ、または削除されているか、APIキー（`sk-`で始まるもの）が誤ってパーソナルアクセス tokenとして使用されています。アカウントのパスワード、2要素認証、またはパスキーを変更すると、すべてのパーソナルアクセス tokenが無効化されます。

**解決策:** コンソールで新しいパーソナルアクセス tokenを作成してください。

他の2つの401レスポンスには明示的なメッセージが含まれています：

| メッセージ | 原因 |
| - | - |
| `ACCESS_TOKEN_LEGACY_RETIRED` | 廃止されたレガシーシステム tokenを現在も使用しています。パーソナルアクセス tokenに切り替えてください。 |
| `This access token may not be used from the current IP address.` | リクエストが tokenの許可リスト外のIPから送信されました。許可リストは編集できないため、新しい tokenを作成してください。 |

### HTTP 403 - 権限拒否

```json theme={null}
{
  "code": "ACCESS_TOKEN_SCOPE_DENIED",
  "message": "This endpoint is outside this access token’s granted permissions.",
  "success": false
}
```

**原因:** パーソナルアクセス tokenに **Usage & personal records · Read** がありません。その権限を持つ新しい tokenを作成してください。権限は作成後に変更できません。

## コード例

### cURLの例（単一ページ、クイック確認）

```bash theme={null}
export APIYI_SYS_TOKEN='nap_YOUR_PERSONAL_ACCESS_TOKEN'   # personal access token

# Last hour only. Always pass start/end — a query without a time window will likely time out
END=$(date +%s)
START=$((END - 3600))

curl --compressed -s "https://api.apiyi.com/api/log/self?p=0&pageSize=1000&type=2&start_timestamp=$START&end_timestamp=$END" \
  -H "Authorization: $APIYI_SYS_TOKEN" \
  -H 'Accept: application/json' | jq '.data[] | {created_at, model_name, quota, request_id}'
```

<Warning>
  **`--compressed`オプションは必須です**。APIがgzip圧縮されたコンテンツを返すためです。
  これがないと文字化けした出力になります。
</Warning>

<Info>
  これを使用してtokenが機能することを確認してください。本格的な照合を行う場合は、以下の日次同期スクリプトを使用してください。
</Info>

### Python の例: 日次の増分同期（cron ジョブとしてすぐ使えます）

これは **推奨される標準的な使い方** です。1日1回実行し、前回の同期以降に新しくなったものだけを取得して、
ローカルの SQLite データベースに書き込みます。再実行しても安全です（レコードは `request_id` で重複排除されます）。また、途中で中断された実行は停止したところから再開されます。

```python theme={null}
"""Daily incremental sync of APIYI call logs. Run once a day, e.g. crontab: 30 2 * * *"""
import json
import os
import sqlite3
import time

import requests

BASE = "https://api.apiyi.com"
TOKEN = os.environ["APIYI_SYS_TOKEN"]
QUOTA_PER_USD = 500_000

DB_PATH = "apiyi_logs.db"
WINDOW = 3600       # width of one time window in seconds; 1 hour suits most accounts
PAGE_SIZE = 1000    # records per page, server max is 5000. NOTE: the param is camelCase
MAX_PAGES = 50      # max pages per window; beyond this the window is split in half
SLEEP = 1.0         # gap between pages — call serially, never concurrently
FIRST_RUN_DAYS = 7  # how far back to backfill on the very first run

HEADERS = {"Authorization": TOKEN, "Accept": "application/json"}


def open_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            request_id  TEXT PRIMARY KEY,
            created_at  INTEGER,
            model_name  TEXT,
            token_name  TEXT,
            quota       INTEGER,
            error_code  TEXT,
            raw         TEXT
        )""")
    con.execute("CREATE INDEX IF NOT EXISTS idx_created ON logs(created_at)")
    con.commit()
    return con


def get_page(start, end, page):
    resp = requests.get(
        f"{BASE}/api/log/self",
        headers=HEADERS,
        params={
            "p": page,
            "pageSize": PAGE_SIZE,  # camelCase! page_size is ignored and you get 10 per page
            "type": 2,              # 2 = consumption, the only type used for reconciliation
            "start_timestamp": start,
            "end_timestamp": end,
        },
        timeout=60,                 # the server-side query limit is also 60 seconds
    )
    resp.raise_for_status()
    return resp.json().get("data") or []


def fetch_window(start, end):
    """Fetch [start, end]. Splits the window in half if pagination gets too deep."""
    rows, seen, page = [], set(), 0
    while page < MAX_PAGES:
        data = get_page(start, end, page)
        if not data:
            return rows                      # empty array means this window is done
        fresh = [r for r in data if r.get("request_id") not in seen]
        if not fresh:
            return rows                      # whole page was duplicates, defensive exit
        seen.update(r["request_id"] for r in fresh)
        rows.extend(fresh)
        page += 1
        time.sleep(SLEEP)

    if end - start <= 1:
        return rows
    mid = (start + end) // 2                 # too much volume here: fetch each half separately
    return fetch_window(start, mid) + fetch_window(mid + 1, end)


def sync():
    con = open_db()
    row = con.execute("SELECT MAX(created_at) FROM logs").fetchone()
    cursor = (row[0] + 1) if row and row[0] else int(time.time()) - FIRST_RUN_DAYS * 86400
    now = int(time.time())

    total = 0
    while cursor < now:
        end = min(cursor + WINDOW, now)
        rows = fetch_window(cursor, end)
        con.executemany(
            "INSERT OR IGNORE INTO logs VALUES (?,?,?,?,?,?,?)",
            [(r.get("request_id"), r.get("created_at"), r.get("model_name"),
              r.get("token_name"), r.get("quota"), r.get("error_code"),
              json.dumps(r, ensure_ascii=False)) for r in rows])
        con.commit()
        total += len(rows)
        cursor = end + 1
    print(f"Synced {total} records into {DB_PATH}")
    return con


def report(con, days=1):
    since = int(time.time()) - days * 86400
    print(f"{'MODEL':32s} {'CALLS':>6s} {'SPEND(USD)':>12s}")
    rows = con.execute(
        "SELECT model_name, COUNT(*), SUM(quota) FROM logs "
        "WHERE created_at >= ? GROUP BY model_name ORDER BY SUM(quota) DESC",
        (since,)).fetchall()
    for model, cnt, quota in rows:
        print(f"{model or '(none)':32s} {cnt:6d} {(quota or 0) / QUOTA_PER_USD:12.4f}")
    total = sum((q or 0) for _, _, q in rows)
    print(f"\nTotal ${total / QUOTA_PER_USD:.4f} USD")


if __name__ == "__main__":
    report(sync(), days=1)
```

**サンプル出力:**

```
Synced 570 records into apiyi_logs.db
MODEL                             CALLS   SPEND(USD)
gpt-5.6                             128       2.3850
gemini-3-pro-image                   30       1.3500
deepseek-chat                       412       0.0148

Total $3.7348 USD
```

<Info>
  データがローカルにあれば、モデル別、日別、token 別など、必要なあらゆる集計はすべて
  ご自身のデータベースに対して実行されるため、**そのために再び API に問い合わせる必要はありません**。これははるかに高速で、
  すでに保持期間を過ぎて消えたデータが欲しくなる問題も回避できます。
</Info>

### Node.js の例（単一の時間枠）

考え方は同じです。1時間ごとに分割し、順番にページングし、ページネーションが深くなりすぎたら時間枠を縮小します。

```javascript theme={null}
const BASE = "https://api.apiyi.com";
const TOKEN = process.env.APIYI_SYS_TOKEN;
const QUOTA_PER_USD = 500_000;
const PAGE_SIZE = 1000;      // server max is 5000
const MAX_PAGES = 50;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPage(start, end, page) {
  const qs = new URLSearchParams({
    p: String(page),
    pageSize: String(PAGE_SIZE), // camelCase! page_size is ignored and you get 10 per page
    type: "2",                  // 2 = consumption
    start_timestamp: String(start),
    end_timestamp: String(end),
  });
  const resp = await fetch(`${BASE}/api/log/self?${qs}`, {
    headers: { Authorization: TOKEN, Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const { data } = await resp.json();
  return data || [];
}

// Fetch [start, end]; split the window in half if pagination gets too deep
async function fetchWindow(start, end) {
  const rows = [];
  const seen = new Set();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await getPage(start, end, page);
    if (data.length === 0) return rows;
    const fresh = data.filter((r) => !seen.has(r.request_id));
    if (fresh.length === 0) return rows;
    fresh.forEach((r) => seen.add(r.request_id));
    rows.push(...fresh);
    await sleep(1000);          // serial, never concurrent
  }
  if (end - start <= 1) return rows;
  const mid = Math.floor((start + end) / 2);
  return [...(await fetchWindow(start, mid)), ...(await fetchWindow(mid + 1, end))];
}

const end = Math.floor(Date.now() / 1000);
const logs = await fetchWindow(end - 3600, end);   // last hour
const total = logs.reduce((sum, r) => sum + (r.quota || 0), 0);
console.log(`${logs.length} calls, $${(total / QUOTA_PER_USD).toFixed(4)} USD`);
```

<Info>
  Python の requests ライブラリと Node.js の fetch API はどちらも gzip を自動的に展開するため、
  その場合は追加の設定は不要です。明示的な `--compressed` フラグが必要なのは curl のみです。
</Info>

## Common Scenarios

### 日次照合（推奨される方法）

上の Python スクリプトを 1 日に 1 回実行するようにスケジュールし、ログをローカルデータベースに保存します。必要な内訳——総支出、モデル別、token別——はすべて、**自分の**データベースに対する SQL クエリで取得できます。

これが適切な形である理由は 3 つあります。ローカルのクエリは高速であること、ログの保持期間の影響を受けないこと、そして古い履歴を繰り返し読み直すことで API の速度を落とさずに済むことです。

1 つの model のレコードだけを同期するには、リクエストに `model_name` パラメータを追加します。

### 失敗した呼び出しの見つけ方

データがローカルにあれば、自分のテーブルを直接クエリします:

```sql theme={null}
SELECT created_at, model_name, error_code, request_id
FROM logs
WHERE error_code != '' AND created_at >= strftime('%s', 'now', '-1 day')
ORDER BY created_at DESC;
```

<Info>
  ゲートウェイによって拒否されたリクエスト（無効なパラメータなど）は、`quota` が 0 であり、
  **課金されません**。ログ内の `error_code` を使うと、「呼び出しが失敗した」のか
  「呼び出しは成功したが、結果が気に入らなかった」のかを分けられます。
</Info>

### サポートに渡すリクエスト ID の指定

ログ内で問題のある呼び出しを見つけ、サポートに `request_id` を伝えてください。これにより、
エンドツーエンドで正確なリクエストを特定できるため、「ある model への呼び出しが
ある時刻の前後で失敗した」と説明するより、はるかに効率的です。

## よくある質問

<AccordionGroup>
  <Accordion title="リクエストが遅い、または完全にタイムアウトします。どうすればよいですか？">
    まず次の3点を確認してください。遅いクエリのほとんどは、これらのいずれかが原因です。

    1. **`start_timestamp` と `end_timestamp` を渡していますか？** 時間範囲を省略することは、この API を呼び出すうえで
       最もコストの高い方法です。サーバーが履歴全体を検索します。
    2. **範囲が古すぎる、または広すぎませんか？** 1か月前のデータをクエリするコストは、
       昨日のデータをクエリするよりはるかに高くなります。範囲は1日未満に保ち、大量の場合は時間単位で分割してください。
    3. **`p` が数千に達していませんか？** ページネーションのコストは超線形に増加します。対処方法は、
       **各時間範囲が数十ページだけで済むよう時間範囲を縮小すること**であり、1つの大きな範囲内で
       さらに深くページングすることではありません。

    **同じパラメータで再試行しても速くなりません。** タイムアウトした場合は、同一のリクエストを繰り返すのではなく、
    上記のようにパラメータを調整してください。単純な再試行では、再び待つだけです。
  </Accordion>

  <Accordion title="なぜレコードが10件しか取得できないのですか？">
    **10回中9回は、パラメータが snake\_case の `page_size` として記述されています。**

    正しいスペルは camelCase の `pageSize` です。これはこの
    エンドポイントで唯一の camelCase パラメータです。ほかのすべて（`model_name`、`token_name`、`start_timestamp`、…）は snake\_case
    であるため、間違えやすくなっています。エラーは発生せず、サーバーはこの
    パラメータが存在しないものとして扱い、1ページあたり10レコードにフォールバックします。

    ```
    ?pageSize=1000    ✅ 1000 records
    ?page_size=1000   ❌ 10 records
    ```

    最大値は5000で、これを超えると明確なエラーが返されます。大量の場合でも、レスポンスが空の配列を返すまで
    ページネーション（`p=0`、`p=1`、…）を行う必要があります。上記の Python と
    Node.js の例では、すでにこの処理がカプセル化されています。
  </Accordion>

  <Accordion title="request ID で特定の呼び出しを1件検索できますか？">
    はい。`request_id` を渡すと、そのレコードのみが返されます。

    ```bash theme={null}
    curl --compressed -s "https://api.apiyi.com/api/log/self?request_id=YOUR_REQUEST_ID" \
      -H "Authorization: $APIYI_SYS_TOKEN"
    ```

    特定の1件の呼び出しを調査する場合、これは時間範囲を取得して
    自分でフィルタリングするよりはるかに高速です。
  </Accordion>

  <Accordion title="レスポンス内の一部フィールドが空です。何か問題がありますか？">
    いいえ。一部のフィールドにはプラットフォーム内部の情報が格納されており、通常の
    アカウントの観点では空またはゼロになります。これは想定どおりであり、照合やトラブルシューティングに必要な
    フィールドには影響しません。`quota`、`model_name`、`error_code`、および `request_id`
    はすべて完全に設定されています。
  </Accordion>

  <Accordion title="token_group がコンソールに表示されるグループ名と異なるのはなぜですか？">
    API はグループの**識別子**を返しますが、コンソールにはグループの**ラベル**が表示されます。
    これらは異なる場合があります。たとえば、API は `default` を返しますが、コンソールには Default と表示されます。

    完全なマッピングは、公開エンドポイント `https://api.apiyi.com/api/pricing` の
    `usable_group` フィールドから取得できます。このフィールドは識別子をラベルにマッピングします。レポートを
    コンソールと一致させたい場合は、このマッピングを自身で適用してください。
  </Accordion>

  <Accordion title="token 数とクォータが一致しないように見えます。どちらが正しいですか？">
    `quota` を使用してください。これは呼び出しに対して**実際に差し引かれた**金額であり、
    照合に適した唯一のフィールドです。画像生成や動画生成などの呼び出しごとに価格設定されるモデルでは、
    レスポンス内の token 数が価格設定に関与しないプレースホルダー値である場合があります。
    これらのモデルは、`other.billing_type` に `by_count` を報告します。
  </Accordion>

  <Accordion title="どこまで過去にさかのぼってクエリできますか？">
    **直近30日間のみクエリ可能であることを前提に、同期ロジックを設計してください。**

    実際にはクエリ可能な範囲は通常もっと長いですが、保持については**一切保証しません**。
    これはログクリーンアップポリシーに応じて変更され、その変更は個別に告知されません。30日間を
    計画上の下限として扱えば、そのポリシーが変わっても照合処理は壊れません。

    また、**範囲が古いほどクエリのコストは高くなります**。データがまだ存在していても、
    取得にははるかに時間がかかります。

    したがって、適切なパターンは**1日に1回、自身のデータベースへ同期すること**であり、履歴分析は
    ローカルで実行してください。長期間保持する必要があるものは、自身でアーカイブしてください。この
    API から後で取得できることに依存しないでください。
  </Accordion>

  <Accordion title="curl が文字化けしたテキストを返す、または jq がエラーを出します">
    **理由：** API は gzip 圧縮されたコンテンツ（`Content-Encoding: gzip`）を返しますが、curl が
    それを展開していません。

    **解決策：** `--compressed` フラグを追加してください。

    ```bash theme={null}
    curl --compressed 'https://api.apiyi.com/api/log/self?p=0' \
      -H "Authorization: $APIYI_SYS_TOKEN" | jq
    ```

    Python の requests ライブラリと Node.js の fetch API は自動的に展開します。
  </Accordion>

  <Accordion title="動画タスクで2件のログエントリが生成されました。task_id への対応付けと動画のコスト取得はどうすればよいですか？">
    非同期動画タスク（Seedance など）は「送信時に事前チャージし、完了時に差額を精算する」方式で課金されるため、
    1本の動画につき2件のエントリが残ります。事前チャージ（`completion_tokens` が0で、`request_id` が存在）と精算
    （`completion_tokens` が実際の使用量、**`request_id` は空**、`quota` は差額のみ）です。
    **どちらのエントリにも `task_id` は含まれない**ため、この API ではエントリをタスクに対応付けられません。

    動画の実際のコストを取得するには、`task_id` でタスク API をクエリしてください。その `quota` は2件のエントリの合計です。

    ```bash theme={null}
    curl --compressed -s "https://api.apiyi.com/api/task/self?p=1&page_size=1&task_id=YOUR_TASK_ID" \
      -H "Authorization: $APIYI_SYS_TOKEN"
    ```

    そのページングパラメータは snake\_case の `page_size` であり、`p` は1から始まる点に注意してください。これはこの API と逆です。
    失敗したタスクでも `quota` には事前チャージが表示されますが、実際のコストは0です（ログには負の `type=11` の返金エントリが含まれます）。
    詳しい手順：[task\_id で Seedance 動画の実際のコストを検索する方法](/ja/faq/seedance-task-cost-lookup)。
  </Accordion>

  <Accordion title="ログのクエリはクォータを消費しますか？">
    いいえ。ログクエリのエンドポイントはクォータを消費しません。
  </Accordion>
</AccordionGroup>

## 重要な注意事項

<Warning>
  **パーソナルアクセス token は API キーではなく、両者に互換性はありません**

  * **API キー**（`sk-` で始まるもの）は `/v1/*` の推論エンドポイント用です。これを `/api/log/self` に対して使用すると 401 が返されます。
  * **パーソナルアクセス token**（`nap_` で始まるもの）は `/api/*` の管理エンドポイント用であり、モデルを呼び出すことはできません。

  照合スクリプトの token には\*\*「Usage & personal records · Read」のみ\*\*を付与してください。設定できるからといって、他の権限を追加しないでください。コード内ではなくシークレットマネージャーに保管し、リポジトリには絶対にコミットせず、有効期限が切れる前に置き換えてください。
</Warning>

<Warning>
  **ログのレスポンスにはご自身の API キーが平文で含まれています**

  各ログレコードには、呼び出しを行った token に関する情報が含まれています。**生のログレスポンスを公開の場に貼り付けたり、スクリーンショットを共有したり、第三者に渡したりしないでください** — エクスポートする前に機密フィールドを削除してください。

  特に、この平文には `sk-` プレフィックスが含まれていないため、**一般的なシークレットスキャナーでは検出されない可能性があります**。自動チェックに頼って検出を任せきりにしないでください。
</Warning>

<Info>
  **推奨される呼び出しパターン**

  * **1日1回同期する** — より頻繁に実行する必要はありません。各実行では新規データのみを取得します
  * デフォルトの 10 ではなく、**1000〜5000 の `pageSize` を使用する** — これは他の要素すべてを合わせたものよりも重要です
  * ページ間は約1秒の間隔を空けて**シリアルに呼び出し**、**決して同時に実行しないでください**
  * クライアントのタイムアウトは 60 秒に設定してください（サーバー側のクエリ制限も 60 秒です）
  * 各時間ウィンドウは 1 日以下に抑えてください。データ量が多いアカウントの場合は、1時間ごとに分割してください
  * タイムアウトが発生した場合は、**再試行する前にウィンドウを狭めてください** — 同じ条件で再試行しても処理速度は上がりません

  これらは厳格なクォータではありません。単にご自身のデータを最速で取り出すための方法です。このパターンに従うことで、一般的なアカウントであれば 1 日分のログ全体を 1 分未満で同期でき、1 日に数十万回の呼び出しを行う大規模なアカウントであっても、わずか約 100 回のリクエストで済みます。

  <Warning>
    **将来的に、このエンドポイントにレート制限を導入する権利を留保します。**

    現時点ではレート制限は設定されていませんが、**「無制限」を前提とした定期ジョブの設計は行わないでください**。上記のパターン（1 日 1 回、シリアル実行、大きな `pageSize`）に従っていれば、将来レート制限が導入されても影響を受けることはありません。
  </Warning>
</Info>

<Card title="関連ドキュメント" icon="link">
  * [残高照会 API](/ja/api-capabilities/balance-query) — アカウントの残りクレジットを確認
  * [Token 管理 API](/ja/api-capabilities/token-management) — API キーをプログラムで作成および管理
  * [呼び出し履歴の確認方法](/ja/faq/call-logs) — コンソールでの手動確認
  * [ログと課金の理解](/ja/faq/log-billing-explained) — 課金フィールドの読み取り方
</Card>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.