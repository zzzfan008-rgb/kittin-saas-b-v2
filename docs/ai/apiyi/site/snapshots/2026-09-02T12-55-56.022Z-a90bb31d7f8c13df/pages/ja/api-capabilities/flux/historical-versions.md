> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX の過去バージョン

> FLUX.1 [pro] / [pro] 1.1 / [pro] 1.1 Ultra / [dev] 仕様、料金、および FLUX.2 への移行ガイド

<Note>
  このページでは、APIYI で**引き続き呼び出し可能**な FLUX.1 \[pro] の text-to-image モデルを扱います。最新の FLUX.2 世代と、編集に特化した FLUX.1 Kontext については、[FLUX 概要](/ja/api-capabilities/flux/overview)に記載されています。
</Note>

## バージョン概要

| Model ID             | 公開日 (UTC+0) | APIYI 価格 | ステータス  | 適した用途                  |
| -------------------- | ----------- | -------- | ------ | ---------------------- |
| `flux-pro-1.1-ultra` | 2024-11     | \$0.0500 | 🟡 維持中 | レガシーの超高解像度（4MP）        |
| `flux-pro-1.1`       | 2024-10     | \$0.0350 | 🟡 維持中 | レガシーのテキストから画像生成ベースライン  |
| `flux-pro`           | 2024-08     | \$0.0400 | 🟡 維持中 | 初代 Pro、レガシー互換          |
| `flux-dev`           | 2024-08     | \$0.0200 | 🟡 維持中 | 開発/テスト、オープンウェイトのローカル推論 |

<Tip>
  **新規プロジェクトでは FLUX.2 を推奨します**: `flux-2-pro` は `flux-pro-1.1` と同じ階層で、品質、マルチリファレンス、長文 prompt、4MP 出力が大幅に向上しており、コストも同等かそれ以下です。以下の移行ガイダンスをご覧ください。
</Tip>

## バージョン別仕様

### `flux-pro-1.1-ultra`

* **リリース**: 2024-11 (UTC+0)
* **APIYI 価格**: \$0.0500（公式 \$0.06、17% お得）
* **最大出力**: 約4MP（FLUX.1 シリーズで最高）
* **主な機能**: 超高解像度、オプションの raw モード（より自然なスナップ写真に近い）
* **既知の制限**: 参照は1枚のみ、16進カラー制御なし、grounding search なし
* **公式ドキュメント**: `docs.bfl.ai/flux_models/flux_1_1_pro_ultra_raw`

### `flux-pro-1.1`

* **リリース**: 2024-10 (UTC+0)
* **APIYI 価格**: \$0.0350（公式 \$0.04、12.5% お得）
* **最大出力**: 約1.6MP（例: 1024×1536）
* **主な機能**: 1.0 より品質と prompt への追従性が向上、業界標準のベースライン
* **既知の制限**: 参照は1枚、短い prompt のみ（32K なし）
* **公式ドキュメント**: `docs.bfl.ai/flux_models/flux_1_1_pro`

### `flux-pro`

* **リリース**: 2024-08 (UTC+0)
* **APIYI 価格**: \$0.0400（公式 \$0.04、同一）
* **最大出力**: 約1.6MP
* **主な機能**: BFL の初の商用 pro、text-to-image のベースライン
* **既知の制限**: 品質と追従性は 1.1 未満で、新規プロジェクトで採用する理由はありません

### `flux-dev`

* **APIYI 価格**: \$0.0200
* **最大出力**: 約1MP
* **主な機能**: Open-weights 版（FLUX.1 \[dev]、非商用ライセンス）、自前の GPU でセルフホスト可能
* **既知の制限**: 品質は \[pro] ティアより低く、主に研究、プロトタイピング、ローカル推論の検証向け
* **公式 weights**: `huggingface.co/black-forest-labs/FLUX.1-dev`

## 移行ガイダンス

<Steps>
  <Step title="違いを確認する">
    FLUX.2 は FLUX.1 \[pro] を完全に置き換えます: 4MP の出力（1.6MP に対して）、最大 8 件の複数参照（1 件に対して）、32K-token prompts（短い prompt に対して）、ネイティブの 16進カラー制御、タイポグラフィ専用ティア。1MP 以内の価格は同等かそれ以下です。
  </Step>

  <Step title="並行して比較する">
    `flux-pro-1.1` と `flux-2-pro` で同じ prompt セットを 1 週間実行します。テキストの可読性、複数オブジェクトの一貫性、ブランドカラーの忠実度を比較してください。ほとんどの場合、FLUX.2 \[pro] が全項目で優位です。
  </Step>

  <Step title="段階的に展開する">
    まずトラフィックの 10% を `flux-2-pro` に向け、1 週間品質とコストを観察してから、100% まで拡大します。コストは 1MP ではほぼ同等で、4MP ではかなり安くなります。
  </Step>

  <Step title="パラメータの違いを扱う">
    ほとんどのパラメータはそのまま引き継がれますが、次の点に注意してください:

    * FLUX.1 \[pro] は単一の参照画像を使用します。FLUX.2 は複数参照をサポートします（JSON fields `input_image` \~ `input_image_8`、最大 8 件）
    * FLUX.1 は `prompt_upsampling` をサポートしていません。FLUX.2 \[pro/max/flex] はサポートしています
    * 一部の従来のアスペクト比識別子（例: `aspect_ratio`）は、FLUX.2 では `width`/`height` または `size` 文字列に置き換えられます
  </Step>
</Steps>

## レガシーな呼び出し例

```python theme={null}
{/* Call any historical version by changing only the model field — all other params are OpenAI Images API compatible */}
from openai import OpenAI
import requests

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

resp = client.images.generate(
    model="flux-pro-1.1-ultra",
    prompt="A serene mountain landscape at golden hour, raw photo style",
    size="2048x1536"
)

# data[0].url is valid for only 10 minutes
url = resp.data[0].url
with open("legacy.jpg", "wb") as f:
    f.write(requests.get(url, timeout=30).content)
```

## コスト比較

一般的な利用量での比較（画像あたり一律価格）:

| バージョン                | APIYI 価格   | 100枚       | 1,000枚      | 10,000枚      |
| -------------------- | ---------- | ---------- | ----------- | ------------ |
| `flux-pro-1.1-ultra` | \$0.05     | \$5.00     | \$50.00     | \$500.00     |
| `flux-pro-1.1`       | \$0.035    | \$3.50     | \$35.00     | \$350.00     |
| `flux-pro`           | \$0.04     | \$4.00     | \$40.00     | \$400.00     |
| `flux-dev`           | \$0.02     | \$2.00     | \$20.00     | \$200.00     |
| **`flux-2-pro`（新規）** | **\$0.03** | **\$3.00** | **\$30.00** | **\$300.00** |
| **`flux-2-max`（新規）** | **\$0.07** | **\$7.00** | **\$70.00** | **\$700.00** |

<Info>
  **選び方**: 新規プロジェクトでは、FLUX.2 を優先してください（`flux-2-pro` は汎用、`flux-2-max` は旗艦向けです）。FLUX.1 \[pro] は、レガシー統合が深く組み込まれていて回帰テストが現実的でない場合にのみ継続してください。`flux-dev` は、低コストの開発/テスト用途として引き続き有力な選択肢です。
</Info>

## 関連ドキュメント

* [FLUX の概要](/ja/api-capabilities/flux/overview) — モデル一覧と選択の全体像
* [テキストから画像へのプレイグラウンド](/ja/api-capabilities/flux/text-to-image) — FLUX.2 + FLUX.1 に対応
* [画像編集プレイグラウンド](/ja/api-capabilities/flux/image-edit) — マルチ参照の融合 + 編集
