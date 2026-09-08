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

## タイムアウト早見表

| シナリオ                 | 推奨タイムアウト     | 推奨ノード                             | 備考                    |
| -------------------- | ------------ | --------------------------------- | --------------------- |
| 通常のテキストチャット（推論なし）    | 60-120s      | どのノードでも可                          | 通常は数秒で返ります            |
| 推論モデル（thinking / 推論） | **300-600s** | `api.apiyi.com` / `vip.apiyi.com` | ストリーミングの有無にかかわらず遅めです  |
| 長文出力（1万語超）           | **300s以上**   | `api.apiyi.com` / `vip.apiyi.com` | ❌ CDNノードではありません       |
| 画像生成 / 編集            | **360sを基準**  | `api.apiyi.com` / `vip.apiyi.com` | ❌ CDNノードではありません       |
| 4K画像、複数画像参照          | **600s**     | 上記と同じ                             | 画像のベストプラクティスを参照してください |

<Warning>
  **タイムアウトしたリクエストも課金されます**

  クライアントが切断された後も、サーバーと上流プロバイダーは**処理を最後まで完了し**、そのリクエストは**通常どおり課金されます**。

  言い換えると、**タイムアウトを低く設定しすぎると、料金を払って何も得られません**。もう少しで成功するリクエストが自分のクライアント側で切られないように、まずは安全な上限値を設定してください。
</Warning>

## 4つのポイントを詳しく

<AccordionGroup>
  <Accordion title="① 同期画像エンドポイント: タイムアウトを360秒に設定する">
    APIYIの画像モデルはすべて**同期型**です: リクエストを送信し、接続を維持すると、結果はレスポンスボディで返ってきます。非同期のtask IDやポーリング用エンドポイントはありません — 切断すると結果は失われます。

    **なぜデフォルト値では困るのか**: 一般的なHTTPクライアントのデフォルトは30〜60秒ですが、画像生成は本当に長いリクエストです:

    * GPT-Image-2 at `high` quality with 2K/4K takes 3-5 minutes in practice
    * Nano Banana 4K generation starts around 50 seconds and runs longer at peak
    * Multi-image reference tasks often exceed 5 minutes

    **推奨**: モデルのレイテンシが不明な場合は、**360秒**を基準値にしてください。4Kやマルチ画像参照のような重いタスクには**600秒**を確保してください。モデルごとの値は [画像APIのベストプラクティス](/ja/api-capabilities/image-api-best-practices) にあります。

    <Tip>
      ログでは画像が30秒で完了したのに、クライアントは5分待っていた、ということが時々あります — これは、ログの所要時間がゲートウェイの処理完了時点までしか記録されない一方で、ボディの到着完了と接続の終了シグナルを待っているためです。**タイムアウトを延ばしても必ずしも改善するとは限りません**: 低速ダウンロード系には有効ですが、データ自体はすでに完全で、終了シグナルだけが不足している場合には効果がありません。まずは [ログでは完了したのにクライアントには何も届かない](/ja/faq/log-duration-vs-client-wait) に従って一度計測し、その後で判断してください。
    </Tip>
  </Accordion>

  <Accordion title="② 推論モデル: ストリーミングの有無にかかわらず遅い">
    通常のテキストモデルは数秒で返るため、テキスト呼び出しではタイムアウト調整が不要だと思いがちです。**推論モデルは例外です**:

    * `gemini-3.1-pro-preview`
    * `gpt-5.6-sol`
    * `gpt-5.5-pro`（より高価で、より遅い）
    * 高いthinkingBudget（高いreasoning\_effort）で動作する任意のモデル

    これらのモデルは、回答を出す前に内部で長時間考えるため、**総レイテンシが数分になるのは普通です**。

    **重要なポイント: ストリーミングでは解決できません。** 多くの人は`stream=True`ならデータがすぐに届くと思いがちですが、推論モデルは思考フェーズ中にtokenをまったく出力しないことがあるため、読み取りタイムアウトはそれでも発生します — そして、最初のtokenから最後のtokenまでの**総**時間はやはり長いままです。

    **推奨**: 推論モデルには**300〜600秒**のタイムアウトを設定し、許容できる時間に合わせてthinkingBudgetの段階（`reasoning_effort` / `thinking`）を選んでください — より高い段階ほど、より大きな余裕が必要です。
  </Accordion>

  <Accordion title="③ ベースURLの選択: CDNノードでは長時間リクエストを処理できません">
    APIYIの`api-cf.apiyi.com`は**CloudflareのグローバルCDN**の前段にあります。海外からの高速化と低レイテンシを提供しますが、**約100秒のリクエストタイムアウト**があり、それを超えると`524`エラーになります。

    ⚠️ **これは画像エンドポイントだけの話ではありません。** 100秒を超える可能性がある呼び出しは、次のようにすべて相性がよくありません:

    * ❌ 画像生成 / 編集
    * ❌ 動画生成
    * ❌ 長文出力（長い記事、大規模翻訳、大きなコード生成）
    * ❌ 推論モデルでの深い思考タスク

    ✅ **適しているケース**: 100秒以内に完了する通常のチャットや短い生成。

    **推奨**: 長時間リクエストには`api.apiyi.com`（中国本土で推奨）または`vip.apiyi.com`（海外で推奨）を使用してください。ノードの完全比較は [ベースURLガイド](/ja/faq/base-url-config) をご覧ください。
  </Accordion>

  <Accordion title="④ 429の同時実行数制限に達した場合: サポートに連絡">
    タイムアウトに加えて`429 Too Many Requests`が頻発する場合、問題はたいてい**同時実行数クォータ**であり、タイムアウトではありません。

    同時実行数制限はアカウント全体ではなく、**モデルごと**に適用されます。特定のモデル — とくに新しくリリースされたものや供給が限られているもの — は、クォータが低い場合があります。

    **対応方法:**

    1. バーストで制限を飽和させないよう、指数バックオフを実装する
    2. 429が続く場合は、**APIYIサポートに連絡してください** — こちらでそのモデルの実際のクォータを確認し、調整をお手伝いできます

    ルールについては [どれくらいの同時実行数を使えますか？](/ja/faq/api-concurrency) をご覧ください。
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

## タイムアウトを延長してもまだタイムアウトする場合は？ 各ホップを確認してください

<Steps>
  <Step title="ステップ 1: SDK のタイムアウトが実際に適用されているか確認する">
    一部のフレームワークは、HTTP クライアントの周囲に別のタイムアウトを重ねます。有効な設定を出力し、変更したパラメータが実際に使われていることを確認してください。
  </Step>

  <Step title="ステップ 2: 経路上のすべてのホップを確認する">
    生成時間より短いタイムアウトを持つレイヤーは、クライアントより先に切断されます:

    * 自己ホスト型リバースプロキシ: Nginx `proxy_read_timeout` (既定では60秒)
    * クラウドロードバランサー: アイドル接続タイムアウト
    * API ゲートウェイ / CDN: オリジンタイムアウト
    * サーバーレス関数: 実行上限 (既定では多くの場合30〜60秒)
    * タスクキューワーカー: タスクごとのタイムアウト

    **すべてのホップでタイムアウトを広げる必要があります** — クライアントだけを変更しても何も変わりません。
  </Step>

  <Step title="ステップ 3: CDN ノード上にいないことを確認する">
    ベース URL が`api-cf.apiyi.com`か確認してください。長時間かかるリクエストでは、`api.apiyi.com`または`vip.apiyi.com`に切り替えてください。

    目安として、**`524`** は、ほとんどの場合、遅いモデルではなく Cloudflare レイヤーのタイムアウトを意味します。
  </Step>

  <Step title="ステップ 4: タイムアウトと同時実行数制限を区別する">
    ステータスコードを確認してください: `524` と切断された接続はタイムアウトの問題であり、`429` はクォータの問題です。対処法はまったく異なります。
  </Step>

  <Step title="ステップ 5: 実際のレイテンシーをコールログで確認する">
    コンソールの [call logs](/ja/faq/call-logs) で、そのリクエストの実際の所要時間と課金を確認し、そこから適切なタイムアウトを導き出してください。
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
