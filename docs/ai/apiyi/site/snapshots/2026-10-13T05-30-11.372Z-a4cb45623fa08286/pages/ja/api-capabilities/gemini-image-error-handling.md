> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 画像生成 API エラーハンドリングガイド

> gemini-3-pro-image-preview（Nano Banana Pro）の生成失敗に関する3つの重要な診断指標、Google のコンテンツモデレーションポリシー、そして開発者が技術的なエラーを実行可能なユーザープロンプトへ変換しやすくするための、ユーザー向けメッセージング戦略です。

## 概要

`gemini-3-pro-image-preview`（すなわち Nano Banana Pro）は厳格なコンテンツ安全制御を適用しており、複数の層で非準拠のリクエストを拒否します。単純な「generation failed」メッセージでは、ユーザーは問題を理解しにくいです。適切なエラーハンドリングには、次の内容が必要です。

* **拒否理由を正確に特定する** — コンテンツ違反、ナレッジベースの制限、技術的なエラーを区別する
* **ユーザーフレンドリーなメッセージを提供する** — 技術的なエラーを理解しやすい説明に変換する
* **実行可能な提案を示す** — リクエストをどう調整すれば成功しやすいかをユーザーに伝える
* **完全な技術詳細を保持する** — 開発者のデバッグ用に

<Info>
  リクエストが **HTTP 200 なのに画像が返らない** 場合、これは通常、Google 側で行われた安全性判断です。APIYI の透過プロキシは結果をそのまま転送するだけです。私たちもお客様に画像を正常に生成してほしいと考えています。検出とメッセージングのロジックは、アプリケーション側で実装する必要があります。
</Info>

## Google コンテンツモデレーションポリシー（2026年更新）

Googleの画像生成は、**二層の安全メカニズム**を使用しています:

1. **設定可能なフィルター**: ハラスメント、ヘイトスピーチ、露骨な性的コンテンツ、危険なコンテンツの4カテゴリを対象とし、`safetySettings`で調整可能です
2. **組み込みの保護**: 児童の安全などの中核的な危害に対して常に有効で、**パラメータで無効化することはできません**

明示的に禁止されているコンテンツには、児童性的虐待および搾取（CSAE）、暴力的過激主義／テロリズム、非同意の親密画像（NCII）、自傷行為、露骨な性的コンテンツ、ヘイトスピーチ、ハラスメントといじめが含まれます。

<Warning>
  **2026年2月に Nano Banana 2 がリリースされた後、Googleは人物と著作権に関するポリシーを大幅に厳格化し、以下の頻出拒否シナリオを追加・強化しました**（データは2026年5月時点（UTC+8））:

  * **公人／セレブリティ**: フォトリアルで、識別可能な実在人物
  * **顔入れ替え（faceswap）**
  * **実在人物の再着せ替え／顔の改変**
  * **金銭情報または注文情報の改ざん**
  * **著名なIP**（Disney など、2026年1月23日以降）
  * **透かしの削除**および**未成年**に関連するコンテンツ

  引き続き許可されているもの: 架空のキャラクター、スタイライズされたポートレート、イラスト風の人物。
</Warning>

Googleの公式ポリシー文書（コピーしてご自身でアクセスしてください）:

* 生成AI禁止使用ポリシー: `policies.google.com/terms/generative-ai/use-policy`
* 生成コンテンツの一般的なエラー参照: `ai.google.dev/api/generate-content`

## 3つのコア診断指標

**優先度の高い順**に確認してください：

### 1. candidatesTokenCount（最優先）⭐

* **位置**: `response.usageMetadata.candidatesTokenCount`
* **意味**: APIによって生成された候補コンテンツの token 数
* **ルール**: `0` の値は、リクエストが**コンテンツモデレーション段階で即座に拒否された**こと（候補コンテンツが一切生成されなかったこと）を意味します。これは最も厳格な拒否です。

```json theme={null}
{
  "candidates": null,
  "usageMetadata": {
    "promptTokenCount": 271,
    "candidatesTokenCount": 0,
    "totalTokenCount": 271
  }
}
```

<Note>
  `candidatesTokenCount` が `0` である場合、必ずしもポリシー違反を意味するわけではありません。以下の他の2つの一般的なケースを区別する必要があります：

  * **レスポンスに `promptFeedback.blockReason` が存在し、`candidates` がない場合**: 生成前のプロバイダーによるチェックで入力がブロックされました。`OTHER` は多くの場合、1枚の参照画像によってトリガーされます。[blockReason: OTHER のトラブルシューティング](/ja/faq/gemini-image-input-blocked) を参照してください
  * **`finishReason` が `NO_IMAGE` の場合**: 通常、prompt がモデルに提案や分析の記述を求めているため、画像の意図が不明確になっています。[NO\_IMAGE トラブルシューティング](/ja/faq/gemini-no-image) を参照してください
</Note>

### 2. finishReason（第2優先）

* **位置**: `response.candidates[0].finishReason`
* **ルール**: `STOP` 以外の値は、特別な処理が必要な異常完了を示します

最新の画像関連の `finishReason` の値（Nano Banana シリーズでは `IMAGE_` プレフィックスが付いた画像専用の値が追加された点に注意してください）：

| finishReason | 意味 | ユーザー向けメッセージ |
| - | - | - |
| `STOP` | 正常完了 | - |
| `IMAGE_SAFETY` | 出力側の画像セーフティフィルター | コンテンツが画像セーフティポリシーに抵触しました |
| `PROHIBITED_CONTENT` / `IMAGE_PROHIBITED_CONTENT` | 禁止コンテンツ | コンテンツがセーフティポリシーに違反したため拒否されました |
| `SAFETY` | セーフティフィルター | コンテンツがセーフティフィルターに抵触しました |
| `RECITATION` / `IMAGE_RECITATION` | 引用／著作権の制限 | コンテンツに著作権の問題が含まれている可能性があります |
| `IMAGE_OTHER` / `NO_IMAGE` | 画像なし／その他 | 画像を生成できませんでした。prompt を調整して再試行してください |
| `MAX_TOKENS` | 長さ超過 | コンテンツの長さが制限を超えています |

### 3. テキストによる拒否説明（重要）

* **位置**: `response.candidates[0].content.parts[].text`
* **ルール**: `finishReason` が `STOP` であるにもかかわらず、`parts` に `text` のみが含まれ画像データが含まれていない場合、API は画像ではなく**拒否の説明**を返しています。テキストは中国語または英語の場合があります（例）：

```text theme={null}
我不能为你创建带有色情、不雅或冒犯性内容的图像。这违反了我们的安全政策。
I can't generate images that are sexually explicit.
```

## エラーシナリオ クイックリファレンス

| シナリオ | 検出条件 | 主な原因 |
| - | - | - |
| コンテンツモデレーションによる拒否 | `candidatesTokenCount === 0` | prompt/参照画像にセンシティブなコンテンツが含まれている、最初期段階での拒否 |
| 入力のブロック | `promptFeedback.blockReason` が存在し、`candidates` なし | `OTHER` は1枚の参照画像によってトリガーされることがよくあります。[blockReason: OTHER のトラブルシューティング](/ja/faq/gemini-image-input-blocked) を参照してください |
| 画像意図が不明確 | `finishReason === 'NO_IMAGE'`、断続的 | prompt がテキスト出力を求めている。[NO\_IMAGE のトラブルシューティング](/ja/faq/gemini-no-image) を参照してください |
| 生成中の拒否 | `finishReason !== 'STOP'` かつ `parts` が空 | 禁止コンテンツ、セーフティフィルター |
| テキストによる拒否の説明 | `finishReason === 'STOP'`、テキストはあるが画像なし | 露骨な性的コンテンツ、ポリシー非準拠のリクエスト |
| ナレッジベースの制限 | テキストが未来の年（2026年以降）または未発表の製品に言及している | ナレッジベースの更新は2025年1月まで |
| 禁止機能 | テキストに `watermark`、`faceswap`、着せ替え、有名人などのキーワードが含まれている | 透かし除去／顔交換／着せ替え／有名人などの禁止機能 |

## 処理フロー（判断順）

```text theme={null}
Receive API response
  ├─ ① candidatesTokenCount === 0 ─→ Content moderation rejection
  ├─ ② candidates is empty ─────────→ API format error (system issue)
  ├─ ③ finishReason !== 'STOP' ────→ Rejection during generation (check mapping table)
  ├─ ④ content.parts is empty ─────→ Empty content (handle like finishReason)
  ├─ ⑤ Iterate parts to collect text and images
  ├─ ⑥ Has image ──────────────────→ ✅ Return success
  └─ ⑦ No image but has text ──────→ Show rejection explanation (optional keyword detection)
        └─ No text ───────────────→ Generic error + keep full response
```

## コード実装（コア）

上記のチェックを 1 つのパース関数にまとめます:

```javascript theme={null}
async function processGeminiResponse(data) {
  // ① Highest priority: rejected outright at the content moderation stage
  if (data.usageMetadata?.candidatesTokenCount === 0) {
    return {
      success: false,
      errorType: 'ZERO_CANDIDATES_TOKEN',
      userMessage: 'Your request was rejected during content moderation. Please revise it and try again.',
      devMessage: 'candidatesTokenCount: 0 - rejected by Google content moderation',
      rawResponse: data,
    };
  }

  // ② candidates is empty — usually a system/format issue
  if (!data.candidates || !data.candidates.length) {
    return {
      success: false,
      errorType: 'NO_CANDIDATES',
      userMessage: 'A system error occurred. Please try again later.',
      devMessage: 'candidates is null or an empty array',
      rawResponse: data,
    };
  }

  const candidate = data.candidates[0];

  // ③ finishReason is not STOP — rejected during generation
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    const reasonMessages = {
      PROHIBITED_CONTENT: 'Content violates the safety policy and was rejected.',
      IMAGE_PROHIBITED_CONTENT: 'Content violates the safety policy and was rejected.',
      SAFETY: 'Content triggered the safety filter.',
      IMAGE_SAFETY: 'Content triggered the image safety policy.',
      RECITATION: 'Content may involve a copyright issue.',
      IMAGE_RECITATION: 'Content may involve a copyright issue.',
      NO_IMAGE: 'No image could be generated. Please adjust your prompt and try again.',
      IMAGE_OTHER: 'No image could be generated. Please adjust your prompt and try again.',
      MAX_TOKENS: 'Content length exceeds the limit.',
    };
    return {
      success: false,
      errorType: 'FINISH_REASON',
      finishReason: candidate.finishReason,
      userMessage: reasonMessages[candidate.finishReason] || `Request rejected: ${candidate.finishReason}`,
      devMessage: `finishReason: ${candidate.finishReason}`,
      rawResponse: data,
    };
  }

  // ④ content.parts is empty
  if (!candidate.content?.parts) {
    return {
      success: false,
      errorType: 'NO_PARTS',
      userMessage: 'Generation failed. Please try again.',
      devMessage: 'candidate.content.parts is empty',
      rawResponse: data,
    };
  }

  // ⑤ Iterate parts: ⚠️ always collect text first, then check thoughtSignature
  const images = [];
  const texts = [];
  for (const part of candidate.content.parts) {
    if (part.text && !part.text.startsWith('data:image/')) {
      texts.push(part.text);
    }
    if (part.inlineData?.data) {
      images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
    }
  }

  // ⑥ Having an image means success
  if (images.length > 0) {
    return { success: true, images, texts };
  }

  // ⑦ No image but has text — show the rejection explanation
  if (texts.length > 0) {
    const textContent = texts.join('\n');
    return {
      success: false,
      errorType: 'TEXT_RESPONSE',
      userMessage: textContent,          // Use the text returned by the API directly
      detectedType: detectContentType(textContent),
      apiText: textContent,
      rawResponse: data,
    };
  }

  // ⑧ Fallback: never just say "unknown error"
  return {
    success: false,
    errorType: 'UNKNOWN',
    userMessage: 'Generation failed. Please check your prompt and try again.',
    devMessage: 'No image data or text response found',
    rawResponse: data,
  };
}
```

スマートなキーワード検出（オプション、より具体的なメッセージ向け）:

```javascript theme={null}
function detectContentType(text) {
  const t = text.toLowerCase();
  const isRejection =
    t.includes("i can't generate") || t.includes('i cannot create') ||
    t.includes("i'm just a language model") || t.includes('我不能') || t.includes('无法生成');
  if (!isRejection) return null;

  if (t.includes('watermark')) return 'watermark_removal';
  if (t.includes('faceswap') || t.includes('face swap')) return 'faceswap';
  if (t.includes('sexually') || t.includes('explicit') || t.includes('色情') || t.includes('不雅')) return 'nsfw';
  return 'general_rejection';
}
```

<Warning>
  **最もよくある落とし穴**: `thoughtSignature` を含む部分でも、重要な `text` が含まれている可能性があります。必ず **最初にテキストを収集し、その後でスキップするか判断** してください。そうしないと却下理由の説明が失われ、ユーザーには「生成に失敗しました」としか表示されません。
</Warning>

## Consumer-Friendly Messaging

Design principles: **clear and concise, positive guidance, actionable, no blame**. Recommended templates:

```text theme={null}
❌ Content does not meet requirements
Your request contains inappropriate content, so an image cannot be generated.
💡 Suggestion: Use healthy, positive descriptions; avoid sensitive topics; revise your prompt and try again.

❌ Feature not yet supported
This feature (e.g., watermark removal/face swap) is not supported. Please try a different editing approach.

❌ Content out of scope
The content you mentioned may be beyond the AI's knowledge range (updated through January 2025).
💡 Suggestion: Use common objects/concepts and avoid referencing future products.
```

Tiered display recommendations:

* **Consumer users**: by default show only the friendly explanation + revision suggestion
* **Business / tool providers**: by default expand technical details (`finishReason`, `candidatesTokenCount`, etc.)
* **Developers**: provide an "expand/collapse" toggle to view the full JSON response

## ベストプラクティス

1. **優先度順に厳密に確認する**: `candidatesTokenCount` → `finishReason` → `parts` → データを抽出 → キーワード検出
2. **thoughtSignature を確認する前にテキストを収集する**: 拒否理由を失わないようにするためです
3. **完全なレスポンスを保持する**: 開発/テスト用ツールは、トラブルシューティングのために常に生の JSON を保存してください
4. **中国語と英語の拒否テキストをサポートする**: Google は中国語または英語を返すことがあるため、キーワード照合では両方をカバーする必要があります
5. **段階的にフォールバックする**: スマート検出が成功した場合は具体的なメッセージを表示し、それ以外は API テキストをそのまま表示し、それもできなければ親しみやすい `finishReason` 名を使い、最後に一般的なメッセージへフォールバックします
6. **"unknown error" を表示しない**: 常に実行可能な提案か、完全なレスポンスを含めてください

## よくある質問

<AccordionGroup>
  <Accordion title="同じ prompt が、成功したり失敗したりするのはなぜですか？">
    Google の安全フィルタリングにはランダム性と文脈依存があります。参照画像の内容や prompt の組み合わせ方が、いずれも判定に影響します。文言を調整するか、より間接的な表現を試してください。
  </Accordion>

  <Accordion title="それがコンテンツの問題か技術的な問題かは、どう見分ければよいですか？">
    `candidatesTokenCount: 0` または `finishReason: PROHIBITED_CONTENT` → コンテンツの問題; `Failed to fetch` または HTTP エラー → 技術的な問題; API のテキストによる説明 → 通常はコンテンツの問題。
  </Accordion>

  <Accordion title="一般ユーザーには、どの程度の技術情報を見せるべきですか？">
    段階的表示: デフォルトではわかりやすい説明 + 修正提案を表示し、必要に応じて技術詳細を展開し、開発モードでは完全な JSON レスポンスを表示します。
  </Accordion>

  <Accordion title="finishReason ごとに個別の処理を書き分ける必要はありますか？">
    いいえ。マッピング表と汎用フォールバックがあれば十分です: `reasonMessages[finishReason] || ` のあとに生の値を表示します。
  </Accordion>
</AccordionGroup>

## 関連記事

* [Nano Banana シリーズ料金概要](/ja/api-capabilities/nano-banana-pricing)
* [Nano Banana Pro 生成失敗補償プラン](/ja/api-capabilities/nano-banana-pro-guarantee)
* [Nano Banana OSS グループ](/ja/api-capabilities/nano-banana-oss-group)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.