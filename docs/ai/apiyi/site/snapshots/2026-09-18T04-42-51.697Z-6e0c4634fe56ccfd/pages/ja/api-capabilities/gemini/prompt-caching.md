> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 暗黙的キャッシュ 課金ガイド

> Gemini の暗黙的キャッシュは自動で有効になり、ヒット分は公式の割引料金で課金されます — ただしヒット率は Claude/OpenAI に及ばないため、キャッシュ未使用時の価格で予算を見積もってください。

APIYI の Gemini チャンネルは、**暗黙のコンテキストキャッシュ**を自動で有効化します。リクエストのプレフィックスがヒットすると、一致した部分は公式割引で課金され、`cached_content_token_count` フィールドはそのまま返されます。コード変更は不要です。

先に結論を言うと、**Gemini のキャッシュは存在しますが、当てにしないでください。** 暗黙のキャッシュ動作は上流側で制御されており、実運用のヒット率は [OpenAI](/ja/api-capabilities/openai/prompt-caching) や [Claude](/ja/api-capabilities/claude-prompt-caching) に明らかに劣ります。これはあれば便利なおまけ程度に考え、**コストは常にキャッシュ未使用時の価格で見積もってください。**

このページは、公式の Google ドキュメント（`ai.google.dev/gemini-api/docs/caching`、2026 年 6 月時点）に基づいています。

## 仕組みを一言で

リクエストの冒頭セグメント（prefix）が最近のリクエストと一致し、かつ最小長を満たすと、上流は自動的にそのキャッシュを再利用します。一致した部分は公式の割引料金で課金され（公式には**最大90%オフ**）、マーカーは不要です。

## トリガー条件

| 条件          | 要件                                                                    |
| ----------- | --------------------------------------------------------------------- |
| 最小プレフィックス長  | **Gemini 3 / 3.1 / 3.5 series: 4096 tokens**; 2.5 series: 2048 tokens |
| 安定したプレフィックス | 最初の文字からバイト単位で完全一致していること。動的なコンテンツ（タイムスタンプ、ランダムID）は一致を崩します              |
| 時間ウィンドウ     | キャッシュはアイドル時間後に期限切れになります。連続したリクエストのほうがより確実にヒットします                      |

Geminiのキャッシュしきい値（4096）はOpenAIのしきい値（1024）よりかなり高く、**短いシステムプロンプトはGeminiではほぼ決してヒットしません**。これが、Geminiのキャッシュがいまひとつに感じられる理由の1つです。

## ヒットの確認方法

`usage_metadata.cached_content_token_count` を確認してください:

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[LONG_STABLE_PREFIX, question]
)

usage = response.usage_metadata
print(f"Input: {usage.prompt_token_count}")
print(f"Cache hits: {usage.cached_content_token_count}")  # > 0 means a hit
```

ヒットは、課金ダッシュボードで割引された明細として表示されます。REST レスポンスでは、フィールドは `usageMetadata.cachedContentTokenCount` です。

## ヒット率を高める

手順は OpenAI と同じです（詳細は[OpenAI Cache Billing Guide](/ja/api-capabilities/openai/prompt-caching)をご覧ください）:

* **安定した内容を先に置く**: 長いシステム指示、ドキュメント、few-shot の例は前方に配置し、ユーザー入力とタイムスタンプは最後にします
* **プレフィックスを長くする**: 4096 tokens 未満のもの（Gemini 3 series）はヒットしません
* **時間をまとめて再利用する**: バッチジョブは間を空けずに連続で送信し、分散させない
* マルチターンのチャットは本質的に追記専用のプレフィックスになり、よりヒットしやすくなります

すべてを正しく行っても、**ヒットは保証されません**。暗黙的なキャッシュは OpenAI/Claude の決定的な動作とは異なり、ベストエフォートです。

## 明示的キャッシュ（cachedContents）

Google では明示的なキャッシュ API（`cachedContents` — TTL 付きのキャッシュオブジェクトを作成して参照します）も提供しています。これは **ステートフルなサーバーサイドリソースであり、現時点ではサポートされていません**。APIYI チャネルでは暗黙的キャッシュを使用してください。

## 他のチャネルとの比較

|            | Gemini                           | OpenAI          | Claude                    |
| ---------- | -------------------------------- | --------------- | ------------------------- |
| トリガー       | 暗黙的、 автомат的                    | 完全自動            | 手動マーカー                    |
| 最小しきい値     | **4096**（3 シリーズ）/ 2048（2.5 シリーズ） | 1024            | 1024–4096                 |
| ヒット時割引     | 公式には最大 90% オフ                    | 0.1×            | 0.1×                      |
| ヒット信頼性     | ⚠️ ベストエフォート、やや低め                 | ✅ 安定            | ✅ 安定                      |
| ヒット対象フィールド | `cached_content_token_count`     | `cached_tokens` | `cache_read_input_tokens` |

**長く頻繁に繰り返すプレフィックスを持つキャッシュ重視のワークロード（エージェント、RAG、バッチ文書）では、OpenAI または Claude のチャネルを優先してください。** プラットフォーム全体のキャッシュ対応の概要: [キャッシュ課金 FAQ](/ja/faq/cache-billing)。

## 関連リンク

* このグループ: [Native Calls](/ja/api-capabilities/gemini/native) · [マルチモーダル & コード実行](/ja/api-capabilities/gemini/multimodal) · [関数呼び出し](/ja/api-capabilities/gemini/function-calling)
* 他のチャネル: [OpenAI キャッシュ課金](/ja/api-capabilities/openai/prompt-caching) · [Claude キャッシュ課金](/ja/api-capabilities/claude-prompt-caching)
* 公式 Google ドキュメント: `ai.google.dev/gemini-api/docs/caching`
