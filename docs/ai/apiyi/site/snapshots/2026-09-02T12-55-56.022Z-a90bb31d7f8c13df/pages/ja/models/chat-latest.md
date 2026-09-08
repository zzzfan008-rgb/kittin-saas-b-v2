> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# chat-latest

> APIYI の chat-latest: 1M token あたり入力 $5 / 出力 $30、400,000 のコンテキストウィンドウ、最大出力 128,000、2つの課金グループで利用可能です。

OpenAI のロールイングエイリアスで、常に ChatGPT を現在支えているモデルを指します — 現在は GPT-5.5 Instant です。

## 仕様

| 項目                     | 値              |
| ---------------------- | -------------- |
| **Model ID**           | `chat-latest`  |
| **Vendor**             | OpenAI         |
| **Available on APIYI** | 2026-05-21     |
| **Knowledge cutoff**   | 2025-08        |
| **Input modalities**   | テキスト、画像        |
| **Output modalities**  | テキスト           |
| **Context window**     | 400,000 tokens |
| **Max output**         | 128,000 tokens |
| **Billing**            | 従量課金           |

## 価格

価格は100万 token あたりの USD（\$/1M）です。

| 入力  | キャッシュ済み入力 | 出力   |
| --- | --------- | ---- |
| \$5 | \$0.5     | \$30 |

<Info>この表は**定価**を示しています。チャージプロモーションとグループ割引は**併用されます**。コンソールには実際の請求額がリアルタイムで反映されます。[価格](/ja/pricing) と [チャージプロモーション](/ja/faq/recharge-promotions) をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ      | レート倍率 | 備考 |
| --------- | ----- | -- |
| `Default` | 1×    | 定価 |
| `SVIP`    | 1×    | 定価 |

一部のグループには追加割引があり、チャージ特典と併用できます。[Tokens とグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応 |
| ---------- | -- |
| ストリーミング    | ✅  |
| ツール呼び出し    | ✅  |
| 構造化出力      | ✅  |
| ビジョン       | ✅  |
| プロンプトキャッシュ | ✅  |
| ウェブ検索      | ✅  |
| コード実行      | ✅  |
| ファインチューニング | —  |

## 使用例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）経由で`chat-latest`を呼び出します。base\_url を`https://api.apiyi.com/v1`に向けてください。その他は公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "chat-latest",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、個別に失効・利用状況の把握ができるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/chat-latest-launch">
    chat-latest の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="互換モード" icon="book-open" href="/ja/api-capabilities/openai/compatible">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    283 種類すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は手動で `models/data/model-details.json` に管理されています。料金とエンドポイントはライブ料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は 2026-07-31 です。</Note>
