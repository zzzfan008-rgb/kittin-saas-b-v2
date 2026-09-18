> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 透明背景（PNG 切り抜き）で画像を生成するにはどうすればよいですか？

> background: transparent を gpt-image-2 に渡すと、真のアルファチャンネル付き PNG が返ってきます。後処理は不要です。png と webp はどちらも使えますが、jpeg には alpha チャンネルがないため、透明背景とは両立しません。このページでは、すべての画像モデル、最小限の例、およびよくあるエラーを扱います。

## 簡単な回答

**`gpt-image-2`を使用し、リクエストに2つのフィールドを追加します。**

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

画像は実際のアルファチャンネルを持つPNGとして返されるため、切り抜きの後処理は必要ありません。テキストから画像への生成と画像編集の両方でサポートされています。

<Info>
  `background: "transparent"`は、2026-08-21にOpenAIがGPT-Image-2向けに公開した機能です（OpenAIによりプレビューと表示されています）。APIYIはエンドツーエンドで検証済みです。テキストから画像への生成と画像編集の両方で、実際のアルファ透明度が返されます。
</Info>

## 透明な背景を生成できるモデル

| モデル                                                              | 方法                                                                                        | 信頼性                                                      |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2` | **パラメータ** — `output_format`を`png`または`webp`に設定した`background: "transparent"`（3つすべてで同じパラメータ） | ✅ 信頼性が高く、推奨（promptでシーンを説明していない限り。以下を参照）                  |
| `gpt-image-1.5` / `gpt-image-1`                                  | 同じパラメータ                                                                                   | ✅ 信頼性が高い（旧モデル。新しいプロジェクトでは`gpt-image-2.5-flare`を使用してください） |
| `gpt-image-2-all` / `gpt-image-2-vip`                            | **`background`パラメータなし** — promptで指定することしかできません                                            | ⚠️ 信頼性にばらつきがあります。同じpromptでも白い背景で返されることがあります              |
| `seedream-5-0` / `seedream-5-0-pro`                              | prompt内の`output_format: "png"`と`transparent background, alpha channel`                    | ⚠️ prompt次第で、すべての呼び出しでアルファが保証されるわけではありません                |
| Gemini画像モデル（Nano Bananaファミリー）                                    | promptのみ                                                                                  | ⚠️ 上記と同じです                                               |
| `seedream-4-5` / `seedream-4-0`                                  | `jpeg`出力のみで、アルファチャンネルなし                                                                   | ❌ サポートされていません                                            |

<Tip>
  **透明性を確実に必要とする場合は、`gpt-image-2`を使用してください。** パラメータとpromptによるリクエストは同じものではありません。前者はAPIによって保証されますが、後者はモデルが最善を尽くしているだけです。バッチ規模では、その違いが現れます。
</Tip>

## 2つの呼び出し方法

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

通常の写真を渡して、背景を削除するよう依頼します。

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

マスクベースのインペインティング（`mask`）と透明な背景は併用できます。互いに競合することはありません。

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

## プロンプトでシーンを描写しないでください — パラメータでは上書きできません

`background: "transparent"`はアルファチャンネルを保証し、モデルをカットアウトへ誘導するだけです。**プロンプトまたは参照画像が完全なシーンを描写している場合、モデルはそのシーンを描画し**、パラメータで止めることはできません。これが、透明な出力が「うまくいくときもあれば、うまくいかないときもある」最も一般的な理由であり、品質ティアとは関係ありません。

`gpt-image-2.5-sunburst`を使用し、2026-09-11に測定。30回の呼び出し（中品質と高品質が半分ずつ、テキストから画像への生成と参照画像の編集を含む）：

| プロンプト形式                                                                                                   | 実際の透明化                         |
| --------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 被写体のみ（リンゴ、イヤホン、剣士）で、孤立した状態／背景なし                                                                           | 16 / 16、中品質と高品質で同様に安定          |
| シーンを描写：「赤いカエデの葉がある秋の森にいる剣士」                                                                               | 0 / 3、**森全体が描画された**、中品質と高品質で同様 |
| 同じシーンを書き換え：剣士の周囲を数枚のカエデの葉が舞っている + `isolated character on a transparent background, no scenery, no ground` | 2 / 2                          |
| 参照画像に完全な背景があり、プロンプトはシーンのみを描写し、カットアウトを一切求めていない                                                             | 1 / 2、五分五分                     |
| 参照画像に完全な背景があり、プロンプトに`remove the scenery entirely, keep only the subject`と記述                               | 8 / 8                          |

3つの記述ルール：

* ❌ **環境を表す語** — 地面、空、部屋、森 — は避けてください。雰囲気を加えたい場合は、被写体に結び付けてください（「数枚の落ちるカエデの葉」であり、「カエデの森」ではありません）
* ✅ すべてのプロンプトの末尾に`isolated subject on a transparent background, no scenery, no ground, no shadow`を付けてください
* ✅ 参照画像に背景がある場合は、編集プロンプトに`remove the background entirely, keep only the character`と記述してください

`medium`から`high`へ`quality`を引き上げても、**透明化の信頼性は向上しません**。tokensのコストが4倍（439 → 1,756）になるだけです。

## 課金

**透明性に追加料金はかかりません。** 同じ品質ティアとサイズであれば、`background: "transparent"` と `background: "opaque"` はまったく同じ数の image tokens を消費し、`gpt-image-2` に対する通常の token 単位の課金ルールに従って請求されます。

## よくあるエラー

<AccordionGroup>
  <Accordion title="400: JPEG 出力形式では透明な背景はサポートされていません">
    `output_format` は `jpeg` に設定されています。`png` または `webp` に切り替えてください。
  </Accordion>

  <Accordion title="画像は実際には透明ではなく、白背景になっています">
    3 つの点を確認してください。まず、`background` フィールドが実際に API に到達したかを確認します。編集用エンドポイントは `multipart/form-data` なので、JSON ボディのフィールドではなく `-F background=transparent` でなければなりません。次に、レスポンス内のトップレベル `background` が `transparent` を反映しているかを確認します。最後に、`gpt-image-2` を使用しているかを確認します — `gpt-image-2-all` と `gpt-image-2-vip` にはそのようなパラメータがなく、指定しても黙って無視されます。

    3 つすべてに問題がないにもかかわらず、白色または完全な背景が表示される場合、prompt（または参照画像）がほぼ確実に **シーンを描写しています** — モデルは指定された環境を描画しており、パラメータでそれを上書きすることはできません。上記の「prompt でシーンを描写しない」を参照してください。
  </Accordion>

  <Accordion title="画像に実際にアルファチャンネルがあることを確認するにはどうすればよいです">
    Python のスニペット 1 つで十分です。

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA means it has alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # share of fully transparent pixels
    ```

    モード `RGB` は、アルファチャンネルがまったくないことを意味します。すべてのアルファ値が 255 のモード `RGBA` は、チャンネルは存在するものの、何も切り抜かれていないことを意味します。
  </Accordion>

  <Accordion title="prompt にはすでに透明な背景と書いてあるのに、なぜパラメータも渡すのですか">
    prompt はモデルにそのように描画するよう要求するだけであり、モデルが透明に見えるグレーと白の市松模様を描画することがあります — それらは依然として不透明なピクセルです。実際のアルファチャンネルを保証するのは `background: "transparent"` パラメータだけです。逆の場合も同様です。パラメータはチャンネルを保証しますが、prompt で描写されたシーンを上書きすることはできません — この 2 つは連携して機能する必要があります。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="GPT-Image-2の概要" icon="image" href="/ja/api-capabilities/gpt-image-2/overview">
    すべてのパラメータ、サイズ、品質ティア、エラーコード
  </Card>

  <Card title="テキストから画像へのAPIリファレンス" icon="wand-sparkles" href="/ja/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations`のすべてのフィールド
  </Card>

  <Card title="画像編集APIリファレンス" icon="scissors" href="/ja/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits`と複数画像の融合
  </Card>

  <Card title="マスクによるインペインティング" icon="square-dashed" href="/ja/api-capabilities/gpt-image-2/mask-editing">
    変更する領域をアルファマスクで指定
  </Card>

  <Card title="公式リレーとリバースルート" icon="git-compare" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    `gpt-image-2.5-flare` / `sunburst` / `gpt-image-2` / `-all` / `-vip`から選択
  </Card>

  <Card title="白い背景でのアーティファクト" icon="triangle-alert" href="/ja/faq/white-background-image-artifacts">
    純白の背景に関する別の問題
  </Card>
</CardGroup>
