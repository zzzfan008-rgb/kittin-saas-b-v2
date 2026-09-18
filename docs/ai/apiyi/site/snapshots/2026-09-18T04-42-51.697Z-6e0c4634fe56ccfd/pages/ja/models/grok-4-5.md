> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.5

> APIYI上のGrok 4.5：100万tokenあたり入力$2／出力$6、コンテキストウィンドウ500,000、3つの課金グループで利用可能。

Cursor と共同学習: おおよそ Opus 4.8 の 4.2 倍の出力 token 効率で、エージェンティックなツール呼び出しのベンチマークでトップです。

## 仕様

| 項目              | 値              |
| --------------- | -------------- |
| **モデルID**       | `grok-4.5`     |
| **ベンダー**        | xAI            |
| **APIYIで利用可能**  | 2026-07-10     |
| **知識カットオフ**     | 非公開            |
| **入力モダリティ**     | テキスト、画像        |
| **出力モダリティ**     | テキスト           |
| **コンテキストウィンドウ** | 500,000 tokens |
| **課金**          | 従量課金制          |

## 料金

1M token あたりの USD 価格（\$/1M）。

| 入力  | キャッシュされた入力 | 出力  |
| --- | ---------- | --- |
| \$2 | \$0.5      | \$6 |

<Info>この表は**定価**を示しています。チャージ特典とグループ割引は**併用**でき、コンソールには実際の請求額がリアルタイムで反映されます。詳細は[料金](/ja/pricing)と[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。</Info>

## 段階別価格

このモデルは、各リクエストの token サイズに応じて段階別に課金されます（出力価格 = 段階の入力価格 × 出力倍率）:

* 0 – 204,800 token: \$2/1M input
* 204,800 token 超: \$4/1M input

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
| コード実行      | ✅        |

## リクエスト例

以下の例では、`grok-4.5` を OpenAI Chat Completions（`/v1/chat/completions`）経由で呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください — その他はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、ユースケースごとに個別の token を発行し、個別に失効・利用状況を追跡できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/grok-4-5-launch">
    Grok 4.5 の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="Grok の概要" icon="book-open" href="/ja/api-capabilities/grok/overview">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="チャットと推論" icon="book-open" href="/ja/api-capabilities/grok/chat">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Grok 4.6" icon="git-compare" href="/ja/models/grok-4-6">
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
