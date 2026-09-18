> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck Nano Banana Pro - ComfyUI ノード

> コミュニティ提供の高度な ComfyUI ノード: 参照画像は最大14枚、1K/2K/4K出力、15種類のアスペクト比、再試行/タイムアウトを設定可能 — 本番運用向けに構築。

## 概要

`Comfyui-LuckNanoBananaPro` は、コミュニティユーザーの luckdvr によって提供された ComfyUI カスタムノードです。APIYI 経由で Gemini 3 Pro Image Preview / Flash を呼び出し、**text-to-image と複数画像編集**を行います。基本的なノードと比べた最大の強みは、**エンジニアリング面の完成度**です。タイムアウト/リトライの内蔵、リアルタイム進捗、ComfyUI 標準の seed モード対応、最大 14 枚の積み重ねた画像入力に対応しており、負荷の高い本番ワークフローに最適です。

<Info>
  **プロジェクト情報**

  * 🔗 ソース: `github.com/luckdvr/Comfyui-LuckNanoBananaPro`
  * 📜 ライセンス: MIT / Apache-2.0（デュアル）
  * 👤 作者: luckdvr
  * ⭐ コミュニティによる貢献。APIYI 向けに構築
</Info>

<Tip>
  **3つの ComfyUI ノードのどれを選ぶべきですか？**

  Nano Banana 向けのコミュニティ製 ComfyUI ノードは 3 つあります。用途に合ったものを選んでください。

  * **[Nano Banana ComfyUI Nodes](/ja/scenarios/ecosystem/nano-banana-comfyui)**: 多機能版（会話型編集、マルチターンメモリ）で、対話的な制作に最適
  * **[APIYI Nano Banana Node (Lite)](/ja/scenarios/ecosystem/apiyi-nano-banana-node)**: 最小限のコードベースで、学習やカスタマイズに最適
  * **Luck Nano Banana Pro（このページ）**: エンジニアリング重視のパラメータ（タイムアウト、リトライ、14 枚の画像入力）を備え、安定した本番運用向け
</Tip>

## 主な機能

<CardGroup cols={2}>
  <Card title="最大14枚の画像入力" icon="images">
    `image_01` \~ `image_14` のスロットで最大14枚の参照画像を重ねて指定でき、Nano Banana Pro の理論上の入力上限に対応します
  </Card>

  <Card title="マルチティア解像度" icon="image">
    **1K / 2K / 4K** 出力に適応型タイムアウトを採用 — 速度と品質のバランスを取れます
  </Card>

  <Card title="15種類のアスペクト比" icon="ratio">
    縦長、横長、正方形、シネマティックなワイドスクリーンを網羅する豊富なプリセット
  </Card>

  <Card title="デュアルモデル切り替え" icon="layers">
    `gemini-3-pro-image-preview` (Pro) と `gemini-3.1-flash-image-preview` (Flash) を切り替え可能
  </Card>

  <Card title="タイムアウトと再試行" icon="refresh-cw">
    `timeout_seconds` (10-600s) + `retry_times` (1-20) — ピーク時間帯でも安定
  </Card>

  <Card title="リアルタイム進捗" icon="gauge">
    ステータス / パーセンテージ / 経過時間の表示を標準搭載 — もはやブラックボックス実行ではありません
  </Card>

  <Card title="ネイティブ seed モード" icon="dices">
    ComfyUI の標準的な固定 / ランダム / 増分 / 減分の seed パターンをサポートします
  </Card>

  <Card title="MIT / Apache-2.0 のデュアルライセンス" icon="shield">
    寛容なライセンス — 商用利用や派生作品も歓迎します
  </Card>
</CardGroup>

## 対応APIYIモデル

| モデル                   | モデルID                            | 用途              | APIドキュメント                                             |
| --------------------- | -------------------------------- | --------------- | ----------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | 高品質な画像生成と複数画像編集 | [表示](/ja/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | 高速生成、低コスト       | [表示](/ja/api-capabilities/gemini/native)              |

## ノード パラメータ

| パラメータ                   | 型      | 必須  | 既定値                          | 説明                                 |
| ----------------------- | ------ | --- | ---------------------------- | ---------------------------------- |
| `api_key`               | string | はい  | -                            | APIYI token — 使用上限付きの専用キーを推奨します    |
| `prompt`                | string | はい  | -                            | 生成または編集の指示                         |
| `model`                 | enum   | はい  | `gemini-3-pro-image-preview` | モデルの選択 (Pro / Flash)               |
| `image_size`            | enum   | いいえ | `2K`                         | 出力解像度 (1K / 2K / 4K)               |
| `aspect_ratio`          | enum   | いいえ | `1:1`                        | 15種類のアスペクト比のいずれか                   |
| `timeout_seconds`       | int    | いいえ | 120                          | リクエストごとのタイムアウト (10-600s)           |
| `retry_times`           | int    | いいえ | 3                            | 失敗時の再試行回数 (1-20)                   |
| `seed`                  | int    | いいえ | 0                            | ランダムシード (ComfyUI's seed モードで機能します) |
| `image_01` … `image_14` | IMAGE  | いいえ | -                            | 任意の参照画像 (最大14枚)                    |

## インストール

<Steps>
  <Step title="Step 1: custom_nodes にクローンします">
    ComfyUI のインストール先では、次のようにします。

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-LuckNanoBananaPro.git
    ```
  </Step>

  <Step title="Step 2: 依存関係をインストールします">
    ```bash theme={null}
    cd Comfyui-LuckNanoBananaPro
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="Step 3: ComfyUI を再起動します">
    ノードパレットで `Luck Nano Banana Pro` を検索すると見つかります。
  </Step>

  <Step title="Step 4: APIYI キーを設定します">
    * [APIYI コンソール](https://www.apiyi.com) → Tokens にアクセスし、**利用上限付きの専用キーを作成してください**（推奨）
    * キーを `api_key` フィールドに貼り付けます
    * ノードはすでに `api.apiyi.com` を指しているため、エンドポイントの設定は不要です
  </Step>

  <Step title="Step 5: ワークフローを構築します">
    * **テキストから画像生成**: `prompt` を設定するだけで、画像入力は空のままにします
    * **マルチ画像編集**: 複数の `Load Image` を `image_01`、`image_02` などに接続し、編集内容を説明する prompt を添えます
  </Step>
</Steps>

## 使用例

### 例 1: 高安定なテキストから画像生成

```
prompt: "Cinematic product shot of a minimalist ceramic teacup on a wooden tray, soft morning light, 35mm lens, shallow depth of field"
model: gemini-3-pro-image-preview
image_size: 4K
aspect_ratio: 3:2
timeout_seconds: 300
retry_times: 5
```

### 例 2: 複数画像のブレンド

```
image_01: person photo
image_02: outfit reference
image_03: scene reference
image_04: lighting reference
prompt: "Photorealistic portrait: subject from image_01 wearing outfit from image_02, in the setting of image_03, with lighting style of image_04"
image_size: 2K
aspect_ratio: 4:5
```

### 例 3: シードスイープ

ComfyUI のネイティブなシード管理を `increment` モードで使用し、複数のシードをバッチ実行して、同じ prompt のバリエーションを比較します。

## よくある質問

<AccordionGroup>
  <Accordion title="インストール後にノードが見つかりませんか？">
    1. レポジトリが `ComfyUI/custom_nodes/Comfyui-LuckNanoBananaPro` にあることを確認してください
    2. 依存関係がエラーなくインストールされていることを確認してください（特に requests / Pillow / numpy）
    3. ComfyUI を完全に再起動してください（更新だけでは不十分です）
  </Accordion>

  <Accordion title="4Kでタイムアウトが頻発しますか？">
    このノードでは、`timeout_seconds`を直接調整できます:

    * 4Kではまず`timeout_seconds=300`から始めてください
    * ネットワークの揺らぎに対する自動再試行には、`retry_times=5`と組み合わせてください
    * それでも不安定な場合は、[CDNの画像/動画ダウンロードが遅い](/ja/faq/cdn-download-slow)を参照してネットワーク経路を最適化してください
  </Accordion>

  <Accordion title="14枚の参照画像はすべて使われますか？">
    最大14枚まで接続できますが、**実際に使われるかどうか**は prompt 次第です。prompt内で明示的に参照する（例: `image_01`, `image_02`）か、それぞれの役割を説明してください。モデルがその指示を拾ってくれます。
  </Accordion>

  <Accordion title="呼び出しが 401 / 403 を返しますか？">
    1. `api_key` を確認し、間違ったチャンネルに制限されていないことを確かめてください
    2. 選択したモデルは token のホワイトリストに含まれている必要があります
    3. 残高を確認してください — [残高は十分そうなのに呼び出しが失敗します](/ja/faq/balance-insufficient) を参照してください
  </Accordion>

  <Accordion title="他の2つの Nano Banana ComfyUI ノードとどう違いますか？">
    * [nano-banana-comfyui (フル機能版)](/ja/scenarios/ecosystem/nano-banana-comfyui): **会話形式の編集** とマルチターンメモリを重視しています
    * [apiyi-nano-banana-node (軽量版)](/ja/scenarios/ecosystem/apiyi-nano-banana-node): コードが最小限で、学習やカスタマイズに最適です
    * **Luck Nano Banana Pro (このページ)**: エンジニア向けパラメータ（timeout / retry / 14 images）を備え、バッチ処理と本番環境向けに作られています
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/ja/api-capabilities/nano-banana-image/overview">
    モデル機能の全容とAPIリファレンス
  </Card>

  <Card title="Luck GPT-Image 2（同じ作者）" icon="puzzle" href="/ja/scenarios/ecosystem/luckgpt2-comfyui">
    luckdvrのOpenAI系ComfyUIノード: `gpt-image-2` + `gpt-image-2-all`
  </Card>

  <Card title="ComfyUIノードコレクション" icon="workflow" href="/ja/scenarios">
    Nano BananaのComfyUIノードをすべて確認
  </Card>

  <Card title="FAQ: CDNのダウンロードが遅い" icon="gauge" href="/ja/faq/cdn-download-slow">
    4K画像のダウンロードが遅いですか？ こちらをお読みください
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    キー、使用状況、チャネルを管理
  </Card>
</CardGroup>
