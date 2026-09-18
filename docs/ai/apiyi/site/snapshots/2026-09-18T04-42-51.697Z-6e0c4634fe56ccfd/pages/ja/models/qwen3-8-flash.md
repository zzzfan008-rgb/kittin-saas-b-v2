> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Flash

> APIYIのQwen3.8-Flash：100万tokenあたり入力$0.114 / 出力$0.3876、コンテキストウィンドウ1,000,000、最大出力131,072、2つの課金グループで利用可能です。

シリーズのコスト効率を支える主力モデル：1Mのコンテキストと最大131Kの出力に対応したマルチモーダル推論モデルで、ビジュアルコーディング、ドキュメント作業、大量の長時間動画分析に適しています。

## 仕様

| 項目              | 値                |
| --------------- | ---------------- |
| **モデルID**       | `qwen3.8-flash`  |
| **ベンダー**        | Alibaba          |
| **ベンダーリリース**    | 2026-08-26       |
| **APIYIで利用可能**  | 2026-09-03       |
| **知識カットオフ**     | 非公開              |
| **入力モダリティ**     | テキスト、画像、動画       |
| **出力モダリティ**     | テキスト             |
| **コンテキストウィンドウ** | 1,000,000 tokens |
| **最大出力**        | 131,072 tokens   |
| **課金**          | 使用量ベース           |

## 料金

100万 token あたりの USD 価格（\$/1M）。

| 入力      | キャッシュ済み入力 | 出力       |
| ------- | --------- | -------- |
| \$0.114 | \$0.01425 | \$0.3876 |

<Info>この表は**定価**を示しています。チャージキャンペーンとグループ割引は**併用**され、コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing)および[チャージキャンペーン](/ja/faq/recharge-promotions)をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応状況 |
| ------------------------- | --------------------------------------------- | ---- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅    |
| `OpenAI Responses`        | `POST /v1/responses`                          | —    |
| `Anthropic Messages`      | `POST /v1/messages`                           | —    |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —    |
| `Image Generations`       | `POST /v1/images/generations`                 | —    |
| `Embeddings`              | `POST /v1/embeddings`                         | —    |

## 課金グループ

| グループ      | レート倍率 | 注記 |
| --------- | ----- | -- |
| `Default` | 1×    | 定価 |
| `SVIP`    | 1×    | 定価 |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[トークンとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応    |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張思考       | オプトイン |

## リクエスト例

以下の例では、`qwen3.8-flash`をOpenAIのチャット補完（`/v1/chat/completions`）経由で呼び出します。base\_urlを`https://api.apiyi.com/v1`に設定してください。それ以外はすべて公式APIと同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別のtokenを発行して、必要に応じて個別に失効および利用状況の追跡ができるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Qwen3.7-Flash" icon="git-compare" href="/ja/models/qwen3-7-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Qwen3.8-27B" icon="git-compare" href="/ja/models/qwen3-8-27b">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、ビルドのたびに更新されます。</Note>
