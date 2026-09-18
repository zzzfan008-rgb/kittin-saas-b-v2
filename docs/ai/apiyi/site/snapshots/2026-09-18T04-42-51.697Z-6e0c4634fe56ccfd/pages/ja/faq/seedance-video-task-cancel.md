> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 送信後にSeedanceの動画タスクをキャンセルできますか？

> Seedance 2.0タスクのキャンセル、重複送信、課金の確認。

## 簡単な回答

現在公開されている Seedance 2.0 APIドキュメントによると、APIはタスクの作成とタスクステータスの照会を提供していますが、タスクのキャンセルまたは削除用エンドポイントは提供していません。

タスクが正常に作成されると、APIは`task_id`を返します。クライアントのタイムアウト、ネットワークの中断、Webページを閉じたこと、またはポーリングを停止したことは、タスクがキャンセルされた証拠とみなさないでください。再試行するかどうかを判断する前に元のタスクを照会し、重複したタスクを作成しないようにしてください。

## 公開エンドポイントとタスクステータス

Seedance 2.0 は現在、非同期タスクエンドポイントを使用します。

| 操作        | エンドポイント                                                | 説明                                     |
| --------- | ------------------------------------------------------ | -------------------------------------- |
| タスクを作成    | `POST /seedance/api/v3/contents/generations/tasks`     | 動画生成タスクを送信し、成功時にタスク ID を返します           |
| タスクを照会    | `GET /seedance/api/v3/contents/generations/tasks/{id}` | タスクステータスを照会し、成功後に動画 URL を返します          |
| タスクをキャンセル | 現在の公開ドキュメントには記載されていません                                 | 現在、公開されているキャンセルまたは削除用エンドポイントは記載されていません |

タスクは通常、次のライフサイクルに従います。

```text theme={null}
queued → running → succeeded / failed / expired
```

* `queued`: タスクが作成され、キューで待機しています。
* `running`: タスクが処理中です。
* `succeeded`: 動画生成が正常に完了しました。
* `failed`: タスクの処理に失敗しました。
* `expired`: タスクが実行可能時間を超過し、期限切れになりました。

生成が正常に完了すると、動画 URL は次の場所に返されます。

```text theme={null}
content.video_url
```

これは一時的な署名付き URL です。現在のドキュメントでは、有効期間は約 24 時間と記載されています。タスクが成功したら、速やかに動画をダウンロードして保存してください。

<Warning>
  現在の公開 API ドキュメントには、タスクキャンセル用のエンドポイントは記載されていません。ローカルスクリプトを停止したり、ポーリングを停止したりしても、クライアントによる照会が停止するだけであり、サーバー側のタスクが取り消されたことを示すものではありません。
</Warning>

## What should I do after submitting a task?

### Step 1: Save the task ID and request details

Save the returned `task_id` immediately after the creation request succeeds.

You should also record:

* The model name;
* The prompt or a prompt summary;
* Important parameters such as duration, resolution, and aspect ratio;
* The submission time;
* The request ID;
* The business ID in your own system.

These details help you query the task, troubleshoot problems, and reconcile billing records later.

### Step 2: Query the original task

Seedance 2.0 tasks usually take minutes. The current API documentation recommends:

* Waiting about 20–30 seconds after submission before the first query;
* Querying every 10–20 seconds afterward;
* Not resubmitting immediately just because the video is not available yet.

Example task query:

```bash theme={null}
curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/YOUR_TASK_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Replace the placeholders with real values:

* `YOUR_TASK_ID`: The task ID returned by the task-creation endpoint;
* `YOUR_API_KEY`: An API key created in the APIYI console.

### Step 3: Handle each task status

Handle the returned status as follows:

* `queued`: The task is still waiting; continue waiting and querying.
* `running`: The task is still generating; continue waiting and querying.
* `succeeded`: Download the video from `content.video_url` immediately.
* `failed`: Inspect the `error` information in the response.
* `expired`: Review the task details and call logs to determine why it expired.

Do not treat `queued` or `running` as failures, and do not create another task just because the current task has not finished.

### Step 4: Confirm the task status after a client timeout

Do not retry immediately if the client did not receive a complete response.

Check the following in order:

1. Check whether the client response already contains a `task_id`.
2. Check whether the console call logs contain a task record.
3. If a `task_id` exists, query the original task first.
4. If no `task_id` is visible yet, do not conclude from the network error alone that no task was created.
5. If you cannot confirm whether the task was created, ask support to verify it before retrying.

A client timeout only means that the client did not receive a response within the expected time. It does not, by itself, prove that the server did not create a task.

## How can I prevent duplicate submissions?

The following are integration-side engineering practices, not mandatory platform rules:

* Generate a unique business ID for each request.
* Store the mapping between the business ID and the Seedance `task_id`.
* Temporarily disable the submit button after the user submits a request.
* After a client timeout or process exit, resume by querying the original task.
* Store the prompt, model, duration, aspect ratio, and reference-material details.
* Consider a new submission only after confirming that the original task does not exist or has clearly failed.
* Distinguish in-progress statuses from terminal statuses. Do not treat `queued` or `running` as failures.

For agents, scripts, and background services, keep task creation and task querying as separate operations:

```text theme={null}
Create task: execute once
Save task_id: write it to a database or task record
Query task: poll by task_id
Recover process: read the saved task_id and continue querying
```

This allows a process to resume querying the original task after a local restart instead of creating another task.

## 重複送信後の課金をどのように照合すべきですか？

現在のSeedance 2.0のドキュメントでは、課金フローは次のように説明されています。

```text theme={null}
Pre-charge when the task is submitted → refund the difference or settle the final amount after completion
```

そのため、残高の変動とログエントリは、1つの操作としてまとめて表示されない場合があります。概要ドキュメントには、1つの動画タスクが、事前課金と後続の精算に関する複数のログエントリに対応する場合があることも記載されています。最終的な確認には呼び出しログを使用してください。

現在のドキュメントには、タスクの作成に成功せず、無効なパラメーターが原因で拒否されたリクエスト（例：`InvalidParameter` HTTP 400リクエスト）は課金されないとも記載されています。

ただし、以下の情報だけでは、課金されたかどうかを判断できません。

* クライアントのタイムアウト；
* ネットワークの切断；
* `failed`；
* `expired`；
* クライアントが完全なレスポンスを受信していないこと；
* サーバー上ではタスクが作成されている可能性があるにもかかわらず、クライアントにリクエストの失敗が表示されること。

すでに複数のタスクが作成されている場合は、新しいタスクの送信を停止し、以下を収集してください。

* 関連するすべてのSeedance `task_id`の値；
* 対応するリクエスト ID；
* 送信時刻；
* モデル名；
* 重要なリクエストパラメーター；
* コンソールの呼び出しログ；
* 課金またはチャージ記録のスクリーンショット。

その後、手動確認を依頼するため、サポートに連絡してください。タスクが課金されたかどうか、重複課金が発生したかどうか、また利用可能な課金対応があるかどうかは、タスク記録、呼び出しログ、課金記録、およびプラットフォームによる確認結果に基づいて判断する必要があります。

<Note>
  `failed`、`expired`、またはクライアントのタイムアウトだけを根拠に、タスクが確実に課金された、または確実に課金されていないと結論付けないでください。
</Note>

## よくある質問

### ポーリングを停止すると、Seedance のタスクも自動的に停止しますか？

そうとは限りません。

ポーリングを停止することは、クライアントがタスクのステータスを照会しなくなることを意味するだけです。現在公開されている API ドキュメントにはキャンセル用のエンドポイントが記載されていないため、ポーリングを停止しても、サーバー側のタスクがキャンセルされたことを意味しません。

元の `task_id` を保存し、後でもう一度照会してください。

### リクエストがタイムアウトした直後に再試行できますか？

直ちに再試行することは推奨しません。

まず、次の点を確認してください。

* レスポンスに `task_id` が含まれているかどうか。
* コンソールの呼び出しログにタスクの記録があるかどうか。
* 元のタスクの現在のステータス。
* 対応する課金記録がすでに存在するかどうか。

元のタスクが作成されている場合は、同じビジネスリクエストに対して別のタスクを作成する前に、そのタスクを照会してください。

### 失敗または期限切れの場合、必ず課金されていないということですか？

タスクのステータスだけでは、課金結果を判断できません。

Seedance 2.0 では、送信時に事前課金を行い、完了後に精算します。呼び出しログと課金記録の両方を確認してください。記録に誤りがあるように見える場合は、確認のためにタスクIDとリクエストIDをサポートに提供してください。

### 無効なパラメータが原因の HTTP 400 は課金されますか？

現在のドキュメントでは、タスクを作成せずに無効なパラメータを理由として拒否されたリクエストは、課金されないと説明されています。

例：

* パラメータ形式が無効である。
* サポートされていない解像度である。
* アスペクト比が無効である。
* サポートされていない動画の長さである。
* モデルとパラメータの組み合わせに互換性がない。

すべての HTTP 400 レスポンスを同じケースとして分類しないでください。最終的な判断基準として、具体的なエラーメッセージ、タスク記録、呼び出しログを使用してください。

### 生成された動画のURLはどのくらい保持できますか？

現在のドキュメントでは、成功したレスポンスの `content.video_url` は約24時間有効な一時的な署名付きURLであると説明されています。

タスクが `succeeded` に達したら、できるだけ早く動画をダウンロードして保存してください。URLを永続的なものとして扱わないでください。

現在のドキュメントでは、タスクID自体は7日間保持されるとも説明されています。それでも、ビジネス上の追跡のために、独自のタスク記録を保存してください。

## 関連ドキュメント

* [Seedance 2.0 動画生成 API](/ja/api-capabilities/seedance2/video-generation)
* [Seedance 2.0 動画生成の概要](/ja/api-capabilities/seedance2/overview)
* [モデルエラーはどのようにトラブルシューティングすればよいですか？](/ja/faq/model-error-troubleshooting)
* [task\_id を使用して Seedance 動画の実際のコストを確認する方法](/ja/faq/seedance-task-cost-lookup)

## サポートへのお問い合わせ

次の場合は、サポートにお問い合わせください。

* `queued` または `running` のまま、通常よりも長時間経過しているタスクがある場合；
* クライアントのタイムアウト後にタスクが作成されたかどうか確認できない場合；
* 重複送信後に複数のタスクが作成された場合；
* タスクのステータスと課金記録が一致しない場合；
* 成功したタスクで動画が返されない、またはダウンロードできない場合。

サポートにお問い合わせの際は、以下の情報をできるだけ多くご提供ください。

* Seedance `task_id`；
* リクエストID；
* 送信時刻；
* モデル名；
* 重要なリクエストパラメータ；
* コンソールの呼び出しログ；
* 関連する課金記録。

サポート窓口：[WeCom上のAPIYIサポート](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
