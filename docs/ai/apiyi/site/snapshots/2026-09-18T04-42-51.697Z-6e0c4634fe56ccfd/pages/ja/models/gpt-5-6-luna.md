> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Luna

> APIYIのGPT-5.6 Luna：100万tokensあたり入力$0.2／出力$1.2、コンテキストウィンドウ1,000,000、4つの課金グループで利用可能。

GPT-5.6 ファミリーの軽量版で、高い同時実行数とコスト重視のワークロード向けに構築されています。256K コンテキストを超えると弱くなるため、長いドキュメントは分割してください。

## 仕様

| 項目              | 値                |
| --------------- | ---------------- |
| **モデル ID**      | `gpt-5.6-luna`   |
| **ベンダー**        | OpenAI           |
| **APIYI で利用可能** | 2026-07-10       |
| **知識カットオフ**     | 非公開              |
| **入力モダリティ**     | テキスト、画像          |
| **出力モダリティ**     | テキスト             |
| **コンテキストウィンドウ** | 1,000,000 tokens |
| **課金**          | 従量課金             |

## 料金

1M token あたりの USD 価格（\$/1M）。

| 入力    | キャッシュ済み入力 | 出力    |
| ----- | --------- | ----- |
| \$0.2 | \$0.02    | \$1.2 |

<Info>この表は**定価**を示しています。チャージ特典とグループ割引は**併用**できます。コンソールには実際の請求額がリアルタイムで反映されます。[料金](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

## 段階料金

このモデルは、各リクエストの token サイズに応じた段階料金です（出力価格 = 段階ごとの入力価格 × 出力倍率）:

* 0 – 272,000 tokens: \$0.2/1M input
* 272,000 tokens 超: \$0.4/1M input

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

| グループ             | 倍率   | 備考     |
| ---------------- | ---- | ------ |
| `CodexResponses` | 1×   | 定価     |
| `Codex_Reverse`  | 0.5× | 定価の50% |
| `Default`        | 1×   | 定価     |
| `SVIP`           | 1×   | 定価     |

一部のグループには追加割引が適用され、チャージボーナスと併用できます。[tokenとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況  |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張推論       | オプトイン |

## リクエスト例

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）を通じて `gpt-5.6-luna` を呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください — それ以外は公式 API と同じです。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-luna",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み込み、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、個別に失効させて利用状況を把握できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリース発表" icon="megaphone" href="/en/news/gpt-5-6-launch">
    GPT-5.6 Luna の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="互換モード" icon="book-open" href="/ja/api-capabilities/openai/compatible">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/ja/models/gpt-5-6-sol">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="GPT-5.6 Terra" icon="git-compare" href="/ja/models/gpt-5-6-terra">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金一覧" icon="table" href="/en/models">
    すべてのモデルの最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントはライブ価格 API から取得され、ビルドのたびに更新されます。</Note>
