> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# モデルの「レート倍率」とは何ですか？

> API.YI におけるモデルの倍率の意味、計算ルール、公式価格との関係を理解します。

## 簡単な回答

<Info>
  **倍率は、価格を計算するための業界標準の方法です。** 倍率を気にしたくない場合は、モデル一覧の **価格** 列をご確認ください。料金はUSDでご請求します。すべてのモデル料金を見る: [Model Pricing](https://api.apiyi.com/modelPricing)
</Info>

## 料金戦略

| モデル種別                   | 料金ルール          | 割引                                               |
| ----------------------- | -------------- | ------------------------------------------------ |
| **テキスト / マルチモーダル LLMs** | 公式料金と同じ        | [チャージボーナス](/ja/faq/recharge-promotions) + グループ割引 |
| **画像 / 動画モデル**          | 呼び出しごとの料金、特別料金 | [モデル料金](https://api.apiyi.com/modelPricing) を参照  |

<Tip>
  テキストモデルの割引には2種類あります: **チャージボーナスキャンペーン**（チャージ時の追加クレジット）と **グループ割引**（例: 国内モデルを別グループに分けて0.88倍の割引）。
</Tip>

## テキストモデルの課金

1回あたりのコスト = **Input Tokens × 入力価格 + Output Tokens × 出力価格**

詳細な課金情報については、[Pricing](/ja/pricing)をご覧ください。

## 基本概念

理解しておくべき重要な用語は2つあります:

| システム用語         | 意味        |
| -------------- | --------- |
| **Prompt**     | 入力 Tokens |
| **Completion** | 出力 Tokens |

## レート倍率の計算ルール

レート倍率は、実際の価格を算出するために使う相対値です。

* **Prompt レート倍率 × 2** = 入力価格（USD / 百万 Tokens）
* **Completion レート倍率** = 出力価格 ÷ 入力価格（つまり、出力が入力に対して何倍のコストになるか）

## Example Calculation

Using `claude-opus-4-6` を例にすると:

| Item | Multiplier         | Calculation       | Final Price               |
| ---- | ------------------ | ----------------- | ------------------------- |
| 入力   | prompt倍率 **2.5**   | 2.5 × 2 = 5       | **\$5 / million Tokens**  |
| 出力   | Completion倍率 **5** | 5 × 5 (入力価格) = 25 | **\$25 / million Tokens** |

この式を使うと、API.YI の料金は公式の料金と完全に一致します。

## 画像 / 動画モデルの課金

画像および動画モデルは、**1回ごとの課金**を採用しており、一部のモデルには特別割引レートが適用されます。具体的な価格については、ダッシュボードの [モデル料金](https://api.apiyi.com/modelPricing) ページを確認してください。

## 概要

* 倍率は、**業界標準**の料金計算方法です
* 倍率を理解しなくてもサービスを使えます。**料金**列を確認するだけで十分です
* **テキストモデル**は公式の料金と一致します。チャージボーナスとグループ割引で割引されます
* **画像/動画モデル**は呼び出しごとに特別料金で課金されます — [モデル料金](https://api.apiyi.com/modelPricing)
