> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI ノード

> コミュニティ提供の2ノードパックです。ComfyUI で gpt-image-2（公式）と gpt-image-2-all（リバース）を直接呼び出せます。テキストから画像、参照画像編集、マスクによるインペインティング、カスタム解像度をカバーします。

## 概要

`Comfyui-Luck-gpt2.0` は、コミュニティユーザー luckdvr が提供した ComfyUI のカスタムノードパックです。APIYI の 2 つの GPT 画像モデルを ComfyUI 内から直接呼び出せます。**公式 `gpt-image-2`** と **逆解析版 `gpt-image-2-all`** です。2 つのノードは役割分担が明確で、前者はきめ細かなパラメータ（解像度、品質、マスク、複数参照）に重点を置き、後者は ChatGPT と同等の会話型画像体験を提供し、タイムアウト／リトライを内蔵しています。制作ワークフローに最適です。

<Info>
  **プロジェクト情報**

  * 🔗 ソース: `github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 ライセンス: Apache-2.0
  * 👤 作者: luckdvr
  * ⭐ コミュニティによる提供、APIYI 向けに構築
</Info>

<Tip>
  **作者の別のノードパックとどう見分ければよいですか？**

  luckdvr は APIYI 向けに 2 つの ComfyUI ノードパックを提供しています。

  * **[Luck Nano Banana Pro](/ja/scenarios/ecosystem/lucknanobananapro-comfyui)**: Gemini 系列（`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`）を呼び出します。14 枚の参照画像と、エンタープライズ級のリトライ／タイムアウトを重視しています
  * **Luck GPT-Image 2（このページ）**: OpenAI 系列（`gpt-image-2` / `gpt-image-2-all`）を呼び出します。二重エンドポイント切り替え（chat\_completions / images\_api）とマスクのインペインティングを重視しています
</Tip>

## 主な機能

<CardGroup cols={2}>
  <Card title="2つのノード、2つのルート" icon="layers">
    `Comfyui-Luck gpt-image-2`（公式）と`Comfyui-Luck gpt-2.0 all`（リバース）— シーンに合う方を選べます
  </Card>

  <Card title="最大5枚の参照画像" icon="images">
    公式ノードは、複雑な合成やスタイル変換のために最大5枚の参照画像を受け付けます
  </Card>

  <Card title="マスクインペインティング" icon="eraser">
    ローカル変更で編集領域を正確に指定するための任意のマスク入力
  </Card>

  <Card title="マルチティア + カスタム解像度" icon="image">
    1K / 2K / 4K のプリセットに加え、カスタムサイズ指定も可能（各辺最大 3840px、総ピクセル数 655,360–8,294,400）
  </Card>

  <Card title="15種類のアスペクト比" icon="ratio">
    AUTO, 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, 1:4, 4:1, 1:8, 8:1
  </Card>

  <Card title="品質 & 出力形式" icon="sliders-horizontal">
    `quality`（auto / low / medium / high）+ 出力形式（png / jpeg / webp）+ 圧縮 0-100
  </Card>

  <Card title="デュアルエンドポイント（リバースノード）" icon="git-branch">
    `gpt-image-2-all`は`chat_completions`と`images_api`のエンドポイント間を切り替えられます
  </Card>

  <Card title="内蔵タイムアウト & リトライ" icon="refresh-cw">
    タイムアウトとリトライのパラメータを内蔵しており、ピーク時間帯でも安定しています
  </Card>
</CardGroup>

## APIYI 対応モデル

| モデル                    | Model ID          | ノード                        | 用途                                          | API ドキュメント                                          |
| ---------------------- | ----------------- | -------------------------- | ------------------------------------------- | --------------------------------------------------- |
| GPT-Image 2 （公式）       | `gpt-image-2`     | `Comfyui-Luck gpt-image-2` | ネイティブな 2K/4K テキストから画像生成、参照画像編集、マスクインペインティング | [表示](/ja/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All （リバース） | `gpt-image-2-all` | `Comfyui-Luck gpt-2.0 all` | ChatGPT 同等の対話型画像生成、呼び出しごとの課金                | [表示](/ja/api-capabilities/gpt-image-2-all/overview) |

<Info>
  完全な並列表は、[gpt-image-2 (公式) vs gpt-image-2-all (リバース) の比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all) をご覧ください。
</Info>

## ノードパラメーター

### `Comfyui-Luck gpt-image-2` (公式)

| パラメーター                | 型      | 必須  | デフォルト  | 説明                                         |
| --------------------- | ------ | --- | ------ | ------------------------------------------ |
| `api_key`             | string | Yes | -      | APIYI token — 使用上限付きの専用キーを推奨します            |
| `prompt`              | string | Yes | -      | 生成または編集の指示                                 |
| `image_1` … `image_5` | IMAGE  | No  | -      | 参照画像、最大5枚                                  |
| `mask`                | MASK   | No  | -      | インペインティング用の任意マスク（白い領域 = 編集領域）              |
| `size`                | enum   | No  | `2K`   | 出力解像度（1K / 2K / 4K / custom）               |
| `custom_size`         | string | No  | -      | `size` が `custom` のときに使用します。例: `2048x3072` |
| `aspect_ratio`        | enum   | No  | `AUTO` | 15 種類のアスペクト比のいずれか                          |
| `quality`             | enum   | No  | `auto` | auto / low / medium / high                 |
| `output_format`       | enum   | No  | `png`  | png / jpeg / webp                          |
| `output_compression`  | int    | No  | 80     | 0-100（jpeg / webp のみに適用）                   |

### `Comfyui-Luck gpt-2.0 all` (逆方向)

| パラメーター            | 型      | 必須  | デフォルト              | 説明                                |
| ----------------- | ------ | --- | ------------------ | --------------------------------- |
| `api_key`         | string | Yes | -                  | APIYI token                       |
| `prompt`          | string | Yes | -                  | 対話型画像 prompt                      |
| `endpoint`        | enum   | No  | `chat_completions` | `chat_completions` / `images_api` |
| `response_format` | enum   | No  | -                  | `b64_json` / `url` など             |
| `timeout_seconds` | int    | No  | -                  | リクエストごとのタイムアウト                    |
| `retry_times`     | int    | No  | -                  | 失敗時のリトライ回数                        |

## インストール

<Steps>
  <Step title="手順 1: custom_nodes にクローンする">
    ComfyUI のインストール先で:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```
  </Step>

  <Step title="手順 2: 依存関係をインストールする">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="手順 3: ComfyUI を再起動する">
    ノードパレットで `Luck gpt-image-2` または `Luck gpt-2.0 all` を検索して見つけてください。
  </Step>

  <Step title="手順 4: APIYI キーを設定する">
    * [APIYI コンソール](https://www.apiyi.com) → Tokens を開き、新しいキーを作成してください（安全のため使用上限を設定するのがおすすめです）
    * `api_key` フィールドに貼り付けてください
    * ノードの既定値は `api.apiyi.com` です。必要に応じて予備ドメイン `vip.apiyi.com` / `b.apiyi.com` に切り替えられます
  </Step>

  <Step title="手順 5: サンプルワークフローをインポートする">
    リポジトリには `example_workflow.json` が同梱されています。開始点として ComfyUI にインポートしてください。
  </Step>
</Steps>

## 使用例

### 例1: 公式の4K高品質テキストから画像生成

```
Node: Comfyui-Luck gpt-image-2
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
size: 4K
aspect_ratio: 2:3
quality: high
output_format: png
```

### 例2: マスクインペインティング（公式）

```
Node: Comfyui-Luck gpt-image-2
image_1: original photo
mask: the area to be replaced (white = edit region)
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
size: 2K
quality: high
```

### 例3: 逆対話画像

```
Node: Comfyui-Luck gpt-2.0 all
endpoint: chat_completions
prompt: "A girl in hanfu standing under a cherry blossom tree, watercolor style, soft lighting"
response_format: b64_json
timeout_seconds: 180
retry_times: 3
```

## よくある質問

<AccordionGroup>
  <Accordion title="どのノードを選べばよいですか？">
    * **`gpt-image-2`（公式）**: 制御可能なパラメータ、ネイティブのマスク対応、token ごとの課金、きめ細かな解像度/品質 — 特定のサイズ要件がある場合やローカル編集が必要な場合に最適です
    * **`gpt-image-2-all`（リバース）**: 呼び出しごとの課金（\$0.03/call）、会話形式の自然言語 prompt、ChatGPT の Web 体験との同等性 — 反復編集や優れたテキスト描画に最適です
    * 詳細な並列表: [公式版とリバース版の比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="インストール後にノードが見つかりませんか？">
    1. フォルダが `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0` にあることを確認してください
    2. `pip install -r requirements.txt` がエラーなく完了したことを確認してください
    3. ComfyUI を完全に再起動してください（フロントエンドを更新するだけでは不十分です）
  </Accordion>

  <Accordion title="4K やカスタムサイズでタイムアウトが頻発しますか？">
    * リバースノードの `timeout_seconds` を上げてください
    * サーバーのネットワークが遅い場合は、[CDN の画像/動画ダウンロードが遅い](/ja/faq/cdn-download-slow) をご覧ください
    * 既定のエンドポイントが不安定な場合は、バックアップドメイン `vip.apiyi.com` / `b.apiyi.com` に切り替えてください
  </Accordion>

  <Accordion title="b64_json にプレフィックスが付いて返ってきますか？">
    リバース `gpt-image-2-all` では `b64_json` が `data:image/png;base64,` プレフィックス付きで返りますが、公式 `gpt-image-2` では返りません。詳細は[公式版とリバース版の比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)をご覧ください。
  </Accordion>

  <Accordion title="呼び出しで 401 / 403 が返りますか？">
    1. `api_key` の有効性と、チャネルによる制限の有無を確認してください
    2. 選択したモデルが token にホワイトリスト登録されていることを確認してください
    3. 残高の問題については、[残高は十分そうなのに呼び出しが失敗する](/ja/faq/balance-insufficient) をご覧ください
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="gpt-image-2 (official) ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2/overview">
    ネイティブ2K/4K生成、token単位の課金
  </Card>

  <Card title="gpt-image-2-all (reverse) ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2-all/overview">
    ChatGPT互換、\$0.03/回
  </Card>

  <Card title="公式版とリバース版の比較" icon="scale" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17項目の横並び表
  </Card>

  <Card title="ComfyUIノードコレクション" icon="workflow" href="/ja/scenarios">
    APIYI向けに調整されたComfyUIノードをさらに閲覧できます
  </Card>

  <Card title="Luck Nano Banana Pro (同じ作者)" icon="puzzle" href="/ja/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvrのGemini系ComfyUIノード
  </Card>

  <Card title="APIYI GPT-Image 2 Skills (同じモデル)" icon="puzzle" href="/ja/scenarios/ecosystem/apiyi-gpt-image-skills">
    同じ2つのGPT画像モデル向けのAI Agent Skill版
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    キー、利用状況、チャネルを管理します
  </Card>
</CardGroup>
