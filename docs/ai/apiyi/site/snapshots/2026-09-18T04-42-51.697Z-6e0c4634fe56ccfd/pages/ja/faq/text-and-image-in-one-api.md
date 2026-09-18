> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキストと生成画像の両方を出力する会話型 API はありますか？

> 画像を読み取ることと画像を生成することは別のことです。どのモデルが画像入力を受け付けるのか、どのモデルが実際に画像を生成できるのか、どのファミリーが 1 回のレスポンスでテキストと画像を本当に返すのか、そして 4 つの画像ルートの中からどう選ぶのかを解説します。

## 短い回答

<Info>
  **「画像を見られる」ことと「画像を作れる」ことは、2つの異なる機能です。** ほぼすべての最新チャットモデルは画像を**読み取れます**（通常、「マルチモーダル」とはこのことを意味します）が、画像を**生成することはできません**。画像生成は、専用の画像モデルによる別のカテゴリです。
  2\. **1つのエンドポイントからテキストと画像を実際に返すのは、Gemini 画像ファミリーだけです** — `gemini-3-pro-image`（Nano Banana Pro）、`gemini-3.1-flash-image`（Nano Banana 2）などは、同じレスポンス内でテキストパートと画像パートを交互に返します。
  3\. **それ以外はすべてオーケストレーションです**：チャットモデルと、単独の画像エンドポイント（画像 API）が連携して動作します。OpenAI Responses のネイティブな `image_generation` ツールは、**APIYI では推奨されません**。固定の呼び出しごとの料金でしか課金できず、妥当な料金モデルとはいえないうえ、安定性も保証できないためです。
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

## 画像を取得する4つのルート

| ルート                         | 呼び出し方法                                              | 同じレスポンス内のテキスト                       | 最適な用途                                                 |
| --------------------------- | --------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| **A. スタンドアロン画像エンドポイント**（推奨） | 画像モデル + `POST /v1/images/generations`               | ❌ 画像のみ                              | 「画像だけが欲しい」                                            |
| **B. Gemini 画像ファミリー、ネイティブ** | `POST /v1beta/models/{model}:generateContent`       | ✅ **可能性あり**、保証なし                    | コメントと画像を一緒に取得したい場合                                    |
| **C. Responses ネイティブツール**   | `gpt-5.5` + `tools: [{"type": "image_generation"}]` | ✅ 取得可能                              | **APIYI では非推奨**：呼び出しごとの固定料金で、安定性も保証されないため、A を使用してください |
| **D. 画像モデルの Chat エンドポイント**  | `gpt-image-2-all` / `-vip` + `/v1/chat/completions` | 画像は `content` 内に Markdown として埋め込まれる | レガシー互換性、**現在は非推奨**                                    |

<AccordionGroup>
  <Accordion title="A. スタンドアロン画像エンドポイント — ほとんどの場合はこれを選択してください">
    最も標準的で、安価で、デバッグしやすいルートです。GPT-Image、FLUX、Seedream、Grok Imagine はすべてここにあります。

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

    FLUX と Seedream は通常 `data[0].url` を返し、GPT-Image ファミリーは `data[0].b64_json` を返します。
    **このルートは会話テキストを一切返しません** — chat エンドポイントではありません。

    すべてのモデルの一覧：[画像・動画生成モデル](/ja/api-capabilities/image-video-models)。
    モデルごとのエンドポイント、タイムアウト、出力形式の違い：
    [画像 API の注意点とベストプラクティス](/ja/api-capabilities/image-api-best-practices)。
  </Accordion>

  <Accordion title="B. Gemini 画像ファミリー — テキストと画像をネイティブに同時返却できる唯一のもの">
    Nano Banana シリーズ（`gemini-3-pro-image`、`gemini-3.1-flash-image` など）はネイティブ Gemini エンドポイントを使用し、
    `candidates[0].content.parts` は **異種配列** です。画像パーツだけを含む場合もあれば、
    テキストパーツと画像パーツが交互に含まれる場合もあります。1回の呼び出しで本当に両方を取得できるファミリーです。

    先に知っておくべき注意点が1つあります：**パーツ数も順序も保証されません。** テストでは次の3つの構成が確認されています。

    | パーツ構造                 | 長さ | 画像インデックス |
    | --------------------- | -- | -------- |
    | `inlineData`          | 1  | `0`      |
    | `text` + `inlineData` | 2  | **`1`**  |
    | `inlineData` + `text` | 2  | **`0`**  |

    そのため、`parts[0]` や `parts[1]` をハードコードすると、**断続的に失敗します**。正しい方法は、フィールドの存在に基づいてフィルタリングし、**最後の** `inlineData` を取得することです（複雑な prompt ではモデルが複数の画像を返し、最後の画像が最終版になります）。

    ```python theme={null}
    cand = (resp.get("candidates") or [{}])[0]
    parts = (cand.get("content") or {}).get("parts") or []
    images = [p["inlineData"] for p in parts if "inlineData" in p]
    texts  = [p["text"] for p in parts if "text" in p]          # commentary lives here
    if not images:
        raise RuntimeError(f"No image returned, finishReason={cand.get('finishReason')}")
    final = images[-1]                                          # last image is the final one
    ```

    詳細：[Nano Banana シリーズ開発者ガイド](/ja/api-capabilities/nano-banana-dev-guide)。
  </Accordion>

  <Accordion title="C. Responses ネイティブ image_generation ツール — APIYI では非推奨">
    このルートでは、`POST /v1/responses` を `gpt-5.5` とともに呼び出し、ネイティブ画像ツールを追加します。

    ```json theme={null}
    {
      "model": "gpt-5.5",
      "input": "Draw a key visual poster for a product launch event",
      "tools": [{ "type": "image_generation" }]
    }
    ```

    モデルは描画するかどうかを自ら判断し、画像は通常のテキスト出力と並んで、レスポンスの
    `output` 配列内の `image_generation_call` アイテムに base64 として返されます。
    形としては OpenAI 側の「描画する chat モデル」に最も近いものですが、**APIYI では推奨していません**。

    <Warning>
      **推奨しない理由：** APIYI では Responses 内の画像ツールは **呼び出し単位でのみ課金可能** です。画像1枚あたり約 \$0.20 の固定ツール呼び出し料金で、ルート A のような使用量ベースの選択肢はありません。この料金モデルは妥当ではありません。
      また、供給上の制約により、この経路の **安定性を保証できません**。

      画像生成には必ず、使用量に応じて課金されるルート A の Images API（`/v1/images/generations` / `/v1/images/edits`）を使用してください。
      「エージェントが描画するかどうかを判断する」処理が必要な場合は、以下の「チャットと描画」オーケストレーションで構築してください —
      同じ結果を、明確な課金体系で実現できます。
    </Warning>
  </Accordion>

  <Accordion title="D. 画像モデルの Chat エンドポイント — 会話形式に見えても、実体は画像モデル">
    `gpt-image-2-all` と `gpt-image-2-vip` は `/v1/chat/completions` 経由で呼び出すことができ、画像は
    `choices[0].message.content` 内の Markdown リンクとして埋め込まれます。

    「会話と描画の両方を行う1つの chat エンドポイント」のように見えますが、**描画可能な chat モデルではありません** —
    内部では、一般的な会話能力を持たない画像モデルを chat スキーマでラップしています。
    また、ベース画像として **最後の `user` メッセージ内の `image_url` だけを読み取り**、assistant の履歴内にある画像は無視します。

    このルートは **現在は非推奨** です — 新しい統合ではルート A を使用してください。
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
    **誤りです。** API のコンテキストでは、マルチモーダルはデフォルトで**入力側**の機能を指します。 `gpt-5.5` は送信されたデザインモックアップを読み取れますが、単独で画像を出力することはできません。画像を取得するには、画像エンドポイントへの別の呼び出し（ルートA）が必要です。Responses のネイティブ画像ツール（ルートC）は APIYI では推奨されません。
  </Accordion>

  <Accordion title="2. 画像モデルはチャットモデルとして使用できる">
    **誤りです。** 画像モデルには一般的な会話能力がないため、`gpt-image-2` をサポートチャットボットの背後で使用しないでください。`-all` / `-vip` のバリアントでチャットエンドポイント（ルートD）を受け付けるものでも、基盤となるのはあくまで画像モデルです。
  </Accordion>

  <Accordion title="3. responseModalities に TEXT を含めれば、テキストパートが必ず返される">
    **逆は成り立ちません。** `responseModalities: ["TEXT", "IMAGE"]` を宣言しても、レスポンスにテキストパートが含まれることは保証されません。モデルは画像のみを返す場合があります。ただし、もう一方の方向は有用です。`["IMAGE"]` を明示的に宣言すると、余分なテキストパートを減らせます。
  </Accordion>

  <Accordion title="4. parts[0] と parts[1] を切り替えれば、壊れた画像抽出を修正できる">
    **修正できません。** 2つのハードコードされたインデックス方式は**相補的**です。画像は常に `[0]` または `[1]` に格納されるため、どちらを選んでも一部のリクエストでは画像を取得できません。インデックスを変更すると、失敗するリクエストが入れ替わるだけです。**安定するのは、フィールドの存在によるフィルタリングだけです。**
  </Accordion>

  <Accordion title="5. /v1/images/generations に参照画像を渡すと編集が実行される">
    **誤りであり、しかも暗黙に失敗します。** Grok Imagine は最も分かりやすい例です。`image` / `image_url` / `images` を生成エンドポイントに渡しても、**通常の画像が 200 で返されますが、参照画像は暗黙に破棄され、通常どおり課金されます**。返されるのは通常のテキストから画像への生成結果です。

    画像編集は `/v1/images/edits` 経由で行う必要があります（さらに Grok Imagine では、そこで `multipart/form-data` も必要です。JSON を送信するとハード 400 が返されます）。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Vision（画像理解）API" icon="eye" href="/ja/api-capabilities/vision-understanding">
    入力側の完全ガイド：対応モデル、URL と base64 の比較、複数画像入力、よくあるエラー
  </Card>

  <Card title="画像・動画生成モデル" icon="palette" href="/ja/api-capabilities/image-video-models">
    出力側の完全なモデル一覧と料金 — 画像を生成できるモデルを確認する場所
  </Card>

  <Card title="Nano Banana シリーズ開発者ガイド" icon="banana" href="/ja/api-capabilities/nano-banana-dev-guide">
    Gemini 画像ファミリーを正しく呼び出す方法：parts の走査、複数画像出力、mimeType の処理
  </Card>

  <Card title="画像 API の注意事項とベストプラクティス" icon="list-checks" href="/ja/api-capabilities/image-api-best-practices">
    画像モデル全体のエンドポイント、タイムアウト、出力形式の一覧
  </Card>

  <Card title="適切な AI モデルの選び方" icon="compass" href="/ja/faq/model-selection-guide">
    用途、コスト、速度によるモデル選択
  </Card>
</CardGroup>
