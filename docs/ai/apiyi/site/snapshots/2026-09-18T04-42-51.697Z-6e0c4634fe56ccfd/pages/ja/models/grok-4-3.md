> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.3

> APIYI の Grok 4.3：100万 token あたり入力 $1.25／出力 $2.5、コンテキストウィンドウ 1,000,000、3つの課金グループで利用可能です。

無効化できない常時有効の推論、1M のコンテキストウィンドウ、そして約 159 tokens/s の出力速度。

## Specifications

| Item                   | Value            |
| ---------------------- | ---------------- |
| **Model ID**           | `grok-4.3`       |
| **Vendor**             | xAI              |
| **Available on APIYI** | 2026-05-03       |
| **Knowledge cutoff**   | 非公開              |
| **Input modalities**   | テキスト、画像          |
| **Output modalities**  | テキスト             |
| **Context window**     | 1,000,000 tokens |
| **Billing**            | 使用量ベース           |

## 料金

価格は 100万 token あたりの USD（\$/1M）です。

| 入力     | キャッシュされた入力 | 出力    |
| ------ | ---------- | ----- |
| \$1.25 | \$0.2      | \$2.5 |

<Info>この表は**定価**を示しています。チャージ特典とグループ割引は**併用**できます。コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。</Info>

## 階層価格

このモデルは、各リクエストの token サイズに応じた階層価格です（出力価格 = 階層入力価格 × 出力倍率）:

* 0 – 204,800 tokens: \$1.25/1M input
* 204,800 tokens を超える場合: \$2.5/1M input

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

| グループ             | 倍率 | 備考 |
| ---------------- | -- | -- |
| `CodexResponses` | 1× | 定価 |
| `Default`        | 1× | 定価 |
| `SVIP`           | 1× | 定価 |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[トークンとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応       |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| ビジョン       | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張推論       | デフォルトでオン |
| ウェブ検索      | ✅        |
| コード実行      | ✅        |

## リクエスト例

以下の例では、`grok-4.3` を OpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出しています。base\_url は `https://api.apiyi.com/v1` に設定してください — それ以外は公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。運用環境では、用途ごとに個別の token を発行し、失効と利用状況の把握を個別に行えるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/grok-4-3-launch">
    Grok 4.3 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Grok 概要" icon="book-open" href="/ja/api-capabilities/grok/overview">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Grok 4.6" icon="git-compare" href="/ja/models/grok-4-6">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Grok 4.5" icon="git-compare" href="/ja/models/grok-4-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金一覧" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、ビルドごとに更新されます。</Note>
