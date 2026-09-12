> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# token 課金モードの違いとは？

> API.YI の token における 5つの課金モード、利用シーン、およびベストプラクティスの詳しい解説

## 簡潔な回答

<Info>
  **推奨設定**: token を作成する際は、ほとんどのケースに適した **「従量課金優先」** の課金モードを選択してください。
</Info>

システムには 5 種類の課金方式がありますが、**「従量課金優先」をデフォルトにする** ことで、すべてのモデル呼び出し要件を満たせます。

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/Cic_8J3gmaYuqnbs/images/token-billing-modes.png?fit=max&auto=format&n=Cic_8J3gmaYuqnbs&q=85&s=0648c415db25659d45c57f46fab8ceb2" alt="Token 課金モードの選択" width="1272" height="888" data-path="images/token-billing-modes.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/Cic_8J3gmaYuqnbs/images/token-billing-modes.png?fit=max&auto=format&n=Cic_8J3gmaYuqnbs&q=85&s=0648c415db25659d45c57f46fab8ceb2" alt="Token 課金モードの選択" width="1272" height="888" data-path="images/token-billing-modes.png" />

## 5 課金モードの解説

### 1. 従量課金（token ベース）

**定義**: 入力と出力の **Tokens** 数に基づいて課金され、使った分だけ支払う方式です。

**適用モデル**:

* **テキスト生成モデル**: GPT-4、Claude、Gemini、DeepSeek など
* **マルチモーダル理解モデル**: 画像/音声入力をサポートするモデル
* **特殊画像モデル**: `gpt-image-1`（Tokens による課金）

**課金式**:

```
Total Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

**例**:

* `gpt-4o`: 入力 \$5/百万 tokens、出力 \$15/百万 tokens
* `claude-3-5-sonnet-20241022`: 入力 \$3/百万 tokens、出力 \$15/百万 tokens

<Tip>
  **gpt-image-1 の特記事項**: 画像生成モデルですが、Tokens で課金されます。Tokens に影響する要素には次が含まれます:

  * 画像解像度（1024x1024、1792x1024 など）
  * 画像品質（standard、hd）

  OpenAI は、解像度と品質ごとの token 消費量が異なる、詳細な課金表を提供しています。
</Tip>

***

### 2. 呼び出しごとの課金

**定義**: 1 回の呼び出しごとの **固定課金** で、入力と出力の Tokens に影響されません。

**適用モデル**:

* **画像生成モデル**: DALL-E、Flux、Sora Image など（gpt-image-1 を除く）
* **動画生成モデル**: Sora Video、VEO など

**課金式**:

```
Total Cost = Number of Calls × Price per Call
```

**例**:

* `gemini-3-pro-image-preview`（別名 `nano-banana-pro`）: \$0.09/回
* `sora_video2`: \$0.15/回（10 秒の動画）
* `flux-1.1-pro`: \$0.04/回

<Note>
  **呼び出しごとの課金の利点**:

  * 料金体系が明確で、生成 1 回あたりの費用が固定
  * Token 消費量を計算する必要がない
  * 画像/動画のような出力が固定のシナリオに適している
</Note>

***

### 3. ハイブリッド課金

**定義**: 従量課金と呼び出しごとの課金の両方に対応し、モデルに応じて自動的に選択されます。

**状態**: ⚠️ **適用外**

<Warning>
  現在、API.YI プラットフォームでは、課金の混乱を招く可能性があるため、「ハイブリッド課金」モードの使用は**推奨していません**。代わりに「従量課金優先」を使用してください。
</Warning>

***

### 4. 従量課金優先（推奨）

**定義**: モデルが両方に対応している場合は**従量課金を優先**し、そのモデルがそれしか対応していない場合は自動的に呼び出しごとの課金へ切り替える**スマート課金モード**です。

**推奨理由**:

* ✅ **呼び出しごとの課金を含む**: 呼び出しごとに課金される画像/動画モデルを呼び出せます
* ✅ **従量課金を含む**: 使用量に応じて課金されるテキスト/マルチモーダルモデルを呼び出せます
* ✅ **自動適応**: システムが最適な課金方法を自動で選択します
* ✅ **すべてのシナリオをカバー**: 400 以上のモデルに対応しています

**課金ロジック**:

```
If model supports pay-per-use → Use pay-per-use billing
If model only supports pay-per-call → Use pay-per-call billing
```

**シナリオ例**:

| モデル                          | 課金方法      | 説明                        |
| ---------------------------- | --------- | ------------------------- |
| `gpt-4o`                     | 従量課金      | テキストモデルなので、従量課金を優先        |
| `gpt-image-1`                | 従量課金      | 画像モデルだが、Tokens で課金        |
| `gemini-3-pro-image-preview` | 呼び出しごとの課金 | 画像モデルなので、呼び出しごとの課金へ自動切り替え |
| `sora_video2`                | 呼び出しごとの課金 | 動画モデルなので、呼び出しごとの課金へ自動切り替え |

<Info>
  **推奨理由**: 「従量課金優先」token を使うと、課金モードごとに別々の token を作成せずに、すべてのモデルを呼び出せます。
</Info>

***

### 5. 呼び出しごとの課金優先

**定義**: モデルが両方に対応している場合は**呼び出しごとの課金を優先**し、そのモデルがそれしか対応していない場合は自動的に従量課金へ切り替えます。

**適用シナリオ**:

* 固定費が必要なシナリオ
* 主に画像/動画生成モデルを使用する場合

**課金ロジック**:

```
If model supports pay-per-call → Use pay-per-call billing
If model only supports pay-per-use → Use pay-per-use billing
```

<Note>
  **利用のおすすめ**: 明確なコスト管理要件がない限り、「従量課金優先」を使用してください。テキストモデルは通常、従量課金のほうがコスト効率に優れています。
</Note>

***

## 課金モードの選び方は？

### 推奨解決策（95％のユーザーに適しています）

<Card title="従量課金優先（デフォルト推奨）" icon="star">
  **適用シナリオ**:

  * テキスト、画像、動画モデルを同時に使用する
  * モデルごとに異なる token を作成したくない
  * 最大限の柔軟性が必要

  **利点**:

  * 400以上のすべてのモデルをカバー
  * システムが自動的に最適な課金方法を選択
  * 追加設定は不要
</Card>

### 特殊なシナリオ

<Tabs>
  <Tab title="純テキストアプリケーション">
    **シナリオ**: GPT、Claude、Gemini などのテキストモデルのみを使用する

    **推奨課金モード**: 従量課金優先 または 従量課金

    **理由**: テキストモデルはいずれも従量課金制を使用するため、どちらのモードでも同じ効果です
  </Tab>

  <Tab title="純画像/動画アプリケーション">
    **シナリオ**: DALL-E、Flux、Sora などの生成モデルのみを使用する

    **推奨課金モード**: 従量課金優先 または 呼び出し課金優先

    **理由**: ほとんどの画像/動画モデルは呼び出し課金を使用しますが、「従量課金優先」は自動適応できます

    **注意**: `gpt-image-1`を使用する場合は、「従量課金優先」または「従量課金」を使用する必要があります
  </Tab>

  <Tab title="コスト管理">
    **シナリオ**: 予算を厳密に管理し、1回ごとの固定費用にしたい

    **推奨課金モード**: 呼び出し課金 または 呼び出し課金優先

    **理由**: 呼び出し課金は価格が固定で、コスト予測がしやすい

    **制限**: テキストモデル（GPT-4、Claude など）は呼び出せません
  </Tab>
</Tabs>

***

## よくある質問

<AccordionGroup>
  <Accordion title="なぜ gpt-image-1 には pay-per-use token が必要なのですか？">
    `gpt-image-1` は OpenAI の公式画像生成モデルです。画像を生成しますが、課金方式はテキストモデルに近く、**Tokens 単位で課金**されます。

    **課金要因**:

    * 画像解像度（1024x1024 は約 5000 tokens を消費し、1792x1024 は約 8500 tokens を消費します）
    * 画像品質（HD 品質では Token 消費が増えます）

    **解決策**:

    * 「Pay-per-Use Priority」または「Pay-per-Use」token を使用する
    * 「Pay-per-Call」token を使用すると、`gpt-image-1` を呼び出せなくなります
  </Accordion>

  <Accordion title="すでに pay-per-call token を作成しましたが、pay-per-use priority に変更できますか？">
    **はい、変更できます**。手順:

    1. [API.YI トークン管理ページ](https://api.apiyi.com/token) にログインする
    2. 該当する token を見つけ、右側の「編集」ボタンをクリックする
    3. 「課金モード」ドロップダウンメニューで「Pay-per-Use Priority」を選択する
    4. 設定を保存する

    **注意**: 変更は即時に反映され、既存の残高には影響しません。
  </Accordion>

  <Accordion title="pay-per-use priority と pay-per-call priority の違いは何ですか？">
    **優先順位の違い**:

    | 課金モード                 | モデルが pay-per-use と pay-per-call の両方をサポートしている場合 | 適用シナリオ              |
    | --------------------- | ---------------------------------------------- | ------------------- |
    | Pay-per-Use Priority  | pay-per-use 課金を優先する                            | 主にテキストモデル、時々 画像/動画  |
    | Pay-per-Call Priority | pay-per-call 課金を優先する                           | 主に 画像/動画、時々 テキストモデル |

    **推奨**: ほとんどの場合は「Pay-per-Use Priority」を使用してください。
  </Accordion>

  <Accordion title="課金モードを誤って選ぶと、呼び出しは失敗しますか？">
    **すぐに失敗するわけではありませんが、特定のモデルは呼び出せない場合があります**。

    **例**:

    * token が「Pay-per-Call」の場合、`gpt-4o` の呼び出しは失敗します（gpt-4o は pay-per-use 課金のみ対応しているため）
    * token が「Pay-per-Use」の場合、`gemini-3-pro-image-preview` の呼び出しに失敗する場合があります（このモデルは pay-per-call 課金のみ対応しているため）

    **解決策**: この問題を避けるには「Pay-per-Use Priority」を使用してください。
  </Accordion>

  <Accordion title="なぜハイブリッド課金は適用できないのですか？">
    **ハイブリッド課金** は理論上、pay-per-use と pay-per-call の両方をサポートしますが、実際には次の問題を引き起こす可能性があります:

    * 課金ロジックが不明瞭になる
    * コスト予測が難しくなる
    * システム互換性の問題が発生する

    **代替案**: 「Pay-per-Use Priority」を使用すると、より高い安定性と信頼性で同じ効果を得られます。
  </Accordion>
</AccordionGroup>

***

## 概要と推奨事項

| 課金モード      | 推奨    | 適用シナリオ                  | モデル対応範囲                  |
| ---------- | ----- | ----------------------- | ------------------------ |
| **従量課金優先** | ⭐⭐⭐⭐⭐ | すべてのシナリオ（デフォルト推奨）       | 全400以上のモデル               |
| 従量課金       | ⭐⭐⭐   | 純粋なテキスト/マルチモーダルアプリケーション | テキストモデル + gpt-image-1    |
| 呼び出し課金     | ⭐⭐⭐   | 純粋な画像/動画アプリケーション        | 画像/動画モデル（gpt-image-1を除く） |
| 呼び出し課金優先   | ⭐⭐    | 主に画像/動画を使用する場合          | 全400以上のモデル               |
| ハイブリッド課金   | ❌     | 推奨しません                  | 課金の混乱を招く可能性があります         |

<Info>
  **ベストプラクティス**: token を作成する際は、すべての利用シナリオをカバーするために「**従量課金優先**」課金モードを選択し、モデルごとに異なる token を作成しないようにしてください。
</Info>

## 関連ドキュメント

* [KEY の作成方法](/ja/faq/token-management)
* [トークンに利用可能なモデルを設定する必要がありますか？](/ja/faq/token-model-whitelist)
* [料金](/ja/pricing)
* [モデル一覧](/ja/api-capabilities/model-info)
