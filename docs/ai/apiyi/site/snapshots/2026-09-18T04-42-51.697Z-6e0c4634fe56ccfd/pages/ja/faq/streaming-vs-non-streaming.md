> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ストリーミング呼び出しと非ストリーミング呼び出しの違いは何ですか？

> 同じキーで、あるときはストリーミング応答になり、別のときは非ストリーミングになる理由、2つのモードの違い、それぞれどのようなシナリオに向いているか、導入の手間、課金、そしてよくある6つの誤解について説明します。

## 簡潔な答え

<Info>
  **3つの文:**

  1. **ストリーミングと非ストリーミングの違いは、完全にあなた自身のコードで決まります**—リクエストボディ内の `stream` フィールドです。同じキー、同じモデル、同じエンドポイントでも、前後で切り替わるなら、切り替えているのはクライアントコード（またはそれをラップしている SDK / フレームワーク）です。**ゲートウェイが勝手に切り替えることはありません。**
  2. **どちらのモードでも最終的な内容は同一で、課金も同じです。** 違いは、テキストを**いつ**受け取るかと、**どう**パースするかだけです。
  3. **選び方**: 画面を人間が見ている → ストリーミング; プログラムが結果を消費する（JSON のパース、バッチジョブ、ツール呼び出し） → 非ストリーミング。
</Info>

## 一目でわかる違い

| Aspect            | ストリーミング `stream: true`                                                 | 非ストリーミング（デフォルト）                             |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| リクエストパラメータ        | `stream: true`                                                         | 省略、または `stream: false`                      |
| レスポンス形式           | SSE イベントストリーム（`text/event-stream`）、多数の `data:` チャンク、`data: [DONE]` で終了 | 1つの完全な JSON オブジェクト                          |
| テキストの読み取り         | `choices[0].delta.content` をチャンクごとに蓄積する                                | `choices[0].message.content` を直接読む          |
| 最初のバイトまでの時間（TTFB） | 速く、通常のモデルでは通常 1〜3 s                                                    | ≈ 総生成時間                                     |
| 総レイテンシ            | 非ストリーミングとほぼ同じ                                                          | ストリーミングとほぼ同じ                                |
| `usage`           | **デフォルトでは返されません**; `stream_options: {"include_usage": true}` が必要です     | レスポンス本文に常に含まれます                             |
| エラーの形             | 接続はすでに開いているため、エラーはストリーム中に発生することがあり、read ループ内で処理する必要があります               | 1つの HTTP ステータスコード + エラー JSON — 最もシンプルなケースです |
| 長い無音の間隔           | まれです（データが流れ続けます）                                                       | よくあります（接続は生成中ずっと無音です）                       |
| 統合の手間             | 中程度: 増分組み立て、SSE パース、バッファリング無効化                                         | 低い: 1回のリクエスト、1回のパース                         |
| 課金                | token ごと                                                               | **まったく同じ**                                  |
| コンソールログ           | `is_stream = true`                                                     | `is_stream = false`                         |

## なぜ私のリクエストはストリーミングと非ストリーミングの間で切り替わるのですか？

これは最もよくある質問で、答えは **お客様側の何かがそれを変えています。** 以下の一覧を順に確認してください — ほぼ必ずどれかが当てはまります:

<AccordionGroup>
  <Accordion title="1. `stream` はコード内の変数または設定値です">
    典型的なケースは、`stream=config.get("stream", False)` または `stream=is_web_request` です。異なるエントリポイントから同じ関数に異なる値が渡されるため、ログ上はモードがランダムに切り替わっているように見えます。

    **確認方法**: 実際に送信しているリクエストボディを出力し、`stream` フィールドを確認してください。
  </Accordion>

  <Accordion title="2. 異なる SDK とフレームワークではデフォルトが異なります">
    同じビジネスロジックでも、クライアントによって挙動が異なります:

    * OpenAI SDK `chat.completions.create()`: 既定では **非ストリーミング**
    * `client.chat.completions.stream()` または `with_streaming_response`: **ストリーミング**
    * LangChain / LlamaIndex のようなラッパー: `invoke` と `stream` のどちらを呼ぶか、またモデルオブジェクトを生成するときに `streaming=True` を渡したかどうかによって異なります
    * デスクトップクライアント、エージェントツール、ワークフロープラットフォームでは、通常、設定に「ストリーミング出力」の切り替えがあり、既定値はさまざまです

    **確認方法**: 実際にその呼び出しを行ったエントリポイントを確認してください。
  </Accordion>

  <Accordion title="3. 複数のアプリケーションで共有されている 1 つのキー">
    Web チャット UI（ストリーミング）と夜間のバッチジョブ（非ストリーミング）の両方で同じキーを使うと、一緒に見るとランダムに見えるログが生成されます。

    **確認方法**: ユースケースごとに個別の token を作成してください — するとログも分かれて表示されます。[token 管理](/ja/faq/token-management)を参照してください。
  </Accordion>

  <Accordion title="4. ミドルボックスがストリームを平坦化しました">
    実際には `stream: true` を送信しているのですが、Nginx、社内ゲートウェイ、または何らかのプロキシがレスポンスを **バッファリング** していました — サーバーはチャンクごとに送り、プロキシがそれを保持して一度に放出したため、非ストリーミングのように見えます。

    **確認方法**: 一度プロキシをバイパスしてテストし、Nginx のバッファリングをオフにしてください（`proxy_buffering off;`）。この場合でも、ゲートウェイが実際にストリーミングで出力しているため、コンソールログには引き続き `is_stream = true` と表示されます。
  </Accordion>
</AccordionGroup>

<Tip>
  **特定の呼び出しが実際に何を行ったかを確認するには**: コンソールログの `is_stream` フィールドを確認するか、[ログクエリ API](/ja/api-capabilities/log-query) で一括取得してください。それが信頼できる唯一の情報源であり、印象よりはるかに確実です。
</Tip>

## シナリオ別の選択

<CardGroup cols={2}>
  <Card title="ストリーミングを使用" icon="zap">
    * チャットUIやサポートボット — ユーザーはすぐにフィードバックを必要とします
    * IDEプラグイン／コーディングアシスタント（Claude Code、Cursorなど）
    * 長文生成（長い記事、長い翻訳、大きなコードブロック）
    * 長時間の推論モデルタスク — 少なくとも進行状況を確認できます
    * 生成途中でユーザーが「停止」を実行できるあらゆる場面
  </Card>

  <Card title="非ストリーミングを使用" icon="package">
    * 構造化出力：`json.loads()`のJSON全体が必要な場合
    * function calling／tool callの引数の解析
    * バッチ処理、オフラインジョブ、スケジュールされたタスク
    * 最終結果だけが重要で、待機しているユーザーがいないバックエンドフロー
    * 簡単な検証、デバッグ、テストケースの作成
  </Card>
</CardGroup>

いくつかの特殊なケース：

| シナリオ             | 推奨事項           | 注記                                                                                                           |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| 画像生成／編集          | 非ストリーミング       | OpenAI互換の`/v1/images/generations`は`stream`を受け付けません。Geminiのネイティブ画像APIには別の`:streamGenerateContent`エンドポイントがあります |
| 動画生成             | ストリーミングとは無関係   | 非同期タスク＋ポーリング。[非同期画像／動画API](/ja/faq/image-async-api)を参照してください                                                 |
| Embedding／Rerank | 非ストリーミング       | これらのエンドポイントにはストリーミングの概念がありません                                                                                |
| 推論／長文出力モデル       | **ストリーミングを推奨** | 推論中は無通信の間隔が発生しますが、キープアライブがあるため、読み取りタイムアウトはイベント間隔に合わせて設定してください — 下記の誤解1を参照してください                              |

## 統合の手間: 同じタスクを、両方の方法で

<Tabs>
  <Tab title="Python 非ストリーミング">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-apiyi-key",
        base_url="https://api.apiyi.com/v1",
    )

    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Explain quantum computing"}],
        timeout=120,
    )

    # Full text in one line
    print(resp.choices[0].message.content)
    # usage is right there in the response body
    print(resp.usage.total_tokens)
    ```
  </Tab>

  <Tab title="Python ストリーミング">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-apiyi-key",
        base_url="https://api.apiyi.com/v1",
    )

    stream = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Explain quantum computing"}],
        stream=True,
        stream_options={"include_usage": True},   # without this, no usage
        timeout=120,
    )

    chunks = []
    for chunk in stream:
        # the final usage chunk has an empty choices array — check before indexing
        if chunk.choices and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            chunks.append(piece)
            print(piece, end="", flush=True)
        if chunk.usage:
            print(f"\nUsage: {chunk.usage.total_tokens} tokens")

    full_text = "".join(chunks)   # assemble it yourself if you need the whole thing
    ```
  </Tab>

  <Tab title="Node.js ストリーミング">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: "sk-your-apiyi-key",
      baseURL: "https://api.apiyi.com/v1",
    });

    const stream = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [{ role: "user", content: "Explain quantum computing" }],
      stream: true,
      stream_options: { include_usage: true },
    });

    let full = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        process.stdout.write(delta);
      }
      if (chunk.usage) console.log("\nUsage:", chunk.usage.total_tokens);
    }
    ```
  </Tab>

  <Tab title="cURLを並べて比較">
    ```bash theme={null}
    # Non-streaming: one complete JSON
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "Hello"}]
      }'

    # Streaming: a series of data: chunks, ending with data: [DONE]
    # -N disables curl's own buffering, otherwise it still looks like one blob
    curl -N https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": true,
        "stream_options": {"include_usage": true}
      }'
    ```
  </Tab>
</Tabs>

<Note>
  **Claude のネイティブ形式（`/v1/messages`）は別のストリーミングプロトコルを使用します**: Anthropic の名前付きイベント SSE（`message_start` / `content_block_delta` / `message_delta` など）であり、OpenAI の一様な `data:` チャンクではなく、`usage` は `message_start` と `message_delta` のイベントに分割されます。完全なパースガイド: [Claude ネイティブ形式: ストリーミングおよび非ストリーミングのレスポンス](/ja/api-capabilities/claude-response-handling)。
</Note>

## 課金と使用量: どちらでも同じ

<Warning>
  **ストリーミングは安くも高くもなりません。** 課金は token ごとで、バイトがどのように転送されるかとは関係ありません。

  **途中で切断しても課金されます**—`Ctrl+C` に到達した後、またはクライアントがタイムアウトした後でも、上流側の生成は最後まで実行され、リクエストは通常どおり課金されます。つまり、「stream を早めに切って節約する」は通用しません。
</Warning>

`usage` をめぐる2つの落とし穴:

1. **ストリーミングではデフォルトで usage は返されません。** OpenAI互換のエンドポイントでは `stream_options: {"include_usage": true}` を渡す必要があります。すると usage は最後のチャンクに届きます（その `choices` 配列は空です — インデックスで参照する前に確認してください）。これは APIYI のいくつかのモデルで動作確認済みです。
2. **API が返す `usage` と請求を突き合わせないでください。** 特にキャッシュ関連のフィールドです。返された値は、実際に課金された内容と必ずしも一致しません。キャッシュヒットが発生したかどうかは、**コンソールログ内の「cache billing details」** で判断されます。 [キャッシュ課金の説明](/ja/faq/cache-billing) を参照してください。

どちらの場合でも、コンソールログには各呼び出しの token 数、レイテンシ、および課金が記録されます。転送方式による違いはありません。フィールドの意味: [ログ課金詳細の理解](/ja/faq/log-billing-explained)。

## よくある6つの誤解

<AccordionGroup>
  <Accordion title="1. ストリーミングならタイムアウトを無視できる">
    **2つを分けて考えてください。** ストリーミングによって生成全体の時間が短くなるわけではありません。最初のtokenから最後のtokenまでの合計時間は、元のままです。この点は変わりません。

    ただし、ストリーミングは「何も返らない」問題を解決します。クライアントの読み取りタイムアウトをイベント間の間隔に対応できるよう設定すれば（推論モデルの思考フェーズ中に測定された最大の無通信時間は約42秒で、その間にはキープアライブpingが入るため、90～120秒で対応できます）、誤ってタイムアウトすることはありません。実際に維持できないのは、**完全な非ストリーミング**、つまり10分を超える生成を最初から最後まで1つのタイムアウト値でカバーする方法です。

    したがって、適切な方法は、イベント間隔に合わせた読み取りタイムアウトを設定して、長い出力をストリーミングすることです。シナリオごとの値は[APIのタイムアウトを回避する方法](/ja/faq/timeout-configuration)に、完全な手順は[長文出力の運用方法](/ja/api-capabilities/long-form-output-practices)に記載しています。
  </Accordion>

  <Accordion title="2. ストリーミングは高速である">
    **最初のバイトは速くなりますが、合計時間は変わりません。** 同じモデルとpromptを使う場合、ストリーミングと非ストリーミングは、おおむね同じ時間で完了します。

    ストリーミングによって得られるのは、*体感速度*です。ユーザーは30秒間スピナーを見続ける代わりに、1秒以内に画面の変化を確認できます。画面を見ている人が誰もいなければ、その価値はゼロです。
  </Accordion>

  <Accordion title="3. ストリーミングは安い、または受信した分だけ課金される">
    **いいえ。** 上記の「課金と使用量」を参照してください。課金は同じであり、途中で切断しても課金されます。
  </Accordion>

  <Accordion title="4. すべてのモデルとエンドポイントがストリーミングに対応している">
    **いいえ。** テキストチャットモデルは一般的に対応していますが、画像生成、埋め込み、再ランキングのエンドポイントにはストリーミングの概念がなく、`stream`を無視するか、拒否します。

    一部のモデルには、ストリーミング時の特定のパラメータの組み合わせに関する追加の制限があります。不明な場合は、まず非ストリーミングで呼び出しを動作させてから、`stream: true`を追加してください。
  </Accordion>

  <Accordion title="5. 非ストリーミングのほうが信頼性が高い">
    **どちらにも固有の障害要因があります。**

    * 非ストリーミングのリスク：生成全体を通じて接続が無通信になるため、プロキシ、CDN、企業内ゲートウェイによってアイドルタイムアウト時に切断される可能性があります。また、非常に大きなレスポンスボディ（base64の画像出力は簡単に数十MBに達します）では、終了処理が停止することもあります。[転送は完了するのに返却されないリクエスト](/ja/api-capabilities/image-tail-stall)および[ログには完了と表示されるのにクライアントには何も届かない](/ja/faq/log-duration-vs-client-wait)を参照してください。
    * ストリーミングのリスク：SSEに対応していない、またはバッファリングを強制する中間ネットワーク機器との相性が悪く、クライアント側の解析も複雑で、微妙な誤りが起きやすくなります。

    さらに、`api-cf.apiyi.com`（CDNエンドポイント）には約100秒のリクエスト上限があり、**両方のモードに影響します**。長時間のリクエストには`api.apiyi.com`または`vip.apiyi.com`を使用してください。[ベースURL設定ガイド](/ja/faq/base-url-config)を参照してください。
  </Accordion>

  <Accordion title="6. ストリームから完全な回答を取得することはできない">
    **取得できます。自分で組み立てるだけです。** 各チャンクの`delta.content`を順番に連結すれば、非ストリーミングの`message.content`とまったく同じものが得られます。

    組み立てたテキストが不完全に見える場合は、次の3点を確認してください。`finish_reason`を無視していないか、`data: [DONE]`を受信する前にループを終了していないか、そして中間ネットワーク機器によってレスポンスが途中で切り詰められていないかです。
  </Accordion>
</AccordionGroup>

## ストリーミングが動作しない？ 4つの手順

<Steps>
  <Step title="リクエストボディに本当に stream: true が含まれているか確認してください">
    実際に送信している JSON を出力してください。ラッパーライブラリでは、「渡したつもりだった」と「実際に渡っていた」は別物であることがよくあります。
  </Step>

  <Step title="curl -N で直接テストしてください">
    上の「cURL を並べて表示」タブにあるコマンドを使って、自分のコードやプロキシをバイパスしてください。curl でチャンクが段階的に到着するなら、サーバー側は正常で、問題はクライアントまたはミドルボックスにあります。
  </Step>

  <Step title="ミドルボックスのバッファリングを確認してください">
    Nginx では `proxy_buffering off;` を追加してください。企業のゲートウェイやセキュリティアプライアンスは `text/event-stream` を全体のペイロードとしてスキャンする場合があります — ネットワーク管理者に通過を許可してもらってください。
  </Step>

  <Step title="パースロジックを見直してください">
    SSE を 1 行ずつ読み取り、空行と `:` で始まるコメント行をスキップし、`data: [DONE]` で停止してください。`usage` を含む最終チャンクには空の `choices` 配列があります — そこをインデックス参照しないでください。
  </Step>
</Steps>

<Tip>
  ここまで進んでも答えが得られない場合は、**`request_id` を添えてサポートにお問い合わせください** — コンソールログには、その呼び出しがストリームとして処理されたかどうかに加え、総レイテンシと初回バイトまでの時間が直接表示されます。
</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="API タイムアウトを回避する方法" icon="timer" href="/ja/faq/timeout-configuration">
    シナリオ別のタイムアウト値と、長い出力でストリーミングを使用すべき理由
  </Card>

  <Card title="Base URL 設定ガイド" icon="link" href="/ja/faq/base-url-config">
    エンドポイント間の違いと、CDN ノードの 100 秒上限
  </Card>

  <Card title="ログには完了と表示されるがレスポンスがない" icon="stethoscope" href="/ja/faq/log-duration-vs-client-wait">
    セグメントタイミングを含む、典型的な大規模な非ストリーミングレスポンスの問題
  </Card>

  <Card title="Claude のストリーミングと非ストリーミング" icon="braces" href="/ja/api-capabilities/claude-response-handling">
    Anthropic ネイティブの名前付きイベント SSE プロトコルの解析
  </Card>

  <Card title="テキスト生成 API" icon="message-square" href="/ja/api-capabilities/text-generation">
    完全なパラメータ一覧と呼び出し例
  </Card>

  <Card title="ログの課金詳細を理解する" icon="file-text" href="/ja/faq/log-billing-explained">
    is\_stream を含む、各コンソールログフィールドの意味
  </Card>
</CardGroup>
