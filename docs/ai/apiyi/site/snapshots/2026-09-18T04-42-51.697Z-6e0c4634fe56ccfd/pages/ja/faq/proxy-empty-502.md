> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# スクリプトで 502 が発生するのに呼び出しログには何も表示されないのはなぜですか？

> 本文が空で、Connection: close および Content-Length: 0 ヘッダーのみを含む 502 は、APIYI ではなくマシン上のプロキシソフトウェアから発生しています。これを修正するには、スクリプトでシステムプロキシをバイパスしてください。

## 症状

バッチスクリプト（通常は Windows + Python `requests`）が断続的に 502 レスポンスを受信し、出力はおおよそ次のようになります。

```text theme={null}
HTTP 502: {'_non_json_response': '', '_status_code': 502,
           '_headers': {'Connection': 'close', 'Content-Length': '0'}}
```

また、次のことにも気付きます。

* レスポンスの**本文は空**で、ヘッダーは `Connection` と `Content-Length` **のみ**です
* Webコンソールはその間も継続して動作しています
* 失敗したリクエストは[呼び出しログ](/ja/faq/call-logs)に**まったく表示されません**
* スクリプトは 502 時にリトライし、1 回成功するまで連続して数回失敗することが多く、バックオフはそのたびに長くなります

## 短い回答

<Info>
  **この 502 は APIYI からのものではありません。ご利用のマシン上のプロキシソフトウェア（Clash、v2rayN、および類似ツール）によって生成されています。**

  修正するには、スクリプトでシステムプロキシをバイパスしてください。`requests` では、`session.trust_env = False` を設定します。その他のオプションについては以下で説明します。
</Info>

## これが該当するケースかを見分ける方法

APIYI の各レイヤーは識別可能な特性を持つレスポンスを返し、いずれも上記の空の 502 とは一致しません。

| 発生元                  | レスポンスの特性                                                            |
| -------------------- | ------------------------------------------------------------------- |
| APIYI アクセスノード（nginx） | 常に `Server` および `Date` ヘッダーを含みます。ノードで生成された 5xx エラーには HTML ボディも含まれます |
| APIYI ゲートウェイ         | `error.message` を含む JSON エラーボディ                                     |
| 転送に失敗したプロキシソフトウェア    | 空のボディで、通常は `Connection: close` および `Content-Length: 0` のみを含みます      |

502 に **`Server` ヘッダーも `Date` ヘッダーもなく、ボディが空の場合**、それは APIYI ではなく、ほぼ間違いなくプロキシソフトウェアから返されたものです。

<Note>
  サービスコンテナが短時間再起動する際には、プラットフォームから実際の 502 が返されることもあります。この場合、Web コンソールも同時に停止し、サービスは約 1 分以内に復旧します。レスポンスには完全なヘッダーとボディが含まれます。[Webサイトまたは API が 502 を返す](/ja/faq/website-502-error)を参照してください。
</Note>

## プロキシが介在する理由

1. **Python `requests` はシステムプロキシを自動的に取得します。** Windows では、レジストリからシステムプロキシ設定を読み取ります。Clash、v2rayN、または類似ツールで「システムプロキシ」を有効にすると、スクリプトは気付かないうちにそれを経由してルーティングされ、コード上には何も表示されません。
2. **プロキシはプレーン HTTP リクエストを自身で転送します。** `http://api.apiyi.com:16888` のようなプレーン HTTP アドレスでは、プロキシは単に透過トンネルを開くだけではなく、リクエストを代理で再送信します。プロキシノードが停止、切り替え、またはタイムアウトすると、プロキシは空の 502 をスクリプトに返します。
3. **大きなリクエストボディと高い同時実行数によって問題が悪化します。** 画像編集では数 MB の画像データをアップロードし、1 回の生成には 45 ～ 70 秒かかります。数十件の同時リクエストが 1 つのプロキシノードを共有している場合、わずかな障害でもバッチ全体が一度に失敗します。

<Tip>
  `https://` では、プロキシは暗号化トンネルを開くだけであるため、失敗は通常、偽造された 502 ではなく接続エラー（`ProxyError` など）として現れます。ただし、HTTPS トラフィックも引き続きプロキシを経由するため、根本的な解決策はスクリプトをプロキシから切り離すことです。
</Tip>

## 修正

<Steps>
  <Step title="スクリプトがプロキシを使用しているか確認します">
    スクリプトと同じ環境で次を実行します。

    ```python theme={null}
    import urllib.request
    print(urllib.request.getproxies())
    ```

    出力に `http` または `https` のエントリ（例: `127.0.0.1:7890`）が含まれる場合、`requests` はデフォルトでそのプロキシを経由します。
  </Step>

  <Step title="プロキシをバイパスします（いずれかを選択）">
    <Tabs>
      <Tab title="requests">
        ```python theme={null}
        import requests

        session = requests.Session()
        session.trust_env = False   # ignore system and environment proxy settings

        resp = session.post(
            "https://api.apiyi.com/v1/images/edits",
            headers={"Authorization": "Bearer YOUR_API_KEY"},
            data={"model": "gpt-image-2-vip", "prompt": "...", "size": "1024x1536"},
            files=[("image[]", open("a.jpg", "rb"))],
            timeout=(10, 600),
        )
        ```

        1回のリクエストのみ変更する場合: `requests.post(..., proxies={"http": None, "https": None})`。
      </Tab>

      <Tab title="OpenAI SDK">
        ```python theme={null}
        import httpx
        from openai import OpenAI

        client = OpenAI(
            api_key="YOUR_API_KEY",
            base_url="https://api.apiyi.com/v1",
            http_client=httpx.Client(trust_env=False, timeout=600),
        )
        ```
      </Tab>

      <Tab title="環境変数">
        コードを変更したくない場合は、スクリプトを実行する前に `NO_PROXY` を設定し、APIYI ドメインがプロキシをスキップするようにします。

        ```bash theme={null}
        # Windows PowerShell
        $env:NO_PROXY="api.apiyi.com,.apiyi.com"

        # macOS / Linux
        export NO_PROXY="api.apiyi.com,.apiyi.com"
        ```
      </Tab>

      <Tab title="プロキシソフトウェア">
        Clash、v2rayN、または同様のツールで、`apiyi.com` に対する DIRECT ルールを追加するか、バッチジョブの実行中は「system proxy」をオフにします。
      </Tab>
    </Tabs>
  </Step>

  <Step title="小規模なバッチで検証します">
    同時実行ワーカー数を5～10に設定し、数十件のリクエストを実行します。空の502が解消されれば、原因はプロキシでした。APIYI には直接アクセスでき、プロキシは必要ありません。[API を使用するためにプロキシは必要ですか？](/ja/faq/network-proxy)を参照してください。
  </Step>
</Steps>

<Note>
  `http://api.apiyi.com:16888` は、画像ワークロードのレイテンシを低減するために公式に提供されているプレーン HTTP エンドポイントです（[画像 API のレイテンシを低減するには？](/ja/faq/image-api-network-latency-optimization)を参照）。**引き続き使用できます**。ただし、上記の説明どおりプロキシをバイパスしてください。
</Note>

## よくある質問

<AccordionGroup>
  <Accordion title="失敗したこれらのリクエストにも課金されますか？">
    プロキシが失敗したタイミングによって異なります。

    * リクエストがAPIYIに到達する**前にプロキシが失敗した**場合、APIYIはリクエストを受信していないため、課金も呼び出しログへの記録もありません。
    * リクエスト送信**後、結果を待機している間にプロキシが接続を切断した**場合、APIYIはすでに画像を生成している可能性があり、通常どおり課金されますが、結果はスクリプトに届きません。

    したがって、スクリプトのエラー出力だけに頼らないでください。[呼び出しログ](/ja/faq/call-logs)で実際に課金された呼び出し数を確認してください。
  </Accordion>

  <Accordion title="数回リトライすると成功するのはなぜですか？">
    プロキシノードの一時的な不具合であることが多いため、ノードが復旧した後に到達したリトライは通過します。ただし、リトライのたびに完全な画像が再アップロードされ、バックオフも毎回増加するため、バッチジョブ全体の所要時間が大幅に長くなります。根本的な解決策はプロキシをバイパスすることです。
  </Accordion>

  <Accordion title="APIYIはサーバー側でこれを修正できますか？">
    できません。障害はお使いのマシンとAPIYIの間にあるプロキシで発生しています。リクエストがAPIYIに到達していないか、プロキシ自体が接続を閉じているため、サーバー側でできることはありません。
  </Accordion>

  <Accordion title="プロキシをバイパスしても502が発生します。どうすればよいですか？">
    まずヘッダーを確認してください。レスポンスに`Server`と`Date`が含まれ、HTMLまたはJSONの本文がある場合は、プラットフォーム側の502です。[ウェブサイトまたはAPIが502を返す](/ja/faq/website-502-error)を参照してください。継続して発生する場合は、障害発生時刻（タイムゾーン付き。例：`14:30 (UTC+8)`）と完全なレスポンスをサポートへ送信してください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="WebサイトまたはAPIが502を返す場合、どうすればよいですか？" icon="refresh-cw" href="/ja/faq/website-502-error">
    プラットフォーム側の502：短時間のコンテナ再起動で、約1分で復旧します
  </Card>

  <Card title="APIの利用にプロキシは必要ですか？" icon="wifi" href="/ja/faq/network-proxy">
    直接接続で利用できます。プロキシやVPNは不要です
  </Card>

  <Card title="Image APIのレイテンシを削減するにはどうすればよいですか？" icon="gauge" href="/ja/faq/image-api-network-latency-optimization">
    HTTPエンドポイント、接続の再利用、タイムアウト設定
  </Card>

  <Card title="APIのタイムアウトを回避するにはどうすればよいですか？" icon="timer" href="/ja/faq/timeout-configuration">
    タイムアウト設定とレイヤーごとのトラブルシューティング
  </Card>
</CardGroup>
