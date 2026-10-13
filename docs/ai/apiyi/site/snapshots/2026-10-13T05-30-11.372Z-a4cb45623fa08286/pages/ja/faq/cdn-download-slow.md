> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CDN画像/動画のダウンロードが遅い、またはタイムアウトする場合の対処法

> 画像APIの呼び出しは成功したものの、返却されたURLのダウンロードが遅い、または「Read timed out」が発生していませんか？Windowsを含むセルフチェックコマンド、堅牢なダウンロードパターン、お問い合わせ時にご提供いただきたい情報について説明します。

## クイックアンサー

APIYIを通じて生成されるほとんどの画像や動画（Veo 3.1、Sora、Nano Banana、gpt-image-2-vipなど）は、CloudflareなどのグローバルCDNでホストされているURLとして返されます。ダウンロードの速度低下やタイムアウトは、通常、次の2つの原因のいずれかによって発生します。

* **お使いのサーバーからCDNまでのネットワーク経路**: 中国本土のサーバーから海外のCDNへ接続する場合、越境帯域幅、ISPのルーティング、ローカルDNSの影響を受けます
* **ストレージ側**: CDNの背後にあるストレージノードの応答が低下すると、すべてのルートに影響が及ぶ可能性があります

どちらもプログラムのエラーログ上ではほぼ同じに見え、単一のマシンからのテストだけで区別することは困難です。**以下のセルフチェック手順を実行し、その結果をお送りください**。ストレージ側と照合いたします。これにより、無駄なやり取りを大幅に削減できます。

<Info>
  **ポイント**

  Cloudflare R2のリソースURLは通常、`*.r2.cloudflarestorage.com`またはCloudflareを経由してプロキシされたカスタムドメインの形式になります。ダウンロード速度は、お使いのサーバーが最も近いCloudflareエッジノードにどれだけ効率的にアクセスできるかによって左右されます。
</Info>

## APIは成功したのに、画像がダウンロードできませんか？

画像生成は2つのステージで行われます：

1. プログラムがAPIYI APIを呼び出し、画像が生成され、URLが返されます
2. プログラムがそのURLから画像をダウンロードします

ステージ2は**お使いのサーバーから画像ストレージホストへ直接通信し、APIYI ゲートウェイを経由しません**。そのため、以下のようになります：

* APIYIのログにはリクエストが**成功および課金済み**と表示されます — 実際に画像は生成されています
* プログラムは`Read timed out`や`Connection reset`のようなエラーを報告し、エラー内のホストは`api.apiyi.com`ではなく**画像ドメイン**になります
* `Read timed out`は接続が確立されたものの、長時間データが届かなかったことを意味します。「接続できない」こととは異なり、これ単体ではどちら側に原因があるかを特定することはできません

<Tip>
  **URLが有効な間は、同じURLを再ダウンロードできます**（例えばgpt-image-2-vipの場合は48時間）。ダウンロードに失敗しても**画像を再生成する必要はありません** — 単にダウンロードを再試行してください。コードパターンについては、以下の「オプション2」を参照してください。
</Tip>

<Warning>
  **アラートメッセージを確認してください**：API呼び出しが失敗したときは`api.apiyi.com`を報告し、ダウンロードが失敗したときは画像ドメインに加えて「生成成功」を報告してください。この2つを混同すると、ダウンロードの問題がAPIの障害のように見えてしまいます。
</Warning>

## 主な原因

<CardGroup cols={2}>
  <Card title="越境トラフィックの混雑" icon="network">
    中国本土のサーバーが海外 CDN に到達する際、ピーク時間帯には国際出口回線で混雑が発生しやすく、速度低下やタイムアウトの原因になります。
  </Card>

  <Card title="ISP ルーティングの最適化不足" icon="route">
    一部のクラウドプロバイダーは国際トラフィックを米国西海岸やヨーロッパ経由でルーティングし、不要な数十ミリ秒の遅延を追加します。
  </Card>

  <Card title="DNS 解決の不良" icon="globe">
    ローカル DNS が Cloudflare のホスト名を、最寄りの APAC ノードではなく遠方のエッジ（例: 米国西海岸）に解決する場合があります。
  </Card>

  <Card title="ファイアウォール / セキュリティグループの制限" icon="shield">
    一部のサーバーは、海外の IP レンジ、port 443、または特定の CDN ドメインへのアウトバウンドトラフィックを制限し、接続品質を低下させます。
  </Card>

  <Card title="HTTP/2 と接続の再利用" icon="plug">
    HTTP/2 や接続の再利用を行わないクライアントは、ファイルごとに TCP/TLS ハンドシェイクのコストを支払うことになります。
  </Card>

  <Card title="単一スレッドのダウンロード" icon="gauge">
    逐次的な単一スレッドのダウンロードでは CDN の多重化の恩恵を受けられず、スループットは低いままです。
  </Card>
</CardGroup>

## トラブルシューティングの手順

<Steps>
  <Step title="送信元IPとCDNノードの取得">
    画像ドメインがCloudflare経由で配信されている場合、その`/cdn-cgi/trace`パスを使用すると、1つのコマンドで送信元IPと割り当てられたノードを確認できます。Linux、macOS、Windowsのcmdで動作します：

    ```bash theme={null}
    curl -s -m 30 https://<image-domain>/cdn-cgi/trace
    ```

    次の3行を確認してください：`ip=`（送信元IP）、`colo=`（HKG、SIN、LAX、FRAなどのノードコード）、`loc=`（リージョン）。

    * **30秒以内に出力がない場合**：サーバーがドメインにまったくアクセスできていません。ステップ4と5を中心に対処してください
    * **即座に出力される場合**：接続は正常であり、問題は転送処理にあります。フェーズごとの所要時間を計測するため、ステップ3へ進んでください
  </Step>

  <Step title="ノートPCとサーバーの比較">
    ノートPCとサーバーの双方から**同一の画像URL**をダウンロードします（コマンドはステップ3を参照）。

    * **ノートPCは高速でサーバーは低速**：サーバー側のネットワーク経路が原因である可能性が最も高いですが、一部のルートでのみストレージ側の性能が低下している可能性もあります。両方の結果をお送りください
    * **どこからでも低速**：ストレージ側の問題である可能性が最も高いため、URLを添えてお問い合わせください
  </Step>

  <Step title="CDNへの基本ネットワークのテスト">
    `ping`、`mtr`、`traceroute`を使用して、レイテンシとパケットロスを確認します：

    ```bash theme={null}
    # Linux / macOS
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    ```bash theme={null}
    # Windows cmd
    tracert -d -w 1000 <cdn-host>
    ```

    サーバーからCloudflareへの全体的なスループットを確認するには、5 MBのテストデータをダウンロードします：
    `curl -o /dev/null -m 60 -w "total=%{time_total} speed=%{speed_download}\n" "https://speed.cloudflare.com/__down?bytes=5000000"`
    （Windowsでは、`/dev/null`を`NUL`に置き換えてください）。これも遅い場合はサーバーの送信回線（エグレス）に問題があります。これが高速で画像URLのみが遅い場合は、その結果をお送りください。

    パケットロス、200msを超えるレイテンシ、または海外を経由するようなルーティングの揺れは、いずれも回線レベルの問題を示しています。
  </Step>

  <Step title="実際のダウンロード速度の測定">
    `curl`を使用して、所要時間とスループットを確認します：

    <Tabs>
      <Tab title="Linux / macOS">
        ```bash theme={null}
        curl -4 -o /dev/null -m 60 -w "dns:%{time_namelookup} connect:%{time_connect} \
        tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total} \
        size:%{size_download} speed:%{speed_download} ip:%{remote_ip}\n" \
        "<CDN URL>"
        ```
      </Tab>

      <Tab title="Windows cmd">
        ```bash theme={null}
        curl -4 -o NUL -m 60 -w "dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} size=%{size_download} speed=%{speed_download} ip=%{remote_ip}\n" "<CDN URL>"
        ```

        cmdウィンドウに直接貼り付けてください。.batファイル内では、`%`を`%%`に変更してください。Windows 10以降にはcurlが標準で搭載されています。Windows Server 2012 R2などの古いシステムでは、個別にインストールする必要があります。
      </Tab>
    </Tabs>

    `-m 60`を指定すると、curlは60秒後に処理を中断しつつ所要時間を出力するため、処理が途中でハングすることはありません。`-4`の代わりに`-6`を指定して再度実行してください。片方のプロトコルでのみ停止する場合は、プログラムを正常に動作する方に固定できます。

    次の項目に注目してください：

    * `time_namelookup`：DNS名前解決時間
    * `time_connect`：TCP接続時間
    * `time_appconnect`：TLSハンドシェイク完了時間（0はハンドシェイク失敗を意味します）
    * `time_starttransfer`：最初の1バイトを受信するまでの時間（TTFB）
    * `size_download`：実際に受信したバイト数（0または極端に小さい値は接続されたものの転送が停止したことを意味します）
    * `speed_download`：平均スループット（バイト/秒）
  </Step>

  <Step title="DNS名前解決の調査">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    解決されたIPが地理的に近い場所にあるか確認してください。APACのユーザーにはAPACのエッジが割り当てられるべきです。そうでない場合は、パブリックDNSへの切り替えをお試しください。
  </Step>

  <Step title="サーバー自体の確認">
    「昨日は動作していたのに、今日は動かない」という場合、通常はサーバー上で何かが変更されたことを意味します。各項目を確認してください：

    * クラウドコンソール：トラフィッククォータを使い切っていないか、帯域幅が制限されていないか、アカウントの支払いが滞っていないか
    * 他のプロセスによって帯域幅が逼迫していないか（Windows：タスク マネージャー → パフォーマンス → イーサネット、Linux：`iftop`、`nload`）
    * セキュリティグループやファイアウォールでポート443および海外IPレンジが許可されているか、アウトバウンドルールが最近変更されていないか
    * プログラムが無効なプロキシを経由していないか：`HTTP_PROXY` / `HTTPS_PROXY`を確認し、Windowsでは`netsh winhttp show proxy`も確認してください
  </Step>
</Steps>

## 解決策

### 選択肢1: パブリックDNSへの切り替え（最も簡単）

多くのサーバーのデフォルトDNSは、Cloudflareを遠くのノードに解決してしまいます。以下のパブリックDNSサーバーをお試しください。

```bash theme={null}
{/* /etc/resolv.conf */}
nameserver 1.1.1.1        # Cloudflare
nameserver 8.8.8.8        # Google
nameserver 223.5.5.5      # AliDNS
nameserver 119.29.29.29   # DNSPod
```

<Tip>
  `1.1.1.1`を推奨します。これはCloudflare自身のDNSであり、最寄りのCloudflareエッジに確実に解決されるため、R2 / Cloudflare CDNトラフィックに最適です。
</Tip>

### 選択肢2: ダウンロード方法の最適化

<CardGroup cols={2}>
  <Card title="並行ダウンロード" icon="layers">
    複数ファイルをまとめてダウンロードする場合は、帯域幅を最大限に活用するために並行ダウンローダー（`aria2c -x 8`、Pythonの`asyncio + httpx`）を使用してください。
  </Card>

  <Card title="短いタイムアウト ＋ 再試行" icon="refresh-cw">
    接続タイムアウトと読み取りタイムアウトを個別に設定し、読み取りタイムアウトは約30秒に抑えて、3〜4回再試行してください。接続が停滞した場合、新規に接続し直すとうまくいくことが多く、120秒間待ち続けるよりもはるかに効率的です。
  </Card>

  <Card title="接続の再利用" icon="plug">
    繰り返しのハンドシェイクを避けるため、HTTP/2またはkeep-aliveに対応したクライアント（`httpx`、`requests.Session()`）を使用してください。
  </Card>

  <Card title="ディスクへのストリーミング保存" icon="hard-drive">
    ファイル全体をメモリに読み込むのではなく、レスポンスを直接ディスクへストリーミングして保存してください。
  </Card>
</CardGroup>

**Pythonの例（推奨）**:

`timeout=120`を使用した単一のダウンロードは避けてください。接続が停滞すると何も得られないまま120秒待たされることになり、タスク全体が失敗と判定されてしまいます。その結果、すでに生成されて課金対象となった画像が無駄になってしまいます。

```python theme={null}
import time
import httpx

# connect 10s; read 30s = give up after 30s with no data (not total duration)
TIMEOUT = httpx.Timeout(connect=10, read=30, write=30, pool=10)

def download(url: str, path: str, attempts: int = 4) -> str:
    for i in range(attempts):
        try:
            with httpx.stream("GET", url, timeout=TIMEOUT, follow_redirects=True) as resp:
                resp.raise_for_status()
                with open(path, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=256 * 1024):
                        f.write(chunk)
            return path
        except httpx.HTTPError as e:
            print(f"Download failed (attempt {i + 1}): {e!r}")
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"Image generated, but download failed repeatedly: {url}")

download("<CDN URL>", "output.png")
```

**aria2cの例（CLI）**:

```bash theme={null}
aria2c -x 8 -s 8 -k 1M --file-allocation=none "<CDN URL>"
```

### 選択肢3: より接続性の高いリージョンへの移行

ユースケースで許容される場合は、Cloudflareへの接続性が良好なリージョンを優先してください。

<CardGroup cols={2}>
  <Card title="海外（推奨）" icon="globe">
    AWS / GCP / Azure / Cloudflare Workersはいずれも非常に低いレイテンシ（通常10〜50ミリ秒）でCloudflare R2に到達できます。
  </Card>

  <Card title="中国国内: プレミアムデータセンター" icon="server">
    中国本土にデプロイする必要がある場合は、トリプルネットワークBGP＋プレミアム国際回線（CN2 GIA、CMI、AS9929）を備えたデータセンターを選択してください。
  </Card>

  <Card title="香港 / シンガポール" icon="network">
    優れた妥協案です。中国本土へのレイテンシが低く（30〜80ミリ秒）、アジア太平洋地域のCloudflare接続性も優れています。
  </Card>

  <Card title="格安VPSの回避" icon="triangle-alert">
    格安ホストは国際回線の送信トラフィックが著しく混雑していることが多く、ピーク時には数十KB/sまで低下する可能性があります。CDNトラフィックの負荷が高いワークロードには推奨されません。
  </Card>
</CardGroup>

### 選択肢4: 別のホストを経由した中継（最後の手段）

サーバーがどうしてもCloudflareに高速にアクセスできず、リージョンの変更も不可能な場合：

1. **海外サーバーを中継として利用する**: まず海外のマシンにダウンロードし、その後専用線やプレミアム回線経由で転送します
2. **独自のオブジェクトストレージ経由で中継する**: 自前のOSS / COS / S3（例：中国リージョンのバケット）にアセットをミラーリングし、そこから配信します
3. **事前ウォームアップとキャッシュ**: バックエンドで一度ダウンロードし、後続のリクエストにはローカルキャッシュから対応します

<Warning>
  **有効期限にご注意ください**

  画像や動画に対してAPIYIから返されるCDN URLには、通常、有効期限が設定されています（返却されたURLをご確認ください）。後からリンク切れになるのを防ぐため、コールバックを受信したら**直ちに**アセットをダウンロードし、ご自身のストレージに永続化してください。
</Warning>

## よくある質問

<AccordionGroup>
  <Accordion title="ノートパソコンでは高速なのに、サーバーでは遅いのはなぜですか？">
    家庭用ブロードバンドとデータセンターの国際送信回線では品質が大きく異なる場合があり、これが最も一般的な原因です。

    ただし、**それだけが理由ではありません**。ストレージ側のノードのパフォーマンスが低下している場合、特定のルートにのみ影響が及ぶことがあり、これも「ノートパソコンでは高速なのにサーバーでは遅い」という現象として現れます。これだけで判断せず、上記の手順を実行して結果をお送りいただければ、ストレージ側と照合して確認いたします。
  </Accordion>

  <Accordion title="エラーには api.apiyi.com に接続できないと表示されますが、詳細のホストが画像ドメインになっているのはなぜですか？">
    そのテキストは、通常お客様自身のプログラムによって組み立てられています。実際に失敗したのは**画像のダウンロード**であり、生成 API の呼び出し自体は成功しています。詳細情報に記載されているホストを信頼し、これら2種類のエラーメッセージを分けて処理することをご検討ください。
  </Accordion>

  <Accordion title="DNS を変更しても遅いままです。なぜですか？">
    DNS は、名前解決される CDN エッジにのみ影響します。基盤となる国際帯域がすでに混雑している場合、DNS を変更しただけでは改善されません。リージョンを変更するか、海外ホスト経由で中継することをご検討ください。
  </Accordion>

  <Accordion title="Cloudflare R2 は中国本土でブロックされていますか？">
    Cloudflare は中国本土でブロックされていませんが、ピーク時間帯には国際回線が混雑することがあり、一部の ISP が最適でないルートを経由するため、アクセスの品質が不安定になります。これは国境を越えるネットワーク全般の課題であり、R2 固有の問題ではありません。
  </Accordion>

  <Accordion title="動画のダウンロードが失敗し続けます。どうすればよいですか？">
    `aria2c` や `wget -c` など、\*\*レジューム（再開）\*\*に対応したダウンローダーを使用し、適切なタイムアウトとリトライを設定してください：

    ```bash theme={null}
    aria2c -x 8 -s 8 -c --max-tries=10 --retry-wait=3 "<CDN URL>"
    ```
  </Accordion>

  <Accordion title="APIYI は CDN URL の代わりに Base64 を返すことはできますか？">
    動画はサイズが大きく（数十〜数百 MB）、Base64 では約 33% のオーバーヘッドが発生する上にレジューム機能もサポートされないため、実際にはより遅くなり帯域幅を浪費します。大容量ファイルに対する Base64 の使用は**推奨されません**。一部の画像エンドポイントでは Base64 レスポンスをサポートしています。詳細は関連する API ドキュメントをご参照ください。
  </Accordion>

  <Accordion title="ボトルネックが CDN ではなく自身のネットワークにあることを確認するにはどうすればよいですか？">
    海外ホスト（AWS 東京、シンガポールなど）から同じ `curl` テストを実行してください。そこで高速であり、お使いのサーバーで遅い場合、ボトルネックは CDN 自体ではなく、お使いのサーバーと Cloudflare の間にあります。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="ネットワークプロキシ設定" icon="network" href="/ja/faq/network-proxy">
    国際接続が不安定な場合のプロキシオプション
  </Card>

  <Card title="APIYI サーバーの設置場所" icon="server" href="/ja/faq/server-location">
    APIYI サーバーの設置場所とレイテンシについてご確認ください
  </Card>

  <Card title="Veo 動画生成 API" icon="video" href="/en/api-capabilities/veo/overview">
    動画 API の出力形式と URL の有効期限
  </Card>

  <Card title="サポートへのお問い合わせ" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    解決しない場合は、サポートチームがお手伝いします
  </Card>
</CardGroup>

<Info>
  **サポートに提供する情報**

  自己診断で解決しない場合は、何度もやり取りする手間を省くため、以下の情報を一度にまとめてお送りください：

  * 問題が発生している画像 URL とその生成日時（またはリクエスト ID）
  * 完全な `/cdn-cgi/trace` 出力（お使いのノート PC から1つ、サーバーから1つ）
  * `curl` のフェーズタイミング出力（`-4` で1回、`-6` で1回実行）
  * `tracert` / `mtr` の出力と 5 MB のテストダウンロード結果
  * ご利用のサーバーのクラウドプロバイダーとリージョン
  * 問題が発生し始めた大体の日時（タイムゾーン付き、例：`21:23 (UTC+8)`）

  送信する前に、スクリーンショットに写っている API Key を必ずマスキングしてください。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.