> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI Nano Banana ComfyUI ノード（軽量サンプル）

> コミュニティ提供の軽量な ComfyUI カスタムノードです。ワークフロー内に Nano Banana Pro / 2 の画像生成をそのまま組み込めるため、素早い導入や拡張の出発点に最適です。

## 概要

`api_yi_nano_banana_node` は、コミュニティパートナーの JerrIsTheBesta によって提供された**軽量な ComfyUI カスタムノード**です。コンセプトは「そのまま使える手軽さ + 拡張しやすさ」です。`custom_nodes` ディレクトリに入れて ComfyUI を再起動するだけで、APIYI の Nano Banana Pro / Nano Banana 2 の画像生成をワークフロー内から直接呼び出せます。学習やカスタマイズを始めるのに最適な出発点です。

<Info>
  **プロジェクト情報**

  * 🔗 ソース: `github.com/JerrIsTheBesta/api_yi_nano_banana_node`
  * 📜 ライセンス: MIT
  * 👤 著者: JerrIsTheBesta
  * ⭐ コミュニティパートナーからの提供 — **拡張できるサンプル**として位置づけられています
</Info>

<Tip>
  **どんな人向けですか？**

  このノードは、最も一般的な 2 つの操作、つまりテキストから画像への変換と複数画像の編集に重点を置いています。コードは最小限で読みやすくなっています。より豊富な機能（会話形式の編集、14 枚の画像ブレンドなど）が必要な場合は、[フル機能版の Nano Banana ComfyUI ノード](/ja/scenarios/ecosystem/nano-banana-comfyui) をご確認いただくか、このノードをフォークして拡張してください。
</Tip>

## コア機能

<CardGroup cols={2}>
  <Card title="2つのコアノード" icon="workflow">
    `APIYI Text to Image` + `APIYI Multi Image Edit` — 2つの最も一般的なワークフローをカバーします
  </Card>

  <Card title="デュアルモデル切り替え" icon="layers">
    `gemini-3-pro-image-preview`（Nano Banana Pro）と`gemini-3.1-flash-image-preview`のどちらかを選択できます
  </Card>

  <Card title="高解像度出力" icon="image">
    解像度に応じてタイムアウトを自動調整し、**2K / 4K** 出力をサポートします
  </Card>

  <Card title="豊富なアスペクト比" icon="ratio">
    1:1、16:9、9:16、4:3、3:4、3:2、2:3、21:9、5:4、4:5 を標準搭載 — 合計10種類の比率
  </Card>

  <Card title="複数画像編集" icon="images">
    `Multi Image Edit` は、ブレンド / スタイル転送用に最大 **5枚の参照画像** を受け付けます
  </Card>

  <Card title="軽量でカスタマイズしやすい" icon="code">
    最小限の依存関係（requests / Pillow / numpy）だけを使う純粋な Python です。構成がシンプルで、カスタマイズしやすいです
  </Card>
</CardGroup>

## 対応 APIYI モデル

| モデル                   | モデル ID                           | 用途          | API ドキュメント                                            |
| --------------------- | -------------------------------- | ----------- | ----------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | 高品質な画像生成と編集 | [表示](/ja/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | 高速な生成、低コスト  | [表示](/ja/api-capabilities/gemini/native)              |

## ノード詳細

### APIYI テキストから画像

テキスト prompt から画像を生成します — **入力画像は不要です**。出力: 生成画像 + ファイル名識別子。

### APIYI 複数画像編集

ブレンド、編集、または合成のために**最大 5 枚の入力画像**を受け付けます。出力: 結果画像、ファイル名、実際に使用された画像枚数。

### ノードパラメータ

| パラメータ          | 型      | 必須  | デフォルト                        | 説明                                 |
| -------------- | ------ | --- | ---------------------------- | ---------------------------------- |
| `api_key`      | string | Yes | -                            | APIYI token — 利用上限付きの専用キーを推奨します    |
| `prompt`       | string | Yes | -                            | テキスト prompt                        |
| `model`        | enum   | Yes | `gemini-3-pro-image-preview` | モデル (Pro / Flash)                  |
| `resolution`   | enum   | No  | `2K`                         | 出力解像度 (2K / 4K、4K はタイムアウトを自動延長します) |
| `aspect_ratio` | enum   | No  | `1:1`                        | 利用可能なアスペクト比は 10 種類です               |
| `images`       | IMAGE  | No  | -                            | 複数画像編集用の参照画像（最大 5 枚）               |

## インストール

<Steps>
  <Step title="ステップ 1: custom_nodes に配置します">
    ComfyUI のインストール先で、リポジトリを `custom_nodes` にクローンします:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/JerrIsTheBesta/api_yi_nano_banana_node.git
    ```
  </Step>

  <Step title="ステップ 2: Python 依存関係をインストールします">
    依存関係は最小限です。ComfyUI には通常 torch が含まれています。足りないものがあれば残りをインストールしてください:

    ```bash theme={null}
    pip install requests pillow numpy
    ```
  </Step>

  <Step title="ステップ 3: ComfyUI を再起動します">
    再起動後、ノードパレットで `APIYI` を検索すると、次が見つかります:

    * `APIYI Text to Image`
    * `APIYI Multi Image Edit`
  </Step>

  <Step title="ステップ 4: APIYI キーを設定します">
    * [APIYI コンソール](https://www.apiyi.com) → Tokens を開き、**利用上限付きの専用キーを作成**します（セキュリティ上のベストプラクティス）
    * キーをノードの `api_key` フィールドに貼り付けます
    * エンドポイントの設定は不要です — ノードは内部で `https://api.apiyi.com` を使用します
  </Step>

  <Step title="ステップ 5: シンプルなワークフローを作成します">
    * **テキストから画像生成**: `APIYI Text to Image` → `Preview Image`
    * **複数画像編集**: 複数の `Load Image` → `APIYI Multi Image Edit` → `Preview Image`
  </Step>
</Steps>

## 使用例

### 例1: テキストから画像へ

```
Node: APIYI Text to Image
prompt: "A cute corgi astronaut floating in a neon-lit space station, cinematic lighting"
model: gemini-3-pro-image-preview
resolution: 2K
aspect_ratio: 16:9
```

### 例2: 複数画像のブレンド

```
Node: APIYI Multi Image Edit
images: [person photo, outfit reference, background reference]
prompt: "Replace the outfit with the reference clothing, and set the scene in the reference background"
resolution: 4K
aspect_ratio: 1:1
```

## 拡張アイデア

このプロジェクトは**例であり出発点**として位置付けられているため、必要に応じてフォークして拡張してください:

<CardGroup cols={2}>
  <Card title="会話的な編集" icon="messages-square">
    反復的なブラッシュアップのために、ノード内でセッションコンテキストを保持します
  </Card>

  <Card title="参照画像を増やす" icon="images">
    上限を14枚に引き上げて、Nano Banana Pro のフルキャパシティに合わせます
  </Card>

  <Card title="シード制御" icon="dices">
    再現可能な生成のために seed パラメータを追加します
  </Card>

  <Card title="バッチ出力" icon="layers">
    画像のバッチを下流の ComfyUI ノードへ出力します
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="ノードをインストールしたのにパレットで見つかりませんか？">
    1. リポジトリが `ComfyUI/custom_nodes/` 内にあることを確認してください
    2. ComfyUI を完全に再起動してください（フロントエンドを更新するだけではありません）
    3. Python の import エラーがないか、ComfyUI のコンソールを確認してください
  </Accordion>

  <Accordion title="呼び出しが 401 / 403 で失敗しますか？">
    確認してください:

    1. `api_key` が正しく、誤ったチャネルに制限されていないこと
    2. 選択したモデルが token のホワイトリストに含まれていること
    3. 残高が十分であること — [残高は十分そうなのに呼び出しが失敗します](/ja/faq/balance-insufficient) を参照してください
  </Accordion>

  <Accordion title="4K 解像度でタイムアウトが頻発しますか？">
    このノードは 4K のタイムアウトを自動延長しますが、それでも失敗する場合は:

    1. API へのネットワーク経路を確認してください（[CDN からの画像/動画ダウンロードが遅い](/ja/faq/cdn-download-slow) を参照）
    2. 混雑時は 2K か Flash に切り替えてください
  </Accordion>

  <Accordion title="API key の漏えいは安全ですか？">
    作者は master key を使わないことを明確に推奨しています — このノード専用に、APIYI コンソールで使用上限付きの専用 token を作成してください。そうすれば、漏えいしても影響範囲を限定できます。
  </Accordion>

  <Accordion title="他の ComfyUI-Nano-Banana-apiyi ノードと比べて何が違いますか？">
    * このノード: **軽量なサンプル**、ノードは 2 個のみ、依存関係は最小限 — 導入とカスタマイズに最適
    * [完全版](/ja/scenarios/ecosystem/nano-banana-comfyui): より豊富な機能セット（会話型編集、14 画像ブレンド）を備え、本番ワークフロー向けに設計
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/ja/api-capabilities/nano-banana-image/overview">
    Nano Banana Pro の完全な API リファレンス
  </Card>

  <Card title="フル機能の ComfyUI ノード" icon="workflow" href="/ja/scenarios/ecosystem/nano-banana-comfyui">
    高機能な Nano Banana ComfyUI ノードパック
  </Card>

  <Card title="シナリオ概要" icon="rocket" href="/ja/scenarios">
    APIYI のシナリオをさらに見る
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://www.apiyi.com">
    API キーと利用状況を管理します
  </Card>
</CardGroup>
