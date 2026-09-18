> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI の GLM-5.3

> APIYI の GLM-5.3: 100万 tokens あたり入力 $1.4 / 出力 $4.396、100万のコンテキスト、最大出力 128,000、2つの課金グループで利用可能です。

5.2 と同じ 753B MoE ベースに、ポストトレーニングを大幅に拡張：Z.ai Code Bench で +50%、サイバー防御スコアは 2 倍に向上。推論は常時有効で、コーディングエージェントとセキュリティ監査向けに構築されています。

## 仕様

| 項目               | 値                |
| ---------------- | ---------------- |
| **モデル ID**       | `glm-5.3`        |
| **ベンダー**         | Zhipu            |
| **ベンダーのリリース**    | 2026-08-14       |
| **APIYI での提供開始** | 2026-09-08       |
| **知識のカットオフ**     | 非公開              |
| **入力モダリティ**      | テキスト             |
| **出力モダリティ**      | テキスト             |
| **コンテキストウィンドウ**  | 1,000,000 tokens |
| **最大出力**         | 128,000 tokens   |
| **課金**           | 使用量ベース           |

## 料金

100万 tokens あたりの米ドル価格（\$/1M）。

| 入力    | キャッシュ済み入力 | 出力      |
| ----- | --------- | ------- |
| \$1.4 | \$0.259   | \$4.396 |

<Info>この表は**定価**を示しています。チャージプロモーションとグループ割引は**併用**され、コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing)および[チャージプロモーション](/ja/faq/recharge-promotions)を参照してください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | サポート状況 |
| ------------------------- | --------------------------------------------- | ------ |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅      |
| `OpenAI Responses`        | `POST /v1/responses`                          | —      |
| `Anthropic Messages`      | `POST /v1/messages`                           | —      |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —      |
| `Image Generations`       | `POST /v1/images/generations`                 | —      |
| `Embeddings`              | `POST /v1/embeddings`                         | —      |

## 課金グループ

| グループ      | 倍率 | 注記 |
| --------- | -- | -- |
| `Default` | 1× | 定価 |
| `SVIP`    | 1× | 定価 |

一部のグループには追加割引があり、チャージボーナスと併用できます。[tokensとグループ](/ja/faq/token-and-groups)を参照してください。

## 対応機能

| 機能         | 対応状況     |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張思考       | デフォルトで有効 |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`glm-5.3`を呼び出します。base\_urlを`https://api.apiyi.com/v1`に指定してください。それ以外は公式APIと同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み込み、ハードコードしないでください。本番環境では、用途ごとに個別のtokenを発行し、必要に応じて個別に失効させたり、利用状況を特定したりできるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="公開のお知らせ" icon="megaphone" href="/en/news/glm-5-3-launch">
    GLM-5.3の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="GLM-5.3-Flash" icon="git-compare" href="/ja/models/glm-5-3-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="GLM-5.2" icon="git-compare" href="/ja/models/glm-5-2">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、ビルドのたびに更新されます。</Note>
