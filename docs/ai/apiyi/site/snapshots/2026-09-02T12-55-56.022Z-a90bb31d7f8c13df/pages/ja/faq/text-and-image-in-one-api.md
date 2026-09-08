> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストと生成画像の両方を出力する会話型 API はありますか？

> 画像を読み取ることと画像を生成することは別のことです。どのモデルが画像入力を受け付けるのか、どのモデルが実際に画像を生成できるのか、どのファミリーが 1 回のレスポンスでテキストと画像を本当に返すのか、そして 4 つの画像ルートの中からどう選ぶのかを解説します。

## 短い答え

<Info>
  **3つの文で言うと:**

  1. **「画像を見られる」ことと「画像を作れる」ことは、別の機能です。** ほとんどすべての現代的なチャットモデルは画像を**読み取る**ことができます（これが通常「マルチモーダル」の意味です）が、画像を**生成**することはできません。これは、画像専用モデルの別のクラスです。
  2. **1つのエンドポイントからテキストと画像を本当に両方返せるのは、Gemini の画像ファミリーだけです** — `gemini-3-pro-image`（Nano Banana Pro）、`gemini-3.1-flash-image`（Nano Banana 2）などは、同じレスポンス内でテキスト部分と画像部分を交互に返します。
  3. **それ以外はすべてオーケストレーションです**。チャットモデルと単体の画像エンドポイントを連携させるか、または `gpt-5.5` と Responses のネイティブ `image_generation` ツールを使って、モデルに描画するタイミングを判断させます。
</Info>

## まず、入力画像と出力画像を分けて考えます

ほとんどの混乱は「multimodal」という言葉から生じています。API の文脈では、これは **入力側がデフォルト** です。
つまり、「モデルに画像を与えられる」という意味であり、「モデルが画像を生成してくれる」という意味ではありません。
この 2 つは、異なるモデルプール、異なるエンドポイント、異なる課金体系を使います:

| 観点          | 画像入力（ビジョン）                                                                 | 画像出力（画像生成）                                                                         |
| ----------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 対象モデル       | **ほぼすべての現代的なチャットモデル** — GPT-5 ファミリー、Claude ファミリー、Gemini テキストモデル、Grok ファミリー | **専用の画像モデルの少数セット** — プラットフォーム上の約300モデルのうち約30モデル                                    |
| 典型的なエンドポイント | `POST /v1/chat/completions`、`/v1/responses`、`/v1/messages`                 | `POST /v1/images/generations`、`POST /v1/images/edits`                              |
| 画像の存在場所     | **リクエスト**内: `image_url` または base64 エントリが `content` 配列にあります                 | **レスポンス**内: `data[0].url` / `data[0].b64_json`、または Gemini では `parts[].inlineData`  |
| 課金          | 画像は tokens に変換され、チャット料金で課金されます                                             | 画像ごとに課金、または出力 tokens ごとの課金                                                         |
| 確認方法        | モデル詳細ページの **入力モダリティ** に「image」と記載されています                                    | 詳細ページの仕組みにはありません — [画像および動画生成モデル](/ja/api-capabilities/image-video-models) をご覧ください |

<Note>
  したがって、誰かに「マルチモーダルなチャット API はありますか」と聞かれたら、相手が **モデルに解析させるために画像をアップロードしたい** のなら、
  答えは「ほぼすべてが対応しています」です。もしモデルに **画像を生成させたい** のであれば、それはまったく
  別のモデル群です。この確認質問を 1 つするだけで、その後のやり取りの大半を省けます。
</Note>

## 画像を取得するための4つのルート

| ルート                         | 呼び出し方法                                              | 同じレスポンスでテキストも返る？                     | 向いている用途                 |
| --------------------------- | --------------------------------------------------- | ------------------------------------ | ----------------------- |
| **A. 単体の画像エンドポイント** (推奨)    | 画像モデル + `POST /v1/images/generations`               | ❌ 画像のみ                               | 「画像だけほしい」               |
| **B. Gemini 画像ファミリー、ネイティブ** | `POST /v1beta/models/{model}:generateContent`       | ✅ **場合によっては**、保証されません                | 解説と画像を一緒に欲しい場合          |
| **C. Responses ネイティブツール**   | `gpt-5.5` + `tools: [{"type": "image_generation"}]` | ✅ はい                                 | 自律的に描画するかどうかを判断するエージェント |
| **D. 画像モデル上のチャットエンドポイント**   | `gpt-image-2-all` / `-vip` + `/v1/chat/completions` | 画像は `content` の中に Markdown として埋め込まれる | レガシー互換性、**現在は非推奨**      |

<AccordionGroup>
  <Accordion title="A. 単体の画像エンドポイント — ほとんどすべてでこれを選んでください">
    最も標準的で、最も安価で、デバッグしやすいルートです。GPT-Image、FLUX、Seedream、Grok Imagine はすべてここにあります。

    ```bash theme={null}
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-image-2",
        "prompt": "An orange cat sitting on a blue sofa, simple line-art style",
        "size": "1024x1024"
      }'
    ```

    FLUX と Seedream は一般に `data[0].url` を返し、GPT-Image ファミリーは `data[0].b64_json` を返します。
    **このルートは会話テキストをまったく返しません** — チャットエンドポイントではありません。

    全モデル一覧: [画像生成および動画生成モデル](/ja/api-capabilities/image-video-models)。
    モデルごとのエンドポイント、タイムアウト、出力形式の違い:
    [画像 API の注意点とベストプラクティス](/ja/api-capabilities/image-api-best-practices)。
  </Accordion>

  <Accordion title="B. Gemini 画像ファミリー — テキストと画像をネイティブに同時返却できる唯一のもの">
    Nano Bananaシリーズ（`gemini-3-pro-image`、`gemini-3.1-flash-image` など）は Gemini のネイティブエンドポイントを使い、
    `candidates[0].content.parts` は**異種混在配列**です。画像パートだけを含むこともあれば、
    テキストパートと画像パートが混在することもあります。これこそが、1回の呼び出しで両方を本当に返せるファミリーです。

    事前に知っておくべき落とし穴が1つあります。**パート数も順序も保証されません。** テストでは次の3パターンが確認されています:

    | parts 構成              | 長さ | 画像インデックス |
    | --------------------- | -- | -------- |
    | `inlineData`          | 1  | `0`      |
    | `text` + `inlineData` | 2  | **`1`**  |
    | `inlineData` + `text` | 2  | **`0`**  |

    なので、`parts[0]` や `parts[1]` をハードコーディングすると**断続的に失敗します**。正しい方法は、フィールドの有無でフィルタし、最後の `inlineData` を使うことです（複雑な prompt ではモデルが複数の画像を返し、最後のものが最終版です）:

    ```python theme={null}
    cand = (resp.get("candidates") or [{}])[0]
    parts = (cand.get("content") or {}).get("parts") or []
    images = [p["inlineData"] for p in parts if "inlineData" in p]
    texts  = [p["text"] for p in parts if "text" in p]          # commentary lives here
    if not images:
        raise RuntimeError(f"No image returned, finishReason={cand.get('finishReason')}")
    final = images[-1]                                          # last image is the final one
    ```

    詳細: [Nano Banana シリーズの開発者ガイド](/ja/api-capabilities/nano-banana-dev-guide)。
  </Accordion>

  <Accordion title="C. Responses のネイティブ image_generation ツール — 描画するかどうかはエージェントに判断させる">
    `POST /v1/responses` を `gpt-5.5` で呼び出し、ネイティブの画像生成ツールを追加します:

    ```json theme={null}
    {
      "model": "gpt-5.5",
      "input": "Draw a key visual poster for a product launch event",
      "tools": [{ "type": "image_generation" }]
    }
    ```

    モデルが自律的に描画するかどうかを判断し、画像は base64 として、`image_generation_call` アイテムとしてレスポンスの `output` 配列内に返ってきます。
    **これは OpenAI 側でいう「描画するチャットモデル」に最も近いものです。**

    <Warning>
      **費用:** このルートでは、ツール呼び出しのたびに 1 画像あたり約 \$0.20 の固定料金が usage-based billing に加えてかかります。一方、ルート A の `/v1/images/generations` は使用量のみで課金されます。パイプラインが Responses を必ず通る必要がある場合（たとえば、自律的に描画する / しないを判断するエージェント）にのみ使ってください。画像だけほしいなら、ルート A を使ってください。
    </Warning>

    詳細: [ネイティブツールによる画像生成](/ja/api-capabilities/gpt-image-2/responses-image-tool)。
  </Accordion>

  <Accordion title="D. 画像モデル上のチャットエンドポイント — 会話的に見えても、依然として画像モデル">
    `gpt-image-2-all` と `gpt-image-2-vip` は `/v1/chat/completions` から呼び出せて、画像は `choices[0].message.content` の中に Markdown リンクとして埋め込まれます。

    「会話も描画もできる1つのチャットエンドポイント」のように見えますが、**描画できるチャットモデルではありません** —
    内部では、汎用的な会話能力を持たない画像モデルがチャットスキーマでラップされているだけです。
    また、**`image_url` を最後の `user` メッセージ内のベース画像としてのみ読み取ります**。assistant 履歴内の画像は無視されます。

    このルートは**現在は非推奨**です — 新しい統合ではルート A を使用してください。
  </Accordion>
</AccordionGroup>

## 「チャットと描画」プロダクトを構築する：推奨される構成

ほとんどのエージェントやプロダクトに本当に必要なのは、1つの魔法のような endpoint ではなく、明確なオーケストレーションのチェーンです：

<Steps>
  <Step title="チャットモデルに意図を分類させる">
    すでに使っている chat model（`gpt-5.5`、`claude-opus-5`、`gemini-3-pro` など）を使ってユーザー入力を処理し、このターンが会話なのか image request なのかを判断します。必要であれば、構造化されたフラグを返すようにしてください。
  </Step>

  <Step title="チャットモデルに画像 prompt を書かせる">
    この工程は十分に元が取れます。ユーザーが「ポスターを作って」と言っても、画像モデルには完全な視覚的説明が必要です。チャットモデルがカジュアルな依頼を整った prompt に書き換えることで、出力品質の一貫性が目に見えて向上します。
  </Step>

  <Step title="画像エンドポイントを呼び出す">
    ルート A の`/v1/images/generations`を使います。返ってきた`url`または`b64_json`を取り出し、自前の object storage に保存します。
  </Step>

  <Step title="画像を会話に戻す">
    画像リンクを assistant メッセージとして conversation history に追加します。ユーザーには、これは「会話しながら描画が進む」ひとつの流れとして見えます。
  </Step>
</Steps>

<Tip>
  このように分けることの実用上の利点は次のとおりです：各モデルを個別に差し替えられること（画像モデルを変更しても会話ロジックには触れません）、課金がログ上で明確に分離されること、そして
  **どちらの工程も単独で再試行できる**ため、ターン全体を再実行する必要がなくなることです。
</Tip>

## モデルが画像を受け付けるかどうかを確認する方法

<Steps>
  <Step title="1. モデル詳細ページを確認する">
    `/models/<model-name>` を開いて、上部の仕様表にある **Input modalities** 行を見てください — ここに
    「image」とあれば、そのモデルは vision に対応しています。これが最も手早い確認方法です。
  </Step>

  <Step title="2. 迷ったら試す">
    画像付きで最小限のリクエストを送って、レスポンスを確認してください:

    ```bash theme={null}
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer sk-your-api-key" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "the-model-you-are-testing",
        "messages": [{
          "role": "user",
          "content": [
            {"type": "text", "text": "What is in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/test.jpg"}}
          ]
        }]
      }'
    ```
  </Step>

  <Step title="3. エラー文字列を見分ける">
    テキスト専用モデルは明示的に失敗します。上流側のメッセージは `Model do not support image input`
    （文法は上流側のもので、 টাইポではありません）。この行が出たら、そのモデルは画像を受け付けません — 別のモデルに切り替えてください。
  </Step>
</Steps>

<Warning>
  **既知のテキスト専用の例外（2026-08-20 時点）:** `deepseek-v4-pro`, `deepseek-v4-flash`, `glm-5.2`。

  これは「今どきのモデルなのに画像入力を受け付けない」少数派で、見落としやすいです。
  **この一覧はモデルカタログの変更に応じて変わります** — 同じ
  ベンダーでも世代によって機能が異なります。常に、モデル詳細ページの「Input modalities」行と自分のテスト結果を、固定の一覧ではなく正しい情報源として扱ってください。
</Warning>

## よくある5つの誤解

<AccordionGroup>
  <Accordion title="1. マルチモーダルモデルは画像を生成できる">
    **いいえ。** API の文脈では、マルチモーダルのデフォルトは **入力側** の機能です。`gpt-5.5` は送信したデザインモックアップを読み取れますが、単独で画像を生成することはできません。1 枚取得するには、ツール呼び出し（ルート C）か、画像エンドポイントへの別々の呼び出し（ルート A）が必要です。
  </Accordion>

  <Accordion title="2. 画像モデルはチャットモデルとして使える">
    **いいえ。** 画像モデルには一般的な会話能力がありません。`gpt-image-2` をサポート用チャットボットの背後に置かないでください。chat エンドポイントを受け付ける `-all` / `-vip` 版（ルート D）でも、内部はあくまで画像モデルです。
  </Accordion>

  <Accordion title="3. responseModalities に TEXT を含めればテキスト部分が必ず返る">
    **逆は成り立ちません。** `responseModalities: ["TEXT", "IMAGE"]` と宣言しても、レスポンスにテキスト部分が含まれることは **保証されません**。モデルは画像だけを返すこともあります。とはいえ逆方向は有用です。`["IMAGE"]` を明示的に宣言すると、余分なテキスト部分を減らせます。
  </Accordion>

  <Accordion title="4. parts[0] と parts[1] を切り替えれば壊れた画像抽出が直る">
    **直りません。** 2 つのハードコードされたインデックス方式は **補完的** です。画像は常に `[0]` か `[1]` のどちらかに入るため、どちらを選んでも一部のリクエストでは取りこぼします。インデックスを変えても、失敗するリクエストが入れ替わるだけです。**フィールドの有無でフィルタリングする方法だけが安定しています。**
  </Accordion>

  <Accordion title="5. 参照画像を /v1/images/generations に渡すと編集になる">
    **いいえ。しかもエラーを出さずに失敗します。** Grok Imagine は最もわかりやすい例です。`image` / `image_url` / `images` を生成エンドポイントに渡すと、200 とともに通常の画像が返りますが、参照画像は何も通知されないまま破棄され、課金は通常どおりです。返ってくるのは、単純な text-to-image の結果です。

    画像編集は `/v1/images/edits` を経由しなければなりません（しかも Grok Imagine ではそこでさらに `multipart/form-data` が必要です。JSON を送ると 400 が返ります）。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Vision（画像理解）API" icon="eye" href="/ja/api-capabilities/vision-understanding">
    入力側の完全ガイドです。対応モデル、URL と base64 の比較、複数画像入力、よくあるエラーをまとめています
  </Card>

  <Card title="画像および動画生成モデル" icon="palette" href="/ja/api-capabilities/image-video-models">
    価格付きの出力側モデル一覧です。どのモデルが画像生成できるかを確認する場所です
  </Card>

  <Card title="Nano Banana シリーズ開発者ガイド" icon="banana" href="/ja/api-capabilities/nano-banana-dev-guide">
    Gemini 画像ファミリーを正しく呼び出す方法です。parts の走査、複数画像出力、mimeType の扱いを説明します
  </Card>

  <Card title="ネイティブツールによる画像生成" icon="wand-sparkles" href="/ja/api-capabilities/gpt-image-2/responses-image-tool">
    Responses の image\_generation ツールを使って、モデル自身に描画させます。追加のツール呼び出し料金も含みます
  </Card>

  <Card title="画像 API の注意点とベストプラクティス" icon="list-checks" href="/ja/api-capabilities/image-api-best-practices">
    画像モデル全体におけるエンドポイント、タイムアウト、出力フォーマットの一覧です
  </Card>

  <Card title="適切な AI モデルの選び方" icon="compass" href="/ja/faq/model-selection-guide">
    ユースケース、コスト、速度に基づくモデル選定です
  </Card>
</CardGroup>
