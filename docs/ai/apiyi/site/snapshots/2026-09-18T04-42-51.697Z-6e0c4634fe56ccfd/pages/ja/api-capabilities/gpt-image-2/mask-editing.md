> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# マスクインペインティングガイド

> gpt-image-2 のマスクベースのインペインティングに関する完全ガイド — アルファチャンネルの基礎、マスクの作成と検証、Python/cURL/Node.js の例、エラーのトラブルシューティング

<Info>
  このページは、`gpt-image-2` を `POST /v1/images/edits` 経由で使うローカライズ編集（inpainting）の実践ガイドです。**画像 + マスク + prompt** をアップロードして行います。完全なパラメータリファレンスとインタラクティブな Playground については、[Image Edit API リファレンス](/ja/api-capabilities/gpt-image-2/image-edit) をご覧ください。
</Info>

## コア原則: Alpha チャンネルが編集領域を定義します

ローカライズされた編集リクエストは、3つの部分で構成されます。

```text theme={null}
original image
+ mask image
+ edit prompt
= fully edited image
```

マスクは、PNG の **alpha（透明度）チャンネル** を通じて編集可能な領域を示します。

| マスク領域 | alpha 値 | 効果                        |
| ----- | ------: | ------------------------- |
| 完全透明  |       0 | モデルが編集可能                  |
| 完全不透明 |     255 | 元の状態をできるだけ維持します           |
| 半透明   |   1–254 | 遷移領域。正確なルールとしては依存しないでください |

<Warning>
  **最もよくある間違い**: 編集領域を決めるのは **alpha チャンネル** であり、見えている黒や白のピクセルではありません。

  ```text theme={null}
  Transparent region = the area to modify
  Opaque region      = the area to keep unchanged
  ```

  「黒白に見える」PNG でも alpha チャンネルがなければ、`invalid_image_file` で失敗します。
</Warning>

### 視覚的な例

元の画像が 1024×1024 だとします。

```text theme={null}
┌──────────────────────────┐
│      Opaque region        │
│   keep original intact    │
│                          │
│      ┌──────────┐        │
│      │transparent│       │
│      │→ flowers  │       │
│      └──────────┘        │
└──────────────────────────┘
```

次のような prompt の場合:

```text theme={null}
Replace the cup in the transparent region with a bouquet of white tulips.
Keep everything else unchanged, preserving the original lighting,
camera angle, and photographic style.
```

## マスクはハードクロップではありません

GPT Image のマスクは、フォトショップの選択範囲のような絶対的なピクセルレベルの制約ではありません。公式には、マスク編集は引き続き prompt ガイド型編集であり、モデルはマスクを参照として使用しますが、すべてのピクセル境界への厳密な準拠は保証しません。

そのため、次のような現象が見られることがあります。

* マスク外の影がわずかに変化する
* オブジェクトのエッジがマスクの外側まで伸びる
* 照明や反射が連動して変化する
* 背景がわずかに再描画される
* マスク境界付近に遷移効果が出る

これは自然なブレンディングには適していますが、ピクセル単位での完全な保持が必要な場合には適しません（下の「マスク外のコンテンツを厳密に保持する」を参照してください）。

### 編集の安定性を高める

「赤いシャツに変えて」とだけ書かず、代わりに次のように書いてください。

```text theme={null}
Only modify the transparent region of the mask. Replace the person's top
with a plain red crew-neck cotton T-shirt. Keep the face, hair, body pose,
arms, background, composition, camera angle, lighting direction, and image
dimensions unchanged. The new shirt must fit the body naturally and
preserve the original photographic realism.
```

実践的なヒント:

1. マスクは対象オブジェクトのエッジより少し大きめにします
2. オブジェクトの中心だけを覆わず、エッジ、影、反射も含めます
3. 変えてはいけないものを明示的に指定します
4. 編集領域が小さすぎる場合は、マスクを広げます
5. 絶対的な保持が必要な場合は、最後に自分でピクセル合成を行います（下記参照）

## マスクを使うべきか、使わないべきか？ promptのみ編集とのトレードオフ

よくある疑問です：**現代のAIは、平易な言葉だけで「指した場所をそのまま編集する」ことがすでにできるのに、なぜわざわざマスクを作るのでしょうか？**

確かに、`gpt-image-2`はマスクなしでも、「テーブルの左側にあるカップを花に置き換えて」と伝えるだけで、たいていは適切な場所を編集します。指示追従性能は強く、気軽な編集なら prompt だけで十分です。ですが、マスクが解決するのは、**言語が曖昧な場合、または曖昧ではなくてもまだ十分に信頼できない場合**です：

| シナリオ                                        | promptのみ               | prompt + マスク          |
| ------------------------------------------- | ---------------------- | --------------------- |
| フレーム内に対象物が1つしかない                            | ✅ 十分。マスクは過剰です          | 不要                    |
| 似た対象物が複数あり、1つだけ編集する（中央の人物の服装だけを変える）         | ⚠️ 別の個体に当たりやすい         | ✅ 空間的に固定され、曖昧さがゼロ     |
| 厳密な境界が必要な場合（商品写真 / UI スクリーンショット / ID レイアウト） | ❌ 画像全体を再生成するため、領域がずれます | ✅ ピクセル合成により、厳密に変わりません |
| バッチパイプライン（固定レイアウトで同じ領域を繰り返し置き換える）           | ⚠️ 実行ごとに不安定            | ✅ マスクはプログラム化でき、再現可能です |
| 正確な形状 / 位置制御（物体を正確な座標へ移動する）                 | ❌ 言語ではピクセル位置を表現できません   | ✅ マスク自体がピクセル座標です      |

研究結果も同じ方向を示しています。マスクなし（純粋にテキスト駆動）の編集は、精密な空間制御が苦手です。たとえば prompt-to-prompt 系の手法は、フレーム内で物体を**空間的に移動**させることができませんし、暗黙の編集領域がずれると、「変わるべき部分が変わらず、変わるべきでない部分が変わってしまう」という状態になります。マスクベースの編集は、少しの手軽さと引き換えに、明示的な空間精度を得られます。

<Tip>
  **一言で言うと**: マスクは時代遅れの技術ではなく、「必須」から「精密制御ツール」へと役割が変わりました。カジュアルなチャット風の編集 → prompt だけで十分。本番ワークロードで、再現性・制御性・境界厳守が必要 → マスクを使ってください。また、`gpt-image-2`を使った promptのみ編集は実質的に **全体画像再生成** なので、指定していない領域も変わる可能性があります。だからこそ、マスク + ピクセル合成があるのです。
</Tip>

## 一目でわかるファイル要件

| 項目          | 要件                                               |
| ----------- | ------------------------------------------------ |
| 画像形式        | PNG / JPG / WebP、各50MB未満                         |
| 入力画像の数      | 最大16枚（`image[]`フィールドを繰り返してください）                  |
| マスク形式       | **アルファチャンネル付きの PNG（必須）**                         |
| マスクの寸法      | **最初の**画像と**完全に一致**している必要があります（1ピクセルでもずれると失敗します） |
| マスクのファイルサイズ | **4MB未満**                                        |
| マスクの適用範囲    | `image[0]` にのみ適用されます（最初の画像）                      |

複数画像で編集する場合の役割割り当て:

```text theme={null}
image[0]  = the main editing canvas
image[1…] = reference images
mask      = applies only to image[0]
```

<Tip>
  「寸法が完全に一致している」と聞くと面倒そうですが、サイズを手作業で合わせる必要はありません。マスクは元の画像から派生するため（そのコピー上で消去・ブラシ・セグメンテーションを行います）、寸法は自動的に一致します。下の [マスクはどこから来るのか](#where-do-masks-come-from-five-common-methods) をご覧ください。
</Tip>

## Python の例

```python theme={null}
import base64
from pathlib import Path
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("input.png", "rb") as image_file, \
     open("mask.png", "rb") as mask_file:

    result = client.images.edit(
        model="gpt-image-2.5-sunburst",
        image=image_file,
        mask=mask_file,
        prompt=(
            "Only modify the transparent region of the mask. "
            "Replace the white cup on the table with a bouquet of white tulips. "
            "Keep the table, background, camera angle, composition, and lighting unchanged. "
            "The bouquet should sit naturally where the cup was, casting shadows "
            "consistent with the original lighting."
        ),
        size="1536x1024",
        quality="high",
        output_format="png",
        n=1,
    )

image_bytes = base64.b64decode(result.data[0].b64_json)
Path("edited.png").write_bytes(image_bytes)
print("Saved: edited.png")
```

<Warning>
  **`input_fidelity="high"` を渡さないでください** — 3つのモデルはいずれも、デフォルトで常に高忠実度で入力画像を処理します。API ではこのパラメータの調整はできません。渡すと 400 エラーが返されます（2026-09-09 に 2.5 で検証済み）。単に省略してください。
</Warning>

## cURL の例

画像編集エンドポイントには `multipart/form-data` が必要です — 画像とマスクをプレーンな JSON フィールドとして送信することはできません：

```bash theme={null}
curl -s \
  -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-sunburst" \
  -F "image[]=@input.png;type=image/png" \
  -F "mask=@mask.png;type=image/png" \
  -F "prompt=Only modify the transparent region of the mask. Replace the cup on the table with a bouquet of white tulips. Keep everything else unchanged, preserving the original composition, lighting, and photographic realism." \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "output_format=png" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > edited.png
```

単一の画像を使用する場合でも、公式の例と同じ `image[]` フィールド名を使用してください。

<Warning>
  `-F` を使用する場合、`-H "Content-Type: multipart/form-data"` を**手動で設定しないでください**。curl は `boundary` を自動的に生成する必要があります。ヘッダーを手動で設定すると boundary が失われ、サーバーはファイルを解析できません。
</Warning>

## Node.jsの例

````javascript theme={null}
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({
  apiKey: "sk-your-api-key",
  baseURL: "https://api.apiyi.com/v1",
});

const image = await toFile(
  fs.createReadStream("input.png"),
  "input.png",
  { type: "image/png" }
);

const mask = await toFile(
  fs.createReadStream("mask.png"),
  "mask.png",
  { type: "image/png" }
);

const result = await client.images.edit({
  model: "gpt-image-2.5-sunburst",
  image,
  mask,
  prompt:
    "Only modify the transparent region of the mask. Replace the white cup " +
    "on the table with a bouquet of white tulips. Keep the background, " +
    "composition, camera angle, and lighting unchanged.",
  size: "1536x1024",
  quality: "high",
  output_format: "png",
});

const imageBuffer = Buffer.from(result.data[0].b64_json, "base64");
fs.writeFileSync("edited.png", imageBuffer);
console.log("Saved: edited.png");
```。

## マスクはどこから来るのか？ 5つの一般的な方法

人はしばしばマスクを難しく感じます — 「元の画像と1ピクセル単位で一致していなければならない」と思うからです。ここで重要なのは、**マスクをゼロから描くことはほとんどなく、元の画像から導き出す**という点です。コードでも、写真編集ソフトでも、Web キャンバスでも、流れは常に「元画像を開く → その上で領域を指定する → 書き出す」です。そのため、寸法の一致は**自動的**です。

| 方法 | 適した用途 | 手間 |
|------|------|------|
| ① コード生成（PIL で領域を描画） | 固定レイアウトのバッチ処理、座標が既知の場合 | 低（数行） |
| ② 写真編集ソフトで手動消去 | 単発の精密編集、複雑な形状 | 低（基本的な選択スキル） |
| ③ Web ブラシキャンバス | 「ブラシで編集」を自社プロダクトに組み込む | 中（フロントエンドの Canvas） |
| ④ AI 自動セグメンテーション（SAM ファミリー） | ワンクリック / 一言 → 高精度マスク | 中（セグメンテーションサービスのデプロイまたは呼び出し） |
| ⑤ 白黒マスクを alpha に変換 | 他のツールの白黒マスクを利用する | 低（数行） |

### 方法 1: プログラムで透明マスクを生成する

長方形領域を透明（編集可能）に設定します:

```python
from PIL import Image, ImageDraw

original = Image.open("input.png").convert("RGBA")

# Fully opaque by default: preserve everything
mask = Image.new("RGBA", original.size, (255, 255, 255, 255))

draw = ImageDraw.Draw(mask)

# Make the target region fully transparent: editable
# Coordinates: (left, top, right, bottom)
draw.rectangle((300, 250, 750, 800), fill=(0, 0, 0, 0))

mask.save("mask.png")
print("Mask size:", mask.size)
````

* `(255, 255, 255, 255)` = 不透明、保持する領域
* `(0, 0, 0, 0)` = 透明、編集可能な領域

### 方法 2: 写真編集ソフトで手動消去する

透明 PNG をサポートする任意のエディタ（Photoshop、GIMP、Krita、Photopea など）ならマスクを作成できます。要するにやることは1つで、**編集したい領域を消去して透明にする**ことです。Photoshop では:

1. **元画像のコピー**を開きます（元画像そのものを編集すると、寸法の一致が保証されます）
2. レイヤーがロックされた「Background」の場合は、ダブルクリックして通常レイヤーに変換します（背景レイヤーは透明をサポートしていません）
3. Lasso / Quick Selection / Object Selection ツールで、変更したい領域を選択します
4. Delete を押します — 選択範囲が透明なチェッカーボードになります
5. 「PNG として書き出し」（透明を有効にする）— これで有効な alpha マスクになります

GIMP でも考え方は同じです: `Layer → Transparency → Add Alpha Channel`、選択し、Delete して、PNG として書き出します。

<Tip>
  形は長方形にまったく限定されません — なげなわで対象をなぞったり、スマート選択で被写体をワンクリックしたりすれば、消去された透明領域はどんな不規則な形にもなります。選択範囲を**オブジェクトの輪郭より数ピクセル外側まで**広げて（Photoshop: `Select → Modify → Expand`）、影やエッジも含めます。
</Tip>

### 方法 3: Web ブラシキャンバス

AI 写真アプリで見かける「変更したい部分をブラシでなぞる」という操作は、ブラウザ上でリアルタイム生成される alpha マスクにすぎません。これは単一の Canvas API プロパティを中心に構築されています。下の [ブラシ式編集の仕組み](#mask-shapes-and-how-brush-style-editing-works) を参照してください。

### 方法 4: AI セグメンテーションによるワンクリックマスク

ブラッシングでさえ手間に感じるなら、セグメンテーションモデルに任せましょう。Meta のオープンソース **SAM (Segment Anything Model)** ファミリーが主流の選択肢です:

* **クリックしてマスク**: オブジェクトを1回クリックすると、モデルがピクセル精度の輪郭を返します（髪の毛の先端レベルまで）
* **テキストでマスク**: **SAM 3** は 2025年11月にオープンソース化され、「黄色いタクシーすべて」や「赤いユニフォームを着た選手たち」のようなコンセプトレベルのテキスト prompt を受け取り、一致する各インスタンスのマスクを返します（モデルとコードは `github.com/facebookresearch`、概要は `ai.meta.com`）
* **被写体 / 背景の分離**: `rembg` のようなオープンソースツールは、1つのコマンドで被写体を背景から分離します — 背景領域はそのまま「背景だけを変更する」マスクとして使えます

セグメンテーションの出力は通常、白黒のビットマップです。下の「方法 5」で変換してください。Stable Diffusion コミュニティの **Inpaint Anything** 拡張機能と ComfyUI の Mask Editor は、まさにこのパイプライン — 「SAM セグメンテーション + ブラシで微調整 → マスク → inpaint」 — を実装した成熟した例で、参考にする価値があります。

### 方法 5: 白黒マスクを alpha マスクに変換する

すでに「黒 = 編集、白 = 保持」のマスクがあるなら:

```python theme={null}
from PIL import Image

bw_mask = Image.open("mask_bw.png").convert("L")

rgba_mask = Image.new("RGBA", bw_mask.size, (255, 255, 255, 255))

# Black (0)   → alpha 0   → transparent → edit
# White (255) → alpha 255 → opaque      → keep
rgba_mask.putalpha(bw_mask)

rgba_mask.save("mask.png")
```

### アップロード前にマスクを検証する

多くの `invalid_image_file` エラーは、ファイルに `.png` 拡張子が付いていても RGB チャンネルしかなく、アルファチャンネルがないことが原因です。アップロード前にこれを実行してください:

```python theme={null}
from PIL import Image

image = Image.open("input.png")
mask = Image.open("mask.png")

print("Mask format:", mask.format)
print("Mask mode:", mask.mode)
print("Mask size:", mask.size)

assert mask.format == "PNG", "Mask must be a PNG"
assert mask.mode in ("RGBA", "LA"), "Mask must contain an alpha channel"
assert image.size == mask.size, "Image and mask dimensions must match exactly"

alpha = mask.getchannel("A")
assert alpha.getextrema()[0] == 0, "Mask has no fully transparent editable region"

print("Mask check passed")
```

## マスクの形状とブラシ式編集の仕組み

### マスクはどんな不規則な形でもよい

マスクは本質的には**ピクセルごとのビットマップ**であり、幾何学的な形ではありません。各ピクセルがそれぞれ独自のアルファ値を持ちます。つまり:

* 長方形や円は、もっとも単純な例にすぎません
* 人物のシルエット、髪の毛の端、フリーハンドの落書き、あるいは複数に分かれた断片もすべて有効です
* 実際には**ほとんどのマスクは不規則**で、対象物の輪郭に沿い、少し広げた形になります

<Tip>
  唯一の「形状のアドバイス」はルールではなく結果についてのものです。透明領域は**対象物を縁、影、反射まで含めて完全に覆う**ようにしてください。モデルが自然にブレンドする余裕を持てるよう、少し大きめに見積もるのがよいです。
</Tip>

### ブラシ式編集の実装方法

写真アプリでの「変更したい場所をブラシでなぞる」操作は、フロントエンドでは驚くほど単純です。\*\*2枚のレイヤーを重ね、ブラシで上のレイヤーを透明に「消していく」\*\*だけです。

```text theme={null}
Bottom <img>     shows the original (visual reference only, not exported)
Top <canvas>     same pixel dimensions as the original, initially fully opaque
                 wherever the brush passes → pixels become transparent
Export canvas    → a valid alpha-mask PNG
```

中核は1行です — キャンバスの合成モードを`destination-out`に設定します（新しいストロークが既存ピクセルを「切り抜く」）:

```javascript theme={null}
const canvas = document.getElementById("mask-canvas");
const ctx = canvas.getContext("2d");

// 1. Canvas size = the image's natural pixel size (not its CSS display size);
//    matching dimensions come for free
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;

// 2. Start fully opaque = preserve everything
ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 3. The key line: switch the brush to "erase" mode — strokes become transparent
ctx.globalCompositeOperation = "destination-out";
ctx.lineWidth = 40;          // brush size
ctx.lineCap = "round";
ctx.strokeStyle = "rgba(0, 0, 0, 1)";

// 4. Draw on pointer events (convert display coordinates back to natural pixels)
canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;
  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  ctx.lineTo(event.offsetX * scaleX, event.offsetY * scaleY);
  ctx.stroke();
});

// 5. Export: a PNG mask with an alpha channel, ready to upload
canvas.toBlob((blob) => {
  const formData = new FormData();
  formData.append("mask", blob, "mask.png");
  // POST to /v1/images/edits together with the image and prompt
}, "image/png");
```

重要な実装ポイント:

1. **座標変換**: キャンバスは通常ページ上で CSS により縮小表示されています。ストローク座標を`naturalWidth / clientWidth`で元に戻さないと、マスクがずれてしまいます
2. **元に戻す**: 各ストロークの前に`ctx.getImageData()`でスナップショットを取り、`putImageData()`で復元します
3. **マスクの膨張**: ユーザーは対象物の中心だけをブラシでなぞりがちです。送信前にプログラムでマスクを数ピクセル広げます（プロ向けツールの「マスクを拡張」ボタン）。Python 側では`PIL.ImageFilter.MaxFilter`または OpenCV の`cv2.dilate`を使います
4. **半透明プレビュー**: ユーザー向けのハイライト（たとえば半透明の赤）は**別のプレビューレイヤー**に描画し、書き出すマスクレイヤーは厳密に二値の不透明/透明に保ちます

### さらに進める: クリックまたはテキストでマスクを作る

ブラシの一歩先は、「人間のストローク」を「モデル推論」に置き換えることです:

```text theme={null}
User clicks an object            → SAM returns a pixel-accurate outline mask
User types "the cup on the left" → SAM 3 finds all instances matching the concept
Program dilates + feathers       → submit to /v1/images/edits
```

これこそが Inpaint Anything と ComfyUI の Mask Editor の仕組みです。**セグメンテーションが精度を担い、ブラシが修正を担います**。まず正確なマスクを自動生成し、その後に追加・削除のブラシストロークで微調整します。自社プロダクトでは、ブラシキャンバスをフォールバックとして残しつつ SAM をバックエンドサービスとして配置する構成が、現時点で最もよい UX の組み合わせです。

## 複数の参照画像 + マスク

典型的なシナリオ：衣装の入れ替え（1枚目は人物、続いてスタイル / 生地の参照画像；マスクは衣服の領域を示します）：

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("person.png", "rb") as person, \
     open("clothes_reference.png", "rb") as clothes, \
     open("fabric_reference.png", "rb") as fabric, \
     open("mask.png", "rb") as mask:

    result = client.images.edit(
        model="gpt-image-2.5-sunburst",
        image=[person, clothes, fabric],
        mask=mask,
        prompt=(
            "The first image is the subject to edit. "
            "Only modify the clothing inside the transparent mask region "
            "of the first image. Use the garment style from the second image "
            "and the fabric texture from the third image. Keep the face, "
            "hairstyle, pose, body proportions, background, and lighting "
            "of the first image unchanged."
        ),
        quality="high",
        size="1024x1536",
        output_format="png",
    )

with open("result.png", "wb") as output:
    output.write(base64.b64decode(result.data[0].b64_json))
```

<Tip>
  複数の画像を使用する場合、プロンプトでは**各画像の役割**（1枚目 = 被写体、2枚目 = スタイルの参照、3枚目 = 生地の参照）を明確に説明する必要があります。そうしないと、モデルが画像を混同する可能性があります。
</Tip>

## マスク外を厳密に保持する（ピクセルレベルの後処理）

モデルはマスク外の内容をわずかに変更することがあるため、ピクセル精度が重要なケース（商品写真、IDレイアウト、固定されたUIスクリーンショット）では、生成後にマスク外の領域を元画像から合成し直します。

```python theme={null}
from PIL import Image, ImageFilter

original = Image.open("input.png").convert("RGBA")
edited = Image.open("edited.png").convert("RGBA")
mask = Image.open("mask.png").convert("RGBA")

if edited.size != original.size:
    edited = edited.resize(original.size, Image.Resampling.LANCZOS)

# Original mask alpha: 0 = edit region, 255 = preserved region
alpha = mask.getchannel("A")

# Inverted: 255 = use edited result, 0 = use original
edit_area = alpha.point(lambda value: 255 - value)

# Slight feathering to avoid hard edges
edit_area = edit_area.filter(ImageFilter.GaussianBlur(radius=3))

final = Image.composite(edited, original, edit_area)
final.save("final.png")
```

結果: マスク内はAIによる編集、マスク外は元の画像で、境界は軽くフェザー処理されています。

## よくあるエラー

<AccordionGroup>
  <Accordion title="invalid_image_file / 無効な画像ファイルまたはモード">
    主な原因:

    * マスクが有効な PNG ではない、またはファイルが破損している
    * 拡張子は PNG でも、実際のエンコーディングが PNG ではない
    * 異常な画像モード（CMYK、パレットモード、アルファなし）
    * アップロード時の MIME type が正しくない
    * リクエスト前にファイルストリームがすでに読み取られているか、閉じられている

    再エンコードでほとんどのケースは解決します:

    ```python theme={null}
    from PIL import Image

    Image.open("input_source.jpg").convert("RGBA").save("input.png")
    Image.open("mask_source.png").convert("RGBA").save("mask.png")
    ```
  </Accordion>

  <Accordion title="画像とマスクのサイズが一致しません">
    1ピクセルでも違うと失敗します。修正方法:

    ```python theme={null}
    from PIL import Image

    image = Image.open("input.png")
    mask = Image.open("mask.png").convert("RGBA")

    mask = mask.resize(image.size, Image.Resampling.NEAREST)
    mask.save("mask_fixed.png")
    ```
  </Accordion>

  <Accordion title="白黒マスクにはアルファチャンネルがありません">
    `RGB` / `L` / `P` モードだけでは不十分です — マスクは `RGBA` である必要があります。変換するには上の「方法 2」を使ってください。
  </Accordion>

  <Accordion title="マスクの透明度と出力の透明度は別物です">
    この 2 つは混同しやすいです:

    ```text theme={null}
    Mask transparency:   marks "the model may change this area" — the alpha channel of the mask file
    Output transparency: the result itself carries an alpha channel — controlled by the background parameter
    ```

    これらは **連携して動作します**: 編集領域を示すためにアルファ付きの `mask` を渡し、透明な結果を得るために `background: "transparent"` を使います。検証済みです — この 2 つは競合しません。

    出力の透明化には `output_format` が `png` または `webp` である必要があります。これを `jpeg` と組み合わせると 400 が返されます（jpeg にはアルファチャンネルがありません）。詳細: [透明な背景の画像を生成するにはどうすればよいですか](/ja/faq/image-transparent-background)。
  </Accordion>

  <Accordion title="response_format=url では画像が返されません">
    GPT Image モデルは常に Base64 データを返します。`response_format` は旧来の DALL·E 2 の動作にのみ適用されます。結果は次のように読み取ります:

    ```python theme={null}
    result.data[0].b64_json
    ```
  </Accordion>

  <Accordion title="Content-Type が multipart/form-data ではありません">
    通常は、`Content-Type` ヘッダーを手動で設定してしまい（boundary が失われる）、または中間層が multipart リクエストを転送前に JSON として解析してしまうことが原因です。HTTP クライアントに multipart ヘッダーを自動生成させてください。
  </Accordion>
</AccordionGroup>

## サイズパラメータ

`gpt-image-2` は柔軟なサイズに対応しており、以下の条件がすべて適用されます:

```text theme={null}
Width and height must both be multiples of 16
Longest side no more than 3840px
Aspect ratio no more than 3:1
Total pixels at least 655,360
Total pixels no more than 8,294,400
```

一般的なサイズ: `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, `2048x1152`, `3840x2160`, `2160x3840`, `auto`. 正方形の画像は通常、より高速に生成されます。

## 本番リクエストテンプレート

```python theme={null}
result = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=open("input.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="""
Only edit the transparent region of the mask.

Edit task:
Replace the white mug inside the transparent region with a bouquet
of white tulips.

Must preserve:
- Original composition
- Camera position and lens perspective
- Table surface and background
- Lighting direction and color temperature
- All people and objects outside the mask
- Realistic photographic style

Blending requirements:
The bouquet should sit naturally where the mug was, with shadows,
reflections, and contact points consistent with the scene lighting.
Do not add any other objects.
""",
    size="1536x1024",
    quality="high",
    output_format="png",
)
```

## 関連ページ

<CardGroup cols={2}>
  <Card title="画像編集 API リファレンス" icon="image" href="/ja/api-capabilities/gpt-image-2/image-edit">
    完全なパラメータリファレンスとインタラクティブなプレイグラウンド
  </Card>

  <Card title="GPT-Image-2 概要" icon="sparkles" href="/ja/api-capabilities/gpt-image-2/overview">
    モデルの機能、料金、バージョンに関する注記
  </Card>
</CardGroup>

<Info>
  公式リファレンス（ブラウザにコピーしてください）：

  * モデルページ：`developers.openai.com/api/docs/models/gpt-image-2.5-sunburst`、`developers.openai.com/api/docs/models/gpt-image-2`
  * 画像編集 API リファレンス：`developers.openai.com/api/reference/python/resources/images/methods/edit/`
  * 画像生成ガイド：`developers.openai.com/api/docs/guides/image-generation`
</Info>
