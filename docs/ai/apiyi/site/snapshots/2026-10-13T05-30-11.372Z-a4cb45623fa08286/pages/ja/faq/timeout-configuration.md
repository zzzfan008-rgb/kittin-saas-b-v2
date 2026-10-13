> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API タイムアウトを回避するには？

> クライアントのタイムアウト設定、推論モデルが実際どれほど遅いか、適切な Base URL ノードの選び方、そして 429 の同時実行数チェック - タイムアウトを回避するための 4 つの鍵

## 簡潔な回答

<Info>
  **タイムアウト問題の90%をカバーする3つの黄金ルール:**

  1. **同期型の画像生成エンドポイントには 360 秒のタイムアウトを設定します。** 画像生成には非同期タスク ID がないため、早く切断すると課金はされるのに画像は取得できません。
  2. **推論モデルには十分な時間を与えます。** `gemini-3.1-pro-preview`、`gpt-5.6-sol`、`gpt-5.5-pro` は、stream するかどうかに関係なく、数分かかることがあります。
  3. **長時間のリクエストを CDN ノード経由で実行しないでください。** `api-cf.apiyi.com` は Cloudflare の背後にあり、約 100 秒を超えると `524` を返します。高速なテキスト呼び出しにのみ適しています。

  別件ですが、特定のモデルが `429`（同時実行数不足）を返し続ける場合は、サポートに連絡してクォータを確認してもらってください。
</Info>

## タイムアウトチートシート

| シナリオ | 推奨タイムアウト | 推奨ノード | 備考 |
| - | - | - | - |
| 通常のテキストチャット（非推論） | 60〜120秒 | 任意のノード | 通常は数秒で応答 |
| 推論モデル（思考 / 推論） | **300〜600秒** | `api.apiyi.com` / `b.apiyi.com` | ストリーミングの有無にかかわらず低速 |
| 長文テキスト出力（1万語以上） | **300秒以上** | `api.apiyi.com` / `b.apiyi.com` | ❌ CDNノードは不可 |
| 画像生成 / 編集 | **基準 360秒** | `api.apiyi.com` / `b.apiyi.com` | ❌ CDNノードは不可 |
| 4K画像、複数画像参照 | **600秒** | 同上 | 画像のベストプラクティスを参照 |

<Warning>
  **タイムアウトしたリクエストも課金されます**

  クライアントが切断された後も、サーバーおよび上流プロバイダーは**処理を最後まで完了**し、そのリクエストには**通常通り課金されます**。

  言い換えれば、**タイムアウトを短く設定しすぎると、料金を支払ったのに何も得られない**ことになります。成功寸前のリクエストがクライアント側によって中断されてしまわないよう、あらかじめ余裕を持った安全な上限値を設定してください。
</Warning>

## 4つの重要ポイントの詳細

<AccordionGroup>
  <Accordion title="① 同期画像エンドポイント：タイムアウトを360秒に設定">
    APIYIのすべての画像モデルは**同期型**です。リクエストを送信して接続を維持すると、レスポンスボディで結果が返されます。非同期タスクIDやポーリング用のエンドポイントは存在しないため、接続が切断されると結果は失われます。

    **デフォルト値が問題となる理由**：主要なHTTPクライアントのデフォルト値は30〜60秒ですが、画像生成は本質的に長時間の処理を伴うリクエストです。

    * GPT-Image-2で2K/4Kかつ`high`品質の場合、実際には3〜5分かかります
    * Nano Bananaの4K生成は約50秒から始まり、ピーク時にはさらに長くかかります
    * 複数画像を参照するタスクは多くの場合5分を超えます

    **推奨事項**：モデルのレイテンシーが不明な場合は、ベースラインとして**360秒**を設定してください。4Kや複数画像参照などの重いタスクには**600秒**を確保してください。モデルごとの値については、[画像APIのベストプラクティス](/ja/api-capabilities/image-api-best-practices)を参照してください。

    <Tip>
      ログ上では画像が30秒で完了したと表示されているにもかかわらず、クライアントが5分間待機することが稀にあります。これは、ログの所要時間がゲートウェイの処理完了時点までしか計測されないのに対し、クライアントはボディの受信完了と接続の完了シグナルを待つためです。**タイムアウトを延長することが常に有効とは限りません**。ダウンロードが遅いケースには有効ですが、データがすでに完了していて完了シグナルのみが欠落している場合には効果がありません。[ログでは完了と表示されているのにクライアント側で何も受信できない](/ja/faq/log-duration-vs-client-wait)に従って一度計測した上で判断してください。
    </Tip>
  </Accordion>

  <Accordion title="② 推論／長文出力モデル：非ストリーミングでは維持不可、ストリーミングを使用">
    通常のテキストモデルは数秒で応答するため、テキスト呼び出しではタイムアウトの調整が不要だと思われがちです。**しかし、推論モデルや、1回の呼び出しで数万文字を出力するようなワークロードは例外です：**

    * `gemini-3.1-pro-preview`
    * `gpt-5.6-sol`
    * `gpt-5.5-pro`（高価格かつ低速）
    * `claude-opus-5`およびディープシンキング／高エフォートを実行するその他のモデル
    * 長文出力タスク：ドラマの脚本、小説、長文翻訳、大規模なコード生成

    これらの呼び出しは長時間推論を行った後、トークンごとに長い本文を出力するため、**合計レイテンシーが10分以上になることも珍しくありません**。

    **重要ポイント：非ストリーミングでは接続を維持できませんが、適切な読み取りタイムアウトを設定したストリーミングを使用することで解決できます。** 非ストリーミングでは生成全体がバッファリングされてから一括送信されるため、読み取りタイムアウトが生成全体の時間と競合し、わずかな不具合でも切断されてしまいます。ストリーミングを使用すると、最初のバイトが数秒以内に届き、その後は数十秒ごとにデータイベントが到着します（推論中の無音ギャップの実測最大値は約42秒で、合間にキープアライブpingが挟まれます）。そのため、読み取りタイムアウトは合計時間ではなく、*イベント間のギャップ*のみをカバーすれば十分です。

    **推奨事項**：

    * **長文出力にはストリーミングを推奨します**（`stream=True`）。読み取りタイムアウトは生成全体をカバーする巨大な値ではなく、イベント間のギャップに合わせた**90〜120秒**に設定してください。
    * 非ストリーミングを維持する必要がある場合は、タイムアウトを**300〜600秒**に設定し、不安定さを許容してください。実行時間が長くなるほど、結果が届く前に切断される可能性が高くなります。
    * 許容した時間に合わせて思考ティア（`reasoning_effort` / `thinking`）を調整してください。上位のティアほど余裕を持った時間が必要です。

    長文出力の完全なレシピ（ストリーミングコード、max\_tokens、stop\_reason、リトライ）については、[長文出力の実践](/ja/api-capabilities/long-form-output-practices)を参照してください。
  </Accordion>

  <Accordion title="③ Base URLの選択：CDNノードは長時間リクエストに対応不可">
    APIYIの`api-cf.apiyi.com`は、**CloudflareグローバルCDN**をフロントに配置しています。世界規模の高速化と海外からの低レイテンシーを提供しますが、**リクエストタイムアウトは約100秒**であり、これを超えると`524`エラーが発生します。

    ⚠️ **これは画像エンドポイントだけに影響するわけではありません。** 100秒を超える可能性のあるすべての呼び出しには適していません。これには以下が含まれます：

    * ❌ 画像生成／編集
    * ❌ 動画生成
    * ❌ 長文テキスト出力（長文記事、大規模翻訳、巨大なコード生成）
    * ❌ 推論モデルでのディープシンキングタスク

    ✅ **適している用途**：100秒以内に完了する通常のチャットや短時間の生成。

    **推奨事項**：長時間のリクエストには`api.apiyi.com`（またはバックアップの`b.apiyi.com`）を使用してください。全ノードの比較については[Base URLガイド](/ja/faq/base-url-config)を参照してください。
  </Accordion>

  <Accordion title="④ 429同時実行数制限への到達：サポートにお問い合わせください">
    頻繁な`429 Too Many Requests`とともにタイムアウトが発生する場合、問題は通常タイムアウトの設定ではなく**同時実行数クォータ**にあります。

    同時実行数制限はアカウント全体ではなく、**モデルごと**に適用されます。特定のモデル（特に新規リリースされたモデルや供給が制限されているモデル）は、クォータが低く設定されている場合があります。

    **対処方法：**

    1. 一時的なスパイクで制限に達しないよう、指数バックオフを実装する
    2. 429エラーが解消しない場合は、**APIYIサポートにお問い合わせください** — 該当モデルの実際のクォータを確認し、調整をサポートいたします

    ルールについては[どれくらいの同時実行数を利用できますか？](/ja/faq/api-concurrency)を参照してください。
  </Accordion>
</AccordionGroup>

## コード例

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",  # not the api-cf node for long requests
    )

    # Tier your timeouts by scenario (seconds) instead of one global value
    TIMEOUTS = {
        "text":      120,   # regular text
        "reasoning": 600,   # reasoning models
        "image":     360,   # image generation baseline
        "image_4k":  600,   # 4K / multi-image reference
    }

    resp = client.chat.completions.create(
        model="gpt-5.6-sol",
        messages=[{"role": "user", "content": "Analyze the complexity of this code"}],
        timeout=TIMEOUTS["reasoning"],   # 600s for reasoning models
    )
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      timeout: 600 * 1000,   // milliseconds — 600s for reasoning models
      maxRetries: 0,         // avoid auto-retry on long requests: it double-bills
    });

    const resp = await client.chat.completions.create({
      model: "gemini-3.1-pro-preview",
      messages: [{ role: "user", content: "Write an 8000-word technical analysis" }],
    });
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # --max-time caps the total request duration in seconds
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      --max-time 360 \
      -d '{
        "model": "gpt-image-2",
        "prompt": "a serene mountain lake at sunrise",
        "size": "2048x2048"
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **長時間のリクエストで自動再試行に注意してください**: 多くの SDK はデフォルトで 2 回再試行します。画像生成や推論タスクがタイムアウトして再試行されると、何も得られないまま 3 回分課金される可能性があります。`max_retries` を 0 に設定し、再試行はご自身のアプリケーションロジックで制御してください。
</Warning>

## タイムアウトを延長してもまだタイムアウトが発生しますか？すべてのホップを確認してください

<Steps>
  <Step title="ステップ1：SDKのタイムアウトが実際に適用されているか確認する">
    一部のフレームワークは、HTTPクライアントを別のタイムアウトでラップしています。有効な設定を出力し、変更したパラメータが実際に使用されていることを確認してください。
  </Step>

  <Step title="ステップ2：経路上にあるすべてのホップを確認する">
    生成時間よりも短いタイムアウトが設定されているレイヤーが存在すると、クライアントよりも先に切断されてしまいます：

    * セルフホストのリバースプロキシ：Nginx `proxy_read_timeout`（デフォルトで60秒）
    * クラウドロードバランサー：アイドル接続タイムアウト
    * APIゲートウェイ / CDN：オリジンタイムアウト
    * サーバーレス関数：実行時間制限（多くの場合デフォルトで30〜60秒）
    * タスクキューワーカー：タスクごとのタイムアウト

    **すべてのホップの制限を緩和する必要があります** — クライアント側だけを変更しても効果はありません。
  </Step>

  <Step title="ステップ3：CDNノード経由になっていないか確認する">
    Base URL が `api-cf.apiyi.com` になっていないか確認してください。実行時間の長いリクエストの場合は、`api.apiyi.com` または `b.apiyi.com` に切り替えてください。

    経験則：**`524`** は、モデルの応答が遅いのではなく、ほぼ確実にCloudflareレイヤーでのタイムアウトを意味します。
  </Step>

  <Step title="ステップ4：タイムアウトと同時実行数の制限を区別する">
    ステータスコードを確認してください：`524` や接続の切断はタイムアウトの問題ですが、`429` はクォータの問題です。対処法はまったく異なります。
  </Step>

  <Step title="ステップ5：呼び出しログで実際のレイテンシを確認する">
    コンソールの[呼び出しログ](/ja/faq/call-logs)でリクエストの実際の所要時間と課金を確認し、それに基づいて適切なタイムアウト値を導き出してください。
  </Step>
</Steps>

## よくある質問

<AccordionGroup>
  <Accordion title="タイムアウトしたリクエストの返金は受けられますか？">
    いいえ。クライアントが切断されても、サーバーと上流側はジョブを最後まで完了するため、費用は実際に発生します。

    正しい対応は、小さな値で試してリトライに頼るのではなく、**タイムアウトを最初から安全な上限まで一気に設定する**ことです。リトライは請求額を増やすだけです。
  </Accordion>

  <Accordion title="切断後に ID で結果を取得できる非同期エンドポイントを提供できますか？">
    画像エンドポイントは現在 **同期パススルーモード** で動作しており、当社ではお客様の業務データを保存しないため、切断後に ID で取得することはできません。

    推奨パターンは、同期呼び出し + 余裕のあるタイムアウト + 独自のタスク状態テーブルです。実質的には軽量な非同期キューです。[画像エンドポイントは同期ですか、それとも非同期ですか？](/ja/faq/image-async-api)

    動画モデルは最初から非同期であり、これには影響されません。
  </Accordion>

  <Accordion title="ストリーミングはタイムアウトを防ぎますか？">
    **一部はそうですが、頼り切らないでください。**

    ストリーミングは最初の token をより早く返すため、完全な応答なしになるリスクを下げます。ただし reasoning モデルは思考フェーズ中に何も出力しない場合があり、その場合でも読み取りタイムアウトは発火しますし、全体の出力時間は結局同じくらいかかります。

    正しい対応は、ストリーミング **に加えて** 余裕のあるタイムアウトを設定することです。
  </Accordion>

  <Accordion title="非常に大きいタイムアウトを設定するデメリットはありますか？">
    課金への影響はありません。**課金されるのは消費した token と呼び出しであり、待った時間ではありません。**

    懸念があるのはお客様側のリソース使用だけです。長い接続はワーカーまたはコネクションプールのスロットを占有します。同時実行数が多い場合は、画像生成と reasoning リクエストを async IO か専用の長時間タスクキューで処理してください。
  </Accordion>

  <Accordion title="524 と 429 の違いは何ですか？">
    * **`524`**: Cloudflare レイヤーのタイムアウトで、`api-cf.apiyi.com` を使っており、リクエストが約 100 秒を超えたことを意味します。ノードを切り替えてください。
    * **`429`**: 同時実行数または rate limit によるもので、所要時間とは関係ありません。指数バックオフを追加し、継続する場合はサポートへ連絡してください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Image APIのベストプラクティス" icon="image" href="/ja/api-capabilities/image-api-best-practices">
    モデルごとのタイムアウト表と出力形式のリファレンス
  </Card>

  <Card title="Base URL はどのように設定しますか？" icon="link" href="/ja/faq/base-url-config">
    4つのノードの違いと選び方
  </Card>

  <Card title="画像エンドポイントは同期ですか、それとも非同期ですか？" icon="refresh-cw" href="/ja/faq/image-async-api">
    同期モードとクライアント側のタスク管理
  </Card>

  <Card title="どの程度の同時実行数を使えますか？" icon="gauge" href="/ja/faq/api-concurrency">
    モデル種別ごとの同時実行数の制限とクォータ申請
  </Card>
</CardGroup>

## お問い合わせ

<CardGroup cols={2}>
  <Card title="WeCom サポート" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom サポートのQRコード" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QRコードをスキャンするか、[クリックしてサポートに連絡](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    タイムアウトのトラブルシューティングと同時実行数クォータの申請
  </Card>

  <Card title="メール" icon="mail">
    **サポート**: [support@apiyi.com](mailto:support@apiyi.com)

    **営業**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.