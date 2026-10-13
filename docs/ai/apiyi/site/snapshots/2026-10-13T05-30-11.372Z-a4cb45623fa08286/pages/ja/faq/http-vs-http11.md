> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# http と HTTP/1.1 は同じですか？

> http/https は暗号化を制御し、HTTP/1.1 と HTTP/2 は接続がリクエストを伝送する方法を制御します。これらは異なるものです。ほとんどのユーザーは単に https://api.apiyi.com を使用するだけで問題ありません。

## 簡潔な回答

**いいえ。**`http://` と `https://` は、**トラフィックが暗号化されるかどうか**を決定します。HTTP/1.1 と HTTP/2 は**プロトコルのバージョン**であり、接続上でリクエストがどのように伝送されるかを決定します。この2つのどのような組み合わせも可能です。

ほぼすべてのユーザーは、単にこのアドレスをそのまま使用し、何も変更する必要はありません:

```text theme={null}
https://api.apiyi.com
```

## 2つの独立した次元

| 次元 | 決定する内容 | 値 |
| - | - | - |
| `http://` または `https://` | トラフィックが暗号化されているかどうか（TLSの有無） | プレーンテキスト / 暗号化 |
| HTTP/1.1 または HTTP/2 | 1つの接続上でリクエストがどのように転送されるか | HTTP/1.1: 1接続につき一度に1リクエストを処理するため、同時実行数が増えると接続数も増加<br />HTTP/2: 多数のリクエストが1つの接続を共有（多重化） |

プロトコルのバージョンは、**接続の確立時にクライアントとサーバー間でネゴシエーション**されます。URLの記述方法によって決定されるわけではありません。APIYIの `https://` エンドポイントはHTTP/1.1とHTTP/2の両方をサポートしており、お使いのクライアントがサポートしている方を使用します。

そのため、「httpはHTTP/1.1を意味し、httpsはHTTP/2を意味する」という一般的な認識は誤解です。

* `http://` アドレスの場合、主要なクライアントはほぼ常にHTTP/1.1を使用しますが、それは結果的にそうなっているにすぎません
* `https://` アドレスの場合、クライアント自体に応じて、HTTP/1.1を使用するものもあればHTTP/2を使用するものもあります

## 一般的なクライアントのデフォルトバージョン（https経由）

| クライアント | デフォルトバージョン |
| - | - |
| Python `requests`、`httpx`、OpenAI Python SDK | HTTP/1.1 |
| Node.js `axios` | HTTP/1.1 |
| Node.js 組み込み `fetch`、OpenAI Node SDK | Node 25 以前: HTTP/1.1; **Node 26 以降はデフォルトで HTTP/2 をネゴシエート** |
| Go 標準ライブラリ `net/http`（new-api や one-api などのゲートウェイで使用） | HTTP/2 |
| Java `HttpClient`、OkHttp | HTTP/2 |
| curl、ブラウザ | HTTP/2 |

実際にどのバージョンを使用しているかを確認するには、curl を実行します：

```bash theme={null}
curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
# 2 means HTTP/2, 1.1 means HTTP/1.1
```

## どのアドレスを使用すべきですか？

<Steps>
  <Step title="エンドユーザー：httpsを使用し、変更は不要">
    APIを直接呼び出す個人および企業は`https://api.apiyi.com`を使用してください。PythonやNodeなどの一般的なSDKは、プロトコルのチューニングを必要とせず、そのまま適切に動作します。
  </Step>

  <Step title="高同時実行数で画像をアップロードするGo / Javaクライアント：httpsを維持し、クライアント側でHTTP/2を無効化">
    HTTP/2は単一の接続に多数の並行リクエストを集約します。数MBの画像をアップロードする場合、その接続でわずかな問題が発生しただけでも、その接続上のすべてのリクエストが遅延します。クライアントがデフォルトでHTTP/2を使用しており、高同時実行数の画像生成や編集を行う場合は、クライアントをHTTP/1.1に切り替えてください。**httpsアドレスを維持してください。httpに切り替える必要はありません。**
  </Step>

  <Step title="http://api.apiyi.com:16888：フォールバック専用">
    これは公式に提供されている平文エンドポイントです。HTTPSハンドシェイク自体が失敗する場合（例：[PythonでSSLEOFErrorが発生するがcurlは動作する？](/ja/faq/openssl-pq-handshake-eof)）、または信頼できる内部ネットワークや専用線内でのみ、一時的な回避策として使用してください。
  </Step>
</Steps>

<Warning>
  `http://`は暗号化されていません。お客様のAPIキー、prompt、画像は平文でパブリックネットワークを通過するため、経路上のあらゆるネットワーク機器から閲覧可能です。本番環境の長期的な運用構成として平文エンドポイントに依存しないでください。
</Warning>

### GoクライアントをHTTP/1.1に切り替える方法

コードを変更しない方法として、プロセスに環境変数を設定する方法があります。これはnew-apiやone-apiなどの既存のゲートウェイプログラムに適しています：

```bash theme={null}
GODEBUG=http2client=0
```

独自のコードでは、`Transport.TLSNextProto`に非nilの空マップを設定します：

```go theme={null}
import (
    "crypto/tls"
    "net/http"
)

tr := &http.Transport{
    // A non-nil empty map disables HTTP/2, so https requests use HTTP/1.1
    TLSNextProto:        map[string]func(string, *tls.Conn) http.RoundTripper{},
    MaxIdleConnsPerHost: 100,
}
client := &http.Client{Transport: tr}
```

## よくある誤解

<AccordionGroup>
  <Accordion title="http:// の方が速いですか？">
    Python や Node のようにすでに HTTP/1.1 を使用しているクライアントの場合、http に切り替えても節約できるのは1回の TLS ハンドシェイク（1秒にも満たない時間）だけです。これは数十秒かかる画像生成の時間と比べれば無視できる程度であり、暗号化も失われてしまいます。
  </Accordion>

  <Accordion title="HTTP/2 を無効にするには http:// に切り替える必要がありますか？">
    いいえ。HTTP/2 はクライアント側で無効化します（上記の Go の例を参照してください）。他の言語にも同様の設定があります。その後も `https://api.apiyi.com` を使用し続ければ、暗号化された HTTP/1.1 を利用できます。
  </Accordion>

  <Accordion title="HTTP/2 は悪いものですか？">
    いいえ。リクエストが小さく数が多いブラウザや通常のテキストチャットでは、HTTP/2 の接続再利用によってリソースが節約されます。単一の多重化接続がボトルネックになるのは、高い同時実行数と大きなリクエストまたはレスポンスボディが組み合わさった場合のみです。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Base URL の設定方法は？](/ja/faq/base-url-config)
* [画像APIのレイテンシを削減するには？](/ja/faq/image-api-network-latency-optimization)
* [Python では SSLEOFError が発生するのに curl では動作する場合は？](/ja/faq/openssl-pq-handshake-eof)
* [スクリプトで 502 が返されるのに呼び出しログに何も表示されない場合は？](/ja/faq/proxy-empty-502)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.