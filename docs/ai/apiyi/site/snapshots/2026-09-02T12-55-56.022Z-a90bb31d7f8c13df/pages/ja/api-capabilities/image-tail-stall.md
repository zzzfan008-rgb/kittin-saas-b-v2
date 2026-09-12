> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# データ到着後も終了しない画像リクエスト

> 画像はすでに完全に届いているのに接続が終了せず、クライアントは自身のタイムアウトが発火するまで待ち続けます。原因、見分け方、そして既存の呼び出しを置き換えるのではなく、その上に重ねる互換レイヤーとして、クライアント側のコードで自分でレスポンスを完了させる方法を説明します。

<Info>
  **一言でいうと**: 画像データは**完全に取得済み**で、問題なく画像としてデコードできます。止まっているのは HTTP 転送のいちばん最後のステップ、つまりクライアントに「これで全部です」と伝える部分です。したがって、正しい修正はタイムアウトを長くすることでも再試行することでもなく、**データが届いたら自分でレスポンスを完了させ、すでに受け取っている画像を使うこと**です。
</Info>

<Warning>
  ### これは**置き換え**ではなく、**互換性**です

  下のコードは、**既存の呼び出しロジックの周り**に保護レイヤーを追加します。別の統合方法ではありません。

  * エンドポイントを変更したり、モデルを切り替えたり、SDK を差し替えたり、リクエストパラメータを調整したりする必要は**ありません**。
  * 正常なリクエストはこれまでどおり、まったく同じ経路を通ります。**動作は変わりません**。この互換性ロジックは、正常なリクエストではそもそも発火しません。
  * これは、データが完全に届いたのに接続が終了を拒む場合にだけ介入し、すでに受け取った画像を返します。

  要するに、**これがあれば不具合ケースは回復可能ですが、なければ不具合ケースはタイムアウトエラーで終わるしかありません。** それ以外はすべてそのままです。
</Warning>

## 症状

ネイティブの画像生成エンドポイント（`POST /v1beta/models/{model}:generateContent`）を呼び出すと、次の組み合わせが見られることがあります。

* ダッシュボードのログではリクエストが **成功** し、**課金済み** になっている;
* それでもクライアントはハングし、自身の読み取りタイムアウトが発火するまで失敗しない;
* エラーは `Read timed out`、`ETIMEDOUT`、または `UND_ERR_BODY_TIMEOUT` のように見える。

「ダッシュボードでは 30 秒で完了したと言っているのに、5 分後になっても画像が届かない」と感じるはずです。

<Warning>
  **同じコードは以前は問題なく動いていたのに、いまではこの最後のステップでハングします。** この現象は最近のものであり、統合方法に昔からある欠陥ではありません。したがって、呼び出しパターンを疑い直す必要はありません。下で説明する互換レイヤーを追加するだけで十分です。
</Warning>

### ウィンドウ単位で発生します

これが重要なのは、再現方法と見え方が変わるからです。

* **ウィンドウ内では**: 連続した呼び出しは、例外なくすべてハングします;
* **ウィンドウ外では**: 何十回連続で呼び出してもまったく問題なく動き、**1 回も発生しません**。

したがって、これは「常に再現できる」わけでも「まれなランダム障害」でもありません。テストがたまたまウィンドウを外せば、すべてが 100% 健全に見えて、誤って「直った」と結論づけやすくなります。たまたまウィンドウ内に入れば、すべてが壊れているように見えます。**どちらの印象も本物です。ただし、どちらか一方だけから長期的な結論を出さないでください。**

<Info>
  **ストリーミング** リクエスト（`:streamGenerateContent`）とテキストのみのモデルは、一般的に影響を受けません。このページでは、**非ストリーミングの画像生成** について説明します。応答ボディは大きく、2K 画像の JSON ボディはおよそ 13 MB になります。
</Info>

## 原因

画像レスポンスは `Transfer-Encoding: chunked` で送信されます。HTTP/1.1 の仕様では、サーバーが最後のデータチャンクを送信したら、クライアントに「これで終了です」と知らせるために **終端チャンク**（ゼロ長のチャンク）を送る必要があります。

失敗しているのはその手順です: **すべてのデータチャンクは届きますが、終端チャンクは送信されず、接続も閉じられません。**

クライアントには、本文が終了したことを知る方法がないまま、**完全でそのまま使える JSON ドキュメント**（画像は base64 デコードできます）だけが残ります。そのため、クライアントは待ち続けます — 自身の読み取りタイムアウトが発火するまで。

たとえば、**荷物はすでに玄関先に届いているのに、配達員が「配達完了」を押し忘れた**ようなものです。荷物はすぐ外にあるのに、あなたは追跡ページの更新を待ち続けています。

<Warning>
  一定の時間帯では、このルートがレスポンスに対してこの最終ステップを実行していません。**私たちは引き続きサーバー側の修正を強く求めています**。このページが説明しているのは、当面の間に使う **クライアント側の安全策** です。

  その安全策には独立した価値があり、**サーバー側が修正された後にロールバックする必要はありません**。終端シグナルが存在する場合はそもそも一度も発火しないため、自動的に静かになります — オーバーヘッドはゼロ、保守負担もゼロです。
</Warning>

対処方法を直接左右する 3 つの結論は次のとおりです:

<CardGroup cols={3}>
  <Card title="データは完全です" icon="circle-check">
    パケット損失でも、ネットワーク品質の問題でも、途中で転送が切れたわけでもありません。手元にあるバイト列はきれいにパースでき、画像は完全に利用可能です。
  </Card>

  <Card title="待っても意味はありません" icon="timer-off">
    一度ハングすると、サーバーは **1 バイトも** 追加で送りません。**330 秒** 待っても変化がないことを確認済みです。タイムアウトを数百秒に延ばしても、検知が遅れるだけです。
  </Card>

  <Card title="1 台のマシンに固定されていません" icon="server-off">
    ある時間帯の内部では、複数のプレゼンス拠点が **同時に** 失敗し、**同時に** 回復します。ドメインや入口を切り替えても回避できません — クライアント側で処理する必要があります。
  </Card>
</CardGroup>

## それを見分ける方法

次の 3 つがすべて当てはまるなら、ほぼ確実にこれに該当します:

<Steps>
  <Step title="レスポンスに Transfer-Encoding: chunked があり、Content-Length がありません">
    つまり、本文の長さが事前に宣言されていないため、クライアントは終了チャンクだけを頼りに完了を判断するしかありません。
  </Step>

  <Step title="ここまでに受信した bytes は、すでに完全な JSON として parse できます">
    `json.loads`を今ある内容に対して実行すると成功し、base64 の中の `inlineData.data` は完全でそのまま使える画像として base64 デコードされます。
  </Step>

  <Step title="その parse に成功したあと、新しい bytes が長時間届きません">
    終了チャンクもなく、接続も閉じられません。ただ開いたままの状態が続きます。
  </Step>
</Steps>

### 2 つの似たケースとの違い

3 つとも似たようなエラーに見えますが、根本原因も修正方法もまったく異なります。**1 つの判定基準をすべてに当てはめないでください:**

| 観測内容       | このページ（無期限にハング）                            | 途中で切断（`ECONNRESET`）  | 終端が遅れて、その後切断            |
| ---------- | ----------------------------------------- | -------------------- | ----------------------- |
| 受信した bytes | **本文は完全で、JSON は完全に parse できる**            | 通常は本文の全量に届かない        | 本文は完全                   |
| 最終的な接続状態   | **終端なし、FIN なし、開いたまま**                     | TCP RST を受信          | FIN（正常なクローズ）            |
| 失敗するタイミング  | 失敗しない — クライアントが諦めるまで（確認済み: 330 秒後も何も変わらず） | 場合による                | 最後の byte の **+300 秒** 後 |
| どうするか      | **すでに手元にある image を使う**（このページ）             | ネットワーク経路とクライアントを調査する | このページと同じです。データも完全です     |

エラーが `ECONNRESET` なら、それは別種の問題です。[Connection Drops](/ja/api-capabilities/image-connection-drops) を参照してください。

## 互換レイヤー: クライアント側でレスポンスを完了する

考え方はシンプルです: **接続が終了するのを待たず、手元にある bytes が完全な JSON として解析できた時点でただちに完了します。**

### 重要: グレース期間を維持する

解析に成功した瞬間に終了しないでください。通常は、終了チャンクはすぐ次の TCP セグメントにあり、数ミリ秒しか離れていません。解析に成功した時点で打ち切ってしまうと、「終端が数ミリ秒遅れて届いた」だけなのに「サーバーが送ってこなかった」と誤判定してしまいます。

正しい方法は、いったん解析に成功したら、**もう少しだけ待つ**ことです（3〜5 秒をデフォルトにするとよいでしょう）。その待機中にバイトが届いたら、通常どおり続行します。何も届かなかった場合にだけ、スタックしたと判断して自分でレスポンスを終了します。

<Warning>
  **これは任意の改善ではありません。** グレース期間を省くと、この検出はまったく役に立たなくなります。**正常なリクエストがすべて失敗として誤報告されます。** 私たちの最初の実装はまさにこれで、正常なリクエストの一括処理全体が壊れているとフラグされました。
</Warning>

### 応答を返す前に確認する項目

安価なものから高価なものへ順に並べています。**どれか 1 つでも失敗したら、待機を続けてください。応答を完了してはいけません。**

| # | 確認項目                     | 理由                                                                |
| - | ------------------------ | ----------------------------------------------------------------- |
| 1 | 接続はまだ受信を続けており、正常終了していない  | 正常終了したものは、既存の成功パスにそのまま進めてください                                     |
| 2 | HTTP ステータスが 2xx である      | それ以外は、既存のエラー処理に回してください                                            |
| 3 | 応答に `Content-Length` がない | 明示された長さがある場合は、このシナリオではありません。HTTP クライアントに最後まで処理させてください             |
| 4 | 受信済みバイト数が最小サイズを超えている     | 小さなエラーレスポンスを除外します                                                 |
| 5 | バイト数が前回の試行から変化している       | 12 MB を超える本文を何度も再解析するのを避けます                                       |
| 6 | 最後の空白以外の文字が `}` である      | きわめて安価な事前フィルターです。Base64 の画像データには `}` が含まれないため、部分転送はここでほぼ確実に除外されます |
| 7 | 完全な JSON が正常にパースできる      | 最終判定です                                                            |

チェック 6 と 7 を組み合わせることで、**偽陽性率はほぼゼロ**になります。応答は 1 つの JSON オブジェクトであるため、データがまだ欠けている間は必ずパースに失敗します。つまり、**本当に完全に届いた応答だけを完了できます**。

### Python

ストリームをバックグラウンドスレッドで読み取り、メインスレッドで **キューのタイムアウト** を使って猶予時間を実装します:

```python theme={null}
import json
import time
import base64
import queue
import threading
import requests

MIN_BYTES = 1024          # check 4: anything smaller cannot be an image


def _pump(raw, q):
    """Background thread: its only job is to push chunks onto the queue."""
    try:
        for chunk in raw.stream(65536, decode_content=True):
            q.put(chunk)
        q.put(None)                       # the server finished normally
    except Exception as exc:              # transport error, re-raised by main
        q.put(exc)


def _try_parse(buf):
    if len(buf) < MIN_BYTES:                    # check 4
        return None
    if not buf.rstrip().endswith(b"}"):         # check 6: cheap pre-filter
        return None
    try:
        return json.loads(buf.decode("utf-8"))  # check 7: the final verdict
    except ValueError:
        return None


def generate_image(url, headers, payload,
                   ttfb_timeout=180, term_grace=5, body_timeout=60):
    """Non-streaming image generation with client-side completion.

    ttfb_timeout: waiting for the first byte. The upstream is generating during
                  this phase — slow is not the same as broken, so leave room.
    term_grace:   how long to wait for the terminating signal once the body is
                  complete. If it never comes, finish the response ourselves.
    body_timeout: how long the whole body may take after the first byte.
    """
    resp = requests.post(url, headers=headers, json=payload,
                         stream=True, timeout=(10, ttfb_timeout))
    resp.raise_for_status()                     # check 2

    if resp.headers.get("Content-Length"):      # check 3
        return resp.json()                      # length declared: let the library finish

    q = queue.Queue()
    threading.Thread(target=_pump, args=(resp.raw, q), daemon=True).start()

    buf = bytearray()
    deadline = time.monotonic() + body_timeout

    while True:
        try:
            item = q.get(timeout=term_grace)
        except queue.Empty:                     # nothing new within the grace period
            obj = _try_parse(buf)
            if obj is not None:
                resp.close()                    # body is complete: finish it ourselves
                return obj
            if time.monotonic() > deadline:
                raise TimeoutError("incomplete body and no new data for a long time")
            continue                            # still incomplete, keep waiting

        if item is None:                        # healthy path: the server finished it
            break
        if isinstance(item, Exception):
            raise item
        buf += item

    obj = _try_parse(buf)
    if obj is None:
        raise ValueError("Incomplete response")
    return obj


def extract_image(obj):
    for cand in obj.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])
    return None
```

<Warning>
  **追加のスレッドが必要な理由は？** `requests` には、「最初の byte を待つ」と「chunk 間を待つ」の両方を管理する**単一の read timeout**があるからです。レスポンスが停止すると、read ループは次の read でブロックされ、猶予時間が実行される機会がなくなります — タイマー付きの単純な `for chunk in ...` 版では、まさに検出したいそのケースで**発火しません**。

  バックグラウンドスレッドで読み取り、メインスレッドで `q.get(timeout=term_grace)` を呼び出すことで、ようやく 2 つのタイムアウトを分離できます。私たちも実際にこれに遭遇しました。2 つの異なることを 1 つのタイムアウトで扱うと、「生成が遅い」と「完了しない」が、見分けのつかない単一の失敗にまとまってしまいます。
</Warning>

<Note>
  この版では、各 chunk のたびではなく、**猶予時間が切れたときに 1 回だけ** パースします — そのため、上のチェック 5 を自動的に満たせます。十数 MB の本文が何度もパースされることはありません。
</Note>

### Node.js

Node.js には追加のスレッドは不要です — `reader.read()` はすでに promise なので、`Promise.race` で次の chunk をどれだけ待つかを制限できます:

```javascript theme={null}
const TERM_GRACE_MS = 5000;       // how long to wait for the terminating signal
const TOTAL_TIMEOUT_MS = 180000;  // total timeout: must cover upstream generation
const MIN_BYTES = 1024;

async function generateImage(url, headers, payload) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TOTAL_TIMEOUT_MS),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);        // check 2
  if (resp.headers.get("content-length")) return resp.json();  // check 3

  const reader = resp.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    // Promise.race caps how long we wait for the next chunk
    const next = reader.read();
    const timer = new Promise((r) => setTimeout(() => r("GRACE"), TERM_GRACE_MS));
    const winner = await Promise.race([next, timer]);

    if (winner === "GRACE") {
      const parsed = tryParse(chunks, total);
      if (parsed) {                 // body is complete: server never finished
        reader.cancel().catch(() => {});
        return parsed;
      }
      continue;                     // body still incomplete, keep waiting
    }

    const { done, value } = winner;
    if (done) break;                // healthy path: the server finished it
    chunks.push(value);
    total += value.length;
  }

  const parsed = tryParse(chunks, total);
  if (!parsed) throw new Error("Incomplete response");
  return parsed;
}

function tryParse(chunks, total) {
  if (total < MIN_BYTES) return null;                 // check 4
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  const text = new TextDecoder().decode(buf).trimEnd();
  if (!text.endsWith("}")) return null;               // check 6
  try { return JSON.parse(text); } catch { return null; }   // check 7
}
```

<Tip>
  両方のスニペットにある **正常経路** のコメントに注目してください。サーバーがレスポンスを正しく完了すると、ループは `done` または反復の終了によって自然に抜け、猶予期間の分岐には入りません。これが実際の意味での「互換性であって置き換えではない」ということです — 既存の成功パスはバイト単位でそのまま変わりません。
</Tip>

## タイムアウトの選び方

ここで最も起こりやすいミスは、**2つの異なる用途に1つのタイムアウト値を使うこと**です。「アップストリームが画像を生成するのを待つ時間」と、「最初のバイトの後に2つのチャンクの間で発生する無音」です。通常の所要時間は桁違いに異なります。これらを1つの値にまとめると、遅い生成を失敗のように切ってしまうか、実際に停止したリクエストを数分待たせることになります。

| フェーズ                         | 通常の所要時間              | 推奨値            | 理由                                         |
| ---------------------------- | -------------------- | -------------- | ------------------------------------------ |
| **最初のバイトを待つ間**（アップストリームの生成中） | 2Kで約20〜30秒、4Kではさらに長い | **120〜180秒**   | ここが遅いのは失敗ではありません。ここで打ち切ると正常なリクエストを殺してしまいます |
| 最初のバイトの後の**チャンク間の無音**        | ミリ秒                  | **3〜5秒**（猶予期間） | このスケールで何も進まなくなったら、判断して終了する時です              |

<CardGroup cols={2}>
  <Card title="✅ 推奨" icon="check">
    2つを別々に設定してください。最初のバイトの前には生成のための余裕を持たせ、
    その後はチャンク間の無音を数秒に抑え、上のクライアント側の完了処理で
    残りを拾わせます。失敗は数秒で表面化し、正常なリクエストは
    影響を受けません。
  </Card>

  <Card title="❌ 避ける" icon="ban">
    すべてを「念のため」でまとめた300秒のタイムアウトを1つだけ使うこと。
    レスポンスが固まると、サーバーはそれ以上何も送らないので、待ち時間を伸ばしても
    何も変わらず、検知が遅れるだけです。
  </Card>
</CardGroup>

<Note>
  4Kのような遅いティアを含む製品の場合: **総タイムアウトは長くして構いません**（モデルには本当にその時間が必要です）が、**チャンク間の無音しきい値はそれに合わせて長くすべきではありません**。これらは別のものなので、一緒にスケールしないでください。
</Note>

<Note>
  Node.js ユーザー向け: 組み込みの `fetch` の背後にあるエンジンである undici は、Node 18+ では**3つの独立したタイムアウト**を持っており、SDK の `timeout` オプションはそれらのどれにも影響しません。正しい設定については、[接続の切断](/ja/api-capabilities/image-connection-drops)の「Node.js: 3つの独立したタイムアウト」セクションを参照してください。
</Note>

## 再試行と課金

サーバーが応答を最後まで返し終えていないと判断できたら、次の順序で確認してください。

<Steps>
  <Step title="既にある画像を使ってください — ほとんどの場合、これで終わります">
    データは完全で、画像はそのまま利用できるため、**再試行は不要です**。これが最も安価な方法であり、二重に課金されるのを避けられます。
  </Step>

  <Step title="解析が本当に失敗した場合のみ再試行してください">
    手元のバイト列を完全な JSON に解析できない場合にのみ、再試行してください。新しい接続を使い、試行の間隔は2〜3秒空けてください。
  </Step>

  <Step title="連続失敗したら、詰めて再試行せずに間を空けてください">
    問題はウィンドウ単位で発生するため、すぐに再試行すると同じウィンドウに入る可能性が高くなります。3回連続でハングしたら、30秒待ってから再度試してください。
  </Step>
</Steps>

<Warning>
  **課金**: これらのリクエストでは、上流側がすでに画像を生成して返送を開始しているため、配信は完了扱いとなり、リクエストは**通常どおり課金されます**。「クライアントがタイムアウトした」ことは「課金されなかった」ことを意味しません。まさにこのため、最初の手順が最も重要です。既にその画像の料金は支払っているので、捨ててしまうことこそが本当の無駄です。

  どの接続切断が課金対象で、どれが対象外かの詳細については、[接続切断](/ja/api-capabilities/image-connection-drops) の「課金への影響」セクションを参照してください。
</Warning>

## ロールアウトノート

これらは言語やフレームワークに依存せず、私たち自身のロールアウトから得たものです。

* **単一のネットワーク層エントリポイントに置き、呼び出し箇所に散らさないでください。** それを「リクエストを送信する」アクションそのものの一部にします。そうすれば、すべての画像パスを一度にカバーでき、ビジネスコードには手を加えずに済み、サーバー側が修正されたあとに変更が必要なのも1か所だけになります。

* **実際に必要なのは段階的な読み取りアクセスです。** 前提条件は、レスポンスが終了する前に到着した内容を確認できることです。ほとんどすべての HTTP クライアントはこれを提供しています（ストリーミング読み取り、チャンクコールバック、進捗イベント）が、通常はデフォルトではありません — デフォルトの「ボディ全体をそのまま返してほしい」は、まさにハングする経路です。**ここが作業の大半を占めます。**

* **最後のチャンクを受信してからの時間で判断し、リクエスト開始時点からは数えないでください。** チャンクのたびに猶予時間タイマーをリセットします。そうすれば、遅いネットワークを不当に罰することもなく、何も動いていない状態も見逃しません。

* **スイッチの背後に隠してください。** いつでもオフにできるフラグの背後にこの挙動を置いておきます。リリース直後に予期しないことが起きても、オフに切り替えれば以前の挙動に戻せます。緊急デプロイは不要です。

* **テレメトリを追加してください。** 完了パスが発火するたびにログを記録します（タイムスタンプ、バイト数、待機時間）。これには3つの目的があります。実際にどの程度発生しているかを定量化すること、レイヤーが期待どおり機能していることを確認すること、そしてサーバー側の修正後にカウンターがゼロまで下がることを確認することです。これが、そのレイヤーを廃止できると判断する唯一の客観的根拠です。

* **その作業中にできるおまけの改善があります。** 段階的な読み取りができるようになれば、ユーザーに実際の進捗を表示できます（「データを受信中、X.X MB」）。それまでの長いダウンロードは、ユーザー側からは完全なブラックボックスでした。

## どのように自分たちでデプロイしたか

この作業はすでに自社の AI 画像スタジオ（`imagen.apiyi.com`）で完了し、検証済みです。障害を再現するモックサービス（body 全体を送信したあと、終了を通知せず接続も閉じない）を使って、次の比較を行いました。

| シナリオ                                   | 結果                                           |
| -------------------------------------- | -------------------------------------------- |
| 正常なレスポンス（終了シグナルあり）                     | 既存の経路で返却され、**completion は一度も発火しません** — 誤検知なし |
| body は完了、終了シグナルなし                      | 猶予期間の後に終了し、data は完全でそのまま利用可能                 |
| 同じ条件で、スイッチをオフにした場合                     | 旧動作を維持（待ち続ける） — スイッチは機能し、ロールバック可能です          |
| body の半分しか受信していない状態でハングした場合            | 誤って終了せず、待ち続けます                               |
| body は完了しているが、`Content-Length` が存在する場合 | ガードレールによりブロックされ、終了しません                       |

結論: **正常なリクエストにはゼロ影響で、失敗するリクエストは「タイムアウトを待ってから失敗」から「数秒以内に画像を取得」へ変わります。**

## よくある質問

<AccordionGroup>
  <Accordion title="これは実際には正常なリクエストを途中で打ち切ってしまうことがありますか？">
    いいえ。完了とみなすには、受信した bytes が **完全な JSON ドキュメント** としてパースできる必要があります。データがまだ不足している間は、必ずパースに失敗します。さらに 3〜5 秒の猶予期間を上乗せするため、正常なリクエストが誤判定されることはありません。上の比較表の最初の 2 行は、まさにこの 2 つのケースを並べて示しています。
  </Accordion>

  <Accordion title="途中で画像が半分だけ届くことはありますか？">
    いいえ。確認しているのは画像そのものではなく、**レスポンスボディ全体** の整合性です。JSON がパースできれば、画像データは完全です。画像が半分しかない場合はパース失敗に相当し、その場合に完了扱いになることはありません。
  </Accordion>

  <Accordion title="これはサーバー側の問題を取り繕っているだけではありませんか？">
    いいえ。これはサーバー側の修正の代わりではありません。すでに生成され、すでに課金済みの結果をユーザーの手元に届けつつ、無条件のリトライが引き起こす二重課金を避けます。また、ここで得られるテレメトリは、障害がいつ発生するかの把握にも役立ちます。
  </Accordion>

  <Accordion title="サーバー側が修正されたら、これは削除すべきですか？">
    急ぐ必要はありません。終了シグナルがある場合、このロジックは発火しないため、コストはかかりません。テレメトリが長期間ゼロのままになってから、整理を検討してください。
  </Accordion>
</AccordionGroup>

## サポートに連絡するタイミング

上記の互換性レイヤーを追加したあとでも、次のいずれかが当てはまる場合は、資料をそろえてサポートに連絡してください。

* お手元の bytes が **最後までそろっても完全な JSON として parse されない**（これはこのページのシナリオではありません。転送が実際に途中で切れています）;
* クライアント側で completion しても、長時間 **response headers がまったく返ってこない**（つまり、上流はまだ送信を開始していません。遅い生成、または上流側の障害であり、completion の問題ではありません）;
* 停止率が特定の時間帯に集中するのではなく、**一貫して高い**ままで、長期間にわたって安定して再現する。

チケットを起票する際は、`x-request-id`、呼び出し時刻（**timezone 付き**、例: `2026-08-03 13:15 (UTC+8)`）、model 名と `imageSize` のような主要パラメータ、生の client-side exception、そして停止した時点で受信していた bytes 数を含めてください。

## 関連ドキュメント

<CardGroup cols={3}>
  <Card title="接続の切断" icon="unplug" href="/ja/api-capabilities/image-connection-drops">
    `ECONNRESET`、SSL EOF、undici の 3 つのタイムアウト、ローカルプロキシの診断マトリクス
  </Card>

  <Card title="必読 & ベストプラクティス" icon="book-check" href="/ja/api-capabilities/image-api-best-practices">
    同期呼び出し、タイムアウト階層、base64 の扱い、および切断された接続に対する課金
  </Card>

  <Card title="独自の非同期キューを構築する" icon="list-checks" href="/ja/api-capabilities/image-async-queue">
    同期呼び出しをタスクキューでラップし、再試行と永続化でまれな失敗を吸収する
  </Card>
</CardGroup>
