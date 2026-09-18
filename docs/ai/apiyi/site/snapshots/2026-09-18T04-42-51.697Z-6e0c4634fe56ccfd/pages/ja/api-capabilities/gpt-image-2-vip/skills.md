> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-VIP エージェントスキル

> gpt-image-2.5-vip（リバース、Adobe 系列 — サイズ/4Kを固定可能、1画像あたり一律 $0.03。gpt-image-2-vipも同じ呼び出しを使用）をエージェント内で使用します。gpt-image-2およびgpt-image-2-allと1つのgpt-image-2スキルを共有します。--modelをgpt-image-2.5-vipに設定するだけです。

<Note>
  **gpt-image-2-vip は独自のスキルを必要としません。** gpt-image-2（公式）および gpt-image-2-all と単一の **gpt-image-2 series スキル** を共有しており、3つとも同じ OpenAI Images API を使用します。異なるのは `--model` のみです。完全なインストール手順、`SKILL.md`、およびスクリプトについては、[**GPT-Image-2 Series Agent Skill**](/ja/api-capabilities/gpt-image-2/skills) を参照してください。
</Note>

## このモデルが得意なこと

<CardGroup cols={3}>
  <Card title="サイズ固定可能 / 4K" icon="expand">
    Adobe系統（Firefly）とは逆方向で、30 `size`段階（3840×2160などの4Kを含む）に対応 — 寸法を制御できます。
  </Card>

  <Card title="最安値" icon="piggy-bank">
    一律 \$0.03/画像で、すべてのサイズが同じ価格です。4Kの追加料金はありません。
  </Card>

  <Card title="T2I / 融合" icon="layers">
    テキストから画像を生成し、最大16枚の画像を融合できます（品質段階 / マスクなし）。
  </Card>
</CardGroup>

## スキルでの使用方法

[gpt-image-2 シリーズスキル](/ja/api-capabilities/gpt-image-2/skills)をインストールした後、`--model` を `gpt-image-2.5-vip`（または `gpt-image-2.5-flare-vip` / `gpt-image-2-vip`）に設定し、`--size` でサイズを固定します。

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2.5-vip --size 3840x2160
```

デフォルトチャネルにするには、`gpt-image-2/.env` に次の行を追加します。

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-vip
```

<Warning>
  **重要な制約**: `quality` のティアはモデルによって異なります。2つの 2.5 モデルは6つすべてに対応します（`xhigh` / `max` は 2026-09-10 に追加）。`gpt-image-2-vip` は `high` までで、`xhigh` / `max` は拒否されます。2.5 `high` は `gpt-image-2-vip` `medium` と同等であり、2.5 `max` はその `high` と同等です。**`n` は絶対に送信しないでください**（`n>1` を渡しても1枚の画像が返りますが、件数ごとに課金されます）。また、**マスクは画像全体の再生成です**（精密なインペインティングには公式モデルを使用してください）。スキルスクリプトがこれを自動的に制御するため、通常の `--model gpt-image-2.5-vip` の使用は安全です。

  補足: `size` は上流で時折無効化され、適応型 1K に強制されます。その場合は、フォールバックとしてサイズ/比率も **prompt 内に**（例: 「16:9」）指定してください。
</Warning>

## 関連ドキュメント

* [GPT-Image-2 Series エージェントスキル（メインページ · 完全スクリプト）](/ja/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All エージェントスキル](/ja/api-capabilities/gpt-image-2-all/skills)
* [GPT-Image-2-VIP 画像生成の概要](/ja/api-capabilities/gpt-image-2-vip/overview)
