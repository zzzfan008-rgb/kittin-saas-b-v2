> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo

> APIYI の Seed 2.1 Turbo: 1M tokens あたり入力 $0.5 / 出力 $2.5、コンテキスト 256,000、3つの課金グループで利用可能です。

高頻度ワークロード向けの本番用テキストモデルです。両方のエンドポイントで 15/15 の検証済みで、推論切り替えと 2 層のキャッシュを備えています。

## 仕様

| 項目              | 値                            |
| --------------- | ---------------------------- |
| **モデルID**       | `dola-seed-2-1-turbo-260628` |
| **ベンダー**        | ByteDance                    |
| **ベンダー公開日**     | 2026-06-23                   |
| **APIYIで利用可能**  | 2026-07-21                   |
| **知識カットオフ**     | 非公開                          |
| **入力モダリティ**     | テキスト                         |
| **出力モダリティ**     | テキスト                         |
| **コンテキストウィンドウ** | 256,000 tokens               |
| **課金**          | 使用量ベース                       |

## 料金

1M token あたりの USD 価格（\$/1M）。

| 入力    | キャッシュ済み入力 | 出力    |
| ----- | --------- | ----- |
| \$0.5 | \$0.1     | \$2.5 |

<Info>この表は **定価** を示しています。チャージ特典とグループ割引は **併用** できます。コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

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

一部のグループには追加割引があり、チャージ特典と併用できます。詳細は [トークンとグループ](/ja/faq/token-and-groups) をご覧ください。

## 対応機能

| 機能         | 対応状況     |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張推論       | デフォルトでオン |

## 使用例のリクエスト

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を使って `dola-seed-2-1-turbo-260628` を呼び出します。base\_url は `https://api.apiyi.com/v1` に設定してください。その他はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "dola-seed-2-1-turbo-260628",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、無効化と利用状況の把握を個別にできるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/dola-seed-2-1-turbo-launch">
    Seed 2.1 Turbo の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="概要" icon="book-open" href="/ja/api-capabilities/dola-seed-2-1-turbo/overview">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    全283モデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は2026-07-31です。</Note>
