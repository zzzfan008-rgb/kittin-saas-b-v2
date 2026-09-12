> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-All エージェントスキル

> gpt-image-2-all（リバース、ChatGPT系統 — 最速、定額 $0.03/画像）をエージェント内で使用します。同じ gpt-image-2 スキルを gpt-image-2 と gpt-image-2-vip と共有しており、--model を gpt-image-2-all に設定するだけです。

<Note>
  **gpt-image-2-all は独自のスキルを必要としません。** gpt-image-2（公式）および gpt-image-2-vip と単一の **gpt-image-2 シリーズスキル** を共有しており、3つすべてが同じ OpenAI Images API を使用します。異なるのは `--model` だけです。完全なインストール手順、`SKILL.md`、およびスクリプトについては、[**GPT-Image-2 シリーズ エージェントスキル**](/ja/api-capabilities/gpt-image-2/skills) を参照してください。
</Note>

## このモデルの得意分野

<CardGroup cols={3}>
  <Card title="最速" icon="bolt">
    Reverse ChatGPT ライン、約30〜60秒 — 3つのチャネルの中で最速です。
  </Card>

  <Card title="最安" icon="piggy-bank">
    サイズや品質に関係なく一律 \$0.03/画像 — 大量利用に最適です。
  </Card>

  <Card title="T2I / 融合" icon="layers">
    テキストから画像生成と最大16画像の融合（マスクインペインティングはありません）。
  </Card>
</CardGroup>

## スキルでの使い方

[gpt-image-2 シリーズスキル](/ja/api-capabilities/gpt-image-2/skills) をインストールしたら、`--model` を `gpt-image-2-all` に設定してください:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Flat-illustration festival poster, portrait 2:3" -o poster.png --model gpt-image-2-all
```

毎回 `--model` しなくてよいように、既定のチャネルにするには `gpt-image-2/.env` に 1 行追加してください:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Warning>
  **注意事項**: gpt-image-2-all は **`size` / `quality` / `n` を受け付けません** —

  * サイズ/比率は **prompt の中に** 入れてください（例: 「portrait 2:3」「16:9 banner」）。渡した `size` は無視されるか、エラーになります;
  * `n>1` を渡しても **返る画像は 1 枚のままですが、課金は枚数分です**。

  このモデル向けにはスキルスクリプトがすでに `size`/`quality`/`n` を省いているため、通常の `--model gpt-image-2-all` の利用は安全です。スクリプト外でリクエストを手作業で組み立てる場合だけ注意してください。サイズ固定/4K には [`gpt-image-2-vip`](/ja/api-capabilities/gpt-image-2-vip/skills) を使ってください。品質階層 / マスクには公式 `gpt-image-2` を使ってください。
</Warning>

## 関連ドキュメント

* [GPT-Image-2 シリーズ エージェントスキル（メインページ · 全文スクリプト）](/ja/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-VIP エージェントスキル](/ja/api-capabilities/gpt-image-2-vip/skills)
* [GPT-Image-2-All 画像生成の概要](/ja/api-capabilities/gpt-image-2-all/overview)
