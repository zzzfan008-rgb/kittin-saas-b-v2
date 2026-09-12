> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash

> APIYI の Gemini 3.7 Flash: 1M tokensあたり入力 $0.75 / 出力 $3.75、コンテキスト 1,000,000、最大出力 64,000、2つの課金グループで利用可能です。

次世代の Flash の主力モデルで、コーディングとエージェントが大きく向上しています: DeepSWE v1.1 は 65.3%、3段階の推論ティア、1M コンテキストです。

## 仕様

| 項目              | 値                  |
| --------------- | ------------------ |
| **モデルID**       | `gemini-3.7-flash` |
| **ベンダー**        | Google             |
| **ベンダー公開日**     | 2026-08-13         |
| **APIYIで利用可能**  | 2026-08-14         |
| **知識カットオフ**     | 2026-03            |
| **入力モダリティ**     | テキスト、画像、音声、動画、PDF  |
| **出力モダリティ**     | テキスト               |
| **コンテキストウィンドウ** | 1,000,000 tokens   |
| **最大出力**        | 64,000 tokens      |
| **課金**          | 従量課金制              |

## 料金

価格は USD 建てで、1M token あたり（\$/1M）です。

| 入力     | キャッシュ済み入力 | 出力     |
| ------ | --------- | ------ |
| \$0.75 | \$0.075   | \$3.75 |

<Info>この表は**定価**を示しています。チャージプロモーションとグループ割引は**併用できます**。コンソールには実際の課金額がリアルタイムで反映されます。[Pricing](/ja/pricing)と[Recharge promotions](/ja/faq/recharge-promotions)をご覧ください。</Info>

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

一部のグループには追加割引があり、チャージ特典と併用できます。[Tokensとグループ](/ja/faq/token-and-groups)をご覧ください。

## 対応機能

| 機能         | 対応状況  |
| ---------- | ----- |
| ストリーミング    | ✅     |
| ツール呼び出し    | ✅     |
| 構造化出力      | ✅     |
| ビジョン       | ✅     |
| プロンプトキャッシュ | ✅     |
| 拡張推論       | 標準で有効 |
| Web検索      | ✅     |
| コード実行      | ✅     |

## 例のリクエスト

以下の例では、OpenAI Chat Completions（`/v1/chat/completions`）経由で `gemini-3.7-flash` を呼び出します。base\_url は `https://api.apiyi.com/v1` を指すようにしてください — それ以外は公式 API と一致します。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.7-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>キーは環境変数から読み取り、ハードコードしないでください。本番環境では、用途ごとに個別の token を発行し、個別に取り消しや利用状況を追跡できるようにしてください。</Tip>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="リリースのお知らせ" icon="megaphone" href="/en/news/gemini-3-7-flash-launch">
    Gemini 3.7 Flash の背景、ベンチマーク、移行に関する注意事項
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

<Note>このページの仕様は`models/data/model-details.json`で手動管理されています。料金とエンドポイントは最新の料金 API から取得され、2026-08-31 11:46 (UTC+8) に更新されています。仕様の最終確認日は2026-08-17です。</Note>
