> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CDN での画像/動画ダウンロードが遅い — どうすればよいですか？

> APIYI は生成されたすべての画像と動画を Cloudflare R2 のグローバル CDN 上でホストしています。このガイドは、特定のサーバーからのダウンロードが遅い原因の診断に役立ちます。

## 簡単な回答

APIYI で生成されたすべての画像と動画（Veo 3.1、Sora、Nano Banana など）は、**Cloudflare R2 のグローバル CDN** 上でホストされており、設計上、世界中で高速に動作します。サーバー側でダウンロードが遅い場合、**ほとんどの場合は CDN 自体の問題ではなく、サーバーと Cloudflare のエッジ間のネットワーク経路の問題**です。特に、中国本土のサーバーが海外 CDN にアクセスする場合は、越境帯域幅、ISP ルーティング、ローカル DNS 解決によってパフォーマンスが低下しやすくなります。

<Info>
  **重要なポイント**

  Cloudflare R2 のリソース URL は通常 `*.r2.cloudflarestorage.com` のような形式か、Cloudflare 経由でプロキシされたカスタムドメインです。ダウンロード速度は、サーバーが最寄りの Cloudflare エッジノードへどれだけ効率よく到達できるかに左右されます。
</Info>

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

## トラブルシューティング手順

<Steps>
  <Step title="1台のサーバーだけですか、それともどこでも発生しますか？">
    同じ CDN URL をノートパソコンや別のサーバーからダウンロードしてみてください。

    * ノートパソコンは速いがサーバーは遅い → **サーバーのネットワーク経路の問題**
    * どこでも遅い → 具体的な URL を添えてサポートに連絡してください
  </Step>

  <Step title="CDN への基本ネットワークをテストする">
    `ping`、`mtr`、`traceroute` を使って、レイテンシとパケットロスを確認してください。

    ```bash theme={null}
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    パケットロス、200ms を超えるレイテンシ、または経路が海外へ飛び跳ねる場合は、いずれもリンクレベルの問題を示しています。
  </Step>

  <Step title="実際のダウンロード速度を測定する">
    `curl`を使って、タイミングとスループットを確認してください。

    ```bash theme={null}
    curl -o /dev/null -w "dns:%{time_namelookup} connect:%{time_connect} \
    ttfb:%{time_starttransfer} total:%{time_total} speed:%{speed_download}\n" \
    "<CDN URL>"
    ```

    注目する項目:

    * `time_namelookup`: DNS 解決時間
    * `time_connect`: TCP 接続時間
    * `time_starttransfer`: 最初のバイトまでの時間 (TTFB)
    * `speed_download`: 平均スループット (bytes/sec)
  </Step>

  <Step title="DNS 解決を確認する">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    解決された IP が地理的に近いか確認してください。APAC のユーザーには APAC のエッジが返るはずです。そうでない場合は、パブリック DNS に切り替えてください。
  </Step>

  <Step title="サーバー側の制限を確認する">
    セキュリティグループとファイアウォールがポート 443 と海外の IP レンジを許可していることを確認し、送信帯域幅の上限が設定されていないことも確かめてください。
  </Step>
</Steps>

## 解決策

### オプション 1: パブリック DNS に切り替える（最も簡単）

多くのサーバーでのデフォルト DNS は Cloudflare を遠方のノードに解決します。次のパブリック DNS サーバーを試してください:

```bash theme={null}
{/* /etc/resolv.conf */}
nameserver 1.1.1.1        # Cloudflare
nameserver 8.8.8.8        # Google
nameserver 223.5.5.5      # AliDNS
nameserver 119.29.29.29   # DNSPod
```

<Tip>
  `1.1.1.1` を優先してください — これは Cloudflare 自身の DNS で、最寄りの Cloudflare エッジに確実に解決されるため、R2 / Cloudflare CDN のトラフィックに最適です。
</Tip>

### オプション 2: ダウンロード方法を最適化する

<CardGroup cols={2}>
  <Card title="並列ダウンロード" icon="layers">
    ファイルのバッチ処理には、帯域を使い切るために並列ダウンローダー（`aria2c -x 8`、Python `asyncio + httpx`）を使用してください。
  </Card>

  <Card title="再開可能なダウンロード" icon="refresh-cw">
    大きな動画の場合は、HTTP Range リクエストとリトライを使って、失敗してもゼロからやり直しにならないようにしてください。
  </Card>

  <Card title="接続の再利用" icon="plug">
    HTTP/2 または keep-alive（`httpx`、`requests.Session()`）に対応したクライアントを使い、ハンドシェイクの繰り返しを避けてください。
  </Card>

  <Card title="ディスクへストリーミング" icon="hard-drive">
    ファイル全体をメモリに読み込むのではなく、レスポンスを直接ディスクへストリーミングしてください。
  </Card>
</CardGroup>

**Python の例（推奨）**:

```python theme={null}
import httpx
import asyncio

async def download(url: str, path: str):
    async with httpx.AsyncClient(http2=True, timeout=120) as client:
        async with client.stream("GET", url) as resp:
            resp.raise_for_status()
            with open(path, "wb") as f:
                async for chunk in resp.aiter_bytes(chunk_size=1024 * 256):
                    f.write(chunk)

asyncio.run(download("<CDN URL>", "output.mp4"))
```

**aria2c の例（CLI）**:

```bash theme={null}
aria2c -x 8 -s 8 -k 1M --file-allocation=none "<CDN URL>"
```

### オプション 3: より接続性の良いリージョンに移す

ユースケースで許されるなら、Cloudflare への接続性が良いリージョンを優先してください:

<CardGroup cols={2}>
  <Card title="海外（推奨）" icon="globe">
    AWS / GCP / Azure / Cloudflare Workers はいずれも Cloudflare R2 に非常に低いレイテンシー（通常 10-50ms）で到達できます。
  </Card>

  <Card title="中国：プレミアム DC" icon="server">
    中国本土にデプロイする必要がある場合は、トリプルネットワーク BGP + プレミアム国際回線（CN2 GIA, CMI, AS9929）を備えた DC を選んでください。
  </Card>

  <Card title="香港 / シンガポール" icon="network">
    良い妥協案です。本土中国へのレイテンシーは低く（30-80ms）、APAC の Cloudflare 接続性も優れています。
  </Card>

  <Card title="安価な VPS は避ける" icon="triangle-alert">
    低価格ホストは国際回線の輻輳がひどいことが多く、ピーク時には数十 KB/s まで低下することがあります。CDN を多用するワークロードには推奨しません。
  </Card>
</CardGroup>

### オプション 4: 別のホスト経由で中継する（最終手段）

サーバーがどうしても Cloudflare に素早く到達できず、リージョンも変更できない場合:

1. **海外サーバーを中継先として使う**: まず海外のサーバーにダウンロードし、その後プライベート/プレミアム回線で戻す
2. **自分のオブジェクトストレージ経由で中継する**: アセットを自前の OSS / COS / S3（たとえば中国リージョンのバケット）にミラーし、そこから配信する
3. **事前ウォームアップしてキャッシュする**: バックエンドから一度ダウンロードし、以後のリクエストはローカルキャッシュから配信する

<Warning>
  **有効期限に注意してください**

  APIYI が画像/動画向けに返す CDN URL には通常、利用可能期間の制限があります（返却された URL を確認してください）。後でリンク切れにならないよう、コールバックが届いたら **すぐに** アセットをダウンロードして自前のストレージに保存してください。
</Warning>

## よくある質問

<AccordionGroup>
  <Accordion title="なぜノートPCは速いのに、サーバーは遅いのですか？">
    自宅回線はISP経由の国際ルートが最適化されていることが多い一方、クラウドサーバーはデータセンターの国際出口を通るため、品質が大きく変わることがあります。まずはDCの国際帯域を確認し、上記のトラブルシューティング手順に従ってください。
  </Accordion>

  <Accordion title="DNSを変更したのに、まだ遅いのはなぜですか？">
    DNSは、どのCDNエッジに解決されるかにしか影響しません。基盤となる国際帯域がすでに混雑している場合、DNSを変えるだけでは改善しません。リージョンを変更するか、海外ホスト経由で中継することを検討してください。
  </Accordion>

  <Accordion title="Cloudflare R2は中国本土でブロックされていますか？">
    Cloudflareは中国本土でブロックされていませんが、国際出口はピーク時間に混雑しやすく、ISPによっては最適でないルートを通ることがあるため、アクセス品質は安定しません。これはR2固有の問題ではなく、一般的な越境ネットワークの問題です。
  </Accordion>

  <Accordion title="動画のダウンロードが何度も失敗します。どうすればよいですか？">
    `aria2c`や`wget -c`のような、**再開**に対応したダウンローダーを、適切なタイムアウトとリトライ設定で使用してください。

    ```bash theme={null}
    aria2c -x 8 -s 8 -c --max-tries=10 --retry-wait=3 "<CDN URL>"
    ```
  </Accordion>

  <Accordion title="APIYIはCDN URLの代わりにBase64を返せますか？">
    動画はサイズが大きく（数十MBから数百MB）、Base64は約33%のオーバーヘッドがあり、再開もサポートされません。そのため、実際には遅くなり、帯域も無駄にします。大きなファイルにBase64を使うことは**推奨しません**。一部の画像エンドポイントはBase64レスポンスをサポートしています。該当するAPI docsをご覧ください。
  </Accordion>

  <Accordion title="ボトルネックがCDNではなく自分のネットワークにあることをどう確認できますか？">
    海外ホスト（AWS Tokyo、Singapore など）から同じ`curl`テストを実行してください。そこで速くてサーバー上では遅い場合、ボトルネックはサーバーとCloudflareの間にあり、CDN自体ではありません。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="ネットワークプロキシ設定" icon="network" href="/ja/faq/network-proxy">
    国際接続が不安定な場合のプロキシオプション
  </Card>

  <Card title="APIYI サーバーはどこにありますか？" icon="server" href="/ja/faq/server-location">
    APIYI サーバーの所在地とレイテンシについて学ぶ
  </Card>

  <Card title="Veo 動画生成 API" icon="video" href="/en/api-capabilities/veo/overview">
    動画 API の出力形式と URL の有効性
  </Card>

  <Card title="サポートに連絡" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    それでも解決しない場合は、チームがサポートします
  </Card>
</CardGroup>

<Info>
  **サポートに共有する情報**

  お問い合わせの際は、以下をご記載ください：

  * 該当する CDN URL（機微なパラメータはマスク可）
  * サーバーのリージョン / DC / クラウドプロバイダー
  * `mtr` または `traceroute` の完全な出力
  * 上記の `curl` タイミングコマンドの出力
  * 問題が発生した時間帯（国際回線監視との突き合わせに役立ちます）
</Info>
