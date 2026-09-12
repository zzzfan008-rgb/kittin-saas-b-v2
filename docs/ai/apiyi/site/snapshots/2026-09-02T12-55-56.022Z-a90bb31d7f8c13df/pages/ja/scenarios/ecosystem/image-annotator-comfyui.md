> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像アノテーター - ComfyUI ノード

> コミュニティ提供のインタラクティブなアノテーションノード: 画像上に直接ポイント/ボックス/ポリゴンを描画して編集領域を指定できます。Nano Banana と組み合わせると、プロンプト作成の大幅なショートカットになります。

## 概要

`comfyui-image-annotator` は、コミュニティユーザーの luckdvr によって提供された **対話型の画像アノテーション ComfyUI ノード** です。その中核価値は、**プロンプト作成のハードルを下げること** にあります。たとえば「左上の赤いボタンを置き換えて」と説明するのに苦労する代わりに、変更したい領域を **丸で囲む、クリックする、または枠で囲む** だけで、モデルにどこを編集すべきかを正確に示せます。三段階パイプライン「image → annotate → API」の **前段** に配置するよう設計されています。

<Info>
  **プロジェクト情報**

  * 🔗 ソース: `github.com/luckdvr/comfyui-image-annotator`
  * 📜 ライセンス: MIT
  * 👤 作者: luckdvr
  * ⭐ コミュニティ貢献 — [Luck Nano Banana Pro](/ja/scenarios/ecosystem/lucknanobananapro-comfyui) と同じ作者
</Info>

<Tip>
  **推奨ワークフロー: Image → Annotator → API node**

  ```
  LoadImage  ─►  ImageAnnotator  ─►  Luck Nano Banana Pro  ─►  SaveImage
                 (mark the area to edit)      (edit per annotation + prompt)
  ```

  最適なのは、**英語の prompt や、正確な「どこを編集するか」の説明が苦手なユーザー** です。マウスに *どこを* 任せ、1行の prompt に *何を* 任せましょう。
</Tip>

## 主な機能

<CardGroup cols={2}>
  <Card title="3種類のアノテーション" icon="pen-tool">
    **ポイント (⦿)**: 1回クリック · **矩形 (▢)**: ドラッグして描画 · **多角形 (⬡)**: 複数回クリックで自動クローズ
  </Card>

  <Card title="リアルタイム描画" icon="eye">
    アノテーションはキャンバス上にライブで描画されます — WYSIWYGで、プレビューへの往復は不要です
  </Card>

  <Card title="ズーム / パン / 選択" icon="move">
    内蔵のキャンバス操作により、大きな画像でも正確にアノテーションできます
  </Card>

  <Card title="50段階の取り消し" icon="undo">
    最大50段階まで取り消せます — 安心して自由に試せます
  </Card>

  <Card title="2種類の出力" icon="square-split-horizontal">
    モデル用の**注釈付き画像**と、下流の解析用の**annotation JSON**の両方を出力します
  </Card>

  <Card title="カスタマイズ可能なスタイル" icon="palette">
    線色、線幅、塗りつぶしの透明度、ポイントサイズ — すべて設定可能です
  </Card>
</CardGroup>

## 対応する APIYI モデル

このノードは自体では **API を呼び出しません** — 注釈を付けるだけです。注釈付きの画像は、画像入力を受け付ける任意の APIYI モデルに渡せます。おすすめの組み合わせは次のとおりです。

| モデル                    | モデル ID                       | 用途                  | API ドキュメント                                            |
| ---------------------- | ---------------------------- | ------------------- | ----------------------------------------------------- |
| Nano Banana Pro        | `gemini-3-pro-image-preview` | 領域指定の画像編集 / ブレンディング | [表示](/ja/api-capabilities/nano-banana-image/overview) |
| Gemini / Qwen-VL ファミリー | 各種                           | 画像理解、注釈に基づく VQA     | [表示](/ja/api-capabilities/gemini/native)              |

## ノードの詳細

### 入力

| パラメーター  | 型     | 必須  | 説明       |
| ------- | ----- | --- | -------- |
| `image` | IMAGE | Yes | 注釈を付ける画像 |

### 出力

| 出力                 | 型      | 説明                                         |
| ------------------ | ------ | ------------------------------------------ |
| `annotated_image`  | IMAGE  | 描画済みの注釈マークが付いた画像（下流の API ノードにそのまま入力してください） |
| `annotations_json` | STRING | 注釈の位置/種類を説明する JSON 文字列（構造化入力を必要とするノード向け）   |

## インストール

<Steps>
  <Step title="手順1: custom_nodes にクローンします">
    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/comfyui-image-annotator.git
    ```
  </Step>

  <Step title="手順2: ComfyUI を再起動します">
    追加の依存関係はありません — ComfyUI の組み込み環境を使用します。再起動後、ノードパレットで `ImageAnnotator` を検索してください。
  </Step>

  <Step title="手順3: 3段階のワークフローを接続します">
    ノードを順番に接続します:

    ```
    LoadImage → ImageAnnotator → Luck Nano Banana Pro → SaveImage
    ```

    `ImageAnnotator` キャンバス上で編集する領域を囲み、後続の API ノードで簡単な prompt を入力して（例: "replace the marked area with a red sports car"）実行します。
  </Step>
</Steps>

## 使用例

### 例1: ローカル置換（初心者向け）

<Steps>
  <Step title="元画像を読み込む">
    `LoadImage` — リビングルームの写真を読み込みます
  </Step>

  <Step title="対象領域に注釈を付ける">
    `ImageAnnotator` — ソファの横にある空いたスペースの周りに長方形を描きます
  </Step>

  <Step title="1行の prompt を書く">
    `Luck Nano Banana Pro` — prompt: 「マークした領域に緑の室内用植物を置く」
  </Step>

  <Step title="実行して保存する">
    モデルはボックス内のちょうどその位置に植物を追加し、残りはそのままにします
  </Step>
</Steps>

### 例2: マルチ領域での精密編集

**polygon** を使って服の輪郭を囲み、**point** で帽子の位置を指定し、**rectangle** で背景を指定してから、次のように prompt します:

```
Change the clothing in polygon 1 to a black suit, add a hat at point 1,
replace the background in rectangle 1 with a sunset beach
```

モデルは各領域で個別に編集を行います。

### 例3: ビジュアル Q\&A / 理解

Gemini / Qwen-VL では、モデルに「長方形の中にある物体は何か、またシーンの中でどんな役割を果たしているか」を説明するように尋ねます。注釈によって、モデルに正確な視覚的アンカーを与えられます。

## よくある質問

<AccordionGroup>
  <Accordion title="prompt が苦手な人にとって、なぜこれが便利なのですか？">
    従来の画像編集では、どこを、どのように変更するかの両方を説明する必要があり、英語を母語としない方や AI 初心者には大変です。

    このノードでは、**位置情報はマウスから取得される**ため、prompt では何を変更するかだけを説明すればよいです。これまで 3〜5 文必要だった説明が、短い一文で済みます。
  </Accordion>

  <Accordion title="アノテーションマークは生成品質に影響しますか？">
    はい、**良い意味で**影響します。ほとんどのマルチモーダルモデル（Nano Banana, Gemini, Qwen-VL）は、画像上のアノテーション記号を「ユーザーが指定した対象領域」と認識し、指示により正確に従います。

    視覚的な干渉が気になる場合は、ノード設定で線幅を細くし、塗りつぶしを半透明にしてください。
  </Accordion>

  <Accordion title="インストール後にノードが見つかりませんか？">
    1. ディレクトリを確認してください: `ComfyUI/custom_nodes/comfyui-image-annotator`
    2. ComfyUI を完全に再起動してください（フロントエンドの更新だけでは不十分です）
    3. ComfyUI のコンソールでエラーを確認してください
  </Accordion>

  <Accordion title="レンダリングせずに JSON のみを出力できますか？">
    はい。`annotations_json` の出力だけを下流に接続してください。後処理で座標をカスタムスクリプトに渡したいときに便利です。
  </Accordion>

  <Accordion title="Luck Nano Banana Pro と組み合わせるときのベストプラクティスは？">
    推奨パイプライン: `LoadImage → ImageAnnotator → Luck Nano Banana Pro`

    * `ImageAnnotator.annotated_image` を `Luck Nano Banana Pro.image_01` に接続する
    * マークした領域に対して何をするかを説明する自然言語 prompt を使用する
    * 最初の結果がずれている場合は、Luck Nano Banana Pro の `retry_times` または seed モードを使って再実行する
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Luck Nano Banana Pro ノード" icon="workflow" href="/ja/scenarios/ecosystem/lucknanobananapro-comfyui">
    著者の API 呼び出しノード — こちらと相性抜群です
  </Card>

  <Card title="Nano Banana Pro API" icon="book" href="/ja/api-capabilities/nano-banana-image/overview">
    Nano Banana Pro の全機能
  </Card>

  <Card title="ComfyUI ノードコレクション" icon="layers" href="/ja/scenarios">
    すべての Nano Banana ComfyUI ノードを閲覧できます
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://www.apiyi.com">
    キー、使用状況、チャネルを管理します
  </Card>
</CardGroup>
