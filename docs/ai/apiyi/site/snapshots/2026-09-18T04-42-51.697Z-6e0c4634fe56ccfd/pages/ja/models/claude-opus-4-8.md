> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 4.8

> APIYI の Claude Opus 4.8: 1M tokens あたり入力 $5 / 出力 $25、コンテキストウィンドウ 200,000、4つの課金グループで利用可能です。

以前の Opus の主力モデル: エージェント型コーディングで 69.2%、5 段階のエフォートレベルと動的なワークフローを備えています。

## 仕様

| 項目              | 値                                              |
| --------------- | ---------------------------------------------- |
| **モデルID**       | `claude-opus-4-8` · `claude-opus-4-8-thinking` |
| **ベンダー**        | Anthropic                                      |
| **APIYIで利用可能**  | 2026-05-28                                     |
| **知識のカットオフ**    | 非公開                                            |
| **入力モダリティ**     | テキスト、画像                                        |
| **出力モダリティ**     | テキスト                                           |
| **コンテキストウィンドウ** | 200,000 tokens                                 |
| **課金**          | 使用量ベース                                         |

## 料金

価格は 1M token あたり USD です（\$/1M）。

| 入力  | キャッシュ済み入力 | 出力   |
| --- | --------- | ---- |
| \$5 | \$0.5     | \$25 |

<Info>この表は**定価**を示しています。チャージ特典とグループ割引は**併用できます**。コンソールには実際の課金額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

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

| グループ             | 倍率    | 注記     |
| ---------------- | ----- | ------ |
| `ClaudeCode`     | 0.95× | 定価の95% |
| `Claude_Reverse` | 0.5×  | 定価の50% |
| `Default`        | 1×    | 定価     |
| `SVIP`           | 1×    | 定価     |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[tokensとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況  |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張推論       | オプトイン |

## バリアント

| モデル ID                     | 注記                               |
| -------------------------- | -------------------------------- |
| `claude-opus-4-8`          | 標準呼び出し。                          |
| `claude-opus-4-8-thinking` | 強制推論バリアント。料金とエンドポイントは標準モデルと同一です。 |

## サンプルリクエスト

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を使って `claude-opus-4-8` を呼び出します。base\_url を `https://api.apiyi.com/v1` に向けてください — その他はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-4-8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、使用を個別に無効化・帰属できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/claude-opus-4-8-launch">
    Claude Opus 4.8 の背景、ベンチマーク、移行に関する注記
  </Card>

  <Card title="Claude API の基礎" icon="book-open" href="/ja/api-capabilities/claude">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="推論強度と推論" icon="book-open" href="/ja/api-capabilities/claude-effort-thinking">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ja/models/claude-opus-5">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されており、料金とエンドポイントは最新の料金 API から取得され、再ビルドごとに更新されます。</Note>
