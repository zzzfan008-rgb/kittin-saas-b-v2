> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.5 Pro

> APIYIのGPT-5.5 Pro：100万tokensあたり入力$30 / 出力$180、コンテキスト1,050,000、最大出力128,000、2つの課金グループで利用可能です。

ヘビーな推論向けのティア: 高価で、/v1/responses でのみ利用可能 — 専門的なワークロード以外には推奨されません。

## 仕様

| 項目                     | 値                |
| ---------------------- | ---------------- |
| **Model ID**           | `gpt-5.5-pro`    |
| **Vendor**             | OpenAI           |
| **Available on APIYI** | 2026-05-03       |
| **Knowledge cutoff**   | 2025-12          |
| **Input modalities**   | テキスト、画像          |
| **Output modalities**  | テキスト             |
| **Context window**     | 1,050,000 tokens |
| **Max output**         | 128,000 tokens   |
| **Billing**            | 従量課金             |

## 料金

1M token あたりの USD 価格（\$/1M）。

| 入力   | キャッシュされた入力 | 出力    |
| ---- | ---------- | ----- |
| \$30 | \$3        | \$180 |

<Info>表は**定価**を示します。チャージ特典とグループ割引は**併用できます**。コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

## 段階料金

このモデルは各リクエストのトークン数に応じた段階料金です（出力価格 = 段階入力価格 × 出力倍率）:

* 0 – 278,528 tokens: \$30/1M input
* 278,528 tokens 超: \$60/1M input

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | —  |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ      | 倍率 | 注記 |
| --------- | -- | -- |
| `Default` | 1× | 定価 |
| `SVIP`    | 1× | 定価 |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[トークンとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況     |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| Vision     | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張推論       | デフォルトで有効 |

## リクエスト例

下の例では、OpenAI Responses（`/v1/responses`）経由で `gpt-5.5-pro` を呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください — それ以外は公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.5-pro",
    "input": "Hello"
  }'
```

<Tip>キーは環境変数から読み取り、絶対にハードコードしないでください。本番では、ユースケースごとに別々の token を発行し、使用状況を個別に失効・追跡できるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース告知" icon="megaphone" href="/en/news/gpt-5-5-pro-launch">
    GPT-5.5 Pro の背景、ベンチマーク、移行に関する注記
  </Card>

  <Card title="互換モード" icon="book-open" href="/ja/api-capabilities/openai/compatible">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、リビルドのたびに更新されます。</Note>
