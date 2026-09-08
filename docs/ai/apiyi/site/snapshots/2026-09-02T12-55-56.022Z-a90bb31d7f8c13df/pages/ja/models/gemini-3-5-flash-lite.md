> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite

> APIYI の Gemini 3.5 Flash-Lite: 1M token あたり入力 $0.3 / 出力 $2.4999、コンテキスト 1,048,576、最大出力 65,536、2 課金グループで利用可能です。

デフォルトでは推論なしで、応答はおおむね2秒の高スループット軽量ティアです。同時実行数とバッチジョブ向けに作られています。

## 仕様

| 項目              | 値                              |
| --------------- | ------------------------------ |
| **モデル ID**      | `gemini-3.5-flash-lite`        |
| **提供元**         | Google                         |
| **APIYIで利用可能**  | 2026-07-22                     |
| **知識のカットオフ**    | 非公開                            |
| **入力モダリティ**     | Text, Image, Audio, Video, PDF |
| **出力モダリティ**     | Text                           |
| **コンテキストウィンドウ** | 1,048,576 tokens               |
| **最大出力**        | 65,536 tokens                  |
| **課金**          | 使用量ベース                         |

## 価格

1M token あたりの USD 価格（\$/1M）。

| 入力    | キャッシュ済み入力 | 出力       |
| ----- | --------- | -------- |
| \$0.3 | \$0.03    | \$2.4999 |

<Info>この表は **定価** を示しています。チャージ特典とグループ割引は **併用できます**; コンソールには実際の課金額がリアルタイムで反映されます。詳細は [価格](/ja/pricing) と [チャージ特典](/ja/faq/recharge-promotions) をご覧ください。</Info>

## エンドポイント

| エンドポイント                   | パス                                            | 対応 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 課金グループ

| グループ      | 倍率 | 備考 |
| --------- | -- | -- |
| `Default` | 1× | 定価 |
| `SVIP`    | 1× | 定価 |

一部のグループには追加割引があり、チャージ特典と併用できます。詳しくは[Tokens とグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況  |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張推論       | オプトイン |

## 例のリクエスト

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）経由で`gemini-3.5-flash-lite`を呼び出します。base\_url を `https://api.apiyi.com/v1` に設定してください — その他はすべて公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.5-flash-lite",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行して、失効と使用状況の把握を個別に行えるようにします。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/gemini-3-6-flash-lite-launch">
    Gemini 3.5 Flash-Lite の背景、ベンチマーク、移行に関する注意事項
  </Card>

  <Card title="概要" icon="book-open" href="/ja/api-capabilities/gemini-3-5-flash-lite/overview">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="ネイティブ呼び出し" icon="book-open" href="/ja/api-capabilities/gemini/native">
    パラメータ、使用方法、ベストプラクティス
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ja/models/gemini-3-6-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/ja/models/gemini-3-5-flash">
    同じファミリーに属するモデルの詳細
  </Card>

  <Card title="モデル料金ディレクトリ" icon="table" href="/en/models">
    283モデルすべての最新の料金、エンドポイント、グループ
  </Card>
</CardGroup>

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントはライブ料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は2026-07-31です。</Note>
