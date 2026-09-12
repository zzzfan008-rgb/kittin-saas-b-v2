> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 透明背景（PNG 切り抜き）で画像を生成するにはどうすればよいですか？

> background: transparent を gpt-image-2 に渡すと、真のアルファチャンネル付き PNG が返ってきます。後処理は不要です。png と webp はどちらも使えますが、jpeg には alpha チャンネルがないため、透明背景とは両立しません。このページでは、すべての画像モデル、最小限の例、およびよくあるエラーを扱います。

## 簡潔な回答

**`gpt-image-2` を使用し、リクエストに 2 つのフィールドを追加します:**

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

画像は実際のアルファチャンネルを持つ PNG として返されます — 切り抜き後処理は不要です。text-to-image、画像編集、そして Responses の画像ツールがすべて対応しています。

<Info>
  `background: "transparent"` は、OpenAI が 2026-08-21 に GPT-Image-2 向けに公開した機能です（OpenAI によるプレビューとしてマークされています）。APIYI はこれをエンドツーエンドで検証済みです。text-to-image と画像編集の両方で、真のアルファ透過を返します。
</Info>

## 透明な背景を生成できるモデル

| モデル                                      | 方法                                                                               | 信頼性                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `gpt-image-2`                            | **パラメータ** — `background: "transparent"` で `output_format` を `png` または `webp` に設定 | ✅ 信頼性が高く、推奨                                          |
| `gpt-image-1.5` / `gpt-image-1`          | 同じパラメータ                                                                          | ✅ 信頼性が高い（旧モデルです。新規プロジェクトでは `gpt-image-2` のみを使ってください） |
| `gpt-image-2-all` / `gpt-image-2-vip`    | **`background` パラメータなし** — prompt でしか依頼できません                                     | ⚠️ 時々不安定です。同じ prompt でも白背景で返ってくることがあります              |
| `seedream-5-0` / `seedream-5-0-pro`      | `output_format: "png"` に加えて prompt 内で `transparent background, alpha channel`    | ⚠️ prompt 主導で、alpha は各呼び出しで保証されません                   |
| Gemini image models (Nano Banana family) | prompt のみ                                                                        | ⚠️ 上記と同様です                                           |
| `seedream-4-5` / `seedream-4-0`          | `jpeg` 出力のみ、alpha チャンネルなし                                                        | ❌ 未対応                                                |

<Tip>
  **透明性を確実に必要とする場合は、`gpt-image-2` を使ってください。** パラメータによる指定と prompt での依頼は同じではありません。前者は API によって保証されますが、後者は model が最善を尽くすだけです。バッチ規模になると、その差がはっきり表れます。
</Tip>

## 呼び出し方法は3通りあります

### テキストから画像へ `/v1/images/generations`

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a cute cartoon fox sticker, flat vector illustration, single centered subject, clean cutout edges, no background, no shadow",
    "background": "transparent",
    "output_format": "png",
    "quality": "low"
  }'
```

### 画像編集 `/v1/images/edits`

普通の写真を渡して、背景を取り除くように依頼します:

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

マスクベースのインペインティング（`mask`）と透明な背景は併用できます。互いに競合しません。

### Responses 画像ツール

```json theme={null}
{
  "model": "gpt-5.2",
  "input": "Generate a cartoon fox sticker",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

返された `image_generation_call` は `"background": "transparent"` を反映します。

## なぜ `jpeg` が動作しないのか

JPEG には **alpha チャンネルがありません** — 透明度を保存する場所がないためです。`output_format: "jpeg"` と `background: "transparent"` を組み合わせると 400 が返されます:

```json theme={null}
{
  "error": {
    "message": "Transparent background is not supported for JPEG output format",
    "param": "background",
    "code": "invalid_value"
  }
}
```

透明度が必要な場合は、`png`（ロスレスで、サイズは大きめ）または `webp`（ロッシーで調整可能、サイズは小さめ、さらに alpha もサポート）を選んでください。`webp` はさらにファイルサイズを削減するために `output_compression` も受け付けます。

## 編集は精密な切り抜きではなく、描き直しです

ここで最初に期待値をそろえておきます。`/v1/images/edits` が `background: transparent` で実行されると、モデルは Photoshop のように元の輪郭をなぞるのではなく、**シーンを理解して被写体を描き直します**。つまり、次のようになります。

* 被写体の**ポーズ、スタイル、細部**は変化します — これはピクセル単位の保持ではありません
* 元の画像により近づけるには、`quality: "high"`を使い、プロンプトに「元の構図を維持し、被写体の見た目を変更しないでください」と記載します
* ワークフローでピクセル単位の正確な抽出が必要な場合は、`rembg`、`PIL`、または`sharp`で自分で切り抜きを行ってください。モデル生成は、正確なマット処理よりも「再利用可能なアセットを生成する」用途に適しています

## 課金

**透明性に追加料金はかかりません。** 同じ品質ティアとサイズであれば、`background: "transparent"` と `background: "opaque"` はまったく同じ数の image tokens を消費し、`gpt-image-2` に対する通常の token 単位の課金ルールに従って請求されます。

## よくあるエラー

<AccordionGroup>
  <Accordion title="400: JPEG 出力形式では透明背景はサポートされていません">
    `output_format`は`jpeg`に設定されていました。`png`または`webp`に切り替えてください。
  </Accordion>

  <Accordion title="画像は実際に白地で、透明ではありません">
    3 つ確認してください。まず、`background`フィールドが実際に API に届いているかです。edits エンドポイントは`multipart/form-data`なので、JSON 本文のフィールドではなく`-F background=transparent`でなければなりません。次に、レスポンスのトップレベルの`background`が`transparent`を返しているかです。最後に、`gpt-image-2`を使っているかです。`gpt-image-2-all`と`gpt-image-2-vip`にはそのようなパラメータがなく、黙って無視されます。
  </Accordion>

  <Accordion title="画像に本当にアルファチャンネルがあるかを確認するには">
    Python のスニペットが 1 つあれば十分です:

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA means it has alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # share of fully transparent pixels
    ```

    Mode `RGB` は、アルファチャンネルがまったくないことを意味します。すべての alpha 値が 255 の Mode `RGBA` は、チャンネルは存在するものの、何も切り抜かれていないことを意味します。
  </Accordion>

  <Accordion title="私の prompt にはすでに透明背景と書いてあるのに、なぜパラメータも渡すのですか">
    prompt はそのように描画するようモデルに依頼するだけで、モデルは透明に見えるだけのグレーと白のチェッカーボードを描くことがあります。そうしたピクセルはまだ不透明です。実際のアルファチャンネルを保証するのは、`background: "transparent"`パラメータだけです。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="GPT-Image-2 の概要" icon="image" href="/ja/api-capabilities/gpt-image-2/overview">
    すべてのパラメータ、サイズ、品質ティア、エラーコード
  </Card>

  <Card title="テキストから画像への API リファレンス" icon="wand-sparkles" href="/ja/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations` のすべてのフィールド
  </Card>

  <Card title="画像編集 API リファレンス" icon="scissors" href="/ja/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits` と複数画像の融合
  </Card>

  <Card title="マスクインペインティング" icon="square-dashed" href="/ja/api-capabilities/gpt-image-2/mask-editing">
    変更する領域を示すためにアルファマスクを使用します
  </Card>

  <Card title="公式ルートとリバースルート" icon="git-compare" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    `gpt-image-2` / `-all` / `-vip` の選択
  </Card>

  <Card title="白背景でのアーティファクト" icon="triangle-alert" href="/ja/faq/white-background-image-artifacts">
    純白背景における別の問題
  </Card>
</CardGroup>
