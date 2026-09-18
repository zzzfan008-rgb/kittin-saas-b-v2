> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5.1

> APIYI上のClaude Fable 5.1：100万tokenあたり入力$10／出力$50、コンテキストウィンドウ1,000,000、最大出力128,000、4つの課金グループで利用可能。

Mythosクラスのフラッグシップの第1世代です。入力と出力の価格は据え置きですが、キャッシュ読み取りは4分の1に引き下げられます。悪用検出のため、入力と出力は30日間保持されます。

## 仕様

| 項目               | 値                                                |
| ---------------- | ------------------------------------------------ |
| **モデルID**        | `claude-fable-5-1` · `claude-fable-5-1-thinking` |
| **ベンダー**         | Anthropic                                        |
| **ベンダーリリース**     | 2026-09-01                                       |
| **APIYIでの利用可能日** | 2026-09-02                                       |
| **ナレッジカットオフ**    | 非公開                                              |
| **入力モダリティ**      | テキスト、画像                                          |
| **出力モダリティ**      | テキスト                                             |
| **コンテキストウィンドウ**  | 1,000,000 tokens                                 |
| **最大出力**         | 128,000 tokens                                   |
| **課金**           | 利用量ベース                                           |

## 料金

1M tokens あたりの米ドル価格（\$/1M）。

| 入力   | キャッシュ済み入力 | 出力   |
| ---- | --------- | ---- |
| \$10 | \$1       | \$50 |

<Info>この表は**定価**を示しています。チャージプロモーションとグループ割引は**併用**され、コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing)および[チャージプロモーション](/ja/faq/recharge-promotions)を参照してください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応状況 |
| ------------------------- | --------------------------------------------- | ---- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅    |
| `OpenAI Responses`        | `POST /v1/responses`                          | —    |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅    |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —    |
| `Image Generations`       | `POST /v1/images/generations`                 | —    |
| `Embeddings`              | `POST /v1/embeddings`                         | —    |

## 課金グループ

| グループ             | 倍率    | 注記     |
| ---------------- | ----- | ------ |
| `ClaudeCode`     | 0.95× | 定価の95% |
| `Claude_Reverse` | 0.5×  | 定価の50% |
| `Default`        | 1×    | 定価     |
| `SVIP`           | 1×    | 定価     |

一部のグループには追加割引があり、チャージボーナスと併用できます。[tokensとグループ](/ja/faq/token-and-groups)を参照してください。

## 対応機能

| 機能         | 対応    |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張思考       | オプトイン |

## バリアント

| モデル ID                      | 注記                                         |
| --------------------------- | ------------------------------------------ |
| `claude-fable-5-1`          | 標準呼び出しです。                                  |
| `claude-fable-5-1-thinking` | 思考強制バリアントです。課金、エンドポイント、グループはすべて標準モデルと同一です。 |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて`claude-fable-5-1`を呼び出します。base\_urlを`https://api.apiyi.com/v1`に指定します。それ以外は公式 APIと同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-fable-5-1",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み込み、ハードコードしないでください。本番環境では、用途ごとに個別のtokenを発行し、必要に応じてそれぞれを無効化および使用状況の帰属ができるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/claude-fable-5-1-launch">
    Claude Fable 5.1 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Claude API の基本" icon="book-open" href="/ja/api-capabilities/claude">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="推論負荷と推論" icon="book-open" href="/ja/api-capabilities/claude-effort-thinking">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/ja/models/claude-fable-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ja/models/claude-opus-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金一覧" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、ビルドのたびに更新されます。</Note>
