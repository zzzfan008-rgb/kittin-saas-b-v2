> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash

> DeepSeek V4 Flash の APIYI：$0.44 入力 / $1.32 出力、1M token あたり、コンテキスト 1,048,576、最大出力 393,216、4つの課金グループで利用可能です。

1M のコンテキストを備えた、合計 284B / アクティブ 13B の MoE。高い同時実行数と低レイテンシ向けに設計されており、暗黙的キャッシュは設定不要で、2ターン目からほぼフルのヒットが得られます。

## 仕様

| 項目                     | 値                   |
| ---------------------- | ------------------- |
| **Model ID**           | `deepseek-v4-flash` |
| **Vendor**             | DeepSeek            |
| **Available on APIYI** | 2026-04-24          |
| **Knowledge cutoff**   | 非公開                 |
| **Input modalities**   | テキスト                |
| **Output modalities**  | テキスト                |
| **Context window**     | 1,048,576 tokens    |
| **Max output**         | 393,216 tokens      |
| **Billing**            | 従量課金制               |

## 料金

USD建ての1M tokenあたりの価格（\$/1M）。

| 入力     | キャッシュ済み入力 | 出力     |
| ------ | --------- | ------ |
| \$0.44 | \$0.01408 | \$1.32 |

<Info>表は**定価**を示しています。チャージ特典とグループ割引は**併用できます**。コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ             | レート倍率 | 備考     |
| ---------------- | ----- | ------ |
| `ClaudeCode`     | 0.95× | 定価の95% |
| `CodexResponses` | 1×    | 定価     |
| `Default`        | 1×    | 定価     |
| `SVIP`           | 1×    | 定価     |

一部のグループには追加割引があり、チャージ特典と併用できます。[Tokensとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応    |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | —     |
| プロンプトキャッシュ | ✅     |
| 拡張思考       | オプトイン |
| ウェブ検索      | —     |

## 使用例

以下の例では、`deepseek-v4-flash` を OpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出します。base\_url を `https://api.apiyi.com/v1` に指定してください。ほかはすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>環境変数からキーを読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行しておくと、個別に失効させたり使用状況を把握したりできます。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/deepseek-v4-flash-ga-launch">
    DeepSeek V4 Flash の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="概要" icon="book-open" href="/ja/api-capabilities/deepseek-v4-flash/overview">
    パラメーター、使用方法、ベストプラクティス
  </Card>

  <Card title="DeepSeek V4 Pro" icon="git-compare" href="/ja/models/deepseek-v4-pro">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    283 個すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は `models/data/model-details.json` で手動管理されています。料金とエンドポイントはライブ料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は 2026-08-17 です。</Note>
