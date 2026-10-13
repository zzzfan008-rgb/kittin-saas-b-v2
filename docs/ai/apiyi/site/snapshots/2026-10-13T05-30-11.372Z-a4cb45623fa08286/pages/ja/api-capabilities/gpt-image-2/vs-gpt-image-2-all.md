> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2.5 / 2 公式版とリバース版

> 公式の gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 と、リバースエンジニアリングされた姉妹モデル gpt-image-2.5-all、gpt-image-2-all、gpt-image-2.5-vip、gpt-image-2-vip を比較します。チャンネルの性質、料金、エンドポイント、アップロード／出力形式、速度と品質の位置付け、プロンプトへの準拠を確認して、適切なモデルを選択できます。

## 要約

| 必要な要件 | 選択肢 |
| - | - |
| **`quality` ノブ / マスクインペインティング / 任意のカスタムサイズ（30種類のプリセット以外） / 厳密な OpenAI API フィールドの互換性** | 公式・token 従量課金：`gpt-image-2.5-flare`（速度優先） / `gpt-image-2.5-sunburst`（編集精度優先） / `gpt-image-2`（前世代） |
| **予測可能な一律 \$0.025/画像 + 高速で安定した出力（速度が強み）** | `gpt-image-2-all` / `gpt-image-2.5-all`（リバース、ChatGPT-web 系統、約90秒、2.5-all は Images 2.5 をベースに提供） |
| **予測可能な一律 \$0.03/画像 + 固定サイズ（4K を含む30種類のプリセット）** | `gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`（リバース、Adobe 系統。2つの 2.5 モデルは全6段階の `quality` に対応、`gpt-image-2-vip` は最大 `high` まで） |

8つのモデルはすべて、**内部的に OpenAI の GPT-Image 2.5 / 2 シリーズをベースに構築されています**。違いはチャネルの性質（公式直接かリバースエンジニアリングか）、料金モデル、およびパラメータの粒度にあります。3つの公式モデルは価格とパラメータが共通です。5つのリバースモデルは呼び出し形式が共通です（2つの `-all` モデルは \$0.025/画像、`-vip` の3モデルは \$0.03/画像）。

<Note>
  **3系統のリバースモデル（-all / 2.5-all / -vip の3種）**：本ページの「リバース」列は、**`gpt-image-2-all`**、**`gpt-image-2.5-all`**、および **`gpt-image-2-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`**（エイリアス `gpt-image-2.5-vip` = sunburst-vip）を対象としています。すべて同じ呼び出し形式を共有し（3つの `-vip` モデルはさらに `size` もサポート）、呼び出しごとに課金されます。2つの `-all` モデルは \$0.025/画像、`-vip` の3モデルは \$0.03/画像です：

  * `gpt-image-2-all` / `gpt-image-2.5-all`：ChatGPT web 系統、**約90秒**の生成 — **速度が強みです**。2.5-all は Images 2.5 をベースに提供されています
  * `gpt-image-2-vip` および2つの 2.5 -vip モデル：Adobe 系統（Firefly）、**`size` の固定（4K を含む30種類のプリセット）**。3モデルすべてが `quality` を受け付けます（チャネル側の動作であり、保証事項ではありません）。2つの 2.5 モデルは2026-09-10の再テストで `xhigh` / `max` が開放され、現在は全6段階に対応しています。`gpt-image-2-vip` は最大 `high` まで対応します。3モデルすべてが透明な背景を返します。flare-vip は最も高速で柔らかい仕上がり、sunburst-vip は見た目が `gpt-image-2-vip` に近くなります
  * 共通事項：いずれも `n` をサポートしていません。`mask` はすべてのモデルで画像全体の再生成となり、マスクされた領域のみを変更する保証はありません

  高精度なマスクインペインティング、30種類のプリセット以外の任意のカスタムサイズ、または `n` > 1 が必要な場合は、公式モデル（`gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2`）をご利用ください。
</Note>

<Tip>
  **現在の速度について**：**OpenAI アップストリームの計算リソースの変動**により、`-all` / `-vip` の生成速度が**ローンチ時よりも低下しています** — これは APIYI だけでなく、すべてのリバースチャネル利用者に影響します。当サービスのアカウントプールと運用状態は健全です。クライアント側のタイムアウトは 300秒以上に設定し、複雑な prompt に対しては十分な余裕を確保してください。
</Tip>

## 完全比較表

| 項目 | **gpt-image-2-all / 2.5-all / -vip**（リバース、高コスパ） | **gpt-image-2.5-flare / sunburst / gpt-image-2**（公式） |
| - | - | - |
| **モデル名** | `gpt-image-2-all`（最速）/ `gpt-image-2.5-all`（同系統の2.5バージョン）/ `gpt-image-2-vip`（品質優先、サイズ固定）/ `gpt-image-2.5-flare-vip` · `gpt-image-2.5-sunburst-vip`（同系統の2.5バージョン、別名 `gpt-image-2.5-vip`） | `gpt-image-2.5-flare`（速度優先）/ `gpt-image-2.5-sunburst`（編集精度優先）/ `gpt-image-2`（前世代） |
| **チャネルの性質** | `-all` / `2.5-all`：ChatGPT Web版のリバース系統<br />3つの `-vip` モデル：Adobe系統のリバース（Firefly。アップスケーリングではなく、高品質な GPT-Image 2.5 リバース系統） | 公式直接（OpenAI Images API）。3モデルとも同一料金・パラメータ |
| **価格体系** | **呼び出し単位**：2つの `-all` モデルは一律 \$0.025/回、`-vip` の3モデルは \$0.03/回 | **token従量課金**：公式準拠。APIYIのチャージボーナス適用後で定価の約**85%** |
| **画像あたりの代表的なコスト** | サイズ・品質に関わらず \$0.025（`-all`）/ \$0.03（`-vip`） | 実測 **\$0.03 – \$0.2**（prompt長、サイズ、品質に連動） |
| **tokenグループ** | デフォルト | デフォルト |
| **token種別** | **Per-call**（呼び出し回数課金）または **Token-priority**（token優先）の双方が利用可能 | **Token-priority（token優先）のみ**（本モデルはtoken課金のため、Per-call tokenは拒絶されます） |
| **推奨エンドポイント** | **`/v1/images/generations` + `/v1/images/edits`**（より安定しており、アップストリームの供給力が高く、公式と同じコードで利用可能 — 風向きの厳しいリスク制御時も `model` 名を変更するだけで切り替え可能） | `/v1/images/generations` + `/v1/images/edits` |
| **アップロード形式** | multipart file（edits エンドポイント） | multipart file（edit エンドポイント） |
| **出力形式** | `b64_json`（デフォルト、**プレフィックスなしの生 base64**、2026-07検証済み。旧バージョンにはプレフィックスが含まれていました）または `url`（R2 CDN） | `b64_json`（**プレフィックスなしの生 base64**） |
| **参照画像数** | 複数 | **最大16枚**（`image[]`） |
| **マスクインペインティング** | `-all` / `2.5-all`：❌ 非対応<br />3つの `-vip` モデル：⚠️ 受理されるものの画像全体の再生成となります — 実写真での3回のテストでは内外の変化比率が約1と測定されました（2026-09-09）。マスク領域のみが変更される保証はありません | ✅ 対応（アルファチャンネル必須） |
| **prompt追従性** | 良好 | **極めて優れている** |
| **生成速度** | `-all`：約**90秒**（速度が強み）<br />`gpt-image-2-vip`：約**90〜150秒**<br />2つの 2.5 -vip モデル：1024²の連続実行で flare は22〜138秒、sunburst は37〜120秒を測定、ばらつき大。500 RPM以内であれば同時実行数の計画は不要、散発的な429はバックオフして再試行するか[リアルタイム更新](/en/live)をご確認ください<br />📌 リリース当初より低速化しています — APIYI側の問題ではなく、OpenAIアップストリームの計算リソースに起因します | `gpt-image-2.5-flare`：公式最速、1K `low` の実測は約10秒（2026-09-09）<br />`gpt-image-2.5-sunburst`：1K `low` の実測は約14秒、高品質時はさらに低速<br />`gpt-image-2`：約**100〜120秒**、複雑＋4Kでは3〜5分に達する場合があります |
| **品質傾向** | `-all` / `2.5-all`：良好（同一系統。2つの名称で生成される画像は同一）<br />`-vip`：同一サイズの6つの prompt による目視評価では、sunburst-vip は `gpt-image-2-vip` に近く、flare-vip は装飾ディテールが少なめで柔らかい描写。3モデルとも中国語見出しの筆画は正確 | 安定。2つの 2.5 モデルは双方とも gpt-image-2 を上回り、sunburst が最高品質。`quality=xhigh` / `max` で性能を最大限に引き出せます |
| **`size` パラメータ** | `-all` / `2.5-all`：❌ 非対応（prompt内で指定）<br />3つの `-vip` モデル：✅ **復旧済み**（2026-07-22以降）、プリセット30サイズ（4Kを含む）。images エンドポイントのみ対応、chat エンドポイントでは非対応。`size` を省略した場合、`gpt-image-2-vip` / sunburst-vip は 2048×2048、flare-vip は固定で 1024×1536 を返します（アップストリームでデフォルトが変更された経緯あり）— 固定するにはプリセット値を渡してください | ✅ 任意の有効なカスタムサイズ |
| **4K対応** | `-all` / `2.5-all`：❌<br />3つの `-vip` モデル：✅ 4K Detail ティア（例：`3840x2160` / `2880x2880`）、追加料金なし | ✅ `3840×2160` を含む |
| **一般的な出力サイズ** | `-all`：16:9 → 1672×941、9:16 → 941×1672、1:1 → 1254×1254（自動調整）<br />3つの `-vip` モデル：30種類のプリセット（10種類のアスペクト比 × 1K/2K/4K）、詳細は[全30サイズ一覧表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)を参照。プリセット外のサイズもエラーにはならず、16の倍数へのアライメントまたは最小辺への引き上げが行われます | 8種類のプリセット ＋ 任意の有効なカスタムサイズ |
| **`quality` パラメータ** | `-all` / `2.5-all`：❌ 拒絶（指定不可）<br />3つの `-vip` モデル：✅ 実測値・チャネルの挙動であり保証値ではありません — 2つの 2.5 モデルは全6段階のティア `auto` / `low` / `medium` / `high` / `xhigh` / `max`（`xhigh` / `max` は2026-09-10に開放）を受け付け、`gpt-image-2-vip` は `high` まで対応 | ✅ `low` / `medium` / `high` / `xhigh` / `max` / `auto`（`xhigh` / `max` は2つの 2.5 モデルのみ） |
| **`quality` ティア対応表** | 2048×1152 での出力 tokens：`gpt-image-2-vip` low 157 / medium 1,413 / high 5,650。2つの 2.5 -vip モデル low 157 / medium 367 / high 1,413 / xhigh 2,511 / max 5,650 — **2.5 `high` = `gpt-image-2-vip` `medium`、2.5 `max` = `gpt-image-2-vip` `high`**（公式の 2.5 と gpt-image-2 の関係と同様）。呼び出し単位の課金のため、ティアによる価格の変動はありません | 1024² での出力 tokens：公式 2.5 low 196 / medium 439 / high 1,756 / xhigh 3,122 / max 7,024。`gpt-image-2` low 196 / medium 1,756 / high 7,024 — 公式 2.5 `high` = `gpt-image-2` `medium`。token従量課金 |
| **`n` パラメータ** | ❌ 5つのリバースモデルはいずれも非対応（1回の呼び出しにつき1枚） | ✅ 対応 |
| **背景透過** | `-all` / `2.5-all`：⚠️ `background` パラメータなし、promptのみでの指定となり、時折不安定<br />3つの `-vip` モデル：✅ テストにおいて `background: "transparent"` でアルファPNGが返却されることを確認（保証値ではありません） | ✅ パラメータ制御可能で高信頼性 — `background: "transparent"` にて `png` / `webp` を指定 |
| **中国語 prompt** | ✅ ネイティブ対応 | ✅ ネイティブ対応 |
| **テキスト描画** | 高精度 | 高精度（`high` ティアで最高性能） |
| **API ドキュメント** | [GPT-Image-2.5-All 概要](/ja/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2.5-VIP 概要](/ja/api-capabilities/gpt-image-2-vip/overview) | [GPT-Image-2.5 / 2 概要](/ja/api-capabilities/gpt-image-2/overview) |

<Info>
  🔑 **API tokenの作成・管理**：[https://api.apiyi.com/token](https://api.apiyi.com/token)\
  コンソールで token を作成する際は、グループ（`Default` で構いません）と token 種別（**Per-call** / **Token-priority**）を選択してください。**3つの公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）を呼び出すには「Token-priority」tokenが必要です** — 課金方式の不一致により、Per-call token は拒絶されます。
</Info>

## 各モデルの選び方

### `gpt-image-2-all` / `gpt-image-2.5-all`（リバース）を選ぶべきケース

<CardGroup cols={2}>
  <Card title="💰 予測可能なコスト" icon="dollar-sign">
    サイズや品質ティアに関わらず安定した\$0.025/画像（2026-10-10に\$0.03から値下げ）で、チャージボーナス適用後はさらに低価格になります。**明確なコスト上限があるバッチ生成に最適です**（インフォグラフィック、マーケティング素材、ECサムネイルなど）。
  </Card>

  <Card title="⚡ より高速な出力" icon="bolt">
    約90秒での生成 — `-vip`および公式バージョンの両方よりも**わずかに高速**です。**リアルタイムのUXが向上します。**
  </Card>

  <Card title="🔁 共通コードベースでいつでも切り替え可能" icon="repeat">
    標準のImages API形式 — 3つの`-vip`モデルおよび3つの公式モデルと**同一のコード**で使用でき、`model`名を変更するだけで切り替えやフォールバックが可能です。`gpt-image-2-all`と`gpt-image-2.5-all`は価格と動作が共通しており、新しい名称はChatGPT WebがImages 2.5に移行したことを反映しているにすぎません。
  </Card>

  <Card title="🌏 中国語＋マーケティングテキスト" icon="type">
    ネイティブの中国語promptに対応し、看板・ポスター・インフォグラフィックなどのテキスト描画に優れています — **中国語圏向けのコンテンツ制作に最適です**。
  </Card>
</CardGroup>

### 3つの`-vip`モデル（リバース、サイズ固定）を選ぶべきケース

<CardGroup cols={2}>
  <Card title="🎚️ qualityが有効（2.5では全6ティア）" icon="sliders-horizontal">
    テストにおいて`gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`は`auto`から`max`までの全6ティアを受け付けます（`xhigh` / `max`は2026-09-10に解放）。`gpt-image-2-vip`は最大`high`まで対応します。これらはすべてチャネル側の動作であり、保証されたものではありません。ティアの対応関係：2.5の`high`は`gpt-image-2-vip`の`medium`にのみ相当し、2.5の`max`は`gpt-image-2-vip`の`high`に相当します。一律\$0.03の価格はティアによって変わりません。
  </Card>

  <Card title="⏱️ 3モデル間の選択基準" icon="hourglass">
    flare-vipは最も高速で柔らかな画風、sunburst-vipはより高品質で編集精度が高く`gpt-image-2-vip`に近い仕上がりになります。3モデルとも同じ最上位のtokenティアに達します（2.5では`max`、`high`では`gpt-image-2-vip`）。いずれも`-all`より低速であり（1024²での`max`の実測値は80〜160秒）、待ち時間が許容できる場合に適しています。
  </Card>

  <Card title="🖼️ 固定サイズ / 4K" icon="expand">
    `size`パラメータが**復活**しました（2026-07-22以降）：30種類のプリセットサイズ（10種類のアスペクト比 × 1K/2K/4K）。ECのヒーロー画像、ポスターテンプレート、4K壁紙を正確な寸法で出力可能 — 4K追加料金なしの一律\$0.03/画像です。
  </Card>

  <Card title="🔁 -allとコードを共有" icon="copy">
    `-all`と同一のリクエスト構造（追加の`size`フィールドが1つあるのみ）— 速度と品質の好みに応じて`model`名を切り替えるだけで、**1つのコードベースで5つのリバースモデルすべてに対応**できます。
  </Card>
</CardGroup>

<Note>
  `-vip`の`size`は`/v1/images/generations`および`/v1/images/edits`エンドポイントでのみ機能します — **`/v1/chat/completions` chatエンドポイントは`size`をサポートしていません**。30種類のプリセット以外の任意のカスタムサイズや、精密なマスクインペインティングが必要な場合は、公式モデル（`gpt-image-2.5-flare` / `sunburst`）をご利用ください。このパラメータの利用可否はアップストリームの変更に準じます — 最新の状況については[リアルタイム更新](/en/live)をご確認ください。
</Note>

### 公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）を選ぶべきケース

<CardGroup cols={2}>
  <Card title="🎚️ 品質ティア" icon="sliders-horizontal">
    全6つの`quality`ティアが利用可能**かつ公式に保証**されており、公式スペックに準じた安定したティアとtoken数を提供します。リバースの2.5 -vipモデルでも全6ティアが解放されていますが（2026-09-10実測）、これは保証のないチャネル動作であり、`gpt-image-2-vip`は依然として`high`までに留まります。
  </Card>

  <Card title="🎯 マスクインペインティング" icon="paintbrush">
    アルファチャネルマスクをサポート — **他の部分を保持したまま特定の領域のみを精密に修正**できます。リバースモデルは画像全体を再生成する仕様のため、マスク領域のみの編集は保証されません。
  </Card>

  <Card title="🖼️ 任意のカスタムサイズ" icon="expand">
    `size`はプリセットに限定されず、**あらゆる有効な解像度**（4Kを含む）を受け付けます。`-vip`の3モデルは30種類のプリセットのみを保証し、それ以外は書き換えられます — **厳密なカスタムサイズが必要な場合は公式モデルをご利用ください**。
  </Card>

  <Card title="🔌 OpenAI公式と完全同一" icon="plug">
    公式Images APIを経由 — フィールドと動作はOpenAI公式と同一です。**既存のOpenAI SDKベースのコードやシステムを変更ゼロで移行**でき、長期的に安定して運用できます。
  </Card>
</CardGroup>

## 主な相違点の詳細

### 1. b64\_jsonフォーマットの落とし穴（移行時のトラップ！）

2026年7月の検証時点で、公式モデルおよびリバースモデルはすべて\*\*未加工のbase64（`data:`接頭辞なし）\*\*を返します。ただし、以前の`gpt-image-2-all`には接頭辞が含まれていたため、最も安全な共通コードはまずそれをチェックすることです：

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
  公式とリバースを切り替える際は、**`b64_json`の処理コードを変更する必要があります**。そうしないと、破損したデータURLが生成されたり、デコードエラーが発生したりします。
</Warning>

### 2. 解像度制御

**`gpt-image-2-all` / `gpt-image-2.5-all`**（`size`フィールドはありません — 構図はpromptに記述します。両モデルとも同じ挙動を示します）：

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**3つの`-vip`モデル**（`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`。`size`は2026-07-22以降復元済み）：

**30種類のプリセットサイズ**（10種類のアスペクト比 × 1K/2K/4K）を受け付けます — `size: "WIDTHxHEIGHT"`を直接渡します（30種類のプリセットのいずれかである必要があります。全リストは[30種類のサイズ一覧表](/ja/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)を参照してください）。3モデルともテストにおいて`quality`も受け付けます（チャンネルの挙動であり、仕様を確約するものではありません）：2つの2.5モデルは6つのティアすべてに対応し（`xhigh` / `max`は2026-09-10に解放）、`gpt-image-2-vip`は最大`high`まで対応します。2.5モデルの`high`出力tokensは`gpt-image-2-vip` `medium`にのみ相当し、それらの`max`はその`high`に相当します：

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-vip",   # alias = gpt-image-2.5-sunburst-vip; swap in gpt-image-2.5-flare-vip / gpt-image-2-vip on this line only
    prompt="...",
    size="3840x2160",   # ✅ one of the 30 presets; images endpoints only (not chat)
    quality="max"       # optional; all six tiers on the 2.5 models, gpt-image-2-vip stops at high; flat $0.03 regardless of tier
)
```

**公式モデル**（`size`を厳密に順守 + `quality`ティア。サンプルでは`gpt-image-2.5-flare`を使用していますが、モデル名を変更するだけで`sunburst` / `gpt-image-2`に切り替え可能）：

```python theme={null}
client.images.generate(
    model="gpt-image-2.5-flare",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="max"       # all six tiers; xhigh / max on the two 2.5 models only; 2.5 high only equals gpt-image-2 medium
)
```

### 3. アップロード／出力フォーマットの相違点

| 操作 | リバース5モデル（`-all` / `2.5-all` / `-vip`の3モデル） | 公式3モデル（`2.5-flare` / `2.5-sunburst` / `gpt-image-2`） |
| - | - | - |
| **参照画像のアップロード** | multipart `image`ファイルフィールド（editsエンドポイント） | multipart `image[]`ファイルフィールド |
| **出力のダウンロード** | デフォルトは`b64_json`（未加工のbase64、2026-07検証済み）。明示的に`response_format: "url"`を指定するとR2 CDNリンクを返却（**有効期間24時間**） | `b64_json`（**未加工のbase64**、デコードが必要） |
| **複数画像の合成** | editsエンドポイントで`image`フィールドを繰り返す | `image[]`配列、**最大16枚** |

### 4. コストの目安

| シナリオ | リバース5モデル（`-all` / `2.5-all` \$0.025、`-vip`の3モデル \$0.03） | 公式 `gpt-image-2.5-flare` / `sunburst` | 公式 `gpt-image-2` |
| - | - | - | - |
| 1024×1024 下書き（`low`） | \$0.025 / \$0.03 | 約\$0.006 (196 tok) | 約\$0.006 (196 tok) |
| 1024×1024 中品質（`medium`） | \$0.025 / \$0.03 | 約\$0.013 (439 tok) | 約\$0.053 (1,756 tok) |
| 1024×1024 高品質（`high`） | \$0.025 / \$0.03 | 約\$0.053 (1,756 tok) | 約\$0.211 (7,024 tok) |
| 1024×1024 `xhigh` / `max` | \$0.03（2.5 -vipモデルで受付可。`gpt-image-2-vip`は`high`まで。`-all`は`quality`を拒否） | 約\$0.094 (3,122 tok) / 約\$0.211 (7,024 tok) | ❌ 非対応 |
| 2048×1152 高品質 | \$0.03（`-vip`。`-all`は1K〜1.5Kのみ出力） | token従量課金。`high`は約`gpt-image-2` `medium` | 約\$0.20以上（token従量課金） |
| 3840×2160 4K 高品質 | \$0.03（`-vip` 4K Detailティア、追加料金なし。`-all` / `2.5-all`は4K非対応） | token従量課金、**1Kより大幅に高額** | token従量課金、**1Kより大幅に高額** |
| 編集／複数画像の合成 | \$0.025 / \$0.03 | 入力tokensが急増し、1回の呼び出しで\$0.1以上に達する可能性あり | 入力tokensが急増し、1回の呼び出しで\$0.1以上に達する可能性あり |

公式の数値は概算です：2026-09-09に測定した出力tokens × 100万あたり\$30（通常\$0.001未満のprompt入力tokensを除く）。

<Note>モデルの価格は公式に準拠しており、プロバイダーの調整に応じて変更される可能性があります。上記の表は参考情報です。トップナビゲーションの**モデル価格**タブが正式な情報源となります：[モデル価格](/en/models/index)。</Note>

<Info>
  **要点**：バッチ処理や低品質のワークロードでは、リバースチャンネルが必ずしも安価とは限りません（1K `low`は公式ティアの方が実際に安く、2つの2.5モデルでも`medium` / `high`でわずか約\$0.013 / 約\$0.053です）。**中〜高品質レンジ**（`gpt-image-2`の`medium`以上、2.5モデルの`xhigh`以上）では、リバースチャンネルの\$0.025〜\$0.03が最も有利な選択肢となります。**`quality`ティア／マスクインペインティング／固定サイズ、4K／厳密なOpenAI-APIフィールドの互換性**が必要な場合は、公式（token従量課金）を選択してください。
</Info>

## クライアント設定

| 設定 | 5つのリバースモデル（`-all` / `2.5-all` / `-vip`の3モデル） | 3つの公式モデル（`2.5-flare` / `2.5-sunburst` / `gpt-image-2`） |
| - | - | - |
| **タイムアウト（保守的）** | `-all` / `2.5-all`: **300s**（通常は約90s）<br />3つの`-vip`モデル: **300s**（通常は120～200s） | `low` / `medium`の2.5モデル: **240s**、`high` / `xhigh`: **300s**、`max`および`gpt-image-2``high`: フォールバックとして**600s**（4Kの高品質出力では実際に3～5分に達します） — [公式概要](/ja/api-capabilities/gpt-image-2/overview)のティア表を参照してください |
| **リトライ戦略** | 5xx / タイムアウト時に指数バックオフ、最大2回リトライ | 同様 |
| **同時実行数** | 1回の呼び出しにつき画像1枚 — 複数枚の場合は並列リクエストを発行 | 1回の呼び出しにつき画像1枚 — 複数枚の場合は並列リクエストを発行 |
| **リクエストID** | `request-id`レスポンスヘッダー | `x-request-id`レスポンスヘッダー |

<Tip>
  **8つすべてのモデルに共通: 画像編集 / 複数画像の融合では、各入力画像を1.5MB未満に圧縮してください**（JPEG品質80～90 / 解像度を縮小）。断続的に発生する`shell_api_error` / `Unknown error`レスポンスは、ほとんどの場合、入力サイズが大きすぎることが原因です — 圧縮することで成功率とレイテンシが明確に改善します。**出力解像度は入力サイズに依存しません** — 品質は入力ファイルサイズではなく、出力側（公式モデルでは`size` + `quality`、`-vip`の3モデルでは`size`ティアと`quality`、`-all` / `2.5-all`ではプロンプトの表現）で設定されます。
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="入力画像を圧縮すべきですか？promptに4K / 8Kと記述すると効果はありますか？">
    **はい、強く推奨します。** 8つのモデルすべてにおいて、各入力画像を**1.5MB未満**（JPEG品質80〜90 / 解像度を縮小）に圧縮してください。散発的な`shell_api_error` / `Unknown error`レスポンスは過大な入力によって引き起こされることが最も多く、圧縮することで成功率とレイテンシを目に見えて改善できます。

    **圧縮によって品質が低下することを心配する必要はありません** — 出力解像度は入力サイズとは無関係です。「出力側」の制御は、3つの系統で異なります：

    * `gpt-image-2-all` / `gpt-image-2.5-all`：promptの構図表現によって制御されます（[-all 概要ページ](/ja/api-capabilities/gpt-image-2-all/overview)の検証済みフレーズ表を参照）— prompt内の`4K` / `8K`は効果がありません
    * 3つの`-vip`モデル（`gpt-image-2.5-vip` / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`）：`size`フィールド（4Kを含む30種類のプリセットサイズ）によって制御され、オプションで`quality`（2.5モデルでは6つの階層、`gpt-image-2-vip`では最大`high`）を指定できます — こちらもprompt内の`4K` / `8K`は効果がありません
    * 公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）：`size` + `quality`（任意の有効なサイズ）によって制御されます

    結論として、入力を小さくすることは高速化につながるだけであり、品質は入力ファイルサイズではなく出力側の設定によって決定されます。
  </Accordion>

  <Accordion title="同じAPI Keyで8つのモデルすべてを呼び出せますか？">
    はい。8つのモデルはすべてDefaultグループで動作するため、同じAPI Keyで追加設定なしに呼び出すことができます。注意：公式モデルの呼び出しには「Token優先」tokenが必要です。`-all` / `-vip`はいずれのtokenタイプも受け入れます。
  </Accordion>

  <Accordion title="リバースチャンネルではどのエンドポイントを使用すべきですか？">
    次の2つの理由から、**OpenAI Images API**（テキストから画像への生成には`/v1/images/generations` + 編集には`/v1/images/edits`）**を使用してください**：

    1. **より安定的**：Images APIチャンネルの上流リソース供給の方が豊富なため、呼び出し成功率が高くなります
    2. **公式リレーと互換性があり簡単に切り替え可能**：呼び出し方法とパラメータ形式は3つの公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`）と完全な互換性があります — リバースチャンネルでリスクコントロールによる乱れが発生した場合でも、コードを変更することなく\*\*`model`名を変更するだけで公式リレーに切り替えることができます\*\*

    また、チャットベースのエンドポイント（`/v1/chat/completions`、**現在は非推奨**）もありますが、これはマルチターンの反復編集やオンライン画像URLを直接渡す場合にのみ有用です。画像生成の意図が曖昧な場合、画像の代わりにプレーンテキストが返されることがある点にご注意ください（固定のプレフィックス「Generate an image:」などを先頭に追加して補強してください）。パラメータの詳細については、[-all チャットベースAPIリファレンス](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip チャットベースAPIリファレンス](/en/api-capabilities/gpt-image-2-vip/chat-completions)を参照してください。
  </Accordion>

  <Accordion title="リバースチャンネル内では、-all と -vip のどちらを選ぶべきですか？">
    どちらの系統もリバースエンジニアリングされたチャンネル（-allは\$0.025/画像、-vipは\$0.03/画像）であり、呼び出し形式は同一です（`-vip`の3モデルは追加で`size`の固定と`quality`に対応しており、2.5モデルでは全6段階をサポート）。違いは**速度 vs 品質 + サイズ固定**です：

    * **生成時間**：`-all` / `2.5-all`は約90秒 — **速度が強みです**。`-vip`の3モデルは約120〜200秒です。現在はOpenAIの上流コンピュートの変動により、リリース時よりも遅くなっています
    * **品質**：`-vip`（Adobe系統）のディテール描画は**より高い場合があります** — お急ぎでなく、ポートフォリオ用の画像などに適しています。3モデルの中では、sunburst-vipは`gpt-image-2-vip`に近く、flare-vipはよりソフトな描写になります
    * **サイズの固定**：`-vip`の3モデルは30種類のプリセット`size`値（4Kを含む）をサポートしています。`-all` / `2.5-all`は`size`を受け付けず、構図はpromptに記述します

    判断基準：高速な出力を求める場合 → `-all` / `2.5-all`、サイズの固定や4Kが必要な場合 → `-vip`の3モデル、30のプリセットを超えるカスタムサイズや精密なマスクが必要な場合 → 公式モデルを選択してください。詳細は[GPT-Image-2.5-VIP 概要](/ja/api-capabilities/gpt-image-2-vip/overview)を参照してください。
  </Accordion>

  <Accordion title="-vip内では、2つの2.5モデルと gpt-image-2-vip のどちらを選ぶべきですか？">
    価格、グループ、呼び出し形式は同じです（2026-09-09に同じチャンネルおよびtokenで実施された253リクエストの3者間比較検証では、コントラクトが完全に一致していることが確認されています）。異なるのは次の3点のみです：

    * **階層**：2.5モデルは全6段階に対応（`xhigh` / `max`は2026-09-10に解放）、`gpt-image-2-vip`は最大`high`までです。同名の階層でも同じではありません — 2048×1152では、2.5の`high` 1,413 = `gpt-image-2-vip` `medium`、2.5の`max` 5,650 = `gpt-image-2-vip` `high`です。3モデルすべてが同じ最高token階層に達します
    * **品質と速度**：flare-vipは最も高速で、装飾的なディテールが控えめな柔らかい仕上がりになります。sunburst-vipは`gpt-image-2-vip`に近い描写になります
    * **デフォルトサイズ**：flare-vipは1024×1536固定、他の2モデルは2048×2048です。固定するには必ず`size`を渡してください

    エイリアス`gpt-image-2.5-vip`はsunburst-vipです。行ごとの完全な比較表は[GPT-Image-2.5-VIP 概要の「3つの-vipモデルの比較」セクション](/ja/api-capabilities/gpt-image-2-vip/overview)にあります。
  </Accordion>

  <Accordion title="サイズの固定や4Kが必要な場合はどうすればよいですか？">
    まずは`-vip`の3モデル（デフォルトは`gpt-image-2.5-vip`、最高token階層には`high`を指定した`gpt-image-2-vip`を選択）から始めてください。`size`パラメータは2026-07-22に復旧し、4Kの追加料金なしの一律\$0.03/画像で\*\*30種類のプリセットサイズ（10種類のアスペクト比 × 1K/2K/4K）\*\*をサポートしています。なお、`size`はimagesエンドポイントでのみ機能し、30種類のプリセットのいずれかである必要があります。

    **30種類のプリセットを超える任意の有効なサイズ**、**公式に保証された`quality`階層**（`-vip`の階層はチャンネルの挙動であり保証はありません）、**精密なマスクインペインティング**（アルファチャンネルマスク）、または**厳密なOpenAI APIフィールド互換性**（既存のOpenAI SDKコードを無変更で移行）が必要な場合は、公式モデル（`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`、token従量課金）をご利用ください。
  </Accordion>

  <Accordion title="1.5からの移行では、どれを選ぶべきですか？">
    * **OpenAI SDKをそのまま使い続けたい / OpenAI公式と完全に一致させる必要がある、または30種類のプリセット以外のカスタムサイズが必要な場合**：公式モデル（テキストから画像への生成には`gpt-image-2.5-flare`、編集には`gpt-image-2.5-sunburst`）を選択してください。`input_fidelity`を削除し、それ以外は変更せずにそのまま使用できます（`background: transparent`は引き続き動作します）。
    * **コストを削減し、高速な出力を求める場合**：`gpt-image-2.5-all`を選択してください（リバース、約90秒、`gpt-image-2-all`と同等の価格および挙動）。
    * **コストを削減し、品質を最優先する場合、あるいはサイズの固定 / 4Kが必要な場合**：`gpt-image-2.5-vip`を選択してください（リバース、約120〜200秒、4Kを含む30種類のプリセットサイズ、全6段階の`quality`階層に対応。`gpt-image-2-vip`は`high`まで）。
  </Accordion>

  <Accordion title="フェイルオーバー用に複数のモデルをデプロイできますか？">
    はい。一般的なパターンは、**プライマリに`2.5-all`または`2.5-vip`**（予測可能なコスト — 速度や品質の好みに応じて選択）、**フォールバックに公式の`gpt-image-2.5-flare` / `sunburst`**（`quality`階層、マスク、または30のプリセット以外のカスタムサイズが必要な場合に切り替え）とする構成です。リバースと公式ではレスポンスの構造が異なるため、ビジネスロジック層で正規化を行ってください。
  </Accordion>

  <Accordion title="R2 CDNの画像リンクが遅いのですが、どうすればよいですか？">
    [CDNダウンロードが遅い場合の対処法](/ja/faq/cdn-download-slow)を参照してください。
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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.