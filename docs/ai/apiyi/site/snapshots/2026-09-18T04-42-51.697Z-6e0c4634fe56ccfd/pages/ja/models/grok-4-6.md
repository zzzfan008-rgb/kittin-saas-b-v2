> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.6

> APIYI の Grok 4.6：入力 $2 / 出力 $6（100万 tokens あたり）、500,000 コンテキスト、3つの課金グループで利用可能です。

4.5の1.5Tパラメータ基盤を再利用し、事後学習のみでArtificial Analysis Intelligence Indexを56から61へ引き上げています。しかも、4.5と同じ定価です。

## 仕様

| 項目                   | 値              |
| -------------------- | -------------- |
| **Model ID**         | `grok-4.6`     |
| **Vendor**           | xAI            |
| **Vendor release**   | 2026-08-07     |
| **APIYIで利用可能**       | 2026-08-13     |
| **Knowledge cutoff** | 非公開            |
| **入力モダリティ**          | Text, Image    |
| **出力モダリティ**          | Text           |
| **コンテキストウィンドウ**      | 500,000 tokens |
| **課金**               | 使用量ベース         |

## 価格

価格は1M tokenあたりのUSD建て（\$/1M）。

| 入力  | キャッシュ済み入力 | 出力  |
| --- | --------- | --- |
| \$2 | \$0.5     | \$6 |

<Info>表は**一覧価格**を示しています。チャージ特典とグループ割引は**併用**できます。コンソールには実際の請求額がリアルタイムで表示されます。[価格](/ja/pricing)と[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。</Info>

## 段階別価格設定

このモデルは、各リクエストの token サイズに応じた段階別価格です（出力価格 = 各段階の入力価格 × 出力倍率）:

* 0 – 204,800 tokens: \$2/1M input
* 204,801 – 512,000 tokens: \$4/1M input

## エンドポイント

| エンドポイント                   | パス                                            | サポート |
| ------------------------- | --------------------------------------------- | ---- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅    |
| `OpenAI Responses`        | `POST /v1/responses`                          | —    |
| `Anthropic Messages`      | `POST /v1/messages`                           | —    |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —    |
| `Image Generations`       | `POST /v1/images/generations`                 | —    |
| `Embeddings`              | `POST /v1/embeddings`                         | —    |

## 課金グループ

| グループ             | 倍率 | 注記 |
| ---------------- | -- | -- |
| `CodexResponses` | 1× | 定価 |
| `Default`        | 1× | 定価 |
| `SVIP`           | 1× | 定価 |

一部のグループには追加割引があり、チャージボーナスと併用できます。[tokens とグループ](/ja/faq/token-and-groups)を参照してください。

## 対応機能

| 機能         | 対応       |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| ビジョン       | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張思考       | デフォルトでオン |
| Web検索      | ✅        |
| コード実行      | ✅        |

## Example request

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）経由で `grok-4.6` を呼び出します。base\_url を `https://api.apiyi.com/v1` に向けてください — それ以外は公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.6",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行しておくと、個別に失効でき、利用状況を個別に把握できます。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース告知" icon="megaphone" href="/en/news/grok-4-6-launch">
    Grok 4.6 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Grok 概要" icon="book-open" href="/ja/api-capabilities/grok/overview">
    パラメーター、使用方法、ベストプラクティス
  </Card>

  <Card title="チャットと推論" icon="book-open" href="/ja/api-capabilities/grok/chat">
    パラメーター、使用方法、ベストプラクティス
  </Card>

  <Card title="Grok 4.5" icon="git-compare" href="/ja/models/grok-4-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Grok 4.3" icon="git-compare" href="/ja/models/grok-4-3">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、ビルドのたびに更新されます。</Note>
