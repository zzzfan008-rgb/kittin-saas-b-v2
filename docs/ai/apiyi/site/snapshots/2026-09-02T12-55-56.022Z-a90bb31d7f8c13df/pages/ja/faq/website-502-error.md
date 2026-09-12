> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# WebサイトまたはAPIが 502 を返す — どうすればよいですか？

> 502 はサービスコンテナの自動再起動が原因で一時的に発生する症状で、通常は1分以内に解消します。失敗した呼び出しは課金されず、30秒間のクライアント再試行でシームレスに乗り切れます

## 簡単な答え

<Info>
  **502 は一時的なものです — お客様側で設定変更は不要です:**

  1. **根本原因はサービスコンテナの自動再起動です** — 再起動中は Web コンソールにアクセスできず、API は 502 を返します。これらは同じ事象です。
  2. **復旧は通常 1 分以内に自動で行われます** — 30〜60 秒待ってから、リクエストを再送してください。
  3. **失敗した呼び出しは課金されません** — 502 の間はリクエストが実際にサービスへ到達しないため、課金レコードは作成されません。
  4. **クライアント側で自動リトライを追加してください** — 約 30 秒後に 1 回リトライすれば、再起動ウィンドウ全体をシームレスに乗り切れます。
</Info>

## 何が起きているのか

`502 Bad Gateway` とは、**ゲートウェイ層はリクエストを受け取ったものの、バックエンドサービスへ転送した際に応答を受け取れなかった**ことを意味します。

APIYI では、一時的な 502 の大半は **バックエンドサービスのコンテナが自動再起動したこと**が原因です。バックエンドプロセスが一時的に利用できない間は、次のようになります。

* **Web コンソール**（ダッシュボード、チャージページなど）が読み込めない、またはエラーを表示する
* **API**（`api.apiyi.com` およびその他すべてのエンドポイント）が 502 を返す

どちらも同じサービスで動作しているため、**同時に失敗し、同時に復旧します**。異常が検出されると、システムは自動的に再起動を完了します。処理全体は、**通常 1 分以内に完了し**、手動介入は不要です。

<Note>
  **この種の 502 は、コード、キー、残高、またはネットワーク設定とは一切関係ありません。** 初めてこのエラーを目にした場合、クライアント側でデバッグすることはありません。30〜60 秒待って再試行してください。大半の場合、サービスはすでに復旧しています。
</Note>

## 実施すべきこと

<Steps>
  <Step title="手順 1: 30〜60 秒待ってから、リクエストを再送信してください">
    コンテナの再起動は通常 1 分以内に完了します。失敗した API 呼び出しは課金されないため、再試行しても二重課金は発生しません。
  </Step>

  <Step title="手順 2: Web コンソールが読み込まれない場合は、ページを強制再読み込みしてください">
    復旧後も、ブラウザーにキャッシュされたエラーページが表示されることがあります。**Ctrl+Shift+R**（Windows）または **Cmd+Shift+R**（Mac）を使用して強制再読み込みし、通常のインターフェースを表示してください。
  </Step>

  <Step title="手順 3: 502 が 5 分以上続く場合は、サポートに連絡してください">
    一時的な再起動は通常数分以上は続きません。502 が **5 分以上続く** 場合は、通常の自動再起動ではありません。— このページ下部の連絡方法からご連絡いただき、発生したおおよその時刻（タイムゾーン付き、例: `14:30 (UTC+8)`）も併せてお知らせください。
  </Step>
</Steps>

## プログラムからの呼び出しに自動リトライを追加する

可用性に敏感なワークロードでは、502 のような一時的なエラーに対して、クライアント側で自動リトライを追加してください。30秒ほど後に1回再試行すれば、再起動ウィンドウ全体をカバーできます。

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import time
    from openai import OpenAI, InternalServerError

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",
        max_retries=0,  # disable SDK default retries; the logic below takes over
    )

    def chat_with_retry(messages, retries=2, wait=30):
        for attempt in range(retries + 1):
            try:
                return client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                )
            except InternalServerError:
                # 502 / 503 and other 5xx: the request never reached the
                # service and is not billed, so retrying is always safe
                if attempt == retries:
                    raise
                time.sleep(wait)  # restarts finish within ~1 min; wait 30s

    resp = chat_with_retry([{"role": "user", "content": "Hello"}])
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      maxRetries: 0, // disable SDK default retries; the logic below takes over
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function chatWithRetry(messages, retries = 2, waitMs = 30_000) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await client.chat.completions.create({
            model: "gpt-4o",
            messages,
          });
        } catch (err) {
          // 502 / 503 and other 5xx: the request never reached the
          // service and is not billed, so retrying is always safe
          if (err.status < 500 || attempt >= retries) throw err;
          await sleep(waitMs); // restarts finish within ~1 min; wait 30s
        }
      }
    }

    const resp = await chatWithRetry([{ role: "user", content: "Hello" }]);
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # curl's --retry automatically retries transient errors like 502/503/504
    curl https://api.apiyi.com/v1/chat/completions \
      --retry 2 --retry-delay 30 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Hello"}]
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **このリトライ戦略は、リクエストがサービスに到達しなかった 502/503 系のエラーにのみ適用してください。** クライアントのタイムアウト（または `524`）で中断されたリクエストは、サーバー側ではまだ実行中である可能性があり、通常どおり課金されます。そうしたリクエストを無条件に再試行すると、重複課金の原因になります。その種の問題については、[API タイムアウトを回避する方法](/ja/faq/timeout-configuration) を参照してください。
</Warning>

<Tip>
  高頻度のワークロードでは、**指数バックオフ**（1秒、次に2秒、次に4秒）を使って素早く試行することもできます。ネットワークの一時的な不調による 502 は、たいてい数秒で解消します。それでもこれらの試行が失敗する場合は、コンテナ再起動のケースに備えて 30秒間隔に切り替えてください。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="502 が発生したときに送信したリクエストは課金されますか？">
    **いいえ。** 502 は、リクエストが実際にはバックエンドサービスに到達していないことを意味します。モデルの利用は発生していないため、**課金記録には何も表示されません**。

    これは診断にも便利です。失敗したリクエストが [呼び出しログ](/ja/faq/call-logs) に課金エントリとして記録されていなければ、サーバー側では処理されていません。そのまま再送して問題ありません。
  </Accordion>

  <Accordion title="502 は、タイムアウト、429、524 とどう違うのですか？">
    * **`502`**: バックエンドサービスが一時的に利用できません（コンテナの再起動中です）。30〜60 秒待ってから再試行してください。課金されません。
    * **タイムアウト / 切断された接続**: クライアントのタイムアウトが短すぎます。サーバー側では、リクエストを引き続き実行中で、通常どおり課金している可能性があります。[API タイムアウトを回避する方法](/ja/faq/timeout-configuration) をご覧ください。
    * **`429`**: 同時実行数またはレート制限に達しています。サービスの可用性とは無関係です。[API 同時実行数の制限](/ja/faq/api-concurrency) をご覧ください。
    * **`524`**: 100 秒前後を超えるリクエストで `api-cf.apiyi.com` の CDN エンドポイントを使用しています。エンドポイントを切り替えてください。

    これらにはまったく異なる対応が必要です。**直接再試行すべきなのは 502/503 のみです**。
  </Accordion>

  <Accordion title="ウェブコンソールと API が同時に失敗するのはなぜですか？">
    ウェブコンソールと API は同じサービスで支えられています。コンテナの再起動中は、両方が**同時に利用不可になり、同時に復旧します**。そのため、「ウェブサイトもダウンしている」という状況こそが、これはクライアント設定の問題ではなく、一時的なプラットフォーム側の事象であることの確認になります。
  </Accordion>

  <Accordion title="これは頻繁に起こりますか？">
    いいえ。定常的に発生するものではありません。一時的な 502 は、通常、急激なトラフィックの急増に関連しており、散発的に発生します。

    **2026 年 8 月時点で、バックエンドサーバーのアップグレードとスケールアップを進めています**。これにより、こうした一時的な 502 の発生頻度は大幅に減少します。プラットフォーム側で障害が発生した場合は、その都度ただちに [リアルタイムのステータスフィード](/en/live) でステータス更新と復旧状況を公開します。
  </Accordion>

  <Accordion title="プラットフォーム側の問題か、自分のネットワークの問題かをどう見分ければよいですか？">
    すぐに確認できる方法は 2 つあります。

    1. **ウェブコンソールを開く**: `api.apiyi.com` が 502 を返し、コンソールも読み込めない場合は、ほぼ間違いなく一時的なプラットフォーム側の再起動です。1 分ほど待ってください。
    2. **ネットワークを切り替える**: モバイルデータ（別のキャリア）を使ってコンソールを読み込むか、以下のコマンドを実行してください。そこで動作するなら、問題はローカルネットワークまたはプロキシです。

    ```bash theme={null}
    curl -I https://api.apiyi.com/v1/models \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

    それでも別のネットワークで 5 分以上ずっと 502 が返る場合は、サポートにお問い合わせください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="API タイムアウトを回避する方法" icon="timer" href="/ja/faq/timeout-configuration">
    タイムアウト設定、推論モデルの遅延、524 の診断
  </Card>

  <Card title="API を使用するのにプロキシは必要ですか?" icon="wifi" href="/ja/faq/network-proxy">
    直結接続の注意点とネットワーク要件
  </Card>

  <Card title="APIYI のサーバーはどこにありますか?" icon="server" href="/ja/faq/server-location">
    ノードの所在地、レイテンシーのテスト、購入に関するアドバイス
  </Card>

  <Card title="サービス可用性と SLA" icon="shield-check" href="/ja/faq/sla-guarantee">
    可用性のコミットメントとインシデント対応
  </Card>
</CardGroup>

## お問い合わせ

<CardGroup cols={2}>
  <Card title="WeCom サポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom サポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、このカードをクリックしてサポートへ直接お問い合わせください

    継続的な 502 の報告とインシデントの切り分け
  </Card>

  <Card title="メール" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **ビジネス**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
