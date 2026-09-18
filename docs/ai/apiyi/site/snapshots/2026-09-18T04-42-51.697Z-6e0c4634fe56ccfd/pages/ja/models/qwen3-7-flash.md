> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.7-Flash

> APIYI の Qwen3.7-Flash：100万 token あたり入力 $0.16 / 出力 $0.64、コンテキストウィンドウ 1,000,000、最大出力 65,536、2つの課金グループで利用可能です。

前世代の低コストなマルチモーダル推論モデルです。1M のコンテキストウィンドウ、65K の最大出力、256K の thinking budget を備え、マルチモーダルエージェントとビジュアルコーディングを対象としています。

## 仕様

| 項目                | 値                |
| ----------------- | ---------------- |
| **モデル ID**        | `qwen3.7-flash`  |
| **ベンダー**          | アリババ             |
| **ベンダーリリース**      | 2026-07-27       |
| **APIYI での利用可能日** | 2026-09-03       |
| **ナレッジカットオフ**     | 非公開              |
| **入力モダリティ**       | テキスト、画像、動画       |
| **出力モダリティ**       | テキスト             |
| **コンテキストウィンドウ**   | 1,000,000 tokens |
| **最大出力**          | 65,536 tokens    |
| **課金**            | 使用量ベース           |

## 料金

1M token あたりの米ドル価格（\$/1M）です。

| 入力     | キャッシュ済み入力 | 出力     |
| ------ | --------- | ------ |
| \$0.16 | \$0.04    | \$0.64 |

<Info>この表は**定価**を示しています。チャージキャンペーンとグループ割引は**併用**され、コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージキャンペーン](/ja/faq/recharge-promotions)をご覧ください。</Info>

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

| グループ      | 倍率 | 備考 |
| --------- | -- | -- |
| `Default` | 1× | 定価 |
| `SVIP`    | 1× | 定価 |

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

以下の例では、`qwen3.7-flash`をOpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出します。base\_urlには`https://api.apiyi.com/v1`を指定します。それ以外はすべて公式APIと同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.7-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み込み、ハードコードしないでください。本番環境では、用途ごとに個別のtokenを発行して、必要に応じて個別に失効させ、使用状況を個別に追跡できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Qwen3.8-Flash" icon="git-compare" href="/ja/models/qwen3-8-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントはライブ料金 API から取得され、すべての再ビルドごとに更新されます。</Note>
