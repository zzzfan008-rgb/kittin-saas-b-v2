> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash

> APIYI の Gemini 3.5 Flash: 100万 token あたり入力 $1.5 / 出力 $9、コンテキスト 1,000,000、最大出力 64,000、2つの課金グループで利用可能。

Terminal-Bench 2.1 で 76.2% を達成し、暗号化された推論コンテキストを呼び出し間で保持します。Computer Use はサポートされていません。

## 仕様

| 項目                     | 値                  |
| ---------------------- | ------------------ |
| **Model ID**           | `gemini-3.5-flash` |
| **Vendor**             | Google             |
| **Available on APIYI** | 2026-05-20         |
| **Knowledge cutoff**   | 非公開                |
| **Input modalities**   | テキスト、画像、オーディオ、動画   |
| **Output modalities**  | テキスト               |
| **Context window**     | 1,000,000 tokens   |
| **Max output**         | 64,000 tokens      |
| **Billing**            | 従量課金               |

## 価格

価格は USD で、1M token あたりです（\$/1M）。

| 入力    | キャッシュ済み入力 | 出力  |
| ----- | --------- | --- |
| \$1.5 | \$0.15    | \$9 |

<Info>この表は**定価**を示します。チャージ特典とグループ割引は**併用できます**。コンソールには実際の請求額がリアルタイムで反映されます。[価格](/ja/pricing)と[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ      | レート倍率 | 備考 |
| --------- | ----- | -- |
| `Default` | 1×    | 定価 |
| `SVIP`    | 1×    | 定価 |

一部のグループには追加割引があり、チャージ特典と併用できます。[token とグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況     |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| ビジョン       | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張推論       | デフォルトでオン |

## リクエスト例

以下の例では、`gemini-3.5-flash` を OpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出します。base\_url は `https://api.apiyi.com/v1` に設定してください — それ以外は公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコーディングしないでください。本番環境では、用途ごとに個別の token を発行し、失効や使用状況の追跡を個別に行えるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/gemini-3-5-flash-launch">
    Gemini 3.5 Flash の背景、ベンチマーク、移行に関する注記
  </Card>

  <Card title="ネイティブ呼び出し" icon="book-open" href="/ja/api-capabilities/gemini/native">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ja/models/gemini-3-6-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Gemini 3.5 Flash-Lite" icon="git-compare" href="/ja/models/gemini-3-5-flash-lite">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金一覧" icon="table" href="/en/models">
    283 モデルすべての最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は `models/data/model-details.json` で手動管理されています。料金とエンドポイントは、2026-08-31 11:46 (UTC+8) に更新された最新の料金 API から取得しています。仕様の最終確認日は 2026-07-31 です。</Note>
