> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-All エージェントスキル

> gpt-image-2.5-all（リバース、ChatGPT 系統 — 最速、一律 $0.03/画像。gpt-image-2-all も同じ呼び出しを使用）をエージェント内で使用します。gpt-image-2 および gpt-image-2-vip と同じ1つの gpt-image-2 スキルを共有します。--model を gpt-image-2.5-all に設定するだけです。

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

## スキルでの使用方法

[gpt-image-2 シリーズスキル](/ja/api-capabilities/gpt-image-2/skills)をインストールした後、`--model`を`gpt-image-2.5-all`（または`gpt-image-2-all`。価格と動作は同じ）に設定します。

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Flat-illustration festival poster, portrait 2:3" -o poster.png --model gpt-image-2.5-all
```

デフォルトのチャネルにするには（毎回`--model`を指定しないようにするには）、`gpt-image-2/.env`に次の行を追加します。

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2.5-all
```

<Warning>
  **禁止事項**: gpt-image-2-all は **`size` / `quality` / `n`を受け付けません** —

  * サイズや比率は **プロンプト内に**指定します（例: 「portrait 2:3」「16:9 banner」）。渡された`size`は無視されるか、エラーになります。
  * `n>1`を渡しても **画像は1枚しか返されませんが、個数分の課金が発生します**。

  スキルスクリプトはこのモデルに対してすでに`size`/`quality`/`n`を省略しているため、通常の`--model gpt-image-2-all`の使用は安全です。スクリプト外でリクエストを手動作成する場合のみ注意してください。固定サイズや4Kを使用する場合は[`gpt-image-2-vip`](/ja/api-capabilities/gpt-image-2-vip/skills)、品質ティアやマスクを使用する場合は公式の`gpt-image-2`を使用してください。
</Warning>

## 関連ドキュメント

* [GPT-Image-2 シリーズ エージェントスキル（メインページ · 全文スクリプト）](/ja/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-VIP エージェントスキル](/ja/api-capabilities/gpt-image-2-vip/skills)
* [GPT-Image-2-All 画像生成の概要](/ja/api-capabilities/gpt-image-2-all/overview)
