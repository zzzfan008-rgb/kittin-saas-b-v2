> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5

> APIYI の Claude Opus 5: 1M tokens あたり入力 $5 / 出力 $25、コンテキスト 1,000,000、最大出力 128,000、4 つの課金グループで利用可能。

Anthropic の旗艦モデル: Opus 4.8 の価格帯で Fable-5 に近い知能を備え、1M コンテキストウィンドウと thinking がデフォルトで有効です。

## 仕様

| 項目              | 値                                          |
| --------------- | ------------------------------------------ |
| **モデルID**       | `claude-opus-5` · `claude-opus-5-thinking` |
| **ベンダー**        | Anthropic                                  |
| **ベンダー公開日**     | 2026-07-24                                 |
| **APIYIで利用可能**  | 2026-07-25                                 |
| **知識のカットオフ**    | 非公開                                        |
| **入力モダリティ**     | テキスト、画像                                    |
| **出力モダリティ**     | テキスト                                       |
| **コンテキストウィンドウ** | 1,000,000 tokens                           |
| **最大出力**        | 128,000 tokens                             |
| **課金**          | 使用量ベース                                     |

## 価格

価格は USD 建てで、1M tokens あたり（\$/1M）です。

| 入力  | キャッシュ済み入力 | 出力   |
| --- | --------- | ---- |
| \$5 | \$0.5     | \$25 |

<Info>この表は **定価** を示します。チャージ特典とグループ割引は **併用できます**；コンソールには実際の課金額がリアルタイムで反映されます。[Pricing](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | サポート対象 |
| ------------------------- | --------------------------------------------- | ------ |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅      |
| `OpenAI Responses`        | `POST /v1/responses`                          | —      |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅      |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —      |
| `Image Generations`       | `POST /v1/images/generations`                 | —      |
| `Embeddings`              | `POST /v1/embeddings`                         | —      |

## 課金グループ

| グループ             | 倍率    | 備考       |
| ---------------- | ----- | -------- |
| `ClaudeCode`     | 0.95× | 表示価格の95% |
| `Claude_Reverse` | 0.5×  | 表示価格の50% |
| `Default`        | 1×    | 表示価格     |
| `SVIP`           | 1×    | 表示価格     |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[トークンとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況     |
| ---------- | -------- |
| ストリーミング    | ✅        |
| ツール呼び出し    | ✅        |
| 構造化出力      | ✅        |
| ビジョン       | ✅        |
| プロンプトキャッシュ | ✅        |
| 拡張推論       | デフォルトでオン |
| Web検索      | ✅        |

## バリアント

| モデル ID                   | 注記                                             |
| ------------------------ | ---------------------------------------------- |
| `claude-opus-5`          | 標準呼び出しです。thinking パラメータを省略すると、アダプティブ推論が実行されます。 |
| `claude-opus-5-thinking` | 強制推論版です。料金とエンドポイントは標準モデルと同じです。                 |

## 例のリクエスト

以下の例は、OpenAI Chat Completions（`/v1/chat/completions`）を通して `claude-opus-5` を呼び出します。base\_url を `https://api.apiyi.com/v1` に向けてください。ほかはすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、直書きはしないでください。本番では、用途ごとに個別の token を発行し、失効と利用状況の個別管理ができるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース告知" icon="megaphone" href="/en/news/claude-opus-5-launch">
    Claude Opus 5 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Claude API の基礎" icon="book-open" href="/ja/api-capabilities/claude">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="推論と思考" icon="book-open" href="/ja/api-capabilities/claude-effort-thinking">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="プロンプトキャッシュ" icon="book-open" href="/ja/api-capabilities/claude-prompt-caching">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Claude Sonnet 5" icon="git-compare" href="/ja/models/claude-sonnet-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/ja/models/claude-fable-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Claude Opus 4.8" icon="git-compare" href="/ja/models/claude-opus-4-8">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は手動で`models/data/model-details.json`に管理されています。料金とエンドポイントは最新の料金 API から取得され、再ビルドのたびに更新されます。</Note>
