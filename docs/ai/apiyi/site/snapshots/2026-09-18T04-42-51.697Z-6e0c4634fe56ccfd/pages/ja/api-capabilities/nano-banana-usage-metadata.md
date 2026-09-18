> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 使用フィールドと出力の解説

> gemini-3-pro-image のレスポンス JSON 構造と usageMetadata フィールドを理解し、異常に見えるもののモデル固有の 3 つのカウント挙動を把握します

このページは、APIYI 経由で `gemini-3-pro-image`（Nano Banana Pro）を呼び出す開発者向けです。レスポンス JSON の出力構造と、各 `usageMetadata` フィールドが実際に何を意味するのかを説明し、**異常に見えるもののモデルに固有の** いくつかのカウント挙動を明確にします。ここでの結論はすべて、本番ゲートウェイに対するテスト（テキストから画像への生成 48 件 + 画像編集 18 件）と Google の公式ドキュメント（`ai.google.dev/gemini-api/docs/image-generation`）との照合に基づいており、推測ではありません。

## レスポンス全体の構造

APIYI の Nano Banana シリーズは Google ネイティブ形式を使用します。レスポンスには常に 4 つの最上位フィールドがあります。

```json theme={null}
{
  "candidates":    [ ... ],          // generation results (image/text parts)
  "usageMetadata": { ... },          // token usage
  "modelVersion":  "gemini-3-pro-image",
  "responseId":    "..."
}
```

### 生成が成功した場合

```json theme={null}
"candidates": [{
  "content": {
    "role": "model",
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }
    ]
  },
  "finishReason": "STOP",
  "index": 0
}]
```

<Warning>
  **parts には複数の画像が含まれる場合があります。** 「4-view character sheet」のような複雑なタスク形式の prompt（複数制約のタスク）では、モデルが 1 つのレスポンス内で複数の画像 parts を返すことがあります（テストでは 2〜10 個を確認）— それらはモデルの「Thinking プロセス」における途中ドラフトと最終版です。Google のドキュメントでは、「Thinking 内の最後の画像が最終レンダリング画像でもある」とされているため、**最後のものだけを取得してください**。純粋な text-to-image や、簡単な編集（アクセサリーの追加／背景の変更／スタイル変更）では、通常 1 つだけ返されます。どちらの場合でも、1 枚だけ必要なときは parts を順に処理し、最後の `inlineData` を取得してください。詳細は [Dev Guide · Why Do Responses Occasionally Contain Multiple Images](/ja/api-capabilities/nano-banana-dev-guide#why-do-responses-occasionally-contain-multiple-images) を参照してください。
</Warning>

#### parts にはテキストセグメントも含まれる場合があります

上の例では、単一の画像セグメントを保持する `parts` 配列を示していますが、**その構造は保証されません**。`parts` は異種配列であり、テストでは次の 3 つのレイアウトが確認されています。

| parts のレイアウト          | 長さ | 画像インデックス |
| --------------------- | -- | -------- |
| `inlineData`          | 1  | `0`      |
| `text` + `inlineData` | 2  | **`1`**  |
| `inlineData` + `text` | 2  | **`0`**  |

`responseModalities` に `TEXT` を含める場合、またはモデルに自己説明を求める prompt を指定した場合、レスポンスにテキストセグメントが追加されます。また、それが画像の前後どちらに来るかも固定ではありません。**つまり、画像が置かれるインデックスは一定ではありません。**

<Warning>
  2 つのハードコードされたインデックスのパターンは**相補的**です: 画像は常に `[0]` か `[1]` のどちらかに入るため、どちらか一方をハードコードすると、画像が返らないリクエストが残ってしまいます。正しい方法については、下の **パースと照合のベストプラクティス** セクションを参照してください。ハードニング対策として、`generationConfig` に `responseModalities: ["IMAGE"]` を宣言して、画像だけがほしいことを明示することもできますが、フィルタリングの代わりには**なりません**。
</Warning>

### 安全ポリシーによりブロックされた場合

HTTP ステータスコードは**引き続き 200** です。違いは candidate の中にあります。

```json theme={null}
"candidates": [{
  "content": { "parts": null },        // ⚠️ parts is null, not an empty array
  "finishReason": "IMAGE_SAFETY",      // or NO_IMAGE / PROHIBITED_CONTENT
  "finishMessage": "Unable to show the generated image. ...",  // only present in some cases
  "index": 0
}]
```

* テストでは 3 つの `finishReason` 値が確認されました: `IMAGE_SAFETY`（出力画像がポリシーに違反している）、`PROHIBITED_CONTENT`（禁止用途ポリシーがトリガーされ、説明用の `finishMessage` が返される）、および `NO_IMAGE`（画像は生成されず、通常は数秒以内に返される）。
* 拒否の説明は `finishMessage` フィールドにあります — `parts` 内のテキスト part としては表示されません。
* パース処理では、`parts` が `null` である場合に対応する必要があります。そうしないと、ブロックされたレスポンスでクラッシュします。

<Tip>
  失敗診断、コンテンツモデレーションポリシー、ユーザーフレンドリーなメッセージング戦略については、[Gemini Image Error Handling Guide](/ja/api-capabilities/gemini-image-error-handling) を参照してください。
</Tip>

## usageMetadata フィールドの意味

成功した生成には常に 6 つのフィールドがあります:

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 615,          // total input tokens (text + input images)
  "candidatesTokenCount": 2478,     // total output tokens (images + internal generation tokens)
  "thoughtsTokenCount": 208,        // thinking (reasoning) tokens
  "totalTokenCount": 3301,          // total billed amount for this request
  "promptTokensDetails":     [ { "modality": "TEXT",  "tokenCount": 99 },
                               { "modality": "IMAGE", "tokenCount": 516 } ],
  "candidatesTokensDetails": [ { "modality": "IMAGE", "tokenCount": 2240 } ]
}
```

| フィールド                     | 意味                      | 信頼性                                                          |
| ------------------------- | ----------------------- | ------------------------------------------------------------ |
| `promptTokenCount`        | 入力側合計                   | ✅ 常に `promptTokensDetails` の合計と一致します                         |
| `candidatesTokenCount`    | 出力側合計                   | ✅ 課金対象の数値です。**ただし、詳細の合計より大きくなります — 下の挙動 1 を参照してください**        |
| `thoughtsTokenCount`      | 推論 token、テストでは通常 50–350 | ✅                                                            |
| `totalTokenCount`         | 総合計                     | ✅ 成功した生成では、常に直前の 3 つの合計と一致します。**拒否は例外です — 下の挙動 2 を参照してください** |
| `promptTokensDetails`     | モダリティ別入力内訳              | ✅ 完全な内訳                                                      |
| `candidatesTokensDetails` | モダリティ別出力内訳              | ⚠️ **画像部分のみをカバーします — 完全な内訳ではありません**                          |

**画像 token はアスペクト比ではなく解像度ティアで決まります**: **1K と 2K の両ティアでは 1 画像あたり 1120 tokens**、**4K では 1 画像あたり 2000 tokens** です。アスペクト比はピクセル寸法を変えるだけで、token 数は決して変わりません。1 回のレスポンスで N 枚の画像が返る場合、詳細はちょうど N × 1 画像あたりの値になります。

下の表は Google の公式 Pro Image のアスペクト比と画像サイズの参照表です（出典: `ai.google.dev/gemini-api/docs/image-generation`）。`gemini-3-pro-image` の計測結果とも完全に一致します:

| アスペクト比 | 1K サイズ    | 1K token 数 | 2K サイズ    | 2K token 数 | 4K サイズ    | 4K token 数 |
| ------ | --------- | ---------- | --------- | ---------- | --------- | ---------- |
| 1:1    | 1024x1024 | 1120       | 2048x2048 | 1120       | 4096x4096 | 2000       |
| 2:3    | 848x1264  | 1120       | 1696x2528 | 1120       | 3392x5056 | 2000       |
| 3:2    | 1264x848  | 1120       | 2528x1696 | 1120       | 5056x3392 | 2000       |
| 3:4    | 896x1200  | 1120       | 1792x2400 | 1120       | 3584x4800 | 2000       |
| 4:3    | 1200x896  | 1120       | 2400x1792 | 1120       | 4800x3584 | 2000       |
| 4:5    | 928x1152  | 1120       | 1856x2304 | 1120       | 3712x4608 | 2000       |
| 5:4    | 1152x928  | 1120       | 2304x1856 | 1120       | 4608x3712 | 2000       |
| 9:16   | 768x1376  | 1120       | 1536x2752 | 1120       | 3072x5504 | 2000       |
| 16:9   | 1376x768  | 1120       | 2752x1536 | 1120       | 5504x3072 | 2000       |
| 21:9   | 1584x672  | 1120       | 3168x1344 | 1120       | 6336x2688 | 2000       |

<Note>
  Google の公式表では、列見出し `1K tokens` は「1K 解像度ティアの token 数」を意味します — 実際の 1 画像あたりの token 数はセルの値です: 1K/2K では 1 画像あたり 1120、4K では 2000 です。（そのページの中国語ローカライズでは見出しが「1,000 tokens」と表記されており、1 画像あたりの数と誤読しやすいです。）また、512px ティア（1 画像あたり 747 tokens）は Flash 画像モデルにのみ存在します — `gemini-3-pro-image` は 1K/2K/4K のみをサポートし、Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）は特殊ケースです — 512px はなく、**1K** ティアのみです。
</Note>

## 異常に見える 3 つの挙動

### 挙動 1: candidatesTokenCount ≠ candidatesTokensDetails の合計 — 正常かつ不可避

テストでは、サンプルの **100%**（成功した生成 49/49）で、`candidatesTokenCount` が詳細の合計を **88–630 tokens** 上回っていました（prompt が複雑で返却される画像が多いほど、差は大きくなります）。

理由: `candidatesTokensDetails` は **image payload そのもの**（1 画像あたり固定 1120/2000）だけを数えますが、`candidatesTokenCount` には image generation プロセスと同時に生成される内部 token も含まれます。これらには対応するモダリティエントリがありません。これは Gemini のネイティブなカウント規則であり、APIYI はそのまま通しています。

<Info>
  **要するに: 検証のために、details を `candidatesTokenCount` の完全な内訳として扱わないでください。照合と課金では、常に `candidatesTokenCount` / `totalTokenCount` を使用してください。details は image の割合を見積もるのにしか役立ちません。**
</Info>

### 挙動 2: totalTokenCount ≠ prompt + candidates + thoughts — 画像出力のないレスポンスでのみ発生

* 成功した生成では、この式は **厳密に成り立ちます**（49/49）: `total = promptTokenCount + candidatesTokenCount + thoughtsTokenCount`。
* 安全ブロックされたレスポンス（画像出力なし）では、この式は **決して成り立ちません**（6/6）。固定パターンは次のとおりです:

```text theme={null}
candidatesTokenCount == thoughtsTokenCount     // thinking tokens are written into both fields
totalTokenCount == promptTokenCount + thoughtsTokenCount   // total counts them once — this is correct
```

拒否レスポンスでは、`candidatesTokenCount` は `thoughtsTokenCount` と同じになり、そのため 3 つのフィールドを合計すると thinking token を二重計上してしまいます。これも upstream に固有の挙動です。**`totalTokenCount` 自体は正確です — そのまま直接使ってください。** ログ内のレスポンスの約 10% が「釣り合わない」場合は、それらのレスポンスの `parts` が空かどうかを確認してください — ほぼ確実に安全ブロックされたサンプルです。

### 挙動 3: output token がときどき 6000+ に達する — thinking プロセスの複数 image part が原因

Google の公式 docs では、Gemini 3 の image model は thinking model であるとされています: 「Thinking」はデフォルトで有効で、API では無効化できません。model は構図とロジックを検証するために途中 image を生成し、「Thinking 内の最後の image が最終的にレンダリングされる image でもある」とされています（出典: `ai.google.dev/gemini-api/docs/image-generation` の Thinking Process セクション）。

私たちのテストでは、これらの途中 thinking draft はネイティブな `generateContent` レスポンス内で **通常の image part** として返ってきます。各 part には `thoughtSignature` フィールドがありますが `thought: true` フラグはなく、**それぞれが `candidatesTokensDetails` では 1120 tokens としてカウントされます**。Google の docs では Thinking が生成する途中 image は最大 2 枚とされていますが、複雑な task-style prompt では 1 回のレスポンスで最大 **10 image parts** を確認しました。使用量は image 数に対して厳密に線形に増加します:

| 返却された画像         | candidatesTokensDetails | candidatesTokenCount | totalTokenCount |
| --------------- | ----------------------- | -------------------- | --------------- |
| 1（テキストから画像, 1K） | 1120                    | \~1210–1275          | \~1350–1450     |
| 2               | 2240                    | \~2500               | \~3300          |
| 3               | 3360                    | \~3800               | \~4600          |
| 4               | 4480                    | \~5000               | \~5900          |
| 5               | 5600                    | \~6200               | \~7000          |
| 10              | 11200                   | \~12700              | \~13500         |

`thoughtsTokenCount` フィールドは **text thinking** だけをカウントし、テストでは 400 を超えることはありませんでした — 高い output token の原因は、このフィールドではなく image part の数です。6000+ あるいは 5 桁の output token を見たら、そのレスポンス内の part 数を確認してください — それはほぼ確実に multi-image レスポンスであり、正常な課金です（それでも `totalTokenCount` とは照合してください）。

## Thinking Levels と 2つの API パラダイム

### thinkingLevel が token に与える影響

thinking レベル制御は **Gemini 3.1 Flash 画像 / Flash Lite 画像**（`generationConfig.thinkingConfig.thinkingLevel`、デフォルト `minimal`、または `high`）でのみサポートされています。`gemini-3-pro-image` では thinking は常に有効で、調整できません。計測結果は次のとおりです（同一 prompt、1K text-to-image、APIYI ゲートウェイ経由）:

| モデル / 設定                                   | thoughtsTokenCount              | Image tokens | totalTokenCount | Latency  |
| ------------------------------------------ | ------------------------------- | ------------ | --------------- | -------- |
| gemini-3.1-flash-image · minimal (default) | field absent                    | 1120         | \~1534–1554     | \~12–13s |
| gemini-3.1-flash-image · high              | 700–792                         | 1120         | \~2243–2375     | \~18–23s |
| gemini-3-pro-image · high passed in        | 181–214 (same as default range) | 1120         | \~1427–1471     | \~23s    |

* **`high` は thinking token と Latency だけを増やし、image token は変わりません**（image 1枚あたり引き続き 1120 です）。
* `thinkingLevel` を `gemini-3-pro-image` に渡してもエラーにはなりませんが、測定可能な効果はありません。thinking token はデフォルト範囲のままです。
* `includeThoughts: true` はテストでは response 構造も billing も変えませんでした。Google は、thinking process を表示するかどうかに関係なく、thinking token はデフォルトで課金対象になると明示しています。
* Google はまた、「minimal thinking は model がまったく thinking しないことを意味するわけではない」と述べています。`minimal` では、usage から separate な `thoughtsTokenCount` field が表示されなくなるだけです。

<Info>
  Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）は Nano Banana 2 と同じ 3.1 Flash ファミリーに属し、`thinkingLevel` 制御もサポートしています。動作の仕組みは上の表と同じですが、まだ個別には計測されておらず、表にも含まれていません。料金の詳細は、[Nano Banana Series Pricing](/ja/api-capabilities/nano-banana-pricing) をご覧ください。
</Info>

### 画像モデルの thinking token とテキストモデルの違い

* **テキスト thinking モデル**: thinking output は text で、`thoughtsTokenCount` は数千に達することがあり、output-token 価格で課金されます。公式には、pricing は model が生成する **full internal thoughts** に基づいており、API が返すのは thought の要約だけです（出典: `ai.google.dev/gemini-api/docs/thinking` の pricing セクション）。
* **画像 thinking モデル**: thinking は 2 種類の output を生成します。1つは `thoughtsTokenCount` にカウントされる少量の **text thinking**（計測結果: Pro では最大 400、Flash では `high` で約 800）で、もう1つは **interim draft images** です。これらは通常の image part として返され、`candidatesTokenCount` に 1枚あたり 1120/2000 token で課金されます。したがって image model では、「thinking のコスト」は主に image part の数として現れ、`thoughtsTokenCount` field にはあまり現れません（上の Behavior 3 を参照）。

### 2つの API パラダイム

Google の image-model ドキュメントは現在、従来の **generateContent API**（stateless）と、新しく推奨される **Interactions API**（agent と tools 向け）という 2 つの形式があります。APIYI ゲートウェイは **Google ネイティブの generateContent 形式**を使用しており、このページの内容はすべてそれに基づいています。thinking に関する違いは次のとおりです。

|                             | generateContent（このページ）                                                                    | Interactions API                                               |
| --------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Thinking-level parameter    | `generationConfig.thinkingConfig.thinkingLevel`                                           | `generation_config.thinking_level`                             |
| response 内の thought content | `includeThoughts` switch（画像モデルではテスト上 visible な影響なし。interim draft は常に通常の image part として返る） | `steps`（`type: "thought"`）として明示的に返る。includeThoughts switch はない |
| usage field 名               | `thoughtsTokenCount` / `candidatesTokenCount` / `totalTokenCount`                         | `total_thought_tokens` / `total_output_tokens`                 |

2つのパラダイムの完全な比較（endpoint、state management、data retention、および APIYI ゲートウェイ互換性テスト）については、[Interactions API vs generateContent](/ja/api-capabilities/gemini/interactions-api) をご覧ください。

## パースと照合のベストプラクティス

```python theme={null}
data = resp.json()
cand = (data.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []   # handles parts=null

# Select by field shape — never by parts[0] / parts[1]; a text segment may come first
images = [p["inlineData"] for p in parts if "inlineData" in p]
if images:
    final_image = images[-1]["data"]          # last one is the final version
    mime = images[-1]["mimeType"]             # trust the response; don't hardcode image/png
else:
    reason = cand.get("finishReason")         # IMAGE_SAFETY / NO_IMAGE / PROHIBITED_CONTENT
    message = cand.get("finishMessage", "")   # may be empty
```

1. **課金を`totalTokenCount`と照合してください**（拒否の場合でも正確です）；3つのフィールドを自分で合計したり、詳細を合計したりして検証しないでください。
2. **パーツを反復処理してください — 単一の画像だと決めつけないでください**。画像ごとのビジネスロジックは、実際の`inlineData` パーツ数に基づいて行ってください。
3. **`parts = null` + HTTP 200 でブロックされたレスポンスを処理し、`finishReason` に応じて分岐してください**。
4. 簡単な編集には約22〜25秒かかります。複雑なタスク（複数画像のレスポンス）には35〜142秒かかり、画像が増えるほどさらに長くなります。クライアントのタイムアウトは、プロキシ層を含めて5分以上に設定してください。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Nano Banana 開発ガイド" icon="book-open" href="/ja/api-capabilities/nano-banana-dev-guide">
    統合方法、入力画像要件、課金の基本、タイムアウト設定、そして複数画像の解説
  </Card>

  <Card title="エラーハンドリングガイド" icon="triangle-alert" href="/ja/api-capabilities/gemini-image-error-handling">
    生成失敗を診断するための3つの重要な指標、コンテンツモデレーションポリシー、そして親しみやすい prompt 戦略
  </Card>

  <Card title="生成失敗保証プラン" icon="shield-check" href="/ja/api-capabilities/nano-banana-pro-guarantee">
    入力に起因しない失敗については、失敗したリクエスト数に応じてクレジットが返還されます
  </Card>

  <Card title="Nano Banana 料金" icon="badge-dollar-sign" href="/ja/api-capabilities/nano-banana-pricing">
    解像度とモデル階層ごとの1画像あたりの料金
  </Card>
</CardGroup>
