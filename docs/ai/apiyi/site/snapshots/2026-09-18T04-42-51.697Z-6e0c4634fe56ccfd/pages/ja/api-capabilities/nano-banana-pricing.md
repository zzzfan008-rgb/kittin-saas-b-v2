> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana シリーズ料金

> Nano Banana シリーズ画像モデル（Pro / 2 / 2 Lite / Gen 1）の完全な料金比較。リクエストごとの料金、token ベースの料金、チャージ特典、token 選択ガイドを含みます。公式料金のわずか 30.3% から利用できます。

## 概要

Nano Banana シリーズには 4 つの画像生成モデルが含まれており、いずれも APIYI を通じて公式料金より大幅に安い価格で利用できます。このページでは、最適な課金プランを選べるように、Nano Banana のすべてのモデル料金をまとめています。

<Info>
  API を呼び出すとき、使用する **token type** によって課金方法が決まります。Nano Banana Pro、2、Lite はいずれも、**リクエストごと** と **token ベース** の 2 つの課金モードをサポートしています。それぞれに、デフォルトの安定ティアとエンタープライズ高可用性ティアの 2 段階があります。
</Info>

## モデル概要

| Feature        | **Nano Banana Pro**          | **Nano Banana 2**                | **Nano Banana 2 Lite**        | **Nano Banana (Gen 1)**  |
| -------------- | ---------------------------- | -------------------------------- | ----------------------------- | ------------------------ |
| Model ID       | `gemini-3-pro-image-preview` | `gemini-3.1-flash-image-preview` | `gemini-3.1-flash-lite-image` | `gemini-2.5-flash-image` |
| Max Resolution | 4K                           | 4K                               | 1K                            | 1K                       |
| Per-request    | \$0.09/req                   | \$0.055/req                      | \$0.025/req                   | \$0.02/req               |
| Token-based    | ベータテスト中                      | ✅ 利用可能                           | ✅ 利用可能                        | ❌ 未対応                    |
| Best Discount  | 公式の31.25%                    | 公式の30.3%                         | 公式の40%                        | 公式の50%                   |

## Nano Banana Pro 料金

Model: `gemini-3-pro-image-preview`

### リクエストごとの課金

\$0.09 per request、1-4K 解像度向けの一律料金です。シンプルな課金で、4K 画像で大幅にお得です。

| 項目              | APIYI デフォルト | チャージ +10% | チャージ +20%  | Google 公式 |
| --------------- | ----------- | --------- | ---------- | --------- |
| 画像1枚あたりの価格 (\$) | \$0.09      | \$0.0818  | \$0.075    | \$0.24    |
| 画像1枚あたりの価格 (¥)  | ¥0.63       | ¥0.573    | ¥0.525     | ¥1.68     |
| 公式比             | 37.5%       | 34.0%     | **31.25%** | /         |

<Tip>
  4K 画像で最大 **68.75%** もお得です！リクエストごとの課金は解像度による区別がなく、4K でも 1K と同じ料金です。そのため、解像度が高いほど価値が高くなります。
</Tip>

### トークンベースの課金（まだ公開されていません、ベータ版利用可）

| 項目  | APIYI           | Google 公式      |
| --- | --------------- | -------------- |
| 入力  | \$0.88/M tokens | \$2/M tokens   |
| 出力  | \$52.8/M tokens | \$120/M tokens |
| 公式比 | **44%**         | /              |

画像1枚あたりの推定コスト:

| 解像度  | APIYI の推定値 | Google の推定値 |
| ---- | ---------- | ----------- |
| 1-2K | \~\$0.075  | \~\$0.134   |
| 4K   | \~\$0.11   | \~\$0.24    |

<Info>
  トークンベースのコストは、入力/出力の画像 token によって変動します。これらは推定値です。トークンベースの課金は 1-2K 画像に向いており、リクエストごとの課金は 4K に対してより費用対効果が高いです。
</Info>

## Nano Banana 2 の価格

モデル: `gemini-3.1-flash-image-preview`

### リクエスト単位の課金

\$0.055 / リクエストで、1〜4K解像度は統一価格です。

| 項目           | APIYI デフォルト | チャージ +10% | チャージ +20% | Google公式 |
| ------------ | ----------- | --------- | --------- | -------- |
| 画像ごとの価格 (\$) | \$0.055     | \$0.05    | \$0.0458  | \$0.151  |
| 画像ごとの価格 (¥)  | ¥0.385      | ¥0.35     | ¥0.32     | ¥1.68    |
| 公式比          | **36.4%**   | **33.1%** | **30.3%** | /        |

### token ベースの課金

| 項目  | APIYI           | Google公式       |
| --- | --------------- | -------------- |
| 入力  | \$0.18/M tokens | \$0.5/M tokens |
| 出力  | \$21.6/M tokens | \$60/M tokens  |
| 公式比 | **36%**         | /              |

画像ごとの推定コスト:

| 解像度   | APIYI の推定値 | Google公式 |
| ----- | ---------- | -------- |
| 512px | \~\$0.024  | \$0.045  |
| 1K    | \~\$0.03   | \$0.067  |
| 2K    | \~\$0.036  | \$0.101  |
| 4K    | \~\$0.06   | \$0.151  |

<Info>
  これらは、実際の入力/出力 token に基づく推定値です。チャージ特典（最大20%）と組み合わせると、さらに低コストになります。
</Info>

## Nano Banana 2 Lite の料金

モデル: `gemini-3.1-flash-lite-image`

最速・最安のティアで、1K キャンバスに特化し、1枚あたり約4秒です。**Pay-as-you-go Priority を優先**すると、実際の単価はより低く、予測しやすくなります。

### Token ベース課金（推奨）

| 項目 | APIYI           | Google 公式       | 公式比     |
| -- | --------------- | --------------- | ------- |
| 入力 | \$0.10/M tokens | \$0.25/M tokens | **40%** |
| 出力 | \$12/M tokens   | \$30/M tokens   | **40%** |

1枚あたりの推定コスト:

| 解像度 | APIYI の推定値    | Google 公式 |
| --- | ------------- | --------- |
| 1K  | **\~\$0.018** | \~\$0.034 |

<Info>
  **実運用では予測しやすい**: token ベース（per-token）課金の 1K 画像は、**実運用では平均で約\$0.018/呼び出し**になります（一般的な範囲は約\$0.016–\$0.019 で、出力 tokens に左右されます）。これは固定の呼び出しごとの \$0.025/画像より安いです。チャージ特典と組み合わせると、さらに低コストにできます。
</Info>

### 呼び出しごとの課金

| 項目       | APIYI       | Google 公式       | 注記                                |
| -------- | ----------- | --------------- | --------------------------------- |
| 1枚あたりの料金 | \$0.025/req | \~\$0.034/image | 固定料金です。後で下がる可能性はありますが、現時点では変更なしです |

<Tip>
  **どの課金モードを選ぶべきですか?** Lite では、**`Pay-as-you-go Priority` を優先**してください。実運用では約\$0.018/呼び出しで、呼び出しごとの \$0.025 より安く、予測もしやすいです。また、1 token で Nano Banana Pro / 2 の呼び出しごとの課金にも対応し、シリーズ全体を動かせます。呼び出しごとの \$0.025/画像は固定料金で、後で下がる可能性はありますが、現時点では変更なしです。
</Tip>

## Nano Banana Gen 1 価格

Model: `gemini-2.5-flash-image`

1K画像のみ、1リクエストごとの固定課金です。

| 項目       | APIYI      | Google公式    | 割引         |
| -------- | ---------- | ----------- | ---------- |
| 画像あたりの価格 | \$0.02/req | \$0.039/req | **約50%オフ** |

チャージボーナスプロモーションも対象です。

## チャージボーナス

既に割引された価格にチャージボーナスを重ねることで、さらにお得に利用できます。

<CardGroup cols={2}>
  <Card title="チャージボーナスの詳細" icon="gift" href="/ja/faq/recharge-promotions">
    現在のチャージボーナスの段階とキャンペーン詳細を確認できます。
  </Card>

  <Card title="token管理" icon="key" href="https://api.apiyi.com/token">
    API tokenを作成・管理できます。
  </Card>
</CardGroup>

## token種別選択ガイド

<Info>
  tokenを作成する際は、「Billing model」設定で課金方法が決まります。主な用途に合わせて選択してください:
</Info>

| Model              | Use Case     | Recommended Token Type |
| ------------------ | ------------ | ---------------------- |
| Nano Banana Pro    | 1K〜4Kの混在利用   | tokenベース（優先）           |
| Nano Banana Pro    | 4Kのみ         | リクエストごと                |
| Nano Banana 2      | 0.5K〜4Kの混在利用 | tokenベース（優先）           |
| Nano Banana 2      | 4Kのみ         | リクエストごと                |
| Nano Banana 2 Lite | 1K規模の生成      | tokenベース（優先）           |

<Tip>
  **簡単なルール**: 4K画像を主に生成する場合は、**リクエストごとの課金**を選択してください（解像度にかかわらず価格は同じです）。混在解像度での利用では、**tokenベース課金**のほうが低解像度でよりお得です。
</Tip>

## 関連ドキュメント

* [Nano Banana 2 Image Gen/Edit](/ja/api-capabilities/nano-banana-2-image/overview) - Nano Banana 2 の完全ガイド
* [Nano Banana Pro Image Generation](/en/api-capabilities/nano-banana-image) - Nano Banana Pro ガイド
* [Nano Banana Pro Image Editing](/en/api-capabilities/nano-banana-image-edit) - 画像編集機能
* [チャージ特典](/ja/faq/recharge-promotions) - チャージボーナスの詳細
