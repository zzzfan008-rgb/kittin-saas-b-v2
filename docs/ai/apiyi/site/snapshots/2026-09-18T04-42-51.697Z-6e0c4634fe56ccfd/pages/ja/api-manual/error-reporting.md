> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API エラー詳細の取得

> APIYI はエラー詳細を API レスポンス本文のみに返します。バックエンドログは課金台帳であり、課金対象になった呼び出しのみを記録します。このページでは、なぜ生のエラーを自分で出力する必要があるのか、Python / Node.js / cURL での正しい取得パターン、ComfyUI のようなラッパーから生の出力を取得する方法、保持すべき 7 つのフィールド、そしてそのまま貼り付けられるサポートチケット用テンプレートについて説明します。

<Warning>
  ### まず最初に: 生のエラーはレスポンスボディにちょうど1回だけ現れます

  APIYI はエラーの詳細を **API レスポンスボディ内でのみ** 返します。バックエンドログは **課金台帳** であり、課金が発生した呼び出しを記録します。失敗したリクエストは課金されず、そこにも記録されません。

  つまり、「バックエンドログに見つからない」ことは「発生していない」を意味しません。それは **そのエラーの唯一の記録がクライアント側にしかない** ことを意味します。もしそれを表示して永続化していなければ、完全に失われますし、こちらでも復元できません。
</Warning>

<Info>
  **要点を1行で言うと**: **生のレスポンスボディ** を返された内容のまま正確に表示してください。プログラムが包んだ1行の文字列だけを残してはいけません。`400 Bad Request` のような文字列は診断にほとんど役立ちません。本当の答えは、それが捨てた JSON の中にあります。
</Info>

## 実例: 400 Bad Request では何も分かりません

あるお客様から、たった 1 行だけの報告がありました:

```text theme={null}
apiyi GPT Image 2 2k: 400 Bad Request from POST https://api.apiyi.com/v1/images/edits
```

その文字列は、**クライアントフレームワークがエラーをラップした後に生成したもの**です。モデル名、HTTP メソッド、URL、ステータスコードは保持されていましたが、本当に重要な **レスポンス本文** だけが捨てられていました。サポートが出せる最善の回答は次のとおりでした:

> 400 は通常、コンテンツ安全性かパラメータの問題のいずれかです。おそらくコンテンツ安全性です。

これは **推測** であって、結論ではありません。というのも、まったく同じ呼び出しでも、実際のレスポンス本文は次の 3 つのいずれかだった可能性があり、それぞれで取るべき対応はまったく異なるからです:

| `error.message` in the response body             | 実際の原因                                                                    | 対応方法                                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `Your request was rejected by the safety system` | 上流側のコンテンツ安全性ブロック                                                         | prompt か参照画像を変更してください。**再試行しないでください** — 再度ブロックされます。[コンテンツ安全性](/ja/faq/content-safety) を参照してください              |
| `Invalid value for 'size': expected one of ...`  | パラメータ内の enum 値が無効です                                                      | コードレベルのバグです。パラメータを修正してください。再試行しても無意味です                                                                       |
| `invalid_image_file` / `Invalid input image`     | 参照画像そのものが無効です（たとえば、Android スマホの `.jpg` は、実際には複数フレームの MPO ファイルであることがあります） | Pillow などで再エンコードしてから再送してください。[Image API essentials](/ja/api-capabilities/image-api-best-practices) を参照してください |

<Warning>
  **同じ 400 でも、対応は 3 通りまったく異なります。** レスポンス本文を捨てると、3 択の判断が当て推量になり、しかも誤った推測はサポートの往復メッセージと不要な再試行を招きます。

  さらに悪いことに、これら 3 つのケースのうち 2 つは、そもそも再試行すべきではありません。見分けられないなら、盲目的に再試行するしかなく、時間もクォータも浪費します。
</Warning>

## バックエンドログにあるもの・ないもの

まず押さえるべき考え方は、**バックエンドログはエラーログではなく、課金台帳です。**

| 探している内容               | バックエンドの[ログページ](https://api.apiyi.com/log) | API レスポンス                  |
| --------------------- | ----------------------------------------- | -------------------------- |
| この呼び出しに対する課金額         | はい                                        | いいえ（`usage` は token 数のみです） |
| token 使用量             | はい                                        | はい（`usage` フィールド）          |
| モデル名、呼び出し時刻           | はい（成功した呼び出しのみ）                            | 自分で記録する必要があります             |
| `request_id`          | はい（成功した呼び出しのみ）                            | `x-request-id` レスポンスヘッダー   |
| **エラーコードと生のエラーメッセージ** | **いいえ**                                   | **唯一の情報源**                 |
| **上流側が拒否した具体的な理由**    | **いいえ**                                   | **唯一の情報源**                 |
| 失敗した呼び出しそのもの          | **記録されません**（課金がないため、台帳エントリもありません）         | —                          |

<Tip>
  **逆から読むと、接続問題を見分ける最も強力な単独テストになります**: ログに**課金エントリがある**なら、リクエストは上流側に到達してリソースを消費しています。**ない**なら、問題はほぼ確実に上流側に届く前に発生しています（ネットワーク、認証、パラメータ検証）。詳しくは [ログで課金額を読む](/ja/faq/log-billing-explained) を参照してください。
</Tip>

## 保持すべき 7 つの項目

失敗した 1 回の呼び出しを診断するには、これで十分です。どれか 1 つでも欠けると、診断は推測に逆戻りします。

| 項目                           | 取得方法                                           | これがないと何が壊れるか                                                             |
| ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| **HTTP ステータスコード**            | `resp.status_code` / `err.status`              | 拒否されたリクエスト（4xx）とサーバー障害（5xx）、そしてそもそも接続が確立されなかったケース（ステータス自体がない）を見分けられません   |
| **レスポンスボディ全体**               | `resp.text` / `await resp.text()`              | **最重要です** — 実際の原因はここにあります。これを失うと、できるのは推測だけです                             |
| **`x-request-id` レスポンスヘッダー** | `resp.headers.get("x-request-id")`             | サポートがその正確な呼び出しを特定できず、代わりに曖昧な時間帯で探すことになります                                |
| **呼び出し時刻、タイムゾーン付き**          | クライアント側で記録してください。例: `2026-08-03 15:44 (UTC+8)` | お客様は世界中にいるため、タイムゾーンのないタイムスタンプではログと照合できません                                |
| **モデル名 + エンドポイントパス**         | ご自身のリクエストから                                    | 同じモデルでも、エンドポイントが違うと挙動が変わります（`/v1/images/edits` と `/v1/chat/completions`） |
| **主要なリクエストパラメータ**            | `size`、`quality`、参照画像の枚数とサイズ、`max_tokens` など   | パラメータの問題は再現できません。画像の問題では、アセット自体に原因があるのかも判断できません                          |
| **生のクライアント例外 + リトライ回数**      | `repr(e)`、および試行ごとに 1 行のログ                      | リトライが成功すると、ログにはきれいな 200 が 1 件だけ残り、実際にトランスポートが何回失敗したかは見えません               |

<Note>
  **レスポンスボディを切り詰めないでください。** 200 文字に切り詰めるのは通常の業務ログとしては妥当ですが、診断では重要な情報が末尾にあることがよくあります。少なくとも先頭の 2000 文字は残してください。画像エンドポイントで base64 がログを大量に埋めるのが心配なら、`status_code >= 400` のときだけ全文を出力してください。エラーボディはたいてい短いです。
</Note>

## エラー捕捉パターンを正しくする

原則は実質 1 つだけです: **2 層で捕捉し、どちらの層でも何も捨てないことです。**

* **トランスポート層の失敗**: 接続リセット、TLS ハンドシェイク失敗、タイムアウト、DNS 失敗。**HTTP 応答はまったくありません** — 取得できるのは例外テキストだけです。
* **HTTP 層のエラー**: サーバーが 4xx / 5xx を返しました。**レスポンスボディ**があり、必ずそれを読み取る必要があります。

### Python / requests

```python theme={null}
import time
import requests

BASE_URL = "https://api.apiyi.com/v1"
API_KEY = "sk-your-api-key"          # read from an environment variable in production


def call_and_log(path, payload, timeout=300):
    started = time.strftime("%Y-%m-%d %H:%M:%S %z")      # includes timezone
    try:
        resp = requests.post(
            f"{BASE_URL}{path}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=payload,
            timeout=timeout,
        )
    except requests.exceptions.Timeout as exc:
        # Transport layer: timed out, no HTTP response to read
        raise RuntimeError(f"[{started}] timed out after {timeout}s: {exc!r}") from exc
    except requests.exceptions.RequestException as exc:
        # Transport layer: connection reset, SSL error, DNS failure — still no body
        raise RuntimeError(f"[{started}] transport failure: {exc!r}") from exc

    if resp.status_code >= 400:
        # The point: pass the body through verbatim, don't reword it here
        raise RuntimeError(
            f"[{started}] HTTP {resp.status_code} {path} "
            f"model={payload.get('model')}\n"
            f"x-request-id: {resp.headers.get('x-request-id')}\n"
            f"{resp.text}"
        )
    return resp.json()
```

<Warning>
  **ボディを読む前に `raise_for_status()` を呼び出さないでください。** それが送出する `HTTPError` に含まれるのは `400 Client Error: Bad Request for url: ...` だけで、実際のメッセージは `resp.text` にそのまま残ったまま誰にも読まれません。これは、このページの先頭にあるケースが起きる理由の 1 つです。使う場合は、先に `resp.text` を取り出してください。
</Warning>

### Python / OpenAI SDK

公式 SDK は、3 つの要素をすでに例外オブジェクトに付与しています。多くの人は代わりに、自分の 1 行メッセージを `print` してしまいます:

```python theme={null}
from openai import OpenAI, APIStatusError, APIConnectionError

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,      # built-in exponential backoff for 429 / 5xx / connection errors
    timeout=60.0,
)

try:
    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Hello"}],
    )
except APIStatusError as e:
    # Server returned 4xx/5xx: status, request-id and body are all right here
    print("status code :", e.status_code)
    print("request-id  :", e.request_id)
    print("raw body    :", e.response.text)
    raise
except APIConnectionError as e:
    # No HTTP response: connection reset, timeout, local proxy failure
    print("transport   :", repr(e), "|", repr(e.__cause__))
    raise
```

<Tip>
  1 行でも、`print(f"API error: {e}")` ではなく `print("request failed")` にすべきです — SDK の例外の `str(e)` には **すでにサーバーのメッセージが含まれています**。実際に情報を失わせるのは、例外オブジェクト自体を完全に捨ててしまうことです。
</Tip>

### Node.js

SDK では:

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

try {
  const resp = await client.images.edit({ /* ... */ });
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    // Server returned 4xx/5xx
    console.error('status code :', err.status);
    console.error('request-id  :', err.requestID);
    console.error('raw body    :', JSON.stringify(err.error));
  } else {
    // Transport layer: ECONNRESET, UND_ERR_*, etc. — no HTTP response
    console.error('transport   :', err.code, err.message, err.cause);
  }
  throw err;
}
```

素の `fetch` では、**ここで最もよく失敗します**:

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
  method: 'POST',
  headers: { Authorization: 'Bearer sk-your-api-key' },
  body: form,
});

if (!resp.ok) {
  const raw = await resp.text();        // read the body first, then throw
  throw new Error(
    `HTTP ${resp.status} ${resp.url}\n` +
    `x-request-id: ${resp.headers.get('x-request-id')}\n${raw}`
  );
}
```

<Warning>
  このページの先頭にある `400 Bad Request from POST https://api.apiyi.com/v1/images/edits` は、文字どおり `${resp.status} ${resp.statusText} from ${resp.method} ${resp.url}` です — **ボディは一度も読み取られていません**。

  `fetch` は HTTP 層のエラーでは reject しません。単に `resp.ok` を `false` に設定するだけです。その時点で `resp.statusText` を投げると、レスポンスオブジェクトと一緒にボディも破棄されます。**throw する前に必ず `await resp.text()` してください** — その 1 行が、診断可能なレポートと答えの出ないレポートの違いです。
</Warning>

### cURL で再現する

誰かに問題の再現を依頼するとき、このコマンドが最小の手間です — ステータスコード、ヘッダー、ボディ、時間を一度に表示します:

```bash theme={null}
curl -i -sS -X POST https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "image=@input.png" \
  -F "prompt=replace the background with plain white" \
  -w '\n---\nHTTP %{http_code}  total %{time_total}s\n'
```

* `-i` はレスポンスヘッダーを表示します。`x-request-id` があるのはそこです;
* `-sS` は進行状況バーを隠しつつ、エラー出力は保持します;
* `-w` はステータスコードと合計時間を付け足します。タイムアウト設定との比較に便利です。

## ラッパーと社内ゲートウェイ

### よい例

このエラーは、お客様の ComfyUI ノードから発生しました:

```text theme={null}
Upstream HTTP 0: OpenSSL SSL_read: Connection was reset, errno 10054
```

`400 Bad Request` よりはるかに見た目は悪いですが、それでも **完全** なので、原因の方向性は数秒で絞れます:

| フラグメント                           | 意味                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `HTTP 0`                         | HTTP レスポンスがまったく受信されませんでした。`0` は擬似ステータスコードで、ステータスラインすら到達していないことを意味します。これは 400/500 型のビジネスエラーではありません |
| `SSL_read: Connection was reset` | TLS の読み取りフェーズ中に、相手側または中間装置によって接続が切断されました                                                          |
| `errno 10054`                    | Windows `WSAECONNRESET`、Linux の `ECONNRESET` に相当します — TCP RST を受信しました                             |

結論はすぐに分かります。これは **トランスポート層** の問題であり、コンテンツの安全性やパラメータとは無関係で、課金も発生しません（リクエストが最後まで完了していないためです）。トラブルシューティングの手順: [画像 API の接続切断](/ja/api-capabilities/image-connection-drops)。

<Info>
  **2 つを比べてください**: 一方はきれいにまとまっているのに何も説明しておらず（`400 Bad Request`）、もう一方は長くて見苦しいものの、根本原因をまっすぐ示しています（`errno 10054`）。**診断では、手を加えて整えた親切なエラーより、むき出しで見苦しくても完全なエラーのほうが常に優れています。**
</Info>

### 一般的なツールで生の出力を見つける場所

| ツール                    | 生のエラーがある場所                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| ComfyUI                | ノード上の赤いテキストはたいてい途中で切れています。完全なスタックトレースは **ComfyUI を起動したターミナルウィンドウ**、またはインストールディレクトリ内の `comfyui.log` にあります |
| Dify / Coze / n8n      | 実行レコードを開き、そのノードの実行詳細を展開して、ノードのエラー要約ではなく生の HTTP レスポンスを確認してください                                            |
| LangChain / LlamaIndex | 素の `Exception` ではなく `openai.APIStatusError` を捕捉してください — 上記の SDK パターンを参照してください                            |
| デスクトップクライアント           | 設定でデバッグ / 開発者ログを有効にするか、`curl` で一度再現してください                                                                |

### 社内ゲートウェイの 3 つのルール

<Steps>
  <Step title="そのまま通し、決して書き換えない">
    中間層はコンテキスト（どのサービスか、どのテナントか、何回目のリトライか）を **追記** しても構いませんが、上流の `error.message` を **置き換えてはなりません**。一度書き換えると、元の情報を取り戻せる場所はもうありません。
  </Step>

  <Step title="ユーザー向けメッセージを生のものと分けて保存する">
    [Gemini の画像エラー処理](/ja/api-capabilities/gemini-image-error-handling) で使われている 3 要素構成に従ってください: `userMessage`（エンドユーザー向けの親しみやすい文面）、`devMessage`（開発者向けの分類）、`rawResponse`（変更せずそのままのレスポンス本文）です。最初の 2 つは自由に整え、3 つ目はそのまま保存してください。
  </Step>

  <Step title="不明なエラーを返さない">
    フォールバック分岐では、`status`、`x-request-id`、そして本文の最初の 2000 文字を記録してください。元のテキストを含む「未分類エラー」なら診断できますが、きれいな「不明なエラー」では診断できません。
  </Step>
</Steps>

## 診断を不可能にするアンチパターン

* `except Exception as e: print("request failed")` — 例外オブジェクトが失われ、どのレイヤーが失敗したのかもわかりません。
* status code だけを記録して body を記録しないこと — まさにこのページの冒頭のケースです。
* 先に `resp.text` を読まずに `raise_for_status()` を呼び出すこと — メッセージはまだメモリ上にあるのに、取得されないままです。
* `if (!resp.ok) throw new Error(resp.statusText)` in `fetch` — body は response オブジェクトと一緒に破棄されます。
* 成功した再試行のあとにきれいな 200 だけを残すこと — **各試行を個別にログしてください**。そうしないと、transport が何回失敗したのか見えず、自分の再試行を gateway の挙動と誤認するおそれがあります。
* stdout のみにログを出す、または毎日上書きでローテーションすること — 顧客が問題を報告するころには、元の記録はたいてい流れ去っています。
* 画面の写真をスマホで撮って問題を報告すること — 代わりに **テキスト** を貼り付けてください。スクリーンショットではエラーの 1 行の半分がよく切れてしまいます。

## サポートへ連絡すべきタイミング

まずは上のキャプチャと解釈の手順を確認してください。以下のいずれかに当てはまる場合は、資料をサポートへお送りください:

* 完全なレスポンスボディがあり、`error.message` が上流を指している（`upstream_error`、生の上流 5xx、または明示的なチャネルエラー）;
* 同じリクエストパラメータが**別のモデルでは、または別の時点では動作し**、特定の 1 つのモデルだけが一貫して失敗する;
* エラーが `500` + `write_response_body_failed` またはそれに近い下流配信の失敗であり、**一貫して再現する**（これらは課金対象ではありません。 [接続切断](/ja/api-capabilities/image-connection-drops) を参照してください）;
* 実際の呼び出しと課金が一致しないと疑っている — `request_id` だけが正確に突き合わせられる唯一の手がかりです。

### サポートチケットのテンプレート（コピペ）

```text theme={null}
[Summary]      gpt-image-2 image edit endpoint consistently returns 400
[Endpoint]     POST https://api.apiyi.com/v1/images/edits
[Model]        gpt-image-2
[Call time]    2026-08-03 15:44 (UTC+8)
[request-id]   copy from the x-request-id response header
[HTTP status]  400
[Raw body]
{"error":{"message":"...","type":"...","code":"..."}}
[Key params]   size=2048x2048, quality=high, 1 reference image / 3.2 MB / PNG
[Reproduction] 5 consecutive calls, 5 failures; works again with a different reference image
[Already checked] key valid, balance sufficient, same key works on text models
```

<Card title="WeCom サポート" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom サポート QRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  コードをスキャンするか、このカードをクリックして WeCom サポートに連絡してください。

  Telegram の `@apiyi001`、またはメールの `hi@apiyi.com` でもご連絡いただけます。
</Card>

<Tip>
  上のテンプレートは**テキストとして**送ってください — どんな説明よりもはるかに効率的です。`request_id` があれば、あの 1 回の呼び出しの完全なトレースへすぐ進めます。わざわざ「ざっくり何時ごろで、どのモデルですか？」と聞き返す必要はありません。[呼び出し記録の確認方法](/ja/faq/call-logs) を参照して、`request_id` の確認方法をご覧ください。
</Tip>

## 関連ドキュメント

<CardGroup cols={3}>
  <Card title="API マニュアル" icon="book" href="/ja/api-manual">
    一般的なエラーコード、認証、レート制限
  </Card>

  <Card title="接続切断" icon="unplug" href="/ja/api-capabilities/image-connection-drops">
    `ECONNRESET`、`errno 10054`、SSL EOF に対する完全なトラブルシューティング手順
  </Card>

  <Card title="呼び出し記録を表示" icon="file-text" href="/ja/faq/call-logs">
    コンソールのログページで各呼び出しを確認する — `request_id` を見つけて課金を照合する方法
  </Card>

  <Card title="課金額の読み方" icon="receipt" href="/ja/faq/log-billing-explained">
    失敗した呼び出しがログに到達しない理由と、それを診断テストとして使う方法
  </Card>

  <Card title="タイムアウト設定" icon="hourglass" href="/ja/faq/timeout-configuration">
    モデル種類ごとのタイムアウト段階と、引き上げても改善しない場合に確認すべきこと
  </Card>

  <Card title="画像 API の基本" icon="book-check" href="/ja/api-capabilities/image-api-best-practices">
    同期呼び出し、base64 プレフィックスの違い、`400 invalid_image_file` の前処理
  </Card>
</CardGroup>
