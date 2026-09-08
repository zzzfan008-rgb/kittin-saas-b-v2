> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2 公式版 vs リバース版

> gpt-image-2（公式）と、リバースエンジニアリングされた姉妹モデル gpt-image-2-all と gpt-image-2-vip を比較します: チャネルの性質、価格、エンドポイント、アップロード/出力形式、速度重視か品質重視かの位置づけ、prompt への追従性 — どれを選ぶべきか。

## TL;DR

| 必要なのは                                                                               | 選ぶもの                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------ |
| **`quality`ノブ / マスクインペインティング / 30 個のプリセットを超える任意のカスタムサイズ / 厳密な OpenAI API フィールド互換性** | `gpt-image-2`（公式、token 従量課金）               |
| **予測しやすい一律 \$0.03/image + 高速な出力（速度が強みです）**                                          | `gpt-image-2-all`（リバース、ChatGPT web 系、約90秒） |
| **予測しやすい一律 \$0.03/image + サイズ固定（4K を含む 30 個のプリセット）+ ときどき高品質（急がない場合）**               | `gpt-image-2-vip`（リバース、Codex 系、約120〜200秒）  |

3 つのモデルはいずれも内部では OpenAI の gpt-image-2 を基盤にしています。違いは、チャネルの性質（公式直結かリバースエンジニアリングか）、料金体系、パラメータの粒度です。

<Note>
  **2つのリバース系の兄弟（-all / -vip）**: このページの「Reverse」列は **`gpt-image-2-all` と `gpt-image-2-vip` の両方** をカバーしています — 両者は同じ呼び出し形式（`-vip` はさらに `size` フィールドにも対応）と、同じ \$0.03/image の一律価格を共有しています。現在の違いは **速度 vs 品質 + サイズ固定** です:

  * `gpt-image-2-all`: ChatGPT web 系、**約90秒**の生成 — **速度が強みです**
  * `gpt-image-2-vip`: Codex 系、**約120〜200秒**の生成 — 遅めですが、**場合によってはより高品質**で、**`size`固定に対応**（4K を含む 30 個のプリセット、2026-07-22 に復活）
  * 両方とも: `quality` なし、`n` なし、マスクインペインティングなし

  `quality` ティア、マスクインペインティング、または 30 個のプリセットを超える任意のカスタムサイズが必要な場合は、公式の `gpt-image-2` を使用してください。
</Note>

<Tip>
  **現在の速度について**: `-all` / `-vip` の生成は **OpenAI 上流の計算リソース変動** のため、**公開時より遅くなっています** — これは APIYI だけでなく、すべてのリバースチャネル利用者に影響します。アカウントプールと運用は健全です。クライアントのタイムアウトは 300 秒以上に設定し、複雑な prompt にはより余裕を持たせてください。
</Tip>

## 詳細比較表

| 項目                  | **gpt-image-2-all / -vip**（リバース、コスト効率良好）                                                                                                                                                                     | **gpt-image-2**（公式）                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **モデル名**            | `gpt-image-2-all`（最速） / `gpt-image-2-vip`（品質重視、サイズ固定）                                                                                                                                                        | `gpt-image-2`                                                        |
| **チャネルの性質**         | `-all`: リバースエンジニアリングされた ChatGPT Web 系<br />`-vip`: リバースエンジニアリングされた Codex 系                                                                                                                                   | 公式直結（OpenAI Images API）                                              |
| **料金**              | **都度課金**: 一律 \$0.03/回（両モデルとも同一価格）                                                                                                                                                                            | **token 従量課金**: 公式に準拠。APIYI のチャージ特典適用後は定価の約 **85%**                  |
| **一般的な画像1枚あたりの費用**  | \$0.03（サイズ / 品質 / モデルにかかわらず同一）                                                                                                                                                                               | 実測 **\$0.03 – \$0.2**（prompt の長さ、サイズ、品質に連動）                          |
| **token グループ**      | デフォルト                                                                                                                                                                                                        | デフォルト                                                                |
| **token 種別**        | **都度課金** / **Token優先** のどちらも動作します                                                                                                                                                                            | **Token優先のみ**（このモデルは token 課金です。都度課金 token は拒否されます）                  |
| **推奨エンドポイント**       | **`/v1/images/generations` + `/v1/images/edits`**（より安定で、上流供給も多く、公式と同じコードです — リスク制御が不安定なときは `model` の名前を切り替えるだけで切り替えられます）                                                                                     | `/v1/images/generations` + `/v1/images/edits`                        |
| **アップロード形式**        | multipart ファイル（edits エンドポイント）                                                                                                                                                                                | multipart ファイル（edit エンドポイント）                                         |
| **出力形式**            | `b64_json`（デフォルト、**プレフィックスなしの raw base64**、2026-07 に確認済み；以前のバージョンにはプレフィックスが含まれていました）または `url`（R2 CDN）                                                                                                        | `b64_json`（**プレフィックスなしの raw base64**）                                |
| **参照画像枚数**          | 複数                                                                                                                                                                                                           | **最大 16**（`image[]`）                                                 |
| **マスクのインペイント**      | ❌ 非対応                                                                                                                                                                                                        | ✅ 対応（alpha チャネルが必要です）                                                |
| **prompt 忠実度**      | 良好                                                                                                                                                                                                           | **非常に高い**                                                            |
| **生成速度**            | `-all`: 約 **90 秒**（速度が強みです）<br />`-vip`: 約 **120–200 秒**（遅めですが、ときに品質が高いことがあります）<br />📌 現在はリリース当初より遅めです — OpenAI 上流の計算資源によるもので、APIYI 側の問題ではありません                                                             | 約 **100-120 秒**、複雑なものや 4K では 3-5 分に達することがあります                        |
| **品質傾向**            | `-all`: 良好<br />`-vip`: **ときにさらに高い**（Codex 系では、細部がより良いことがあります）                                                                                                                                               | 安定しており、`quality=high` ではその性能を最大限に発揮します                               |
| **`size` パラメータ**    | `-all`: ❌ 受け付けません（prompt に記述してください）<br />`-vip`: ✅ **復活**（2026-07-22 以降）、30 個のプリセットサイズ（4K を含む）；images エンドポイントのみ対応で、chat エンドポイントでは非対応                                                                         | ✅ 有効なカスタムサイズなら任意                                                     |
| **4K 対応**           | `-all`: ❌<br />`-vip`: ✅ 4K Detail 階層（例: `3840x2160` / `2880x2880`）、追加料金なし                                                                                                                                   | ✅ `3840×2160` を含む                                                    |
| **一般的な出力サイズ**       | `-all`: 16:9 → 1672×941、9:16 → 941×1672、1:1 → 1254×1254（自動調整）<br />`-vip`: 30 種のプリセット（10 の比率 × 1K/2K/4K）、[完全な 30 サイズ表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) を参照 | 8 種のプリセット + 任意の有効なカスタムサイズ                                            |
| **`quality` パラメータ** | ❌ 両方のリバースモデルはこれを拒否します（渡さないでください）                                                                                                                                                                             | ✅ `low` / `medium` / `high` / `auto`                                 |
| **`n` パラメータ**       | ❌ 両方のリバースモデルはこれを拒否します（1 回の呼び出しにつき 1 画像）                                                                                                                                                                      | ✅ 対応                                                                 |
| **透過背景**            | ⚠️ `background` パラメータはありません — prompt のみで、時折不安定です                                                                                                                                                             | ✅ パラメータで制御でき、安定して使えます — `background: "transparent"` で `png` / `webp` |
| **中国語の prompt**     | ✅ ネイティブ                                                                                                                                                                                                      | ✅ ネイティブ                                                              |
| **テキスト描画**          | 高忠実度                                                                                                                                                                                                         | 高忠実度（`high` 階層で最も強いです）                                               |
| **API ドキュメント**      | [GPT-Image-2-All の概要](/ja/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2-VIP の概要](/ja/api-capabilities/gpt-image-2-vip/overview)                                                                  | [GPT-Image-2 の概要](/ja/api-capabilities/gpt-image-2/overview)         |

<Info>
  🔑 **API token を作成または管理する**: [https://api.apiyi.com/token](https://api.apiyi.com/token)\
  コンソールで token を作成するときは、グループ（`Default` で問題ありません）と token 種別（**都度課金** / **Token優先**）を選択してください。**`gpt-image-2`（公式）を呼び出すには「Token優先」token が必要です** — 都度課金 token は課金モードの不一致により拒否されます。
</Info>

## それぞれを選ぶタイミング

### `gpt-image-2-all`（リバース）を選ぶのは次のとき

<CardGroup cols={2}>
  <Card title="💰 予測しやすいコスト" icon="dollar-sign">
    サイズ/品質ティアの区分なしで、安定した \$0.03/画像。**厳格なコスト上限があるバッチ生産に最適**（インフォグラフィック、マーケティング素材、Eコマースのサムネイル）。
  </Card>

  <Card title="⚡ 出力が速い" icon="bolt">
    生成は約90秒で、`-vip` と公式版の両方より **わずかに高速**です。**リアルタイム UX がより良好**です。
  </Card>

  <Card title="🔁 1つのコードベース、いつでも切り替え可能" icon="repeat">
    標準の画像生成 API 形式 — `-vip` と公式リレーの `gpt-image-2` と **同じコード**で使えます。`model` 名を変えるだけで、切り替えやフォールバックが可能です。
  </Card>

  <Card title="🌏 中国語 + マーケティング文" icon="type">
    中国語の prompt をネイティブにサポートし、看板 / ポスター / インフォグラフィック向けの文字描画が非常に優秀です — **中国語圏向けコンテンツ制作に最適**です。
  </Card>
</CardGroup>

### `gpt-image-2-vip`（リバース、品質重視）を選ぶのは次のとき

<CardGroup cols={2}>
  <Card title="🎨 ときどきより高品質" icon="wand-sparkles">
    Codex 系のディテール描画は **`-all` より優れていることがある** ため、急がず、同じリバースチャネルの定額価格で少しでも品質を上げたいショーケース画像に向いています。
  </Card>

  <Card title="⏱️ 時間を品質に充てる" icon="hourglass">
    生成は約 **120–200秒** で、`-all` より遅めです。より高い上限のために長い待ち時間を受け入れられるときに選んでください。
  </Card>

  <Card title="🖼️ 固定サイズ / 4K" icon="expand">
    `size` パラメータは **復活** しました（2026-07-22 以降）：30個のプリセットサイズ（10比率 × 1K/2K/4K）。Eコマースのヒーローショット、ポスターテンプレート、4K壁紙を正確な寸法で出力できます — 定額 \$0.03/画像、4K追加料金なし。
  </Card>

  <Card title="🔁 -all とコードを共有" icon="copy">
    `-all` と同じリクエスト構造（追加されるのは `size` フィールドが1つだけ） — 速度 / 品質の好みに応じて `model` 名を入れ替えるだけで、1つのコードベースで両モデルを切り替えられます。
  </Card>
</CardGroup>

<Note>
  `-vip` の `size` は `/v1/images/generations` と `/v1/images/edits` エンドポイントでのみ動作します — **`/v1/chat/completions` の chat エンドポイントは `size` をサポートしていません**。30個のプリセットを超える任意のカスタムサイズ、`quality` ティア、またはマスクのインペインティングには、公式 `gpt-image-2` を使用してください。このパラメータの提供状況は上流の変更に従います — 最新の状況は [ライブ更新](/en/live) をご覧ください。
</Note>

### `gpt-image-2`（公式）を選ぶのは次のとき

<CardGroup cols={2}>
  <Card title="🎚️ 品質ティア" icon="sliders-horizontal">
    `quality` は low/medium/high/auto をサポートします。**下書きでは `low` を使ってコストを節約し、印刷品質の最終版では `high` を使ってください** — 公式版のみで、両方のリバースモデルはこれを拒否します。
  </Card>

  <Card title="🎯 マスクのインペインティング" icon="paintbrush">
    アルファチャンネルのマスクに対応 — **他の部分を保持しながら領域を正確に修正できます**。両方のリバースモデルはこれをサポートしていません。
  </Card>

  <Card title="🖼️ 任意のカスタムサイズ" icon="expand">
    `size` は **有効な解像度なら何でも**（4K を含む）受け付け、プリセットに限定されません。`-vip` は 30 個のプリセットサイズのみ対応 — **その 30 個を超えるものはすべて公式版です**。
  </Card>

  <Card title="🔌 OpenAI 公式版と同じ" icon="plug">
    公式の画像生成 API を経由します — フィールドと挙動は OpenAI 公式版と同一です。**既存の OpenAI SDK ベースのコード / システムは変更ゼロで移行でき、長期的にも安定します**。
  </Card>
</CardGroup>

## 詳細な主な違い

### 1. b64\_json 形式の落とし穴（移行時の罠！）

2026年7月に確認したところ、両方のモデルは現在 **生の base64（`data:` のプレフィックスなし）** を返しますが、`gpt-image-2-all` には以前プレフィックスが含まれていたため、共通コードではまずそれをチェックするのが最も安全です:

```python theme={null}
# Universal pattern: detect the prefix before processing — works for both models
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # handles historical prefixed responses
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ write file
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ browser render
```

<Warning>
  2つを切り替える際は、**`b64_json` の処理コードを変更する必要があります**。そうしないと、破損した data URL やデコード失敗が発生します。
</Warning>

### 2. 解像度の制御

**gpt-image-2-all**（prompt 内で）:

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**gpt-image-2-vip**（`size` が復元済み、2026-07-22 時点）:

**30 種類のプリセットサイズ**（10 の比率 × 1K/2K/4K）に対応しており、`size: "WIDTHxHEIGHT"` を直接渡します（30 個のプリセットのいずれかである必要があります。全一覧は [30 サイズ表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) を参照してください）:

```python theme={null}
client.images.generate(
    model="gpt-image-2-vip",
    prompt="...",
    size="3840x2160"    # ✅ one of the 30 presets; images endpoints only (not chat)
)
```

**gpt-image-2**（`size` パラメータ厳格 + `quality` ティア）:

```python theme={null}
client.images.generate(
    model="gpt-image-2",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="high"      # official-only
)
```

### 3. アップロード / 出力形式の違い

| 操作              | gpt-image-2-all                                                                                              | gpt-image-2                       |
| --------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| **参照画像のアップロード** | multipart `image` file フィールド（edits エンドポイント）                                                                  | multipart `image[]` file フィールド    |
| **出力のダウンロード**   | デフォルトは `b64_json`（生の base64、2026-07 に確認済み）。明示的に `response_format: "url"` を指定すると R2 CDN リンクを返します（**24 時間有効**） | `b64_json`（**生の base64**、デコードが必要） |
| **複数画像の融合**     | edits エンドポイントで `image` フィールドを繰り返し指定します                                                                       | `image[]` 配列、**最大 16**            |

### 4. コストの目安

| シナリオ               | gpt-image-2-all / -vip                                  | gpt-image-2                                  |
| ------------------ | ------------------------------------------------------- | -------------------------------------------- |
| 1024×1024 の下書き     | \$0.03                                                  | 約 \$0.006（低）                                 |
| 1024×1024 の中品質     | \$0.03                                                  | 約 \$0.053（中）                                 |
| 1024×1024 の高品質     | \$0.03                                                  | 約 \$0.211（高）                                 |
| 2048×1152 の高品質     | \$0.03                                                  | 約 \$0.20 超（token 課金）                         |
| 3840×2160 の 4K 高品質 | \$0.03（`-vip` 4K Detail ティア、追加料金なし；`-all` には 4K がありません） | token 課金、**1K より大幅に高額**                      |
| 編集 / 複数画像の融合       | \$0.03                                                  | 入力 tokens が大きく増え、1 回の呼び出しで \$0.1 超になることがあります |

<Info>
  **要するに**: バッチ / 低品質ワークロードでは、リバースチャネルのほうが常に安いとは限りません（1K の low は実際には公式ティアのほうが安いです）。**中〜高品質の範囲**が、リバースチャネルの \$0.03 の最適ゾーンです。**`quality` ティア / mask inpainting / 固定サイズ、4K / 厳密な OpenAI-API フィールド互換性** が必要な場合は、公式（token 課金）を選んでください。
</Info>

## クライアント設定

| 設定              | gpt-image-2-all / -vip                                             | gpt-image-2                             |
| --------------- | ------------------------------------------------------------------ | --------------------------------------- |
| **タイムアウト（保守的）** | `-all`: **300s** (通常は約 90 秒)<br />`-vip`: **300s** (通常は 120–200 秒) | **360s** (4K の高品質では実際に 3〜5 分かかります)      |
| **再試行戦略**       | 5xx / タイムアウト時は指数バックオフ、最大 2 回再試行                                    | 同じです                                    |
| **同時実行数**       | 1 回の呼び出しにつき 1 画像 — 複数枚は並列リクエストを送信してください                            | 1 回の呼び出しにつき 1 画像 — 複数枚は並列リクエストを送信してください |
| **リクエスト ID**    | `request-id` レスポンスヘッダー                                             | `x-request-id` レスポンスヘッダー                |

<Tip>
  **3 つのモデルすべてに共通: image edit / multi-image fusion では、各入力画像を 1.5MB 未満に圧縮してください** (JPEG 品質 80-90 / 解像度縮小)。断続的な `shell_api_error` / `Unknown error` レスポンスは、ほとんどの場合、入力が大きすぎることが原因です — 圧縮すると成功率とレイテンシーが明確に改善します。**出力解像度は入力サイズに依存しません** — 品質は出力側で設定されます（公式では `size` + `quality`、`size` ティア（`-vip` 向け）、`-all` の prompt の言い回し）であり、入力ファイルサイズではありません。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="入力画像は圧縮すべきですか？ prompt に 4K / 8K と書くと効果がありますか？">
    **はい、強く推奨します。** 3つのモデルすべてで、各入力画像を **1.5MB 未満**（JPEG 品質 80〜90 / 解像度を縮小）に圧縮してください。まれに発生する `shell_api_error` / `Unknown error` 応答の多くは、入力が大きすぎることが原因です。圧縮すると成功率とレイテンシが目に見えて改善します。

    **圧縮で品質が落ちる心配は不要です** — 出力解像度は入力サイズとは独立しています。3つのモデルで「出力側」の制御方法は異なります。

    * `gpt-image-2-all`: prompt の構成文言で制御されます（[-all 概要ページ](/ja/api-capabilities/gpt-image-2-all/overview) の検証済み文言表を参照）— prompt 内の `4K` / `8K` はカウントされません
    * `gpt-image-2-vip`: `size` フィールドで制御されます（4K を含む 30 種類のプリセットサイズ、2026-07-22 に復活）— prompt 内の `4K` / `8K` もカウントされません
    * `gpt-image-2`: `size` + `quality` で制御されます（有効なサイズなら任意）

    要するに、入力を小さくしても速くなるだけです。品質は入力ファイルサイズではなく、出力側の構成で決まります。
  </Accordion>

  <Accordion title="同じ API Key で3つのモデルすべてを呼び出せますか？">
    はい。3つすべてが Default チャネルで動作しており、同じ API Key で追加設定なしに呼び出せます。注意: `gpt-image-2`（公式）の呼び出しには「Token優先」token が必要です。`-all` / `-vip` はどちらの token タイプでも受け付けます。
  </Accordion>

  <Accordion title="リバースチャネルではどの endpoint を使うべきですか？">
    **OpenAI Images API を使ってください**（テキストから画像生成用の `/v1/images/generations` + 編集用の `/v1/images/edits`）、理由は2つあります。

    1. **より安定**: Images API チャネルの upstream リソース供給がより豊富なため、呼び出し成功率が高いです
    2. **公式リレーへの切り替えが簡単な互換性**: 呼び出し方法とパラメータ形式は公式リレーの `gpt-image-2` と完全互換です — リバースチャネルでリスク制御の揺れが発生したら、**`model` 名を差し替えるだけで公式リレーに切り替えられます**。コード変更は不要です

    チャットベースの endpoint（`/v1/chat/completions`、**現在は推奨しません**）もありますが、複数ターンの反復編集やオンライン画像 URL を直接渡す場合にのみ有用です。画像の意図が曖昧な場合は、画像ではなくプレーンテキストを返すことがあります（「画像を生成してください:」のような固定プレフィックスを先頭に付けて強めてください）。全パラメータは、[-all チャットベース API リファレンス](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip チャットベース API リファレンス](/en/api-capabilities/gpt-image-2-vip/chat-completions) をご覧ください。
  </Accordion>

  <Accordion title="リバースチャネル内では、-all と -vip のどちらを選ぶべきですか？">
    どちらも同じ定額価格（\$0.03/image）のリバースエンジニアリング済みチャネルで、呼び出し形式も同じです（`-vip` はさらに `size` 固定をサポートします）。違いは **速度 vs 品質 + サイズ固定** です。

    * **生成時間**: `-all` は約90秒 — **速度が強み** です。`-vip` は約120〜200秒。現在は OpenAI upstream の計算リソース変動により、リリース当初より遅くなっています
    * **品質**: `-vip`（Codex 系）の細部描画は **場合によってはより高品質** です — 急いでいない展示用画像向けです
    * **サイズ固定**: `-vip` は 30 種類のプリセット `size` 値（4K を含む）をサポートします。`-all` は `size` を受け付けません — 構図は prompt に入ります

    判断基準: 速さ重視なら → `-all`; 品質重視、または固定サイズ / 4K が必要なら → `-vip`; 30 プリセットを超えるカスタムサイズ、`quality` 階層、または mask が必要なら → 公式 `gpt-image-2`。詳細は [GPT-Image-2-VIP 概要](/ja/api-capabilities/gpt-image-2-vip/overview) をご覧ください。
  </Accordion>

  <Accordion title="固定サイズ / 4K が必要です — どうすればよいですか？">
    まずは `gpt-image-2-vip` をお試しください。その `size` パラメータは 2026-07-22 に復活し、**30 種類のプリセットサイズ（10 比率 × 1K/2K/4K）** を、4K 追加料金なしの一律 \$0.03/image でサポートします。`size` は images endpoint でのみ動作し、30 プリセットのいずれかである必要があります。

    30 プリセットを超える **任意の有効サイズ**、**`gpt-image-2` 階層**（low/medium/high/auto）、**mask inpainting**（アルファチャンネル mask）、または **厳密な OpenAI-API のフィールド互換性**（既存の OpenAI-SDK コードを変更なしで移行）が必要な場合は、公式に切り替えてください（`quality`、token 従量課金）。
  </Accordion>

  <Accordion title="1.5 から移行する場合 — どれを選ぶべきですか？">
    * **OpenAI SDK を使い続ける / OpenAI 公式と一致させる必要がある / 30 プリセットを超えるカスタムサイズが必要**: `gpt-image-2`（公式）を選んでください。`input_fidelity` を外し、残りはそのままにします（`background: transparent` は引き続き動作します）。
    * **コストを抑えつつ、速い出力がほしい**: `gpt-image-2-all`（reverse、約90秒）を選んでください。
    * **コストを抑えつつ、品質重視、または固定サイズ / 4K が必要**: `gpt-image-2-vip`（reverse、約120〜200秒、4K を含む 30 プリセットサイズ）を選んでください。
  </Accordion>

  <Accordion title="フェイルオーバー用に複数のモデルをデプロイできますか？">
    はい。一般的な構成は、**プライマリに `-all` または `-vip`**（予測しやすいコスト — 速度 / 品質の好みで選択）、**フォールバックに `gpt-image-2`**（`quality` 階層、mask、または 30 プリセットを超えるカスタムサイズが必要になったら切り替え）。reverse と official ではレスポンス形式が異なるため、ビジネス層で正規化してください。
  </Accordion>

  <Accordion title="R2 CDN の画像リンクが遅い — どうすればよいですか？">
    [遅い CDN ダウンロード — どうするか](/ja/faq/cdn-download-slow) をご覧ください
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [GPT-Image-2 概要](/ja/api-capabilities/gpt-image-2/overview) - 公式統合ドキュメント一式
* [GPT-Image-2-All 概要](/ja/api-capabilities/gpt-image-2-all/overview) - ChatGPT-web のリバースライン（最速出力）の統合ドキュメント一式
* [GPT-Image-2-VIP 概要](/ja/api-capabilities/gpt-image-2-vip/overview) - Codex ラインのリバース版（場合によっては品質が高く、`size` ロックあり）の統合ドキュメント一式
* [詳解: gpt-image-2 リリース](/en/news/gpt-image-2-launch) - 公式版のリリース
* [詳解: gpt-image-2-all リリース](/en/news/gpt-image-2-all-launch) - リバースエンジニアリング版のリリース
* [コミュニティ: Luck GPT-Image 2 ComfyUI ノード](/ja/scenarios/ecosystem/luckgpt2-comfyui) - マルチモデル ComfyUI ノードパック
* [コミュニティ: APIYI GPT-Image 2 スキル](/ja/scenarios/ecosystem/apiyi-gpt-image-skills) - マルチモデル AI Agent スキルパック
* [入金プロモーション](/ja/faq/recharge-promotions) - チャージ ボーナスポリシー
