> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# マルチ画像フュージョン テストガイド

> お客様からは、参照画像の上限が Google の公式上限（14枚）と一致するかどうかをよく尋ねられます。ここでは、再利用できる2つのテスト方法と、私たち自身で実施した14画像フュージョンの実測テストをご紹介します。

よくあるご質問です: **「サポートしている参照画像の枚数は公式の上限と一致していますか？」** Google の公式 Gemini 画像モデルは、1リクエストあたり **14 枚の参照画像** まで対応しており、これは現時点で業界最高の上限です。答えは **はい、対応しています**。ただし、「対応しています」というだけでは口頭の主張にすぎません。このページでは、あなた自身で再現できるテスト手法に加えて、実際に行った 14 枚画像の融合テストの結果も紹介します。

## 自分で試す価値がある理由

14枚の参照画像は**極端なケース**です。日常利用ではまず遭遇しないかもしれませんが、複数の独立して設計された要素を1つの合成物（ポスターやキャンペーンビジュアル）にまとめる必要があるなら、次の2点を確認する必要があります。

1. **呼び出しは実際に成功するか？** 14枚の画像を重ねるとリクエスト本文がかなり大きくなりますが、大きすぎるとして拒否されないでしょうか？
2. **融合結果は妥当か？** これだけ多くの入力画像があると、モデルが一部を落としたり、要素を誤った場所に配置したり、混同したりしないでしょうか？

以下の2つの方法は、それぞれこの2点のどちらかを狙っています。また、どちらも主観的な美的判断には依存しません。結果が正しいかどうかは一目で判断できます。

## 方法1: オブジェクトマーカー・テスト（まずこれを行います）

**考え方**: 複雑な現実世界のシーンの代わりに、視覚的に明確に異なり、個別に数えられるN枚のカードを生成します。最もシンプルな形は1から14までの数字です。次に、モデルにそれらを1枚の画像にコラージュ／融合するよう依頼します。

* 各カードに、まったく異なる配色と素材スタイル（ネオンチューブ、ブラッシュドメタル、チョークの手書き、ピクセルアート、彫刻木材…）を与えて、融合後の結果で**すべての数字が、色とスタイルだけで元のカードまでたどれる**ようにします；
* 融合後は、目視で確認するだけです。**14個の数字がすべて含まれていて、重複も欠落もないか？** 「見栄えが良いか」を判断する必要はありません。見るべきなのは「完全で正しいか」だけです。

<Frame caption="14 visually distinct number cards fused into a single poster: 1–14 all clearly legible, each retaining the color and material style of its source image">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-numbers-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=7d15943d875496202258495a5b0267d9" alt="14枚の創作的な数字カードを、3行×5列のグリッドポスターに融合し、各数字がそれぞれ独自の色と素材スタイルを保っている" width="1600" height="1600" data-path="images/multi-image-fusion-14-numbers-demo.jpg" />
</Frame>

この手法の価値は、**ノイズを取り除くこと**にあります。モデルが最も基本的な確認――「数字は正しいか」――を正しくこなせるなら、それは本当にすべての入力画像を処理しており、単にいくつかをランダムに選んでいるだけではないことの強い証拠になります。

## 方法 2: 実シナリオ分解テスト

**アイデア**: 生成したい実際のシーンを N 個の独立した要素に分解して別々に生成し、その後、モデルにそれらを1つのシーンへ再統合させます。これは実際の用途により近く、たとえばキャラクター、衣装、小道具、背景を別々に管理してから、最終的なショットを合成するようなケースです。

例として、私たちはファッション・エディトリアルのシーンを 14 個の独立した要素に分解しました。モデルのポートレート、アウター、車両、背景、ペット/アクセサリー、バッグ、ジュエリー、履物、荷物などです。各要素は、統一されたスタイル基準（たとえば、すべて「薄いグレーのスタジオ背景、リアルな写真表現」を背景に撮影）で、単独の画像として生成しています。

<Frame caption="14 independently generated fashion elements (model, outfit, car, pet, bag, accessories, etc.) fused into a single fashion editorial scene — all elements present, composition coherent">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-fashion-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=03cb3f755876ce41b2a49fed3c526dfe" alt="14 個の独立したファッション要素を1つの完成したファッション・エディトリアルのシーンに統合し、モデルはピンクの車に寄りかかり、オウム、犬、ハンドバッグなどの要素がすべて含まれている" width="1194" height="1600" data-path="images/multi-image-fusion-14-fashion-demo.jpg" />
</Frame>

確認すること: **ショット内に 14 個すべての要素が存在しているか**、配置やスケールが整合しているか、そして明らかな要素の欠落や歪みがないかです。実シナリオの融合は、自然に「数字のコラージュ」より難しくなります（異なる要素に対して照明と遠近感を統一する必要があるため）ので、このステップは、複雑で実際の業務シナリオにおける融合品質をより現実的に পরীক্ষাするものです。

<Tip>
  **両方の方法** を実行することをおすすめします。方法 1 は「モデルが各入力画像を本当に処理したか」を確認し、方法 2 は「複雑な実シナリオでも融合品質が十分か」を確認します。方法 2 だけを実行すると、失敗の切り分けが難しくなります。原因が「モデルが画像を1枚見落とした」のか、それとも「構図があまり良くない」のかを判断できないためです。
</Tip>

## リクエスト形式: 14枚の画像を1回のリクエストに収める

Gemini のネイティブ形式では、マルチ画像融合のルールはシンプルです: **1つの`text`パート（融合指示）+ N 個の`inlineData`パート（参照画像1枚につき1つ）**。各パートは `text` または `inlineData` のどちらか一方しか指定できず、両方を同時には指定できません。

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# Up to 14 reference images
image_paths = ["01.png", "02.png", "03.png", "..."]  # max 14
parts = [{"text": "Fuse the elements from these images into a single coherent scene, keeping the style consistent and the composition balanced"}]
for path in image_paths:
    parts.append({"inlineData": {"mimeType": "image/png", "data": to_b64(path)}})

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "1:1", "imageSize": "2K"}
        }
    },
    timeout=600  # more images and a larger request body — allow a generous timeout
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("fused.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

完全なマルチ画像編集フォーマット（`parts` の構造、よくあるエラー）については、[Image Edit API リファレンス](/ja/api-capabilities/nano-banana-image/image-edit) と [Nano Banana シリーズ開発ガイド](/ja/api-capabilities/nano-banana-dev-guide) を参照してください。

## お客様が最も気にする疑問: 大きなリクエストは拒否されるのか？

圧縮していない元画像を14枚送ると、リクエスト本文は確かにかなり大きくなります。実際の数値でテストしたところ、実測では次のとおりでした（2K解像度の画像14枚、圧縮なし）:

| 項目                  | 測定値                          |
| ------------------- | ---------------------------- |
| 元画像1枚のサイズ           | 約1.7MB – 4.0MB               |
| 14枚合計（Base64エンコード後） | **約42～43MB**                 |
| リクエスト結果             | **すべて成功** — ペイロードサイズによる拒否はなし |

<Info>
  APIYIの1リクエストあたりの画像ペイロード上限は**100MB**です（過剰なメモリ使用を避けるための同期呼び出しの場合）。1枚の画像はGoogleの公式ルールどおり、**7MB以下**である必要があります。今回の2K画像14枚は合計42～43MBで、どちらの上限にも十分収まっていたため、呼び出しは問題なく通りました。
</Info>

**結論**: 圧縮しなくても、2Kの参照画像14枚なら通常はペイロード上限に達しません。とはいえ、**圧縮は依然として推奨されます**。未圧縮のアップロードが拒否されるからではなく、圧縮したほうが**明らかに速く**完了するからです（今回のテストでは、同じ融合タスクが圧縮後におおむね1/2～1/3の時間で終わりました。これは、はるかに大きいペイロードの転送とサーバー側デコードを省けるためです）。具体的な圧縮パラメータ（目標とする最長辺、JPEG品質、複数画像の合計サイズ予算）については、[画像圧縮と出力解像度](/ja/api-capabilities/image-compression-resolution) をご覧ください。

## 画像が返ってこない場合は、まず安全性ブロックを確認してください

マルチ画像の融合タスクでは、`finishReason: IMAGE_SAFETY` に遭遇することがあります（HTTP ステータスは 200 のままですが、`content.parts` は空です）。テストでは、**まったく同じ入力を 1 回か 2 回再試行すると成功することがよくあります**。この種のブロックにはある程度のランダム性があり、必ずしも入力に実際の問題があるとは限りません。

<Tip>
  安全性上の理由でブロックされた画像は**課金されません**。統合には、`IMAGE_SAFETY` に対する自動リトライを組み込むことをおすすめします。その他のエラー種別（安全性ブロック、コンテンツモデレーション、タイムアウト）とその対処方法については、[Gemini Image API エラーハンドリング ガイド](/ja/api-capabilities/gemini-image-error-handling)を参照してください。
</Tip>

## クイックリファレンス

* Google の公式上限は**1リクエストあたり 14 枚の参照画像**です。APIYI は完全サポートを確認済みで、呼び出しは成功し、フュージョン結果も整合性があります。
* 自分でテストする場合は、**両方の方法**を実行してください。数字カードテストで完全性を検証し、実シナリオ分解テストでフュージョン品質を検証します。
* 2K の元画像 14 枚は合計で約 40MB です。**APIYI の 100MB のリクエスト上限と Google の 画像ごとの 7MB 制限のどちらにも十分収まる**ため、拒否されません。処理を速くするためにも、圧縮は引き続き推奨です。
* マルチ画像リクエストの構成は、**1 つの text 部分 + N 個の inlineData 部分**です。同じ部分に両方を含めないでください。
* `IMAGE_SAFETY` 付きで空の画像が返ってきた場合は、まず 1〜2 回再試行してください。成功することが多く、ブロックされた画像は課金されません。

## 関連ドキュメント

* [Nano Banana シリーズ デベロッパーガイド](/ja/api-capabilities/nano-banana-dev-guide)
* [画像圧縮と出力解像度](/ja/api-capabilities/image-compression-resolution)
* [Gemini Image API エラーハンドリングガイド](/ja/api-capabilities/gemini-image-error-handling)
* [満足のいく画像を得る方法](/ja/api-capabilities/image-generation-success-tips)
