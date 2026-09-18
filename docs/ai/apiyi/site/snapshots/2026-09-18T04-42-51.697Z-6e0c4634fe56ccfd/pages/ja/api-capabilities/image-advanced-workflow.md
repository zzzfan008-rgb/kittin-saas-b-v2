> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 高度な画像生成: ワークフローとリアリズム

> 同じモデルでも、出力をさらに良くするものとは何か。消費者向け画像アプリがAPIの上に追加しているもの、つまり prompt の書き換えレイヤー、リファレンス固定、視覚モデル選択を伴う並列サンプリング、そして段階的なレタッチです。コピペで使えるリアリズム用語集、並列比較テスト、コスト計算も含みます。

[あなたが望む画像を手に入れる方法](/ja/api-capabilities/image-generation-success-tips) は、「この1回の試行は失敗した、どうやって立て直す？」に答えます。このページは次の問いに答えます: **どうすれば毎回うまく決められるのか**。

よくある疑問があります。`freepik.com` や `higgsfield.ai` のようなコンシューマー向け画像製品は、あなたが使っているのと同じ基盤モデル、つまり同じ Nano Banana、GPT-Image、FLUX 系列で動いています。それでも、出力はより完成度が高く見えます。その差はモデルの重みにあるのではありません。**モデルの周りに重ねられたレイヤーにあります**。そして、そのレイヤーは自分で構築できます。このページでその方法を示します。

## 1. 消費者向け画像プロダクトがモデルの周りに重ねているもの

これらのプロダクトを分解すると、モデルの外側におよそ8層あることが分かります。どの層も API で再現できます。

| プロダクトが行うこと                                                                           | 解決する課題                                           | API上での再現方法                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------- |
| **prompt書き換えレイヤー**（prompt強化）                                                         | ユーザーはラフに書き、モデルは構造化された説明を求めます                     | まずテキストモデルに書き換えさせてから、画像モデルを呼び出します（第2節）                         |
| **スタイルプリセット**（数十個のクリック可能なプリセットに加え、保存済みのカスタムプリセット）                                    | 写真用語を知らなくてもよいように、見た目のテイストを固定します                  | プリセットは、コード内の prompt 断片の定数と、固定された参照画像セットにすぎません                 |
| **アイデンティティ固定**（たとえば Higgsfield の `Soul ID`。これは 20–80 枚の写真で永続的な identity を学習します）      | 同じ人物を生成をまたいで同一に保ちます                              | 参照画像で近似します（下の制約を参照）                                           |
| **複数を生成して1つだけ表示**                                                                    | ユーザーが実際に目にするのは常に最良の候補だけなので、体感上のヒット率は 100% に近づきます | N 個を並列生成し、ビジョンモデルにスコア付けして選ばせます（第3節、手順 3〜4）                    |
| **段階的編集**                                                                            | 一度に複合指示を入れると、ほぼ確実に崩れます                           | まず構図を固定し、次にローカルで編集し、最後にテキストを追加します                             |
| **アップスケーリングと後処理**（Freepik は 2024 年に Magnific を買収し、2×–16× のクリエイティブなアップスケーリングを提供しています） | 小さな出力を印刷可能なサイズに変換します                             | APIYI にはそのようなエンドポイントはありません — 代わりに生成時に高解像度ティアを選んでください（下の制約を参照） |
| **ネガティブ prompt と安全フォールバック**                                                          | 既知のモデルの癖を回避し、モデレーションが拒否するリクエストも検知します             | 固定のネガティブ表現をテンプレートに組み込み、さらにモデレーション失敗時のダウングレード経路を用意します          |
| **アセットライブラリと再ホスティング**                                                                | ユーザー画像が期限切れになったり消えたりしません                         | すべての結果をすぐに自社のオブジェクトストレージへコピーします                               |

<Warning>
  **競合の機能一覧をコピーする前に整理しておくべき、プラットフォーム上の制約は 2 つあります:**

  1. **APIYI にはアップスケーリング、背景除去、顔補正のエンドポイントはありません。** 大きな画像が必要なら、後から拡大する前提ではなく、生成時に高解像度ティアを選んでください（`gpt-image-2` では 4K、Nano Banana Pro では 4K）。透明背景が必要な場合は、公式リレー `gpt-image-2` を `background: "transparent"` と一緒に使ってください — これは実際のアルファチャンネルを持つ PNG を返します（`seedream-5-0` / `seedream-5-0-pro` は prompt でしか指示できず、アルファは毎回保証されません）。[透明背景の画像を生成するにはどうすればよいですか](/ja/faq/image-transparent-background) を参照してください。
  2. **APIYI では LoRA や identity 学習は提供していません。** 「1回学習すれば顔を永遠に固定できる」という `Soul ID` の裏側にある機能は、参照画像で近似することしかできません。同じキャラクターでも、シーンやライティングが変わるとまだずれますし、新しいショットが正面寄りで元のライティングに近いほど安定します。厳密な一貫性が必要な商用キャラクターでは、人手確認の工程を予算に組み込んでください。
</Warning>

## 2. カジュアルな入力を構造に変えれば、最初のレイヤーだけで結果が分かれます

これは最もレバレッジの高いレイヤーであり、最も見落とされがちなレイヤーです。

### 並べて比較するテスト: 1つのモデル、1つのブリーフ、2つのプロンプト

ブリーフは「コーヒーの e コマース商品写真」です。左はユーザーが実際に入力する内容、右は不足していた決定を埋め込んだ同じブリーフです。どちらも `gemini-3-pro-image`（Nano Banana Pro）で `2K`、`1:1` に 1 回ずつ実行しました:

<Frame caption="Casual prompt: 'Make me a coffee product shot, make it look nice, make it feel premium'">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="カジュアルなプロンプトから生成されたコーヒー画像: 木製テーブル、グラインダー、麻袋、その他の要求していない小物、温かみのあるノスタルジックなグレーディング、そしてカップに印字された架空のブランド名" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

<Frame caption="Structured prompt: subject, environment, light position, lens, grading, imperfections and composition all specified">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=cb00b095545e5dcad8cb2c113fefe47f" alt="構造化されたプロンプトから生成されたコーヒー画像: 明るいグレーのマイクロセメント面に置かれたマットブラックのセラミックカップ、すっきりとぼけた背景、明確な光の方向、十分なネガティブスペース" width="1280" height="1280" data-path="images/image-workflow-prompt-after.jpg" />
</Frame>

左の画像は悪くはありませんが、**使えません**。モデルは、誰も指示していない決定を山ほど勝手に行いました。グラインダーと麻袋を追加し、ノスタルジックで温かいグレーディングにし、カップに架空のブランド名を印字しました。こうした自動生成テキストは、商用ではフレームを無価値にします。右の画像は、そのまま商品ページに載せられます。ニュートラルな背景、口頭で説明できるレベルのライティング、そしてコピーを載せる余白があります。

**「見栄えがよい」と「使える」は別の目標です。** カジュアルなプロンプトで到達できるのは前者だけです。

### リライト層が補うべき6つの要素

リライトは、プロンプトを長くすることではありません。不足している決定を埋めることです。画像プロンプトには、6つの土台となる要素があります。

| 要素             | それがなければどうなるか                       | 例                                              |
| -------------- | ---------------------------------- | ---------------------------------------------- |
| **被写体**        | モデルが勝手に解釈し、欲しくない小物を追加する            | 「黒いマットなセラミック製のドリップ用カップ。中身はブラックコーヒーで 80% まで満たす」 |
| **環境**         | 背景が毎回バラバラになり、画像群として揃わない            | 「明るいグレーのマイクロセメント面、同系色の壁、ぼかしあり」                 |
| **光**          | ありきたりなグローバルイルミネーションになり、すぐに偽物っぽく見える | 「左上 45 度からソフトボックスでキーライト。右側に白いレフ板」              |
| **レンズとアングル**   | パースと被写界深度を制御できない                   | 「85mm マクロ、f/5.6、正面から 15 度下向き」                  |
| **グレーディングと媒体** | デフォルトでは彩度が高く、レンダリングっぽい出力になる        | 「寒色寄りのニュートラルなホワイトバランス、全体の彩度は低め」                |
| **構図**         | 被写体が常にど真ん中になる                      | 「カップをフレーム左 3 分の 1 に置き、右側に大きなネガティブスペースを確保する」    |

<Tip>
  解像度は**7つ目の要素ではありません。** 出力解像度は `size` / `imageSize` のようなパラメータからのみ決まり、プロンプトに「4K」や「8K」と書いても 1 ピクセルも増えません。[画像圧縮と出力解像度](/ja/api-capabilities/image-compression-resolution) を参照してください。
</Tip>

### コードにおけるリライト層

ここでは、安価で高速なテキストモデルで十分です。コストは生成に比べれば無視できるほどです:

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com/v1"
API_KEY = os.environ["APIYI_API_KEY"]          # never hard-code the key

REWRITE_SYSTEM = """You are an image prompt engineer. Rewrite the user's casual brief
into one structured image prompt.

Fill in all six elements. Supply whatever is missing; never ask the user:
1 Subject: material, colour, count, state
2 Environment: what the background is, what is sharp and what is blurred
3 Light: direction, hardness, fill or no fill — there must be one identifiable key light
4 Lens and angle: focal length, aperture, camera height, tilt
5 Grading and medium: white balance bias, saturation, film or digital character
6 Composition: where the subject sits in the frame, where the negative space is

Rules:
- Output only the prompt body: no explanation, no bullet points, no heading
- No brand names, logos, or legible text unless the user asked for them
- Never use vague quality words such as 8K, ultra HD, masterpiece, perfect
- Keep any element the user specified exactly as written"""


def rewrite(user_prompt: str) -> str:
    r = requests.post(
        f"{BASE}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gemini-3.5-flash",
            "messages": [
                {"role": "system", "content": REWRITE_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
        },
        timeout=60,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()
```

「8K, ultra HD, masterpiece, perfect」を禁止するルールに注目してください。理由はセクション 4 で説明します。

## 3. 実際にリリースできるパイプライン

残りの4層を書き換え層につなげれば、全体がそろいます:

<Steps>
  <Step title="書き換え: カジュアルな入力を構造化された prompt に">
    2節を参照してください。このステップでは、途中でユーザー入力の機微な内容も無害化するため、下流でリクエストがブロックされる頻度が実際に下がります。
  </Step>

  <Step title="アンカー: 参照画像とスタイル定数">
    スタイルは2つの要素で固定されます: **すべての prompt に追加されるスタイル定数**（あなたのプリセット）と、**固定された参照画像セット**です。

    参照画像の上限はファミリーごとに大きく異なります — パイプラインを設計する前に、自分のものを確認してください:

    | モデルファミリー                | 参照画像上限      | 備考                                                               |
    | ----------------------- | ----------- | ---------------------------------------------------------------- |
    | Nano Banana（全モデル）       | **14**（計測値） | [複数画像融合テスト](/ja/api-capabilities/multi-image-fusion-testing) を参照 |
    | `gpt-image-2` ファミリー     | **16**      | `image[]` を繰り返します                                                |
    | Seedream                | **10**      | 入力と出力の合計を15以下に保つ必要があります                                          |
    | FLUX.2 pro / max / flex | **8**       | `input_image_2` … `input_image_8`; klein は4、Kontext は1           |
    | Grok Imagine            | **1–4**     | 5枚目の画像を送ると 400 が返ります                                             |

    守るべきルールは2つあります: prompt 内の **「image 1 / image 2」 は配列順に厳密に対応する** ため、どちらがどれかを明示してください。また、**Grok が参照画像を認識するのは `/v1/images/edits` のみ** です — それを `/v1/images/generations` に渡すと黙って破棄され、それでも課金されます。
  </Step>

  <Step title="サンプル: N を並列生成し、n に頼らない">
    消費者向け製品の「最初の一発で当たった」感じは、実際には製品があなたの代わりに複数のカードを引いているだけです。

    しかし、**サーバー側の `n` パラメータは大半の画像モデルでは効果がありません**（Seedream はこれを完全に無視します）。複数の候補を得るには、クライアントから複数のリクエストを並行して送ってください — このサイトの skill ページでは同時に5件までに制限されています。チャネルごとに同時実行数を調整してください。中には2件で 429 を返し始めるものもあるので、指数バックオフを追加してください。
  </Step>

  <Step title="選択: ジャッジとしてビジョンモデルを使う">
    N 個の候補ができたら、自動で選択しなければなりません。さもないと、単に選択をユーザーに押し付けただけになります。

    候補を標準の `/v1/chat/completions` 画像入力でビジョンモデルに戻して採点させます。対象モデルについては [ビジョン理解](/ja/api-capabilities/vision-understanding) を参照してください。評価基準は5項目に固定し、JSON で返すように求めます: 指示への準拠、構造と人体構造、テキストの正確さ、テクスチャのリアリティ、構図。

    <Warning>
      これに `/v1/rerank` は使わないでください。`bge-reranker-v2-m3` は **テキスト専用** の再ランキングモデルで、画像は受け付けません。画像の採点にはビジョン理解モデルが必要です。
    </Warning>
  </Step>

  <Step title="レタッチして仕上げる">
    構図が固まってから局所的に調整します — 1つの複合指示にまとめるより、成功率がはるかに高いです:

    * **ピクセル単位の局所リペイント**: マスクに対応しているのは **公式リレーの `gpt-image-2`** のみです。[マスク補完ガイド](/ja/api-capabilities/gpt-image-2/mask-editing) を参照してください。
    * **複数ターンの累積編集**: Nano Banana モデルの **ネイティブ Gemini エンドポイント** でサポートされています（前の画像を `role: "model"` として再投入します）；逆アセンブルしたルートではサポートされません。
    * **すぐに再ホストする**: 返される URL はすべて一時的です（FLUX は約10分で CORS なし、Seedream と R2 は約24時間）ので、取得したらすぐに自分のオブジェクトストレージへダウンロードしてください。
  </Step>
</Steps>

### 最小限のエンドツーエンド実装

```python theme={null}
import base64
import json
import os
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://api.apiyi.com"
API_KEY = os.environ["APIYI_API_KEY"]
HEAD = {"Authorization": f"Bearer {API_KEY}"}

STYLE_CONST = "Cool neutral white balance, low saturation, clean frame with generous negative space."


def draw(prompt: str, size: str = "2K", aspect: str = "1:1") -> bytes:
    """Generate one image (Nano Banana Pro, native Gemini endpoint)."""
    url = f"{BASE}/v1beta/models/gemini-3-pro-image:generateContent"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect, "imageSize": size},
        },
    }
    r = requests.post(url, headers=HEAD, json=body, timeout=600)   # headroom for 4K
    r.raise_for_status()
    parts = r.json()["candidates"][0]["content"]["parts"]
    part = next((p for p in parts if p.get("inlineData")), None)
    if part is None:                            # HTTP 200 with no image usually means moderation
        raise RuntimeError("no image returned: " + json.dumps(parts)[:300])
    return base64.b64decode(part["inlineData"]["data"])


def score(image: bytes, prompt: str) -> dict:
    """Score a candidate with a vision model; returns per-dimension scores and one issue line."""
    data_url = "data:image/png;base64," + base64.b64encode(image).decode()
    rubric = (
        "Score this image and return strict JSON: "
        '{"instruction":0-10,"anatomy":0-10,"text":0-10,"texture":0-10,'
        '"composition":0-10,"total":0-50,"issue":"one sentence"}. '
        "instruction = does it satisfy the brief below; anatomy = errors in hands, limbs, object structure; "
        "text = is any text in the image correct (score 10 if there is none); "
        "texture = does it read as a real photograph rather than a render; "
        "composition = is the framing usable. The brief:\n" + prompt
    )
    r = requests.post(
        f"{BASE}/v1/chat/completions",
        headers=HEAD,
        json={
            "model": "gemini-3.5-flash",
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": rubric},
                {"type": "image_url", "image_url": {"url": data_url}},
            ]}],
            "response_format": {"type": "json_object"},
        },
        timeout=120,
    )
    r.raise_for_status()
    return json.loads(r.json()["choices"][0]["message"]["content"])


def best_of(user_input: str, n: int = 4) -> bytes:
    prompt = rewrite(user_input) + "\n" + STYLE_CONST         # steps 1 and 2
    with ThreadPoolExecutor(max_workers=n) as pool:           # step 3: client-side fan-out
        results = list(pool.map(lambda _: _safe(draw, prompt), range(n)))

    cands = [img for ok, img in results if ok]
    if not cands:
        raise RuntimeError("all candidates failed; check moderation or fall back to another model")

    with ThreadPoolExecutor(max_workers=len(cands)) as pool:  # step 4: score in parallel
        scores = list(pool.map(lambda im: score(im, prompt), cands))

    ranked = sorted(zip(cands, scores), key=lambda x: x[1]["total"], reverse=True)
    return ranked[0][0]                                       # step 5 retouch/rehost hooks in here


def _safe(fn, *args):
    try:
        return True, fn(*args)
    except Exception as e:                # one failure must not sink the batch
        return False, str(e)
```

## 4. AIっぽさを取り除く

「AIっぽさ」は謎ではありません。それは**1つずつ取り除ける具体的な特徴の集合**です。

### 並べて比較するテスト

同じモデル（`gemini-3-pro-image`）、同じ被写体、2つのpromptスタイル、各2枚の画像、各バッチの最初の1枚：

<Frame caption="Bare prompt: 'A photorealistic half-body portrait of a young woman by a cafe window, smiling at the camera, 8K, ultra HD, ultra detailed, flawless skin, beautiful, perfect lighting, masterpiece'">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=0623ee0bf7aa07fab43cd347d9aa4a7d" alt="素のpromptからのポートレート: 被写体は中央に配置されカメラを正面に向いており、光の方向が判別できない均一な照明、整った背景、ありふれたストック写真のような見た目" width="1280" height="956" data-path="images/image-workflow-texture-before.jpg" />
</Frame>

<Frame caption="The same subject after adding four blocks of control language: light position, lens, medium, imperfections">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=83efd55ea2ba552a67c04aa2e0f99936" alt="制御されたpromptからのポートレート: 1方向からの窓光、顔の半分は影になり、毛穴と産毛が見え、頬に小さなほくろがあり、髪の毛が少し乱れ、フィルム調のグレーディング、被写体は中央より右に配置" width="1280" height="956" data-path="images/image-workflow-texture-after.jpg" />
</Frame>

左の画像は悪くありません。ベースモデルが十分強力なので、素のpromptでも見栄えの良い画像が出てきます。しかし、そこには特徴がすべて揃っています。**被写体はど真ん中に固定され、光はどこから来ているのか分からないほど均一で、すべての要素が無難**です。そして、これは偶然ではありません。そのバッチの2枚は、実質的に同じ構図と照明パターンを共有していました。

右の画像はアプローチを変えています。光に方向があり、顔の半分は影に落ち、肌には脂っぽさと毛穴が見え、頬にはほくろがあり、飛び出した髪はとかされておらず、被写体は中央より右に置かれています。これは「カフェでほほえむ女性のストック画像」ではなく、**特定の人物を特定の瞬間に撮影したもの**として読めます。

<Info>
  ここでも、パイプラインの本当の価値が見えてきます。見栄えの悪い出力をきれいな出力に変えるのではなく、**「たまたま良かった」を「指定し、説明し、再現できる良さ」に変える**のです。ステークホルダーは右の画像を好まないかもしれませんが、左の画像については、なぜそのように見えるのかを説明できず、次の画像にそれを合わせるよう依頼することもできません。
</Info>

### AIっぽさの症状、修正、そして書くべきでないもの

| AIっぽさの症状                    | 修正（これをpromptに書く）                                                 | これを書かない                 |
| --------------------------- | ---------------------------------------------------------------- | ----------------------- |
| 被写体が常に中央にあり、左右対称の構図         | 位置を指定する: 「被写体を中央から右寄りに置き、左側にネガティブスペースを作る」                        | 「完全な構図」「黄金比」            |
| 毛穴のないプラスチックのような肌            | 「自然な肌の質感、見える毛穴と産毛、鼻先のわずかなツヤ、レタッチなし」                              | 「欠点のない肌」「絶妙な」「美しい」      |
| 光源が特定できない均一な光               | キーライトを1つとその硬さを明示する: 「左からの窓光だけが唯一の光源で、顔の右半分は影になっている」              | 「完璧なライティング」「ソフトライティング」  |
| 被写界深度が不自然で、背景が貼り付けられたように見える | 焦点距離と絞りを指定する: 「85mm、f/2.8、近いほうの目にピント」                            | 「ぼけた背景」「シネマティック」        |
| 彩度が高すぎて発光しているような色           | 媒体とホワイトバランスを指定する: 「Kodak Portra 400 のような質感、暖かいハイライトと冷たいシャドウ、低彩度」 | 「鮮やかな色」「HDR」            |
| すべてが新品で使い込まれていない            | 意図的に使用感を加える: 「毛玉のあるセーター、テーブルの水滴の輪やパンくず」                          | 「きれいで整然としている」「高級感のある質感」 |
| ポスターやレンダーのように読める            | 撮影状況を指定する: 「自然なスナップ」「隣のテーブルから目線の高さで」                             | 「8K」「超高解像度」「傑作」         |

<Warning>
  **`8K`、`ultra HD`、`ultra detailed`、`masterpiece`、`perfect`のような曖昧な品質語は、逆効果です。** それらは解像度を上げず（それを担うのはパラメータだけです）、モデルを過度にシャープ化された、彩度過多のレンダーへと誘導します。まさにそれがAIっぽさの核心です。上の左側のpromptはそれらで埋め尽くされており、その結果がそれを示しています。品質が欲しいなら、その代わりに具体的な光、レンズ、媒体を書いてください。
</Warning>

### コピペ用制御語句の4つのブロック

必要に応じて prompt に組み込んでください。各ブロックから 1、2 行ずつ使うだけで、通常は十分です:

<CardGroup cols={2}>
  <Card title="ライト" icon="sun">
    左からの窓光だけがフレーム内の唯一の光源 / 午後3時の強い背面側光 / 逆光で、髪にリムライト / フレーム内の実用光としてのデスクランプ / 明確な影のない曇天の拡散光
  </Card>

  <Card title="レンズ" icon="aperture">
    35mm f/2.0、自然なスナップ、目線の高さ / 85mm f/2.8、近い方の目にピント / 低いカメラ位置からの24mm、わずかな周辺歪み / 空間を圧縮する望遠レンズ、平坦化された背景レイヤー / 角に軽いビネット
  </Card>

  <Card title="メディア" icon="film">
    Kodak Portra 400 らしい質感、きめ細かな粒状感 / 温かいハイライト、冷たいシャドウ / Polaroid のインスタントフィルム、低コントラスト、柔らかなエッジ / 初期のCCDデジタルカメラのノイズと色かぶり / 全体的に低彩度、シャープ化なし
  </Card>

  <Card title="不完全さ" icon="scan-line">
    自然な肌の質感、見える毛穴と産毛 / 少し乱れた髪の毛束、とかしていない / 毛玉のあるセーター、擦り切れた袖口 / テーブルの水跡、指紋、パンくず / 中央から外れた構図、被写体の一部が端で切れている
  </Card>
</CardGroup>

### 3つの完全な例

<AccordionGroup>
  <Accordion title="ポートレート: 自然なスナップで、ID写真ではありません">
    自然な上半身ポートレート: カフェの窓際にいる20代半ばの女性が横を向いて外を見ており、思わずこぼれそうな笑みを浮かべています。左からの窓光だけがフレーム内の唯一の光源で、顔の右半分は影に落ち、鼻筋の下には輪郭のはっきりした小さな影があります。85mmレンズ、f/2.8、目線の高さ、手前の目にピント。細かな粒状感が見える Kodak Portra 400 らしい質感で、ハイライトは暖かく、シャドウは冷たく、全体として低彩度です。自然な肌: 毛穴と産毛が見え、鼻の側面に少しツヤがあり、左頬に小さなほくろ、眉毛に数本のはみ出した毛、額にはとかれていない髪の毛束があります。肌のスムージングなし、美肌レタッチなし、シャープ化なし。被写体は画面中央やや右、左側にネガティブスペース。
  </Accordion>

  <Accordion title="商品カット: 商品ページにそのまま使える">
    Eコマース向けのヒーローショット: マットブラックのセラミック製ポアオーバーカップにブラックコーヒーが80%まで注がれており、表面には細いクレマの輪があります。薄いグレーのマイクロセメント面の上に置かれ、背後には同じトーンの壁がぼけています。左上45度のソフトボックスからのキーライト、右側の白いレフ板がカップ右端に細いハイライトを残し、柔らかな落ち影が右後方に落ちます。85mmマクロレンズ、f/5.6、正面から15度下向きに傾けた構図で、カップ全体にピントが合っています。クールなニュートラルホワイトバランスで、全体的に低彩度です。釉薬には手作りらしいわずかなムラと、ごく小さな窯跡があり、縁にはかすかな使用感があります。たっぷりとしたネガティブスペースを取り、カップはフレーム左1/3に配置します。画像内のどこにもブランド名や文字は入れません。
  </Accordion>

  <Accordion title="環境: 具体的な時刻と天候を与える">
    夕方6時の旧市街の細い通りで、雨上がり直後、両側の店のライトボックスを映す水たまりがあります。唯一のキーライトは通りの先にある暖かな街灯で、店先のショーウィンドウが補助光になり、空にはまだ冷たい夕暮れの気配が残っていて、暖色と寒色のコントラストを作ります。28mmレンズ、f/4、カメラは目線の高さで、やや上向きに傾けます。全体的に低彩度で、影にはノイズを残し、シャドーの持ち上げはしません。壁には水染み、破れた古いポスター、エアコンユニットがあり、画面上部を電線が横切ります。誰もカメラの方を向いていません。通行人は背中越しに見え、わずかにモーションブラーがかかっています。
  </Accordion>
</AccordionGroup>

## 5. パイプライン設計を一変させる事実

これらをあらかじめ把握しておくと、手戻りを減らせます。

| 事実                                                                                                                                           | パイプラインへの影響                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **この製品ラインでは、実質的にシードを利用できません**：Nano Banana や GPT-Image モデルではシードが公開されておらず、Seedream 4.x / 5.x のシードは効果がないことが測定されており、Grok Imagine もシードをサポートしていません | シードによる再現性を前提に設計しないでください。**唯一信頼できる再現方法は、成功したリクエスト全体をアーカイブすることです** — prompt、参照画像、すべてのパラメータを保存し、そのまま再実行してください                                              |
| **サーバー側の `n` パラメータは、ほとんどの画像モデルに影響しません**                                                                                                      | 複数の候補はクライアント側の同時実行数で生成する必要があります。チャネルごとの同時実行数を負荷テストし、指数バックオフを追加してください                                                                                    |
| **すべての画像 API は同期型で、タスク ID がなく、切断後も課金されます**                                                                                                   | パイプライン独自のタスクキューが必要です。[独自の非同期キューを構築する](/ja/api-capabilities/image-async-queue) および [画像 API の基本](/ja/api-capabilities/image-api-best-practices) を参照してください |
| **アップスケーリング、背景除去、顔補正のエンドポイントはありません**                                                                                                         | 生成時に出力サイズを確定してください。透明な背景にする場合は、`background: "transparent"` を `gpt-image-2` に渡してください（切り抜き用のエンドポイントではなく、透明背景上に直接生成します）                                    |
| **画像がない HTTP 200 は、通常モデレーションによるブロックを意味します**                                                                                                  | 選択ロジックでは、「画像が返ってこなかった」場合と「画像は返ってきたが品質が悪い」場合を区別する必要があります。前者については [Gemini 画像のエラーハンドリング](/ja/api-capabilities/gemini-image-error-handling) を参照してください       |
| **返される画像 URL はすべて一時リンクです**                                                                                                                   | 受信したらすぐに別のホストへ移してください。上流の URL をデータベースに保存しないでください                                                                                                        |
| **GPT-Image の prompt は 32,000 文字に制限されています**（プロバイダーの制限で、文字数単位でカウントされます）                                                                       | ブランドブックやパッケージ仕様を画像モデルにそのまま貼り付けないでください。まずテキストモデルで、1K〜3K文字の構造化された prompt に要約してから渡してください。[長い prompt](/ja/api-capabilities/image-long-prompt) を参照してください     |

## 6. パイプラインが価値を持つのはいつか：コスト計算

パイプラインは、成功率のためにお金を使う仕組みです。コストの大半は output が占めます（`gpt-image-2` は output を 100万 token あたり \$30 で課金します）。一方、書き換えやスコアリングに使うテキストおよびビジョンモデルのコストは、ほぼ誤差の範囲です。つまり、コストは実質的に「何件の候補を生成したか」で決まります。

すべてを同じ設定にするのではなく、3 段階を使い分けてください。

| 段階         | 構成                                   | 相対コスト | 用途                                |
| ---------- | ------------------------------------ | ----- | --------------------------------- |
| **ドラフト**   | Lite モデルからの単発生成                      | 1×    | 社内プレビュー、大量のプレースホルダー、気軽なユーザー実験     |
| **スタンダード** | 書き換え + 2 候補 + スコアで選択                 | 約 2×  | 消費者向け製品でのデフォルトパス                  |
| **プレミアム**  | 書き換え + 4 候補 + スコアリング + ローカルで 1 回リタッチ | 約 5×  | 製品のヒーロー画像、広告クリエイティブ、外部に納品するあらゆるもの |

判定はシンプルです。**この画像をチーム外の誰かが見るか？** もしそうなら、Standard 以上で十分に元が取れます。社内でざっと見るだけなら、Draft で十分です。さらに中間のゲートを追加することもできます。つまり、トップスコアがしきい値を下回った場合にだけ候補を増やすようにすれば、ほとんどのリクエストは 2 件で収束します。

## 要点まとめ

* ギャップはモデルの重みにはなく、**モデルの周辺にある8層**、つまりリライト、プリセット、アンカリング、サンプリング、選択、ステップごとの編集、後処理、リホスティングにあります。
* **リライト層のリターンが最も高い**です。被写体、環境、光、レンズ、グレーディング、構図を埋めると、「見栄えがよい」が「使える」に変わります。
* **複数候補＋ビジョンモデルによるスコアリング**こそが、消費者向け製品の見かけ上の高い成功率の正体です。`n` は動作しないため、クライアント側でファンアウトしてください。`/v1/rerank` は画像をスコアリングできません。
* **AIっぽさを消すには、形容詞ではなく具体性を足します**。光源を1つ指定し、焦点距離と絞りを与え、媒体と粒状感を明記し、意図的に不完全さを加え、被写体をオフセンターにずらします。
* **`8K` / `masterpiece` / `perfect lighting` は純粋なマイナス**です。追加の解像度はなく、フレームをレンダリングされた見た目へと寄せてしまいます。
* **再現のために seed に頼らないでください**。代わりに完全なリクエストを保存します。画像 API は同期型で、切断時も課金されるため、パイプラインにはキューが必要です。
* APIYI にはアップスケーリング、背景除去、アイデンティティ学習のエンドポイントはありません。最初からそれらの層を前提に設計してください。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="思いどおりの画像を手に入れる方法" icon="target" href="/ja/api-capabilities/image-generation-success-tips">
    1件の失敗した呼び出しを立て直す方法: prompt を書き直す、再試行する、モデルを切り替える、テストツールで切り分ける
  </Card>

  <Card title="画像 API の基本" icon="book-check" href="/ja/api-capabilities/image-api-best-practices">
    同期呼び出し、タイムアウト階層、課金、base64 の取り扱い、入力画像の前処理
  </Card>

  <Card title="マスクインペインティングガイド" icon="scissors" href="/ja/api-capabilities/gpt-image-2/mask-editing">
    ピクセル単位のローカル編集、公式リレーの gpt-image-2 専用
  </Card>

  <Card title="マルチ画像融合テスト" icon="images" href="/ja/api-capabilities/multi-image-fusion-testing">
    参照制限をどのように測定したか、加えて 14枚の画像を融合した結果
  </Card>

  <Card title="ビジョン理解" icon="eye" href="/ja/api-capabilities/vision-understanding">
    候補画像のスコア付けに使える Vision モデルと、その呼び出し方
  </Card>

  <Card title="独自の非同期キューを構築する" icon="list-checks" href="/ja/api-capabilities/image-async-queue">
    同期生成をタスクキューでラップし、複数候補パイプラインを支える
  </Card>
</CardGroup>
