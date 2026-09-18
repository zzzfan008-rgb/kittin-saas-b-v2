> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image レガシーバージョン

> GPT-Image のバージョンラインナップ：現行の gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2、およびレガシーの GPT-Image-1 / 1-mini / 1.5 — モデル ID、リリース日、料金、エンドポイント、2.5 / 2-All への移行に向けた移行のヒント。

<Info>
  新規プロジェクトでは、[GPT-Image-2.5 / 2](/ja/api-capabilities/gpt-image-2/overview)（公式。テキストから画像生成には`gpt-image-2.5-flare`、編集には`gpt-image-2.5-sunburst`）または[GPT-Image-2-All](/ja/api-capabilities/gpt-image-2-all/overview)（逆方向チャネル、一律 \$0.03/画像）を使用してください。このページでは、既存の統合でスムーズにトラブルシューティングと移行を行えるよう、レガシーバージョンの基本事項を掲載しています。
</Info>

## バージョン一覧

| モデル ID                                           | リリース日    | エンドポイント                                     | 料金                                                   | ステータス                                                |
| ------------------------------------------------ | -------- | ------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `gpt-image-2.5-flare`（スナップショット `-2026-09-08`）    | 2026年9月  | `/v1/images/generations`、`/v1/images/edits` | 入力 \$5.00 / 出力 \$30.00（M tokens あたり）、gpt-image-2 と同じ | **現行**、速度優先、テキストから画像へのデフォルト                          |
| `gpt-image-2.5-sunburst`（スナップショット `-2026-09-08`） | 2026年9月  | `/v1/images/generations`、`/v1/images/edits` | 上記と同じ                                                | **現行**、品質と編集精度を優先                                    |
| `gpt-image-2`（スナップショット `-2026-04-21`）            | 2026年4月  | `/v1/images/generations`、`/v1/images/edits` | 入力 \$5.00 / 出力 \$30.00（M tokens あたり）                 | 現行、前世代、`quality` は最大 `high`                          |
| `gpt-image-1.5`                                  | 2025年12月 | `/v1/images/generations`                    | 入力 \$5.00 / 出力 \$10.00（M tokens あたり）                 | 利用可能。`gpt-image-2.5-flare` / `sunburst` へのアップグレードを推奨 |
| `gpt-image-1`                                    | 2025年4月  | `/v1/images/generations`、`/v1/images/edits` | 入力 \$2.50 / 出力 \$8.00（M tokens あたり）                  | 利用可能。`gpt-image-2.5-flare` / `sunburst` へのアップグレードを推奨 |
| `gpt-image-1-mini`                               | 2025年4月  | `/v1/images/generations`                    | `gpt-image-1` より低料金                                  | 利用可能                                                 |

<Tip>
  **そのまま移行**: `model` を `gpt-image-2` または `gpt-image-2-all` に変更します。パラメーター（`size` / `quality` / `output_format`、…）はほぼ互換性があるため、コードの構造変更は必要ありません。
</Tip>

## 共通パラメータ（生成）

すべての旧バージョンで、同じ生成パラメータを使用します。

| パラメータ                | 説明                                                              |
| -------------------- | --------------------------------------------------------------- |
| `model`              | `gpt-image-1.5` / `gpt-image-1` / `gpt-image-1-mini`            |
| `prompt`             | 画像の説明。最大32,000文字（プロバイダーの制限。文字数でカウント）                            |
| `size`               | `1024x1024` / `1536x1024` / `1024x1536` / `auto`                |
| `quality`            | `low` / `medium` / `high` / `auto`（2.5シリーズでは`xhigh` / `max`を追加） |
| `output_format`      | `png`（デフォルト） / `jpeg` / `webp`                                  |
| `output_compression` | JPEG/WebPのみ、0～100%                                              |
| `background`         | `transparent` / `opaque` / `auto`                               |
| `n`                  | 画像の枚数（1～10）                                                     |

## クイック例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.images.generate(
    model="gpt-image-1.5",  {/* or gpt-image-1 / gpt-image-1-mini */}
    prompt="A professional product photo on white background, soft studio lighting",
    size="1024x1024",
    quality="high"
)

print(response.data[0].url)
```

## 画像ごとの料金参考

GPT-Image-1 / 1.5 は token 課金と画像ごとの課金の両方に対応しており、システムは自動的により安い方を選びます:

### GPT-Image-1.5

| 品質 | 1024×1024 | 1024×1536 / 1536×1024 |
| -- | --------- | --------------------- |
| 低  | \$0.009   | \$0.013               |
| 中  | \$0.034   | \$0.050               |
| 高  | \$0.133   | \$0.200               |

### GPT-Image-1

| 品質 | 1024×1024 | 1024×1536 / 1536×1024 |
| -- | --------- | --------------------- |
| 低  | \$0.005   | \$0.006               |
| 中  | \$0.011   | \$0.015               |
| 高  | \$0.036   | \$0.052               |

<Warning>
  画像ごとの金額は参考値です。実際の課金は、システムがより安いと判断した課金モード（token または画像ごと）に従います。
</Warning>

## 画像編集（`gpt-image-1`のみ）

`gpt-image-1`は、`/v1/images/edits`エンドポイント経由でマスクベースの編集に対応しています:

```python theme={null}
response = client.images.edit(
    model="gpt-image-1",
    image=open("original.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A modern glass skyscraper with reflective windows",
    size="1024x1024"
)
```

| パラメータ    | 説明                               |
| -------- | -------------------------------- |
| `image`  | 元画像、PNG/WebP/JPG、各 \< 50MB、最大16枚 |
| `mask`   | マスク画像 — alpha=0 のピクセルは再描画されます    |
| `prompt` | マスク領域で生成する内容の説明                  |

<Note>
  新しい編集ワークフローでは、[GPT-Image-2 Edit](/ja/api-capabilities/gpt-image-2/image-edit)（公式）または [GPT-Image-2-All Edit](/ja/api-capabilities/gpt-image-2-all/image-edit)（逆方向、ブレンド用の入力画像を最大16枚までサポートします）を使用してください。
</Note>

## GPT-Image-2.5 / 2-All への移行

| ニーズ                                     | 推奨ターゲット                                                           |
| --------------------------------------- | ----------------------------------------------------------------- |
| 公式の OpenAI エンドポイントを使い続け、サイズや品質を正確に制御したい | `gpt-image-2.5-flare`（テキストから画像） / `gpt-image-2.5-sunburst`（編集）、公式 |
| 予測可能な一律料金（\$0.03/画像）と、より優れた指示追従を求める     | `gpt-image-2-all`（リバース）                                           |
| マスクベースの画像編集が引き続き必要                      | `gpt-image-2-all` 編集エンドポイント（最大16枚）                                |

<CardGroup cols={2}>
  <Card title="GPT-Image-2.5 / 2 の概要" icon="bolt" href="/ja/api-capabilities/gpt-image-2/overview">
    現在の3つの公式モデル — レガシー版と互換性のあるエンドポイントとパラメータ
  </Card>

  <Card title="GPT-Image-2-All の概要" icon="sparkles" href="/ja/api-capabilities/gpt-image-2-all/overview">
    リバースチャネル、一律 \$0.03/画像、より高速な処理
  </Card>

  <Card title="公式とリバースの比較" icon="scale" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    並列比較と選択ガイド
  </Card>
</CardGroup>
