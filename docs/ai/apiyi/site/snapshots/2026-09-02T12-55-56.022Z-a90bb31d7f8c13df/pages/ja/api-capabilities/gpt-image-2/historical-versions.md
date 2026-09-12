> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image レガシー版

> レガシーな GPT-Image-1 / 1-mini / 1.5 モデルの概要 — モデルID、料金、エンドポイント、および GPT-Image-2 / GPT-Image-2-All へ移行するためのヒント。

<Info>
  新規プロジェクトでは、[GPT-Image-2](/ja/api-capabilities/gpt-image-2/overview)（公式）または [GPT-Image-2-All](/ja/api-capabilities/gpt-image-2-all/overview)（逆チャネル、一律 \$0.03/image）を使用してください。このページでは旧バージョンの要点を残しているため、既存の統合はトラブルシューティングや移行をスムーズに行えます。
</Info>

## レガシーラインナップ

| モデル ID             | リリース     | エンドポイント                                      | 料金                                  | ステータス                            |
| ------------------ | -------- | -------------------------------------------- | ----------------------------------- | -------------------------------- |
| `gpt-image-1.5`    | 2025年12月 | `/v1/images/generations`                     | 入力 \$5.00 / 出力 \$10.00 per M tokens | 利用可能; `gpt-image-2` へのアップグレードを推奨 |
| `gpt-image-1`      | 2025年4月  | `/v1/images/generations`, `/v1/images/edits` | 入力 \$2.50 / 出力 \$8.00 per M tokens  | 利用可能; `gpt-image-2` へのアップグレードを推奨 |
| `gpt-image-1-mini` | 2025年4月  | `/v1/images/generations`                     | `gpt-image-1` より低い                  | 利用可能                             |

<Tip>
  **ドロップイン移行**: `model` を `gpt-image-2` または `gpt-image-2-all` に変更します。パラメータ（`size` / `quality` / `output_format`, …）はほぼ互換性があり、構造的なコード変更は不要です。
</Tip>

## 共通パラメータ（生成）

すべての旧バージョンで同じ生成パラメータを共有します:

| パラメータ                | 説明                                                   |
| -------------------- | ---------------------------------------------------- |
| `model`              | `gpt-image-1.5` / `gpt-image-1` / `gpt-image-1-mini` |
| `prompt`             | 画像の説明（最大1000文字）                                      |
| `size`               | `1024x1024` / `1536x1024` / `1024x1536` / `auto`     |
| `quality`            | `low` / `medium` / `high` / `auto`                   |
| `output_format`      | `png`（デフォルト） / `jpeg` / `webp`                       |
| `output_compression` | JPEG/WebP のみ、0〜100%                                  |
| `background`         | `transparent` / `opaque` / `auto`                    |
| `n`                  | 画像枚数（1〜10）                                           |

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

## GPT-Image-2 / 2-All への移行

| あなたのニーズ                                  | 推奨対象                                  |
| ---------------------------------------- | ------------------------------------- |
| 公式 OpenAI エンドポイントのまま、正確なサイズ/品質制御が必要      | `gpt-image-2`（公式）                     |
| 予測しやすい定額料金（\$0.03/image）と、より優れた指示追従性がほしい | `gpt-image-2-all`（リバース）               |
| まだマスクベースの画像編集が必要                         | `gpt-image-2-all` edit エンドポイント（最大16枚） |

<CardGroup cols={2}>
  <Card title="GPT-Image-2 概要" icon="bolt" href="/ja/api-capabilities/gpt-image-2/overview">
    最新の公式版 — エンドポイントとパラメーターは旧版と互換
  </Card>

  <Card title="GPT-Image-2-All 概要" icon="sparkles" href="/ja/api-capabilities/gpt-image-2-all/overview">
    リバースチャネル、定額 \$0.03/image、より短い所要時間
  </Card>

  <Card title="公式版 vs リバース版の比較" icon="scale" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    並列表比較と選定ガイド
  </Card>
</CardGroup>
