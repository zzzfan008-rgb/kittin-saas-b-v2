> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# task_id で Seedance 動画の実際のコストを確認する方法

> 1 本の動画に対してログには 2 件の課金エントリが表示され、タスク詳細には 1 つのクォータが表示されます。ここでは、この 3 つの数値の関係と、task_id を使ってプログラムから動画の最終コストを取得する方法を説明します。

## 短い回答

**`task_id` でタスク API を照会してください。返される `quota` が動画の合計コストです。** 2 件のログエントリ（事前チャージ + 精算）の合計がこれに一致し、「非同期タスク」詳細ビューの `quota` も同じ数値です。

```bash theme={null}
curl --compressed -s "https://api.apiyi.com/api/task/self?p=1&page_size=1&task_id=<your task_id>" \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data.items[0] | {task_id, status, quota, submit_time, finish_time}'
```

`quota ÷ 500,000 = USD`。**システム token**（`sk-` API キーではありません）で認証してください。取得方法については、[ログ照会 API](/ja/api-capabilities/log-query)を参照してください。

ログ照会 API を通じてログエントリを 1 件ずつ対応付けようとしないでください。どちらのエントリにも `task_id` は含まれておらず、精算エントリの `request_id` は空です。

## 3つの数値の関係

Seedance 動画は「送信時に事前請求し、完了時に差額を精算する」方式で課金されるため、1本の動画では2件のログエントリが残ります。一方、タスク API とタスク詳細ビューには単一の `quota` が表示されます。

| 場所                      | 値         | 意味                                                                                                         |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| ログエントリ 1（事前請求）          | 例：224,999 | リクエストパラメータから見積もられ、送信時に差し引かれます。`completion_tokens` は 0、`request_id` は存在します                                  |
| ログエントリ 2（精算）            | 例：702,613 | 完了時に実際の tokens から合計が再計算され、**差額のみが記録されます**（正数 = 追加請求、負数 = 返金）。`completion_tokens` は実際の使用量、`request_id` は空です |
| タスク API / タスク詳細 `quota` | 例：927,612 | **2件の合計 = 最終総コスト** = 実際の tokens × モデル比率 × グループ比率                                                           |

精算は返金になる場合もあります。高速な 480p・4秒のテキストから動画へのタスクでは、144,000 が事前請求され、40,594 tokens × 18.5 × 0.18 = 135,179 を使用したため、精算エントリには −8,821（\$0.02 の返金）が記録され、タスク API の `quota` は 135,179 です。

最初の数値セットは、参照動画を使用した実際の 2.0 画像から動画へのタスクに基づいています。368,100 tokens × 14（動画入力の課金ティア）× 0.18（グループ比率）= 927,612、すなわち \$1.86 です。精算エントリの `other` フィールドには、`final_quota` = 927,612、`original_quota` = 224,999、`adjustment_quota` = 702,613 が格納されるため、3つすべてを1つのレコードで確認できます。

## ステータス別に実際のコストを確認する

| `status`                    | `quota` の意味                   | 動画の実際のコスト                                                          |
| --------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `completed`                 | 最終確定合計                        | = `quota`                                                          |
| `submitted` / `in_progress` | 送信時に取得される事前請求のみ               | 完了を待ってください                                                         |
| `failed`                    | **事前請求が引き続き表示されます。ゼロにはなりません** | **0**。事前請求は全額返金され、負の `type=11` ログエントリの `content` に task\_id が含まれます |

2 つの用語体系は異なります。動画クエリエンドポイント `/seedance/api/v3/.../tasks/{id}` では成功を `succeeded` と報告しますが、タスク API `/api/task/self` では `completed` と報告します。ポーリングコードの条件をコピーしないでください。

<Warning>
  失敗したタスクの `quota` を合計すると、事前請求が支出として計上されます。プログラムで照合する場合は `status` でフィルタリングしてください。代わりにログ照会 API を通じて照合する場合は、**`type=2` と `type=11` の両方を取得してください**。後者は負の `quota` を持つ返金エントリです。
</Warning>

## パラメータ表記（ログクエリAPIとは逆）

タスクAPIのページングパラメータは**snake\_case `page_size`**で、ページ番号は**`p`が1から開始**します。一方、ログクエリAPIではcamelCase `pageSize`を使用し、`p`は0から開始します。間違えてもエラーは発生せず、デフォルトページが返されるだけです。

確認済みのフィルター:

| パラメータ                               | 説明                                                |
| ----------------------------------- | ------------------------------------------------- |
| `task_id`                           | 1つのタスクのみを正確に取得します                                 |
| `model_name`                        | モデルでフィルターします。例: `doubao-seedance-2-0-fast-260128` |
| `start_timestamp` / `end_timestamp` | Unix秒。送信時刻でフィルターされます                              |
| `p` / `page_size`                   | ページング。`p`は1から開始します                                |

バッチ照合では、時間ウィンドウで取得してください。各項目には`task_id`、`status`、`quota`、`submit_time`、`finish_time`、`model_name`が含まれます:

```python theme={null}
import os, time, requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"], "Accept": "application/json"}

def video_cost(task_id: str):
    """Return (status, cost in USD). Failed tasks cost 0; in-progress tasks return None."""
    r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                     params={"p": 1, "page_size": 1, "task_id": task_id})
    r.raise_for_status()
    items = r.json()["data"]["items"]
    if not items:
        return None, None
    task = items[0]
    status = task["status"]
    if status == "completed":
        return status, task["quota"] / 500_000
    if status == "failed":
        return status, 0.0
    return status, None          # submitted / in_progress: quota is only the pre-charge, do not book it yet

def list_tasks(start: int, end: int, page_size: int = 100):
    """Page through a submission-time window; p starts at 1, stop on an empty page."""
    p = 1
    while True:
        r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                         params={"p": p, "page_size": page_size,
                                 "start_timestamp": start, "end_timestamp": end})
        r.raise_for_status()
        items = r.json()["data"]["items"]
        if not items:
            return
        yield from items
        p += 1
        time.sleep(1)
```

## ログを手動で照合する必要がある場合

精算エントリの3つのフィールドは、タスク API と一致します。

* そのタイムスタンプ（`created_at`）は、1秒以内の差でタスクの `finish_time` と一致します
* その `completion_tokens` は、タスクの `usage.completion_tokens` と一致します
* その `other.final_quota` は、タスクの `quota` と一致します

チャージ前エントリの `request_id` は、送信レスポンスの **`X-Shellapi-Request-Id`** ヘッダーと一致するため、`/api/log/self?request_id=…` で検索できます。レスポンスには `X-Request-Id` ヘッダーも含まれる点に注意してください。これはプロバイダー側のリクエスト ID であり、APIYI のログから見つけることはできません。ただし、**複数のタスクが同じ秒に送信されると、チャージ前エントリが重複する**うえ、精算エントリには `request_id` がないため、ログは個別タスクのスポットチェックにのみ適しています。プログラムによる照合にはタスク API を使用してください。

## よくある質問

<AccordionGroup>
  <Accordion title="タスク詳細のクォータが、2件のログエントリの合計と異なるのはなぜですか？">
    まずタスクのステータスを確認してください。`submitted` / `in_progress`の間は、`quota`は事前チャージのみで、2件目のログエントリはまだ存在しません。一方、`failed`の場合、`quota`には事前チャージが表示されたままですが、ログにはマイナスの返金エントリが追加されるため、2件の合計は0になります。`completed`タスクの場合は、2件の値が一致する必要があります。一致しない場合は、`task_id`をサポートに送信してください。
  </Accordion>

  <Accordion title="決済エントリにtokenとrequest_idがないのはなぜですか？">
    決済はタスク完了時にシステムによって記録され、ゲートウェイのリクエスト経路外で処理されるため、token、グループ、`request_id`は含まれず、コンソールでは「streaming」と表示されます。これは正常な動作です。
  </Accordion>

  <Accordion title="汎用動画エンドポイントを通じて送信したタスクには、ログにtask_idが記録されますか？">
    `/v1/videos`およびその他の汎用エンドポイントでは、事前チャージエントリの`content`に`task ID: cgt-…`が含まれますが、決済エントリには依然として含まれません。これらのエンドポイントでは、現在もSeedanceの解像度パラメータの引き渡しが不完全であるため、必ずドキュメントに記載されたパス`/seedance/api/v3/contents/generations/tasks`を使用してください。[動画生成 API](/ja/api-capabilities/seedance2/video-generation)を参照してください。
  </Accordion>

  <Accordion title="システムtokenで他のアカウントのタスクを確認できますか？">
    `/api/task/self`は、tokenを所有するアカウントのタスクのみを返します。システムtokenはアカウント認証情報と同等です。そのため、パスワードと同じように厳重に管理し、コードリポジトリに保存しないでください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Seedance 2.0 / 2.5：ログで課金額を確認する](/ja/api-capabilities/seedance2/overview)
* [ログクエリ API](/ja/api-capabilities/log-query)
* [送信後に Seedance の動画タスクをキャンセルできますか？](/ja/faq/seedance-video-task-cancel)
* [API 呼び出しの事前引き落としの仕組みとは？](/ja/faq/pre-deduction-quota)
