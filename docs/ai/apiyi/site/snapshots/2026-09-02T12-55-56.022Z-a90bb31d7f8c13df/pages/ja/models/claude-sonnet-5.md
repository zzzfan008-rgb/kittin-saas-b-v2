> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5

> Claude Sonnet 5 は APIYI で利用できます。1M tokens あたり入力 $2 / 出力 $10、4 つの課金グループで提供されています。

コーディングとエージェント開発向けのおすすめです: SWE-bench Verified で 85.2%、高いキャッシュヒット率を備えた純粋な AWS パススルーです。

## 仕様

| 項目              | 値                                              |
| --------------- | ---------------------------------------------- |
| **モデル ID**      | `claude-sonnet-5` · `claude-sonnet-5-thinking` |
| **ベンダー**        | Anthropic                                      |
| **APIYI で利用可能** | 2026-07-01                                     |
| **知識カットオフ**     | 非公開                                            |
| **入力モダリティ**     | テキスト、画像                                        |
| **出力モダリティ**     | テキスト                                           |
| **課金**          | 使用量ベース                                         |

## 料金

USD 建ての 1M token あたりの料金（\$/1M）。

| 入力  | キャッシュ済みの入力 | 出力   |
| --- | ---------- | ---- |
| \$2 | \$0.2      | \$10 |

<Info>この表は**定価**を示しています。チャージ特典とグループ割引は**重ねて適用されます**。コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing)と[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ                | 倍率    | 注記     |
| ------------------- | ----- | ------ |
| `ClaudeCode`        | 0.95× | 定価の95% |
| `ClaudeCodeReverse` | 0.5×  | 定価の50% |
| `Default`           | 1×    | 定価     |
| `SVIP`              | 1×    | 定価     |

一部のグループには追加割引があり、チャージ特典と併用できます。[Tokens とグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況   |
| ---------- | ------ |
| ストリーミング    | ✅      |
| ツール呼び出し    | ✅      |
| 構造化出力      | ✅      |
| ビジョン       | ✅      |
| プロンプトキャッシュ | ✅      |
| 拡張推論       | 任意で有効化 |

## バリアント

| Model ID                   | 備考                               |
| -------------------------- | -------------------------------- |
| `claude-sonnet-5`          | 標準呼び出し。                          |
| `claude-sonnet-5-thinking` | 強制推論バリアント。料金とエンドポイントは標準モデルと同一です。 |

## リクエスト例

以下の例では、`claude-sonnet-5` を OpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください — そのほかは公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-sonnet-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、決してハードコードしないでください。本番環境では、用途ごとに別々の token を発行し、個別に失効・追跡できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/claude-sonnet-5-launch">
    Claude Sonnet 5 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Claude API の基本" icon="book-open" href="/ja/api-capabilities/claude">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="プロンプトキャッシュ" icon="book-open" href="/ja/api-capabilities/claude-prompt-caching">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ja/models/claude-opus-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    283モデルすべての最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は `models/data/model-details.json` で手動管理されています。料金とエンドポイントはライブ料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は2026-07-31です。</Note>
