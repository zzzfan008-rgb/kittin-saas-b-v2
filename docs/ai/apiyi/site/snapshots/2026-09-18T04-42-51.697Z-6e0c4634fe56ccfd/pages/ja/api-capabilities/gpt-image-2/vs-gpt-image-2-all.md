> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2.5 / 2 公式版とリバース版

> 公式の gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 と、リバースエンジニアリングされた姉妹モデル gpt-image-2.5-all、gpt-image-2-all、gpt-image-2.5-vip、gpt-image-2-vip を比較します。チャンネルの性質、料金、エンドポイント、アップロード／出力形式、速度と品質の位置付け、プロンプトへの準拠を確認して、適切なモデルを選択できます。

## 要約

| 必要なもの                                                                                  | 選択                                                                                                                                                         |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`quality` ノブ / マスクインペインティング / 任意のカスタムサイズ（30個のプリセットを超える場合）/ OpenAI-APIフィールドとの厳密な互換性** | 公式、token計測制：`gpt-image-2.5-flare`（速度優先）/ `gpt-image-2.5-sunburst`（編集精度優先）/ `gpt-image-2`（前世代）                                                              |
| **予測可能な一律 \$0.03/画像 + 高速出力（速度が強み）**                                                    | `gpt-image-2-all` / `gpt-image-2.5-all`（リバース、ChatGPTウェブ系統、約90秒；2.5-allはImages 2.5を基盤とします）                                                                  |
| **予測可能な一律 \$0.03/画像 + 固定サイズ（4Kを含む30個のプリセット）**                                          | `gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`（リバース、Adobe系統；2つの2.5モデルは6つすべての`quality`ティアに対応し、`gpt-image-2-vip`は最大`high`まで対応） |

8つのモデルはすべて、基盤として**OpenAIのGPT-Image 2.5 / 2シリーズ**を使用しています。違いは、チャネルの性質（公式直接接続かリバースエンジニアリングか）、価格モデル、およびパラメータの細かさにあります。3つの公式モデルは価格とパラメータを共有し、5つのリバースモデルは価格と呼び出し形式を共有します。

<Note>
  **3つのリバース系統（-all / 2.5-all / -vipトリオ）**：このページの「リバース」列は、**`gpt-image-2-all`**、**`gpt-image-2.5-all`**、および\*\*`gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`\*\*（エイリアス：`gpt-image-2.5-vip` = sunburst-vip）を対象としています。すべて一律 \$0.03/画像の価格と同じ呼び出し形式を共有します（3つの`-vip`モデルは追加で`size`に対応）：

  * `gpt-image-2-all` / `gpt-image-2.5-all`：ChatGPTウェブ系統、生成は**約90秒** — **速度が強みです**；2.5-allはImages 2.5を基盤とします
  * `gpt-image-2-vip`および2つの2.5 -vipモデル：Adobe系統（Firefly）、**`size`の固定（4Kを含む30個のプリセット）**；3つすべてが`quality`を受け入れます（チャネルの挙動であり、保証ではありません）：2つの2.5モデルは2026-09-10の再テストで`xhigh` / `max`を開放し、現在は6つすべてのティアに対応しています。`gpt-image-2-vip`は最大`high`まで対応します；3つすべてが透明背景を返します；flare-vipは最速で柔らかめの見た目になり、sunburst-vipは視覚的に`gpt-image-2-vip`に近いです
  * 共通点：いずれも`n`には対応していません；`mask`はすべてで画像全体の再生成となり、マスクされた領域のみを変更する保証はありません

  正確なマスクインペインティング、30個のプリセットを超える任意のカスタムサイズ、または`n` > 1が必要な場合は、公式モデル（`gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`）を使用してください。
</Note>

<Tip>
  **現在の速度について**：`-all` / `-vip`の生成は、**OpenAI上流のコンピュート変動**により、**リリース時より遅く**なっています — これはAPIYIだけでなく、すべてのリバースチャネルユーザーに影響します；当社のアカウントプールと運用は正常です。クライアントのタイムアウトを300s以上に設定し、複雑なpromptにはより余裕を持たせてください。
</Tip>

## 完全比較表

| 寸法                   | **gpt-image-2-all / 2.5-all / -vip**（リバース、コスト効率重視）                                                                                                                                                                                                                                             | **gpt-image-2.5-flare / sunburst / gpt-image-2**（公式）                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **モデル名**             | `gpt-image-2-all`（最速） / `gpt-image-2.5-all`（同じ系列の2.5バージョン） / `gpt-image-2-vip`（品質優先、サイズ固定） / `gpt-image-2.5-flare-vip` · `gpt-image-2.5-sunburst-vip`（同じ系列の2.5バージョン、エイリアス `gpt-image-2.5-vip`）                                                                                                 | `gpt-image-2.5-flare`（速度優先） / `gpt-image-2.5-sunburst`（編集精度優先） / `gpt-image-2`（前世代）                                                                                                 |
| **チャンネルの性質**         | `-all` / `2.5-all`：リバースエンジニアリングされたChatGPTウェブ系列<br />3つの `-vip` モデル：リバースエンジニアリングされたAdobe系列（Firefly、高品質なGPT-Image 2.5のリバース系列、アップスケーリングではありません）                                                                                                                                                   | 公式ダイレクト（OpenAI Images API）；3つすべてで価格とパラメーターは同一                                                                                                                                       |
| **料金**               | **リクエスト単位**：一律 \$0.03/回（5つのリバースモデルすべて、同一料金）                                                                                                                                                                                                                                                    | **token従量制**：公式と同じ；APIYIの入金ボーナス適用後は定価の約**85%**                                                                                                                                      |
| **画像あたりの一般的なコスト**    | \$0.03（サイズ / 品質 / モデルに関係なく一定）                                                                                                                                                                                                                                                                  | 実測 **\$0.03 – \$0.2**（promptの長さ、サイズ、品質に相関）                                                                                                                                          |
| **tokenグループ**        | デフォルト                                                                                                                                                                                                                                                                                          | デフォルト                                                                                                                                                                               |
| **tokenタイプ**         | **リクエスト単位** または **token優先** のどちらも利用可能                                                                                                                                                                                                                                                          | **token優先のみ**（このモデルはtoken課金；リクエスト単位のtokenは拒否されます）                                                                                                                                   |
| **推奨エンドポイント**        | **`/v1/images/generations` + `/v1/images/edits`**（より安定し、上流からの供給量が多く、公式と同じコードを使用 — リスク制御が不安定なときは `model` の名前を差し替えるだけで切り替え可能）                                                                                                                                                                    | `/v1/images/generations` + `/v1/images/edits`                                                                                                                                       |
| **アップロード形式**         | multipartファイル（編集エンドポイント）                                                                                                                                                                                                                                                                       | multipartファイル（編集エンドポイント）                                                                                                                                                            |
| **出力形式**             | `b64_json`（デフォルト、**プレフィックスなしのraw base64**、2026-07に検証済み；以前のバージョンではプレフィックスを含んでいました）または `url`（R2 CDN）                                                                                                                                                                                             | `b64_json`（**raw base64、プレフィックスなし**）                                                                                                                                                |
| **参照画像数**            | 複数                                                                                                                                                                                                                                                                                             | **最大16**（`image[]`）                                                                                                                                                                 |
| **マスクインペインティング**     | `-all` / `2.5-all`：❌ 非対応<br />3つの `-vip` モデル：⚠️ 受け付けられますが画像全体を再生成 — 実写写真で3回実行した測定では、内側と外側の変更比率は約1（2026-09-09）；マスク領域だけに触れる保証はありません                                                                                                                                                              | ✅ 対応（アルファチャンネルが必要）                                                                                                                                                                  |
| **promptへの忠実度**      | 良好                                                                                                                                                                                                                                                                                             | **非常に優秀**                                                                                                                                                                           |
| **生成速度**             | `-all`： 約**90秒**（速度が強み）<br />`gpt-image-2-vip`： 約**90–150秒**<br />2つの2.5 -vipモデル：1024²の連続実行で、flareは22–138秒、sunburstは37–120秒と実測され、ばらつきが大きい；500 RPM以内では同時実行数の計画は不要、まれな429はバックオフ付きで再試行するか、[ライブ更新](/en/live)を確認してください<br />📌 現在はリリース時より遅くなっています — OpenAI上流のコンピューティングが原因であり、APIYI側の問題ではありません       | `gpt-image-2.5-flare`：公式で最速、1K `low` の実測は約10秒（2026-09-09）<br />`gpt-image-2.5-sunburst`：1K `low` の実測は約14秒、高品質ではより低速<br />`gpt-image-2`： 約**100～120秒**、複雑な内容 + 4Kでは3～5分に達する場合があります   |
| **品質傾向**             | `-all` / `2.5-all`：良好（同じ系列；この2つの名前では同じ画像が生成されます）<br />`-vip`：同じサイズのprompt 6件を目視評価したところ、sunburst-vipは `gpt-image-2-vip` に近く、flare-vipはより柔らかく装飾的なディテールが少ない；中国語の見出しの画線は3つすべてで正確                                                                                                                   | 安定；2つの2.5モデルはgpt-image-2を上回り、sunburstが最高で、`quality=xhigh` / `max` で最大性能を発揮                                                                                                          |
| **`size` パラメーター**    | `-all` / `2.5-all`：❌ 受け付けられません（promptで記述してください）<br />3つの `-vip` モデル：✅ **復活**（2026-07-22以降）、30種類のプリセットサイズ（4Kを含む）；画像エンドポイントのみで、チャットエンドポイントでは非対応です。`size` を省略すると、`gpt-image-2-vip` / sunburst-vipは2048×2048、flare-vipは固定の1024×1536を返します（以前、デフォルトは上流側で変更されています） — サイズを固定するにはプリセットを渡してください          | ✅ 有効なカスタムサイズを任意に指定可能                                                                                                                                                                |
| **4K対応**             | `-all` / `2.5-all`：❌<br />3つの `-vip` モデル：✅ 4K Detailティア（例：`3840x2160` / `2880x2880`）、追加料金なし                                                                                                                                                                                                    | ✅ `3840×2160` を含む                                                                                                                                                                   |
| **一般的な出力サイズ**        | `-all`：16:9 → 1672×941、9:16 → 941×1672、1:1 → 1254×1254（アダプティブ）<br />3つの `-vip` モデル：30種類のプリセット（10種類の比率 × 1K/2K/4K）、[30サイズの完全な表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)を参照；プリセット外のサイズでもエラーにはなりませんが、16の倍数に調整されるか、最小辺まで引き上げられます                         | 8種類のプリセット + 有効なカスタムサイズ                                                                                                                                                              |
| **`quality` パラメーター** | `-all` / `2.5-all`：❌ 拒否されます（渡さないでください）<br />3つの `-vip` モデル：✅ 実測値、チャンネルの動作であり、保証ではありません — 2つの2.5モデルは6段階すべて `auto` / `low` / `medium` / `high` / `xhigh` / `max` を受け付けます（`xhigh` / `max` は2026-09-10に追加）、`gpt-image-2-vip` は `high` まで                                                           | ✅ `low` / `medium` / `high` / `xhigh` / `max` / `auto`（`xhigh` / `max` は2つの2.5モデルのみ）                                                                                                |
| **`quality` ティア対応**  | 2048×1152での出力token：`gpt-image-2-vip` low 157 / medium 1,413 / high 5,650；2つの2.5 -vipモデルは low 157 / medium 367 / high 1,413 / xhigh 2,511 / max 5,650 — **2.5 `high` = `gpt-image-2-vip` `medium`、2.5 `max` = `gpt-image-2-vip` `high`**、公式の2.5とgpt-image-2と同じ関係；リクエスト単位の課金のため、ティアによって料金は変わりません | 1024²での出力token：公式2.5 low 196 / medium 439 / high 1,756 / xhigh 3,122 / max 7,024；`gpt-image-2` low 196 / medium 1,756 / high 7,024 — 公式2.5 `high` = `gpt-image-2` `medium`；token従量制 |
| **`n` パラメーター**       | ❌ 5つのリバースモデルはいずれも非対応（1回の呼び出しにつき1画像）                                                                                                                                                                                                                                                            | ✅ 対応                                                                                                                                                                                |
| **透明背景**             | `-all` / `2.5-all`：⚠️ `background` パラメーターなし、promptのみ、信頼性にばらつきがあります<br />3つの `-vip` モデル：✅ `background: "transparent"` はテストでアルファPNGを返します（保証ではありません）                                                                                                                                              | ✅ パラメーターで制御でき、信頼性も高い — `background: "transparent"` と `png` / `webp` を使用                                                                                                             |
| **中国語prompt**        | ✅ ネイティブ対応                                                                                                                                                                                                                                                                                      | ✅ ネイティブ対応                                                                                                                                                                           |
| **テキスト描画**           | 高忠実度                                                                                                                                                                                                                                                                                           | 高忠実度（`high` ティアで最も強力）                                                                                                                                                               |
| **APIドキュメント**        | [GPT-Image-2.5-All概要](/ja/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2.5-VIP概要](/ja/api-capabilities/gpt-image-2-vip/overview)                                                                                                                                                    | [GPT-Image-2.5 / 2概要](/ja/api-capabilities/gpt-image-2/overview)                                                                                                                    |

<Info>
  🔑 **API tokenの作成または管理**：[https://api.apiyi.com/token](https://api.apiyi.com/token)\
  コンソールでtokenを作成するときは、グループ（`Default` で問題ありません）とtokenタイプ（**リクエスト単位** / **token優先**）を選択してください。**3つの公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）を呼び出すには「token優先」tokenが必要です** — 課金モードの不一致により、リクエスト単位のtokenは拒否されます。
</Info>

## それぞれを選ぶべき場合

### `gpt-image-2-all` / `gpt-image-2.5-all`（リバース）を選ぶべき場合

<CardGroup cols={2}>
  <Card title="💰 予測可能なコスト" icon="dollar-sign">
    サイズ／品質ティアに関係なく、安定した \$0.03/画像です。**厳格なコスト上限があるバッチ制作に最適**です（インフォグラフィック、マーケティング素材、eコマースのサムネイル）。
  </Card>

  <Card title="⚡ より高速な出力" icon="bolt">
    生成は約90秒で、`-vip` と公式バージョンの両方より**わずかに高速**です。**リアルタイムUXにより適しています。**
  </Card>

  <Card title="🔁 1つのコードベースで、いつでも切り替え可能" icon="repeat">
    標準のImages API形式です。3つの`-vip`モデルおよび3つの公式モデルと**同じコード**を使用でき、`model`名を変更するだけで切り替えまたはフォールバックできます。`gpt-image-2-all`と`gpt-image-2.5-all`は価格と動作を共有しており、新しい名称はChatGPT webがImages 2.5へ移行したことを反映しているだけです。
  </Card>

  <Card title="🌏 中国語 + マーケティングテキスト" icon="type">
    中国語のpromptをネイティブサポートし、看板／ポスター／インフォグラフィック向けの優れたテキストレンダリングを提供します。**中国語圏向けコンテンツ制作に最適**です。
  </Card>
</CardGroup>

### 3つの`-vip`モデル（リバース、サイズ固定）を選ぶべき場合

<CardGroup cols={2}>
  <Card title="🎚️ qualityが機能する場合（2.5では全6ティア）" icon="sliders-horizontal">
    テストでは、`gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`は`auto`から`max`までの全6ティアを受け付けます（`xhigh` / `max`は2026-09-10に開放）。`gpt-image-2-vip`は`high`まで対応します。これらはすべてチャネルの動作であり、保証ではありません。ティア対応は、2.5の`high`は`gpt-image-2-vip`の`medium`にのみ相当し、2.5の`max`は`gpt-image-2-vip`の`high`に相当します。固定の\$0.03はティアによって変わりません。
  </Card>

  <Card title="⏱️ 3つから選ぶ" icon="hourglass">
    flare-vipは最も高速で、より柔らかい見た目です。sunburst-vipは品質と編集精度が高く、`gpt-image-2-vip`に近い見た目です。3つすべてが同じ最高tokenティアに到達します（2.5では`max`、`gpt-image-2-vip`では`high`）。いずれも`-all`より低速です。1024²での`max`は80～160秒と計測されているため、より長い待ち時間を許容できる場合に選択してください。
  </Card>

  <Card title="🖼️ 固定サイズ / 4K" icon="expand">
    `size`パラメータは**復活**しました（2026-07-22以降）。30のプリセットサイズ（10比率 × 1K/2K/4K）を利用できます。eコマースのヒーローショット、ポスターテンプレート、4K壁紙を正確な寸法で出力できます。料金は一律\$0.03/画像で、4K追加料金はありません。
  </Card>

  <Card title="🔁 -allとコードを共有" icon="copy">
    `-all`と同じリクエスト構造です（追加されるのは`size`フィールド1つのみ）。速度／品質の好みに応じて`model`名を入れ替えることで、**1つのコードベースですべての5つのリバースモデルを切り替え可能**です。
  </Card>
</CardGroup>

<Note>
  `-vip`の`size`は、`/v1/images/generations`および`/v1/images/edits`エンドポイントでのみ機能します。**`/v1/chat/completions` chatエンドポイントは`size`をサポートしていません**。30のプリセットを超える任意のカスタムサイズ、または精密なマスクインペインティングには、公式モデル（`gpt-image-2.5-flare` / `sunburst`）を使用してください。このパラメータの可用性はアップストリームの変更に従います。最新のステータスは[ライブアップデート](/en/live)を参照してください。
</Note>

### 公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）を選ぶべき場合

<CardGroup cols={2}>
  <Card title="🎚️ 品質ティア" icon="sliders-horizontal">
    全6つの`quality`ティアが利用可能で、**公式に保証**されています。ティアとtoken数は公式仕様に従って安定しています。リバース2.5 -vipモデルも全6ティアを開放しています（2026-09-10計測）が、これは保証のないチャネル動作であり、`gpt-image-2-vip`は依然として`high`までです。
  </Card>

  <Card title="🎯 マスクインペインティング" icon="paintbrush">
    アルファチャネルマスクをサポートします。**残りの部分を保持しながら、領域を正確に変更**できます。リバースモデルは画像全体のみを再生成し、マスクされた領域だけに変更を加えることは保証されません。
  </Card>

  <Card title="🖼️ 任意のカスタムサイズ" icon="expand">
    `size`は、プリセットに限定されず、**任意の有効な解像度**（4Kを含む）を受け付けます。`-vip`の3モデルは30のプリセットのみを保証し、それ以外は書き換えます。**厳密なカスタムサイズには公式モデルを選択してください**。
  </Card>

  <Card title="🔌 OpenAI公式と同一" icon="plug">
    公式Images APIを経由し、フィールドと動作はOpenAI公式と同一です。**既存のOpenAI-SDKベースのコード／システムは変更なしで移行でき**、長期的に安定します。
  </Card>
</CardGroup>

## 主な違いの詳細

### 1. b64\_json形式の注意点（移行時の落とし穴！）

2026年7月時点の検証では、公式モデルとリバースモデルはいずれも **生のbase64（`data:`プレフィックスなし）** を返します。しかし、`gpt-image-2-all`は以前プレフィックスを含んでいたため、最も安全な共通コードではまずその有無を確認します。

```python theme={null}
# Universal pattern: detect the prefix before processing — works for all official and reverse models
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # handles historical prefixed responses
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ write file
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ browser render
```

<Warning>
  公式とリバースを切り替える場合、**`b64_json`の処理コードを変更する必要があります**。変更しないと、破損したデータURLまたはデコード失敗が発生します。
</Warning>

### 2. 解像度の制御

**`gpt-image-2-all` / `gpt-image-2.5-all`**（`size`フィールドなし。構図はpromptに指定します。両方の名前は同じように動作します）：

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**3つの`-vip`モデル**（`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`、`size`は2026-07-22以降に復元）：

**30種類のプリセットサイズ**（10比率 × 1K/2K/4K）を受け付けます。`size: "WIDTHxHEIGHT"`を直接渡してください（30種類のプリセットのいずれかである必要があります。完全な一覧は[30サイズ表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)を参照）。3つすべてがテスト中に`quality`も受け付けます（仕様上の保証ではなくチャネルの挙動です）。2つの2.5モデルは6段階すべてに対応します（`xhigh` / `max`は2026-09-10に開放）。`gpt-image-2-vip`は`high`まで対応します。2.5モデルの`high`出力tokensは`gpt-image-2-vip` `medium`に等しく、その`max`は`high`に等しくなります。

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-vip",   # alias = gpt-image-2.5-sunburst-vip; swap in gpt-image-2.5-flare-vip / gpt-image-2-vip on this line only
    prompt="...",
    size="3840x2160",   # ✅ one of the 30 presets; images endpoints only (not chat)
    quality="max"       # optional; all six tiers on the 2.5 models, gpt-image-2-vip stops at high; flat $0.03 regardless of tier
)
```

**公式モデル**（`size`を厳密に反映 + `quality`段階。サンプルでは`gpt-image-2.5-flare`を使用しており、モデル名のみ変更して`sunburst` / `gpt-image-2`に置き換えられます）：

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="max"       # all six tiers; xhigh / max on the two 2.5 models only; 2.5 high only equals gpt-image-2 medium
)
```

### 3. アップロード／出力形式の違い

| 操作              | 5つのリバースモデル（`-all` / `2.5-all` / `-vip`の3モデル）                                                     | 3つの公式モデル（`2.5-flare` / `2.5-sunburst` / `gpt-image-2`） |
| --------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| **参照画像のアップロード** | multipartの`image`ファイルフィールド（editsエンドポイント）                                                         | multipartの`image[]`ファイルフィールド                           |
| **出力のダウンロード**   | デフォルトは`b64_json`（生のbase64、2026-07検証済み）。明示的な`response_format: "url"`はR2 CDNリンクを返します（**有効期間24時間**） | `b64_json`（**生のbase64**、デコードが必要）                       |
| **複数画像の融合**     | editsエンドポイントで`image`フィールドを繰り返します                                                                 | `image[]`配列、**最大16件**                                  |

### 4. コストの目安

| シナリオ                      | 5つのリバースモデル（`-all` / `2.5-all` / `-vip`の3モデル）                            | 公式`gpt-image-2.5-flare` / `sunburst`         | 公式`gpt-image-2`                        |
| ------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------- |
| 1024×1024 ドラフト（`low`）     | \$0.03                                                                  | 約\$0.006（196 tok）                            | 約\$0.006（196 tok）                      |
| 1024×1024 中品質（`medium`）   | \$0.03                                                                  | 約\$0.013（439 tok）                            | 約\$0.053（1,756 tok）                    |
| 1024×1024 高品質（`high`）     | \$0.03                                                                  | 約\$0.053（1,756 tok）                          | 約\$0.211（7,024 tok）                    |
| 1024×1024 `xhigh` / `max` | \$0.03（2.5 -vipモデルで受け付け。`gpt-image-2-vip`は`high`まで。`-all`は`quality`を拒否） | 約\$0.094（3,122 tok） / 約\$0.211（7,024 tok）    | ❌ 未対応                                  |
| 2048×1152 高品質             | \$0.03                                                                  | tokens計測。`high`は約`gpt-image-2` `medium`になります | 約\$0.20+（tokens計測）                     |
| 3840×2160 4K 高品質          | \$0.03（`-vip`の4K Detail段階、追加料金なし。`-all` / `2.5-all`は4K非対応）              | tokens計測、**1Kより大幅に高額**                       | tokens計測、**1Kより大幅に高額**                 |
| 編集／複数画像の融合                | \$0.03                                                                  | 入力tokensが急増し、1回の呼び出しで\$0.1+に達する場合があります       | 入力tokensが急増し、1回の呼び出しで\$0.1+に達する場合があります |

公式の数値は概算です。2026-09-09に測定した出力tokens × 100万あたり\$30であり、prompt入力tokens（通常は\$0.001未満）は含みません。

<Info>
  **結論**：バッチ処理／低品質ワークロードでは、リバースチャネルが必ずしも安価とは限りません（1K `low`は実際には公式ティアの方が安く、2つの2.5モデルも`medium` / `high`で約\$0.013 / 約\$0.053にすぎません）。リバースチャネルの\$0.03が最適になるのは、**中～高品質帯**（`gpt-image-2`は`medium`以上、2.5モデルは`xhigh`以上）です。**`quality`段階／マスクインペインティング／固定サイズ、4K／厳密なOpenAI APIフィールド互換性**が必要な場合は、公式（tokens計測）を選択してください。
</Info>

## クライアント設定

| 設定              | 5つのリバースモデル（`-all` / `2.5-all` / `-vip`の3モデル）                                   | 3つの公式モデル（`2.5-flare` / `2.5-sunburst` / `gpt-image-2`）                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **タイムアウト（保守的）** | `-all` / `2.5-all`: **300s**（通常は約90s）<br />3つの`-vip`モデル: **300s**（通常は120～200s） | `low` / `medium`の2.5モデル: **240s**、`high` / `xhigh`: **300s**、`max`および`gpt-image-2``high`: フォールバックとして**600s**（4Kの高品質出力では実際に3～5分に達します） — [公式概要](/ja/api-capabilities/gpt-image-2/overview)のティア表を参照してください |
| **リトライ戦略**      | 5xx / タイムアウト時に指数バックオフ、最大2回リトライ                                                 | 同様                                                                                                                                                                                                     |
| **同時実行数**       | 1回の呼び出しにつき画像1枚 — 複数枚の場合は並列リクエストを発行                                             | 1回の呼び出しにつき画像1枚 — 複数枚の場合は並列リクエストを発行                                                                                                                                                                     |
| **リクエストID**     | `request-id`レスポンスヘッダー                                                          | `x-request-id`レスポンスヘッダー                                                                                                                                                                                |

<Tip>
  **8つすべてのモデルに共通: 画像編集 / 複数画像の融合では、各入力画像を1.5MB未満に圧縮してください**（JPEG品質80～90 / 解像度を縮小）。断続的に発生する`shell_api_error` / `Unknown error`レスポンスは、ほとんどの場合、入力サイズが大きすぎることが原因です — 圧縮することで成功率とレイテンシが明確に改善します。**出力解像度は入力サイズに依存しません** — 品質は入力ファイルサイズではなく、出力側（公式モデルでは`size` + `quality`、`-vip`の3モデルでは`size`ティアと`quality`、`-all` / `2.5-all`ではプロンプトの表現）で設定されます。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="入力画像は圧縮すべきですか？ prompt に 4K / 8K と書くと効果がありますか？">
    **はい、強く推奨します。** 8つすべてのモデルで、各入力画像を **1.5MB未満**（JPEG品質80～90 / 解像度を縮小）に圧縮してください。散発的な `shell_api_error` / `Unknown error` レスポンスは、ほとんどの場合、入力サイズが大きすぎることによって発生します。圧縮すると成功率とレイテンシが明確に改善します。

    **圧縮による品質低下は心配不要です** — 出力解像度は入力サイズとは独立しています。「出力側」の制御は3つのファミリーで異なります。

    * `gpt-image-2-all` / `gpt-image-2.5-all`: prompt 内の構図指定フレーズで制御します（検証済みフレーズ表は[-all 概要ページ](/ja/api-capabilities/gpt-image-2-all/overview)を参照） — prompt 内の `4K` / `8K` はカウントされません
    * 3つの `-vip` モデル（`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`）: `size` フィールド（4Kを含む30のプリセットサイズ）で制御し、必要に応じて `quality` を指定します（2.5モデルでは6段階、`gpt-image-2-vip` では最大 `high`） — prompt 内の `4K` / `8K` もカウントされません
    * 公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）: `size` + `quality`（任意の有効なサイズ）で制御します

    結論として、入力を縮小すると高速化するだけです — 品質は入力ファイルサイズではなく、出力側の設定で決まります。
  </Accordion>

  <Accordion title="同じ API Key で8つすべてのモデルを呼び出せますか？">
    はい。8つすべてがデフォルトグループで動作するため、追加設定なしで同じ API Key から呼び出せます。注: 公式モデルの呼び出しには「Token優先」token が必要です。`-all` / `-vip` はどちらのtokenタイプも受け付けます。
  </Accordion>

  <Accordion title="リバースチャネルではどのエンドポイントを使用すべきですか？">
    **OpenAI Images API**（テキストから画像生成には `/v1/images/generations`、編集には `/v1/images/edits`）を使用してください。理由は2つあります。

    1. **より安定している**: Images API チャネルの上流リソース供給はより豊富なため、呼び出し成功率が高くなります
    2. **公式リレーと互換性があり、簡単に切り替え可能**: 呼び出し方法とパラメータ形式は3つの公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）と完全互換です — リバースチャネルがリスク制御の影響を受けた場合、**`model` 名を差し替えるだけで公式リレーに切り替えられます**。コード変更は不要です

    チャットベースのエンドポイント（`/v1/chat/completions`、**現在は非推奨**）もありますが、複数ターンの反復編集、またはオンライン画像 URL を直接渡す場合にのみ有用です。画像の意図が曖昧な場合、画像ではなくプレーンテキストが返されることがあります（「画像を生成:」のような固定プレフィックスを付けて強調してください）。すべてのパラメータについては、[-all チャットベース API リファレンス](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip チャットベース API リファレンス](/en/api-capabilities/gpt-image-2-vip/chat-completions)を参照してください。
  </Accordion>

  <Accordion title="リバースチャネル内で、-all と -vip はどちらを選ぶべきですか？">
    どちらも同一の固定価格（\$0.03/画像）のリバースエンジニアリングチャネルであり、呼び出し形式も同じです（`-vip` の3モデルは、さらに `size` の固定と `quality` をサポートし、2.5モデルでは6段階すべてに対応します）。違いは **速度 vs 品質 + サイズ固定** です。

    * **生成時間**: `-all` / `2.5-all` は約90秒 — **速度が利点**です。`-vip` の3モデルは約120～200秒です。現在は OpenAI 上流の計算リソース変動により、提供開始時より遅くなっています
    * **品質**: `-vip`（Adobe系統）のディテール描写は**場合によってはより高い**です — 急ぎではないショーケース画像向けです。3モデル内では、sunburst-vip は `gpt-image-2-vip` に近い見た目で、flare-vip はよりソフトです
    * **サイズ固定**: `-vip` の3モデルは4Kを含む30のプリセット `size` 値をサポートします。`-all` / `2.5-all` は `size` を受け付けません — 構図は prompt に指定します

    判断基準: 高速な出力が必要 → `-all` / `2.5-all`、サイズ固定 / 4Kが必要 → `-vip` の3モデル、30のプリセットを超えるカスタムサイズまたは精密なマスクが必要 → 公式モデル。詳細は [GPT-Image-2.5-VIP 概要](/ja/api-capabilities/gpt-image-2-vip/overview)を参照してください。
  </Accordion>

  <Accordion title="-vip 内で、2つの2.5モデルと gpt-image-2-vip はどちらを選ぶべきですか？">
    価格、グループ、呼び出し形式は同じです（2026-09-09に同一チャネルおよびtokenで実施した253リクエストの3群比較では、契約内容はセル単位で完全に同一でした）。異なるのは次の3点のみです。

    * **ティア**: 2.5モデルは6段階すべてに対応します（`xhigh` / `max` は2026-09-10に追加）。`gpt-image-2-vip` は `high` までです。同名ティアは同等ではありません — 2048×1152では、2.5の `high` 1,413 = `gpt-image-2-vip` `medium`、2.5の `max` 5,650 = `gpt-image-2-vip` `high` です。3モデルとも同じ最上位tokenティアに到達します
    * **品質と速度**: flare-vip は最速で、見た目はよりソフトかつ装飾的なディテールが少なめです。sunburst-vip は `gpt-image-2-vip` に近い見た目です
    * **デフォルトサイズ**: flare-vip は固定で1024×1536、他の2つは2048×2048です。固定するには必ず `size` を渡してください

    エイリアス `gpt-image-2.5-vip` は sunburst-vip です。行ごとの完全な比較表は、[GPT-Image-2.5-VIP 概要、「3つの -vip モデルの比較」セクション](/ja/api-capabilities/gpt-image-2-vip/overview)にあります。
  </Accordion>

  <Accordion title="サイズ固定 / 4K が必要です。どうすればよいですか？">
    まずは `-vip` の3モデルを使用してください（デフォルトでは `gpt-image-2.5-vip`、最上位tokenティアには `high` を指定して `gpt-image-2-vip` を選択します）。`size` パラメータは2026-07-22に復元され、\*\*30のプリセットサイズ（10の比率 × 1K/2K/4K）\*\*をサポートします。価格は \$0.03/画像の固定で、4K追加料金はありません。`size` は images エンドポイントでのみ機能し、30のプリセットのいずれかでなければならない点に注意してください。

    **30のプリセットを超える任意の有効なサイズ**、**公式に保証された `quality` ティア**（`-vip` ティアは保証のないチャネル動作です）、**精密なマスクインペインティング**（アルファチャネルマスク）、または **厳密な OpenAI-API フィールド互換性**（既存の OpenAI-SDK コードを変更せず移行）が必要な場合は、公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`、token従量制）を使用してください。
  </Accordion>

  <Accordion title="1.5 から移行する場合、どれを選ぶべきですか？">
    * **OpenAI SDK を使い続ける / OpenAI 公式との一致が必須、または30のプリセットを超えるカスタムサイズが必要**: 公式モデルを選択してください（テキストから画像生成は `gpt-image-2.5-flare`、編集は `gpt-image-2.5-sunburst`）。`input_fidelity` を削除し、それ以外は変更不要です（`background: transparent` は引き続き動作します）。
    * **コストを削減し、高速な出力が必要**: `gpt-image-2.5-all` を選択してください（リバース、約90秒。`gpt-image-2-all` と同じ価格・動作）。
    * **コストを削減し、品質優先またはサイズ固定 / 4K が必要**: `gpt-image-2.5-vip` を選択してください（リバース、約120～200秒、4Kを含む30のプリセットサイズ、6段階すべての `quality` ティア。`gpt-image-2-vip` は `high` まで）。
  </Accordion>

  <Accordion title="フェイルオーバーのために複数モデルをデプロイできますか？">
    はい。一般的な構成は次のとおりです。**プライマリは `2.5-all` または `2.5-vip`**（コストが予測可能 — 速度 / 品質の優先度で選択）、**フォールバックは公式の `gpt-image-2.5-flare` / `sunburst`**（`quality` ティア、マスク、または30のプリセットを超えるカスタムサイズが必要になった場合に切り替え）。リバースと公式のレスポンス形式は異なるため、ビジネスレイヤーで正規化してください。
  </Accordion>

  <Accordion title="R2 CDN の画像リンクが遅い場合、どうすればよいですか？">
    [CDN ダウンロードが遅い場合の対処方法](/ja/faq/cdn-download-slow)を参照してください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [GPT-Image-2.5 / 2 概要](/ja/api-capabilities/gpt-image-2/overview) - 3つの公式モデルに対応した完全な統合ドキュメント
* [GPT-Image-2.5-All 概要](/ja/api-capabilities/gpt-image-2-all/overview) - リバース ChatGPT-web ライン（最速出力；`gpt-image-2.5-all` / `gpt-image-2-all`）の完全な統合ドキュメント
* [GPT-Image-2.5-VIP 概要](/ja/api-capabilities/gpt-image-2-vip/overview) - リバース Adobe ライン（`gpt-image-2.5-vip`シリーズに`gpt-image-2-vip`を追加；`size`ロック、`quality`階層）の完全な統合ドキュメント
* [詳細解説：GPT-image-2.5 リリース](/en/news/gpt-image-2-5-launch) - 2.5デュアルモデルのリリース
* [詳細解説：gpt-image-2 リリース](/en/news/gpt-image-2-launch) - 公式バージョンのリリース
* [詳細解説：gpt-image-2-all リリース](/en/news/gpt-image-2-all-launch) - リバースエンジニアリング版のリリース
* [コミュニティ：Luck GPT-Image 2 ComfyUI ノード](/ja/scenarios/ecosystem/luckgpt2-comfyui) - マルチモデル ComfyUI ノードパック
* [コミュニティ：APIYI GPT-Image 2 スキル](/ja/scenarios/ecosystem/apiyi-gpt-image-skills) - マルチモデル AI Agent スキルパック
* [チャージプロモーション](/ja/faq/recharge-promotions) - チャージボーナスポリシー
