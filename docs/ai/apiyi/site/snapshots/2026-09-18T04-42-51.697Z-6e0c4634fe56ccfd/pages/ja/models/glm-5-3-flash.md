> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.3-Flash

> APIYIのGLM-5.3-Flash：入力1M tokensあたり$0.15、出力1M tokensあたり$0.5、コンテキスト1,000,000、最大出力128,000、2つの課金グループで利用可能。

初のネイティブなマルチモーダル GLM-5：総計320B／アクティブ18B、Terminal-Bench 2.1で84.3を達成しClaude Opus 4.8に迫る性能を、フラッグシップの約10分の1のコストで提供します。MITライセンスです。

## 仕様

| 項目                | 値                |
| ----------------- | ---------------- |
| **モデル ID**        | `glm-5.3-flash`  |
| **ベンダー**          | Zhipu            |
| **ベンダーリリース**      | 2026-08-26       |
| **APIYI での提供開始日** | 2026-09-08       |
| **知識カットオフ**       | 非公開              |
| **入力モダリティ**       | テキスト、画像、動画       |
| **出力モダリティ**       | テキスト             |
| **コンテキストウィンドウ**   | 1,000,000 tokens |
| **最大出力**          | 128,000 tokens   |
| **課金**            | 使用量ベース           |

## 料金

1M token あたりの USD 価格 (\$/1M)。

| 入力     | キャッシュ済み入力 | 出力    |
| ------ | --------- | ----- |
| \$0.15 | \$0.03    | \$0.5 |

<Info>この表は**掲載価格**を示しています。チャージプロモーションとグループ割引は**併用**され、コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージプロモーション](/ja/faq/recharge-promotions)をご覧ください。</Info>

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
| ビジョン       | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張思考       | デフォルトで有効 |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`glm-5.3-flash`を呼び出します。base\_url を`https://api.apiyi.com/v1`に指定してください。その他はすべて公式APIと同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.3-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは必ず環境変数から読み込み、ハードコードしないでください。本番環境では、ユースケースごとに個別のtokensを発行することで、使用量を個別に取り消し・追跡できます。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース発表" icon="megaphone" href="/en/news/glm-5-3-launch">
    GLM-5.3-Flash の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="GLM-5.3" icon="git-compare" href="/ja/models/glm-5-3">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="GLM-5.2" icon="git-compare" href="/ja/models/glm-5-2">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は `models/data/model-details.json` で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、ビルドのたびに更新されます。</Note>
