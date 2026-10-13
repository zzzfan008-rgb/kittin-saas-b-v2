> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Bananaシリーズの料金

> Nano Bananaシリーズの画像モデル（Pro / 2.1 / 2 / 2 Lite / Gen 1）の完全な料金比較。リクエスト単位の料金、tokenベースの料金、チャージボーナス、token選択ガイドを含みます。公式価格の30.3%という低価格からご利用いただけます。

## 概要

Nano Bananaシリーズには5つの画像生成モデルが含まれており、すべてAPIYIを通じて公式レートよりも大幅に安価でご利用いただけます。このページでは、最適な課金プランをお選びいただけるよう、Nano Bananaの全モデルの価格をまとめています。

<Info>
  APIを呼び出す際、使用する**tokenタイプ**によって課金方法が決まります。Nano Banana Pro、2.1、2、Liteはすべて、**リクエスト単位**と**tokenベース**の2つの課金モードに対応しています。それぞれにデフォルト安定ティアとエンタープライズ高可用性ティアの2つのティアがあります。
</Info>

## モデル概要

| 項目 | **Nano Banana Pro** | **Nano Banana 2.1** | **Nano Banana 2** | **Nano Banana 2 Lite** | **Nano Banana (第1世代)** |
| - | - | - | - | - | - |
| モデルID | `gemini-3-pro-image-preview` | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image-preview` | `gemini-3.1-flash-lite-image` | `gemini-2.5-flash-image` |
| 最大解像度 | 4K | 4K | 4K | 1K | 1K |
| リクエストあたり | \$0.09/req | \$0.045/req | \$0.055/req | \$0.025/req | \$0.02/req |
| トークンベース | ベータテスト中 | ✅ 利用可能 | ✅ 利用可能 | ✅ 利用可能 | ❌ 非対応 |
| 最大割引 | 公式の31.25% | 公式の33.2% | 公式の30.3% | 公式の40% | 公式の50% |

## Nano Banana Pro 料金

Model: `gemini-3-pro-image-preview`

### リクエストごとの課金

\$0.09 per request、1-4K 解像度向けの一律料金です。シンプルな課金で、4K 画像で大幅にお得です。

| 項目 | APIYI デフォルト | チャージ +10% | チャージ +20% | Google 公式 |
| - | - | - | - | - |
| 画像1枚あたりの価格 (\$) | \$0.09 | \$0.0818 | \$0.075 | \$0.24 |
| 画像1枚あたりの価格 (¥) | ¥0.63 | ¥0.573 | ¥0.525 | ¥1.68 |
| 公式比 | 37.5% | 34.0% | **31.25%** | / |

<Tip>
  4K 画像で最大 **68.75%** もお得です！リクエストごとの課金は解像度による区別がなく、4K でも 1K と同じ料金です。そのため、解像度が高いほど価値が高くなります。
</Tip>

### トークンベースの課金（まだ公開されていません、ベータ版利用可）

| 項目 | APIYI | Google 公式 |
| - | - | - |
| 入力 | \$0.88/M tokens | \$2/M tokens |
| 出力 | \$52.8/M tokens | \$120/M tokens |
| 公式比 | **44%** | / |

画像1枚あたりの推定コスト:

| 解像度 | APIYI の推定値 | Google の推定値 |
| - | - | - |
| 1-2K | \~\$0.075 | \~\$0.134 |
| 4K | \~\$0.11 | \~\$0.24 |

<Info>
  トークンベースのコストは、入力/出力の画像 token によって変動します。これらは推定値です。トークンベースの課金は 1-2K 画像に向いており、リクエストごとの課金は 4K に対してより費用対効果が高いです。
</Info>

## Nano Banana 2.1の料金

モデル: `gemini-nano-banana-2.1`（2026年10月6日リリース、Nano Banana 2のアップグレード版 — [Nano Banana 2.1 画像生成・編集](/ja/api-capabilities/gemini-nano-banana-2.1/overview)を参照）

### リクエスト単位の課金

1リクエストあたり\$0.045（2026年10月13日より\$0.05から値下げ）。1K〜4Kで同一料金のため、4K画像が最もお得です。

| 項目 | APIYI デフォルト | +10% チャージボーナス | +20% チャージボーナス | Google (4K) |
| - | - | - | - | - |
| 1画像あたり (\$) | \$0.045 | \$0.0409 | \$0.0375 | \$0.113 |
| 1画像あたり (¥) | ¥0.315 | ¥0.286 | ¥0.263 | ¥0.791 |
| Google比 | **39.8%** | **36.2%** | **33.2%** | / |

### tokenベースの課金

| 項目 | APIYI | Google |
| - | - | - |
| 入力 | \$0.66/M tokens | \$1.5/M tokens |
| 出力（画像、テキスト、推論を一律レートで課金） | \$13.2/M tokens | 画像 \$30/M、テキストおよび推論 \$7.5/M |
| Google比 | **44%**（画像レート比） | / |

tokenベース課金における1画像あたりの実測コスト（2026-10-07、デフォルトのthinking tokensを含む）：

| 解像度 | APIYI（実測値） | Google |
| - | - | - |
| 1K | \~\$0.026 | \~\$0.040 |
| 2K | \~\$0.035 | \~\$0.058 |
| 4K | \~\$0.062 | \~\$0.120 |

<Info>
  Nano Banana 2.1はデフォルトで推論を行うため、1画像ごとにおよそ400〜1300のthinking tokensが追加され、画像とともに出力レートで課金されます。そのため、1画像あたりのtokenベースのコストは変動します。1K / 2Kの場合はtokenベース課金の方が安く、4Kの場合はリクエスト単位（\$0.045）の方が安くなります。なお、512pxには対応していません。
</Info>

<Note>モデルの価格は公式サイトに連動しており、変更される場合があります。上記の表は参考用です。正式な価格情報はトップナビゲーションの**モデル料金**タブをご確認ください: [モデル料金](/en/models/index)。</Note>

## Nano Banana 2 の価格

モデル: `gemini-3.1-flash-image-preview`

### リクエスト単位の課金

\$0.055 / リクエストで、1〜4K解像度は統一価格です。

| 項目 | APIYI デフォルト | チャージ +10% | チャージ +20% | Google公式 |
| - | - | - | - | - |
| 画像ごとの価格 (\$) | \$0.055 | \$0.05 | \$0.0458 | \$0.151 |
| 画像ごとの価格 (¥) | ¥0.385 | ¥0.35 | ¥0.32 | ¥1.68 |
| 公式比 | **36.4%** | **33.1%** | **30.3%** | / |

### token ベースの課金

| 項目 | APIYI | Google公式 |
| - | - | - |
| 入力 | \$0.18/M tokens | \$0.5/M tokens |
| 出力 | \$21.6/M tokens | \$60/M tokens |
| 公式比 | **36%** | / |

画像ごとの推定コスト:

| 解像度 | APIYI の推定値 | Google公式 |
| - | - | - |
| 512px | \~\$0.024 | \$0.045 |
| 1K | \~\$0.03 | \$0.067 |
| 2K | \~\$0.036 | \$0.101 |
| 4K | \~\$0.06 | \$0.151 |

<Info>
  これらは、実際の入力/出力 token に基づく推定値です。チャージ特典（最大20%）と組み合わせると、さらに低コストになります。
</Info>

## Nano Banana 2 Lite の料金

モデル: `gemini-3.1-flash-lite-image`

最速・最安のティアで、1K キャンバスに特化し、1枚あたり約4秒です。**Pay-as-you-go Priority を優先**すると、実際の単価はより低く、予測しやすくなります。

### Token ベース課金（推奨）

| 項目 | APIYI | Google 公式 | 公式比 |
| - | - | - | - |
| 入力 | \$0.10/M tokens | \$0.25/M tokens | **40%** |
| 出力 | \$12/M tokens | \$30/M tokens | **40%** |

1枚あたりの推定コスト:

| 解像度 | APIYI の推定値 | Google 公式 |
| - | - | - |
| 1K | **\~\$0.018** | \~\$0.034 |

<Info>
  **実運用では予測しやすい**: token ベース（per-token）課金の 1K 画像は、**実運用では平均で約\$0.018/呼び出し**になります（一般的な範囲は約\$0.016–\$0.019 で、出力 tokens に左右されます）。これは固定の呼び出しごとの \$0.025/画像より安いです。チャージ特典と組み合わせると、さらに低コストにできます。
</Info>

### 呼び出しごとの課金

| 項目 | APIYI | Google 公式 | 注記 |
| - | - | - | - |
| 1枚あたりの料金 | \$0.025/req | \~\$0.034/image | 固定料金です。後で下がる可能性はありますが、現時点では変更なしです |

<Tip>
  **どの課金モードを選ぶべきですか?** Lite では、**`Pay-as-you-go Priority` を優先**してください。実運用では約\$0.018/呼び出しで、呼び出しごとの \$0.025 より安く、予測もしやすいです。また、1 token で Nano Banana Pro / 2 の呼び出しごとの課金にも対応し、シリーズ全体を動かせます。呼び出しごとの \$0.025/画像は固定料金で、後で下がる可能性はありますが、現時点では変更なしです。
</Tip>

## Nano Banana Gen 1 価格

Model: `gemini-2.5-flash-image`

1K画像のみ、1リクエストごとの固定課金です。

| 項目 | APIYI | Google公式 | 割引 |
| - | - | - | - |
| 画像あたりの価格 | \$0.02/req | \$0.039/req | **約50%オフ** |

チャージボーナスプロモーションも対象です。

## チャージボーナス

すでに割引された価格にチャージボーナスを重ねることで、さらにお得にご利用いただけます。

<CardGroup cols={2}>
  <Card title="チャージボーナスの詳細" icon="gift" href="/ja/faq/recharge-promotions">
    現在のチャージボーナスティアとプロモーションの詳細をご確認いただけます。
  </Card>

  <Card title="Token管理" icon="key" href="https://api.apiyi.com/token">
    API tokensの作成と管理を行えます。
  </Card>
</CardGroup>

## token種別選択ガイド

<Info>
  tokenを作成する際は、「Billing model」設定で課金方法が決まります。主な用途に合わせて選択してください:
</Info>

| Model | Use Case | Recommended Token Type |
| - | - | - |
| Nano Banana Pro | 1K〜4Kの混在利用 | tokenベース（優先） |
| Nano Banana Pro | 4Kのみ | リクエストごと |
| Nano Banana 2 | 0.5K〜4Kの混在利用 | tokenベース（優先） |
| Nano Banana 2 | 4Kのみ | リクエストごと |
| Nano Banana 2 Lite | 1K規模の生成 | tokenベース（優先） |

<Tip>
  **簡単なルール**: 4K画像を主に生成する場合は、**リクエストごとの課金**を選択してください（解像度にかかわらず価格は同じです）。混在解像度での利用では、**tokenベース課金**のほうが低解像度でよりお得です。
</Tip>

## 請求額の変動は価格の変更ではありません

同じモデルに対する2つの請求額は、価格の変更がなくても大きく異なる場合があります。**tokenベース課金**では、1回のリクエストのコストはパラメータによって変動します。実測における2大要因は以下のとおりです：

| パラメータ | 1回のリクエストの請求額への影響 | 適用対象 |
| - | - | - |
| 出力解像度 | 1Kから4K：約\*\*+90%\*\*（\$0.033 → \$0.064、Nano Banana 2での実測値。Proのtokenベースでは1-2Kから4Kで約+47%） | tokenベース課金のみ。2 Liteおよび第1世代は1Kを出力するため、適用されません |
| `thinkingLevel` | デフォルトティアから`high`：約\*\*+54%\*\* | Nano Banana 2 / 2 Liteのみ。Proは常に思考を行い、調整できません |

同一モデルにおいて、昨日約\$0.033だったリクエストが今日約\$0.052になった場合、それは通常、価格改定ではなくパラメータの違いを意味します。

<Info>
  ティアごとの実測値（tokens、コスト、レイテンシ）は、[Nano Banana 2 画像生成/編集](/ja/api-capabilities/nano-banana-2-image/overview)および[使用量フィールドと出力の解説](/ja/api-capabilities/nano-banana-usage-metadata)に記載されています。
</Info>

**予測可能なコストが必要な場合は、リクエスト単位の課金を選択してください**：解像度やtoken数に関わらず、1Kから4Kまで一律料金（Proは画像1枚あたり\$0.09、Nano Banana 2は\$0.055）となります。

## 関連ドキュメント

* [Nano Banana 2 Image Gen/Edit](/ja/api-capabilities/nano-banana-2-image/overview) - Nano Banana 2 の完全ガイド
* [Nano Banana Pro Image Generation](/en/api-capabilities/nano-banana-image) - Nano Banana Pro ガイド
* [Nano Banana Pro Image Editing](/en/api-capabilities/nano-banana-image-edit) - 画像編集機能
* [チャージ特典](/ja/faq/recharge-promotions) - チャージボーナスの詳細


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.