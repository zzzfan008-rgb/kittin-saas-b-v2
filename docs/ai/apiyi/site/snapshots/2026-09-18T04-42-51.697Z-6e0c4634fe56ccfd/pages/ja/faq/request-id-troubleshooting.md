> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# リクエストIDはどこで確認できますか？

> APIの種類ごとにレスポンスヘッダーまたはレスポンスボディでリクエストIDを確認する方法と、リクエストIDと非同期タスクIDを区別する方法を説明します。

## 簡単な回答

API呼び出しをトラブルシューティングする際は、まず**モデル名、エンドポイント、呼び出し時刻**を記録してください。次に、HTTPレスポンスヘッダーで`x-request-id`または`request-id`を確認してください。エンドポイントがエラーレスポンスを返した場合は、レスポンスのJSONボディで`request_id`などの識別子も確認し、APIYIログで見つかるフィールドを使用してください。

WanおよびHappyHorseの動画エンドポイントは、レスポンスボディに`request_id`も返します。同じレスポンス内の`task_id`は動画タスクの照会に使用するもので、Request IDとは異なります。SeedanceやVeoなどの非同期エンドポイントが返す`id`または`task_id`も、動画タスクIDです。

<Info>
  APIYIのログページでは、「リクエストID / アップストリームリクエストID / 完了ID」フィルターに表示される識別子を検索できます。コンソールでログの詳細を開き、ユーザーから提供された識別子を使用して検索してください。
</Info>

## まずは次の3ステップから始めます

<Steps>
  <Step title="ステップ1：モデルとエンドポイントを確認する">
    完全なモデル名と実際のURLを記録します。テキストモデルでは通常`/v1/chat/completions`、埋め込みモデルでは`/v1/embeddings`、画像モデルでは`/v1/images/generations`、動画モデルでは`/v1/videos`またはモデル固有の非同期エンドポイントを使用します。
  </Step>

  <Step title="ステップ2：呼び出し時刻を記録する">
    リクエストを送信した時刻を記録し、2026-08-25 14:32 (UTC+8)のようにタイムゾーンを含めます。リクエストを再試行した場合は、各再試行のおおよその時刻を記録します。
  </Step>

  <Step title="ステップ3：レスポンスとログの詳細を保存する">
    HTTPステータスコード、完全なレスポンスヘッダー、完全なレスポンスボディ、クライアント例外を保存します。その後、APIYIの「ログ」ページを開き、リクエストID、アップストリームリクエストID、または完了IDで検索します。
  </Step>
</Steps>

## API 種別ごとのリクエスト ID の確認場所

| API 種別               | 最初に確認する場所                                                             | 混同しないフィールド                                                                                                               |
| -------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| テキスト／チャットモデル         | 通常は HTTP レスポンスヘッダーの `x-request-id` または `request-id` を確認し、エラーボディーも調べます | ボディー内の `id` は APIYI のリクエスト ID ではなく、完了 ID の場合があります                                                                        |
| 画像モデル                | 通常は HTTP レスポンスヘッダーの `x-request-id` または `request-id` を確認し、エラーボディーも調べます | 名前だけを根拠に、画像レスポンスオブジェクト ID を APIYI のリクエスト ID と判断しないでください                                                                  |
| 埋め込みモデル              | まず実際のレスポンスヘッダーを確認し、エラーボディーも調べます                                       | 現在の埋め込みの例では主に `data[].embedding` が示されています。ドキュメントでは、すべてに共通するリクエスト ID フィールドの場所は定義されていません                                   |
| Wan ／ HappyHorse 動画  | レスポンスボディー内の `request_id` と、レスポンスヘッダーを確認します                            | `output.task_id` はポーリングに使用する動画タスク ID です                                                                                  |
| Seedance 動画          | レスポンスヘッダーの **`X-Shellapi-Request-Id`** を確認し、ボディーのトップレベル `id` も別途保存します | トップレベルの `id` は動画タスク ID であり、リクエスト ID ではありません。`X-Request-Id` ヘッダーはプロバイダー側のリクエスト ID であり、APIYI のログでは確認できません（2026-09-15 検証済み） |
| Veo およびその他の非同期動画 API | エンドポイントがリクエスト ID を返す場合は、まずレスポンスヘッダーの値を記録し、タスクフィールドも保存します              | ボディー内の `id` ／ `task_id` は動画タスク ID です                                                                                     |

<Warning>
  HTTP ヘッダー名では大文字と小文字は区別されませんが、フィールド名の区切り文字は重要です。`x-request-id`、`request-id`、`request_id` は異なる表記です。1 つのフィールド名だけを検索するのではなく、レスポンスヘッダーとエラーボディーの両方を確認してください。
</Warning>

## コードで確認

### Python

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "YOUR_MODEL",
        "messages": [{"role": "user", "content": "Test request"}],
    },
    timeout=60,
)

header_request_id = (
    response.headers.get("x-request-id")
    or response.headers.get("request-id")
)

try:
    body = response.json()
except ValueError:
    body = {}

# Use body.request_id only as a candidate; do not treat body.id as the APIYI Request ID automatically.
request_id = header_request_id or body.get("request_id")

print("status:", response.status_code)
print("request_id:", request_id)
print("body:", response.text)
```

### cURL

`-i`を使用して、応答ヘッダーと応答本文の両方を出力します。ヘッダー内の`x-request-id`または`request-id`を確認してください。

```bash theme={null}
curl -i "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [{"role": "user", "content": "Test request"}]
  }'
```

WanまたはHappyHorseの動画呼び出しでは、本文の2つのフィールドも保存します。

```python theme={null}
body = response.json()
request_id = body.get("request_id")
task_id = body.get("output", {}).get("task_id")
```

## コンソールログを検索

<Steps>
  <Step title="呼び出しログを開く">
    APIYI コンソールにサインインし、「ログ」を開いて、調査する呼び出しの詳細を開きます。
  </Step>

  <Step title="利用可能な識別子を入力する">
    識別子を「リクエストID / 上流リクエストID / 完了ID」フィルターに貼り付けます。APIYI のレスポンスヘッダーにあるリクエストIDを優先し、利用できない場合は上流リクエストIDまたは完了IDを試します。
  </Step>

  <Step title="詳細を比較する">
    モデル、呼び出し時刻、エンドポイント、チャネル、HTTPステータス、エラーコード、課金記録を比較して、リクエストが APIYI に到達したか、上流プロバイダーに到達したか、リクエストを変更した後に再試行すべきかを判断します。
  </Step>
</Steps>

<Tip>
  ユーザーが障害発生時刻のおおよその時間しか把握していない場合でも、モデル、エンドポイント、時刻で検索範囲を絞り込めます。通常、リクエストIDを使うと、単一の呼び出しをはるかに速く特定できます。
</Tip>

## リクエストIDがないのはなぜですか？

HTTPレスポンスを受信する前にリクエストが失敗した場合（DNS解決、TCP/TLS接続の確立、ローカルプロキシによる拒否、クライアント側の接続タイムアウトなど）、APIYIはレスポンスヘッダーを返す機会がありません。その場合、クライアントが利用できるリクエストIDはありません。

代わりに、以下の情報を提供してください。

* 元のクライアント例外と完全なスタックトレース
* リクエスト時刻とタイムゾーン
* モデルとエンドポイント
* HTTPクライアント、プロキシ、またはネットワーク環境
* 利用可能な場合は、成功した呼び出しまたは再試行した呼び出しのリクエストID

<Warning>
  トラブルシューティング用の資料に完全なAPIキーを送信しないでください。キーの中央部分をマスクし、個人情報や、業務上の完全なコンテンツまたは画像を含むリクエストボディを公開しないでください。
</Warning>

## サポートに提供する情報

* リクエスト ID
* ログに表示されている場合は、上流リクエスト ID または完了 ID
* モデル名とエンドポイント
* タイムゾーン付きの呼び出し時刻
* HTTP ステータス、完全なレスポンスボディ、クライアント例外
* マスキング済みリクエスト、ならびにコンソールログに表示されたエラーコードと課金ステータス】【。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="モデルエラーのトラブルシューティング方法" icon="alert-triangle" href="/ja/faq/model-error-troubleshooting">
    パラメータ、グループ、タイムアウト、モデルエラーのトラブルシューティング
  </Card>

  <Card title="呼び出しログの表示方法" icon="file-text" href="/ja/faq/call-logs">
    コンソールでAPI呼び出し、エラー、課金の詳細を表示
  </Card>

  <Card title="ログクエリAPI" icon="search" href="/ja/api-capabilities/log-query">
    時間、モデル、またはrequest\_idで呼び出しログを検索
  </Card>

  <Card title="画像APIのベストプラクティス" icon="image" href="/ja/api-capabilities/image-api-best-practices">
    画像のタイムアウト、切断、課金、リクエストIDのトラブルシューティング
  </Card>
</CardGroup>
