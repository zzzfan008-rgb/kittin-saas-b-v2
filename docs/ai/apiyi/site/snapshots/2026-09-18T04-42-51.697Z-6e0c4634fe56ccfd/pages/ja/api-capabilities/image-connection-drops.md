> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像 API 接続切断のトラブルシューティング

> connection reset by peer、write_response_body_failed、SSL EOF のトラブルシューティング方法です。500 の write_response_body_failed は課金されません。macOS と Linux サーバーで確認すべき項目、undici の 3 つの Node.js タイムアウト、ローカルプロキシの診断マトリクスを扱います。

<Warning>
  ### 課金優先: `write_response_body_failed` の 500 は **課金されません**

  ゲートウェイが `500` を `write_response_body_failed` / `connection reset by peer` で返す場合、プラットフォーム側では **すでに内部で 2〜3 回再試行済み** であり、すべて失敗したあとにのみエラーを表示します。**これらのリクエストには一切課金されません。**

  そのため、ログがこれらのエラーで埋まっていても、**請求書に対応する課金は表示されません**。失敗に対して料金を支払っているわけではありません。別のケースは *課金されます*（クライアントが早々に切断した場合）ので、下の「課金への影響」セクションを参照してください。
</Warning>

<Info>
  **簡潔に言うと**: 画像 API のレスポンスは通常 10 MB から数十 MB に及び、ほとんどの場合、問題は **レスポンスのダウンロード中** に発生します（**リクエスト本文が大きすぎる** からではありません。プレーンな text-to-image でも同様に失敗します）。まずコンソールログがどのカテゴリに当たるかを確認し、その後で下の macOS / Linux / Node.js のセルフチェックを実行してください。
</Info>

## エラーの見え方

同じ根本原因でも、どちら側を見るかによって、まったく異なる2つの顔で現れます。

### ゲートウェイ側から

```json theme={null}
{
  "status_code": 500,
  "error": {
    "message": "write tcp 10.0.0.1:443->203.0.113.5:52310: write: connection reset by peer",
    "type": "shell_api_error",
    "code": "write_response_body_failed"
  }
}
```

### クライアント側から

| 言語 / ライブラリ                        | 典型的な例外                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Python `requests` / `urllib3`     | `SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol'))`, `ChunkedEncodingError`, `ConnectionResetError` |
| Python `httpx`                    | `RemoteProtocolError`, `ReadError`                                                                                  |
| Node.js (undici / built-in fetch) | `UND_ERR_CONNECT_TIMEOUT`, `UND_ERR_HEADERS_TIMEOUT`, `UND_ERR_BODY_TIMEOUT`, `SocketError: other side closed`      |
| Node.js (other stacks)            | `read ECONNRESET`, `ERR_STREAM_PREMATURE_CLOSE`, `socket hang up`                                                   |
| Go                                | `unexpected EOF`, `http2: server sent GOAWAY`                                                                       |
| curl                              | `curl: (56) Recv failure`, `curl: (18) transfer closed with outstanding read data remaining`                        |

<Tip>
  **Node.js では「killed」と「closed」を区別してください**: `ECONNRESET` は TCP RST が到達したことを意味し、経路上の何らかの要因によって接続が**killされた**ことを示します。ネットワーク上のどこかのホップに原因がある可能性が高いです。`SocketError: other side closed` / `ERR_STREAM_PREMATURE_CLOSE` はピアが**正常に**（FIN）切断したことを意味し、chunked の終端が欠けているなど、サーバー側の終端処理の問題を示します。これら2つはまったく異なる方向を指すので、1つの症状として扱わないでください。

  また、`UND_ERR_*` は undici（Node 18+ の built-in `fetch` のエンジン）からしか出てきません。一方で、`read ECONNRESET` は libuv の最上位の文言であり、`axios` / `node-fetch` / `http` モジュールが出力します。**両方の種類が同時に出ている場合は、まずアプリに2つの異なる HTTP パスがないか確認してください**。その場合、そもそも同じインシデントではありません。
</Tip>

## まず方向を見極めます: 誰が切断したか

`write_response_body_failed` コードが最大の手がかりです。これは、**ゲートウェイがレスポンス本文を呼び出し元へ書き戻す途中で失敗した**ことを意味します。つまり、上流のモデルエラーではなく、**下流側**の問題です。結果自体はすでに生成されており、あなたに送ろうとしている途中で接続が切れました。

<Info>
  **これはリクエスト本文が大きすぎることが原因ではありません。** 画像編集では参照画像をアップロードするため、アップロードサイズが疑われがちですが、**リクエスト本文が数百バイトしかない単純な text-to-image でも、同じくらい頻繁に壊れます**。壊れているのは**レスポンスのダウンロード**のほうです。画像ペイロードは 10MB から数十MB に及び、全体の経路の中で最も壊れやすい区間です。
</Info>

<CardGroup cols={2}>
  <Card title="下流側の切断" icon="arrow-down-from-line">
    `write_response_body_failed`, `connection reset by peer`, クライアント側の SSL EOF。
    ゲートウェイが本文を送っている最中に接続が消えました。**プラットフォームがこれに対して 500 を返す場合、課金されません**。詳しくは下の課金セクションを参照してください。
  </Card>

  <Card title="上流側の失敗（チャネル側）" icon="arrow-up-from-line">
    上流側のタイムアウト、`upstream_error`、上流ペイロードを伴う 5xx、または異常な `finishReason` を伴う HTTP 200。
    これらは本当のチャネル側の問題です。`x-request-id` をサポートに渡してください。
  </Card>
</CardGroup>

### この呼び出しについて、コンソールログが示す最も強い手がかり

何か触る前に、まずコンソールの呼び出しログを確認してください。コストはかからず、クライアント側のどの手順よりも早く候補を絞れます。

| ログに表示される内容                           | 意味                                        | 課金対象?       | 次の手順                                                        |
| ------------------------------------ | ----------------------------------------- | ----------- | ----------------------------------------------------------- |
| **正常な呼び出し記録**                        | リクエストは到達し、上流側は完了し、ゲートウェイは配信済みと判断しています     | 課金対象        | 下の4手順を、アプリケーション層での読み違いとクライアント側の早期切断に重点を置いて確認してください          |
| **500 `write_response_body_failed`** | ゲートウェイが本文を書き戻す際に、**内部で2-3回再試行**した後に失敗しました | **課金されません** | 下流経路の問題です。request-id をサポートに送ってください                          |
| **記録がまったくない**                        | リクエストが**あなたのマシンを一歩も出ていません**               | 課金されません     | 接続段階です — 下の「Node.js のタイムアウト」と「ローカルプロキシ / VPN」のセクションに進んでください |

<Warning>
  ここから導ける結論は、よく逆に理解されます。**`UND_ERR_CONNECT_TIMEOUT` のような接続段階の失敗では課金は発生しません**。リクエストがゲートウェイに届いていないからです。したがって、「接続タイムアウトが大量にある」のに「課金も大量にある」のであれば、**それらは同じリクエストではありません**。1つの根本原因で全部を説明しようとせず、別々に調べてください。
</Warning>

### 切り分けの4手順

順番に確認してください。ほとんどは最初の2つで解決します。

<Steps>
  <Step title="アプリケーション層での読み違いを除外してください: 受け取っていたのに保持できなかった可能性があります">
    「画像を受け取れなかった」は、コードが例外を投げて「request failed」として捕捉された後に下された結論であることがほとんどです。つまり、バイトが届いていなかった証拠ではありません。最も典型的なのは、`gpt-image-2-all` が既定で `b64_json` を返すのに **`data:` プレフィックスがない**ため、`data[0].url` を読むコードが `undefined` を受け取り、下流で例外を投げ、失敗と判定され、再試行が走るケースです。**その結果、再び課金されます**。

    症状はネットワーク障害とまったく同じですが、ネットワーク障害である必要はありません。確認のために1行出力してください:

    ```javascript theme={null}
    console.log(Object.keys(resp.data[0]), resp.data[0].b64_json?.length);
    ```

    シリーズごとのフィールドとプレフィックスの違いは、[base64 プレフィックス参照](/ja/api-capabilities/image-api-best-practices#prefix-differences)にあります。
  </Step>

  <Step title="すべてのチャネルとモデルが同時に失敗しているか確認してください">
    2つの異なるチャネルで2つの異なるモデルを動かしていて、同じ時間帯に同じエラーが出ているなら、チャネル固有の原因は実質的に除外できます。上流側がそんなにきれいに同時に失敗することはありません。
  </Step>

  <Step title="クライアントのランタイムを確認してください: Python の TLS スタック、または Node.js の undici タイムアウトです">
    Python: TLS スタックのバージョンを確認してください。Node.js: undici の 3 つのタイムアウトを確認してください。どちらも次の2つのセクションで扱います。実際にはこれが最も多い根本原因で、原因はすべて手元の環境にあります。1つのコマンドで確認できます。
  </Step>

  <Step title="同時実行数を下げ、逐次実行にして、ローカルプロキシを無効にしてください">
    同じリクエストを同時実行数 1-2 で、VPN またはプロキシを無効にして再実行してください。その方法では再現しないなら、問題はクライアントの接続処理、ローカルリソース（コネクションプール、ファイルディスクリプタ、メモリ）、またはネットワーク経路にあります。チャネル側ではありません。
  </Step>
</Steps>

## 最有力の容疑者: クライアントの TLS スタック（特に macOS）

**macOS に同梱される Python（`/usr/bin/python3`）は、OpenSSL ではなく LibreSSL 2.8.3 にリンクしています。** これに urllib3 v2 を組み合わせると、**大きなレスポンスボディの同時ダウンロード**中に `SSLEOFError` が高い確率で発生します。クライアントが一方的に切断し、ゲートウェイは当然ながら `connection reset by peer` の大量発生を記録します。

### 確認するための1コマンド

```bash theme={null}
python3 -c "import ssl; print(ssl.OPENSSL_VERSION)"
```

| Output              | Verdict                                     |
| ------------------- | ------------------------------------------- |
| `LibreSSL 2.8.3`    | ⚠️ **高リスク** — 同時の大きなレスポンスで見かけ上の接続エラーを発生させます |
| `OpenSSL 1.1.1x` 以降 | ✅ 問題ありません                                   |

`requests` を import したときにこの警告が出るなら、同じ兆候です:

```
NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+,
currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'
```

### 修正: インタープリタを切り替える

urllib3 をダウングレードしないでください — 代わりに、適切な OpenSSL でビルドされた Python を使ってください:

```bash theme={null}
# macOS: build a virtualenv on Homebrew's Python
brew install python@3.13
python3.13 -m venv venv
venv/bin/pip install requests pillow
venv/bin/python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # should print OpenSSL 3.x
```

### 計測比較（2026-07-29, UTC+8）

Nano Banana シリーズ（`gemini-3-pro-image` / `gemini-3.1-flash-image`）での2チャネル比較テストから得た実測値です:

| インタープリタ                              | シナリオ                                                     | トランスポート層の失敗率                                  |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------------------- |
| システムの python3.9（LibreSSL 2.8.3）      | 同時実行数12での画像呼び出し                                          | **広範囲に失敗し、両チャネルで同時に発生**                       |
| Homebrew の python3.13（OpenSSL 3.6.1） | 同じ108回の呼び出し                                              | 3（2.8%）、すべて 4K の大きなレスポンスで発生し、**再試行1回でいずれも成功** |
| Homebrew の python3.13（OpenSSL 3.6.1） | 再現専用の80回の呼び出し（小さなレスポンスで同時実行数24、4K で同時実行数12、そして 4K の逐次実行） | **0**                                         |

結論は明白です: **インタープリタを切り替えるだけで桁違いの差が出ており**、その前に両チャネルが同時に失敗していた事実だけでも、チャネル起因ではないことはすでに証明されていました。

## Linux サーバーで確認すべきこと（まったく別のリスト）

<Info>
  上の TLS スタックのチェックは、実質的にどの Linux ボックスでも**通ります**。ディストリビューションの Python は通常の OpenSSL にリンクしているため、LibreSSL の罠はそこにはありません。**そのチェックだけで止めないでください。** サーバー側の問題は **egress 経路** と **コンテナの制限** にあり、ローカル開発とはまったく別世界です。
</Info>

### 1. クラウド NAT ゲートウェイとロードバランサーのアイドルタイムアウト（サーバー側で最も多い原因）

これは本番環境での `connection reset by peer` の最大の原因です。たとえば **AWS NAT Gateway** は、**固定で変更不可の 350 秒のアイドルタイムアウト** を強制し、発火すると **FIN ではなく RST** を送ります。つまりクライアントからはまさに `ECONNRESET` に見えます。

厄介なのは、これが **連鎖する** ことです。プールされた接続が 350 秒を超えてアイドル状態になると、それらはすべて死んでいるため、リクエストは最初の 1 本で RST を受け、クライアントは透過的に次のプール接続へ再試行します。**しかしその接続も同じくアイドルで、やはり RST を受けます。** 症状は「しばらく静かだったのに、その後いくつかの呼び出しが立て続けに失敗し、また何事もなかったように戻る」です。

<Tip>
  これは Node.js セクションの「keep-alive が死んだ接続を再利用する」ケースと同じ仕組みです。サーバーでは、原因はたいていローカルのプロキシソフトではなく、**クラウド事業者の NAT ゲートウェイ** です。
</Tip>

対処法（どれでも可。最初の 2 つを推奨します）:

* **TCP keepalive を 350 秒未満に設定** して、静かな時間帯でも通信が流れるようにする;
* **接続がプール内でアイドルのままでいられる時間を制限** して、死んでいる可能性のあるものを破棄する（Node: `new Agent({ keepAliveTimeout: 60_000 })`; Python `requests`: `HTTPAdapter` でプールを設定する）;
* NAT ゲートウェイを完全に迂回する。たとえば VPC endpoints を使う。

他のクラウドや自前運用のロードバランサーでは別のアイドル値を使いますが、**アプローチは同じです。経路上で最も短いアイドルタイムアウトを見つけ、その値より下に keepalive を設定してください。**

### 2. TCP keepalive のデフォルトは実質的に「オフ」です

Linux ではデフォルトで `tcp_keepalive_time` が **7200 秒（2 時間）** に設定されており、上記のどのアイドルタイムアウトよりもはるかに長いため、実運用では役に立ちません:

```bash theme={null}
# Inspect current values
sysctl net.ipv4.tcp_keepalive_time net.ipv4.tcp_keepalive_intvl net.ipv4.tcp_keepalive_probes

# Adjust temporarily (inside containers this needs --sysctl or privileges;
# in production prefer sysctl.d or setting SO_KEEPALIVE in the app)
sudo sysctl -w net.ipv4.tcp_keepalive_time=60
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=15
```

HTTP クライアント自体で keepalive を有効にする方がより堅牢です。コンテナではカーネルパラメータを変更できないことが多いためです。

### 3. コンテナネットワークの MTU

Docker / Kubernetes のオーバーレイネットワーク（flannel VXLAN など）は、一般に MTU を 1500 ではなく **1450** にしています。これに経路上の PMTUD ブラックホールが組み合わさると、典型的な「小さいリクエストは常に問題なし、大きいレスポンスは常に詰まる」が発生します:

```bash theme={null}
ip link show            # inspect the container interface MTU
# Probe the real usable MTU with do-not-fragment packets
ping -M do -s 1400 api.apiyi.com
```

### 4. コンテナのメモリ制限 → プロセスが OOMKilled される

4K の base64 ペイロード 1 つで 20〜30MB に達することがあります。これを `resp.json()` で丸ごと読み込み、さらに同時実行数があるとコンテナのメモリ制限を簡単に超え、カーネルがプロセスを kill します。これもまた **「接続が切れただけ」に見えます**:

```bash theme={null}
# Was the container OOM-killed?
dmesg -T | grep -i -E "oom|killed process"
kubectl describe pod <pod> | grep -A3 "Last State"   # look for OOMKilled
```

対処法は下の「レスポンスを丸ごと読み込まずにストリーミングする」を参照してください。

### 5. プロキシ環境変数（サーバーではいちばん気づきにくいもの）

サーバーには、`/etc/environment`、systemd ユニット、Dockerfile に設定されたグローバルな `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` の値が残っていることがよくあります。設定した本人ですら長い間忘れていることが多いです。**さらに厄介なのは、言語ごとにそれらを尊重するかどうかが一致しないことです。**

| クライアント                             | `HTTPS_PROXY` を自動で読み込みますか？                              |
| ---------------------------------- | ------------------------------------------------------- |
| Python `requests` / `httpx`        | ✅ はい、デフォルトで読み込みます                                       |
| curl                               | ✅ はい、デフォルトで読み込みます                                       |
| **Node.js 組み込みの `fetch` (undici)** | ❌ **いいえ**、明示的な `ProxyAgent` / `EnvHttpProxyAgent` が必要です |

この不一致は本当に紛らわしい結果を生みます。**あるマシンでは curl と Python はプロキシを通るのに、Node は直接接続する**（またはその逆）ため、両者の結果が食い違い、トラブルシューティングでも矛盾した結論になります。まず確認してください:

```bash theme={null}
env | grep -i -E "proxy|no_proxy"
```

APIYI は直接到達可能なので、サーバーでは通常 `api.apiyi.com` を `NO_PROXY` に設定します。あるいは、そもそもプロキシ変数を使わないようにします。

### サーバー側の一発セルフチェック

```bash theme={null}
echo "--- proxy vars ---";  env | grep -i proxy || echo "none"
echo "--- keepalive ---";   sysctl net.ipv4.tcp_keepalive_time
echo "--- MTU ---";         ip link show | grep mtu
echo "--- fd limit ---";    ulimit -n
echo "--- DNS ---";         getent hosts api.apiyi.com
echo "--- reachability and timing ---"
curl -sS -o /dev/null -w 'connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} ip=%{remote_ip}\n' \
  https://api.apiyi.com/v1/models -H "Authorization: Bearer $KEY"
```

## Node.js: SDK の `timeout` では届かない 3 つの独立したタイムアウト

Node 18+ の組み込み `fetch` は undici 上で動作し、リクエストの 3 つの段階をカバーする **3 つの独立したタイムアウト** があります。「でもタイムアウトを 5 分に設定したのに」という場合、たいていはそのどれでもない 4 つ目の値を変更しただけです:

| エラーコード                    | ステージ                  | undici のデフォルト | 制御する設定            | 課金対象？                     |
| ------------------------- | --------------------- | ------------- | ----------------- | ------------------------- |
| `UND_ERR_CONNECT_TIMEOUT` | 接続の確立（TCP + TLS）      | **10 秒**      | `connect.timeout` | **いいえ**（ゲートウェイに到達していないため） |
| `UND_ERR_HEADERS_TIMEOUT` | 最初のレスポンスヘッダーを待機       | 300 秒         | `headersTimeout`  | はい                        |
| `UND_ERR_BODY_TIMEOUT`    | ギャップ **連続するボディチャンク間** | 300 秒         | `bodyTimeout`     | はい                        |

<Warning>
  **openai-node の `timeout` オプションは AbortController ベースのリクエスト全体のタイムアウトであり、上記 3 つのいずれにも伝播しません。** `timeout` を 60 秒から 300 秒に増やしても、`connectTimeout` は 10 秒のままです。素の `fetch()` における `AbortSignal.timeout()` も同様です。

  「タイムアウトを大きくしたのに、まだタイムアウトする」の最もよくある原因はこれです。調整したのが間違ったレイヤーだったのです。
</Warning>

### 正しい設定

undici の 3 つのタイムアウトを広げるには、グローバルまたはリクエストごとに `Agent` が必要です:

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import OpenAI from "openai";

// Image endpoints mean long silences plus MB-scale bodies — widen all three
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },   // connect in 30s; the default is only 10s
  headersTimeout: 300_000,        // first byte within 300s
  bodyTimeout: 300_000,           // inter-chunk gap up to 300s
}));

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: "https://api.apiyi.com/v1",
  timeout: 300_000,   // total timeout — a different layer; set both
  maxRetries: 0,      // critical, see below
});
```

### `maxRetries` はデフォルトで 2 で、接続エラーを自動再試行します

openai-node は **デフォルトで `maxRetries: 2` になっており、接続エラーとタイムアウトの両方がその自動再試行の対象です**。そのため、1 回の論理的な呼び出しで、コードに再試行ロジックが一切なくても **実際のリクエストが 3 回** 発生しえます（それぞれが課金対象かどうかは、「課金への影響」カテゴリのどれに属するかで決まります）。

画像エンドポイントは高コストな同期長時間リクエストなので、**`maxRetries: 0` を必ず明示的に設定し、再試行ロジックは自分で管理してください**。独自のバックオフと試行上限を使ってください。課金ルールは [再試行戦略](/ja/api-capabilities/image-api-best-practices#retry-strategy) にあります。

<Tip>
  まず、実際にどのスタック上にいるのかを確認してください: `node -v`, `npm ls openai undici axios node-fetch`。`UND_ERR_*` コードが示すのは、その下で undici が使われていることだけです — **OpenAI SDK を使っていることの証明にはなりません**。素の `fetch()` でも同じコードが発生し、素の `fetch()` には `maxRetries` がまったくありません。
</Tip>

### すでに切断済みの接続を keep-alive で再利用する場合

undici はデフォルトで keep-alive によるコネクションプーリングを有効にします。VPN、NAT、またはプロキシがアイドル状態の接続を黙って回収しても、クライアントはそれに気づかず、次のリクエストでもその接続をプールから取り出します — **書き込みは即座に RST を受け取り、`read ECONNRESET` として表面化します**。

呼び出しの間隔が空くとき、これは `ECONNRESET` の最も一般的な原因です。また、「エラーが 1 つの時間帯に集中する」ことと「最初の再試行ですら失敗する」ことの両方を説明します。再利用を無効にして確認してください:

```javascript theme={null}
const agent = new Agent({ pipelining: 0, keepAliveTimeout: 1_000 });
// errors disappear ⇒ it was dead-connection reuse
```

## ローカルプロキシ / VPN: image endpoint が最初に露出するホップ

<Info>
  **APIYI は中国本土内から直接到達でき、プロキシや VPN は不要です**（[API を使うのにプロキシは必要ですか?](/ja/faq/network-proxy) を参照してください）。そのため、**プロキシをオフにして再テストすることは、あなたが実行できる最も安く、最も情報量の多い単独ステップ**です。

  ただし、はっきりさせておくと、プロキシはあくまで**最も疑わしい変数**であって、確定した根本原因ではありません。下のマトリクスが、実際に障害を切り分けます。
</Info>

画像 endpoint がテキスト系よりはるかに影響を受けやすい理由は 2 つあります。**生成中に 30〜60 秒間まったくバイトが流れないこと**と、**MB 級の body が一気に送られること**です。chat endpoint は問題なくて image endpoint だけ失敗する場合、たいていこの 2 つのどちらかです。

<CardGroup cols={2}>
  <Card title="fake-ip / ルーティングルールの見逃し" icon="route-off">
    プロキシの fake-ip モードでは、ルールの見逃しによって `198.18.x.x` のようなルーティング不能なアドレスに送られ、**ちょうど 10 秒の**接続タイムアウトが発生します。これは「接続が遅い」のではなく、**そもそもルートが存在しない**ため、`connect.timeout` を上げても助かりません。実際に到達した `remote_ip` を必ず記録してください。
  </Card>

  <Card title="生成中にアイドル接続として回収される" icon="timer-off">
    リクエスト送信後 30〜60 秒はゼロバイトのままで、プロキシがアイドルポリシーに従って接続を回収します。特徴は、画像サイズに関係なく、**失敗時刻が丸い値に収まる**ことです。30 / 60 / 120 秒などです。
  </Card>

  <Card title="MTU / PMTUD ブラックホール" icon="package-x">
    トンネル MTU が経路 MTU を下回っている一方で ICMP の「fragmentation needed」が落とされ、PMTUD が壊れます。典型的な特徴は、**小さなリクエストは常に問題なく、大きなレスポンスは常に止まる**ことで、受信済みバイト数は数 KB から数十 KB で固定されます。トンネル MTU を 1400 前後まで下げると、たいてい直ります。
  </Card>

  <Card title="MITM 復号 + 完全バッファリング" icon="shield-off">
    HTTPS 復号が有効なプロキシは、大きな body を丸ごとバッファすることが多く、サイズ上限に達する場合があります。あるいは、chunked を `Content-Length` に書き換えて長さを誤り、RST を発生させることもあります。これも MB 級の image response にのみ起き、テキスト呼び出しには起きません。
  </Card>
</CardGroup>

### 診断マトリクス

これがこのセクションの核心です。軸は 2 つだけです。**障害が最初の 1 バイトの前に起きたか後に起きたか**、そして**何バイト到着したか**です。

| 観測                          | 接続タイムアウト                 | プロキシのアイドル回収    | MTU ブラックホール     | chunked 終端子の欠落                                                    |
| --------------------------- | ------------------------ | -------------- | --------------- | ----------------------------------------------------------------- |
| TTFB（最初の 1 バイト）             | 到達しない                    | 到達しない          | 到達する            | **通常どおり**（生成時間と一致）                                                |
| 受信バイト数                      | 0                        | 0              | **0 \< N ≪ 全体** | **= 全体、JSON はきれいにパースできる**                                         |
| 障害時刻                        | **約 10.0 秒で、非常に安定**      | 丸い値で、サイズに依存しない | 変動する            | **最後のバイトから +300 秒で切断**; または **無期限にハングする**（確認済み: 330 秒後もまだ何もありません） |
| 接続終了状態                      | ConnectTimeout           | RST            | ハングまたは RST      | FIN（正常終了）; または **終端子なし、FIN なし、接続は開いたまま**                          |
| 課金対象?                       | **いいえ**（ゲートウェイに到達していません） | 「課金への影響」を参照    | 「課金への影響」を参照     | 「課金への影響」を参照                                                       |
| `response_format: "url"`の場合 | それでも失敗する                 | それでも失敗する       | **動作する**        | **動作する**                                                          |

この最後の行が、単独で最も価値の高いテストです。body を数 MB から約 1 KB に縮めます。**URL mode で一貫して成功し、base64 mode で一貫して失敗するなら、問題は転送量に比例しています**。この場合、最初の 2 列は完全に除外できます。

<Info>
  一番右の列（**chunked 終端子の欠落**）は、最近は新しい形も取るようになりました。**終端子なし、クローズなしで、無期限にハングする**という形です。従来の「300 秒後に正常終了してクローズされる」形ではなくなっています。どちらの形でも共通しているのは、**データはすでに完了しており、image はそのまま使える**ことであり、扱いは同じです。クライアント側で response を完了させてください。[末尾でハングするリクエスト](/ja/api-capabilities/image-tail-stall) を参照してください。
</Info>

### フルタイミングプロファイルを 1 コマンドで確認する

```bash theme={null}
curl -sS -o /tmp/out.json --trace-time \
  -w '\nconnect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} code=%{http_code} ip=%{remote_ip}\n' \
  -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"model":"gpt-image-2-all","prompt":"a red cube on a white table"}' \
  https://api.apiyi.com/v1/images/generations
```

マトリクスと照らし合わせると、`connect` がない → 接続段階; `ttfb` がなく、丸い `total` → アイドル回収; full `bytes` だが `total ≈ ttfb + 300` と `curl: (18)` がある → 終端子の欠落; `bytes` が数十 KB で止まる → MTU です。

<Warning>
  **proxy-on と proxy-off の A/B テストを行うときは、実行を交互にしてください — まとめて実行しないでください。** プロキシ経由を 5 回、その後に直結を 5 回という並べ方では、**時間窓の障害**が結果を汚染して、完全に誤った結論になります。実際に、すべて失敗する区間のあとに数分後にはすべて成功し、また失敗する、という区間を計測しています。代わりに `proxy → direct → proxy → direct` を実行し、毎回 `remote_ip` を記録してください。
</Warning>

## その他の一般的なトリガー

<CardGroup cols={2}>
  <Card title="実行中の手動中断" icon="octagon-x">
    デバッグ中の Ctrl+C、プロセスの再起動、ホットリロード、実行中スクリプトの強制終了 — 送信途中の大きなレスポンスはどれも、ゲートウェイに `write_response_body_failed` を残します。これは、最もよく「チャネルが不安定だ」と誤解される誤警報です。
  </Card>

  <Card title="外側のタイムアウトが先に発火する" icon="timer-off">
    タスクキューのワーカーのタイムアウト、Serverless の実行制限、ゲートウェイ/CDN のオリジンタイムアウト（通常はデフォルトで 60 秒）です。生成時間より短いどのレイヤーでも、先に接続を切断します — [必読事項とベストプラクティス](/ja/api-capabilities/image-api-best-practices#troubleshooting-timeouts-and-disconnects) を参照してください。
  </Card>

  <Card title="コネクションプールと過剰な同時実行数" icon="waypoints">
    コネクションプールの上限、ローカルのファイルディスクリプタ制限、NAT/ファイアウォールが長時間接続を静かに回収してしまうこと。大きなレスポンスははるかに長く接続が開いたままになるため、テキストエンドポイントよりもこれらの制限にずっと頻繁に達します。
  </Card>

  <Card title="レスポンスボディがメモリを使い切る" icon="memory-stick">
    1 つの 4K base64 ペイロードだけで 20-30MB に達することがあります。`resp.json()` を同時実行数下で一度にすべて読み込むと、コンテナメモリを使い切ってプロセスが OOM-killed され、これもまた「理由もなく接続が切れた」ように見えます。
  </Card>
</CardGroup>

## 課金への影響: どのケースが課金され、どのケースが課金されないか

この 2 つの状況は常に混同されますが、課金のされ方は正反対です:

<Info>
  ### プラットフォームが 500 `write_response_body_failed` を返した場合 — **課金されません**

  このエラーは、ゲートウェイが画像データをあなたに書き戻している最中に接続が切れたことを意味します。**プラットフォームは内部で自動的に 2〜3 回再試行します**が、すべて失敗した場合にのみ 500 を返します。

  **このケースでは課金は発生しません。** 同じリクエストでこのエラーが何度続いても、**請求書に対応する課金は残りません** — この失敗に対して料金を支払うことはありません。
</Info>

<Warning>
  ### あなたのクライアントが先に切断した場合 — **通常どおり課金されます**

  もう一方のケースは、**あなた側**が先に切断したままゲートウェイの配信が完了する場合です。つまり、クライアントのタイムアウト発火、デバッグ中の Ctrl+C、プロセスの再起動、または OOM kill などです。

  サーバー側と上流での生成は**すでに完了している**ため、これらは**通常どおり課金されます** — 「画像を受け取れなかった」ことは「課金されなかった」ことを意味しません。大きな画像リクエストをトラブルシューティングで何度も投げると、実際の請求が積み上がります。
</Warning>

両者を見分ける方法は、まさに上の表のとおりです: **コンソールに通常の呼び出しが記録されたか、500 `write_response_body_failed` が記録されたかを確認してください**。

したがって、再試行ポリシーもそれに合わせて節度を保つべきです: トランスポートレベルの失敗は再試行する価値がありますが、**再試行のたびに別個に課金される呼び出しになる可能性があります**（どちらのカテゴリに当たるかによります）。無制限の再試行ループは決して書かないでください。

## 正しくリトライする方法

中核ルール: **リトライするのはトランスポートレベルの例外だけで、HTTPレベルのエラーは絶対にリトライしません**。4xx を 1万回再送しても、依然として 4xx でしかなく、時間の無駄です。

```python theme={null}
import time
import requests

TRANSPORT_ERRORS = (
    requests.exceptions.SSLError,
    requests.exceptions.ConnectionError,
    requests.exceptions.ChunkedEncodingError,
    requests.exceptions.ReadTimeout,
)

def call_image_api(url, headers, body, timeout=360, retries=2):
    """Retry transport-level failures up to `retries` times; never retry HTTP
    4xx/5xx — hand those straight back to the caller.

    Note: each retry may be a newly billed request, so keep `retries` small.
    """
    attempts = []
    for i in range(retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=body,
                                 stream=True, timeout=(10, timeout))
            raw = b"".join(resp.iter_content(chunk_size=8192))
            attempts.append({"attempt": i + 1, "status": resp.status_code})
            return resp.status_code, raw, attempts      # 4xx/5xx included
        except TRANSPORT_ERRORS as e:
            attempts.append({"attempt": i + 1, "error": repr(e)})
            if i == retries:
                raise
            time.sleep(2 + 3 * i)                       # back off 2s, then 5s
```

<Tip>
  **すべての試行を個別に記録してください**（上の `attempts` リスト）。そうしないと、クライアント側のリトライが成功したときに、ログにはきれいな 200 だけが残り、トランスポートが実際に何回壊れたのかが分からなくなります。これはチャネル品質を評価するときに不可欠なデータであり、自分のリトライをチャネルの挙動として誤読するのを防いでくれます。
</Tip>

### レスポンスを丸ごと読み込まず、ストリーミングしてください

大きな本文では、`stream=True` を使ってチャンクごとに読み取ってください。これによりピークメモリを抑えられ、**転送のどの段階で壊れたのかを正確に**示せます:

```python theme={null}
resp = requests.post(url, headers=headers, json=body, stream=True, timeout=(10, 360))
chunks, total = [], 0
for chunk in resp.iter_content(chunk_size=8192):
    total += len(chunk)
    chunks.append(chunk)
raw = b"".join(chunks)
# total far below Content-Length  => the transfer broke midway
# total complete but connection stays open => upstream omitted the chunked
#   terminator, which is a channel-side problem
```

**その 2 つ目のケースはリトライしないでください**: データはすでに完全で、画像はそのまま利用できます。クライアント側の完全な完了コードについては、[最後で Requests がハングする問題](/ja/api-capabilities/image-tail-stall) を参照してください。

## サポートに連絡する価値が本当にある場合

自己確認が済んだら、次のいずれかに当てはまる場合はエスカレーションしてください:

* 適切な OpenSSL インタープリターに切り替え、シリアル実行に落としても、依然として安定して再現する;
* 同じ時間帯で他は正常なのに、**1つの特定のチャネルまたはモデル**だけが失敗する;
* レスポンスボディは完全に到着している（バイト数が`Content-Length`と一致する）にもかかわらず、接続がタイムアウトするまで閉じない — これは上流で chunked 終端が欠けていることを意味し、チャネル側の問題です。**まず [Requests Hanging at the End](/ja/api-capabilities/image-tail-stall) で説明しているクライアント側の完了処理を追加して画像を復旧し**、それでも問題が残る場合はチケットを起票してください;
* エラーが明らかに上流側由来である（`upstream_error`、生の上流 5xx）。

チケットには、`x-request-id`、呼び出し時刻（**タイムゾーン付き**、例: `2026-07-29 14:32 (UTC+8)`）、モデル名、`imageSize` などの主要パラメータ、クライアントの生の例外、そして既に完了した自己確認手順を含めてください。

## 関連ドキュメント

<CardGroup cols={3}>
  <Card title="終了時にリクエストがハングする問題" icon="hourglass" href="/ja/api-capabilities/image-tail-stall">
    画像は到着したのに接続が終了しない場合の、クライアント側での完了処理
  </Card>

  <Card title="必読 & ベストプラクティス" icon="book-check" href="/ja/api-capabilities/image-api-best-practices">
    同期呼び出し、モデルごとのタイムアウト、base64 の扱い、切断時の課金
  </Card>

  <Card title="独自の非同期キューを構築する" icon="list-checks" href="/ja/api-capabilities/image-async-queue">
    同期呼び出しをタスクキューでラップし、再試行でまれなドロップを吸収します
  </Card>

  <Card title="プロキシは必要ですか?" icon="wifi" href="/ja/faq/network-proxy">
    APIYI はプロキシなしで直接接続し、証明書と DNS の問題をセルフチェックします
  </Card>

  <Card title="Gemini 画像エラーハンドリング" icon="triangle-alert" href="/ja/api-capabilities/gemini-image-error-handling">
    Gemini の画像生成におけるエラーコードと finishReason の扱い
  </Card>

  <Card title="エラーの取得" icon="clipboard-list" href="/ja/api-manual/error-reporting">
    これらのエラーを全文で出力する方法と、サポートチケットに含めるべきフィールド
  </Card>
</CardGroup>
