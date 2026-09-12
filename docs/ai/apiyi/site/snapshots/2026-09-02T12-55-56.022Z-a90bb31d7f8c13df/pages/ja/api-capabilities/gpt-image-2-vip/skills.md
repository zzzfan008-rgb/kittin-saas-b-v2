> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-VIP エージェントスキル

> gpt-image-2-vip（reverse、Codexライン — サイズ/4K をロック可能、定額 $0.03/画像）を Agent 内で使用します。gpt-image-2 と gpt-image-2-all と共有する gpt-image-2 スキルは1つだけで、--model を gpt-image-2-vip に設定するだけです。

<Note>
  **gpt-image-2-vip は独自のスキルを必要としません。** gpt-image-2（公式）および gpt-image-2-all と単一の **gpt-image-2 series スキル** を共有しており、3つとも同じ OpenAI Images API を使用します。異なるのは `--model` のみです。完全なインストール手順、`SKILL.md`、およびスクリプトについては、[**GPT-Image-2 Series Agent Skill**](/ja/api-capabilities/gpt-image-2/skills) を参照してください。
</Note>

## このモデルが得意なこと

<CardGroup cols={3}>
  <Card title="固定サイズ / 4K" icon="expand">
    Codex の逆順ラインで、30 `size`段階に対応しています（3840×2160 のような 4K を含む）— 寸法を調整できます。
  </Card>

  <Card title="最安" icon="piggy-bank">
    一律 \$0.03/画像、すべてのサイズで同一価格、4K の追加料金はありません。
  </Card>

  <Card title="T2I / フュージョン" icon="layers">
    テキストから画像生成と最大16枚のフュージョン（品質段階 / マスクなし）。
  </Card>
</CardGroup>

## スキルでの使い方

[gpt-image-2 シリーズスキル](/ja/api-capabilities/gpt-image-2/skills) をインストールしたら、`--model` を `gpt-image-2-vip` に設定し、`--size` でサイズを固定します:

```bash theme={null}
python3 gpt-image-2/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2-vip --size 3840x2160
```

デフォルトチャネルにするには、`gpt-image-2/.env` に 1 行追加します:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-vip
```

<Warning>
  **赤字の行**: gpt-image-2-vip は `quality` / `n` を**受け付けず**、マスクのインペインティングも**サポートしていません**（マスクには公式の `gpt-image-2` を使ってください）。`n>1` を渡しても 1 画像は返りますが、課金は枚数ごとです。スキルスクリプトがこれを自動で制御するので、通常の `--model gpt-image-2-vip` の使用は安全です。

  また、`size` は上流側で時々無効化され、アダプティブ 1K に強制されることがあります。その場合は、サイズ/比率も**prompt 内に**入れてください（例: 「16:9」）をフォールバックにします。
</Warning>

## 関連ドキュメント

* [GPT-Image-2 Series エージェントスキル（メインページ · 完全スクリプト）](/ja/api-capabilities/gpt-image-2/skills)
* [GPT-Image-2-All エージェントスキル](/ja/api-capabilities/gpt-image-2-all/skills)
* [GPT-Image-2-VIP 画像生成の概要](/ja/api-capabilities/gpt-image-2-vip/overview)
